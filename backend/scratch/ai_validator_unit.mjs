// Unit checks for the AI question-generator validator (no network needed).
import { parseAndValidateQuestions, resolveProvider } from '../utils/aiQuestionGenerator.js'

let pass = 0, fail = 0
const t = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); cond ? pass++ : fail++ }

// 1. valid response with code fence + prose
try {
  const q = parseAndValidateQuestions('Here you go:\n```json\n[{"question":"Which shape has 4 equal sides?","options":["Square","Circle","Triangle","Star"],"correct_answer":"Square","difficulty":"easy"},{"question":"Next in 2,4,6,8?","options":["10","12","14","16"],"correct_answer":"10","difficulty":"medium"}]\n```')
  t('valid JSON parses to 2 questions', q.length === 2)
  t('correct_answer stripped to correctAnswer', q[0].correctAnswer === 'Square' && !('correct_answer' in q[0]))
  t('options preserved', JSON.stringify(q[0].options) === JSON.stringify(['Square','Circle','Triangle','Star']))
} catch (e) { t('valid JSON parses', false) }

// 2. invalid question filtered: correct_answer not among options
try {
  const q = parseAndValidateQuestions('[{"question":"q?","options":["A","B","C","D"],"correct_answer":"Z","difficulty":"easy"}]')
  t('bad correct_answer filtered out', q.length === 0)
} catch (e) { t('bad correct_answer filtered out', false) }

// 3. duplicate options filtered
try {
  const q = parseAndValidateQuestions('[{"question":"q?","options":["A","A","C","D"],"correct_answer":"A","difficulty":"easy"}]')
  t('duplicate options filtered out', q.length === 0)
} catch (e) { t('duplicate options filtered out', false) }

// 4. wrong option count filtered
try {
  const q = parseAndValidateQuestions('[{"question":"q?","options":["A","B","C"],"correct_answer":"B","difficulty":"easy"}]')
  t('3 options filtered out', q.length === 0)
} catch (e) { t('3 options filtered out', false) }

// 5. malformed JSON throws
try { parseAndValidateQuestions('this is not json at all'); t('malformed throws', false) } catch (e) { t('malformed JSON throws', true) }

// 6. empty array throws
try { parseAndValidateQuestions('[]'); t('empty array throws', false) } catch (e) { t('empty array throws', true) }

// 7. provider resolution — must be adaptive: null when no LLM key is configured
//    (bank fallback mode) or a well-formed provider object when one is set.
const prov = resolveProvider()
if (prov === null) {
  t('no provider (no LLM key) -> bank fallback mode', true)
} else {
  t('provider resolved with expected shape',
    prov && typeof prov.apiKey === 'string' && prov.apiKey.length > 0 &&
    typeof prov.model === 'string' && typeof prov.baseUrl === 'string')
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)