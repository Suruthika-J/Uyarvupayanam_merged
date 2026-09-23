import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getScienceWorld, answerScienceQuestion, setScienceStage } from '../../services/scienceService'
import { QUESTION_RENDERERS } from '../../data/scienceQuestionTypes'
import { findScienceWorld, EXPLORE_ORDER } from '../../data/scienceWorldThemes'
import { SCIENCE_SCENES, SCIENCE_GUIDE } from '../../data/scienceEnvironments'
import ScienceFeedback from './ScienceFeedback'
import ExperimentStage from './ExperimentStage'
import SciArt from './art'
import './science.css'

const DEFAULT_PALETTE = {
  skyTop: '#b7e7a5',
  skyBottom: '#e9f7c9',
  ground: '#8ec46e',
  accent: '#3f9e4d',
  cardBg: '#f1fbe8',
  cardAccent: '#66bb6a',
}

function themeFrom(world) {
  if (world && world.theme && world.theme.palette) return world.theme
  const seed = world && world.id ? findScienceWorld(world.id) : null
  return seed ? seed.theme : null
}

function nextWorldFor(order) {
  if (!EXPLORE_ORDER || !Array.isArray(EXPLORE_ORDER)) return { world: null, name: '', final: true }
  const idx = EXPLORE_ORDER.indexOf(order)
  const nextIdx = idx >= 0 ? idx + 1 : -1
  if (nextIdx >= EXPLORE_ORDER.length) return { world: null, name: '', final: true }
  const key = EXPLORE_ORDER[nextIdx]
  const seed = findScienceWorld(key)
  return { world: key, name: seed ? seed.nameEn : key, final: false }
}

export default function ScienceWorld() {
  const { world: worldKey } = useParams()
  const navigate = useNavigate()

  const [world, setWorld] = useState(null)
  const [question, setQuestion] = useState(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [phase, setPhase] = useState('explore') // explore | experiment | play
  const [status, setStatus] = useState('asking') // asking | retry | correct | reveal | complete
  const [result, setResult] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [retryToken, setRetryToken] = useState(0)
  const [reporting, setReporting] = useState(false)
  const [fading, setFading] = useState(false)
  const [hardError, setHardError] = useState('')
  const [loading, setLoading] = useState(true)
  const busying = useRef(false)

  function bootFromResponse(res) {
    setWorld(res.world)
    setQuestion(res.question)
    setProgress(res.progress || { completed: 0, total: 0 })
    setResult(null)
    setWrongCount(0)
    setRetryToken(0)
    setHardError('')
    setStatus('asking')
    const stage = res.resumeStage || 'explore'
    if (stage === 'play' || (res.world && !res.world.experiment)) setPhase('play')
    else if (stage === 'experiment') setPhase('experiment')
    else setPhase('explore')
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setHardError('')
      try {
        const res = await getScienceWorld(worldKey)
        if (cancelled) return
        if (!res || !res.world || !res.question) {
          setHardError('This world is not on the Science map yet.')
          setLoading(false)
          return
        }
        bootFromResponse(res)
      } catch (err) {
        if (cancelled) return
        if (err && err.auth) {
          navigate('/student/signin', {
            state: { from: { pathname: `/student/class5/science/${encodeURIComponent(worldKey)}` } },
            replace: true,
          })
          return
        }
        setHardError(err && err.locked ? err.message : 'The Science Adventure is catching its breath. Tap to try again in a moment.')
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [worldKey, navigate])

  const theme = themeFrom(world) || {}
  const palette = (theme.palette) || DEFAULT_PALETTE
  const environment = (theme.environment) || (world && world.environment) || 'forest'
  const Guide = SCIENCE_GUIDE

  function goToMap() {
    if (busying.current) return
    navigate('/student/class5/science')
  }

  function startExperiment() {
    setScienceStage(worldKey, 'experiment').catch(() => {})
    if (world && world.experiment) setPhase('experiment')
    else setPhase('play')
  }

  function continueToPlay() {
    setScienceStage(worldKey, 'play').catch(() => {})
    setResult(null)
    setStatus('asking')
    setPhase('play')
  }

  function handleAnswered(pick) {
    if (status !== 'asking' || !question) return
    setReporting(true)
    setResult(null)
    answerScienceQuestion(worldKey, question.id, pick)
      .then((r) => {
        setResult(r)
        if (r && r.progress) setProgress(r.progress)
        if (r && r.correct) {
          setStatus('correct')
        } else {
          const nextWrong = wrongCount + 1
          setWrongCount(nextWrong)
          setStatus(nextWrong >= 2 ? 'reveal' : 'retry')
        }
      })
      .catch((err) => {
        if (err && err.auth) {
          navigate('/student/signin', {
            state: { from: { pathname: `/student/class5/science/${encodeURIComponent(worldKey)}` } },
            replace: true,
          })
          return
        }
        setStatus('retry')
        setResult({ correct: false, hint: 'Your answer could not be saved. Tap try again in a moment.' })
      })
      .finally(() => setReporting(false))
  }

  function tryAgain() {
    if (busying.current) return
    setRetryToken((t) => t + 1)
    setWrongCount(0)
    setResult(null)
    setStatus('asking')
  }

  function showExplanation() {
    setResult((prev) => prev || { correct: false })
    setStatus('reveal')
  }

  function nextQuestion() {
    if (busying.current) return
    if (progress.completed >= Math.max(1, progress.total)) {
      setStatus('complete')
      return
    }
    busying.current = true
    setFading(true)
    window.setTimeout(async () => {
      try {
        const res = await getScienceWorld(worldKey)
        busying.current = false
        if (!res || !res.question) {
          setHardError('This world is not on the Science map yet.')
          setFading(false)
          return
        }
        bootFromResponse(res)
        setFading(false)
      } catch (err) {
        busying.current = false
        setFading(false)
        if (err && err.auth) {
          navigate('/student/signin', {
            state: { from: { pathname: `/student/class5/science/${encodeURIComponent(worldKey)}` } },
            replace: true,
          })
        } else {
          setHardError(err && err.locked ? err.message : 'The Science Adventure is catching its breath. Tap to retry in a moment.')
        }
      }
    }, 340)
  }

  const complete = status === 'complete' || (progress.completed >= Math.max(1, progress.total) && status !== 'asking')
  const nextWorld = complete && world ? nextWorldFor(world.order) : { world: null, name: '', final: true }

  function continueToNext() {
    if (!nextWorld.world) {
      goToMap()
      return
    }
    navigate(`/student/class5/science/${encodeURIComponent(nextWorld.world)}`)
  }

  function retryLoad() {
    setHardError('')
    setLoading(true)
    window.setTimeout(() => {
      getScienceWorld(worldKey)
        .then((res) => { if (res && res.question) bootFromResponse(res) })
        .catch((err) => {
          if (err && err.auth) {
            navigate('/student/signin', { state: { from: { pathname: `/student/class5/science/${encodeURIComponent(worldKey)}` } }, replace: true })
            return
          }
          setHardError(err && err.locked ? err.message : 'Still catching its breath. Try again in a moment.')
          setLoading(false)
        })
    }, 40)
  }

  const Renderer = question ? QUESTION_RENDERERS[question.type] : null
  const paletteStyle = {
    '--sci-sky-top': palette.skyTop,
    '--sci-sky-bottom': palette.skyBottom,
    '--sci-ground': palette.ground,
    '--sci-accent': palette.accent,
    '--sci-card-bg': palette.cardBg,
    '--sci-card-accent': palette.cardAccent,
  }
  const SceneComponent = SCIENCE_SCENES[environment]

  if (loading && !world) {
    return (
      <div className="sci-root" style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}>
        <div className="sci-skeleton" role="status" aria-label="Loading world">
          <div className="sci-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="sci-skel-block" style={{ top: '36%', height: 96 }} />
          <div className="sci-skel-block" style={{ top: '54%', height: 160 }} />
        </div>
      </div>
    )
  }

  if (hardError || !question || !Renderer) {
    const msg = hardError || 'This world is not on the Science map yet. It may have been renamed, or it has no activities in the bank.'
    const retryable = hardError && !/not on the Science map|renamed|no activities/.test(msg)
    return (
      <div className="sci-root" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <div className="sci-scene">
          <div className="sci-bg-sky" />
          <div className="sci-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="sci-char-mount"><Guide /></div>
        </div>
        <div className="sci-content">
          <div className="sci-intro">
            <span className="sci-intro-eyebrow">Science Adventure · Class 5</span>
            <h1 className="sci-intro-title">{world ? world.nameEn : 'Science map'}</h1>
            <p className="sci-intro-text">{msg}</p>
            <div className="sci-actions">
              <button type="button" className="sci-btn sci-btn-primary" onClick={retryable ? retryLoad : goToMap}>
                {retryable ? 'Try again' : 'Back to the Science map'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const done = status === 'correct' || status === 'reveal' || status === 'complete'
  const discoveries = world && Array.isArray(world.discoveries) ? world.discoveries : []

  if (phase === 'explore' && !complete) {
    return (
      <div className="sci-root sci-root-discover" style={{ ...paletteStyle }}>
        <div className="sci-scene">
          <div className="sci-bg-sky" />
          <div className="sci-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="sci-char-mount"><Guide /></div>
        </div>
        <div className="sci-content">
          <header className="sci-discover-head">
            <span className="sci-intro-eyebrow">{world.name} · {world.nameEn}</span>
            <h1 className="sci-intro-title">{world.guideLine || world.nameEn}</h1>
            <p className="sci-intro-text">{world.intro || ''}</p>
            <div className="sci-discover-skills">
              {(world.skills || []).map((s) => (
                <span key={s} className="sci-skill-chip">{s}</span>
              ))}
            </div>
            {world.experiment ? (
              <div className="sci-discover-exp-note">
                <SciArt k="testtube" size={30} />
                <span><strong>Try it first:</strong> {world.experiment.prompt}</span>
              </div>
            ) : null}
          </header>

          <div className="sci-discover-grid" role="group" aria-label="things to touch and discover">
            {discoveries.map((d) => (
              <DiscoveryCard key={d.key} d={d} />
            ))}
          </div>

          <div className="sci-actions sci-actions-discover">
            <button type="button" className="sci-btn sci-btn-ghost" onClick={goToMap}>Science map</button>
            <button type="button" className="sci-btn sci-btn-primary sci-btn-big" onClick={startExperiment}>
              {world.experiment ? 'Begin the adventure — try it →' : 'Begin the adventure →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'experiment') {
    return (
      <div className="sci-root sci-root-exp" style={{ ...paletteStyle }}>
        <div className="sci-scene">
          <div className="sci-bg-sky" />
          <div className="sci-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="sci-char-mount"><Guide /></div>
        </div>
        <div className="sci-content">
          <ExperimentStage world={world} onContinue={continueToPlay} onMap={goToMap} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`sci-root${fading ? ' is-fading' : ''}${done ? ' is-done' : ''}`}
      style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}
      key={question.id}
    >
      <div className="sci-scene">
        <div className="sci-bg-sky" />
        <div className="sci-bg-scene">{SceneComponent && <SceneComponent />}</div>
        <div className="sci-char-mount"><Guide /></div>
      </div>

      <div className="sci-content">
        <header className="sci-intro">
          <div className="sci-intro-top">
            <span className="sci-intro-eyebrow">
              {world.name} · {world.nameEn} · Q{Math.min(progress.completed + 1, Math.max(1, progress.total))} of {Math.max(1, progress.total)}
            </span>
          </div>
          <h1 className="sci-intro-title">{world.nameEn}</h1>
          {!complete && <p className="sci-intro-text">{question.question}</p>}
        </header>

        {!complete && (
          <div className="sci-stage" aria-live="polite">
            <Renderer
              key={`${question.type}:${question.id}:${retryToken}`}
              question={question}
              disabled={done}
              reveal={done ? (result ? result.answer : null) : null}
              onAnswer={handleAnswered}
            />
          </div>
        )}

        <ScienceFeedback
          status={status}
          result={result}
          worldNameEn={world.nameEn}
          complete={status === 'complete'}
          completeNextName={nextWorld.name}
          finalWorld={nextWorld.final}
          reporting={reporting}
          onMap={goToMap}
          onTryAgain={tryAgain}
          onShowExplanation={showExplanation}
          onNext={nextQuestion}
          nextLabel={progress.completed >= progress.total ? 'World explored →' : 'Next stop →'}
          onCompleteContinue={continueToNext}
        />

        {status === 'asking' && (
          <div className="sci-actions sci-actions-start">
            <button type="button" className="sci-btn sci-btn-ghost" onClick={goToMap}>Science map</button>
          </div>
        )}
      </div>
    </div>
  )
}

function DiscoveryCard({ d }) {
  const [open, setOpen] = useState(false)
  return (
    <button type="button" className={`sci-discovery${open ? ' is-open' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <span className="sci-discovery-art"><SciArt k={d.art || d.key} size={56} /></span>
      <span className="sci-discovery-body">
        <span className="sci-discovery-title">{d.title}</span>
        {open && <span className="sci-discovery-blurb">{d.blurb}</span>}
      </span>
      <span className="sci-discovery-plus" aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
  )
}