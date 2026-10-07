import axios from '../../config/axios'

// ─── One client for the three Class 5 daily challenges ──────────────────────
//
// Math Adventure, World Explorer and Science World all serve a "Today's
// Challenge" with identical mechanics: one question per calendar day, remembered
// per student, completed once. Only the endpoint, the subject slug and the shape
// of the answer differ, so all three go through here instead of three parallel
// fetch functions that drift apart.
//
// This module never invents rules. The server decides which question today is
// and validates the answer; the client only sends what the student chose.

const SUBJECTS = {
  maths: { path: '/maths', label: "Today's Math Challenge" },
  social: { path: '/social', label: "Today's Explorer Challenge" },
  science: { path: '/science', label: "Today's Science Challenge" },
}

function subjectConfig(subject) {
  const cfg = SUBJECTS[subject]
  if (!cfg) {
    const e = new Error(`Unknown Class 5 daily subject: ${subject}`)
    e.notFound = true
    throw e
  }
  return cfg
}

/**
 * Normalise an axios failure into the same shape the existing Class 5 screens
 * already understand: `err.auth` (signed out), `err.notFound` (nothing to play)
 * and `err.network` (try again).
 */
function toDailyError(error) {
  const status = error?.response?.status
  if (status === 401) {
    const e = new Error('signin')
    e.auth = true
    return e
  }
  if (status === 404) {
    const e = new Error('notfound')
    e.notFound = true
    return e
  }
  const e = new Error('network')
  e.network = true
  return e
}

/**
 * Today's challenge for one subject.
 *
 * Returns `{ question, solved, completed, attempts }`. `completed` means the
 * student finished today's puzzle; `solved` is kept for older callers.
 */
export async function getClass5Daily(subject) {
  const cfg = subjectConfig(subject)
  try {
    const res = await axios.get(`${cfg.path}/daily`, { timeout: 10000 })
    const data = res.data?.data
    if (!data || !data.question) {
      const e = new Error('notfound')
      e.notFound = true
      throw e
    }
    return {
      question: data.question,
      dateKey: data.dateKey || '',
      solved: Boolean(data.solved),
      completed: Boolean(data.completed ?? data.solved),
      attempts: data.attempts || 0,
    }
  } catch (error) {
    throw error?.notFound || error?.auth ? error : toDailyError(error)
  }
}

/**
 * Record an attempt at today's challenge.
 *
 * `correct` is what the student achieved in the renderer. The server is the
 * authority on whether that counts; for science it re-validates the pick itself.
 */
export async function completeClass5Daily(subject, questionId, correctOrPick) {
  const cfg = subjectConfig(subject)
  try {
    const res = await axios.post(
      `${cfg.path}/daily/complete`,
      { questionId, ...(subject === 'science' ? { pick: correctOrPick } : { correct: Boolean(correctOrPick) }) },
      { timeout: 10000 }
    )
    const data = res.data?.data || {}
    return {
      correct: Boolean(data.correct),
      solved: Boolean(data.solved),
      completed: Boolean(data.completed ?? data.solved),
      attempts: data.attempts || 0,
      hint: data.hint || '',
      explanation: data.explanation || '',
      answer: data.answer,
    }
  } catch (error) {
    throw error?.auth ? error : toDailyError(error)
  }
}

export default { getClass5Daily, completeClass5Daily }