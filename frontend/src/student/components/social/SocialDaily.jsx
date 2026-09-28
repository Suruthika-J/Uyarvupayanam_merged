import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocialDaily, answerSocialQuestion } from '../../services/socialService'
import { QUESTION_RENDERERS } from '../../data/socialQuestionTypes'
import { findWorld } from '../../data/socialWorldThemes'
import SocialFeedback from './SocialFeedback'
import { SOCIAL_SCENES, SOCIAL_EXPLORER } from '../../data/socialEnvironments'
import './social.css'

const DEFAULT_PALETTE = {
  skyTop: '#0b1030',
  skyBottom: '#3b2f8f',
  ground: '#151a3a',
  accent: '#ffd27a',
  cardBg: '#221c4d',
  cardAccent: '#a778ff',
}

// Today's Explorer Challenge: a single, rotating, API-driven discovery.
// Attempts and the completion status are saved to the logged-in student's
// account, so the app remembers who already finished today's challenge - per
// student.
export default function SocialDaily() {
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
    () => navigate('/student/signin', { state: { from: { pathname: '/student/class5/social/daily' } }, replace: true }),
    [navigate]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await getSocialDaily()
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
        setHardError('The Explorer Challenge is taking a breath. Tap to try again in a moment.')
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
      answerSocialQuestion(question.world, question.id, true)
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
      answerSocialQuestion(question.world, question.id, false).catch((err) => {
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
    navigate('/student/class5/social')
  }

  const seedWorld = question ? findWorld(question.world) : null
  const theme = (seedWorld && seedWorld.theme) || {}
  const palette = theme.palette || DEFAULT_PALETTE
  const environment = seedWorld ? seedWorld.environment : 'space'
  const Explorer = SOCIAL_EXPLORER
  const Renderer = question ? QUESTION_RENDERERS[question.type] : null
  const paletteStyle = {
    '--soc-sky-top': palette.skyTop,
    '--soc-sky-bottom': palette.skyBottom,
    '--soc-ground': palette.ground,
    '--soc-accent': palette.accent,
    '--soc-card-bg': palette.cardBg,
    '--soc-card-accent': palette.cardAccent,
  }
  const SceneComponent = SOCIAL_SCENES[environment]
  const done = status === 'correct' || status === 'reveal' || status === 'done'

  if (loading) {
    return (
      <div className="soc-root" style={{ ...paletteStyle, minHeight: 'clamp(520px, 60vh, 760px)' }}>
        <div className="soc-skeleton" role="status" aria-label="Loading daily challenge">
          <div className="soc-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="soc-skel-block" style={{ top: '38%', height: 96 }} />
          <div className="soc-skel-block" style={{ top: '56%', height: 150 }} />
        </div>
      </div>
    )
  }

  if (hardError || !question || !Renderer) {
    const msg = hardError || "Today's challenge is not ready yet."
    return (
      <div className="soc-root" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <div className="soc-scene">
          <div className="soc-bg-sky" />
          <div className="soc-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="soc-char-mount"><Explorer /></div>
        </div>
        <div className="soc-content">
          <div className="soc-intro">
            <span className="soc-intro-eyebrow">Today&apos;s Explorer Challenge</span>
            <p className="soc-intro-text">{msg}</p>
            <div className="soc-actions">
              <button type="button" className="soc-btn soc-btn-primary" onClick={hardError ? () => window.location.reload() : backToMap}>
                {hardError ? 'Try again' : 'Back to the World Explorer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`soc-root${done ? ' is-done' : ''}`} style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }} key={question.id}>
      <div className="soc-scene">
        <div className="soc-bg-sky" />
        <div className="soc-bg-scene">{SceneComponent && <SceneComponent />}</div>
        <div className="soc-char-mount"><Explorer /></div>
      </div>

      <div className="soc-content">
        <header className="soc-intro">
          <div className="soc-intro-top">
            <span className="soc-intro-eyebrow">Today&apos;s Explorer Challenge</span>
          </div>
          <h1 className="soc-intro-title">{seedWorld ? seedWorld.nameEn : 'A world of wonder'}</h1>
          {status !== 'done' && <p className="soc-intro-text">{question.question}</p>}
          {status === 'done' && (
            <p className="soc-intro-text">
              You already finished today&apos;s challenge — the app remembers, so it&apos;s wrapped up for you. Here&apos;s
              the one you solved:
            </p>
          )}
        </header>

        {status !== 'done' && (
          <div className="soc-stage" aria-live="polite">
            <Renderer
              key={`${question.id}:form${retryToken}`}
              question={question}
              disabled={done}
              onAnswer={handleAnswered}
            />
          </div>
        )}
        {status === 'done' && (
          <div className="soc-stage" aria-live="polite">
            <Renderer key={`${question.id}:done`} question={question} disabled onAnswer={() => {}} />
          </div>
        )}

        <SocialFeedback
          status={status === 'done' ? 'correct' : status}
          explanation={explanation}
          worldNameEn="today's challenge"
          reporting={reporting}
          singleAction
          onMap={backToMap}
          onTryAgain={tryAgain}
          onShowExplanation={showExplanation}
          onNext={backToMap}
          nextLabel="Back to the World Explorer →"
        />

        {status === 'asking' && (
          <div className="soc-actions soc-actions-start">
            <button type="button" className="soc-btn soc-btn-ghost" onClick={backToMap}>
              Explorer map
            </button>
          </div>
        )}
      </div>
    </div>
  )
}