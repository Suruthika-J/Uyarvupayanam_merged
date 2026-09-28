// Live verification of the Groq-backed AI question generator against the real
// Groq API. Prints provider info (key masked), then generates questions for
// representative skills across every supported grade. Correct answers are shown
// ONLY here in local output so the developer can eyeball quality — they never
// reach the client.
import dotenv from 'dotenv'
import { resolveProvider, generateQuestionsForSkill } from '../utils/aiQuestionGenerator.js'

dotenv.config()

const p = resolveProvider()
if (!p) {
  console.log('NO PROVIDER RESOLVED — check GROQ_API_KEY in backend/.env')
  process.exit(1)
}
const maskedKey = p.apiKey.length > 6 ? p.apiKey.slice(0, 5) + '…' + p.apiKey.slice(-4) : '(short)'
console.log(`provider:  type=${p.type} model=${p.model}`)
console.log(`baseUrl:   ${p.baseUrl}`)
console.log(`apiKey:    ${maskedKey}`)

const GRADES = ['Class 5', 'Class 8', 'Class 10', 'Class 12']
const SKILLS = ['Mathematics', 'English']

let failures = 0
for (const grade of GRADES) {
  for (const skill of SKILLS) {
    const qs = await generateQuestionsForSkill(skill, grade, 3)
    if (!Array.isArray(qs) || qs.length === 0) {
      console.log(`FAIL  ${grade} / ${skill} → no questions (LLM path returned null)`)
      failures++
      continue
    }
    const ok = qs.every(q =>
      q.questionText && Array.isArray(q.options) && q.options.length === 4 &&
      new Set(q.options).size === 4 && q.options.includes(q.correctAnswer)
    )
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${grade} / ${skill} → ${qs.length} questions (all validated: ${ok})`)
    if (qs[0]) {
      console.log(`      sample: ${qs[0].questionText}`)
      console.log(`      options: ${qs[0].options.join('  |  ')}   [correct: ${qs[0].correctAnswer}]`)
    }
    if (!ok) failures++
  }
}

console.log(`\n${failures === 0 ? 'ALL LIVE GENERATION CHECKS PASSED' : failures + ' generation failure(s)'}`)
process.exit(failures ? 1 : 0)