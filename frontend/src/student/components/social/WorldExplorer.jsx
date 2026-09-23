import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocialWorlds } from '../../services/socialService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { WORLD_ORDER } from '../../data/socialWorldThemes'
import SOCIAL_WORLD_THEMES from '../../data/socialWorldThemes'
import { SOCIAL_EXPLORER } from '../../data/socialEnvironments'
import SocialArt from './art'
import './social.css'

// The World Explorer hub: a cartoon globe vista (not a grid) where the student
// lands on planet Earth and steps between eight "places" — each one a playable
// Social Science world. The hub is browseable logged out but every playable
// world (and the Daily Explorer Challenge) requires sign in — which the app
// sends them to, remembering where they were.
//
// Worlds unlock one after another, per student, driven by the backend: a world
// with a lock stays stuck until every stop of the world before it is solved.

const PLACES = [
  { x: 120, y: 70 },
  { x: 70, y: 280 },
  { x: 150, y: 470 },
  { x: 430, y: 560 },
  { x: 720, y: 580 },
  { x: 900, y: 460 },
  { x: 905, y: 250 },
  { x: 760, y: 60 },
]

function trailPath() {
  const segs = PLACES.map((n, i) => (i === 0 ? `M${n.x} ${n.y}` : `L${n.x} ${n.y}`))
  return segs.join(' ')
}

function trailLength() {
  let len = 0
  for (let i = 1; i < PLACES.length; i += 1) {
    const a = PLACES[i - 1]
    const b = PLACES[i]
    len += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return len
}

function Globevista() {
  return (
    <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="soc-vista" aria-hidden="true">
      <rect x="0" y="0" width="1000" height="640" fill="url(#socVistaSky)" />
      <defs>
        <linearGradient id="socVistaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c8ee" />
          <stop offset="100%" stopColor="#eaf6ff" />
        </linearGradient>
        <linearGradient id="socVistaSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7db3e8" />
          <stop offset="100%" stopColor="#4d8fce" />
        </linearGradient>
        <radialGradient id="socVistaGlobe">
          <stop offset="0%" stopColor="#7cc0f0" />
          <stop offset="100%" stopColor="#2e6fb0" />
        </radialGradient>
      </defs>

      {/* sun + sparkle stars */}
      <circle cx="70" cy="70" r="26" fill="#ffd27a" stroke="#e08a2b" strokeWidth="4" className="soc-vista-sun" />
      <circle cx="70" cy="70" r="34" fill="none" stroke="#ffd27a" strokeWidth="5" opacity="0.35" className="soc-vista-sun2" />
      {[
        [170, 30], [260, 60], [330, 18], [420, 42], [520, 22], [610, 52], [700, 18], [830, 46], [950, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 3} fill="#fff2bd" opacity={0.9} className="soc-vista-star" />
      ))}

      {/* drifting clouds */}
      <g className="soc-vista-cloud soc-vista-cloud-a">
        <ellipse cx="150" cy="120" rx="46" ry="22" fill="#ffffff" opacity="0.92" />
        <ellipse cx="180" cy="108" rx="34" ry="20" fill="#ffffff" opacity="0.92" />
        <ellipse cx="120" cy="112" rx="26" ry="16" fill="#ffffff" opacity="0.92" />
      </g>
      <g className="soc-vista-cloud soc-vista-cloud-b">
        <ellipse cx="880" cy="150" rx="52" ry="24" fill="#ffffff" opacity="0.9" />
        <ellipse cx="912" cy="136" rx="34" ry="18" fill="#ffffff" opacity="0.9" />
        <ellipse cx="846" cy="142" rx="30" ry="16" fill="#ffffff" opacity="0.9" />
      </g>

      {/* sea band at bottom */}
      <rect x="0" y="520" width="1000" height="120" fill="url(#socVistaSea)" opacity="0.55" />
      <path d="M0 520 Q120 500 240 520 Q360 540 480 520 Q600 500 720 520 Q840 540 1000 518 L1000 640 L0 640 Z" fill="#4d8fce" opacity="0.35" />

      {/* the big cartoon globe */}
      <g className="soc-vista-globe">
        <ellipse cx="540" cy="330" rx="235" ry="46" fill="none" stroke="#b8d8f0" strokeWidth="6" opacity="0.7" transform="rotate(-8 540 330)" />
        <circle cx="540" cy="330" r="205" fill="url(#socVistaGlobe)" stroke="#1f5d9e" strokeWidth="7" />
        <g className="soc-vista-globe-spin">
          <path d="M368 250 Q470 216 566 232 Q668 246 700 180 Q760 186 774 240 Q712 286 650 268 Q540 240 452 262 Q376 276 360 320 Z" fill="#5fae58" stroke="#3a7a50" strokeWidth="3" />
          <path d="M566 126 Q604 250 566 400 Q540 470 600 588 Q544 596 508 506 Q466 240 566 126 Z" fill="#6db681" stroke="#4f9d6b" strokeWidth="3" />
          <path d="M368 470 Q470 492 540 400 Q610 300 700 310" fill="none" stroke="#1f5d9e" strokeWidth="5" strokeDasharray="10 12" opacity="0.65" />
          <path d="M540 125 Q540 280 540 535 M330 330 Q540 330 750 330" stroke="#1f5d9e" strokeWidth="4" opacity="0.45" />
          <path d="M335 200 Q374 236 396 300 Q404 340 420 372 Q360 356 330 320 Q332 240 335 200 Z" fill="#0b1030" opacity="0.22" className="soc-vista-night" />
        </g>
        {/* orbit rocket */}
        <g className="soc-vista-orbit">
          <ellipse cx="540" cy="330" rx="330" ry="150" fill="none" stroke="#a778ff" strokeWidth="3" opacity="0.5" transform="rotate(-18 540 330)" strokeDasharray="12 10" />
          <circle cx="540" cy="330" r="330" fill="none" stroke="#cfe0f2" strokeWidth="2" opacity="0.4" transform="rotate(-18 540 330)" strokeDasharray="3 14" />
        </g>
      </g>

      {/* rocket sailing beside the globe */}
      <g transform="translate(806 120) rotate(24)" className="soc-vista-rocket">
        <path d="M0 -42 L14 -14 L14 30 L-14 30 L-14 -14 Z" fill="#ef6a5a" stroke="#a84a33" strokeWidth="3" />
        <path d="M0 -42 L0 -58" stroke="#8a6a3a" strokeWidth="4" />
        <circle cx="0" cy="10" r="7" fill="#cfe0f2" stroke="#8aa8c8" strokeWidth="2.4" />
        <path d="M-14 22 L-26 36 L-8 26 Z" fill="#ffb35c" stroke="#e0783f" strokeWidth="2.4" />
        <path d="M14 22 L26 36 L8 26 Z" fill="#ffb35c" stroke="#e0783f" strokeWidth="2.4" />
      </g>

      {/* distant mountains + river + trees (behind the places) */}
      <path d="M0 560 L180 380 L300 560 Z" fill="#8aa05a" stroke="#5f7a3e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M120 540 L230 420 L330 540 Z" fill="#6f8a4c" />
      <path d="M180 380 L168 416 L196 416 Z" fill="#ffffff" />
      <path d="M860 560 L960 400 L1000 470 L1000 640 L820 640 L820 570 Z" fill="#6f8a4c" />
      <path d="M900 520 Q948 480 1000 512 L1000 640 L880 640 Z" fill="#8aa05a" stroke="#5f7a3e" strokeWidth="3" strokeLinejoin="round" opacity="0.9" />
      <path d="M60 560 Q200 610 400 566 Q560 530 690 566 Q820 590 960 560 L960 640 L60 640 Z" fill="#4f9d6b" opacity="0.5" />

      {/* little trees */}
      <g fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2.6">
        <path d="M500 560 Q484 522 500 500 Q508 522 516 560 Z" />
        <path d="M700 520 Q686 490 700 470 Q708 490 714 520 Z" />
        <circle cx="440" cy="560" r="16" />
      </g>
      <rect x="497" y="560" width="6" height="14" rx="2.4" fill="#7a4f2b" />
      <rect x="697" y="520" width="6" height="13" rx="2.4" fill="#7a4f2b" />

      {/* small town row */}
      <g>
        <rect x="360" y="590" width="40" height="50" rx="3" fill="#f5efea" stroke="#a49a88" strokeWidth="2.6" />
        <path d="M380 590 L368 606 L392 606 Z" fill="#5b8def" stroke="#3b63c0" strokeWidth="2.4" />
        <rect x="412" y="600" width="34" height="40" rx="3" fill="#f5efea" stroke="#a49a88" strokeWidth="2.6" />
        <circle cx="429" cy="610" r="6" fill="#e0664f" stroke="#a84a33" strokeWidth="1.8" />
        <rect x="458" y="592" width="30" height="48" rx="3" fill="#6eb0e0" stroke="#3b63c0" strokeWidth="2.6" />
        <rect x="468" y="602" width="10" height="38" rx="2" fill="#bfe3ff" opacity="0.9" />
      </g>
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
    </svg>
  )
}

export default function WorldExplorer() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()

  const [worlds, setWorlds] = useState([])
  const [continueWorld, setContinueWorld] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lockNote, setLockNote] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getSocialWorlds()
      if (cancelled) return
      setWorlds(Array.isArray(res.worlds) ? res.worlds : [])
      setContinueWorld(res.continueWorld || null)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const byKey = new Map((worlds || []).map((w) => [String(w.id), w]))
  const ordered = WORLD_ORDER.map((key) => byKey.get(key) || { id: key, nameEn: key, name: '', locked: false, solved: 0, total: 0, completed: false })
  const path = trailPath()
  const pathLen = trailLength()

  const allUnlocked = ordered.every((w) => !w.locked)
  const anythingComplete = ordered.some((w) => w.completed)

  let explorerIndex = 0
  if (continueWorld) {
    const ci = ordered.findIndex((w) => String(w.id) === String(continueWorld))
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
    goTo(`/student/class5/social/${encodeURIComponent(w.id)}`)
  }

  function continueLearning() {
    if (continueWorld) {
      goTo(`/student/class5/social/${encodeURIComponent(continueWorld)}`)
    }
  }

  function openDaily() {
    goTo('/student/class5/social/daily')
  }

  if (loading) {
    return (
      <div className="soc-map-root">
        <div className="soc-map-skeleton" role="status" aria-label="Loading World Explorer" />
      </div>
    )
  }

  const headerText = isAuthenticated
    ? anythingComplete && allUnlocked
      ? 'Every world is explored — the whole trail glows behind you! Wander anywhere to play again.'
      : continueWorld
        ? `You have explored ${walkedCount} world${walkedCount === 1 ? '' : 's'} so far — continue at ${ordered.find((w) => String(w.id) === String(continueWorld))?.nameEn || 'your next world'}.`
        : 'One globe, eight worlds of wonder. Tap a place to begin.'
    : 'One globe, eight worlds of wonder — from the Solar System to our own community. Sign in to play any world.'

  return (
    <div className="soc-map-root">
      <header className="soc-map-header">
        <span className="soc-intro-eyebrow">Class 5 · World Explorer</span>
        <h1 className="soc-map-h1">The World Explorer</h1>
        <p className="soc-intro-text">{headerText}</p>
        {!isAuthenticated && (
          <p className="soc-map-guest-note">Browse the globe freely — tap a place to sign in and start exploring.</p>
        )}
      </header>

      <div className="soc-map-actions">
        {continueWorld && (
          <button type="button" className="soc-btn soc-btn-primary soc-map-continue" onClick={continueLearning}>
            Continue Learning → · {ordered.find((w) => String(w.id) === String(continueWorld))?.nameEn || 'next world'}
          </button>
        )}
        {!continueWorld && isAuthenticated && (
          <div className="soc-map-actions-done">Globe complete! Every world is open for replay.</div>
        )}
      </div>

      <div
        className="soc-map"
        style={{ '--soc-walked': `${walkedLen}px`, '--soc-trail': `${pathLen}px` }}
        role="group"
        aria-label="World Explorer globe map"
      >
        <Globevista />
        <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="soc-map-trail" aria-hidden="true">
          <path d={path} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={path}
            fill="none"
            stroke="var(--soc-map-accent, #ffcf6b)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${walkedLen} ${Math.max(1, pathLen - walkedLen)}`}
          />
        </svg>

        {ordered.map((w, i) => {
          const pos = PLACES[i] || { x: 0, y: 0 }
          const theme = SOCIAL_WORLD_THEMES[String(w.id)] || {}
          const accent = theme.accent || '#ffcf6b'
          const done = Boolean(w.completed)
          const open = !w.locked
          const isExplorerSpot = i === explorerIndex && ordered.length > 0
          return (
            <div
              key={String(w.id)}
              className={`soc-place${done ? ' is-done' : ''}${w.locked ? ' is-locked' : ''}`}
              style={{ left: `${(pos.x / 10).toFixed(2)}%`, top: `${(pos.y / 6.4).toFixed(2)}%`, '--place-accent': accent }}
            >
              <button
                type="button"
                className="soc-place-badge"
                onClick={() => openWorld(w)}
                aria-label={`${w.nameEn} world${w.locked ? ', locked — complete the previous world first' : done ? ', explored' : ''}`}
              >
                <span className="soc-place-art" aria-hidden="true">
                  <PlaceIcon id={String(w.id)} />
                </span>
                <span className="soc-place-name">{w.nameEn}</span>
                <span className="soc-place-tamil">{theme.name || ''}</span>
                {done && <span className="soc-place-done" aria-hidden="true">✓</span>}
                {w.locked && (
                  <span className="soc-place-lock" aria-hidden="true"><LockGlyph /></span>
                )}
                {open && isAuthenticated && w.total > 0 && (
                  <span className={`soc-place-chip${w.completed ? ' soc-place-chip-full' : ''}`}>
                    {w.solved}/{w.total}
                  </span>
                )}
                {i === 0 && <span className="soc-place-start">START</span>}
                {i === ordered.length - 1 && <span className="soc-place-finish">FINISH</span>}
              </button>
              {isExplorerSpot && (
                <span className="soc-place-explorer" aria-hidden="true">
                  <SOCIAL_EXPLORER />
                </span>
              )}
            </div>
          )
        })}
      </div>

      {lockNote && (
        <div className="soc-map-locknote" role="status">
          <span className="soc-map-locknote-icon"><LockGlyph /></span>
          {lockNote}
        </div>
      )}

      <section className="soc-daily-card" aria-label="Today's Explorer Challenge">
        <span className="soc-daily-card-art" aria-hidden="true">
          <span className="soc-daily-card-globe" />
          <span className="soc-daily-card-rocket" />
        </span>
        <div className="soc-daily-card-body">
          <span className="soc-intro-eyebrow">Fresh every day</span>
          <h2 className="soc-daily-card-title">Today&apos;s Explorer Challenge</h2>
          <p className="soc-daily-card-text">
            One rotating discovery — picture, map, matching or story — picked fresh each day and saved to your account.{' '}
            {isAuthenticated ? 'Take today&apos;s and it stays marked done until tomorrow.' : 'Sign in to take today&apos;s.'}
          </p>
          <button type="button" className="soc-btn soc-btn-primary" onClick={openDaily}>
            {isAuthenticated ? 'Take today&apos;s challenge →' : 'Sign in to play →'}
          </button>
        </div>
      </section>
    </div>
  )
}

const PLACE_ART = {
  'solar-system': 'sun',
  earth: 'globe',
  'india-explorer': 'flag',
  geography: 'compass',
  history: 'wheel',
  'freedom-struggle': 'charkha',
  civics: 'school',
  environment: 'tree',
}

function PlaceIcon({ id }) {
  return <SocialArt k={PLACE_ART[id] || 'map'} size={52} />
}