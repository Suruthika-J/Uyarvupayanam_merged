import { useCallback, useEffect, useState } from 'react'
import { getClass5Daily, completeClass5Daily } from '../../../services/class5DailyService'

// ─── Shared state machine for the three Class 5 daily challenges ────────────
//
// Math Adventure, World Explorer and Science World each have their own themed
// screen and their own question renderer, but they all need the same five things:
// load today's challenge, expose loading/error/retry, know whether today is
// already finished, persist an answer, and reset for a new day. That lives here
// once; the three themed screens pass in their subject slug and their own
// completion callback.
//
// Deliberately NOT a hardcoded challenge: the question always comes from the
// server for the requested subject, so all three worlds work from their own bank
// and adding a fourth subject later needs no new state logic.

/**
 * @param {string} subject                 'maths' | 'social' | 'science'
 * @param {object} [options]
 * @param {boolean} [options.enabled]      Skip loading (e.g. logged out).
 * @param {Function} [options.onSignedOut] Called when the session has expired.
 */
export default function useDailyChallenge({ subject, enabled = true, onSignedOut } = {}) {
  const [question, setQuestion] = useState(null)
  const [dateKey, setDateKey] = useState('')
  const [completed, setCompleted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getClass5Daily(subject)
      setQuestion(data.question)
      setDateKey(data.dateKey)
      setCompleted(data.completed)
      setAttempts(data.attempts)
    } catch (err) {
      // An expired session is not a challenge failure - hand it to the caller.
      if (err?.auth) {
        setError(null)
        if (onSignedOut) onSignedOut()
        return
      }
      setQuestion(null)
      setError(
        err?.notFound
          ? "Today's challenge isn't ready yet. Come back soon!"
          : 'The daily challenge is taking a break. Tap to try again in a moment.'
      )
    } finally {
      setLoading(false)
    }
  }, [subject, enabled, onSignedOut])

  useEffect(() => {
    load()
  }, [load])

  /**
   * Persist an attempt. Marks the day complete when the server says so, so a
   * refresh cannot reset progress. Never throws: a failed save leaves the
   * student where they are with an inline message.
   */
  const submit = useCallback(
    async (correctOrPick) => {
      if (!question || saving) return null
      setSaving(true)
      try {
        const result = await completeClass5Daily(subject, question.id, correctOrPick)
        setCompleted(result.completed)
        setAttempts(result.attempts)
        return result
      } catch (err) {
        if (err?.auth && onSignedOut) onSignedOut()
        return { error: true, auth: Boolean(err?.auth) }
      } finally {
        setSaving(false)
      }
    },
    [question, saving, subject, onSignedOut]
  )

  /** Start the challenge over locally (after showing the explanation). */
  const reset = useCallback(() => setCompleted(false), [])

  return {
    question,
    dateKey,
    completed,
    attempts,
    loading,
    saving,
    error,
    reload: load,
    submit,
    reset,
  }
}