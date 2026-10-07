import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTION_RENDERERS } from '../../data/mathQuestionTypes'
import { findWorld } from '../../data/mathWorldThemes'
import MathsFeedback from './MathsFeedback'
import { MATH_SCENES, MATH_EXPLORER } from '../../data/mathEnvironments'
import useDailyChallenge from '../class5/daily/useDailyChallenge'
import './maths.css'

const DEFAULT_PALETTE = {
  skyTop: '#3b2f63',
  skyBottom: '#f2c27f',
  ground: '#6b5a86',
  accent: '#ffd27a',
  cardBg: '#f3ecff',
  cardAccent: '#7a5cf0',
}

// Today's Math Challenge: one rotating question per day, drawn from the Math
// Adventure bank (any world, so it feels like a surprise) and answered with the
// normal Math question renderers.
//
// Loading, error, per-day completion and saving all come from the shared
// Class 5 daily hook; this file is only the Math Adventure skin around it.
export default function MathDaily() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('asking') // asking | retry | correct | reveal
  const [explanation, setExplanation] = useState('')
  const [wrongCount, setWrongCount] = useState(0)
  const [seenKey, setSeenKey] = useState('')

  const handleAuthError = useCallback(
    () => navigate('/student/signin', { state: { from: { pathname: '/student/class5/maths/daily' } }, replace: true }),
    [navigate]
  )

  const daily = useDailyChallenge({ subject: 'maths', onSignedOut: handleAuthError })
  const { question, dateKey, completed, loading, error, reload, submit } = daily

  // Reset the answer panel whenever a different question (or a different day)
  // arrives. Done during render rather than in an effect so there is no extra
  // pass, and keyed on dateKey so answering correctly does not immediately
  // bounce the student out of the feedback they are reading. Revisiting a day
  // that is already finished opens straight into the completed state.
  const dayQuestionKey = question ? `${dateKey}:${question.id}` : ''
  if (dayQuestionKey !== seenKey) {
    setSeenKey(dayQuestionKey)
    setExplanation((question && question.explanation) || '')
    setStatus(completed ? 'complete' : 'asking')
    setWrongCount(0)
  }

  const handleAnswered = useCallback(
    async (correct) => {
      if (status !== 'asking' || !question) return

      if (correct) {
        setStatus('correct')
        // Persist to the shared daily store - never to per-world progress.
        const saved = await submit(true)
        if (saved?.error && !saved.auth) {
          setStatus('retry')
        }
        return
      }

      const nextWrong = wrongCount + 1
      setWrongCount(nextWrong)
      if (nextWrong >= 2) {
        setStatus('reveal')
        submit(false)
      } else {
        setStatus('retry')
      }
    },
    [status, question, wrongCount, submit]
  )

  function tryAgain() {
    setStatus('asking')
    setWrongCount(0)
  }

  function showExplanation() {
    setStatus('reveal')
  }

  function backToMap() {
    navigate('/student/class5/maths')
  }

  const seedWorld = question ? findWorld(question.topic) : null
  const palette = (seedWorld && seedWorld.theme && seedWorld.theme.palette) || DEFAULT_PALETTE
  const environment = (seedWorld && seedWorld.theme && seedWorld.theme.environment) || 'valley'
  const Explorer = MATH_EXPLORER
  const Renderer = question ? QUESTION_RENDERERS[question.type] : null
  const SceneComponent = MATH_SCENES[environment]
  const done = status === 'correct' || status === 'reveal'

  const paletteStyle = {
    '--mth-sky-top': palette.skyTop,
    '--mth-sky-bottom': palette.skyBottom,
    '--mth-ground': palette.ground,
    '--mth-accent': palette.accent,
    '--mth-card-bg': palette.cardBg,
    '--mth-card-accent': palette.cardAccent,
  }

  if (loading) {
    return (
      <div className="mth-root is-daily" style={{ ...paletteStyle, minHeight: 'clamp(520px, 60vh, 760px)' }}>
        <div className="mth-skeleton" role="status" aria-label="Loading daily challenge">
          <div className="mth-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="mth-skel-block" style={{ top: '38%', height: 96 }} />
          <div className="mth-skel-block" style={{ top: '56%', height: 150 }} />
        </div>
      </div>
    )
  }

  // Nothing to play and we know why - say so, with a way out. Never a blank stage.
  if (error || !question || !Renderer) {
    const msg = error || "Today's challenge is not ready yet."
    return (
      <div className="mth-root is-daily" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <div className="mth-scene">
          <div className="mth-bg-sky" />
          <div className="mth-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="mth-char-mount">{<Explorer pose="think" />}</div>
        </div>
        <div className="mth-content">
          <div className="mth-intro">
            <span className="mth-intro-eyebrow">Today&apos;s Math Challenge</span>
            <p className="mth-intro-text">{msg}</p>
            <div className="mth-actions">
              <button type="button" className="mth-btn mth-btn-primary" onClick={error ? reload : backToMap}>
                {error ? 'Try again' : 'Back to the Math World Map'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`mth-root is-daily${done ? ' is-done' : ''}`}
      style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}
      key={question.id}
    >
      <div className="mth-scene">
        <div className="mth-bg-sky" />
        <div className="mth-bg-scene">{SceneComponent && <SceneComponent />}</div>
        <div className="mth-char-mount">{<Explorer pose={status === 'retry' ? 'think' : 'wave'} />}</div>
      </div>

      <div className="mth-content">
        <header className="mth-intro">
          <div className="mth-intro-top">
            <span className="mth-intro-eyebrow">
              Today&apos;s Math Challenge{completed ? ' · done!' : ' · one puzzle a day'}
            </span>
          </div>
          <h1 className="mth-intro-title">
            {completed ? "You've finished today's" : 'One puzzle, once a day'}
          </h1>
          {completed ? (
            <p className="mth-intro-text">
              Here is the puzzle you solved today. A brand new one arrives tomorrow.
            </p>
          ) : (
            <p className="mth-intro-text">{question.question}</p>
          )}
        </header>

        <div className="mth-stage" aria-live="polite">
          <Renderer question={question} disabled={done} onAnswer={handleAnswered} />
        </div>

        <MathsFeedback
          status={status}
          explanation={explanation}
          worldNameEn="today's challenge"
          singleAction
          onMap={backToMap}
          onTryAgain={tryAgain}
          onShowExplanation={showExplanation}
          onNext={backToMap}
          nextLabel="Back to the map →"
        />

        {status === 'asking' && (
          <div className="mth-actions mth-actions-start">
            <button type="button" className="mth-btn mth-btn-ghost" onClick={backToMap}>
              Map
            </button>
          </div>
        )}
      </div>
    </div>
  )
}