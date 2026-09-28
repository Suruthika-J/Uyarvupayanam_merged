// End-to-end test for the live AI question-generation flow:
//   POST /onboarding/generate-questions (LLM w/ static-bank fallback + session
//   resume) → session-scored submit → assessment_results + engine summary →
//   GET /onboarding/result/:studentId → admin CRUD for recommendation_rules /
//   guideline_rules → alreadyCompleted guard → retake reset.
//
// No LLM key is configured in this environment, so generation must gracefully
// fall back to the static Class 5 bank (the "onboarding never breaks" path).
// The test reads true correctAnswers from generated_assessments (server-side
// verifier) to build deterministic answers, and seeds unique "E2E *" rule rows.
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import GeneratedAssessment from '../models/GeneratedAssessment.js'
import AssessmentResult from '../models/AssessmentResult.js'
import AssessmentSummary from '../models/AssessmentSummary.js'
import Recommendation from '../models/Recommendation.js'
import RecommendationRule from '../models/RecommendationRule.js'
import GuidelineRule from '../models/GuidelineRule.js'
import { resolveProvider } from '../utils/aiQuestionGenerator.js'

dotenv.config()

const BASE = 'http://localhost:5000/api'
const STUDENT_EMAIL = `ai.e2e.${Date.now()}@uyarvupayanam.local`
const STUDENT2_EMAIL = `ai.e2e.2.${Date.now()}@uyarvupayanam.local`
const ADMIN_EMAIL = `ai.admin.${Date.now()}@uyarvupayanam.local`
const SKILLS = ['Communication', 'Computer Basics', 'Creativity', 'Zeta Unmapped Skill']

let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
  if (!cond) failures++
}

async function api(path, opts = {}) {
  const { method = 'GET', token, body } = opts
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    return { status: 0, data: null, err: e.message }
  }
  let data = null
  try { data = await res.json() } catch (_) { data = null }
  return { status: res.status, data }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam')

  // ── fixtures ──
  const hash = await bcrypt.hash('secret123', 10)
  const s1 = await User.create({ name: 'AI E2E Student', email: STUDENT_EMAIL, password: hash, classLevel: 'Class 5' })
  const s2 = await User.create({ name: 'AI E2E Student 2', email: STUDENT2_EMAIL, password: hash, classLevel: 'Class 5' })
  const admin = await Admin.create({ name: 'AI E2E Admin', email: ADMIN_EMAIL, password: hash })
  const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET)
  const S1 = String(s1._id), S2 = String(s2._id)

  // ══════════════════════════════════════════════════════════════════════
  // 1. GENERATION (fresh session, LLM absent → bank fallback)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 1. Generate questions ──')
  const g1 = await api('/onboarding/generate-questions', {
    method: 'POST', body: { studentId: S1, grade: 'Class 5', skills: SKILLS },
  })
  check('generate succeeds', g1.status === 200 && g1.data?.success === true, `HTTP ${g1.status}`)
  const sessionId = g1.data?.sessionId
  check('returns a sessionId', Boolean(sessionId))
  check('sanitized: no correctAnswer anywhere', !JSON.stringify(g1.data?.questions || []).includes('correctAnswer') && !JSON.stringify(g1.data?.questions || []).includes('correct_answer'))
  check('returns questions', Array.isArray(g1.data?.questions) && g1.data.questions.length > 0, `n=${g1.data?.questions?.length}`)
  check('no answer/explanation field on client questions', (g1.data?.questions || []).every((q) => !('correctAnswer' in q) && !('explanation' in q)), String((g1.data?.questions || []).length))
  // Bank-fallback mode: unknown skills have no bank questions → skipped.
  // Live-AI mode: the LLM happily writes questions for any skill name.
  const llmActive = Boolean(resolveProvider())
  if (!llmActive) {
    check('unmapped skill yields 0 questions (skipped, fallback mode)', (g1.data?.questionsPerSkill?.['Zeta Unmapped Skill'] || 0) === 0)
  } else {
    check('AI generates for any requested skill (live mode)', (g1.data?.questionsPerSkill?.['Zeta Unmapped Skill'] || 0) > 0)
  }
  const perSkillOk = ['Communication', 'Computer Basics', 'Creativity']
    .every(k => (g1.data?.questionsPerSkill?.[k] || 0) <= 3 && (g1.data?.questionsPerSkill?.[k] || 0) > 0)
  check('per-skill count capped at 3 and > 0', perSkillOk, JSON.stringify(g1.data?.questionsPerSkill))
  const allExpectedSkills = g1.data?.questions?.every(q => SKILLS.includes(q.skill))
  check('all questions belong to requested skills', allExpectedSkills === true)

  // source reflects bank fallback when no LLM key is configured
  const stored = await GeneratedAssessment.find({ sessionId }).lean()
  check('rows persisted to generated_assessments BEFORE response', stored.length === g1.data?.totalQuestions, `${stored.length}/${g1.data?.totalQuestions}`)
  check('rows carry correctAnswer server-side', stored.every(r => typeof r.correctAnswer === 'string' && r.correctAnswer.length > 0))
  check('client question ids are real ObjectIds', g1.data?.questions?.every(q => /^[a-f0-9]{24}$/.test(String(q._id))))

  // ══════════════════════════════════════════════════════════════════════
  // 2. RESUME (same session → same set, no regeneration)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 2. Session resume (page-refresh safe) ──')
  const g2 = await api('/onboarding/generate-questions', {
    method: 'POST', body: { studentId: S1, grade: 'Class 5', skills: SKILLS, sessionId },
  })
  check('resume returns source=resume', g2.data?.source === 'resume', g2.data?.source)
  check('resume returns same question set', g2.data?.questions?.length === g1.data?.questions?.length &&
    JSON.stringify(g2.data?.questions?.map(q => String(q._id)).sort()) === JSON.stringify(g1.data?.questions?.map(q => String(q._id)).sort()))

  // ══════════════════════════════════════════════════════════════════════
  // 3. SUBMIT with sessionId — all-correct (student 1)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 3. Session submit (100%) ──')
  // Build answers from the CLIENT payload ids (exactly what the frontend sends)
  const correctByQid = new Map(stored.map(r => [String(r._id), r.correctAnswer]))
  const allCorrectAnswers = g1.data.questions.map(q => ({ questionId: String(q._id), selectedAnswer: correctByQid.get(String(q._id)) }))
  allCorrectAnswers.push({ questionId: new mongoose.Types.ObjectId().toString(), selectedAnswer: 'junk' }) // unknown id must be ignored
  const sub1 = await api('/onboarding/submit', { method: 'POST', body: { studentId: S1, grade: 'Class 5', sessionId, answers: allCorrectAnswers } })
  check('submit succeeds', sub1.status === 200 && sub1.data?.success === true, `HTTP ${sub1.status}`)
  check('score = 100%', sub1.data?.response?.scorePercentage === 100, sub1.data?.response?.scorePercentage)
  const skillRows = await AssessmentResult.find({ studentId: s1._id }).lean()
  const expectedSkillCount = llmActive ? 4 : 3 // 'Zeta Unmapped Skill' only yields questions in live-AI mode
  check('assessment_results has one row per assessed skill', skillRows.length === expectedSkillCount, `rows=${skillRows.length}`)
  check('per-skill rows all 100%', skillRows.every(r => r.percentage === 100 && r.score === r.totalQuestions))
  const summary = await AssessmentSummary.findOne({ studentId: s1._id }).sort({ createdAt: -1 }).lean()
  check('engine summary persisted', Boolean(summary))
  check('summary overallLevel=Strong', summary?.overallLevel === 'Strong', summary?.overallLevel)
  check('summary payload shape complete', ['overallScore','skillBreakdown','strongSkills','needsImprovement','recommendedSkillsToFocus','suggestedActivities','recommendedExams','quickGuideline'].every(k => k in summary))
  check('summary suggestedActivities non-empty (seeded rules)', summary?.suggestedActivities?.length > 0, `n=${summary?.suggestedActivities?.length}`)
  check('summary quickGuideline non-empty', Boolean(summary?.quickGuideline))
  const legacyRec = await Recommendation.findOne({ userId: s1._id }).sort({ createdAt: -1 }).lean()
  check('legacy Recommendation written', Boolean(legacyRec))
  check('legacy result screen fields populated', legacyRec && legacyRec.strongSkills.length === expectedSkillCount && legacyRec.weakSkills.length === 0 &&
    legacyRec.suggestedActivities.length > 0 && legacyRec.learningGuidelines === summary.quickGuideline)

  // ══════════════════════════════════════════════════════════════════════
  // 4. RESULT endpoint
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 4. GET /onboarding/result/:studentId ──')
  const res1 = await api(`/onboarding/result/${S1}`)
  check('result endpoint succeeds', res1.status === 200 && res1.data?.success === true)
  check('result payload has engine shape', ['overallScore','overallLevel','skillBreakdown','strongSkills','needsImprovement','recommendedSkillsToFocus','suggestedActivities','recommendedExams','quickGuideline'].every(k => k in res1.data?.result))
  check('result overallLevel=Strong', res1.data?.result?.overallLevel === 'Strong')
  check('result quickGuideline matches seeded Strong row', res1.data?.result?.quickGuideline === (await GuidelineRule.findOne({ overallLevel: 'Strong' }).lean())?.guidelineText)
  const u1 = await User.findById(s1._id).lean()
  check('onboardingCompleted + recommendationGenerated set', u1?.onboardingCompleted === true && u1?.recommendationGenerated === true)

  // alreadyCompleted guard now blocks regeneration
  const g3 = await api('/onboarding/generate-questions', { method: 'POST', body: { studentId: S1, grade: 'Class 5', skills: SKILLS } })
  check('generate-questions blocked when completed (alreadyCompleted)', g3.data?.alreadyCompleted === true)

  // ══════════════════════════════════════════════════════════════════════
  // 5. Mixed / partial scoring (student 2) + cross-student session guard
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 5. Partial scoring + session ownership ──')
  const g4 = await api('/onboarding/generate-questions', { method: 'POST', body: { studentId: S2, grade: 'Class 5', skills: ['Communication', 'Computer Basics'] } })
  const sid2 = g4.data?.sessionId
  const stored2 = await GeneratedAssessment.find({ sessionId: sid2 }).lean()
  const correctByQid2 = new Map(stored2.map(r => [String(r._id), r.correctAnswer]))
  const answers2 = g4.data.questions.map(q => ({
    questionId: String(q._id),
    selectedAnswer: q.skill === 'Communication' ? 'wrong-unlisted-option' : correctByQid2.get(String(q._id)),
  }))
  const sub2 = await api('/onboarding/submit', { method: 'POST', body: { studentId: S2, grade: 'Class 5', sessionId: sid2, answers: answers2 } })
  check('student2 submit succeeds', sub2.status === 200 && sub2.data?.success === true)
  const sk2 = sub2.data?.response?.skillWiseScore || []
  const comm = sk2.find(s => s.skillTag === 'Communication')
  const comp = sk2.find(s => s.skillTag === 'Computer Basics')
  check('Communication scored 0% → Needs Improvement', comm?.percentage === 0 && comm?.status === 'Improvement Needed')
  check('Computer Basics scored 100% → Strong', comp?.percentage === 100 && comp?.status === 'Strong Skill')
  const sum2 = await AssessmentSummary.findOne({ studentId: s2._id }).sort({ createdAt: -1 }).lean()
  check('student2 strongSkills/needsImprovement bucketed', sum2?.strongSkills?.includes('Computer Basics') && sum2?.needsImprovement?.includes('Communication'))
  check('student2 recommendedSkillsToFocus includes weak skill', sum2?.recommendedSkillsToFocus?.includes('Communication'))

  // wrong student tries to submit another's session → rejected
  const theft = await api('/onboarding/submit', { method: 'POST', body: { studentId: S1, grade: 'Class 5', sessionId: sid2, answers: [{ questionId: 'x', selectedAnswer: 'y' }] } })
  check('cross-student session submit rejected', theft.status === 400, `HTTP ${theft.status}`)

  // ══════════════════════════════════════════════════════════════════════
  // 6. Admin CRUD — recommendation_rules + guideline_rules
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 6. Admin CRUD for rule tables ──')
  const noAuth = await api('/onboarding/admin/rules')
  check('admin rules require auth', noAuth.status === 401 || noAuth.status === 403, `HTTP ${noAuth.status}`)
  const listRules = await api('/onboarding/admin/rules?grade=All&skill=Communication', { token: adminToken })
  check('list rules by grade+skill filter', listRules.status === 200 && listRules.data?.rules?.every(r => r.grade === 'All' && r.skill === 'Communication'), `n=${listRules.data?.count}`)
  const created = await api('/onboarding/admin/rules', { method: 'POST', token: adminToken, body: { grade: 'All', skill: 'E2E Ruling', skillLevel: 'Needs Improvement', recommendedActivity: 'E2E do the thing', recommendedExam: 'E2E Exam' } })
  check('create rule', created.status === 201 && created.data?.rule?._id, `HTTP ${created.status}`)
  const ruleId = created.data?.rule?._id
  const updated = await api(`/onboarding/admin/rules/${ruleId}`, { method: 'PUT', token: adminToken, body: { grade: 'All', skill: 'E2E Ruling', skillLevel: 'Average', recommendedActivity: 'E2E do it better', recommendedExam: 'E2E Exam' } })
  check('update rule', updated.status === 200 && updated.data?.rule?.skillLevel === 'Average')
  const deleted = await api(`/onboarding/admin/rules/${ruleId}`, { method: 'DELETE', token: adminToken })
  check('delete rule', deleted.status === 200)

  const gl = await api('/onboarding/admin/guidelines', { token: adminToken })
  check('list guidelines (seeded 4)', gl.status === 200 && gl.data?.count === 4, `n=${gl.data?.count}`)
  const dup = await api('/onboarding/admin/guidelines', { method: 'POST', token: adminToken, body: { overallLevel: 'Strong', guidelineText: 'duplicate should fail' } })
  check('duplicate guideline level rejected', dup.status === 400, `HTTP ${dup.status}`)
  const gCreated = await api('/onboarding/admin/guidelines', { method: 'POST', token: adminToken, body: { overallLevel: 'E2E Level', guidelineText: 'E2E guideline text' } })
  check('create guideline', gCreated.status === 201 && gCreated.data?.guideline?._id)
  const gId = gCreated.data?.guideline?._id
  const gUp = await api(`/onboarding/admin/guidelines/${gId}`, { method: 'PUT', token: adminToken, body: { overallLevel: 'E2E Level', guidelineText: 'E2E updated text' } })
  check('update guideline', gUp.status === 200 && gUp.data?.guideline?.guidelineText === 'E2E updated text')
  const gDel = await api(`/onboarding/admin/guidelines/${gId}`, { method: 'DELETE', token: adminToken })
  check('delete guideline', gDel.status === 200)

  // ══════════════════════════════════════════════════════════════════════
  // 7. Retake reset → fresh session works again
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n── 7. Retake reset ──')
  const retake = await api(`/onboarding/retake/${S1}`, { method: 'POST' })
  check('retake succeeds', retake.status === 200 && retake.data?.success === true)
  check('generated_assessments cleared', (await GeneratedAssessment.countDocuments({ studentId: s1._id })) === 0)
  check('assessment_summaries cleared', (await AssessmentSummary.countDocuments({ studentId: s1._id })) === 0)
  check('assessment_results cleared', (await AssessmentResult.countDocuments({ studentId: s1._id })) === 0)
  const g5 = await api('/onboarding/generate-questions', { method: 'POST', body: { studentId: S1, grade: 'Class 5', skills: ['Creativity'] } })
  check('fresh generation works after retake', g5.data?.success === true && g5.data?.questions?.length > 0)

  // ── self-cleanup: remove fixtures so re-runs stay deterministic ──
  await User.deleteMany({ _id: { $in: [s1._id, s2._id] } })
  await Admin.deleteMany({ _id: admin._id })
  await GeneratedAssessment.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
  await AssessmentSummary.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
  await AssessmentResult.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
  await Recommendation.deleteMany({ userId: { $in: [s1._id, s2._id] } })

  console.log(`\n${failures === 0 ? 'ALL' : failures + ' FAILED'} — ${failures === 0 ? 'every check passed' : 'see FAIL above'}`)
  await mongoose.disconnect()
  process.exit(failures ? 1 : 0)
}

main().catch(async (e) => {
  console.error(e)
  await mongoose.disconnect()
  process.exit(1)
})