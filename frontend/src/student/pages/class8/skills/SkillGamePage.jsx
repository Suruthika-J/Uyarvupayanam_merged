import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { startAttempt, askHint, answerTask, completeAttempt } from '../../../services/skillsApi'
import TaskRenderer from '../../../components/class8/skills/TaskRenderers'
import CompletionPanel from '../../../components/class8/skills/CompletionPanel'
import SkillIcon from '../../../components/class8/skills/SkillIcon'
import './skills.css'

const DIAG_COLOR = '#1a7a50'

export default function SkillGamePage({ mode = 'play' }) {
  const { skillId, activityId } = useParams()
  const [params] = useSearchParams()
  const level = Number(params.get('level')) || 1
  const nav = useNavigate()

  const [phase, setPhase] = useState(mode === 'diagnostic' ? 'intro' : 'loading') // intro|loading|playing|done|error
  const [payload, setPayload] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [tasks, setTasks] = useState([])
  const [taskState, setTaskState] = useState({}) // i -> { answered, correct, hintUsed }
  const [hints, setHints] = useState({}) // i -> hint text for this task
  const [hintCount, setHintCount] = useState(0)
  const [hintLimit, setHintLimit] = useState(2)
  const [current, setCurrent] = useState(0)
  const [feedback, setFeedback] = useState(null) // { kind: 'good'|'bad'|'info', text, explanation, autoNext }
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [lockedMsg, setLockedMsg] = useState(null)
  const [meta, setMeta] = useState({ selfRating: null, note: '' })
  const [, setTick] = useState(0)
  const payloadRef = useRef(null)
  payloadRef.current = payload

  const catColor = mode === 'diagnostic' ? DIAG_COLOR : '#1a7a50'

  const begin = useCallback(async () => {
    setPhase('loading')
    setError(null)
    setLockedMsg(null)
    try {
      const body = mode === 'diagnostic'
        ? { skillId: 'diagnostic', activityId: 'diagnostic', mode: 'diagnostic' }
        : { skillId, activityId, level, mode: 'play' }
      const res = await startAttempt(body)
      if (res.locked) { setLockedMsg(res.message || 'This level is still locked.'); setPhase('error'); return }
      const p = res
      setPayload(p)
      setAttempt(p.attempt)
      setTasks(p.tasks)
      setHintCount(p.attempt.hintCount || 0)
      setHintLimit(p.attempt.hintLimit || 2)
      const st = {}
      ;(p.savedAnswers || []).forEach((r) => {
        st[r.taskIndex] = { answered: true, correct: r.correct, hintUsed: r.hintUsed }
        if (r.hintUsed) setHintCount((c) => Math.max(c, p.attempt.hintCount || 0))
      })
      setTaskState(st)
      const firstUnanswered = p.tasks.findIndex((_, i) => !st[i])
      setCurrent(firstUnanswered === -1 ? 0 : firstUnanswered)
      setPhase(firstUnanswered === -1 && p.tasks.length === 0 ? 'done' : 'playing')
    } catch (e) {
      if (e.code === 'LOCKED') setLockedMsg(e.message)
      else {
        setError(e)
      }
      setPhase('error')
    }
  }, [mode, skillId, activityId, level])

  useEffect(() => { begin() }, [begin])

  const nextUnanswered = () => {
    let i = tasks.findIndex((_, idx) => !taskState[idx])
    if (i === -1) i = tasks.length ? Math.min(current + 1, tasks.length - 1) : 0
    setCurrent(i)
  }

  const allAnswered = tasks.length > 0 && tasks.every((_, i) => taskState[i])

  const onAnswer = async (value) => {
    if (sending || !attempt) return
    setSending(true)
    setFeedback(null)
    try {
      const res = await answerTask(attempt._id, current, value)
      const isPractice = ['speak', 'create'].includes(tasks[current]?.type)
      setTaskState((st) => ({
        ...st,
        [current]: { answered: true, correct: res.correct, hintUsed: res.hintUsed },
      }))
      setHintCount(res.hintCount)
      if (isPractice) {
        setFeedback({ kind: 'info', text: 'Practice logged — every try counts as growth. Well done giving it a go!' })
        const i = tasks.findIndex((_, idx) => !taskState[idx] && idx !== current)
        if (i !== -1) setCurrent(i)
        else setCurrent((c) => Math.min(c + 1, tasks.length - 1))
      } else if (res.correct) {
        setFeedback({ kind: 'good', text: 'Correct!', explanation: res.explanation })
      } else {
        setFeedback({ kind: 'bad', text: 'Not quite — have another go. You can try as many times as you like.' })
      }
      setTick((t) => t + 1)
    } catch (e) {
      setFeedback({ kind: 'bad', text: e.message || 'Something went wrong saving your answer. Try again.' })
    } finally {
      setSending(false)
    }
  }

  const onHint = async () => {
    if (!attempt || sending) return
    setSending(true)
    try {
      const res = await askHint(attempt._id, current)
      setHints((h) => ({ ...h, [current]: res.hint }))
      setHintCount((c) => c + 1)
      setFeedback({ kind: 'info', text: 'Hint used. Hints still count the mission — they just trim the evidence weight slightly.' })
    } catch (e) {
      if (e.code === 'HINT_LIMIT') setFeedback({ kind: 'bad', text: e.message })
      else setFeedback({ kind: 'bad', text: e.message || 'Could not reveal the hint.' })
    } finally {
      setSending(false)
    }
  }

  const finish = async () => {
    if (sending || !attempt) return
    setSending(true)
    setError(null)
    try {
      const res = await completeAttempt(attempt._id, {
        answers: [],
        meta: { selfRating: meta.selfRating, note: meta.note },
        durationMs: payloadRef.current?.startedAt
          ? Math.max(0, Date.now() - new Date(payloadRef.current.startedAt).getTime())
          : undefined,
      })
      setResult(res)
      setPhase('done')
    } catch (e) {
      setError(e)
    } finally {
      setSending(false)
    }
  }

  /* ── diagnostic intro ── */
  if (phase === 'intro') {
    return (
      <div className="skills-page">
        <div className="skills-inner">
          <div className="sk-diag-intro">
            <div className="emoji">🧭</div>
            <h1>Skill Starter Diagnostic</h1>
            <p>Eight quick games — one for each skill area — to map your current strengths. It takes about 5 minutes and you can pause any time; your progress is saved.</p>
            <div className="caps">
              {['💬 Communication', '🧠 Logical thinking', '💻 Digital', '🎨 Creativity', '🤝 Social', '🏡 Life skills', '🌿 Environment', '🔬 Science'].map((c) => (
                <span key={c} className="sk-capsule">{c}</span>
              ))}
            </div>
            <p className="note">No marking, no pass or fail — this snapshot only helps us suggest where to start.</p>
            <div className="sk-game-foot" style={{ justifyContent: 'center' }}>
              <button type="button" className="sk-btn amber" onClick={begin}>▶ Start the diagnostic</button>
              <Link className="sk-btn ghost" to="/student/class8/skills">← Back to skills</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="skills-page"><div className="skills-inner"><div className="sk-state"><span className="emoji">⏳</span><h3>Loading your mission…</h3><p>Getting your games ready.</p></div></div></div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="skills-page">
        <div className="skills-inner">
          <div className="sk-state">
            <span className="emoji">{lockedMsg ? '🔒' : '⚠️'}</span>
            <h3>{lockedMsg ? 'Level locked' : 'Could not start this mission'}</h3>
            <p>{lockedMsg || (error && (error.message || 'Please check your connection and try again.'))}</p>
            <div className="sk-game-foot" style={{ justifyContent: 'center' }}>
              <button type="button" className="sk-btn" onClick={begin}>↺ Try again</button>
              <Link className="sk-btn ghost" to={mode === 'diagnostic' ? '/student/class8/skills' : `/student/class8/skills/${skillId}`}>← Back</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="skills-page">
        <div className="skills-inner sk-game">
          <CompletionPanel
            summary={result?.summary || (attempt ? { mode, skillId: attempt.skillId, activityId: attempt.activityId, activityTitle: attempt.activityTitle, categoryName: attempt.categoryName, score: attempt.score, stars: attempt.stars, totalTasks: attempt.totalTasks } : {})}
            encouragement={result?.encouragement}
            milestones={result?.newlyEarnedMilestones}
            recommendation={result?.recommendation}
            nextUnlocked={result?.nextUnlocked ?? null}
            catColor={catColor}
            onReplay={() => begin()}
          />
        </div>
      </div>
    )
  }

  /* ── playing ── */
  const task = tasks[current]
  const st = taskState[current] || {}
  // Solved (or a practice step marked done) → lock the widget. A wrong answer
  // keeps the task live so the student can retry as many times as they like.
  const locked = st.correct === true
  const catName = attempt?.categoryName || ''
  const backTarget = mode === 'diagnostic' ? '/student/class8/skills' : `/student/class8/skills/${skillId}`
  const answeredCount = tasks.filter((_, i) => taskState[i]).length
  const progressPct = tasks.length ? Math.round((answeredCount / tasks.length) * 100) : 0
  const hintAllowed = task?.hintAllowed !== false && !st.hintUsed && !locked && hintCount < hintLimit && !sending

  return (
    <div className="skills-page">
      <div className="skills-inner sk-game">
        <div className="sk-game-top">
          <div className="crumbs">
            <Link to={backTarget}>← {mode === 'diagnostic' ? 'Skills' : catName || 'Skills'}</Link>
            <span>/</span>
            <span>{attempt?.activityTitle || 'Game'}</span>
            {mode !== 'diagnostic' && <span className="sk-chip ink">Level {attempt?.level}</span>}
            {mode === 'diagnostic' && <span className="sk-chip amber">Diagnostic</span>}
          </div>
          <div className="crumbs">
            <span className="sk-chip">{catName || 'All 8 skills'}</span>
          </div>
        </div>

        <div className="sk-progress"><div className="fill" style={{ width: `${progressPct}%` }} /></div>
        <div className="sk-progress-label">
          <span>Step {current + 1} of {tasks.length}</span>
          <span>{answeredCount}/{tasks.length} done · hints {hintCount}/{hintLimit}</span>
        </div>

        {error && <div className="sk-error" style={{ marginBottom: 12 }}>⚠ {error.message || 'Something went wrong.'}<button type="button" className="sk-btn small" style={{ marginLeft: 8 }} onClick={() => setError(null)}>Dismiss</button></div>}

        {task && (
          <div className="sk-task-card">
            <div className="sk-task-kicker">
              <span className="l">
                <span style={{ color: catColor }}>◆</span>
                {mode === 'diagnostic' ? 'Diagnostic · ' : ''}{task.cognitiveType?.replace(/_/g, ' ') || 'Practice'}
              </span>
              {hintAllowed && (
                <button type="button" className="sk-btn ghost small" onClick={onHint} disabled={sending}>💡 Hint ({hintLimit - hintCount} left)</button>
              )}
              {st.hintUsed && <span className="sk-chip amber">Hint used</span>}
            </div>
            <p className="sk-task-prompt">{task.prompt}</p>
            <TaskRenderer task={task} locked={locked} onAnswer={onAnswer} />
            {hints[current] && <div className="sk-feed info"><span className="ic">💡</span><span><b>Hint:</b> {hints[current]}</span></div>}
            {feedback && feedback.text && (
              <div className={`sk-feed ${feedback.kind}`}>
                <span className="ic">{feedback.kind === 'good' ? '✅' : feedback.kind === 'bad' ? '💭' : 'ℹ️'}</span>
                <div>
                  <div>{feedback.text}</div>
                  {feedback.explanation && <div style={{ marginTop: 4, fontSize: 12.5, opacity: 0.9 }}>Why: {feedback.explanation}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="sk-game-foot">
          {current > 0 && !locked && (
            <button type="button" className="sk-btn ghost small" onClick={() => setCurrent((c) => c - 1)} disabled={sending}>← Previous</button>
          )}
          <span className="sk-spacer" />
          <Link className="sk-btn ghost small" to={backTarget} style={{ textDecoration: 'none' }}>Save &amp; exit</Link>
          {feedback && feedback.kind === 'good' && !allAnswered && (
            <button type="button" className="sk-btn" onClick={nextUnanswered}>Next step →</button>
          )}
          {feedback && feedback.kind === 'good' && allAnswered && current === tasks.length - 1 && (
            <button type="button" className="sk-btn amber" onClick={finish} disabled={sending}>
              {sending ? 'Saving…' : '🏁 Finish mission'}
            </button>
          )}
          {allAnswered && (!feedback || feedback.kind !== 'good' || current !== tasks.length - 1) && (
            <button type="button" className="sk-btn amber" onClick={finish} disabled={sending}>
              {sending ? 'Saving…' : '🏁 Finish mission'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}