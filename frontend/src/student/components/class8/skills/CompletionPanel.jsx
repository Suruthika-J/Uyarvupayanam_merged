import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SkillIcon from './SkillIcon'

function Stars({ count }) {
  return (
    <span className="sk-stars" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? '' : 'empty'}>★</span>
      ))}
    </span>
  )
}

export default function CompletionPanel({
  summary, encouragement, milestones, recommendation, nextUnlocked, catColor, onReplay,
}) {
  const nav = useNavigate()
  const pct = Math.max(0, Math.min(100, summary.score || 0))
  const isDiagnostic = summary.mode === 'diagnostic'
  const catUrl = isDiagnostic ? '/student/class8/skills' : `/student/class8/skills/${summary.skillId}`

  return (
    <div className="sk-done">
      <div className="big-emoji">{pct >= 85 ? '🏆' : pct >= 60 ? '🎉' : '💪'}</div>
      <h2>{isDiagnostic ? 'Diagnostic complete!' : 'Mission complete!'}</h2>
      <p className="sub">
        {summary.activityTitle} · {summary.categoryName}
      </p>

      <div className="sk-score-ring" style={{ ['--pct' ]: `${pct}%` }}>
        <span className="num">{summary.score || '—'}</span>
        <span className="lbl">out of 100</span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Stars count={summary.stars || 0} />
      </div>

      {encouragement && <div className="enc">✨ {encouragement}</div>}

      {milestones && milestones.length > 0 && (
        <div className="mn">
          {milestones.map((m) => (
            <span key={m} className="sk-mstone got">🏅 {m.replace(/_/g, ' ')}</span>
          ))}
        </div>
      )}

      {!isDiagnostic && recommendation && (
        <div className="sk-done-reco">
          <div className="ico" style={{ background: `${catColor}1a`, color: catColor }}>
            <SkillIcon name={recommendation.activityIcon} size={22} />
          </div>
          <div className="b">
            <span className="kicker">Next step · {recommendation.categoryName}</span>
            <b>{recommendation.activityTitle}</b>
            <p>{recommendation.reason}</p>
          </div>
        </div>
      )}

      {isDiagnostic && (
        <div className="sk-feed info" style={{ maxWidth: 560, margin: '0 auto 20px', textAlign: 'left' }}>
          <span className="ic">🧭</span>
          <span>Based on this snapshot, we recommend strong skill areas first. Explore the grid and start any green-tagged game — nothing here locks you out.</span>
        </div>
      )}

      <div className="sk-done-actions">
        <button type="button" className="sk-btn ghost" onClick={() => nav(catUrl)}>← Back</button>
        {!isDiagnostic && (
          <button type="button" className="sk-btn" onClick={onReplay}>↺ Play this level again</button>
        )}
        {!isDiagnostic && recommendation && recommendation.activityId && (
          <button type="button" className="sk-btn amber" onClick={() => nav(`/student/class8/skills/${recommendation.categoryId}/game/${recommendation.activityId}?level=${recommendation.level || 1}`)}>
            Next: {recommendation.activityTitle} →
          </button>
        )}
        {isDiagnostic && nextUnlocked !== null && (
          <Link className="sk-btn amber" to={catUrl}>Explore skills →</Link>
        )}
      </div>
    </div>
  )
}