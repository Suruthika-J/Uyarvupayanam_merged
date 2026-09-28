// Consolidate duplicate Engineering courses: archive duplicates and merge their
// mappings (including TNEA seat data) onto one canonical course per branch code.
//
// SAFE: nothing is deleted; duplicates are set to status='archived' (public
// flows already exclude archived courses). A full backup is written to
// backend/backups/ before any change.
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Course = require('./models/Course')
const CollegeCourseMapping = require('./models/CollegeCourseMapping')

const LOWERCASE_WORDS = new Set(['and', 'of', 'the', 'for', 'with', 'in', 'by', 'to'])
const KEEP_TOKEN = new Set(['B.PLAN', 'M.TECH.', 'B.TECH', 'SS'])
const KEEP_UPPER = new Set(['AI', 'ML', 'AR', 'VR', 'SS', 'IT', 'VLSI', 'CSE', 'ECE', 'EEE', 'IOT'])
function prettyBranchName(raw) {
  if (!raw) return ''
  const words = String(raw).trim().split(/\s+/)
  return words.map((w) => {
    const big = w.toUpperCase()
    if (KEEP_TOKEN.has(big) || /^\([A-Z0-9]{1,3}\)$/.test(w)) return w
    const closing = w.endsWith(')') ? ')' : ''
    const opening = w.startsWith('(') ? '(' : ''
    const inner = w.replace(/^\(/, '').replace(/\)$/, '')
    const lw = inner.toLowerCase()
    if (LOWERCASE_WORDS.has(lw)) return opening + lw + closing
    if (inner.toUpperCase() === inner && inner.length > 0) {
      const parts = inner.split('(').map((seg) =>
        KEEP_UPPER.has(seg) ? seg : seg[0] + seg.slice(1).toLowerCase()
      )
      return opening + parts.join('(') + closing
    }
    return w
  }).join(' ')
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 })
  console.log('connected')

  // 1) Parse the PDF to get the 116 branch codes + official names.
  const { parseSeatMatrixPdf } = await import('./utils/seatMatrixParser.js')
  const pdfBuf = fs.readFileSync('C:\\Users\\Priya Dharshini\\Downloads\\GENERAL_ACADEMIC_SEAT_MATRIX_BEFORE_SPECIAL_RESERVATION_COUNSELLING_2026.pdf')
  const { rows } = await parseSeatMatrixPdf(pdfBuf)
  const pdfByCode = new Map()
  for (const r of rows) {
    const bc = String(r.branchCode || '').trim().toUpperCase()
    if (!pdfByCode.has(bc)) pdfByCode.set(bc, r.branchName)
  }
  console.log('PDF branch codes:', pdfByCode.size)

  // 2) Load engineering courses with a branch code (non-archived) + all their mappings.
  const courses = await Course.find({
    category: 'Engineering',
    branchCode: { $ne: null, $ne: '' },
  }).sort({ _id: 1 }).lean()

  const groups = new Map()
  for (const c of courses) {
    const bc = String(c.branchCode).trim().toUpperCase()
    if (!pdfByCode.has(bc)) continue // only consolidate codes present in the seat matrix
    if (!groups.has(bc)) groups.set(bc, [])
    groups.get(bc).push(c)
  }
  console.log('groups (PDF codes with course docs):', groups.size)

  const allCourseIds = [...groups.values()].flat().map((c) => c._id)
  const mappings = await CollegeCourseMapping.find({ courseId: { $in: allCourseIds } }).lean()
  const mapByCourse = new Map()
  for (const m of mappings) {
    const k = m.courseId.toString()
    if (!mapByCourse.has(k)) mapByCourse.set(k, [])
    mapByCourse.get(k).push(m)
  }

  // 3) Backup everything we may touch.
  const backupDir = path.join(__dirname, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `tnea_course_consolidation_${Date.now()}.json`)
  fs.writeFileSync(backupPath, JSON.stringify({ courses, mappings }, null, 2))
  console.log('backup written:', backupPath)

  // 4) Pick a canonical per group and plan archive + mapping merges.
  const report = { groups: [] }
  for (const [bc, members] of groups) {
    const withMaps = members.map((c) => ({ c, maps: (mapByCourse.get(c._id.toString()) || []) }))
    const curated = withMaps.filter(({ c, maps }) => /^B\.(E|Tech)\./i.test(c.courseName) && maps.length > 0)
    const pick = (arr) => arr.reduce((a, b) => (b.maps.length > a.maps.length ? b : a))
    // Canonical: a curated (B.E./B.Tech.) doc with mappings, else the doc with most mappings.
    let canonical = curated.length ? pick(curated) : (withMaps.length ? pick(withMaps) : null)
    if (!canonical) continue
    const canonicalId = canonical.c._id

    // Prefer the PDF's official (pretty) name when the canonical name is not a clean curated name.
    const pdfName = pdfByCode.get(bc)
    let newName = null
    if (!/^B\.(E|Tech)\./i.test(canonical.c.courseName)) {
      newName = prettyBranchName(pdfName) || canonical.c.courseName
    }

    // Merge mapping lists: per collegeId keep the richest mapping (most seats; ties -> verified).
    const byCollege = new Map()
    for (const { c, maps } of withMaps) {
      for (const m of maps) {
        const cid = m.collegeId ? m.collegeId.toString() : null
        if (!cid) continue
        const key = cid
        const cur = byCollege.get(key)
        const seats = (m) => (m.seatsTotal || 0) + (m.seatsOC || 0) + (m.seatsBC || 0)
        if (!cur || seats(m) > seats(cur) || (seats(m) === seats(cur) && m.isVerified && !cur.isVerified)) {
          byCollege.set(key, { ...m, _owner: c._id, _ownerName: c.courseName })
        }
      }
    }
    const kept = [...byCollege.values()]
    const keepIds = new Set(kept.map((m) => m._id.toString()))

    // Mappings to delete: duplicates for the same collegeId (all non-best).
    const toDelete = []
    for (const { maps } of withMaps) {
      for (const m of maps) {
        if (!keepIds.has(m._id.toString())) toDelete.push(m._id)
      }
    }
    // Mappings to re-point to canonical (best but owned by a non-canonical course).
    const toRepoint = kept.filter((m) => m._owner.toString() !== canonicalId.toString())
    const nonCanonical = members.filter((c) => c._id.toString() !== canonicalId.toString())

    report.groups.push({
      code: bc,
      docCount: members.length,
      canonical: { id: canonicalId.toString(), name: canonical.c.courseName, nameWillChangeTo: newName },
      archivedDocs: nonCanonical.length,
      mappedColleges: kept.length,
      mappingsDeleted: toDelete.length,
      mappingsRepointed: toRepoint.length,
    })

    // 5) Apply.
    if (toDelete.length) {
      for (let i = 0; i < toDelete.length; i += 2000) {
        await CollegeCourseMapping.deleteMany({ _id: { $in: toDelete.slice(i, i + 2000) } })
      }
    }
    if (toRepoint.length) {
      const ops = toRepoint.map((m) => ({
        updateOne: { filter: { _id: m._id }, update: { $set: { courseId: canonicalId } } },
      }))
      await CollegeCourseMapping.bulkWrite(ops, { ordered: false })
    }
    if (nonCanonical.length) {
      await Course.updateMany(
        { _id: { $in: nonCanonical.map((c) => c._id) }, status: { $ne: 'archived' } },
        { $set: { status: 'archived', isPublished: false } }
      )
    }
    if (newName && newName !== canonical.c.courseName) {
      await Course.updateOne({ _id: canonicalId }, { $set: { courseName: newName, verified: true } })
    }
  }

  console.log('\n=== CONSOLIDATION REPORT ===')
  console.log(JSON.stringify(report.groups, null, 1))
  console.log('groups:', report.groups.length)

  await mongoose.disconnect()
}
main().catch((e) => { console.error('FATAL', e); process.exit(1) })