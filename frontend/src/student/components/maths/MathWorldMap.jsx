import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMathsWorlds } from '../../services/mathsService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { WORLD_ORDER } from '../../data/mathWorldThemes'
import { MATH_SCENES, MATH_EXPLORER } from '../../data/mathEnvironments'
import './maths.css'

// The Math Adventure World map: a winding storybook trail (not a grid) that
// snakes across an illustrated paper map. Each world is a stop on the trail
// painted with its own scene art. The map is browseable logged out but every
// playable world (and the Daily Challenge) requires sign in - which the app
// sends them to, remembering where they were.
//
// Worlds unlock one after another, per student, driven by the backend: a world
// with a lock stays stuck until every stop of the world before it is solved.

const NODES = [
  { x: 150, y: 62 },
  { x: 500, y: 118 },
  { x: 850, y: 58 },
  { x: 880, y: 196 },
  { x: 520, y: 218 },
  { x: 158, y: 226 },
  { x: 196, y: 386 },
  { x: 520, y: 372 },
  { x: 850, y: 390 },
  { x: 740, y: 522 },
  { x: 402, y: 518 },
]

function trailPath() {
  const segs = NODES.map((n, i) => (i === 0 ? `M${n.x} ${n.y}` : `L${n.x} ${n.y}`))
  return segs.join(' ')
}

function trailLength() {
  let len = 0
  for (let i = 1; i < NODES.length; i += 1) {
    const a = NODES[i - 1]
    const b = NODES[i]
    len += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return len
}

function MapThumb({ scene, locked }) {
  const Scene = scene || MATH_SCENES.valley
  return (
    <span className={`mth-map-thumb${locked ? ' mth-map-thumb-locked' : ''}`}>
      <span className="mth-map-thumb-sky" />
      <span className="mth-map-thumb-art">
        <Scene />
      </span>
      {locked && (
        <span className="mth-map-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
          </svg>
        </span>
      )}
    </span>
  )
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
    </svg>
  )
}

export default function MathWorldMap() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()

  const [worlds, setWorlds] = useState([])
  const [continueTopic, setContinueTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lockNote, setLockNote] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getMathsWorlds()
      if (cancelled) return
      setWorlds(Array.isArray(res.worlds) ? res.worlds : [])
      setContinueTopic(res.continueTopic || null)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const byKey = new Map((worlds || []).map((w) => [String(w.id), w]))
  const ordered = WORLD_ORDER.map((key) => byKey.get(key) || { id: key, nameEn: key, locked: false, solved: 0, total: 0, completed: false })
  const path = trailPath()
  const pathLen = trailLength()

  const allUnlocked = ordered.every((w) => !w.locked)
  const anythingComplete = ordered.some((w) => w.completed)

  // Explorer stands on the world the student should continue (first open,
  // incomplete world), or at the start when browsing logged out.
  let explorerIndex = 0
  if (continueTopic) {
    const ci = ordered.findIndex((w) => String(w.id) === String(continueTopic))
    if (ci >= 0) explorerIndex = ci
  } else if (!isAuthenticated) {
    explorerIndex = 0
  } else if (anythingComplete && allUnlocked) {
    explorerIndex = ordered.length - 1
  }

  const walkedCount = ordered.filter((w) => w.completed || w.solved > 0).length
  const walkedLen = Math.min(pathLen, Math.round((walkedCount / Math.max(1, ordered.length)) * pathLen))

  function goTo(eventPath) {
    if (!isAuthenticated) {
      navigate('/student/signin', { state: { from: { pathname: eventPath } } })
      return
    }
    navigate(eventPath)
  }

  function openWorld(w) {
    if (w.locked) {
      const prevIdx = ordered.findIndex((o) => String(o.id) === String(w.id)) - 1
      const prevName = prevIdx >= 0 && ordered[prevIdx] ? ordered[prevIdx].nameEn : 'the previous world'
      setLockNote(`Finish ${prevName} first — ${w.nameEn} unlocks when you do!`)
      return
    }
    setLockNote('')
    goTo(`/student/class5/maths/${encodeURIComponent(w.id)}`)
  }

  function continueLearning() {
    if (continueTopic) {
      goTo(`/student/class5/maths/${encodeURIComponent(continueTopic)}`)
    }
  }

  function openDaily() {
    goTo('/student/class5/maths/daily')
  }

  if (loading) {
    return (
      <div className="mth-map-root">
        <div className="mth-map-skeleton" role="status" aria-label="Loading map" />
      </div>
    )
  }

  const headerText = isAuthenticated
    ? anythingComplete && allUnlocked
      ? 'Every world is finished — the whole trail glows behind you! Wander anywhere to play again.'
      : continueTopic
        ? `You have explored ${walkedCount} world${walkedCount === 1 ? '' : 's'} so far — continue at ${ordered.find((w) => String(w.id) === String(continueTopic))?.nameEn || 'your next world'}.`
        : 'One winding trail, eleven worlds. Tap a signpost to begin.'
    : 'One winding trail, eleven worlds. Along the way you will meet the NumberChars, share apples, slice cakes, read clocks and count coins. Sign in to play any world.'

  return (
    <div className="mth-map-root">
      <header className="mth-map-header">
        <span className="mth-intro-eyebrow">Class 5 · Math Adventure World</span>
        <h1 className="mth-map-h1">The Math Adventure World</h1>
        <p className="mth-intro-text">{headerText}</p>
        {!isAuthenticated && (
          <p className="mth-map-guest-note">Browse the map freely — tap a world to sign in and start the adventure.</p>
        )}
      </header>

      <div className="mth-map-actions">
        {continueTopic && (
          <button type="button" className="mth-btn mth-btn-primary mth-map-continue" onClick={continueLearning}>
            Continue Learning → · {ordered.find((w) => String(w.id) === String(continueTopic))?.nameEn || 'next world'}
          </button>
        )}
        {!continueTopic && isAuthenticated && (
          <div className="mth-map-actions-done">Trail complete! Every world is open for replay.</div>
        )}
      </div>

      <div
        className="mth-map"
        style={{ '--mth-walked': `${walkedLen}px`, '--mth-trail': `${pathLen}px` }}
        role="group"
        aria-label="Math Adventure world map"
      >
        <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet" className="mth-map-svg" aria-hidden="true">
          <path d={path} fill="none" stroke="rgba(120,140,160,0.35)" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 18" />
          <path
            d={path}
            fill="none"
            stroke="var(--mth-accent, #ffcf6b)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${walkedLen} ${Math.max(1, pathLen - walkedLen)}`}
          />
        </svg>

        {ordered.map((w, i) => {
          const pos = NODES[i] || { x: 0, y: 0 }
          const theme = w.theme || {}
          const palette = theme.palette || {}
          const done = Boolean(w.completed)
          const open = !w.locked
          const isExplorerSpot = i === explorerIndex && ordered.length > 0
          return (
            <div
              key={String(w.id)}
              className={`mth-map-node${done ? ' is-done' : ''}${w.locked ? ' is-locked' : ''}`}
              style={{ left: `${(pos.x / 10).toFixed(2)}%`, top: `${(pos.y / 5.6).toFixed(2)}%` }}
            >
              <button
                type="button"
                className="mth-map-badge"
                onClick={() => openWorld(w)}
                aria-label={`${w.nameEn} world${w.locked ? ', locked — complete the previous world first' : done ? ', explored' : ''}`}
                style={{
                  '--badge-bg': palette.cardBg || '#fff7e8',
                  '--badge-accent': theme.accent || 'var(--mth-accent, #ffcf6b)',
                  '--n-top': palette.skyTop || '#cfe3f5',
                  '--n-bottom': palette.skyBottom || '#ffd9a0',
                }}
              >
                <MapThumb scene={MATH_SCENES[theme.environment]} locked={w.locked} />
                <span className="mth-map-name">{w.nameEn}</span>
                {done && (
                  <span className="mth-map-done" aria-hidden="true">
                    ✓
                  </span>
                )}
                {open && isAuthenticated && w.total > 0 && (
                  <span className={`mth-map-chip${w.completed ? ' mth-map-chip-full' : ''}`}>
                    {w.solved}/{w.total}
                  </span>
                )}
                {i === 0 && <span className="mth-map-start">start</span>}
                {i === ordered.length - 1 && <span className="mth-map-finish">finish</span>}
              </button>
              {isExplorerSpot && (
                <span className="mth-map-explorer" aria-hidden="true">
                  <MATH_EXPLORER pose="wave" />
                </span>
              )}
            </div>
          )
        })}
      </div>

      {lockNote && (
        <div className="mth-map-locknote" role="status">
          <span className="mth-map-locknote-icon">
            <LockGlyph />
          </span>
          {lockNote}
        </div>
      )}

      <section className="mth-daily-card" aria-label="Today's Math Challenge">
        <span className="mth-daily-card-art" aria-hidden="true">
          <span className="mth-daily-card-sun" />
          <NumberCharMark />
        </span>
        <div className="mth-daily-card-body">
          <span className="mth-intro-eyebrow">Fresh every day</span>
          <h2 className="mth-daily-card-title">Today&apos;s Math Challenge</h2>
          <p className="mth-daily-card-text">
            One rotating puzzle — visual, story, or interactive — picked fresh each day and saved to your account.{' '}
            {isAuthenticated ? 'Take today&apos;s and it stays marked done until tomorrow.' : 'Sign in to take today&apos;s.'}
          </p>
          <button type="button" className="mth-btn mth-btn-primary" onClick={openDaily}>
            {isAuthenticated ? 'Take today&apos;s challenge →' : 'Sign in to play →'}
          </button>
        </div>
      </section>
    </div>
  )
}

function NumberCharMark() {
  return (
    <span className="mth-daily-card-num" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    </span>
  )
}