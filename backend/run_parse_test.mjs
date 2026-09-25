import fs from 'fs'
const { parseSeatMatrixPdf, BRANCH_HEAD_RE } = await import('./utils/seatMatrixParser.js')

const PDF_PATH = 'C:\\Users\\Priya Dharshini\\Downloads\\GENERAL_ACADEMIC_SEAT_MATRIX_BEFORE_SPECIAL_RESERVATION_COUNSELLING_2026.pdf'
const buf = fs.readFileSync(PDF_PATH)
const t0 = Date.now()
const { rows, skipped, stats } = await parseSeatMatrixPdf(buf)
console.log(`parsed in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
console.log('stats:', JSON.stringify(stats))
console.log('rows:', rows.length, ' skipped:', skipped.length)

// ── summaries ──
const codes = new Set(rows.map(r => r.collegeCode))
const branches = new Set(rows.map(r => r.branchCode))
const names = new Set(rows.map(r => r.branchName))
console.log('distinct colleges:', codes.size, ' distinct branch codes:', branches.size, ' distinct branch names:', names.size)

// ── anomalies ──
const emptyName = rows.filter(r => !r.collegeName)
const emptyCode = rows.filter(r => !r.collegeCode)
const emptyBranch = rows.filter(r => !r.branchName)
const mismatch = rows.filter(r => r.seatTotalParsed && r.seats.total !== r.seatSum)
console.log('rows with empty collegeName:', emptyName.length)
console.log('rows with empty collegeCode:', emptyCode.length)
console.log('rows with empty branchName:', emptyBranch.length)
console.log('rows where TOTAL != sum:', mismatch.length)
if (mismatch.length) {
  for (const m of mismatch.slice(0, 10)) {
    console.log('  MISMATCH', m.page, m.collegeCode, m.branchCode, JSON.stringify(m.seats), 'sum=', m.seatSum)
  }
}

// ── spot check first rows of page 1-2 ──
const page1 = rows.filter(r => r.page === 1)
for (const r of page1.slice(0, 3)) {
  console.log('P1 row:', JSON.stringify({ code: r.collegeCode, name: r.collegeName, bc: r.branchCode, bn: r.branchName, seats: r.seats }))
}

// ── samples of multi-line colleges (long names) ──
const smp = rows.filter(r => r.collegeName.includes('Ketti') || r.collegeName.includes('Koduvilarpatti') || r.collegeName.includes('Latha Mathavan'))
for (const r of smp.slice(0, 5)) {
  console.log('SMP:', JSON.stringify({ code: r.collegeCode, name: r.collegeName, bc: r.branchCode, bn: r.branchName, seats: r.seats }))
}

// ── check skipped breakdown ──
const byReason = {}
for (const s of skipped) byReason[s.reason] = (byReason[s.reason] || 0) + 1
console.log('skipped by reason:', JSON.stringify(byReason))
for (const s of skipped.slice(0, 12)) console.log('  SKIP page', s.page, s.reason, s.collegeCode, s.branchCode, s.branchName)

// ── write a sample of row names for eyeballing ──
console.log('\n--- 25 sample college names ---')
for (const n of [...new Set(rows.map(r => r.collegeName))].slice(0, 25)) console.log('  ', n)
console.log('\n--- 30 sample branch names ---')
for (const n of [...names].slice(0, 30)) console.log('  ', n)

// ── garbage detection ──
const badBranch = rows.filter(r => {
  const n = r.branchName
  const open = (n.match(/\(/g) || []).length, close = (n.match(/\)/g) || []).length
  if (open !== close) return true
  if ((n.match(/\(SS\)/g) || []).length > 1) return true
  if (!BRANCH_HEAD_RE.test(n)) return true
  if (/\) [^(]/.test(n)) return true // close-paren followed by a NON-paren (e.g. "TECHNOLOGY) COMPUTER")
  return false
})
console.log('\ngarbled branch names:', badBranch.length)
badBranch.forEach(r => console.log(' ', 'p' + r.page, r.collegeCode, r.branchCode, JSON.stringify(r.branchName)))

// per-college-code name variants
const byCode = {}
for (const r of rows) (byCode[r.collegeCode] ||= new Set()).add(r.collegeName)
const multi = Object.entries(byCode).filter(([, s]) => s.size > 1)
console.log('\ncolleges with multiple name variants:', multi.length)
multi.slice(0, 15).forEach(([code, s]) => console.log(' ', code, '->', [...s].map(x => JSON.stringify(x.slice(0, 70))).join(' | ')))