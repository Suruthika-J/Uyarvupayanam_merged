import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMathsDaily, answerMathsQuestion } from '../../services/mathsService'
import { QUESTION_RENDERERS } from '../../data/mathQuestionTypes'
import { findWorld } from '../../data/mathWorldThemes'
import MathsFeedback from './MathsFeedback'
import { MATH_SCENES, MATH_EXPLORER } from '../../data/mathEnvironments'
import './maths.css'

const DEFAULT_PALETTE = {
  skyTop: '#3b2f63',
  skyBottom: '#f2c27f',
  ground: '#6b5a86',
  accent: '#ffd27a',
  cardBg: '#f3ecff',
  cardAccent: '#7a5cf0',
}

// Today's Math Challenge: a single, rotating, API-driven question. Attempts and
// the completion status are saved to the logged-in student's account, so the
// app remembers who already finished today's challenge - per student.
export default function DailyChallenge() {
  const navigate = useNavigate()

  const [question, setQuestion] = useState(null)
  const [status, setStatus] = useState('asking') // asking | retry | reveal | correct | done
  const [explanation, setExplanation] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [reporting, setReporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hardError, setHardError] = useState('')

  const handleAuthError = useCallback(
    () => navigate('/student/signin', { state: { from: { pathname: '/student/class5/maths/daily' } }, replace: true }),
    [navigate]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await getMathsDaily()
        if (cancelled) return
        if (!res || !res.question) {
          setHardError("Today's challenge is not ready yet. Come back soon!")
          setLoading(false)
          return
        }
        setQuestion(res.question)
        setExplanation(res.question.explanation || '')
        setStatus(res.solved ? 'done' : 'asking')
        setWrongCount(0)
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        if (err && err.auth) {
          handleAuthError()
          return
        }
        setHardError('The Daily Challenge is taking a break. Tap to try again in a moment.')
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [handleAuthError])

  function handleAnswered(correct) {
    if (status !== 'asking' || !question) return
    if (correct) {
      setStatus('correct')
      setReporting(true)
      answerMathsQuestion(question.topic, question.id, true)
        .catch((err) => {
          if (err && err.auth) handleAuthError()
        })
        .finally(() => setReporting(false))
      return
    }
    const nextWrong = wrongCount + 1
    setWrongCount(nextWrong)
    if (nextWrong >= 2) {
      setStatus('reveal')
      answerMathsQuestion(question.topic, question.id, false).catch((err) => {
        if (err && err.auth) handleAuthError()
      })
    } else {
      setStatus('retry')
    }
  }

  function tryAgain() {
    setRetryToken((t) => t + 1)
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
  const theme = (seedWorld && seedWorld.theme) || {}
  const palette = theme.palette || DEFAULT_PALETTE
  const environment = theme.environment || 'valley'
  const Explorer = MATH_EXPLORER
  const Renderer = question ? QUESTION_RENDERERS[question.type] : null
  const paletteStyle = {
    '--mth-sky-top': palette.skyTop,
    '--mth-sky-bottom': palette.skyBottom,
    '--mth-ground': palette.ground,
    '--mth-accent': palette.accent,
    '--mth-card-bg': palette.cardBg,
    '--mth-card-accent': palette.cardAccent,
  }
  const SceneComponent = MATH_SCENES[environment]
  const done = status === 'correct' || status === 'reveal' || status === 'done'

  if (loading) {
    return (
      <div className="mth-root" style={{ ...paletteStyle, minHeight: 'clamp(520px, 60vh, 760px)' }}>
        <div className="mth-skeleton" role="status" aria-label="Loading daily challenge">
          <div className="mth-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="mth-skel-block" style={{ top: '38%', height: 96 }} />
          <div className="mth-skel-block" style={{ top: '56%', height: 150 }} />
        </div>
      </div>
    )
  }

  if (hardError || !question || !Renderer) {
    const msg = hardError || "Today's challenge is not ready yet."
    return (
      <div className="mth-root" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
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
              <button type="button" className="mth-btn mth-btn-primary" onClick={hardError ? () => window.location.reload() : backToMap}>
                {hardError ? 'Try again' : 'Back to the Math World Map'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`mth-root${done ? ' is-done' : ''}`} style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }} key={question.id}>
      <div className="mth-scene">
        <div className="mth-bg-sky" />
        <div className="mth-bg-scene">{SceneComponent && <SceneComponent />}</div>
        <div className="mth-char-mount">{<Explorer pose={status === 'retry' ? 'think' : 'wave'} />}</div>
      </div>

      <div className="mth-content">
        <header className="mth-intro">
          <div className="mth-intro-top">
            <span className="mth-intro-eyebrow">Today&apos;s Math Challenge</span>
          </div>
          <h1 className="mth-intro-title">One puzzle, once a day</h1>
          {status !== 'done' && <p className="mth-intro-text">{question.question}</p>}
          {status === 'done' && (
            <p className="mth-intro-text">
              You already finished today&apos;s challenge — the app remembers, so it&apos;s wrapped up for you. Here&apos;s
              the one you solved:
            </p>
          )}
        </header>

        {status !== 'done' && (
          <div className="mth-stage" aria-live="polite">
            <Renderer
              key={`${question.id}:form${retryToken}`}
              question={question}
              disabled={done}
              onAnswer={handleAnswered}
            />
          </div>
        )}
        {status === 'done' && (
          <div className="mth-stage" aria-live="polite">
            <Renderer key={`${question.id}:done`} question={question} disabled onAnswer={() => {}} />
          </div>
        )}

        <MathsFeedback
          status={status === 'done' ? 'correct' : status}
          explanation={explanation}
          worldNameEn="today's challenge"
          reporting={reporting}
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