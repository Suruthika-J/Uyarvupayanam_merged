import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScienceWorlds } from '../../services/scienceService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SCIENCE_GUIDE } from '../../data/scienceEnvironments'
import SciArt from './art'
import '../social/social.css'
import './science.css'

// The Science Adventure hub: a cartoon "Science Land" vista (not a grid) where
// the student steps between thirteen worlds — each one a playable Class 5
// Science module with a mini experiment and question rounds — plus a glowing
// Daily Science Challenge pavilion at the start of the trail. Browseable logged
// out; every playable world and the daily challenge requires sign in, which
// the app sends them to, remembering where they were.
//
// Worlds unlock one after another, per student, driven by the backend: a world
// with a lock stays stuck until every question of the world before it is
// solved (the experiment, experimentDone, is a happy extra, the questions are
// the key).

// 14 nodes: daily pavilion + 13 worlds (in adventure order).
const PLACES = [
  { x: 120, y: 150 },       // Daily Science Challenge pavilion
  { x: 155, y: 330 },       // 1 living-world
  { x: 85, y: 480 },        // 2 human-body
  { x: 265, y: 590 },       // 3 food-nutrition
  { x: 435, y: 580 },       // 4 materials
  { x: 590, y: 600 },       // 5 matter
  { x: 745, y: 560 },       // 6 water
  { x: 895, y: 470 },       // 7 air
  { x: 920, y: 300 },       // 8 force-motion
  { x: 820, y: 140 },       // 9 light-sound
  { x: 640, y: 70 },        // 10 earth-space
  { x: 450, y: 95 },        // 11 environment
  { x: 300, y: 175 },       // 12 weather
  { x: 512, y: 300 },       // 13 science-lab (the lab dome)
]

const PLACE_ART = {
  daily: 'star',
  'living-world': 'tree',
  'human-body': 'heart',
  'food-nutrition': 'apple',
  materials: 'magnet',
  matter: 'ice',
  water: 'river',
  air: 'kite',
  'force-motion': 'ramp',
  'light-sound': 'lamp',
  'earth-space': 'earth',
  environment: 'recycle',
  weather: 'rainbow',
  'science-lab': 'flask',
}

const DAILY_NODE = {
  id: 'daily',
  name: 'Daily Science',
  nameEn: 'Daily Challenge',
  theme: { accent: '#f59e0b' },
}

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

function ScienceVista() {
  return (
    <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="sci-vista" aria-hidden="true">
      <defs>
        <linearGradient id="sciVistaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bde6ff" />
          <stop offset="100%" stopColor="#eefaff" />
        </linearGradient>
        <linearGradient id="sciVistaGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b7dc9f" />
          <stop offset="100%" stopColor="#7fb86f" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="640" fill="url(#sciVistaSky)" />

      <circle cx="70" cy="70" r="26" fill="#ffd27a" stroke="#e08a2b" strokeWidth="4" className="sci-vista-sun" />
      {[
        [170, 30], [260, 60], [330, 18], [420, 42], [520, 22], [610, 52], [700, 18], [830, 46], [950, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 3} fill="#fff2bd" opacity={0.9} className="sci-vista-star" />
      ))}

      <g className="sci-vista-cloud sci-vista-cloud-a">
        <ellipse cx="150" cy="110" rx="46" ry="22" fill="#ffffff" opacity="0.92" />
        <ellipse cx="180" cy="98" rx="34" ry="20" fill="#ffffff" opacity="0.92" />
        <ellipse cx="120" cy="102" rx="26" ry="16" fill="#ffffff" opacity="0.92" />
      </g>
      <g className="sci-vista-cloud sci-vista-cloud-b">
        <ellipse cx="880" cy="140" rx="52" ry="24" fill="#ffffff" opacity="0.9" />
        <ellipse cx="912" cy="126" rx="34" ry="18" fill="#ffffff" opacity="0.9" />
        <ellipse cx="846" cy="132" rx="30" ry="16" fill="#ffffff" opacity="0.9" />
      </g>

      <rect x="0" y="500" width="1000" height="140" fill="url(#sciVistaGround)" />
      <path d="M0 500 Q140 478 280 500 Q420 522 560 500 Q700 478 840 500 Q920 515 1000 498 L1000 640 L0 640 Z" fill="#6cb05f" opacity="0.5" />

      {/* the big lab dome (science-lab sits on it) */}
      <g className="sci-vista-dome">
        <path d="M340 360 Q512 220 684 360 L684 470 L340 470 Z" fill="#dbe9f8" stroke="#5b8def" strokeWidth="6" strokeLinejoin="round" />
        <path d="M542 172 Q540 188 542 200" stroke="#5b8def" strokeWidth="6" strokeLinecap="round" />
        <circle cx="542" cy="168" r="8" fill="#ff7043" stroke="#d84315" strokeWidth="3" />
        <path d="M370 250 Q430 226 484 250" stroke="#5b8def" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M400 360 Q470 336 540 360" stroke="#5b8def" strokeWidth="4" fill="none" opacity="0.6" />
        <rect x="418" y="300" width="16" height="96" rx="6" fill="#90caf9" opacity="0.9" />
        <rect x="452" y="330" width="16" height="66" rx="6" fill="#ffd27a" opacity="0.9" />
        <rect x="486" y="312" width="16" height="84" rx="6" fill="#66bb6a" opacity="0.9" />
        <rect x="524" y="286" width="16" height="110" rx="6" fill="#a778ff" opacity="0.9" />
        <path d="M400 424 Q512 452 620 424" stroke="#6d4c41" strokeWidth="6" opacity="0.7" />
      </g>

      {/* rocket trail */}
      <g transform="translate(806 300) rotate(24)" className="sci-vista-rocket">
        <path d="M0 -42 L14 -14 L14 30 L-14 30 L-14 -14 Z" fill="#ef6a5a" stroke="#a84a33" strokeWidth="3" />
        <path d="M0 -42 L0 -58" stroke="#8a6a3a" strokeWidth="4" />
        <circle cx="0" cy="10" r="7" fill="#cfe0f2" stroke="#8aa8c8" strokeWidth="2.4" />
        <path d="M-14 22 L-26 36 L-8 26 Z" fill="#ffb35c" stroke="#e0783f" strokeWidth="2.4" />
        <path d="M14 22 L26 36 L8 26 Z" fill="#ffb35c" stroke="#e0783f" strokeWidth="2.4" />
      </g>
      <path d="M806 330 Q780 380 760 420" stroke="#ffd27a" strokeWidth="4" strokeDasharray="3 10" fill="none" opacity="0.8" />

      {/* windmill on the hill */}
      <g transform="translate(160 350)">
        <path d="M70 170 L74 130 L86 110 L96 130 L96 170 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth="3" />
        <g className="sci-vista-windmill">
          <rect x="72" y="66" width="14" height="28" rx="3" fill="#66bb6a" stroke="#2e7d32" strokeWidth="2.4" />
          <rect x="44" y="74" width="66" height="14" rx="3" fill="#66bb6a" stroke="#2e7d32" strokeWidth="2.4" />
          <rect x="30" y="92" width="14" height="60" rx="3" fill="#66bb6a" stroke="#2e7d32" strokeWidth="2.4" />
          <rect x="112" y="92" width="14" height="60" rx="3" fill="#66bb6a" stroke="#2e7d32" strokeWidth="2.4" />
        </g>
        <circle cx="79" cy="80" r="6" fill="#546e7a" stroke="#263238" strokeWidth="2.4" />
      </g>

      {/* thermometer tower */}
      <g transform="translate(880 360)">
        <rect x="0" y="0" width="22" height="150" rx="10" fill="#ef5350" stroke="#b71c1c" strokeWidth="4" />
        <path d="M11 24 L11 130" stroke="#ffcdd2" strokeWidth="5" strokeLinecap="round" />
        <circle cx="11" cy="150" r="20" fill="#ef5350" stroke="#b71c1c" strokeWidth="4" />
        <path d="M-14 150 Q0 120 4 90" stroke="#ef8a1f" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      </g>

      {/* little trees + flowers */}
      <g fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2.6">
        <path d="M320 512 Q306 478 322 456 Q330 478 336 512 Z" />
        <path d="M716 508 Q702 476 718 454 Q726 476 730 508 Z" />
        <circle cx="250" cy="522" r="15" />
        <circle cx="430" cy="520" r="13" />
        <circle cx="770" cy="530" r="14" />
      </g>
      <rect x="316" y="512" width="6" height="13" rx="2.4" fill="#7a4f2b" />
      <rect x="714" y="508" width="6" height="13" rx="2.4" fill="#7a4f2b" />
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

export default function ScienceAdventureWorld() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()

  const [worlds, setWorlds] = useState([])
  const [continueWorld, setContinueWorld] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lockNote, setLockNote] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getScienceWorlds()
      if (cancelled) return
      const list = Array.isArray(res.worlds) ? res.worlds : []
      list.sort((a, b) => Number(a.order) - Number(b.order))
      setWorlds(list)
      setContinueWorld(res.continueWorld || null)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated])

  const ordered = worlds.length
    ? worlds
    : Array.from({ length: 13 }, (_, i) => ({
        id: `w${i + 1}`,
        order: i + 1,
        name: '',
        nameEn: `World ${i + 1}`,
        locked: false,
        solved: 0,
        total: 0,
        completed: false,
      }))
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

  const playedCount = ordered.filter((w) => w.completed || w.solved > 0).length
  const walkedLen = Math.min(pathLen, Math.round((playedCount / Math.max(1, ordered.length)) * pathLen))

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
    goTo(`/student/class5/science/${encodeURIComponent(w.id)}`)
  }

  function openDaily() {
    goTo('/student/class5/science/daily')
  }

  function continueLearning() {
    if (continueWorld) {
      goTo(`/student/class5/science/${encodeURIComponent(continueWorld)}`)
    }
  }

  if (loading) {
    return (
      <div className="sci-map-root">
        <div className="sci-map-skeleton" role="status" aria-label="Loading Science Adventure" />
      </div>
    )
  }

  const headerText = isAuthenticated
    ? anythingComplete && allUnlocked
      ? 'Every world is explored — the whole trail glows behind you! Wander anywhere to play again.'
      : continueWorld
        ? `You have explored ${playedCount} world${playedCount === 1 ? '' : 's'} so far — continue at ${ordered.find((w) => String(w.id) === String(continueWorld))?.nameEn || 'your next world'}.`
        : 'Thirteen worlds of wonder and a Daily Challenge pavilion — tap a place to begin.'
    : 'Thirteen worlds of wonder — plants to planets, kitchens to magnets. Sign in to play any world.'

  return (
    <div className="sci-map-root">
      <header className="sci-map-header">
        <span className="sci-intro-eyebrow">Class 5 · Science Adventure</span>
        <h1 className="sci-map-h1">The Science Adventure World</h1>
        <p className="sci-intro-text">{headerText}</p>
        {!isAuthenticated && (
          <p className="sci-map-guest-note">Wander the land freely — tap a place to sign in and start experimenting.</p>
        )}
      </header>

      <div className="soc-map-actions sci-map-actions">
        {continueWorld && (
          <button type="button" className="sci-btn sci-btn-primary sci-map-continue" onClick={continueLearning}>
            Continue Learning → · {ordered.find((w) => String(w.id) === String(continueWorld))?.nameEn || 'next world'}
          </button>
        )}
        {!continueWorld && isAuthenticated && (
          <div className="soc-map-actions-done">Adventure complete! Every world is open for replay.</div>
        )}
      </div>

      <div
        className="sci-map"
        style={{ '--sci-walked': `${walkedLen}px`, '--sci-trail': `${pathLen}px` }}
        role="group"
        aria-label="Science Adventure map"
      >
        <ScienceVista />
        <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="sci-map-trail" aria-hidden="true">
          <path d={path} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={path}
            fill="none"
            stroke="var(--sci-map-accent, #f59e0b)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${walkedLen} ${Math.max(1, pathLen - walkedLen)}`}
          />
        </svg>

        {/* daily pavilion node */}
        <div
          className="sci-place is-daily"
          style={{ left: `${(PLACES[0].x / 10).toFixed(2)}%`, top: `${(PLACES[0].y / 6.4).toFixed(2)}%`, '--place-accent': '#f59e0b' }}
        >
          <button type="button" className="sci-place-badge" onClick={openDaily} aria-label="Daily Science Challenge">
            <span className="sci-place-art" aria-hidden="true"><SciArt k="star" size={52} /></span>
            <span className="sci-place-name">{DAILY_NODE.nameEn}</span>
            <span className="sci-place-tamil">Daily Science</span>
            <span className="sci-place-daily">DAILY</span>
          </button>
        </div>

        {ordered.map((w, i) => {
          const pos = PLACES[i + 1] || { x: 0, y: 0 }
          const accent = (w.theme && w.theme.accent) || w.accent || '#3f9e4d'
          const done = Boolean(w.completed)
          const open = !w.locked
          const isExplorerSpot = i === explorerIndex && ordered.length > 0
          return (
            <div
              key={String(w.id)}
              className={`sci-place${done ? ' is-done' : ''}${w.locked ? ' is-locked' : ''}`}
              style={{ left: `${(pos.x / 10).toFixed(2)}%`, top: `${(pos.y / 6.4).toFixed(2)}%`, '--place-accent': accent }}
            >
              <button
                type="button"
                className="sci-place-badge"
                onClick={() => openWorld(w)}
                aria-label={`${w.nameEn} world${w.locked ? ', locked — complete the previous world first' : done ? ', explored' : ''}`}
              >
                <span className="sci-place-art" aria-hidden="true"><SciArt k={PLACE_ART[String(w.id)] || 'flask'} size={52} /></span>
                <span className="sci-place-name">{w.nameEn}</span>
                <span className="sci-place-tamil">{w.name || ''}</span>
                {done && <span className="sci-place-done" aria-hidden="true">✓</span>}
                {w.locked && (
                  <span className="sci-place-lock" aria-hidden="true"><LockGlyph /></span>
                )}
                {open && isAuthenticated && w.total > 0 && (
                  <span className={`sci-place-chip sci-place-chip-${w.completed ? 'full' : 'open'}`}>
                    {w.solved}/{w.total}
                  </span>
                )}
                {i === 0 && <span className="sci-place-start">START</span>}
                {i === ordered.length - 1 && <span className="sci-place-finish">FINISH</span>}
              </button>
              {isExplorerSpot && (
                <span className="sci-place-explorer" aria-hidden="true"><SCIENCE_GUIDE /></span>
              )}
            </div>
          )
        })}
      </div>

      {lockNote && (
        <div className="sci-map-locknote" role="status">
          <span className="sci-map-locknote-icon"><LockGlyph /></span>
          {lockNote}
        </div>
      )}

      <section className="sci-daily-card" aria-label="Today's Science Challenge">
        <span className="sci-daily-card-art" aria-hidden="true"><SciArt k="star" size={46} /></span>
        <div className="soc-daily-card-body">
          <span className="sci-intro-eyebrow">Fresh every day</span>
          <h2 className="soc-daily-card-title">Today&apos;s Science Challenge</h2>
          <p className="soc-daily-card-text">
            One fresh question each day from the Science land — matching, sorting, spells and maps — saved to your account.{' '}
            {isAuthenticated ? 'Take today&apos;s and it stays marked done until tomorrow.' : 'Sign in to take today&apos;s.'}
          </p>
          <button type="button" className="sci-btn sci-btn-primary" onClick={openDaily}>
            {isAuthenticated ? 'Take today&apos;s challenge →' : 'Sign in to play →'}
          </button>
        </div>
      </section>
    </div>
  )
}