import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiChevronRight, FiMap, FiSend } from 'react-icons/fi'
import { englishMissionsApi } from '../../../services/englishMissionsApi'
import SpaceScene from '../../../components/class8/SpaceScene'
import Planet from '../../../components/class8/Planet'
import './englishMissions.css'
import { EM, EmButton, EmChip, EmBar, LoadingState, ErrorState } from './englishKit'

const STATE_COPY = {
  locked: 'Locked',
  open: 'Learn',
  ready: 'Assessment ready',
  completed: 'Completed',
}

export default function EnglishMissionsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await englishMissionsApi.listAreas())
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const continueLearning = data && data.continueLearning
  const pct = data && data.totals ? Math.round((data.totals.topicsCompleted / data.totals.topicsTotal) * 100) : 0

  return (
    <SpaceScene stars={95} salt={8}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '34px 22px 90px' }} className="em-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <Link
            to="/student/class8"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: EM.muted, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            <FiArrowLeft size={16} /> Class 8
          </Link>
          <EmChip text="English Space Explorer" tone="violet" />
        </div>

        <div className="em-rise">
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 10px', color: EM.ink }}>
            English Space Explorer
          </h1>
          <p style={{ color: EM.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: '0 0 24px' }}>
            Six learning areas take you from grammar galaxies to speaking missions. Learn each lesson,
            complete the activities, then unlock an AI-generated assessment to earn your topic badge.
          </p>

          <div style={{ background: EM.panel2, border: `1px solid ${EM.line}`, borderRadius: 22, padding: '22px 24px', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiMap size={20} color={EM.violet} />
                <span style={{ color: EM.ink, fontWeight: 800, fontSize: 16 }}>Your journey</span>
                <span style={{ color: EM.muted, fontSize: 14 }}>
                  {data ? `${data.totals.topicsCompleted} of ${data.totals.topicsTotal} topics completed` : ''}
                </span>
              </div>
              <EmChip text={`${pct}%`} tone="violet" />
            </div>
            <EmBar value={pct} />
            {continueLearning && (
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: EM.faint, fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Continue learning
                  </div>
                  <div style={{ color: EM.ink, fontWeight: 800, fontSize: 17 }}>{continueLearning.topicName}</div>
                </div>
                <EmButton
                  kind="sky"
                  icon={<FiSend size={17} />}
                  onClick={() => navigate(`/student/class8/english/topic/${continueLearning.topicId}`)}
                >
                  Continue
                </EmButton>
              </div>
            )}
            {!continueLearning && data && (
              <div style={{ marginTop: 18, color: EM.green, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 9 }}>
                <FiCheckCircle size={18} /> Every topic completed — well done, explorer!
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={load} onBack={() => navigate('/student/class8')} />
        ) : (
          <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 20 }}>
            {data.areas.map((a, i) => (
              <AreaCard key={a.id} area={a} index={i} onClick={() => navigate(`/student/class8/english/area/${a.id}`)} />
            ))}
          </div>
        )}
      </div>
    </SpaceScene>
  )
}

function AreaCard({ area, onClick, index }) {
  const done = area.topicsCompleted
  const total = area.topicsTotal
  const pct = Math.round((done / total) * 100)
  const firstOpen = area.topics.find((t) => t.state === 'open' || t.state === 'ready')
  const state = pct === 100 ? 'completed' : firstOpen ? 'open' : 'locked'
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover-lift em-fade-in"
      style={{
        textAlign: 'left', cursor: 'pointer', background: EM.panel,
        border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px 24px',
        backdropFilter: 'blur(8px)', fontFamily: 'inherit', transition: 'border-color 0.2s ease, transform 0.2s ease',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <Planet kind={area.world} accent={area.accent} size={80} glow={state !== 'locked'} />
        <EmChip text={STATE_COPY[firstOpen && pct < 100 ? (firstOpen.state === 'ready' ? 'ready' : 'open') : state]} tone={state === 'completed' ? 'green' : state === 'locked' ? 'muted' : 'violet'} />
      </div>
      <h3 style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: '18px 0 6px', letterSpacing: '-0.01em' }}>
        {area.name}
      </h3>
      <p style={{ color: EM.muted, fontSize: 13.5, lineHeight: 1.55, margin: '0 0 16px', minHeight: 42 }}>
        {area.tagline}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <EmBar value={pct} accent={area.accent} height={8} style={{ flex: 1 }} />
        <span style={{ color: EM.muted, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>{done}/{total}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ color: firstOpen ? EM.sky : EM.faint, fontSize: 13, fontWeight: 800 }}>
          {state === 'completed' ? 'Completed' : firstOpen ? `Up next: ${firstOpen.name}` : 'Finish the previous area topic first'}
        </span>
        <FiChevronRight size={18} color={EM.muted} />
      </div>
    </button>
  )
}