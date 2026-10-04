import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiChevronRight, FiStar } from 'react-icons/fi'
import { englishMissionsApi } from '../../../services/englishMissionsApi'
import SpaceScene from '../../../components/class8/SpaceScene'
import Planet from '../../../components/class8/Planet'
import { EM, EmButton, EmChip, EmBar, StateBadge, LoadingState, ErrorState } from './englishKit'
import './englishMissions.css'

const STATE_COPY = {
  locked: 'Locked — complete the previous topic',
  open: 'Learn this topic',
  ready: 'Assessment ready',
  completed: 'Completed',
}

export default function EnglishAreaPage() {
  const { areaId } = useParams()
  const navigate = useNavigate()
  const [area, setArea] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setArea((await englishMissionsApi.getArea(areaId)).area)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [areaId])

  useEffect(() => { load() }, [load])

  const pct = area ? Math.round((area.topicsCompleted / area.topicsTotal) * 100) : 0
  const next = area && area.topics.find((t) => t.state === 'open' || t.state === 'ready')

  return (
    <SpaceScene stars={90} salt={areaId ? areaId.length + 3 : 7}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '34px 22px 90px' }} className="em-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26, flexWrap: 'wrap' }}>
          <Link to="/student/class8/english" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: EM.muted, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            <FiArrowLeft size={16} /> English Explorer
          </Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={load} onBack={() => navigate('/student/class8/english')} />
        ) : (
          <div className="em-rise">
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
              <Planet kind={area.world} accent={area.accent} size={110} glow />
              <div style={{ flex: 1, minWidth: 240 }}>
                <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 6px', color: EM.ink, letterSpacing: '-0.02em' }}>{area.name}</h1>
                <p style={{ color: EM.muted, fontSize: 15, lineHeight: 1.6, margin: '0 0 14px' }}>{area.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 420 }}>
                  <EmBar value={pct} accent={area.accent} height={9} style={{ flex: 1 }} />
                  <span style={{ color: EM.muted, fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {area.topicsCompleted}/{area.topicsTotal} topics
                  </span>
                </div>
              </div>
              <EmChip text={`${pct}%`} tone="violet" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {area.topics.map((t, i) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  accent={area.accent}
                  index={i}
                  onClick={() => t.state !== 'locked' && navigate(`/student/class8/english/topic/${t.id}`)}
                />
              ))}
            </div>

            {next && (
              <div style={{ marginTop: 26, display: 'flex', justifyContent: 'flex-end' }}>
                <EmButton
                  kind="sky"
                  icon={<FiChevronRight size={17} />}
                  onClick={() => navigate(`/student/class8/english/topic/${next.id}`)}
                >
                  Continue: {next.name}
                </EmButton>
              </div>
            )}
          </div>
        )}
      </div>
    </SpaceScene>
  )
}

function TopicRow({ topic, accent, index, onClick }) {
  const locked = topic.state === 'locked'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className="hover-lift em-fade-in"
      style={{
        textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.62 : 1,
        background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 20,
        padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18,
        fontFamily: 'inherit', animationDelay: `${index * 50}ms`,
      }}
    >
      <StateBadge state={topic.state} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 17.5, fontWeight: 800, color: EM.ink }}>{topic.name}</span>
          {topic.state === 'ready' && <EmChip text="Assessment unlocked" tone="amber" />}
          {topic.state === 'completed' && topic.bestPercent > 0 && (
            <EmChip text={`Best ${topic.bestPercent}%`} tone="green" />
          )}
        </div>
        <div style={{ color: EM.muted, fontSize: 13.5, marginTop: 4, lineHeight: 1.5 }}>{topic.tagline}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{ color: topic.state === 'locked' ? EM.faint : EM.sky, fontSize: 13, fontWeight: 800 }}>
          {STATE_COPY[topic.state]}
        </span>
        {locked ? null : <FiChevronRight size={18} color={EM.muted} />}
        {topic.state === 'completed' && <FiStar size={17} color={EM.green} aria-label="completed" />}
      </div>
    </button>
  )
}