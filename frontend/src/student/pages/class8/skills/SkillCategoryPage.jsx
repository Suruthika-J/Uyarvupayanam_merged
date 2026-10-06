import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCategory } from '../../../services/skillsApi'
import SkillIcon from '../../../components/class8/skills/SkillIcon'
import { MECHANIC_LABELS } from '../../../components/class8/skills/SkillIcon'
import { STAGE_LABEL } from '../../../components/class8/skills/stages'
import './skills.css'

function LevelChip({ lv, unlocked }) {
  return (
    <div className={`sk-lv${unlocked ? '' : ' locked'}`}>
      <span className="nm">L{lv.level} · {lv.name}</span>
      <span className="sc">{lv.unlocked ? (lv.bestScore != null ? `★ ${lv.bestScore}` : 'Play') : '🔒 Locked'}</span>
    </div>
  )
}

export default function SkillCategoryPage() {
  const { skillId } = useParams()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    getCategory(skillId)
      .then((r) => setData(r))
      .catch((e) => setErr(e))
      .finally(() => setLoading(false))
  }, [skillId])
  useEffect(() => { load() }, [load])

  if (loading) {
    return <div className="skills-page"><div className="skills-inner"><div className="sk-state"><span className="emoji">⏳</span><h3>Loading skill area…</h3></div></div></div>
  }

  if (err && !data) {
    return (
      <div className="skills-page">
        <div className="skills-inner">
          <div className="sk-state">
            <span className="emoji">⚠️</span>
            <h3>Could not load this skill area</h3>
            <p>{err.message || 'Please try again.'}</p>
            <div className="sk-game-foot" style={{ justifyContent: 'center' }}>
              <button type="button" className="sk-btn" onClick={load}>↺ Retry</button>
              <Link className="sk-btn ghost" to="/student/class8/skills">← All skills</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { category, activities = [], recommendation } = data
  const color = category?.color || '#1a7a50'
  const stage = data.status || 'not-assessed'

  return (
    <div className="skills-page">
      <div className="skills-inner">
        <div className="sk-section-head">
          <Link className="sk-btn ghost small" to="/student/class8/skills">← All skills</Link>
          <span className="muted">{category?.minutesTip || ''}</span>
        </div>

        <div className="sk-cat-head">
          <div className="ico" style={{ background: `${color}1a`, color }}>
            <SkillIcon name={category?.icon} size={30} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1>{category?.name}</h1>
            <p>{category?.intro}</p>
            <div className="badges">
              <span className={`sk-stage ${stage === 'not-assessed' ? 'na' : stage}`}>
                {STAGE_LABEL[stage] || 'Not yet assessed'}
              </span>
              <span className="sk-pill">{activities.length} games</span>
            </div>
          </div>
        </div>

        {recommendation && (
          <div className="sk-section">
            <div className="sk-reco">
              <div className="ico" style={{ background: `${color}1a`, color }}>
                <SkillIcon name={recommendation.activityIcon} size={24} />
              </div>
              <div className="body">
                <span className="kicker">Recommended next</span>
                <h3>{recommendation.activityTitle}</h3>
                <p>{recommendation.reason}</p>
              </div>
              <Link className="sk-btn" to={`/student/class8/skills/${skillId}/game/${recommendation.activityId}?level=${recommendation.level || 1}`}>
                Play →
              </Link>
            </div>
          </div>
        )}

        <div className="sk-section">
          <div className="sk-section-head">
            <h2>🎮 Games in this area</h2>
            <span className="muted">Reach {60}+ on a level to unlock the next stage.</span>
          </div>
          <div className="sk-acts">
            {activities.map((a) => (
              <div key={a.id} className="sk-act">
                <div className="top">
                  <div className="ico" style={{ background: `${color}1a`, color }}>
                    <SkillIcon name={a.icon} size={22} />
                  </div>
                  <div>
                    <h3>{a.title}</h3>
                    <small>{a.tagline}</small>
                  </div>
                </div>
                <span className="mech">{MECHANIC_LABELS[a.mechanic] || 'Practice'} · ~{a.minutes} min</span>
                <div className="levels">
                  {a.levelsCompleted.map((lv) => (
                    <LevelChip key={lv.level} lv={lv} unlocked={a.unlockedLevels.includes(lv.level)} />
                  ))}
                </div>
                <div className="foot">
                  <span style={{ fontSize: 12, color: '#6b7a88' }}>
                    {a.bestScore != null ? `Best score ${a.bestScore}` : `${a.taskCount} quick steps`}
                  </span>
                  {a.unlockedLevels.length > 0 && (
                    <Link className="sk-btn small" to={`/student/class8/skills/${skillId}/game/${a.id}?level=${a.unlockedLevels[a.unlockedLevels.length - 1]}`}>
                      {a.bestScore != null ? 'Play again' : 'Play'} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}