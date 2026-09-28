import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMathsQuestion, answerMathsQuestion } from '../../services/mathsService'
import { QUESTION_RENDERERS } from '../../data/mathQuestionTypes'
import { findWorld, WORLD_ORDER } from '../../data/mathWorldThemes'
import NumberChar from './NumberChar'
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

function themeFrom(world) {
  if (world && world.theme) return world.theme
  if (world && world.palette) return world
  const seed = world && world.id ? findWorld(world.id) : null
  return seed ? seed.theme : null
}

function nextWorldFor(order) {
  if (!WORLD_ORDER || !Array.isArray(WORLD_ORDER)) return { topic: null, name: '', final: true }
  const idx = WORLD_ORDER.indexOf(String(order))
  const nextIdx = idx >= 0 ? idx + 1 : -1
  if (nextIdx >= WORLD_ORDER.length) return { topic: null, name: '', final: true }
  const topic = WORLD_ORDER[nextIdx]
  const seed = findWorld(topic)
  return { topic, name: seed ? seed.nameEn : topic, final: false }
}

export default function TopicWorld() {
  const { topic } = useParams()
  const navigate = useNavigate()

  const [world, setWorld] = useState(null)
  const [question, setQuestion] = useState(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState('asking') // asking | retry | correct | reveal | complete
  const [hardError, setHardError] = useState('') // locked / network / not-found message
  const [retryToken, setRetryToken] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [reporting, setReporting] = useState(false)
  const [fading, setFading] = useState(false)
  const busying = useRef(false)

  function bootFromResponse(res) {
    setWorld(res.world)
    setQuestion(res.question)
    setProgress(res.progress || { completed: 0, total: 0 })
    setStatus('asking')
    setWrongCount(0)
    setRetryToken(0)
    setHardError('')
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setHardError('')
      try {
        const res = await getMathsQuestion(topic)
        if (cancelled) return
        if (!res || !res.question) {
          setHardError('This Math Adventure world is not on the map yet.')
          setLoading(false)
          return
        }
        bootFromResponse(res)
      } catch (err) {
        if (cancelled) return
        if (err && err.auth) {
          navigate('/student/signin', { state: { from: { pathname: `/student/class5/maths/${encodeURIComponent(topic)}` } }, replace: true })
          return
        }
        setHardError(err && err.locked ? err.message : 'The Math World is taking a break. Tap to try again in a moment.')
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [topic, navigate])

  const theme = themeFrom(world) || {}
  const palette = theme.palette || DEFAULT_PALETTE
  const environment = theme.environment || 'valley'
  const Explorer = MATH_EXPLORER

  function handleAnswered(correct) {
    if (status !== 'asking') return
    if (correct) {
      setStatus('correct')
      setReporting(true)
      answerMathsQuestion(topic, question.id, true)
        .then((r) => {
          if (r && r.progress) setProgress(r.progress)
        })
        .catch((err) => {
          if (err && err.auth) {
            navigate('/student/signin', { state: { from: { pathname: `/student/class5/maths/${encodeURIComponent(topic)}` } }, replace: true })
          } else {
            setHardError('Your answer could not be saved. Tap to retry in a moment.')
          }
        })
        .finally(() => setReporting(false))
      return
    }
    const nextWrong = wrongCount + 1
    setWrongCount(nextWrong)
    if (nextWrong >= 2) {
      setStatus('reveal')
      answerMathsQuestion(topic, question.id, false).catch((err) => {
        if (err && err.auth) {
          navigate('/student/signin', { state: { from: { pathname: `/student/class5/maths/${encodeURIComponent(topic)}` } }, replace: true })
        }
      })
    } else {
      setStatus('retry')
    }
  }

  function tryAgain() {
    if (busying.current) return
    setRetryToken((t) => t + 1)
    setStatus('asking')
    setWrongCount(0)
  }

  function showExplanation() {
    setStatus('reveal')
  }

  function nextQuestion() {
    if (busying.current) return
    // The whole world is solved: flip to the completion card instead of a new question.
    if (progress.completed >= Math.max(1, progress.total)) {
      setStatus('complete')
      return
    }
    busying.current = true
    setFading(true)
    window.setTimeout(async () => {
      try {
        const res = await getMathsQuestion(topic)
        busying.current = false
        if (!res || !res.question) {
          setHardError('This Math Adventure world is not on the map yet.')
          setFading(false)
          return
        }
        bootFromResponse(res)
        setFading(false)
      } catch (err) {
        busying.current = false
        setFading(false)
        if (err && err.auth) {
          navigate('/student/signin', { state: { from: { pathname: `/student/class5/maths/${encodeURIComponent(topic)}` } }, replace: true })
        } else {
          setHardError(err && err.locked ? err.message : 'The Math World is taking a break. Tap to retry in a moment.')
        }
      }
    }, 340)
  }

  function goToMap() {
    if (busying.current) return
    navigate('/student/class5/maths')
  }

  const complete = status === 'complete' || (progress.completed >= Math.max(1, progress.total) && status !== 'asking')
  const nextWorld = complete && world ? nextWorldFor(world.order) : { topic: null, name: '', final: true }

  function continueToNext() {
    if (!nextWorld.topic) {
      goToMap()
      return
    }
    navigate(`/student/class5/maths/${encodeURIComponent(nextWorld.topic)}`)
  }

  function retryLoad() {
    setLoading(false)
    setStatus('asking')
    window.setTimeout(() => {
      setLoading(true)
      setHardError('')
      getMathsQuestion(topic)
        .then((res) => {
          if (res && res.question) bootFromResponse(res)
          else {
            setHardError('This Math Adventure world is not on the map yet.')
            setLoading(false)
          }
        })
        .catch((err) => {
          if (err && err.auth) {
            navigate('/student/signin', { state: { from: { pathname: `/student/class5/maths/${encodeURIComponent(topic)}` } }, replace: true })
            return
          }
          setHardError(err && err.locked ? err.message : 'Still heading out for a break. Try again in a moment.')
          setLoading(false)
        })
    }, 40)
  }

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

  if (loading && !world) {
    return (
      <div className="mth-root" style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}>
        <div className="mth-skeleton" role="status" aria-label="Loading world">
          <div className="mth-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="mth-skel-block" style={{ top: '36%', height: 96 }} />
          <div className="mth-skel-block" style={{ top: '54%', height: 160 }} />
        </div>
      </div>
    )
  }

  if (hardError || notFoundState(question, Renderer)) {
    const msg = hardError || 'This Math Adventure world is not on the map yet. It may have been renamed, or it has no questions in the bank.'
    return (
      <div className="mth-root" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <div className="mth-scene">
          <div className="mth-bg-sky" />
          <div className="mth-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="mth-char-mount">{<Explorer pose="think" />}</div>
        </div>
        <div className="mth-content">
          <div className="mth-intro">
            <span className="mth-intro-eyebrow">Math Adventure</span>
            <p className="mth-intro-text">{msg}</p>
            <div className="mth-actions">
              <button type="button" className="mth-btn mth-btn-primary" onClick={hardError && !/not on the map|renamed|no questions/.test(msg) ? retryLoad : goToMap}>
                {hardError && !/not on the map|renamed|no questions/.test(msg) ? 'Try again' : 'Back to the Math World Map'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const done = status === 'correct' || status === 'reveal' || status === 'complete'

  return (
    <div
      className={`mth-root${fading ? ' is-fading' : ''}${done ? ' is-done' : ''}`}
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
              {world.name} · World {Math.min(progress.completed + 1, Math.max(1, progress.total))} of{' '}
              {Math.max(1, progress.total)}
            </span>
            <span className="mth-intro-progress" aria-label={`${Math.min(progress.completed, progress.total)} of ${Math.max(1, progress.total)} complete`}>
              <NumberChar digit={String(Math.min(progress.completed, Math.max(1, progress.total)))} size={24} animate={false} />
              <span className="mth-intro-progress-slash">/</span>
              <NumberChar digit={String(Math.max(1, progress.total))} size={24} animate={false} />
            </span>
          </div>
          <h1 className="mth-intro-title">{world.nameEn}</h1>
          {!complete && <p className="mth-intro-text">{question.question}</p>}
        </header>

        {!complete && (
          <div className="mth-stage" aria-live="polite">
            <Renderer
              key={`${question.id}:form${retryToken}`}
              question={question}
              disabled={done}
              onAnswer={handleAnswered}
            />
          </div>
        )}

        <MathsFeedback
          status={status}
          explanation={question.explanation || ''}
          worldNameEn={world.nameEn}
          complete={status === 'complete'}
          completeNextName={nextWorld.name}
          finalWorld={nextWorld.final}
          reporting={reporting}
          onMap={goToMap}
          onTryAgain={tryAgain}
          onShowExplanation={showExplanation}
          onNext={nextQuestion}
          nextLabel={progress.completed >= progress.total ? 'World complete →' : 'Next world stop →'}
          onCompleteContinue={continueToNext}
        />

        {status === 'asking' && (
          <div className="mth-actions mth-actions-start">
            <button type="button" className="mth-btn mth-btn-ghost" onClick={goToMap}>
              Map
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function notFoundState(question, Renderer) {
  return !question || !Renderer
}