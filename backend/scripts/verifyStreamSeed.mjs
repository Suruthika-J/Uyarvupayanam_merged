import { readFileSync } from 'node:fs'
import { STREAM_THEMES, STREAM_CATEGORIES, DIPLOMA_SUB_CATEGORIES } from '../../frontend/src/constants/streamThemes.js'

const hsc = JSON.parse(readFileSync('./backend/data/streamsSeedData.json', 'utf8'))
const poly = JSON.parse(readFileSync('./backend/data/polytechnicSeedData.json', 'utf8'))
const all = [...hsc, ...poly]

const catKeys = STREAM_CATEGORIES.filter((c) => c.key !== 'all').map((c) => c.key)
const subKeys = DIPLOMA_SUB_CATEGORIES.map((c) => c.key).filter((k) => k !== 'all-diploma')

let failures = 0
const fail = (msg) => { failures++; console.error('  ✗ ' + msg) }

console.log(`HSC: ${hsc.length} | Polytechnic: ${poly.length} | Total: ${all.length}`)
if (all.length !== 166) fail(`expected 166 total, got ${all.length}`)

// category validity
for (const s of all) {
  if (!catKeys.includes(s.category)) fail(`bad category '${s.category}' on ${s.code}`)
}

// subCategory rules
for (const s of all) {
  if (s.category === 'diploma' && !subKeys.includes(s.subCategory)) {
    fail(`diploma ${s.code} missing/ invalid subCategory '${s.subCategory}'`)
  }
  if (s.category !== 'diploma' && s.subCategory != null && s.subCategory !== '') {
    fail(`${s.category} ${s.code} must have null subCategory, got '${s.subCategory}'`)
  }
}

// unique codes
const codes = new Map()
for (const s of all) codes.set(s.code, (codes.get(s.code) || 0) + 1)
for (const [c, n] of codes) if (n > 1) fail(`duplicate code ${c} (${n})`)

// unique (category, subCategory, order)
const orders = new Set()
for (const s of all) {
  const key = `${s.category}|${s.subCategory || ''}|${s.order}`
  if (orders.has(key)) fail(`duplicate order key ${key}`)
  orders.add(key)
}

// theme keys all registered
const missingThemes = [...new Set(all.map((s) => s.backgroundTheme))].filter((t) => !STREAM_THEMES[t])
if (missingThemes.length) fail(`unregistered themes: ${missingThemes.join(', ')}`)

// required fields
for (const s of all) {
  for (const f of ['code', 'groupName', 'bestFor', 'backgroundTheme', 'category']) {
    if (!s[f]) fail(`${s.code || '?'} missing field ${f}`)
  }
  if (!Array.isArray(s.subjects) || !s.subjects.length) fail(`${s.code} needs subjects`)
  if (!Array.isArray(s.progression) || !s.progression.length) fail(`${s.code} needs progression`)
}

// per-category counts
const byCat = {}
for (const s of all) byCat[s.category] = (byCat[s.category] || 0) + 1
console.log('Breakdown:', JSON.stringify(byCat))
console.log('Theme keys used:', [...new Set(all.map((s) => s.backgroundTheme))].sort().join(', '))

if (failures) { console.error(`\n${failures} integrity failure(s)`); process.exit(1) }
console.log('\n✓ All integrity checks passed (166 records).')