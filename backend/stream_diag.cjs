// Ground-truth dump of every stream's course/college/mapping data + samples.
require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('./models/Course')
const College = require('./models/College')
const CollegeCourseMapping = require('./models/CollegeCourseMapping')

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 })
  console.log('connected\n')

  console.log('=== COURSE categories (all) ===')
  const catAll = await Course.aggregate([
    { $group: { _id: '$category', total: { $sum: 1 }, withCode: { $sum: { $cond: [{ $and: [{ $ne: ['$branchCode', null] }, { $ne: ['$branchCode', ''] }] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
  ])
  for (const c of catAll) console.log(`  ${c._id || '(none)'}: total=${c.total} withBranchCode=${c.withCode}`)

  console.log('\n=== COURSE categories (archived) ===')
  const catArch = await Course.aggregate([
    { $match: { status: 'archived' } },
    { $group: { _id: '$category', n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
  for (const c of catArch) console.log(`  ${c._id}: archived=${c.n}`)

  console.log('\n=== COLLEGE stream values ===')
  const colStreams = await College.aggregate([{ $group: { _id: '$stream', n: { $sum: 1 } } }, { $sort: { _id: 1 } }])
  for (const c of colStreams) console.log(`  ${c._id || '(none)'}: ${c.n}`)

  console.log('\n=== MAPPING stream values (all / active / active+verified) ===')
  const mapStreams = await CollegeCourseMapping.aggregate([
    { $group: { _id: '$stream', all: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } }, verified: { $sum: { $cond: [{ $and: ['$isActive', '$isVerified'] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
  ])
  for (const c of mapStreams) console.log(`  ${c._id || '(none)'}: all=${c.all} active=${c.active} active+verified=${c.verified}`)

  console.log('\n=== Per-stream active course counts (non-archived) ===')
  const activeByCat = await Course.aggregate([
    { $match: { status: { $ne: 'archived' } } },
    { $group: { _id: '$category', n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
  for (const c of activeByCat) console.log(`  ${c._id}: active=${c.n}`)

  console.log('\n=== Samples ===')
  for (const cat of ['Medical', 'Arts & Science', 'Law']) {
    const cs = await Course.find({ category: cat, status: { $ne: 'archived' } })
      .select('courseName branchCode level duration isPublished isImported status')
      .limit(3)
      .lean()
    console.log(`  ${cat}:`)
    for (const c of cs) console.log(`    ${c.courseName} | code=${JSON.stringify(c.branchCode)} | ${c.level} | ${c.duration} | pub=${c.isPublished} | imported=${c.isImported} | ${c.status}`)
  }

  // College-count for a Medical course via mappings, + sample mapping fields.
  const med = await Course.findOne({ category: 'Medical', status: { $ne: 'archived' } }).lean()
  if (med) {
    const n = await CollegeCourseMapping.countDocuments({ courseId: med._id, isActive: true })
    const sampleMap = await CollegeCourseMapping.findOne({ courseId: med._id }).lean()
    console.log(`\n  medical course ${med.courseName}: activeMappings=${n}`)
    console.log('  sample mapping fields:', JSON.stringify(Object.keys(sampleMap || {})))
    console.log('  sample mapping:', JSON.stringify(sampleMap))
  }

  await mongoose.disconnect()
}
main().catch((e) => { console.error('FATAL', e); process.exit(1) })