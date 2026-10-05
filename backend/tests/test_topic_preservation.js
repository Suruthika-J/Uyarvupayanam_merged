/**
 * backend/tests/test_topic_preservation.js
 *
 * Automated verification test ensuring 100% topic fidelity across:
 * C++ -> C++ (cpp)
 * SQL -> SQL (sql)
 * DBMS -> DBMS (dbms)
 * Java -> Java (java)
 * Python -> Python (python)
 * OOPS -> OOPS (oops)
 * OS -> OS (os)
 * Computer Networks -> CN (cn)
 * Data Structures & Algorithms -> DSA (dsa)
 */

const mongoose = require('mongoose')
require('dotenv').config()
const { normalizeTopic } = require('../services/quizAI/TopicNormalizer')
const { buildQuiz } = require('../services/quizAI/QuizBuilder')

async function testTopicPreservation() {
  console.log('=== MULTIPLAYER QUIZ TOPIC PRESERVATION TEST ===\n')

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uyarvu_payanam'
  try {
    await mongoose.connect(mongoUri)
    console.log('✔ Connected to MongoDB for fast DB query execution.')
  } catch (err) {
    console.warn('MongoDB connect warning:', err.message)
  }

  const testCases = [
    { input: 'C++', expectedTopicId: 'cpp', expectedLabel: 'C++' },
    { input: 'cpp', expectedTopicId: 'cpp', expectedLabel: 'C++' },
    { input: 'SQL', expectedTopicId: 'sql', expectedLabel: 'SQL' },
    { input: 'DBMS', expectedTopicId: 'dbms', expectedLabel: 'DBMS' },
    { input: 'Java', expectedTopicId: 'java', expectedLabel: 'Java' },
    { input: 'Python', expectedTopicId: 'python', expectedLabel: 'Python' },
    { input: 'OOPS', expectedTopicId: 'oops', expectedLabel: 'OOPS' },
    { input: 'OS', expectedTopicId: 'os', expectedLabel: 'OS' },
    { input: 'Computer Networks', expectedTopicId: 'cn', expectedLabel: 'Computer Networks' },
    { input: 'Data Structures & Algorithms', expectedTopicId: 'dsa', expectedLabel: 'Data Structures & Algorithms' }
  ]

  let allPassed = true

  for (const tc of testCases) {
    console.log(`\nTesting topic: "${tc.input}"...`)
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

    // Test QuizBuilder question generation & zero cross-topic contamination
    try {
      const quizData = await buildQuiz({ topic: tc.input, questionCount: 5 })
      console.log(`  -> QuizBuilder output topicId: "${quizData.topicId}", totalQuestions: ${quizData.totalQuestions}`)
      if (quizData.topicId !== tc.expectedTopicId) {
        console.error(`  ❌ FAILED: QuizBuilder output topicId "${quizData.topicId}" !== expected "${tc.expectedTopicId}"`)
        allPassed = false
      }
    } catch (err) {
      console.error(`  ❌ FAILED: QuizBuilder threw error for "${tc.input}":`, err.message)
      allPassed = false
    }
  }

  await mongoose.disconnect()

  if (allPassed) {
    console.log('\n==================================================')
    console.log('ALL TOPIC PRESERVATION & QUIZ BUILDER TESTS PASSED! 🎉')
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
