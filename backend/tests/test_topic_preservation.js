/**
 * backend/tests/test_topic_preservation.js
 *
 * Automated verification test ensuring topic fidelity across:
 * SQL -> SQL
 * DBMS -> DBMS
 * Java -> Java
 * Python -> Python
 * OOPS -> OOPS
 * OS -> OS
 */

const { normalizeTopic } = require('../services/quizAI/TopicNormalizer')
const { buildQuiz } = require('../services/quizAI/QuizBuilder')

async function testTopicPreservation() {
  console.log('=== MULTIPLAYER QUIZ TOPIC PRESERVATION TEST ===\n')

  const testCases = [
    { input: 'SQL', expectedTopicId: 'sql', expectedLabel: 'SQL' },
    { input: 'DBMS', expectedTopicId: 'dbms', expectedLabel: 'DBMS' },
    { input: 'Java', expectedTopicId: 'java', expectedLabel: 'Java' },
    { input: 'Python', expectedTopicId: 'python', expectedLabel: 'Python' },
    { input: 'OOPS', expectedTopicId: 'oops', expectedLabel: 'OOPS' },
    { input: 'OS', expectedTopicId: 'os', expectedLabel: 'OS' }
  ]

  let allPassed = true

  for (const tc of testCases) {
    console.log(`Testing topic: "${tc.input}"...`)
    const norm = normalizeTopic(tc.input, tc.input)
    
    console.log(`  -> Normalized TopicId: "${norm.domainId}", TopicLabel: "${norm.normalizedTopic}"`)

    if (norm.domainId !== tc.expectedTopicId) {
      console.error(`  ❌ FAILED: Expected domainId "${tc.expectedTopicId}", got "${norm.domainId}"`)
      allPassed = false
    } else if (norm.normalizedTopic !== tc.expectedLabel) {
      console.error(`  ❌ FAILED: Expected label "${tc.expectedLabel}", got "${norm.normalizedTopic}"`)
      allPassed = false
    } else {
      console.log(`  ✔ PASSED: "${tc.input}" preserved as topicId "${norm.domainId}" (${norm.normalizedTopic})`)
    }
  }

  if (allPassed) {
    console.log('\n==================================================')
    console.log('ALL TOPIC PRESERVATION TESTS PASSED! 🎉')
    console.log('==================================================')
  } else {
    console.error('\n❌ SOME TOPIC PRESERVATION TESTS FAILED!')
    process.exit(1)
  }
}

testTopicPreservation().catch(err => {
  console.error('Test execution error:', err)
  process.exit(1)
})
