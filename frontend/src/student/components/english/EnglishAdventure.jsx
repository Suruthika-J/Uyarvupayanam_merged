import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnglishBuddy from './EnglishBuddy'
import EnglishNav from './EnglishNav'
import EnglishVista from './scenes'
import EngArt from './art'
import { ACTIVITY_ART, LEVEL_ART } from './artIcons'
import { getEnglishProgress } from '../../services/englishService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { ENGLISH_ACTIVITIES, ENGLISH_LEVELS, levelFromStars } from '../../data/english/englishRewards'
import './english.css'

// The English Adventure hub — a cartoon "Storybook Town" where the student
// walks a trail of learning stops (writing → speaking → grammar → words →
// sentences → listening → progress), plus a glowing Daily Challenge pavilion
// at the start. Original cartoon art, no emoji, matches the Science/Social
// adventure maps. Guest-friendly: the town is browseable logged out, and
// tapping a door sends guests to Sign In with their destination saved.

// 8 nodes: daily pavilion + 7 trail stops (the daily-challenge activity IS
// the pavilion; the trail is writing, speaking, grammar, vocabulary,
// sentence-builder, listen-speak, progress).
const PLACES = [
  { x: 130, y: 200 },       // 0 Daily pavilion
  { x: 165, y: 340 },       // 1 writing
  { x: 125, y: 478 },       // 2 speaking
  { x: 320, y: 545 },       // 3 grammar
  { x: 520, y: 555 },       // 4 vocabulary
  { x: 705, y: 518 },       // 5 sentence-builder
  { x: 858, y: 400 },       // 6 listen-speak
  { x: 838, y: 200 },       // 7 progress (finish)
]

const TRAIL_ORDER = ['writing', 'speaking', 'grammar', 'vocabulary', 'sentence-builder', 'listen-speak', 'progress']

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

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
    </svg>
  )
}

export default function EnglishAdventure() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()

  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lockNote, setLockNote] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const state = await getEnglishProgress()
      if (cancelled) return
      setProgress(state)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated])

  function goTo(eventPath) {
    if (!isAuthenticated) {
      navigate('/student/signin', { state: { from: { pathname: eventPath } } })
      return
    }
    navigate(eventPath)
  }

  const stars = progress?.stars || 0
  const streak = progress?.streak || 0
  const levelObj = progress ? levelFromStars(progress.stars) : ENGLISH_LEVELS[0]
  const counts = progress?.activityCounts || {}
  const completedCount = progress?.activitiesCompleted || 0
  const nextLevel = ENGLISH_LEVELS.find((l) => l.level === levelObj.level + 1)
  const toNext = nextLevel
    ? Math.min(100, Math.round(((stars - levelObj.min) / Math.max(1, nextLevel.min - levelObj.min)) * 100))
    : 100

  // trail progress: how much of the storybook path has been walked
  const path = trailPath()
  const pathLen = trailLength()
  const playedCount = TRAIL_ORDER.filter((id) => (counts[id] || 0) > 0).length
  const walkedLen = Math.min(pathLen, Math.round((playedCount / Math.max(1, TRAIL_ORDER.length)) * pathLen))
  const nextActivity = TRAIL_ORDER.find((id) => !(counts[id] || 0) > 0)
  const allDone = playedCount >= TRAIL_ORDER.length

  // where the Buddy stands: the next stop to try
  let explorerIndex = 0
  if (!isAuthenticated) {
    explorerIndex = 0
  } else if (allDone) {
    explorerIndex = TRAIL_ORDER.length - 1
  } else {
    explorerIndex = Math.max(0, TRAIL_ORDER.indexOf(nextActivity))
  }

  function openActivity(a) {
    setLockNote('')
    goTo(`/student/class5/english/${a.id === 'grammar' ? 'basics' : a.path.split('/').pop()}`)
  }

  function openDaily() {
    goTo('/student/class5/english/daily-challenge')
  }

  if (loading) {
    return (
      <div className="eng-root">
        <EnglishNav current="hub" />
        <div className="eng-skeleton" role="status" aria-label="Loading English Adventure" />
      </div>
    )
  }

  const headerText = isAuthenticated
    ? allDone
      ? 'Every stop in the town is explored — the whole path glows behind you! Wander anywhere to play again.'
      : nextActivity
        ? `You have explored ${playedCount} stop${playedCount === 1 ? '' : 's'} so far — keep going at ${ENGLISH_ACTIVITIES.find((a) => a.id === nextActivity)?.title || 'your next stop'}.`
        : 'Eight friendly stops are waiting — tap a door to begin your English journey.'
    : 'Eight friendly stops are waiting — stories, speeches, grammar, words, sentences and listening. Sign in to play any stop.'

  return (
    <div className="eng-root">
      <EnglishNav current="hub" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · English Adventure</span>
        <h1 className="eng-h1">The English Adventure World</h1>
        <p className="eng-lede">
          A storybook town of words — write stories, speak boldly, solve grammar puzzles and collect stars.
          No scare-o-meters here: every try makes you stronger!
        </p>

        <div className="eng-stat-chips">
          <span className="eng-stat-chip"><span className="eng-stat-emoji" aria-hidden="true"><EngArt k="star" size={18} /></span> {stars} stars</span>
          <span className="eng-stat-chip"><span className="eng-stat-emoji" aria-hidden="true"><EngArt k="flame" size={18} /></span> {streak} day{streak === 1 ? '' : 's'} streak</span>
          <span className="eng-stat-chip"><span className="eng-stat-emoji" aria-hidden="true"><EngArt k={LEVEL_ART[levelObj.level] || 'star'} size={18} /></span> Level {levelObj.level} · {levelObj.name}</span>
          <span className="eng-stat-chip"><span className="eng-stat-emoji" aria-hidden="true"><EngArt k="target" size={18} /></span> {completedCount} activit{completedCount === 1 ? 'y' : 'ies'} done</span>
        </div>

        {!isAuthenticated && (
          <p className="eng-guest-note">
            <EngArt k="owl" size={22} /> Explore the town freely! Sign in to save your stars, badges and streak.
          </p>
        )}
      </header>

      {nextLevel ? (
        <div className="eng-level-card">
          <span className="eng-level-art" aria-hidden="true"><EngArt k={LEVEL_ART[levelObj.level] || 'star'} size={34} /></span>
          <div style={{ flex: 1 }}>
            <div className="eng-between">
              <span className="eng-level-name">{levelObj.name}</span>
              <span className="eng-level-next">{stars} / {nextLevel.min} stars → {nextLevel.name}</span>
            </div>
            <div className="eng-progress" style={{ marginTop: 10 }}>
              <div className="eng-progress-fill" style={{ width: `${toNext}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="eng-level-card">
          <span className="eng-level-art" aria-hidden="true"><EngArt k="trophy" size={34} /></span>
          <div className="eng-level-name">{levelObj.name} — highest level reached!</div>
        </div>
      )}

      <div className="eng-map-actions">
        {!allDone && nextActivity && isAuthenticated && (
          <button
            type="button"
            className="eng-btn eng-btn-primary eng-map-continue"
            onClick={() => openActivity(ENGLISH_ACTIVITIES.find((a) => a.id === nextActivity))}
          >
            Continue Learning → · {ENGLISH_ACTIVITIES.find((a) => a.id === nextActivity)?.title || 'next stop'}
          </button>
        )}
        {allDone && isAuthenticated && (
          <div className="eng-note" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <EngArt k="trophy" size={20} /> Adventure complete! Every stop is open for replay.
          </div>
        )}
      </div>

      <header className="eng-map-header">
        <span className="eng-eyebrow">Walk the storybook path</span>
        <h1 className="eng-map-h1">Welcome to Storybook Town</h1>
        <p className="eng-lede" style={{ margin: '0 auto' }}>{headerText}</p>
      </header>

      <div
        className="eng-map"
        style={{ '--eng-walked': `${walkedLen}px`, '--eng-trail': `${pathLen}px` }}
        role="group"
        aria-label="English Adventure map"
      >
        <EnglishVista />
        <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="eng-map-trail" aria-hidden="true">
          <path d={path} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={path}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${walkedLen} ${Math.max(1, pathLen - walkedLen)}`}
          />
        </svg>

        {/* daily pavilion node */}
        <div
          className="eng-place is-daily"
          style={{ left: `${(PLACES[0].x / 10).toFixed(2)}%`, top: `${(PLACES[0].y / 6.4).toFixed(2)}%`, '--place-accent': '#f59e0b' }}
        >
          <button type="button" className="eng-place-badge" onClick={openDaily} aria-label="Daily English Challenge">
            <span className="eng-place-art" aria-hidden="true"><EngArt k="calendar" size={46} /></span>
            <span className="eng-place-name">Daily Challenge</span>
            <span className="eng-place-tamil">Fresh every day</span>
            <span className="eng-place-daily">DAILY</span>
          </button>
        </div>

        {TRAIL_ORDER.map((id, i) => {
          const pos = PLACES[i + 1] || { x: 0, y: 0 }
          const a = ENGLISH_ACTIVITIES.find((x) => x.id === id)
          const done = (counts[id] || 0) > 0
          const isExplorerSpot = i === explorerIndex
          return (
            <div
              key={id}
              className={`eng-place${done ? ' is-done' : ''}`}
              style={{ left: `${(pos.x / 10).toFixed(2)}%`, top: `${(pos.y / 6.4).toFixed(2)}%`, '--place-accent': a.color }}
            >
              <button type="button" className="eng-place-badge" onClick={() => a && openActivity(a)} aria-label={`${a.title}${done ? ', explored' : ''}`}>
                <span className="eng-place-art" aria-hidden="true"><EngArt k={ACTIVITY_ART[id] || 'star'} size={38} /></span>
                <span className="eng-place-name">{a.title}</span>
                <span className="eng-place-tamil">{a.description.split('.')[0]}</span>
                {done && <span className="eng-place-done" aria-hidden="true">✓</span>}
                {i === 0 && <span className="eng-place-start">START</span>}
                {i === TRAIL_ORDER.length - 1 && <span className="eng-place-finish">FINISH</span>}
              </button>
              {isExplorerSpot && (
                <span className="eng-place-explorer" aria-hidden="true"><EngArt k="owl" size={54} /></span>
              )}
            </div>
          )
        })}
      </div>

      {lockNote && (
        <div className="eng-map-locknote" role="status">
          <span className="eng-map-locknote-icon"><LockGlyph /></span>
          {lockNote}
        </div>
      )}

      <section className="eng-daily-card" aria-label="Today's English Challenge">
        <span className="eng-daily-card-art" aria-hidden="true"><EngArt k="calendar" size={40} /></span>
        <div className="eng-daily-card-body">
          <span className="eng-eyebrow" style={{ marginBottom: 0 }}>Fresh every day</span>
          <h2 className="eng-daily-card-title">Today&apos;s English Mission</h2>
          <p className="eng-daily-card-text">
            A fresh little mission every day — write, speak, solve or listen. Win bonus stars the moment you finish!{' '}
            {isAuthenticated ? 'Take today&apos;s and it stays marked done until tomorrow.' : 'Sign in to take today&apos;s.'}
          </p>
          <button type="button" className="eng-btn eng-btn-primary" onClick={openDaily}>
            {isAuthenticated ? 'Take the mission →' : 'Sign in to play →'}
          </button>
        </div>
      </section>

      <div style={{ marginTop: 26 }}>
        <EnglishBuddy
          state="happy"
          size="md"
          message={
            isAuthenticated
              ? 'Pick any door in Storybook Town and start playing — I will cheer you on at every step! The Daily Mission gives you bonus stars!'
              : 'Sign in so your stars and badges stay safe. Until then, wander the town and peek around!'
          }
        />
      </div>
    </div>
  )
}