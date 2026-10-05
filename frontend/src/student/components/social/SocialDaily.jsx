import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTION_RENDERERS } from '../../data/socialQuestionTypes'
import { findWorld } from '../../data/socialWorldThemes'
import SocialFeedback from './SocialFeedback'
import { SOCIAL_SCENES, SOCIAL_EXPLORER } from '../../data/socialEnvironments'
import useDailyChallenge from '../class5/daily/useDailyChallenge'
import './social.css'

const DEFAULT_PALETTE = {
  skyTop: '#0b1030',
  skyBottom: '#3b2f8f',
  ground: '#151a3a',
  accent: '#ffd27a',
  cardBg: '#221c4d',
  cardAccent: '#a778ff',
}

// Today's Explorer Challenge: one rotating discovery per day, drawn from the
// World Explorer bank and answered with the normal Social question renderers.
// State handling is the shared Class 5 daily hook; this file is only the World
// Explorer skin around it.
export default function SocialDaily() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('asking') // asking | retry | correct | reveal
  const [explanation, setExplanation] = useState('')
  const [wrongCount, setWrongCount] = useState(0)
  const [seenKey, setSeenKey] = useState('')

  const handleAuthError = useCallback(
    () => navigate('/student/signin', { state: { from: { pathname: '/student/class5/social/daily' } }, replace: true }),
    [navigate]
  )

  const daily = useDailyChallenge({ subject: 'social', onSignedOut: handleAuthError })
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
        const saved = await submit(true)
        if (saved?.error && !saved.auth) setStatus('retry')
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
    navigate('/student/class5/social')
  }

  const seedWorld = question ? findWorld(question.world) : null
  const palette = (seedWorld && seedWorld.theme && seedWorld.theme.palette) || DEFAULT_PALETTE
  const environment = seedWorld ? seedWorld.environment : 'space'
  const Explorer = SOCIAL_EXPLORER
  const Renderer = question ? QUESTION_RENDERERS[question.type] : null
  const SceneComponent = SOCIAL_SCENES[environment]
  const done = status === 'correct' || status === 'reveal'

  const paletteStyle = {
    '--soc-sky-top': palette.skyTop,
    '--soc-sky-bottom': palette.skyBottom,
    '--soc-ground': palette.ground,
    '--soc-accent': palette.accent,
    '--soc-card-bg': palette.cardBg,
    '--soc-card-accent': palette.cardAccent,
  }

  if (loading) {
    return (
      <div className="soc-root is-daily" style={{ ...paletteStyle, minHeight: 'clamp(520px, 60vh, 760px)' }}>
        <div className="soc-skeleton" role="status" aria-label="Loading daily challenge">
          <div className="soc-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="soc-skel-block" style={{ top: '38%', height: 96 }} />
          <div className="soc-skel-block" style={{ top: '56%', height: 150 }} />
        </div>
      </div>
    )
  }

  if (error || !question || !Renderer) {
    const msg = error || "Today's challenge is not ready yet."
    return (
      <div className="soc-root is-daily" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
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
              <button type="button" className="soc-btn soc-btn-primary" onClick={error ? reload : backToMap}>
                {error ? 'Try again' : 'Back to the World Explorer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`soc-root is-daily${done ? ' is-done' : ''}`}
      style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}
      key={question.id}
    >
      <div className="soc-scene">
        <div className="soc-bg-sky" />
        <div className="soc-bg-scene">{SceneComponent && <SceneComponent />}</div>
        <div className="soc-char-mount"><Explorer /></div>
      </div>

      <div className="soc-content">
        <header className="soc-intro">
          <div className="soc-intro-top">
            <span className="soc-intro-eyebrow">
              Today&apos;s Explorer Challenge{completed ? ' · done!' : ''}
            </span>
          </div>
          <h1 className="soc-intro-title">
            {seedWorld ? seedWorld.nameEn : 'A world of wonder'}
          </h1>
          {completed ? (
            <p className="soc-intro-text">
              Here is the discovery you made today. A brand new one arrives tomorrow.
            </p>
          ) : (
            <p className="soc-intro-text">{question.question}</p>
          )}
        </header>

        <div className="soc-stage" aria-live="polite">
          <Renderer question={question} disabled={done} onAnswer={handleAnswered} />
        </div>

        <SocialFeedback
          status={status}
          explanation={explanation}
          worldNameEn="today's challenge"
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