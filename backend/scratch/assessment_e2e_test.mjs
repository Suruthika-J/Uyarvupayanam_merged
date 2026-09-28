// End-to-end test for the student onboarding assessment pipeline:
//   dynamic per-skill question generation → submit/scoring → assessment_results
//   → admin results view → retake guard → explicit retake reset.
//
// The production DB already has a populated Class 5 question bank across the
// standard skills, so this suite seeds questions under unique "E2E *" skill tags
// that cannot collide, and verifies the generator caps per-skill counts, hides
// correct answers, randomizes, and falls back to whatever is available. For the
// scoring assertions the test reads the true correctAnswer straight from Mongo
// (it acts as the server-side verifier), so full marks is deterministic.
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import OnboardingQuestion from '../models/OnboardingQuestion.js'
import OnboardingResponse from '../models/OnboardingResponse.js'
import AssessmentResult from '../models/AssessmentResult.js'

dotenv.config()

const BASE = 'http://localhost:5000/api'
const EMAIL = `assess.e2e.${Date.now()}@uyarvupayanam.local`
const ADMIN_EMAIL = `assess.admin.${Date.now()}@uyarvupayanam.local`

let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
  if (!cond) failures++
}

async function get(path, token) {
  let res
  try {
    res = await fetch(BASE + path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch (e) {
    return { status: 0, data: null, err: e.message }
  }
  let data = null
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

async function post(path, body) {
  let res
  try {
    res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    return { status: 0, data: null, err: e.message }
  }
  let data = null
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

const hash = async (v) => bcrypt.hash(v, await bcrypt.genSalt(10))

// ── wait for backend ──
console.log('Waiting for backend...')
for (let i = 0; i < 45; i++) {
  const r = await post('/auth/otp/send', { email: 'nobody@example.com', purpose: 'login' })
  if (r.status > 0) break
  await new Promise((r2) => setTimeout(r2, 2000))
}

// ── connect ──
await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })

// ── fixtures ──
const student = await User.create({
  name: 'Assess E2E Student',
  email: EMAIL,
  password: await hash('NewPass123'),
  role: 'student',
  userType: 'school_student',
  classLevel: 'Class 5',
})
const sid = String(student._id)

// Unique skill tags (no collision with the real bank) + question counts.
// 'E2E Numeracy' (2) is below PER_SKILL_COUNT to exercise the fallback path.
const SKILLS = [
  ['E2E Reasoning', 4],
  ['E2E Creative', 5],
  ['E2E Numeracy', 2],
]
const created = []
for (const [skill, count] of SKILLS) {
  for (let i = 1; i <= count; i++) {
    const doc = await OnboardingQuestion.create({
      grade: 'Class 5',
      questionText: `${skill} question ${i}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      skillTag: skill,
      difficultyLevel: 'Easy',
      recommendationCategory: 'General',
    })
    created.push(doc)
  }
}

console.log('\n── Test A: dynamic question generation ──')
let r = await get(`/onboarding/assessment/questions?studentId=${sid}`)
check('generate → 200 success', r.status === 200 && r.data?.success === true, `status=${r.status}`)
check('grade resolved to Class 5', r.data?.grade === 'Class 5', r.data?.grade)
const qps = r.data?.questionsPerSkill || {}
check(
  'per-skill caps applied to seeded E2E skills (3, 3, 2 fallback)',
  qps['E2E Reasoning'] === 3 && qps['E2E Creative'] === 3 && qps['E2E Numeracy'] === 2,
  JSON.stringify(qps)
)
const qTotal = Object.values(qps).reduce((a, b) => a + b, 0)
check('questionsPerSkill sums to totalQuestions', qTotal === r.data?.totalQuestions, `${qTotal} vs ${r.data?.totalQuestions}`)
check('real bank questions also included (pool merged)', r.data?.totalQuestions > 8, `total=${r.data?.totalQuestions}`)
check(
  'payload sanitized — no correctAnswer/explanation',
  !r.data?.questions?.some((q) => 'correctAnswer' in q || 'explanation' in q)
)
check(
  'every question has text, options and skillTag',
  r.data?.questions?.every((q) => q.questionText && Array.isArray(q.options) && q.options.length >= 2 && q.skillTag)
)
const poolIds = new Set(
  (await OnboardingQuestion.find({ grade: 'Class 5' }).select('_id').lean()).map((q) => String(q._id))
)
check('all selected questions belong to the student grade pool', r.data?.questions?.every((q) => poolIds.has(String(q._id))))
const orders = []
const seenTexts = new Set()
for (let i = 0; i < 5; i++) {
  const rr = await get(`/onboarding/assessment/questions?studentId=${sid}`)
  if (rr.data?.questions) {
    orders.push(rr.data.questions.map((q) => String(q._id)).join('|'))
    rr.data.questions.forEach((q) => seenTexts.add(q.questionText))
  }
}
check('selection randomized across attempts (orders differ)', new Set(orders).size > 1, `${new Set(orders).size} distinct orders`)
// Each attempt samples 3 of the 4 seeded 'E2E Reasoning' questions at random,
// so assert across the union of 5 attempts instead of a single draw.
check(
  'seeded E2E questions appear across attempts',
  seenTexts.has('E2E Reasoning question 1') && seenTexts.has('E2E Numeracy question 2')
)

r = await get(`/onboarding/assessment/questions?studentId=000000000000000000000000`)
check('unknown studentId → 404', r.status === 404, r.status)

console.log('\n── Test B: submit + scoring + assessment_results ──')
const gen = (await get(`/onboarding/assessment/questions?studentId=${sid}`)).data
const qids = gen.questions.map((q) => q._id)
const docs = await OnboardingQuestion.find({ _id: { $in: qids } }).lean()
const correctByQid = new Map(docs.map((d) => [String(d._id), d.correctAnswer]))
const answers = gen.questions.map((q) => ({ questionId: q._id, selectedAnswer: correctByQid.get(String(q._id)) }))

r = await post('/onboarding/submit', {
  studentId: sid,
  grade: 'Class 5',
  answers,
  interests: ['Software / IT'],
  careerInterest: 'Software / IT',
  marksPercentage: 85,
  board: 'State Board',
})
check('submit → 200 success', r.status === 200 && r.data?.success === true, `status=${r.status}`)
check('overall score 100% (all correct)', r.data?.response?.scorePercentage === 100, r.data?.response?.scorePercentage)
const sk = r.data?.response?.skillWiseScore || []
const distinctSkills = sk.length
check('per-skill breakdown covers every skill in the set', distinctSkills === new Set(gen.questions.map((q) => q.skillTag)).size, `skills=${distinctSkills}`)
const mySkill = sk.find((s) => s.skillTag === 'E2E Reasoning')
check('E2E Reasoning scored 3/3 100%', mySkill && mySkill.score === 3 && mySkill.total === 3 && mySkill.percentage === 100, JSON.stringify(mySkill))

const rowCount = await AssessmentResult.countDocuments({ studentId: sid })
check('assessment_results has one row per skill', rowCount === distinctSkills, `count=${rowCount}`)
const e2eRow = await AssessmentResult.findOne({ studentId: sid, skill: 'E2E Reasoning' })
check('E2E Reasoning row 3/3 100%', e2eRow && e2eRow.score === 3 && e2eRow.totalQuestions === 3 && e2eRow.percentage === 100)
const recheck = await User.findById(sid).lean()
check('user flagged recommendationGenerated', recheck.recommendationGenerated === true && recheck.onboardingCompleted === true)

console.log('\n── Test C: retake guard ──')
r = await get(`/onboarding/assessment/questions?studentId=${sid}`)
check('regenerate blocked after completion (alreadyCompleted)', r.status === 200 && r.data?.alreadyCompleted === true, JSON.stringify(r.data))

console.log('\n── Test D: admin results view (via verifyAdmin middleware) ──')
const admin = await Admin.create({ name: 'E2E Admin', email: ADMIN_EMAIL, password: await hash('AdminPass123'), isActive: true })
const adminToken = jwt.sign({ id: String(admin._id) }, process.env.JWT_SECRET)

r = await get('/onboarding/admin/results', null)
check('admin results require token (401)', r.status === 401, r.status)

r = await get('/onboarding/admin/results?search=Assess%20E2E', adminToken)
check('admin results listed', r.status === 200 && r.data?.success && r.data?.attempts?.length === 1, `${r.status} count=${r.data?.attempts?.length}`)
const attempt = r.data?.attempts?.[0]
check(
  'attempt has student, all skills, 100% overall',
  attempt?.studentName === 'Assess E2E Student' &&
    attempt?.skills?.length === distinctSkills &&
    attempt?.percentage === 100 &&
    attempt?.totalScore === attempt?.totalQuestions,
  JSON.stringify({ skills: attempt?.skills?.length, pct: attempt?.percentage })
)
check('skillOptions derived from rows includes E2E skills', ['E2E Reasoning', 'E2E Creative', 'E2E Numeracy'].every((s) => (r.data?.skillOptions || []).includes(s)))

r = await get('/onboarding/admin/results?skill=E2E Reasoning', adminToken)
check('filtered by skill → only matching rows', r.data?.attempts?.[0]?.skills?.every((s) => s.skill === 'E2E Reasoning') === true, JSON.stringify(r.data?.attempts?.[0]?.skills))
r = await get('/onboarding/admin/results?grade=Class 8', adminToken)
check('filtered by grade → empty for Class 8', r.data?.attempts?.length === 0, `count=${r.data?.attempts?.length}`)

console.log('\n── Test E: explicit retake resets everything ──')
r = await post(`/onboarding/retake/${sid}`, {})
check('retake accepted', r.status === 200 && r.data?.success === true, r.status)
check('retake clears assessment_results', (await AssessmentResult.countDocuments({ studentId: sid })) === 0)
check('retake clears prior response', (await OnboardingResponse.countDocuments({ userId: sid })) === 0)
r = await get(`/onboarding/assessment/questions?studentId=${sid}`)
check('generate works again after explicit retake', r.status === 200 && r.data?.success === true && r.data?.alreadyCompleted !== true, JSON.stringify(r.data?.alreadyCompleted))

// ── cleanup ──
await AssessmentResult.deleteMany({ studentId: sid })
await OnboardingResponse.deleteMany({ userId: sid })
await OnboardingQuestion.deleteMany({ _id: { $in: created.map((c) => c._id) } })
await User.deleteMany({ _id: sid })
await Admin.deleteMany({ _id: admin._id })
await mongoose.disconnect()

console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' TEST(S) FAILED'}`)
process.exit(failures === 0 ? 0 : 1)