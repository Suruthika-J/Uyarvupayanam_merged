// backend/scratch/ldnbs_e2e_test.mjs
//
// Live HTTP end-to-end test for LD-NBSE against the running server:
//
//   generate (Class 8 blueprint, deterministic bank) → submit (crafted answers
//   read from the server-side verifier) → Part-24 result payload →
//   reassess 4 targeted questions → cycle-2 progress → incomplete-submission
//   guard → admin config CRUD → cleanup.
//
// forceBank keeps the flow deterministic even though GROQ_API_KEY is set in
// the server env. Correct answers are read from generated_assessments (the
// server-side verifier) so answers are always exact; the two percentage
// application questions are deliberately answered wrong to produce a real,
// evidence-backed weakness.
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import OnboardingQuestion from '../models/OnboardingQuestion.js'
import GeneratedAssessment from '../models/GeneratedAssessment.js'
import StudentSkillProfile from '../models/StudentSkillProfile.js'
import StudentLearningDNA from '../models/StudentLearningDNA.js'
import StudentInterestProfile from '../models/StudentInterestProfile.js'
import SkillProgressHistory from '../models/SkillProgressHistory.js'
import LearningRecommendation from '../models/LearningRecommendation.js'

dotenv.config()

const BASE = 'http://localhost:5000/api'
const STUDENT_EMAIL = `ldnbse.e2e.${Date.now()}@uyarvupayanam.local`
const STUDENT2_EMAIL = `ldnbse.e2e.2.${Date.now()}@uyarvupayanam.local`
const ADMIN_EMAIL = `ldnbse.admin.${Date.now()}@uyarvupayanam.local`
const DEFAULT_WEIGHTS = { skillGap: 0.35, prerequisiteImportance: 0.25, cognitiveGap: 0.2, interestAlignment: 0.1, recentProgress: 0.1 }

let failures = 0
const check = (name, cond, extra = '') => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
    if (!cond) failures++
}

async function api(path, { method = 'GET', body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    let data = null
    try { data = await res.json() } catch { /* non-JSON */ }
    return { status: res.status, data }
}

async function main() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam')
    const hash = await bcrypt.hash('secret123', 10)
    const s1 = await User.create({ name: 'LDNBSE E2E Student', email: STUDENT_EMAIL, password: hash, classLevel: '8th' })
    const s2 = await User.create({ name: 'LDNBSE E2E Student 2', email: STUDENT2_EMAIL, password: hash, classLevel: '8th' })
    const admin = await Admin.create({ name: 'LDNBSE E2E Admin', email: ADMIN_EMAIL, password: hash })
    const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET)
    const S1 = String(s1._id)
    const S2 = String(s2._id)

    // Deterministic Class 8 bank for the fallback path (forceBank=true).
    const bankDocs = await OnboardingQuestion.insertMany(
        ['Mathematics', 'English', 'Science', 'Logical Thinking'].flatMap((skill) =>
            Array.from({ length: 8 }, (_, i) => ({
                grade: 'Class 8',
                skillTag: skill,
                questionText: `E2E ${skill} bank question ${i + 1}`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option B',
                difficultyLevel: ['Easy', 'Medium', 'Hard'][i % 3],
                recommendationCategory: 'Diagnostic',
            }))
        )
    )

    // Always start from the default config (robust against leftovers).
    await api('/onboarding/ld/admin/config', { method: 'PUT', token: adminToken, body: { weights: DEFAULT_WEIGHTS } })

    // ── 1. GENERATE ─────────────────────────────────────────────────────────
    console.log('\n── 1. LD generate (Class 8 blueprint, deterministic bank) ──')
    const g1 = await api('/onboarding/ld/generate-questions', { method: 'POST', body: { studentId: S1, forceBank: true } })
    check('generate succeeds', g1.status === 200 && g1.data?.success === true, `HTTP ${g1.status}`)
    const sessionId = g1.data?.sessionId
    check('blueprint delivers 18 questions for Class 8', g1.data?.questions?.length === 18, `n=${g1.data?.questions?.length}`)
    check('sessionId returned', Boolean(sessionId))
    check('every question carries skill/subskill/cognitiveType/difficulty/weight', g1.data?.questions?.every((q) => q.skill && q.subskill && q.cognitiveType && q.difficulty && Number(q.weight) >= 1))
    check('no correctAnswer leaked to the client', !JSON.stringify(g1.data?.questions || []).match(/correct[_A]?[aA]?nswer/i) || !JSON.stringify(g1.data?.questions || []).includes('correctAnswer'))
    check('4 interest questions, category tags stripped from options', g1.data?.interestQuestions?.length === 4 && g1.data?.interestQuestions?.every((q) => q.questionId && Array.isArray(q.options) && q.options.every((o) => typeof o === 'string')), `n=${g1.data?.interestQuestions?.length}`)
    const stored = await GeneratedAssessment.find({ sessionId }).lean()
    check('rows persisted server-side with correctAnswer verifier', stored.length === 18 && stored.every((r) => typeof r.correctAnswer === 'string' && r.correctAnswer.length > 0 && r.mode === 'onboarding' && r.subskill && r.cognitiveType && Number(r.weight) >= 1))
    check('resume returns the same set', (await api('/onboarding/ld/generate-questions', { method: 'POST', body: { studentId: S1, sessionId } })).data?.questions?.length === 18)

    // ── 2. SUBMIT (wrong only on percentage/application → real weakness) ────
    console.log('\n── 2. LD submit (Part-24 payload) ──')
    const correctByQid = new Map(stored.map((r) => [String(r._id), r.correctAnswer]))
    const answers = g1.data.questions.map((q) => {
        const correct = correctByQid.get(String(q._id))
        if (q.subskill === 'percentage' && q.cognitiveType === 'application') {
            return { questionId: String(q._id), selectedAnswer: q.options.find((o) => o !== correct) }
        }
        return { questionId: String(q._id), selectedAnswer: correct }
    })
    const interestAnswers = g1.data.interestQuestions.map((q) => ({ questionId: q.questionId, option: q.options[0] }))
    const sub1 = await api('/onboarding/ld/submit', { method: 'POST', body: { studentId: S1, grade: 'Class 8', sessionId, answers, interestAnswers } })
    check('submit succeeds', sub1.status === 200 && sub1.data?.success === true, `HTTP ${sub1.status}`)
    const r1 = sub1.data?.result || {}
    check('learningDNA.accuracy.score is a number', typeof r1.learningDNA?.dimensions?.accuracy?.score === 'number', r1.learningDNA?.dimensions?.accuracy?.score)
    check('percentage diagnosed foundation from 2 wrong evidence points', (r1.skillDiagnosis || []).find((p) => p.subskill === 'percentage')?.status === 'foundation')
    check('application_gap detected (understanding strong, application weak)', (r1.detectedGaps || []).some((g) => g.type === 'application_gap'), (r1.detectedGaps || []).map((g) => g.type).join(','))
    check('gap attributed to percentage specifically', (r1.detectedGaps || []).find((g) => g.type === 'application_gap')?.relatedSkills?.some((x) => x.includes('percentage')), JSON.stringify((r1.detectedGaps || []).map((g) => g.relatedSkills)))
    check('primary focus = percentage (FOUNDATION)', r1.primaryFocus?.subskill === 'percentage' && r1.recommendationType === 'FOUNDATION', `${r1.primaryFocus?.subskill} / ${r1.recommendationType}`)
    check('reason includes WHY (evidence-backed)', typeof r1.primaryFocus?.reason === 'string' && r1.primaryFocus.reason.length > 20)
    check('strengthsToMaintain non-empty', Array.isArray(r1.strengthsToMaintain) && r1.strengthsToMaintain.length > 0, `n=${r1.strengthsToMaintain?.length}`)
    check('interest profile populated from the 4 interest answers', Object.keys(r1.interestProfile?.interests || {}).length > 0 && Boolean(r1.interestProfile?.source), r1.interestProfile?.source)
    check('cycle = 1', r1.cycle === 1, `cycle=${r1.cycle}`)
    check('explanation summary present', typeof r1.explanation?.summary === 'string' && r1.explanation.summary.length > 10)
    const recDoc1 = await LearningRecommendation.findOne({ studentId: s1._id }).sort({ submittedAt: -1 }).lean()
    check('evidence snapshot persisted (questionCount = 18)', recDoc1?.evidence?.questionCount === 18, `n=${recDoc1?.evidence?.questionCount}`)

    // ── 3. RESULT endpoint ──────────────────────────────────────────────────
    console.log('\n── 3. GET /onboarding/ld/result/:studentId ──')
    const res1 = await api(`/onboarding/ld/result/${S1}`)
    check('result succeeds', res1.status === 200 && res1.data?.success === true, `HTTP ${res1.status}`)
    const shapeKeys = ['studentProfile', 'learningDNA', 'skillDiagnosis', 'interestProfile', 'detectedGaps', 'primaryFocus', 'secondaryFocus', 'strengthsToMaintain', 'lockedSkills', 'unlockedSkills', 'learningPath', 'progress', 'areasToExplore', 'explanation', 'recommendationType', 'confidence', 'cycle', 'history']
    check('full Part-24 payload shape', shapeKeys.every((k) => k in (res1.data || {})), `missing=${shapeKeys.filter((k) => !(k in res1.data)).join(',')}`)
    check('persisted DNA matches submitted diagnosis', typeof res1.data?.learningDNA?.dimensions?.application?.score === 'number')
    check('history rows persisted (skill_progress_history)', (res1.data?.history || []).length > 0, `n=${res1.data?.history?.length}`)
    check('first-cycle progress = baseline (insufficient_data)', res1.data?.progress?.length > 0 && res1.data?.progress?.every((p) => p.classification === 'insufficient_data'), (res1.data?.progress || []).map((p) => p.classification).join(','))
    check('user flags updated', (await User.findById(s1._id).lean())?.recommendationGenerated === true)
    const gBlocked = await api('/onboarding/ld/generate-questions', { method: 'POST', body: { studentId: S1 } })
    check('alreadyCompleted guard without sessionId', gBlocked.data?.alreadyCompleted === true)

    // ── 4. REASSESS (adaptive loop) + cycle-2 progress ─────────────────────
    console.log('\n── 4. Reassess 4 targeted questions → cycle-2 progress ──')
    const re = await api('/onboarding/ld/reassess', { method: 'POST', body: { studentId: S1, forceBank: true } })
    check('reassess generates 4 targeted questions', re.data?.questions?.length === 4, `n=${re.data?.questions?.length}`)
    check('reassess targets the primary focus (percentage)', re.data?.focus?.subskill === 'percentage' && re.data?.questions?.every((q) => q.subskill === 'percentage'), `${re.data?.focus?.subskill} | specs=${re.data?.questions?.map((q) => q.cognitiveType).join(',')}`)
    check('reassess mode + new sessionId', re.data?.mode === 'reassess' && Boolean(re.data?.sessionId), re.data?.mode)
    const rStored = await GeneratedAssessment.find({ sessionId: re.data?.sessionId, studentId: s1._id, mode: 'reassess' }).lean()
    check('reassess rows carry reassessTarget + metadata', rStored.length === 4 && rStored.every((r) => r.reassessTarget === 'percentage' && r.subskill === 'percentage' && r.cognitiveType), rStored.map((r) => r.cognitiveType).join(','))
    const rCorrect = new Map(rStored.map((r) => [String(r._id), r.correctAnswer]))
    const rAnswers = re.data.questions.map((q) => ({ questionId: String(q._id), selectedAnswer: rCorrect.get(String(q._id)) }))
    const sub2 = await api('/onboarding/ld/submit', { method: 'POST', body: { studentId: S1, grade: 'Class 8', sessionId: re.data?.sessionId, answers: rAnswers } })
    check('cycle-2 submit succeeds', sub2.status === 200 && sub2.data?.success === true, `HTTP ${sub2.status}`)
    check('cycle incremented to 2', sub2.data?.result?.cycle === 2, `cycle=${sub2.data?.result?.cycle}`)
    const res2 = await api(`/onboarding/ld/result/${S1}`)
    const progPct = (res2.data?.progress || []).find((p) => p.subskill === 'percentage')
    check('percentage progress classified improving (0 → 100)', progPct?.classification === 'improving' && progPct?.previousScore === 0 && progPct?.currentScore === 100, `${progPct?.previousScore} → ${progPct?.currentScore} (${progPct?.classification})`)
    check('only reassess rows counted for cycle 2 (mode filter)', (await GeneratedAssessment.countDocuments({ studentId: s1._id, mode: 'reassess' })) === 4)

    // ── 5. Incomplete assessment guard ─────────────────────────────────────
    console.log('\n── 5. Incomplete submission rejected ──')
    const g2 = await api('/onboarding/ld/generate-questions', { method: 'POST', body: { studentId: S2, forceBank: true } })
    const sid2 = g2.data?.sessionId
    const bad = await api('/onboarding/ld/submit', { method: 'POST', body: { studentId: S2, grade: 'Class 8', sessionId: sid2, answers: [{ questionId: 'bogus', selectedAnswer: 'Option A' }] } })
    check('partial submission → 422 INCOMPLETE_ASSESSMENT', bad.status === 422 && bad.data?.code === 'INCOMPLETE_ASSESSMENT', `HTTP ${bad.status} code=${bad.data?.code}`)

    // ── 6. Admin config ────────────────────────────────────────────────────
    console.log('\n── 6. Admin LD config (weights / thresholds / taxonomy) ──')
    const noAuth = await api('/onboarding/ld/admin/config')
    check('admin config rejects anonymous access', noAuth.status === 401 || noAuth.status === 403, `HTTP ${noAuth.status}`)
    const cfg = await api('/onboarding/ld/admin/config', { token: adminToken })
    check('default weights served', cfg.data?.config?.weights?.skillGap === 0.35 && cfg.data?.config?.weights?.prerequisiteImportance === 0.25, JSON.stringify(cfg.data?.config?.weights))
    check('grade-aware thresholds served (Class 8 bar)', cfg.data?.config?.thresholds?.status?.['Class 8']?.advancedAt === 80, JSON.stringify(cfg.data?.config?.thresholds?.status?.['Class 8']))
    check('taxonomy + dependency lists served', Array.isArray(cfg.data?.taxonomy) && cfg.data?.taxonomy.length > 0 && Array.isArray(cfg.data?.dependencies) && cfg.data?.dependencies.length > 0, `deps=${cfg.data?.dependencies?.length}`)
    const upd = await api('/onboarding/ld/admin/config', { method: 'PUT', token: adminToken, body: { weights: { skillGap: 0.4 } } })
    check('weight override normalised to sum 1', Math.abs(Object.values(upd.data?.config?.weights || {}).reduce((a, b) => a + Number(b || 0), 0) - 1) < 0.0001, JSON.stringify(upd.data?.config?.weights))

    // restore default config before cleanup
    await api('/onboarding/ld/admin/config', { method: 'PUT', token: adminToken, body: { weights: DEFAULT_WEIGHTS } })

    // ── cleanup ────────────────────────────────────────────────────────────
    await User.deleteMany({ _id: { $in: [s1._id, s2._id] } })
    await Admin.deleteMany({ _id: admin._id })
    await GeneratedAssessment.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
    await StudentSkillProfile.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
    await StudentLearningDNA.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
    await StudentInterestProfile.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
    await SkillProgressHistory.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
    await LearningRecommendation.deleteMany({ studentId: { $in: [s1._id, s2._id] } })
    await OnboardingQuestion.deleteMany({ _id: { $in: bankDocs.map((d) => d._id) } })

    console.log(`\n${failures === 0 ? 'ALL' : failures + ' FAILED'} — ${failures === 0 ? 'every check passed' : 'see FAIL above'}`)
    await mongoose.disconnect()
    process.exit(failures ? 1 : 0)
}

main().catch(async (err) => {
    console.error('E2E crash:', err)
    await mongoose.disconnect()
    process.exit(1)
})