import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSocialQuestion, answerSocialQuestion } from '../../services/socialService'
import { QUESTION_RENDERERS } from '../../data/socialQuestionTypes'
import { findWorld, WORLD_ORDER } from '../../data/socialWorldThemes'
import SocialFeedback from './SocialFeedback'
import { SOCIAL_SCENES, SOCIAL_EXPLORER } from '../../data/socialEnvironments'
import SocialArt from './art'
import { Portrait } from './characters'
import './social.css'

const DEFAULT_PALETTE = {
  skyTop: '#0b1030',
  skyBottom: '#3b2f8f',
  ground: '#151a3a',
  accent: '#ffd27a',
  cardBg: '#221c4d',
  cardAccent: '#a778ff',
}

const PORTRAIT_KEYS = ['gandhi', 'bose', 'nehru', 'rani', 'patel', 'bhagat', 'sarojini', 'besant']

function themeFrom(world) {
  if (world && world.theme) return world.theme
  if (world && world.palette) return world
  const seed = world && world.id ? findWorld(world.id) : null
  return seed ? seed.theme : null
}

function nextWorldFor(order) {
  if (!WORLD_ORDER || !Array.isArray(WORLD_ORDER)) return { world: null, name: '', final: true }
  const idx = WORLD_ORDER.indexOf(String(order))
  const nextIdx = idx >= 0 ? idx + 1 : -1
  if (nextIdx >= WORLD_ORDER.length) return { world: null, name: '', final: true }
  const world = WORLD_ORDER[nextIdx]
  const seed = findWorld(world)
  return { world, name: seed ? seed.nameEn : world, final: false }
}

function DiscoveryArt({ key, size = 64 }) {
  if (PORTRAIT_KEYS.includes(key)) {
    return <Portrait person={key} size={size} />
  }
  return <SocialArt k={key} size={size} />
}

export default function SocialWorld() {
  const { world: worldKey } = useParams()
  const navigate = useNavigate()

  const [world, setWorld] = useState(null)
  const [question, setQuestion] = useState(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [phase, setPhase] = useState('discover') // discover | activity
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
        const res = await getSocialQuestion(worldKey)
        if (cancelled) return
        if (!res || !res.question) {
          setHardError('This world is not on the Explorer map yet.')
          setLoading(false)
          return
        }
        bootFromResponse(res)
      } catch (err) {
        if (cancelled) return
        if (err && err.auth) {
          navigate('/student/signin', { state: { from: { pathname: `/student/class5/social/${encodeURIComponent(worldKey)}` } }, replace: true })
          return
        }
        setHardError(err && err.locked ? err.message : 'The World Explorer is taking a breath. Tap to try again in a moment.')
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [worldKey, navigate])

  const theme = themeFrom(world) || {}
  const palette = theme.palette || DEFAULT_PALETTE
  const environment = theme.environment || (world && world.environment) || 'space'
  const Explorer = SOCIAL_EXPLORER

  function handleAnswered(correct) {
    if (status !== 'asking') return
    if (correct) {
      setStatus('correct')
      setReporting(true)
      answerSocialQuestion(worldKey, question.id, true)
        .then((r) => {
          if (r && r.progress) setProgress(r.progress)
        })
        .catch((err) => {
          if (err && err.auth) {
            navigate('/student/signin', { state: { from: { pathname: `/student/class5/social/${encodeURIComponent(worldKey)}` } }, replace: true })
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
      answerSocialQuestion(worldKey, question.id, false).catch((err) => {
        if (err && err.auth) {
          navigate('/student/signin', { state: { from: { pathname: `/student/class5/social/${encodeURIComponent(worldKey)}` } }, replace: true })
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
    if (progress.completed >= Math.max(1, progress.total)) {
      setStatus('complete')
      return
    }
    busying.current = true
    setFading(true)
    window.setTimeout(async () => {
      try {
        const res = await getSocialQuestion(worldKey)
        busying.current = false
        if (!res || !res.question) {
          setHardError('This world is not on the Explorer map yet.')
          setFading(false)
          return
        }
        bootFromResponse(res)
        setFading(false)
      } catch (err) {
        busying.current = false
        setFading(false)
        if (err && err.auth) {
          navigate('/student/signin', { state: { from: { pathname: `/student/class5/social/${encodeURIComponent(worldKey)}` } }, replace: true })
        } else {
          setHardError(err && err.locked ? err.message : 'The World Explorer is taking a breath. Tap to retry in a moment.')
        }
      }
    }, 340)
  }

  function goToMap() {
    if (busying.current) return
    navigate('/student/class5/social')
  }

  const complete = status === 'complete' || (progress.completed >= Math.max(1, progress.total) && status !== 'asking')
  const nextWorld = complete && world ? nextWorldFor(world.order) : { world: null, name: '', final: true }

  function continueToNext() {
    if (!nextWorld.world) {
      goToMap()
      return
    }
    navigate(`/student/class5/social/${encodeURIComponent(nextWorld.world)}`)
  }

  function retryLoad() {
    setLoading(false)
    setStatus('asking')
    window.setTimeout(() => {
      setLoading(true)
      setHardError('')
      getSocialQuestion(worldKey)
        .then((res) => {
          if (res && res.question) bootFromResponse(res)
          else {
            setHardError('This world is not on the Explorer map yet.')
            setLoading(false)
          }
        })
        .catch((err) => {
          if (err && err.auth) {
            navigate('/student/signin', { state: { from: { pathname: `/student/class5/social/${encodeURIComponent(worldKey)}` } }, replace: true })
            return
          }
          setHardError(err && err.locked ? err.message : 'Still taking a breath. Try again in a moment.')
          setLoading(false)
        })
    }, 40)
  }

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

  if (loading && !world) {
    return (
      <div className="soc-root" style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}>
        <div className="soc-skeleton" role="status" aria-label="Loading world">
          <div className="soc-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="soc-skel-block" style={{ top: '36%', height: 96 }} />
          <div className="soc-skel-block" style={{ top: '54%', height: 160 }} />
        </div>
      </div>
    )
  }

  if (hardError || !question || !Renderer) {
    const msg = hardError || 'This world is not on the Explorer map yet. It may have been renamed, or it has no activities in the bank.'
    return (
      <div className="soc-root" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <div className="soc-scene">
          <div className="soc-bg-sky" />
          <div className="soc-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="soc-char-mount"><Explorer /></div>
        </div>
        <div className="soc-content">
          <div className="soc-intro">
            <span className="soc-intro-eyebrow">World Explorer · Class 5 Social Science</span>
            <p className="soc-intro-text">{msg}</p>
            <div className="soc-actions">
              <button type="button" className="soc-btn soc-btn-primary" onClick={hardError && !/not on the Explorer map|renamed|no activities/.test(msg) ? retryLoad : goToMap}>
                {hardError && !/not on the Explorer map|renamed|no activities/.test(msg) ? 'Try again' : 'Back to the World Explorer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const done = status === 'correct' || status === 'reveal' || status === 'complete'
  const discoveries = world && Array.isArray(world.discoveries) ? world.discoveries : []

  if (phase === 'discover' && !complete) {
    return (
      <div className="soc-root soc-root-discover" style={{ ...paletteStyle }}>
        <div className="soc-scene">
          <div className="soc-bg-sky" />
          <div className="soc-bg-scene">{SceneComponent && <SceneComponent />}</div>
          <div className="soc-char-mount"><Explorer /></div>
        </div>
        <div className="soc-content">
          <header className="soc-discover-head">
            <span className="soc-intro-eyebrow">{world.name} · {world.nameEn}</span>
            <h1 className="soc-intro-title">{world.guideLine || world.nameEn}</h1>
            <p className="soc-intro-text">{world.intro || ''}</p>
            <div className="soc-discover-skills">
              {(world.skills || []).map((s) => (
                <span key={s} className="soc-skill-chip">{s}</span>
              ))}
            </div>
          </header>

          <div className="soc-discover-grid" role="group" aria-label="things to touch and discover">
            {discoveries.map((d) => (
              <DiscoveryCard key={d.key} d={d} />
            ))}
          </div>

          <div className="soc-actions soc-actions-discover">
            <button type="button" className="soc-btn soc-btn-ghost" onClick={goToMap}>
              Explorer map
            </button>
            <button type="button" className="soc-btn soc-btn-primary soc-btn-big" onClick={() => setPhase('activity')}>
              Begin the adventure →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`soc-root${fading ? ' is-fading' : ''}${done ? ' is-done' : ''}`}
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
              {world.name} · {world.nameEn} · Stage {Math.min(progress.completed + 1, Math.max(1, progress.total))} of {Math.max(1, progress.total)}
            </span>
          </div>
          <h1 className="soc-intro-title">{world.nameEn}</h1>
          {!complete && <p className="soc-intro-text">{question.question}</p>}
        </header>

        {!complete && (
          <div className="soc-stage" aria-live="polite">
            <Renderer
              key={`${question.id}:form${retryToken}`}
              question={question}
              disabled={done}
              onAnswer={handleAnswered}
            />
          </div>
        )}

        <SocialFeedback
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
          nextLabel={progress.completed >= progress.total ? 'World explored →' : 'Next stop →'}
          onCompleteContinue={continueToNext}
        />

        {status === 'asking' && (
          <div className="soc-actions soc-actions-start">
            <button type="button" className="soc-btn soc-btn-ghost" onClick={goToMap}>
              Explorer map
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DiscoveryCard({ d }) {
  const [open, setOpen] = useState(false)
  return (
    <button type="button" className={`soc-discovery${open ? ' is-open' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <span className="soc-discovery-art">
        <DiscoveryArt key={d.key} size={56} />
      </span>
      <span className="soc-discovery-body">
        <span className="soc-discovery-title">{d.title}</span>
        {open && <span className="soc-discovery-blurb">{d.blurb}</span>}
      </span>
      <span className="soc-discovery-plus" aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
  )
}