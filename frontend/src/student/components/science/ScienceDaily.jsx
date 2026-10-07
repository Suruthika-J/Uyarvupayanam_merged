import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTION_RENDERERS } from '../../data/scienceQuestionTypes'
import ScienceFeedback from './ScienceFeedback'
import { SCIENCE_SCENES, SCIENCE_GUIDE } from '../../data/scienceEnvironments'
import SciArt from './art'
import useDailyChallenge from '../class5/daily/useDailyChallenge'
import './science.css'

// Daily Science Challenge: one fresh question every day, picked from the
// dedicated "daily" bank by the server. Solved state and attempts live on the
// student's account. Every day begins a new puzzle — no streaks, ranks or
// scores — just a spark of daily curiosity.

const DEFAULT_PALETTE = {
  skyTop: '#e4f2ff',
  skyBottom: '#fdf3e7',
  ground: '#ffd27a',
  accent: '#f59e0b',
  cardBg: '#fff8ec',
  cardAccent: '#fb923c',
}

export default function ScienceDaily() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('asking') // asking | retry | correct | reveal | complete
  const [result, setResult] = useState(null)
  const [retryToken, setRetryToken] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [seenKey, setSeenKey] = useState('')

  const handleAuthError = useCallback(
    () => navigate('/student/signin', { state: { from: { pathname: '/student/class5/science/daily' } }, replace: true }),
    [navigate]
  )

  // Same shared daily state as the other two worlds. The server re-validates
  // the student's pick, so the client never decides what counts as correct.
  const daily = useDailyChallenge({ subject: 'science', onSignedOut: handleAuthError })
  const { question, dateKey, completed, loading, error, reload, submit, reset } = daily

  // A new question (or a new day) resets the panel. Done during render rather
  // than in an effect so there is no extra pass, and keyed on dateKey so
  // answering correctly does not immediately bounce the student out of the
  // feedback they are reading; revisiting a finished day does show the completed
  // panel straight away.
  const dayQuestionKey = question ? `${dateKey}:${question.id}` : ''
  if (dayQuestionKey !== seenKey) {
    setSeenKey(dayQuestionKey)
    setResult(null)
    setWrongCount(0)
    setStatus(completed ? 'complete' : 'asking')
  }

  const palette = DEFAULT_PALETTE
  const SceneComponent = SCIENCE_SCENES.weatherstation
  const Guide = SCIENCE_GUIDE
  const Renderer = question ? QUESTION_RENDERERS[question.type] : null

  const paletteStyle = {
    '--sci-sky-top': palette.skyTop,
    '--sci-sky-bottom': palette.skyBottom,
    '--sci-ground': palette.ground,
    '--sci-accent': palette.accent,
    '--sci-card-bg': palette.cardBg,
    '--sci-card-accent': palette.cardAccent,
  }

  const handleAnswered = useCallback(
    async (pick) => {
      if (status === 'complete' || !question) return
      const saved = await submit(pick)

      if (!saved || saved.error) {
        // A failed save must not silently look like a wrong answer.
        setStatus('retry')
        setResult({ correct: false, hint: 'Your answer could not be saved. Tap try again in a moment.' })
        return
      }

      setResult(saved)
      if (saved.correct) {
        setStatus('correct')
        return
      }
      const nextWrong = wrongCount + 1
      setWrongCount(nextWrong)
      setStatus(nextWrong >= 2 ? 'reveal' : 'retry')
    },
    [status, question, submit, wrongCount]
  )

  function tryAgain() {
    setRetryToken((t) => t + 1)
    setResult(null)
    setStatus('asking')
    reset()
  }

  function showExplanation() {
    setResult((prev) => prev || { correct: false })
    setStatus('reveal')
  }

  if (loading && !question) {
    return (
      <div className="sci-root is-daily" style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}>
        <div className="sci-skeleton" role="status" aria-label="Loading daily challenge">
          <div className="sci-skel-block" style={{ top: '8%', height: 120 }} />
          <div className="sci-skel-block" style={{ top: '42%', height: 96 }} />
        </div>
      </div>
    )
  }

  if (error || !question || !Renderer) {
    const msg = error || 'Today’s puzzle is not ready yet. It may be resting for a moment.'
    return (
      <div className="sci-root is-daily" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <div className="sci-scene">
          <div className="sci-bg-sky" />
          <div className="sci-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="sci-char-mount"><Guide /></div>
        </div>
        <div className="sci-content">
          <div className="sci-intro">
            <span className="sci-intro-eyebrow">Daily Science Challenge</span>
            <h1 className="sci-intro-title">One puzzle a day</h1>
            <p className="sci-intro-text" role={error ? 'alert' : undefined}>{msg}</p>
            <div className="sci-actions">
              <button type="button" className="sci-btn sci-btn-primary" onClick={error ? reload : () => navigate('/student/class5/science')}>
                {error ? 'Try again' : 'Back to the Science map'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const done = status === 'correct' || status === 'reveal' || status === 'complete'

  return (
    <div className={`sci-root is-daily sci-root-daily${done ? ' is-done' : ''}`} style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }} key={question.id}>
      <div className="sci-scene">
        <div className="sci-bg-sky" />
        <div className="sci-bg-scene">{SceneComponent && <SceneComponent />}</div>
        <div className="sci-char-mount"><Guide /></div>
      </div>

      <div className="sci-content">
        <header className="sci-intro">
          <div className="sci-intro-top">
            <span className="sci-intro-eyebrow">
              Daily Science Challenge {completed ? '· done today!' : '· one fresh question'}
            </span>
            <span className="sci-daily-badge"><SciArt k="star" size={26} /></span>
          </div>
          <h1 className="sci-intro-title">Today’s puzzle</h1>
          {!done && <p className="sci-intro-text">{question.question}</p>}
        </header>

        {!done ? (
          <div className="sci-stage" aria-live="polite">
            <Renderer
              key={`${question.type}:${question.id}:${retryToken}`}
              question={question}
              disabled={done}
              reveal={done ? (result ? result.answer : null) : null}
              onAnswer={handleAnswered}
            />
          </div>
        ) : null}

        <ScienceFeedback
          status={status}
          result={result}
          worldNameEn="Daily Challenge"
          complete={status === 'complete'}
          finalWorld
          completeNextName=""
          onMap={() => navigate('/student/class5/science')}
          onTryAgain={tryAgain}
          onShowExplanation={showExplanation}
          onNext={() => {
            setResult(null)
            setStatus('complete')
          }}
          nextLabel="Done for today →"
          onCompleteContinue={() => navigate('/student/class5/science')}
        />

        {status === 'asking' && (
          <div className="sci-actions sci-actions-start">
            <button type="button" className="sci-btn sci-btn-ghost" onClick={() => navigate('/student/class5/science')}>
              Science map
            </button>
          </div>
        )}

        {completed && (
          <p className="sci-daily-note">Come back tomorrow for a brand-new puzzle. 🌙</p>
        )}
      </div>
    </div>
  )
}