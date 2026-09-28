// backend/scratch/ldnbs_unit_test.mjs
//
// Pure-engine tests for LD-NBSE (Learning DNA – Next Best Skill Engine).
// No DB, no HTTP: every engine runs on synthetic metadata-bearing question
// sets with the pure default config (config/ldnbs/loadEffectiveConfig.js).
//
// Covers:
//   - Part 30: two Class 10 students with the SAME 67% Mathematics score but
//     OPPOSITE reasoning/application profiles get DIFFERENT next-best skills.
//   - Profiles A–H from the spec (Part 29).
//   - Blueprint sanity: 15–20 questions/class, full metadata on every row.
//   - Configurable weights + evidence gates.
import dotenv from 'dotenv'
import skillDiagnosis from '../services/skillDiagnosisEngine.js'
import learningDNA from '../services/learningDNAEngine.js'
import gapDetection from '../services/gapDetectionEngine.js'
import progressEngine from '../services/progressAnalysisEngine.js'
import interestEngine from '../services/interestProfileEngine.js'
import nextBestSkill from '../services/nextBestSkillEngine.js'
import taxonomy from '../config/ldnbs/skillTaxonomyConfig.js'
import { defaultConfig } from '../config/ldnbs/loadEffectiveConfig.js'
import { validateWeights } from '../config/ldnbs/recommendationWeights.js'

dotenv.config()

let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
  if (!cond) failures++
}

const Q = (skill, subskill, cognitiveType, difficulty, weight, isCorrect) => ({ skill, subskill, cognitiveType, difficulty, weight, isCorrect })
const rawPct = (questions) => Math.round((questions.filter((q) => q.isCorrect).length / questions.length) * 100)

function run(questions, { grade = 'Class 10', interests = null, cfg = defaultConfig } = {}) {
  const { profiles } = skillDiagnosis.diagnose(questions, { grade, cfg })
  const dna = learningDNA.build(questions, { cfg })
  const gaps = gapDetection.detect({ dna, profiles }, { cfg })
  const interest = interests ? { interests, source: 'test' } : interestEngine.compute([], {})
  const progress = progressEngine.analyze(profiles, [], { cfg })
  const deps = taxonomy.getDependencies(grade)
  const rec = nextBestSkill.decide({
    grade, profiles, dna, gaps, interests: interest.interests, progress, deps, cfg,
    mode: 'onboarding',
    allAnsweredCount: questions.length,
    assessedSubskills: [...new Set(questions.map((q) => q.subskill))],
  })
  return { profiles, dna, gaps, interest, progress, deps, rec }
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 0. Blueprint sanity (15–20 q/class, metadata on every row) ──')
for (const g of taxonomy.GRADES) {
  const bp = taxonomy.getBlueprint(g)
  const total = bp.reduce((s, r) => s + (Number(r.count) || 1), 0)
  check(`${g}: total in 15–20 band`, total >= 15 && total <= 20, `${total}q`)
  check(`${g}: full metadata on every row`, bp.every((r) => r.skill && r.subskill && r.cognitiveType && r.difficulty && Number(r.weight) >= 1 && (Number(r.count) || 1) >= 1))
  const understandingRows = bp.filter((r) => r.cognitiveType === 'recall' || r.cognitiveType === 'understanding')
  check(`${g}: at least one recall/understanding row (understanding dimension is evidenced)`, understandingRows.length > 0)
}
check('every grade blueprint uses taxonomy subskills', taxonomy.GRADES.every((g) => taxonomy.getBlueprint(g).every((r) => (taxonomy.TAXONOMY[g][r.skill] || []).includes(r.subskill))))

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 1. Profile A — Class 10: strong reasoning, weak application (67%) ──')
const qA = [
  Q('Mathematics', 'percentage', 'understanding', 'easy', 1, true),
  Q('Mathematics', 'percentage', 'understanding', 'easy', 1, true),
  Q('Mathematics', 'percentage', 'application', 'medium', 2, false),
  Q('Mathematics', 'percentage', 'application', 'medium', 2, false),
  Q('Mathematics', 'ratio', 'application', 'hard', 2, false),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'medium', 2, true),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'hard', 2, true),
  Q('Mathematics', 'mathematicalReasoning', 'problem_solving', 'hard', 2, true),
  Q('Mathematics', 'dataInterpretation', 'interpretation', 'medium', 1, true),
]
const a = run(qA)
check('A: raw % = 67', rawPct(qA) === 67, `${rawPct(qA)}%`)
check('A: reasoning DNA dimension strong (100)', a.dna.dimensions.reasoning.score === 100, a.dna.dimensions.reasoning.score)
check('A: application DNA dimension weak (0)', a.dna.dimensions.application.score === 0, a.dna.dimensions.application.score)
check('A: application_gap detected', a.gaps.some((g) => g.type === 'application_gap'), a.gaps.map((g) => g.type).join(','))
check('A: no reasoning_gap (reasoning is the strength)', !a.gaps.some((g) => g.type === 'reasoning_gap'))
check('A: gap attributed to percentage (cognitivePerformance, not name match)', a.gaps.find((g) => g.type === 'application_gap')?.relatedSkills?.includes('Mathematics · percentage'))
check('A: next best skill = percentage (application-related skill)', a.rec.primaryFocus.subskill === 'percentage', `${a.rec.primaryFocus.subskill} / ${a.rec.recommendationType}`)
check('A: reasonCode foundation_gap (33% weighted → foundation) + confidence from evidence', a.rec.primaryFocus.reasonCode === 'foundation_gap' && Boolean(a.rec.primaryFocus.confidence))
check('A: suspected weak skill has 2+ evidence points (judged, not guessed)', a.profiles.find((p) => p.subskill === 'percentage').attemptedCount === 4)

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 2. Profile B — Class 10: strong application, weak reasoning (67%) ──')
const qB = [
  Q('Mathematics', 'percentage', 'understanding', 'easy', 1, true),
  Q('Mathematics', 'percentage', 'understanding', 'easy', 1, true),
  Q('Mathematics', 'percentage', 'application', 'medium', 2, true),
  Q('Mathematics', 'percentage', 'application', 'medium', 2, true),
  Q('Mathematics', 'ratio', 'application', 'hard', 2, true),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'medium', 2, false),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'hard', 2, false),
  Q('Mathematics', 'mathematicalReasoning', 'problem_solving', 'hard', 2, true),
  Q('Mathematics', 'dataInterpretation', 'interpretation', 'medium', 1, false),
]
const b = run(qB)
check('B: raw % = 67', rawPct(qB) === 67, `${rawPct(qB)}%`)
check('B: application DNA dimension strong (100)', b.dna.dimensions.application.score === 100, b.dna.dimensions.application.score)
check('B: reasoning DNA dimension weak (0)', b.dna.dimensions.reasoning.score === 0, b.dna.dimensions.reasoning.score)
check('B: reasoning_gap detected', b.gaps.some((g) => g.type === 'reasoning_gap'), b.gaps.map((g) => g.type).join(','))
check('B: no application_gap', !b.gaps.some((g) => g.type === 'application_gap'))
check('B: gap attributed to algebraicThinking', b.gaps.find((g) => g.type === 'reasoning_gap')?.relatedSkills?.includes('Mathematics · algebraicThinking'))
check('B: next best skill = algebraicThinking (reasoning-related skill)', b.rec.primaryFocus.subskill === 'algebraicThinking', `${b.rec.primaryFocus.subskill} / ${b.rec.recommendationType}`)

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── Part 30: differentiation (same 67%, opposite cognitive profiles) ──')
check('same overall score (both 67%)', rawPct(qA) === rawPct(qB) && rawPct(qA) === 67)
check('DIFFERENT primary focus', a.rec.primaryFocus.subskill !== b.rec.primaryFocus.subskill, `${a.rec.primaryFocus.subskill} vs ${b.rec.primaryFocus.subskill}`)
check('DIFFERENT gap set', a.gaps.map((g) => g.type).join(',') !== b.gaps.map((g) => g.type).join(','), `A:[${a.gaps.map((g) => g.type).join(',')}] B:[${b.gaps.map((g) => g.type).join(',')}]`)
check('application-gap student targets an application skill', a.rec.primaryFocus.subskill === 'percentage')
check('reasoning-gap student targets a reasoning skill', b.rec.primaryFocus.subskill === 'algebraicThinking')

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 3. Profile C — Class 10: strong Science, weak English ──')
const qC = [
  Q('Science', 'scientificReasoning', 'reasoning', 'medium', 2, true),
  Q('Science', 'application', 'application', 'hard', 2, true),
  Q('Science', 'interpretation', 'interpretation', 'medium', 1, true),
  Q('English', 'readingComprehension', 'interpretation', 'medium', 2, false),
  Q('English', 'readingComprehension', 'interpretation', 'hard', 2, false),
  Q('English', 'inference', 'reasoning', 'hard', 2, false),
  Q('English', 'inference', 'reasoning', 'medium', 2, false),
  Q('Logical Thinking', 'analyticalReasoning', 'problem_solving', 'hard', 2, true),
  Q('Logical Thinking', 'patternRecognition', 'pattern_recognition', 'easy', 1, true),
  Q('Communication', 'comprehension', 'interpretation', 'easy', 1, true),
]
const c = run(qC)
check('C: English reading + inference flagged foundation', c.profiles.find((p) => p.subskill === 'readingComprehension')?.status === 'foundation' && c.profiles.find((p) => p.subskill === 'inference')?.status === 'foundation')
check('C: next best skill lives in English (weak area)', c.rec.primaryFocus.skill === 'English', `${c.rec.primaryFocus.skill} · ${c.rec.primaryFocus.subskill}`)
check('C: no skill outside English wins even with skills equally weak', c.rec.primaryFocus.subskill === 'readingComprehension' || c.rec.primaryFocus.subskill === 'inference', c.rec.primaryFocus.subskill)

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 4. Profile D — Class 5: strong Mathematics, weak English ──')
const qD = [
  Q('English', 'vocabulary', 'recall', 'easy', 1, false),
  Q('English', 'vocabulary', 'recall', 'easy', 1, false),
  Q('English', 'basicReading', 'interpretation', 'medium', 2, false),
  Q('English', 'basicReading', 'interpretation', 'hard', 2, false),
  Q('English', 'sentenceFormation', 'application', 'medium', 1, false),
  Q('English', 'sentenceFormation', 'application', 'medium', 1, false),
  Q('Mathematics', 'numberSense', 'recall', 'easy', 1, true),
  Q('Mathematics', 'numberSense', 'understanding', 'medium', 1, true),
  Q('Mathematics', 'arithmetic', 'application', 'medium', 2, true),
  Q('Mathematics', 'arithmetic', 'problem_solving', 'hard', 2, true),
  Q('Logical Thinking', 'classification', 'reasoning', 'medium', 2, true),
  Q('Science', 'observation', 'recall', 'easy', 1, true),
  Q('General Knowledge', 'generalAwareness', 'recall', 'easy', 1, true),
  Q('Creativity', 'ideaGeneration', 'understanding', 'medium', 1, true),
  Q('Communication', 'comprehension', 'interpretation', 'medium', 2, true),
  Q('Communication', 'expression', 'communication', 'easy', 1, true),
]
const d = run(qD, { grade: 'Class 5' })
check('D: all English subskills foundation', d.profiles.filter((p) => p.skill === 'English').every((p) => p.status === 'foundation'))
check('D: Mathematics strong in Class-5 curve', d.profiles.filter((p) => p.skill === 'Mathematics').every((p) => p.status === 'ready' || p.status === 'advanced'))
check('D: next best skill is in English', d.rec.primaryFocus.skill === 'English', `${d.rec.primaryFocus.skill} · ${d.rec.primaryFocus.subskill}`)

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 5. Profile E — Class 12: all strong + tech interest → EXPLORATION ──')
const qE = [
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'medium', 2, true),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'hard', 2, true),
  Q('Mathematics', 'mathematicalReasoning', 'problem_solving', 'medium', 2, true),
  Q('Mathematics', 'mathematicalReasoning', 'problem_solving', 'hard', 2, true),
  Q('Mathematics', 'advancedProblemSolving', 'problem_solving', 'hard', 3, true),
  Q('Mathematics', 'advancedProblemSolving', 'problem_solving', 'hard', 3, true),
  Q('Mathematics', 'dataInterpretation', 'interpretation', 'medium', 1, true),
  Q('English', 'readingComprehension', 'interpretation', 'medium', 2, true),
  Q('English', 'readingComprehension', 'interpretation', 'hard', 2, true),
  Q('English', 'inference', 'reasoning', 'medium', 2, true),
  Q('English', 'inference', 'reasoning', 'hard', 2, true),
  Q('Science', 'scientificReasoning', 'reasoning', 'hard', 2, true),
  Q('Science', 'application', 'application', 'medium', 2, true),
  Q('Science', 'higherOrderThinking', 'reasoning', 'hard', 2, true),
  Q('Logical Thinking', 'analyticalReasoning', 'problem_solving', 'hard', 2, true),
  Q('Communication', 'communicationClarity', 'communication', 'medium', 1, true),
]
const e = run(qE, { grade: 'Class 12', interests: { technology: 90, mathematics: 70, science: 55, creative: 40, design: 40, communication: 40, business: 30, social: 30 } })
check('E: no weak subskills', e.profiles.filter((p) => p.status === 'foundation' || p.status === 'developing').length === 0)
check('E: recommendationType = EXPLORATION', e.rec.recommendationType === 'EXPLORATION', e.rec.recommendationType)
check('E: exploration reasonCode', e.rec.primaryFocus.reasonCode === 'exploration', e.rec.primaryFocus.reasonCode)
check('E: areasToExplore honour technology interest', e.rec.areasToExplore.some((x) => x.includes('technology')), e.rec.areasToExplore[0] || '')
check('E: strengthsToMaintain non-empty', e.rec.strengthsToMaintain.length > 0, `n=${e.rec.strengthsToMaintain.length}`)

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 6. Profile F — too little evidence → NO over-claiming ──')
const qF = [
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'medium', 2, false),
  Q('Mathematics', 'percentage', 'application', 'medium', 2, true),
]
const f = run(qF)
check('F: every subskill status = insufficient_evidence', f.profiles.every((p) => p.status === 'insufficient_evidence'), f.profiles.map((p) => p.status).join(','))
check('F: no cognitive gaps emitted', f.gaps.length === 0, f.gaps.map((g) => g.type).join(','))
check('F: recommendation gathers evidence, NOT EXPLORATION (no strength claim)', f.rec.recommendationType === 'DEVELOPMENT', f.rec.recommendationType)
check('F: primary focus confidence = low', f.rec.primaryFocus.confidence === 'low', f.rec.primaryFocus.confidence)
check('F: reasonCode = insufficient_evidence', f.rec.primaryFocus.reasonCode === 'insufficient_evidence', f.rec.primaryFocus.reasonCode)
check('F: reason text is honest (asks for a focused practice set)', /not enough evidence/i.test(f.rec.primaryFocus.reason))

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 7. Profile G — progress classification (improving / mastered / baseline) ──')
const gProfiles = skillDiagnosis.diagnose([
  Q('Mathematics', 'percentage', 'application', 'medium', 2, true),
  Q('Mathematics', 'percentage', 'application', 'hard', 2, true),
  Q('Mathematics', 'percentage', 'problem_solving', 'medium', 1, true),
  Q('Mathematics', 'ratio', 'application', 'medium', 2, true),
  Q('Mathematics', 'ratio', 'application', 'hard', 2, true),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'medium', 2, true),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'hard', 2, true),
], { grade: 'Class 10', cfg: defaultConfig }).profiles
const gProg = progressEngine.analyze(gProfiles, [
  { skill: 'Mathematics', subskill: 'percentage', score: 25 },
  { skill: 'Mathematics', subskill: 'ratio', score: 95 },
], { cfg: defaultConfig })
const findG = (sub) => gProg.find((p) => p.subskill === sub)
check('G: percentage 25 → 100 = improving', findG('percentage')?.classification === 'improving' && findG('percentage')?.change === 75, `${findG('percentage')?.previousScore} → ${findG('percentage')?.currentScore} (${findG('percentage')?.classification})`)
check('G: ratio 95 → 100 while advanced = mastered', findG('ratio')?.classification === 'mastered', findG('ratio')?.classification)
check('G: first-ever subskill = baseline (insufficient_data)', findG('algebraicThinking')?.classification === 'insufficient_data' && findG('algebraicThinking')?.previousScore === null)

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 8. Profile H — strong advanced score but weak prerequisite → LOCKED ──')
const qH = [
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'medium', 2, true),
  Q('Mathematics', 'algebraicThinking', 'reasoning', 'hard', 2, true),
  Q('Mathematics', 'percentage', 'application', 'medium', 2, false),
  Q('Mathematics', 'percentage', 'application', 'hard', 2, false),
  Q('Mathematics', 'ratio', 'application', 'hard', 2, false),
  Q('Mathematics', 'dataInterpretation', 'interpretation', 'medium', 1, true),
  Q('Mathematics', 'mathematicalReasoning', 'problem_solving', 'medium', 2, true),
  Q('Mathematics', 'mathematicalReasoning', 'problem_solving', 'hard', 2, true),
]
const h = run(qH)
check('H: mathematicalReasoning scores advanced on its own', h.profiles.find((p) => p.subskill === 'mathematicalReasoning')?.status === 'advanced')
check('H: …yet it is LOCKED (prerequisite ratio weak/unverified)', h.rec.lockedSkills.some((l) => l.subskill === 'mathematicalReasoning'), (h.rec.lockedSkills.find((l) => l.subskill === 'mathematicalReasoning'))?.reason)
check('H: locked reason names the missing prerequisite', /ratio/.test((h.rec.lockedSkills.find((l) => l.subskill === 'mathematicalReasoning') || {}).reason || ''))
check('H: NOT in unlockedSkills', !h.rec.unlockedSkills.some((u) => u.subskill === 'mathematicalReasoning'))
check('H: next best skill = build the missing foundation (percentage)', h.rec.primaryFocus.subskill === 'percentage', `${h.rec.primaryFocus.subskill} / ${h.rec.recommendationType}`)
check('H: algebraicThinking (root) is never locked (prereq-free roots stay free)', !h.rec.lockedSkills.some((l) => l.subskill === 'algebraicThinking'))

// ────────────────────────────────────────────────────────────────────────────
console.log('\n── 9. Configurability — weights + admin normalization ──')
const cfgAlt = { ...defaultConfig, weights: { skillGap: 0.5, prerequisiteImportance: 0.2, cognitiveGap: 0.15, interestAlignment: 0.1, recentProgress: 0.05 } }
const alt = run(qB, { cfg: cfgAlt })
check('re-weighted config still decides deterministically', alt.rec.primaryFocus.subskill === 'algebraicThinking' && alt.rec.primaryFocus.confidence, `${alt.rec.primaryFocus.subskill}`)
const normalized = validateWeights({ skillGap: 0.4 })
check('admin weight override normalised to sum 1', Math.abs(Object.values(normalized).reduce((s, v) => s + Number(v || 0), 0) - 1) < 0.0001, JSON.stringify(normalized))
check('single-question evidence is never judged', skillDiagnosis.diagnose([Q('Mathematics', 'percentage', 'application', 'medium', 2, false)], { grade: 'Class 10', cfg: defaultConfig }).profiles[0].status === 'insufficient_evidence')

console.log(`\n${failures === 0 ? 'ALL' : failures + ' FAILED'} — ${failures === 0 ? 'every check passed' : 'see FAIL above'}`)
process.exit(failures ? 1 : 0)