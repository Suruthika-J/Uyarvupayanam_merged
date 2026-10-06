import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../../services/skillsApi'
import SkillIcon from '../../../components/class8/skills/SkillIcon'
import { STAGE_LABEL } from '../../../components/class8/skills/stages'
import './skills.css'

const MECH_TXT = {
  choice: 'Decide',
  pattern: 'Pattern',
  order: 'Order',
  sort: 'Sort',
  match: 'Match',
  decode: 'Code',
  speak: 'Speak',
  create: 'Create',
}

function StageBadge({ stage }) {
  const cls = stage === 'not-assessed' ? 'na' : stage
  return <span className={`sk-stage ${cls}`}>{(STAGE_LABEL[stage] || 'Not yet assessed')}</span>
}

export default function SkillsDashboardPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    getDashboard()
      .then((r) => setData(r))
      .catch((e) => setErr(e))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  if (loading) {
    return <div className="skills-page"><div className="skills-inner"><div className="sk-state"><span className="emoji">⏳</span><h3>Loading skills…</h3></div></div></div>
  }

  if (err || !data) {
    return (
      <div className="skills-page">
        <div className="skills-inner">
          <div className="sk-state">
            <span className="emoji">⚠️</span>
            <h3>Could not load Skill Adventure</h3>
            <p>{err ? (err.message || 'Please try again.') : 'No data yet.'}</p>
            <button type="button" className="sk-btn" onClick={load}>↺ Retry</button>
          </div>
        </div>
      </div>
    )
  }

  const resume = data.resume
  const reco = data.recommendation
  const diagnosticDone = data.diagnostic?.completed
  const milestoneCodes = new Set((data.milestones || []).map((m) => m.code))

  return (
    <div className="skills-page">
      <div className="skills-inner">
        <div className="skills-hero">
          <h1>🎮 Your Skill Adventure</h1>
          <p>
            Eight real-life skill areas, 24 tiny games, three stages per game. Play your way from
            <b> Explorer</b> → <b>Challenger</b> → <b>Master</b>. Every game adds real evidence to your
            learning profile — no fake completions, no shortcuts.
          </p>
          <div className="skills-hero-actions">
            {!diagnosticDone ? (
              <Link className="sk-hero-btn primary" to="/student/class8/skills/diagnostic">🧭 Take the starter diagnostic</Link>
            ) : reco ? (
              <Link
                className="sk-hero-btn primary"
                to={`/student/class8/skills/${reco.categoryId}/game/${reco.activityId}?level=${reco.level || 1}`}
              >
                ▶ Play next: {reco.activityTitle}
              </Link>
            ) : (
              <Link className="sk-hero-btn primary" to="/student/class8/skills/communication">▶ Start playing</Link>
            )}
            <Link className="sk-hero-btn ghost" to="/student/class8">← Back to Class 8</Link>
          </div>
        </div>

        {resume && (
          <div className="sk-section">
            <div className="sk-resume">
              <div className="txt">
                <b>↻ You left a mission unfinished</b>
                <span>{resume.attempt.activityTitle} · {resume.attempt.categoryName}{resume.attempt.mode === 'diagnostic' ? '' : ` · Level ${resume.attempt.level}`} — jump back in where you stopped.</span>
              </div>
              <Link
                className="sk-btn"
                to={resume.attempt.mode === 'diagnostic'
                  ? '/student/class8/skills/diagnostic'
                  : `/student/class8/skills/${resume.attempt.skillId}/game/${resume.attempt.activityId}?level=${resume.attempt.level}`}
              >
                Continue →
              </Link>
            </div>
          </div>
        )}

        {reco && reco.kind !== 'diagnostic' && reco.categoryId && reco.recommendedActivity && (
          <div className="sk-section">
            <div className="sk-section-head"><h2>🎯 Recommended for you</h2></div>
            <div className="sk-reco">
              <div className="ico" style={{ background: `${reco.categoryColor || '#1a7a50'}1a`, color: reco.categoryColor || '#1a7a50' }}>
                <SkillIcon name={reco.activityIcon} size={26} />
              </div>
              <div className="body">
                <span className="kicker">{reco.source === 'ld' ? 'From your learning profile' : 'Based on your progress'} · {reco.categoryName}</span>
                <h3>{reco.activityTitle}</h3>
                <p>{reco.reason}</p>
              </div>
              <Link
                className="sk-btn"
                to={`/student/class8/skills/${reco.categoryId}/game/${reco.activityId}?level=${reco.level || 1}`}
              >
                Play {reco.levelName || `Level ${reco.level || 1}`} →
              </Link>
            </div>
          </div>
        )}

        <div className="sk-section">
          <div className="sk-section-head">
            <h2>🧩 Your skill areas</h2>
            <span className="muted">{data.totalCompleted || 0} games completed · {data.totalActivityIds || 0}/24 different games</span>
          </div>
          <div className="skills-grid">
            {(data.categories || []).map((c) => (
              <Link key={c.id} className="sk-card" to={`/student/class8/skills/${c.id}`}>
                <div className="sk-card-top">
                  <div className="sk-card-icon" style={{ background: `${c.color || '#1a7a50'}1a`, color: c.color || '#1a7a50' }}>
                    <SkillIcon name={c.icon} size={24} />
                  </div>
                  <StageBadge stage={c.stage} />
                </div>
                <h3>{c.name}</h3>
                <p className="tag">{c.short}</p>
                <div className="sk-card-meta">
                  <span className="sk-pill green">{c.completedActivities || 0}/3 games</span>
                  {c.bestScore != null && <span className="sk-pill">Best {c.bestScore}</span>}
                  {c.weightedScore != null && c.weightedScore >= 60 && <span className="sk-pill amber">Building strength</span>}
                </div>
                <span style={{ color: c.color || '#1a7a50', fontSize: 13, fontWeight: 600 }}>Explore {c.activities?.length || 3} games →</span>
              </Link>
            ))}
          </div>
        </div>

        {(data.milestones || []).length > 0 && (
          <div className="sk-section">
            <div className="sk-section-head"><h2>🏅 Milestones</h2></div>
            <div className="sk-mstones">
              {data.milestones.map((m) => (
                <span key={m.code} className={`sk-mstone${milestoneCodes.has(m.code) ? ' got' : ''}`}>
                  🏅 {m.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {(data.recentCompletions || []).length > 0 && (
          <div className="sk-section">
            <div className="sk-section-head"><h2>🕘 Recent missions</h2></div>
            <div className="sk-list">
              {data.recentCompletions.map((a) => (
                <div key={a._id} className="sk-row">
                  <div className="l">
                    <div className="ico" style={{ background: `${a.categoryColor || '#1a7a50'}14`, color: a.categoryColor || '#1a7a50' }}>
                      <SkillIcon name={a.icon} size={20} />
                    </div>
                    <div>
                      <b>{a.activityTitle}</b>
                      <small>{a.categoryName}{a.mode === 'diagnostic' ? ' · Diagnostic' : ` · Level ${a.level}`} · Score {a.score}</small>
                    </div>
                  </div>
                  <div className="r">
                    <span className="sk-stars" aria-label={`${a.stars} of 3 stars`}>
                      {[1, 2, 3].map((n) => <span key={n} className={n <= (a.stars || 0) ? '' : 'empty'}>★</span>)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}