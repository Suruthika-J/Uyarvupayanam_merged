import React, { useEffect, useMemo, useState } from 'react'
import {
  FiAward, FiBookOpen, FiCheck, FiChevronRight, FiEye,
  FiLoader, FiLock, FiMap, FiRefreshCw, FiStar, FiSun, FiTarget, FiZap,
} from 'react-icons/fi'
import MissionGuide from '../../../components/class8/MissionGuide'
import MissionIntro from '../../../components/class8/MissionIntro'
import Planet from '../../../components/class8/Planet'
import { StarsRow } from '../../../components/class8/Stars'
import AnswerOption from '../../../components/class8/AnswerOption'
import XPReward from '../../../components/class8/XPReward'
import FractionVisual from '../../../components/class8/FractionVisual'
import {
  getMathsExplanation,
  getMathsHint,
  getMathsMissionSession,
  submitMathsAnswer,
} from '../../../services/mathsMissionsApi'

const ACCENT = '#1a7a50'
const ACCENT_DEEP = '#145c3d'
const INK = '#0f172a'
const MUTED = '#5b6b80'
const SOFT_BG = '#e6f4ec'
const GOLD = '#b45309'
const SOFT_AMBER = '#fdf3e3'
const AMBER_EDGE = '#eccd97'

// Stepper labels for the mission journey (session steps).
function stepLabel(step) {
  if (step.type === 'concept') return 'Concept'
  if (step.type === 'example') return 'Example'
  if (step.slot === 'boss') return 'Master'
  return `Q${step.order}`
}

const DIFFICULTY_TAG = { easy: 'Easy', medium: 'Medium', challenge: 'Application' }

// Per-question renderers — every questionType the API supports.
function QuestionInputs({ step, selected, setSelected, inputValue, setInputValue, order, setOrder, busy }) {
  const type = step.questionType
  const options = step.options || []

  // Tap-to-order for arrange-steps / drag-and-drop (accessible + mobile).
  if (type === 'arrange-steps' || type === 'drag-and-drop') {
    const remaining = options.filter((o) => !order.includes(o))
    const toggle = (opt) => setOrder((cur) => (cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]))
    return (
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: INK, marginBottom: 10 }}>
          Tap the cards in the correct order · {order.length}/{options.length} placed
        </div>
        {order.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {order.map((opt, i) => (
              <button
                key={`${i}-${opt}`}
                type="button"
                onClick={() => toggle(opt)}
                aria-label={`Remove step ${i + 1}: ${opt}`}
                style={{
                  background: SOFT_BG, border: `1.5px solid ${ACCENT}`, borderRadius: 99,
                  padding: '8px 14px', fontSize: 14.5, fontWeight: 800, color: ACCENT_DEEP,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 99, background: ACCENT, color: '#fff',
                  display: 'grid', placeItems: 'center', fontSize: 12.5,
                }}>{i + 1}</span>
                {opt}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {remaining.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="hover-lift"
              style={{
                textAlign: 'left', background: '#fff', border: '1.5px solid var(--s-border)',
                borderRadius: 14, padding: '14px 18px', fontSize: 16, fontWeight: 700, color: INK,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 8, background: '#eef2f5', color: MUTED,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <FiSun size={13} />
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Option cards — multiple-choice, true-false, find-the-mistake,
  // and word-problems that carry options.
  if (
    type === 'multiple-choice' ||
    type === 'true-false' ||
    type === 'find-the-mistake' ||
    (type === 'word-problem' && options.length > 0)
  ) {
    return (
      <div role="radiogroup" aria-label="Choose an answer" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options.map((opt, i) => (
          <AnswerOption key={`${opt}-${i}`} option={opt} index={i} selected={selected} onSelect={setSelected} />
        ))}
      </div>
    )
  }

  // Typed answers — numeric-input, fill-in-the-blank, and word-problems
  // without options.
  return (
    <div>
      <label
        htmlFor={`answer-${step.questionId}`}
        style={{ display: 'block', fontSize: 14, fontWeight: 800, color: MUTED, marginBottom: 8 }}
      >
        {type === 'numeric-input' ? 'Type your answer' : 'Type the missing value'}
      </label>
      <input
        id={`answer-${step.questionId}`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur()
        }}
        autoComplete="off"
        aria-label="Your answer"
        placeholder={type === 'numeric-input' ? 'e.g. 3/4' : 'type here'}
        style={{
          width: '100%', padding: '15px 18px', fontSize: 19, fontWeight: 800, color: INK,
          border: '2px solid var(--s-border)', borderRadius: 14, outline: 'none',
          background: '#fff', boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.target.style.borderColor = ACCENT)}
        onBlur={(e) => (e.target.style.borderColor = 'var(--s-border)')}
      />
    </div>
  )
}

// ── The mission player itself ──────────────────────────────────────────────
export default function MathsMissionFlow({
  topicId,
  missionId,
  mission,
  topicWorldName = '',
  worldAccent = ACCENT,
  onProgressChange,
  onMissionComplete,
  onExit,
  onPlanetComplete,
}) {
  const [session, setSession] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [started, setStarted] = useState(false)

  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [earnedTotal, setEarnedTotal] = useState(0)
  const [latestProgress, setLatestProgress] = useState(null)

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('idle') // idle | correct | wrong
  const [wrongCount, setWrongCount] = useState(0)
  const [hintLevel, setHintLevel] = useState(0)
  const [hintText, setHintText] = useState('')
  const [hintLoading, setHintLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [teacherAnswer, setTeacherAnswer] = useState('')
  const [selected, setSelected] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [order, setOrder] = useState([])
  const [lastEarned, setLastEarned] = useState(0)
  const [finishInfo, setFinishInfo] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const steps = session ? session.steps : []
  const step = steps[stepIndex] || null

  // Question counters for the "Question X of Y" game-challenge header.
  const questionSteps = steps.filter((s) => s.type === 'question')
  const qTotal = questionSteps.length
  const qIndex = step ? questionSteps.findIndex((s) => s === step) + 1 : 0
  const isBossStep = Boolean(step && step.slot === 'boss')

  // Intro card meta: prefer the mission node passed by the planet page; fall
  // back to session mission data for deep links.
  const introMeta = useMemo(() => {
    if (!session && !mission) return null
    const m = mission || (session ? session.mission : {}) || {}
    const sm = session && session.mission ? session.mission : {}
    const order = m.order || sm.order || 1
    return {
      name: m.name || sm.name || 'Mission',
      tagline: m.tagline || sm.tagline || '',
      reward: m.reward || sm.reward || 'Mission Card',
      isBoss: Boolean(m.isBoss),
      order,
    }
  }, [session, mission])

  useEffect(() => {
    let cancelled = false
    setLoadState('loading')
    setLoadError(null)
    setStarted(false)
    setFinishInfo(null)
    setFinished(false)
    setEarnedTotal(0)
    setLatestProgress(null)
    getMathsMissionSession(topicId, missionId)
      .then((data) => {
        if (cancelled) return
        setSession(data)
        setLatestProgress(data.progress)
        setLoadState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err)
        setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [topicId, missionId])

  // Reset per-step interaction when the step changes.
  useEffect(() => {
    setBusy(false)
    setStatus('idle')
    setWrongCount(0)
    setHintLevel(0)
    setHintText('')
    setRevealed(false)
    setExplanation('')
    setTeacherAnswer('')
    setSelected(null)
    setInputValue('')
    setOrder([])
    setLastEarned(0)
    setSubmitError('')
  }, [stepIndex])

  // After two wrong tries, bring the teacher explanation in.
  useEffect(() => {
    if (status === 'wrong' && wrongCount >= 2 && !revealed && step && step.type === 'question') {
      getMathsExplanation(step.questionId)
        .then((res) => {
          setExplanation(res.explanation || '')
          setTeacherAnswer(res.answer || '')
          setRevealed(true)
        })
        .catch(() => {})
    }
  }, [status, wrongCount, revealed, step])

  const isQuestion = step && step.type === 'question'
  const answerValue = () => {
    if (!isQuestion) return null
    switch (step.questionType) {
      case 'numeric-input':
      case 'fill-in-the-blank':
        return inputValue.trim()
      case 'arrange-steps':
      case 'drag-and-drop':
        return order.length >= (step.options || []).length ? order : null
      case 'word-problem':
        return step.options && step.options.length ? selected : inputValue.trim()
      default:
        return selected
    }
  }

  const canSubmit = () => {
    if (!isQuestion) return false
    switch (step.questionType) {
      case 'numeric-input':
      case 'fill-in-the-blank':
        return inputValue.trim() !== ''
      case 'arrange-steps':
      case 'drag-and-drop':
        return order.length >= (step.options || []).length
      case 'word-problem':
        return step.options && step.options.length ? selected !== null : inputValue.trim() !== ''
      default:
        return selected !== null
    }
  }

  async function submitAnswer() {
    if (!isQuestion || !canSubmit() || busy) return
    setBusy(true)
    setSubmitError('')
    try {
      const res = await submitMathsAnswer(step.questionId, answerValue(), hintLevel)
      if (res.correct) {
        setLastEarned(res.earned || 0)
        setEarnedTotal((t) => t + (res.earned || 0))
        setExplanation(res.explanation || '')
        setStatus('correct')
        setLatestProgress(res.progress)
        if (onProgressChange) onProgressChange(res.progress)
        if (res.missionCompleted || res.justCompletedTopic) {
          setFinishInfo({
            missionCompleted: res.missionCompleted,
            topicCompleted: res.topicCompleted,
            justCompletedTopic: res.justCompletedTopic,
            nextMission: res.nextMission,
            nextTopic: res.nextTopic,
            missionName: res.missionName || session.mission.name,
            reward: session.mission.reward,
            stars: res.stars || 0,
          })
        }
      } else {
        setStatus('wrong')
        setWrongCount((w) => w + 1)
      }
    } catch (err) {
      setSubmitError(err && err.network ? 'The learning hub is taking a short break — try again in a moment.' : 'Something went wrong while checking your answer. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function requestHint() {
    if (!isQuestion || hintLevel >= 2 || hintLoading) return
    setHintLoading(true)
    try {
      const res = await getMathsHint(step.questionId)
      setHintLevel(res.hintLevel)
      setHintText(res.hint || '')
    } catch {
      setHintText('Count the equal parts in the visual carefully, then check your top and bottom numbers.')
      setHintLevel((h) => (h === 0 ? 1 : h))
    } finally {
      setHintLoading(false)
    }
  }

  function tryAgain() {
    setStatus('idle')
    setSelected(null)
    setInputValue('')
    setOrder([])
  }

  function handleContinue() {
    if (stepIndex + 1 >= steps.length) {
      setFinished(true)
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  // ── Loading / error states ──────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 20, padding: '60px 24px', textAlign: 'center', boxShadow: 'var(--s-shadow)' }}>
        <div style={{ margin: '0 auto 14px', width: 38, height: 38, color: ACCENT }} className="mm-spin">
          <FiLoader size={38} strokeWidth={2.4} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>Preparing your mission…</div>
        <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>Fetching the concept, example and questions.</div>
      </div>
    )
  }

  if (loadState === 'error') {
    const net = loadError && loadError.network
    return (
      <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--s-shadow)' }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: '#f1f5f9', color: MUTED, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <FiMap size={26} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: INK, margin: '0 0 8px' }}>
          {net ? 'The mission hub is resting' : 'Mission not found'}
        </h3>
        <p style={{ fontSize: 15, color: MUTED, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
          {net
            ? 'We could not reach the learning hub right now. Check your connection and try again — your progress is safe.'
            : loadError && loadError.auth
              ? 'Please sign in to play Maths Missions.'
              : 'This mission is not on the map yet. Check back soon.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              // Re-run the session fetch (remount keyed by a counter would also work;
              // a reload is the simplest robust retry here).
              window.location.reload()
            }}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FiRefreshCw size={15} /> Try again
          </button>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              style={{ background: '#fff', color: ACCENT, border: '1.5px solid var(--s-border)', borderRadius: 12, padding: '11px 22px', fontSize: 15.5, fontWeight: 800, cursor: 'pointer' }}
            >
              Back to mission path
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Intro stage: ONE mission, ONE obvious action — "Launch mission" ─────
  // The learn / example / questions stay hidden until the explorer launches.
  if (!started && introMeta) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }} className="mm-rise">
        <MissionIntro
          mission={introMeta}
          topicWorldName={topicWorldName}
          worldAccent={worldAccent}
          onStart={() => setStarted(true)}
          onBack={onExit}
        />
      </div>
    )
  }

  // ── Finished: mission complete / reviewed ───────────────────────────────
  if (finished) {
    const mc = finishInfo && finishInfo.missionCompleted
    const pt = finishInfo && finishInfo.topicCompleted
    const mastery = latestProgress ? latestProgress.masteryPercentage : 0
    const bossCleared = Boolean(mc && session && session.mission && session.mission.isBoss)
    return (
      <div className="mm-achievement" style={{ background: '#fff', border: '1.5px solid #b7dcc9', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px -30px rgba(26,122,80,0.45)' }}>
        <div style={{ background: bossCleared
          ? `radial-gradient(600px 220px at 50% -40%, rgba(245,158,11,0.5) 0%, rgba(245,158,11,0) 65%), linear-gradient(135deg, ${worldAccent} 0%, ${worldAccent}bb 100%)`
          : `linear-gradient(135deg, ${worldAccent} 0%, ${worldAccent}bb 100%)`, padding: '46px 28px 38px', textAlign: 'center', color: '#fff' }}>
          <div className="mm-float" style={{ width: 74, height: 74, borderRadius: '50%', background: bossCleared ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', border: bossCleared ? '2px solid rgba(245,158,11,0.85)' : '2px solid rgba(255,255,255,0.35)' }}>
            <FiAward size={34} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: bossCleared ? '#ffe9a8' : undefined, opacity: bossCleared ? 1 : 0.9 }}>
            {mc ? (bossCleared ? 'Boss defeated' : 'Mission complete') : 'Mission reviewed'}
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 900, margin: '8px 0 6px', letterSpacing: '-0.02em' }}>
            {session.mission.name}
          </h2>
          <div style={{ fontSize: 15.5, opacity: 0.92 }}>
            {bossCleared
              ? `The final challenge of ${topicWorldName} is down — the whole planet is yours!`
              : mc
                ? `You made it through every step — the mission is conquered.`
                : 'You worked through every step again. Solid practice!'}
          </div>
        </div>

        <div style={{ padding: '30px 28px 34px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ background: '#f6fbf8', border: '1px solid #d9e6df', borderRadius: 14, padding: '14px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: MUTED }}>XP this run</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT, marginTop: 2 }}>+{earnedTotal}</div>
            </div>
            <div style={{ background: '#f6fbf8', border: '1px solid #d9e6df', borderRadius: 14, padding: '14px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: MUTED }}>Topic mastery</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT_DEEP, marginTop: 2 }}>{mastery}%</div>
            </div>
            {mc && finishInfo.stars > 0 && (
              <div style={{ background: '#fff8ec', border: '1px solid #eccd97', borderRadius: 14, padding: '11px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: GOLD }}>Star rating</div>
                <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                  <StarsRow value={finishInfo.stars} size={24} label={false} />
                </div>
              </div>
            )}
            {mc && finishInfo.reward && (
              <div className="mm-achievement" style={{ background: '#fff8ec', border: '1.5px solid #eccd97', borderRadius: 14, padding: '12px 22px', textAlign: 'center', boxShadow: '0 10px 24px -14px rgba(180,83,9,0.4)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Achievement unlocked</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#92400e', marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FiStar size={16} color={GOLD} /> {finishInfo.reward}
                </div>
              </div>
            )}
          </div>

          {pt && (
            <div className="mm-achievement" style={{ background: `radial-gradient(760px 300px at 18% -20%, ${worldAccent}44 0%, rgba(255,255,255,0) 62%), linear-gradient(160deg, #181d47 0%, #0c1128 100%)`, border: '1.5px solid rgba(245,158,11,0.7)', borderRadius: 20, padding: '26px 22px', marginBottom: 22, textAlign: 'center', color: '#fff' }}>
              <div className="mm-float" style={{ display: 'flex', justifyContent: 'center' }}>
                <Planet kind="planet" accent={worldAccent} size={94} glow />
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#fde68a', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 10 }}>
                Planet complete
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>
                {topicWorldName || 'This planet'} conquered!
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 1.65 }}>
                You beat every mission and earned the topic bonus.{' '}
                {finishInfo.nextTopic ? (
                  <React.Fragment>
                    The trail continues to <strong style={{ color: '#fde68a' }}>{finishInfo.nextTopic.worldName}</strong> — the next planet just unlocked!
                  </React.Fragment>
                ) : (
                  'You cleared the entire Maths Galaxy — claim the trophy on the map!'
                )}
              </div>
              {finishInfo.nextTopic ? (
                <button
                  type="button"
                  onClick={() => onPlanetComplete && onPlanetComplete(finishInfo.nextTopic)}
                  style={{ marginTop: 18, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 30px', fontSize: 16.5, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 14px 30px -14px rgba(245,158,11,0.8)' }}
                >
                  Visit {finishInfo.nextTopic.worldName} <FiChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onExit}
                  style={{ marginTop: 18, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 30px', fontSize: 16.5, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9 }}
                >
                  <FiAward size={17} /> Claim the trophy
                </button>
              )}
            </div>
          )}

          <MissionGuide
            message={
              mc
                ? `Superb work! You earned the "${session.mission.reward}" card. ${finishInfo.nextMission ? `Ready for "${finishInfo.nextMission.name}"?` : 'Every mission here is done — take a look at the map!'}`
                : 'Great practice! Replaying keeps the ideas fresh. Want to go again or look at the mission path?'
            }
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
            {finishInfo && finishInfo.nextMission && (
              <button
                type="button"
                onClick={() => onMissionComplete && onMissionComplete(finishInfo.nextMission)}
                style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 17, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 14px 30px -14px rgba(26,122,80,0.6)' }}
              >
                Next mission: {finishInfo.nextMission.name} <FiChevronRight size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              style={{ background: '#fff', color: ACCENT, border: '1.5px solid var(--s-border)', borderRadius: 14, padding: '13px 24px', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <FiMap size={16} /> Mission path
            </button>
            <button
              type="button"
              onClick={() => {
                // Replay the same mission from the start (review mode).
                setFinished(false)
                setStepIndex(0)
                setEarnedTotal(0)
                setFinishInfo(null)
              }}
              style={{ background: '#fff', color: ACCENT_DEEP, border: '1.5px solid #b7dcc9', borderRadius: 14, padding: '13px 24px', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <FiRefreshCw size={16} /> Play again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!step) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: MUTED }}>
        No steps for this mission yet.
      </div>
    )
  }

  // ── In-mission cards ────────────────────────────────────────────────────
  const stepper = steps.map((s, i) => {
    const done = i < stepIndex
    const current = i === stepIndex
    return (
      <React.Fragment key={`${s.type}-${s.order || s.slot}-${i}`}>
        {i > 0 && (
          <div style={{ width: 14, height: 2, background: done ? ACCENT : '#dbe4ee', flexShrink: 0 }} aria-hidden="true" />
        )}
        <div
          aria-current={current ? 'step' : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            padding: '7px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 900,
            background: done ? SOFT_BG : current ? ACCENT : '#f1f5f9',
            border: `1.5px solid ${current ? ACCENT : done ? '#b7dcc9' : 'var(--s-border)'}`,
            color: current ? '#fff' : done ? ACCENT_DEEP : '#94a3b8',
          }}
        >
          {done ? <FiCheck size={13} /> : current ? <FiTarget size={13} /> : <span />}
          {stepLabel(s)}
        </div>
      </React.Fragment>
    )
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 6 }}>
        {stepper}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, fontWeight: 800, color: MUTED, marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <span>
          Step {stepIndex + 1} of {steps.length}
        </span>
        {isQuestion && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: '#f1f5f9', borderRadius: 99, padding: '3px 10px', fontSize: 11.5, fontWeight: 900, color: INK }}>
              Question {qIndex} of {qTotal}
            </span>
            <span>{step.goal}</span> · <span style={{ color: ACCENT }}>{DIFFICULTY_TAG[step.difficulty] || 'Challenge'}</span>
            {step.realLife && (
              <span style={{ background: '#fff8ec', color: GOLD, borderRadius: 99, padding: '3px 10px', fontSize: 11.5, fontWeight: 900, border: '1px solid #eccd97' }}>
                Real-life challenge
              </span>
            )}
          </span>
        )}
      </div>

      {/* Concept / Example / Question card */}
      {step.type !== 'question' ? (
        <div className="mm-fade-in" style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 22, padding: '30px 28px 34px', boxShadow: 'var(--s-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 13, background: SOFT_BG, color: ACCENT,
              display: 'grid', placeItems: 'center',
            }}>
              {step.type === 'concept' ? <FiBookOpen size={19} /> : <FiEye size={19} />}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {step.type === 'concept' ? 'Learn first' : 'A simple example'}
              </div>
              <h3 style={{ fontSize: 23, fontWeight: 900, color: INK, margin: 0 }}>{step.heading}</h3>
            </div>
          </div>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: '#334155', margin: '0 0 16px' }}>{step.body}</p>

          {Array.isArray(step.points) && step.points.length > 0 && (
            <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {step.points.map((p, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.55, color: '#334155' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 8, background: SOFT_BG, color: ACCENT,
                    display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}

          {step.visual && (
            <div style={{ background: '#f6fbf8', border: '1px solid #d9e6df', borderRadius: 16, padding: '22px' }}>
              <FractionVisual visual={step.visual} />
            </div>
          )}

          {step.exampleLine && (
            <div className="mm-feedback-pop" style={{ marginTop: 16, background: SOFT_BG, border: '1px solid #b7dcc9', borderRadius: 13, padding: '12px 16px', fontSize: 16, fontWeight: 800, color: ACCENT_DEEP, textAlign: 'center' }}>
              {step.exampleLine}
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <MissionGuide
              message={
                step.type === 'concept'
                  ? 'Let us understand this together before we solve anything. Read it once — the examples are coming right up.'
                  : 'This example shows the idea slowly. Spot the pattern, then we will try one together.'
              }
              size="sm"
            />
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <button
                type="button"
                onClick={handleContinue}
                style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 34px', fontSize: 17, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 14px 30px -14px rgba(26,122,80,0.55)' }}
              >
                {step.type === 'concept' ? 'Got it — show me the example' : 'I see it — let me try'} <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mm-fade-in" style={{
          background: isBossStep ? 'linear-gradient(165deg, #fffdf5, #ffffff)' : '#fff',
          border: isBossStep ? '1.5px solid #eccd97' : '1px solid var(--s-border)',
          borderRadius: 22, padding: isBossStep ? '32px 30px 36px' : '30px 28px 34px',
          boxShadow: isBossStep ? '0 22px 50px -28px rgba(180,83,9,0.55)' : 'var(--s-shadow)',
        }}>
          {session.adaptive && step.order === 3 && (
            <div style={{ background: '#f0f7ff', border: '1px solid #c7ddf5', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 16 }}>
              We are giving you a slightly easier version of this question to build your confidence — you have got this.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: isBossStep ? '#b45309' : ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {isBossStep ? <FiAward size={15} /> : <FiZap size={14} />} {isBossStep ? 'Final challenge' : `Mission ${step.order}`}
            </div>
            {isBossStep && (
              <span style={{ background: '#fff7e6', border: '1px solid #eccd97', color: '#b45309', borderRadius: 99, padding: '4px 12px', fontSize: 11.5, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <FiAward size={12} /> Master Challenge
              </span>
            )}
          </div>
          <h3 style={{ fontSize: isBossStep ? 28 : 26, fontWeight: 900, color: INK, lineHeight: 1.4, letterSpacing: '-0.015em', margin: '0 0 4px', whiteSpace: 'pre-line' }}>
            {step.questionType === 'find-the-mistake' ? step.question.split('\n')[0] : step.question}
          </h3>

          {step.questionType === 'find-the-mistake' && (
            <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 14, padding: '16px 20px', margin: '14px 0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 15, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
              {step.question}
            </div>
          )}

          {step.visual && step.questionType !== 'find-the-mistake' && (
            <div style={{ background: '#f6fbf8', border: '1px solid #d9e6df', borderRadius: 16, padding: '20px', margin: '16px 0' }}>
              <FractionVisual visual={step.visual} />
            </div>
          )}

          {/* Interactive input area */}
          {status === 'idle' && (
            <div className="mm-fade-in" style={{ marginTop: 20 }}>
              <QuestionInputs
                step={step}
                selected={selected}
                setSelected={setSelected}
                inputValue={inputValue}
                setInputValue={setInputValue}
                order={order}
                setOrder={setOrder}
                busy={busy}
              />

              {hintText && (
                <div className="mm-feedback-pop" style={{ marginTop: 14, background: '#f0f7ff', border: '1px solid #c7ddf5', borderRadius: 13, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <FiSun size={16} color="#1d4ed8" style={{ marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Hint {hintLevel}</div>
                    <div style={{ fontSize: 15.5, color: '#334155', lineHeight: 1.55 }}>{hintText}</div>
                  </div>
                </div>
              )}

              {submitError && (
                <div style={{ marginTop: 12, background: '#fdf3e3', border: '1px solid #eccd97', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={!canSubmit() || busy}
                  onClick={submitAnswer}
                  style={{
                    background: canSubmit() && !busy ? ACCENT : '#cbd5e1',
                    color: canSubmit() && !busy ? '#fff' : '#64748b',
                    border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 16.5, fontWeight: 900,
                    cursor: canSubmit() && !busy ? 'pointer' : 'not-allowed',
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    boxShadow: canSubmit() && !busy ? '0 14px 30px -14px rgba(26,122,80,0.55)' : 'none',
                  }}
                >
                  {busy ? <FiLoader size={17} className="mm-spin" /> : <FiZap size={17} />} Check answer
                </button>
                <button
                  type="button"
                  onClick={requestHint}
                  disabled={hintLoading || hintLevel >= 2}
                  style={{
                    background: '#fff', color: ACCENT, border: '1.5px solid var(--s-border)',
                    borderRadius: 14, padding: '13px 22px', fontSize: 15.5, fontWeight: 800,
                    cursor: hintLoading || hintLevel >= 2 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    opacity: hintLevel >= 2 ? 0.55 : 1,
                  }}
                >
                  {hintLoading ? <FiLoader size={16} className="mm-spin" /> : <FiSun size={16} />} {hintLevel >= 2 ? 'No more hints' : hintLevel === 1 ? 'Another hint' : 'Show a hint'}
                </button>
              </div>
              {hintLevel === 0 && (
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 10 }}>
                  Try answering without a hint to earn full points. Using a hint still earns points — just a little less.
                </div>
              )}
            </div>
          )}

          {/* Correct feedback */}
          {status === 'correct' && (
            <div className="mm-feedback-pop" style={{ marginTop: 20, background: '#e9f7ef', border: '1.5px solid #a7d8bd', borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 99, background: ACCENT, color: '#fff', display: 'grid', placeItems: 'center' }}>
                  <FiCheck size={18} />
                </span>
                <span style={{ fontSize: 19, fontWeight: 900, color: ACCENT_DEEP }}>Great! You got it!</span>
                <XPReward points={lastEarned} />
              </div>
              {explanation && (
                <div style={{ fontSize: 16, lineHeight: 1.65, color: '#334155' }}>{explanation}</div>
              )}
              <div style={{ marginTop: 16 }}>
                <MissionGuide
                  size="sm"
                  message="Brilliant — you saw the pattern! That is exactly how it works."
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: 18 }}>
                <button
                  type="button"
                  onClick={handleContinue}
                  style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 13, padding: '13px 28px', fontSize: 16.5, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {stepIndex + 1 >= steps.length ? 'Finish mission' : 'Next challenge'} <FiChevronRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* Wrong attempt feedback — always encouraging, never "failed" */}
          {status === 'wrong' && (
            <div className="mm-feedback-pop" style={{ marginTop: 20, background: SOFT_AMBER, border: '1.5px solid #e2c98f', borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ width: 34, height: 34, borderRadius: 99, background: GOLD, color: '#fff', display: 'grid', placeItems: 'center' }}>
                  <FiTarget size={17} />
                </span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#92400e' }}>Almost there</span>
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.6, color: '#334155' }}>
                {wrongCount === 1
                  ? 'Look at the parts in the visual again — what is the total, and what is shaded?'
                  : 'You are close. Let the explanation below be your guide, then try again — I know you will get it.'}
              </div>

              {revealed && (
                <div className="mm-feedback-pop" style={{ marginTop: 14, background: '#fff', border: '1.5px solid #e2c98f', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FiEye size={14} /> Let's understand it
                  </div>
                  {teacherAnswer !== '' && (
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, marginBottom: 6 }}>
                      The answer is <span style={{ color: ACCENT }}>{Array.isArray(teacherAnswer) ? teacherAnswer.join(', ') : teacherAnswer}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 15.5, lineHeight: 1.6, color: '#334155' }}>{explanation}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={tryAgain}
                  style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 13, padding: '13px 26px', fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <FiRefreshCw size={15} /> Try again
                </button>
                {hintLevel < 2 && (
                  <button
                    type="button"
                    onClick={requestHint}
                    disabled={hintLoading}
                    style={{ background: '#fff', color: ACCENT, border: '1.5px solid #c9a6c9', borderRadius: 13, padding: '12px 22px', fontSize: 15.5, fontWeight: 800, cursor: hintLoading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    {hintLoading ? <FiLoader size={16} className="mm-spin" /> : <FiSun size={16} />} Show hint
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'correct' && isQuestion && (
        <div style={{ textAlign: 'center' }}>
          {stepIndex + 1 >= steps.length && finishInfo && finishInfo.nextMission && (
            <div style={{ marginTop: 10, fontSize: 15, color: ACCENT_DEEP, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <FiLock size={14} /> Now the next mission — {finishInfo.nextMission.name} — is open.
            </div>
          )}
        </div>
      )}
    </div>
  )
}