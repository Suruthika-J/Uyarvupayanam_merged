import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { BADGE_ART, LEVEL_ART, TOPIC_ART } from './artIcons'
import { getEnglishProgress } from '../../services/englishService'
import { BADGES, ENGLISH_LEVELS, levelFromStars } from '../../data/english/englishRewards'
import { GRAMMAR_TOPICS } from '../../data/english/englishGrammar'
import './english.css'

// A warm map of everything the child has earned: stars, streak, level,
// badges, grammar worlds and the little lessons still being learned.
export default function MyEnglishProgress() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const state = await getEnglishProgress()
      if (cancelled) return
      setProgress(state)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const stars = (progress && progress.stars) || 0
  const streak = (progress && progress.streak) || 0
  const bestStreak = (progress && progress.bestStreak) || 0
  const activities = (progress && progress.activitiesCompleted) || 0
  const questionsSolved = ((progress && progress.grammarTopics) || []).reduce((n, t) => n + (t.solved || 0), 0)

  const level = progress ? levelFromStars(progress.stars) : ENGLISH_LEVELS[0]
  const nextLevel = ENGLISH_LEVELS.find((l) => l.level === level.level + 1)
  const pct = nextLevel
    ? Math.min(100, Math.round(((stars - level.min) / Math.max(1, nextLevel.min - level.min)) * 100))
    : 100
  const toNext = nextLevel ? Math.max(0, nextLevel.min - stars) : 0

  let buddyState = 'encouraging'
  let buddyMessage = 'Take your first step — any activity will do!'
  if (stars >= 300) {
    buddyState = 'celebrating'
    buddyMessage = 'Wow, you are an English champion in the making — keep shining!'
  } else if (stars >= 50) {
    buddyState = 'happy'
    buddyMessage = 'Look at you go! Your English is growing stronger every single day.'
  }

  const topicRows = {}
  ;((progress && progress.grammarTopics) || []).forEach((t) => {
    topicRows[t.topicId] = t
  })
  const mistakes = (progress && progress.commonMistakes) || []
  const maxMistake = Math.max(1, ...mistakes.map((m) => m.count || 0))

  return (
    <div className="eng-root" style={{ '--eng-accent': '#6366f1', '--eng-soft': '#eef0ff' }}>
      <EnglishNav current="progress" />

      {loading ? (
        <>
          <div className="eng-skeleton" role="status" aria-label="Loading your progress" />
          <div className="eng-skeleton" style={{ marginTop: 14 }} />
        </>
      ) : (
        <>
          <header className="eng-hero">
            <div className="eng-between">
              <div>
                <span className="eng-eyebrow">Class 5 · My English Progress</span>
                <h1 className="eng-h1">My English Progress</h1>
                <p className="eng-lede">
                  Here is the map of your English journey — every star and badge is a step you earned yourself!
                </p>
              </div>
              <button type="button" className="eng-btn eng-btn-ghost" onClick={() => setRefreshKey((k) => k + 1)}>
                Refresh
              </button>
            </div>
          </header>

          <EnglishBuddy state={buddyState} message={buddyMessage} size="md" />

          {activities === 0 ? (
            <div className="eng-empty" style={{ margin: '20px 0' }}>
              <p style={{ fontSize: 15, color: '#475569', fontWeight: 700 }}>
                Your adventure map is full of exciting blank space — the best kind!
              </p>
              <p style={{ fontSize: 13.5, color: '#8ea0b4', margin: '6px 0 0' }}>
                Play any English game and your first star, badge and level will appear right here.
              </p>
              <button type="button" className="eng-btn eng-btn-primary eng-mt" onClick={() => navigate('/student/class5/english')}>
                Start your first English adventure
              </button>
            </div>
          ) : (
            <>
              <div className="eng-stat-grid">
                <div className="eng-stat-box">
                  <div className="eng-stat-num"><span className="eng-stat-emoji" style={{ marginRight: 6 }} aria-hidden="true"><EngArt k="star" size={20} /></span>{stars}</div>
                  <div className="eng-stat-label">Stars</div>
                </div>
                <div className="eng-stat-box">
                  <div className="eng-stat-num"><span className="eng-stat-emoji" style={{ marginRight: 6 }} aria-hidden="true"><EngArt k="flame" size={20} /></span>{streak}</div>
                  <div className="eng-stat-label">Streak days</div>
                </div>
                <div className="eng-stat-box">
                  <div className="eng-stat-num"><span className="eng-stat-emoji" style={{ marginRight: 6 }} aria-hidden="true"><EngArt k="trophy" size={20} /></span>{bestStreak}</div>
                  <div className="eng-stat-label">Best streak</div>
                </div>
                <div className="eng-stat-box">
                  <div className="eng-stat-num"><span className="eng-stat-emoji" style={{ marginRight: 6 }} aria-hidden="true"><EngArt k="puzzle" size={20} /></span>{questionsSolved}</div>
                  <div className="eng-stat-label">Questions solved</div>
                </div>
                <div className="eng-stat-box">
                  <div className="eng-stat-num"><span className="eng-stat-emoji" style={{ marginRight: 6 }} aria-hidden="true"><EngArt k="target" size={20} /></span>{activities}</div>
                  <div className="eng-stat-label">Activities done</div>
                </div>
                <div className="eng-stat-box">
                  <div className="eng-stat-num"><span className="eng-stat-emoji" aria-hidden="true"><EngArt k={LEVEL_ART[level.level] || 'star'} size={28} /></span></div>
                  <div className="eng-stat-label">Level {level.level} · {level.name}</div>
                </div>
              </div>

              <div className="eng-level-card">
                <span className="eng-level-art" aria-hidden="true"><EngArt k={LEVEL_ART[level.level] || 'star'} size={34} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="eng-between">
                    <span className="eng-level-name">Level {level.level} · {level.name}</span>
                    {nextLevel && (
                      <span className="eng-chip eng-chip-soft">{toNext} stars to {nextLevel.name}</span>
                    )}
                  </div>
                  {nextLevel ? (
                    <>
                      <div className="eng-progress" style={{ marginTop: 10 }}>
                        <div className="eng-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="eng-level-next" style={{ marginTop: 6 }}>
                        {toNext} stars to {nextLevel.name} — you are on your way!
                      </div>
                    </>
                  ) : (
                    <div className="eng-center" style={{ marginTop: 12 }}>
                      <EngArt k="crown" size={40} />
                      <p style={{ fontWeight: 800, color: '#b45309', margin: '8px 0 0' }}>
                        You reached the highest level — English Champion!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 19, color: '#1e293b', margin: '0 0 12px' }}>
                Badges
              </h2>
              <div className="eng-badge-grid">
                {BADGES.map((b) => {
                  const earned = ((progress && progress.badges) || []).includes(b.key)
                  return (
                    <div key={b.key} className={`eng-badge${earned ? '' : ' locked'}`}>
                      <span className="eng-badge-emoji" aria-hidden="true"><EngArt k={BADGE_ART[b.key] || 'star'} size={30} /></span>
                      <div className="eng-badge-name">{b.name}</div>
                      <div className="eng-badge-hint">{earned ? b.hint : `Find it: ${b.hint}`}</div>
                    </div>
                  )
                })}
              </div>

              <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 19, color: '#1e293b', margin: '0 0 12px' }}>
                Grammar worlds
              </h2>
              {GRAMMAR_TOPICS.map((t) => {
                const row = topicRows[t.id]
                const solved = (row && row.solved) || 0
                const total = (row && row.total) || 0
                const gpct = Math.min(100, Math.round((solved / 40) * 100))
                return (
                  <div key={t.id} className="eng-mistake" style={{ marginBottom: 10 }}>
                    <div className="eng-mistake-head">
                      <span><span className="eng-stat-emoji" style={{ marginRight: 5 }} aria-hidden="true"><EngArt k={TOPIC_ART[t.id] || 'star'} size={16} /></span>{t.name}</span>
                      <span className="eng-chip">{solved}/{total}</span>
                    </div>
                    <div className="eng-topic-bar">
                      <span style={{ width: `${gpct}%` }} />
                    </div>
                  </div>
                )
              })}

              {mistakes.length > 0 && (
                <>
                  <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 19, color: '#1e293b', margin: '22px 0 6px' }}>
                    Things I&apos;m learning
                  </h2>
                  <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 12px' }}>
                    Every mistake is a lesson — look how you are growing!
                  </p>
                  <div className="eng-mistakes">
                    {mistakes.map((m) => (
                      <div key={m.topic} className="eng-mistake">
                        <div className="eng-mistake-head">
                          <span>{m.topic}</span>
                          <span>×{m.count}</span>
                        </div>
                        <div className="eng-topic-bar">
                          <span style={{ width: `${Math.min(100, Math.round(((m.count || 0) / maxMistake) * 100))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}