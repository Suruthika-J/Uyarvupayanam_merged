import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiChevronRight, FiLoader, FiMap, FiRefreshCw } from 'react-icons/fi'
import SpaceScene from '../../../components/class8/SpaceScene'
import Planet from '../../../components/class8/Planet'
import { getMathsTopic } from '../../../services/mathsMissionsApi'
import MathsMissionFlow from './MathsMissionFlow'
import './mathsMissions.css'

const ACCENT = '#1a7a50'
const ACCENT_DEEP = '#145c3d'
const INK = '#0f172a'
const MUTED = '#64748b'

// Deep link into a single mission (from the map or shadowed URLs). The mission
// intro + the one-stage flow live inside MathsMissionFlow; this page only
// supplies the world context (world identity + breadcrumbs).
export default function MathsMissionPage() {
  const { topicId, missionId } = useParams()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadState('loading')
    setLoadError(null)
    getMathsTopic(topicId)
      .then((data) => {
        if (cancelled) return
        setTopic(data)
        setLoadState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err)
        setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [topicId, refreshKey])

  const mission = topic ? (topic.missions || []).find((m) => m.missionId === missionId) : null
  const topicMeta = topic ? topic.topic : null
  const worldAccent = topicMeta ? topicMeta.accent || ACCENT : ACCENT
  const worldKind = topicMeta ? topicMeta.world || 'planet' : 'planet'

  function handleMissionComplete(nextMission) {
    setRefreshKey((k) => k + 1)
    if (nextMission && nextMission.missionId !== missionId) {
      navigate(`/student/class8/maths/topic/${topicId}/mission/${nextMission.missionId}`, { replace: true })
    }
  }

  if (loadState === 'loading') {
    return (
      <SpaceScene compact light stars={45} salt={14} style={{ minHeight: '100vh' }}>
        <div style={{ padding: '100px 24px', textAlign: 'center' }}>
          <div className="mm-spin" style={{ color: ACCENT, margin: '0 auto 16px', width: 38, height: 38 }}>
            <FiLoader size={38} strokeWidth={2.3} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: INK }}>Preparing mission…</div>
        </div>
      </SpaceScene>
    )
  }

  if (loadState === 'error') {
    const net = loadError && loadError.network
    let text = 'This mission could not be found.'
    if (net) text = 'We could not reach the learning hub. Check your connection and try again.'
    else if (loadError && loadError.auth) text = 'Please sign in to play Maths Missions.'
    return (
      <SpaceScene compact light stars={40} salt={15} style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '90px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 23, fontWeight: 900, color: INK }}>{net ? 'The flight deck is resting' : 'Mission not found'}</h2>
          <p style={{ fontSize: 15.5, color: '#475569', margin: '10px 0 22px', lineHeight: 1.7 }}>{text}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setRefreshKey((k) => k + 1)} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 14px 30px -14px rgba(26,122,80,0.55)' }}>
              <FiRefreshCw size={15} /> Try again
            </button>
            <Link to="/student/class8/maths" style={{ background: '#fff', color: ACCENT_DEEP, border: '1.5px solid #d9e6df', borderRadius: 12, padding: '11px 22px', fontSize: 15.5, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiMap size={15} /> Back to the map
            </Link>
          </div>
        </div>
      </SpaceScene>
    )
  }

  return (
    <SpaceScene compact light stars={60} salt={16}>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '24px 20px 70px' }}>
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: MUTED, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link to="/student/class8" style={{ color: '#334155', textDecoration: 'none' }}>Class 8</Link>
          <FiChevronRight size={13} style={{ color: '#94a3b8' }} />
          <Link to="/student/class8/maths" style={{ color: '#334155', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiMap size={13} /> Space Adventure
          </Link>
          <FiChevronRight size={13} style={{ color: '#94a3b8' }} />
          {topicMeta && (
            <React.Fragment>
              <Link to={`/student/class8/maths/topic/${topicId}`} style={{ color: '#334155', textDecoration: 'none' }}>{topicMeta.worldName}</Link>
              <FiChevronRight size={13} style={{ color: '#94a3b8' }} />
              <span style={{ color: INK }}>{mission ? mission.name : 'Mission'}</span>
            </React.Fragment>
          )}
        </nav>

        {/* world strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26, flexWrap: 'wrap' }}>
          <div className="mm-planet-glow" style={{ borderRadius: '50%', display: 'inline-block' }}>
            <Planet kind={worldKind} accent={worldAccent} size={62} glow />
          </div>
          <div>
            <div className="mm-space-kicker">Mission in {topicMeta ? topicMeta.worldName : 'this world'}</div>
            <h1 className="mm-space-title" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: '4px 0 0' }}>
              {mission ? mission.name : 'Mission'}
            </h1>
          </div>
        </div>

        {mission ? (
          <MathsMissionFlow
            key={`${missionId}-${refreshKey}`}
            topicId={topicId}
            missionId={missionId}
            mission={mission}
            topicWorldName={topicMeta ? topicMeta.worldName : ''}
            worldAccent={worldAccent}
            onMissionComplete={handleMissionComplete}
            onExit={() => window.history.back()}
            onPlanetComplete={(nextTopic) => {
              if (nextTopic) {
                navigate(`/student/class8/maths/topic/${nextTopic.id}`)
              }
            }}
          />
        ) : (
          <div style={{ background: '#fff', border: '1.5px solid #b7dcc9', borderRadius: 20, padding: '40px 24px', textAlign: 'center', boxShadow: '0 20px 50px -30px rgba(15,23,42,0.35)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>This mission is not on the map yet</div>
            <Link to={`/student/class8/maths/topic/${topicId}`} style={{ marginTop: 14, display: 'inline-block', background: ACCENT, color: '#fff', borderRadius: 12, padding: '12px 24px', fontSize: 15.5, fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 26px -14px rgba(26,122,80,0.6)' }}>
              Back to {topicMeta ? topicMeta.worldName : 'the planet'}
            </Link>
          </div>
        )}
      </div>
    </SpaceScene>
  )
}