import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FiAward, FiCheck, FiChevronRight, FiLoader, FiLock,
  FiMap, FiPlay, FiRefreshCw, FiTarget, FiZap,
} from 'react-icons/fi'
import SpaceScene from '../../../components/class8/SpaceScene'
import Planet from '../../../components/class8/Planet'
import MissionGuide from '../../../components/class8/MissionGuide'
import { StarsRow } from '../../../components/class8/Stars'
import { getMathsTopic } from '../../../services/mathsMissionsApi'
import MathsMissionFlow from './MathsMissionFlow'
import './mathsMissions.css'

const ACCENT = '#1a7a50'
const ACCENT_DEEP = '#145c3d'
const INK = '#0f172a'
const MUTED = '#64748b'
const FAINT = '#94a3b8'
const CARD = '#ffffff'
const BORDER = '#dce4ee'
const SOFT_BG = '#eef2f6' // locked / inactive surface on the white theme
const GREEN_SOFT = '#e9f7ef'
const GREEN_EDGE = '#b7dcc9'
const GOLD = '#b45309'
const GOLD_SOFT = '#fff7e6'
const GOLD_EDGE = '#eccd97'
const BLUE_SOFT = '#e8f1ff'
const BLUE_EDGE = '#bcd6ff'
const BLUE_DEEP = '#1d4ed8'

export default function MathsTopicPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [view, setView] = useState('planet') // 'planet' | 'mission'
  const [selectedMissionId, setSelectedMissionId] = useState(null)
  const [lockMsg, setLockMsg] = useState('')
  const [liveProgress, setLiveProgress] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function load() {
    setLoadState('loading')
    setLoadError(null)
    try {
      const topicData = await getMathsTopic(topicId)
      setData(topicData)
      setLiveProgress(topicData.progress)
      setLoadState('ready')
      const playable =
        (topicData.missions || []).find((m) => m.status === 'current') ||
        (topicData.missions || []).filter((m) => m.status === 'completed').slice(-1)[0]
      setSelectedMissionId((cur) => cur || (playable ? playable.missionId : null))
    } catch (err) {
      setLoadError(err)
      setLoadState('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, refreshKey])

  const topic = data ? data.topic : null
  const missions = data ? data.missions : []
  const totalMissions = missions.length
  const completedCount = liveProgress ? liveProgress.completedMissions.length : 0

  const currentMission =
    missions.find((m) => m.status === 'current') ||
    missions.filter((m) => m.status === 'completed').slice(-1)[0] ||
    null

  const selectedMission = useMemo(
    () => (missions || []).find((m) => m.missionId === selectedMissionId) || null,
    [missions, selectedMissionId]
  )
  const worldKind = topic ? topic.world || 'planet' : 'planet'
  const worldAccent = topic ? topic.accent || ACCENT : ACCENT

  function selectMission(m) {
    setLockMsg('')
    if (m.status === 'locked') {
      const prev = missions.find((x) => x.order === m.order - 1)
      setLockMsg(`Finish "${prev ? prev.name : 'the previous mission'}" first, then this mission unlocks.`)
      return
    }
    setSelectedMissionId(m.missionId)
    setView('mission')
    window.scrollTo({ top: 0 })
  }

  function backToPlanet() {
    setView('planet')
    setLockMsg('')
    setRefreshKey((k) => k + 1)
    window.scrollTo({ top: 0 })
  }

  function handleMissionComplete(nextMission) {
    setRefreshKey((k) => k + 1)
    if (nextMission) {
      setSelectedMissionId(nextMission.missionId)
    } else {
      setView('planet')
      window.scrollTo({ top: 0 })
    }
  }

  function handlePlanetComplete(nextTopic) {
    if (nextTopic && nextTopic.id !== topicId) {
      navigate(`/student/class8/maths/topic/${nextTopic.id}`)
    } else {
      backToPlanet()
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <SpaceScene compact light stars={55} salt={5} style={{ minHeight: '100vh' }}>
        <div style={{ padding: '100px 24px', textAlign: 'center' }}>
          <div className="mm-spin" style={{ color: ACCENT, margin: '0 auto 16px', width: 40, height: 40 }}>
            <FiLoader size={40} strokeWidth={2.3} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: INK }}>Approaching the planet…</div>
          <div style={{ fontSize: 14.5, color: MUTED, marginTop: 6 }}>Fetching the world and your progress.</div>
        </div>
      </SpaceScene>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (loadState === 'error') {
    const net = loadError && loadError.network
    return (
      <SpaceScene compact light stars={45} salt={6} style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '90px 24px', textAlign: 'center' }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: '#fff', border: '1px solid #dce4ee', color: ACCENT, boxShadow: '0 16px 40px -20px rgba(15,23,42,0.3)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
            <FiMap size={27} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: INK, margin: '0 0 8px' }}>
            {net ? 'The flight deck is resting' : 'Planet not found'}
          </h2>
          <p style={{ fontSize: 15.5, color: '#475569', lineHeight: 1.7, margin: '0 0 22px' }}>
            {net
              ? 'We could not reach the learning hub. Check your connection and press retry — nothing is lost.'
              : 'This world is not on the Class 8 mission map yet.'}
          </p>
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

  const planned = Boolean(topic && topic.planned)
  const topicCompleted = Boolean(liveProgress && liveProgress.topicCompleted)
  const nextMissionNo = topicCompleted
    ? totalMissions
    : Math.min(completedCount + 1, totalMissions)

  // ── Planet view (levels journey) ─────────────────────────────────────────
  if (view === 'planet') {
    const guideMessage = planned
      ? 'We are crafting these missions carefully so you can master them step by step.'
      : topicCompleted
        ? `You conquered ${topic.worldName}! The next world on the trail is open — brilliant work.`
        : completedCount > 0
          ? `Great progress on ${topic.worldName}! ${currentMission ? `Your next mission is "${currentMission.name}".` : 'Keep exploring the path.'}`
          : `Welcome to ${topic.worldName}! Complete its missions one at a time to conquer this planet.`

    return (
      <SpaceScene light stars={90} salt={9}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 70px' }}>
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: MUTED, marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to="/student/class8" style={{ color: '#334155', textDecoration: 'none' }}>Class 8</Link>
            <span aria-hidden="true" style={{ color: '#94a3b8' }}>›</span>
            <Link to="/student/class8/maths" style={{ color: '#334155', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiMap size={13} /> Space Adventure
            </Link>
            <span aria-hidden="true" style={{ color: '#94a3b8' }}>›</span>
            <span style={{ color: INK }}>{topic.worldName}</span>
          </nav>

          {/* planet hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ flex: '0 0 auto' }}>
              <div className="mm-planet-glow" style={{ borderRadius: '50%', display: 'inline-block' }}>
                <Planet kind={worldKind} accent={worldAccent} size={150} glow={!planned} dim={planned} />
              </div>
            </div>
            <div style={{ flex: '1 1 360px', minWidth: 300 }}>
              <span className="mm-space-kicker">{planned ? 'Under construction' : topicCompleted ? 'Planet conquered' : `World ${topic.order} of 15`}</span>
              <h1 className="mm-space-title" style={{ fontSize: 'clamp(34px, 5vw, 52px)', margin: '6px 0 4px' }}>
                {topic.worldName}
              </h1>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '8px 0 12px', flexWrap: 'wrap' }}>
                <span style={{ background: '#fff', border: '1px solid #dce4ee', borderRadius: 99, padding: '6px 14px', fontSize: 13.5, fontWeight: 800, color: '#334155' }}>
                  {topic.name}
                </span>
                {!planned && (
                  <span style={{ background: '#fff', border: '1px solid #dce4ee', borderRadius: 99, padding: '6px 14px', fontSize: 13.5, fontWeight: 800, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FiTarget size={13} /> Mission {nextMissionNo} of {totalMissions}
                  </span>
                )}
                {!planned && (
                  <span style={{ background: topicCompleted ? GREEN_SOFT : '#fff', border: `1px solid ${topicCompleted ? GREEN_EDGE : '#dce4ee'}`, borderRadius: 99, padding: '6px 14px', fontSize: 13.5, fontWeight: 800, color: topicCompleted ? ACCENT_DEEP : '#334155', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FiAward size={13} /> {topicCompleted ? 'Mastered' : `${totalMissions} missions · 1 Master Challenge`}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 16, color: '#475569', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
                {planned ? 'This topic unlocks on the Class 8 mission map. Its missions are being prepared — check back soon to start this world.' : topic.tagline}
              </p>
            </div>
          </div>

          {/* mission journey + progress */}
          {!planned && totalMissions > 0 && (
            <div style={{ marginTop: 32 }}>
              {/* progress row */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 26 }}>
                <PlanetStat label="Points" value={liveProgress ? liveProgress.score : 0} box />
                <PlanetStat label="Level" value={`${liveProgress ? liveProgress.currentLevel : 1}/5`} box />
                <PlanetStat label="Stars" value={liveProgress ? liveProgress.stars : 0} box gold />
                <PlanetStat label="Missions" value={`${completedCount}/${totalMissions}`} box />
              </div>

              <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <div className="mm-space-kicker" style={{ textAlign: 'center' }}>The mission path</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: INK, textAlign: 'center', margin: '4px 0 8px' }}>Conquer {topic.worldName}</h2>
                <p style={{ textAlign: 'center', fontSize: 14.5, color: MUTED, margin: '0 0 26px', lineHeight: 1.6 }}>
                  Land on each node in order. Beat the Master Challenge to take the planet.
                </p>

                {/* journey nodes */}
                {missions.map((m, i) => {
                  const isBoss = Boolean(m.isBoss)
                  const isLocked = m.status === 'locked'
                  const isCurrent = m.status === 'current'
                  const isCompleted = m.status === 'completed'
                  const isNext = isLocked && i === missions.findIndex((x) => x.status === 'locked')
                  const prev = missions[i - 1]
                  return (
                    <React.Fragment key={m.missionId}>
                      <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                        <div style={{ width: 3, height: 24, borderLeft: '3px dotted rgba(142,169,214,0.7)', marginLeft: 26 }} />
                      </div>

                      <button
                        type="button"
                        onClick={() => selectMission(m)}
                        aria-current={isCurrent ? 'true' : undefined}
                        aria-disabled={isLocked}
                        className={isCurrent ? 'mm-current-pulse' : 'mm-linked'}
                        style={{
                          width: '100%', textAlign: 'left', cursor: isLocked ? 'not-allowed' : 'pointer',
                          background: isLocked ? SOFT_BG : '#fff',
                          border: isBoss
                            ? `2px solid ${isCurrent ? '#f59e0b' : isCompleted ? GOLD_EDGE : 'rgba(245,158,11,0.55)'}`
                            : `1.5px solid ${isCurrent ? ACCENT : isCompleted ? GREEN_EDGE : '#dfe6ee'}`,
                          borderRadius: 20, padding: '15px 18px',
                          display: 'flex', alignItems: 'center', gap: 14,
                          boxShadow: isCurrent
                            ? '0 16px 34px -18px rgba(15,23,42,0.35)'
                            : isBoss
                              ? '0 14px 30px -24px rgba(245,158,11,0.7)'
                              : '0 14px 30px -24px rgba(15,23,42,0.3)',
                          opacity: isLocked ? 0.72 : 1, boxSizing: 'border-box',
                          fontFamily: 'var(--s-font-body)',
                        }}
                      >
                        {/* mission chip */}
                        <span style={{
                          width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                          background: isCompleted ? ACCENT : isCurrent ? (isBoss ? '#f59e0b' : ACCENT) : isLocked ? 'rgba(148,163,184,0.22)' : isBoss ? GOLD_SOFT : '#e9eef4',
                          color: isCompleted || isCurrent ? '#fff' : isLocked ? '#94a3b8' : isBoss ? GOLD : '#64748b',
                          display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 900,
                          border: isBoss && !isCompleted && !isCurrent ? `1.5px solid ${GOLD_EDGE}` : 'none',
                        }}>
                          {isCompleted ? <FiCheck size={20} /> : isLocked ? <FiLock size={18} /> : isBoss ? <FiAward size={19} /> : m.order}
                        </span>

                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 900, fontSize: 17, color: isLocked ? '#94a3b8' : INK }}>
                              {m.name}
                            </span>
                            {isBoss && (
                              <span style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_EDGE}`, color: GOLD, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <FiZap size={10} /> Master Challenge
                              </span>
                            )}
                          </span>
                          <span style={{ display: 'block', fontSize: 13.5, color: isLocked ? '#94a3b8' : MUTED, marginTop: 3, lineHeight: 1.45 }}>
                            {isBoss ? `The final challenge of ${topic.worldName} — combine everything you have learned.` : m.tagline}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: FAINT, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <FiAward size={11} /> Reward: {m.reward}
                            </span>
                            {isCompleted && m.stars > 0 && (
                              <StarsRow value={m.stars} size={16} label={false} />
                            )}
                          </span>
                        </span>

                        {/* status / action */}
                        {isCurrent && (
                          <span style={{ flexShrink: 0, background: isBoss ? '#f59e0b' : ACCENT, color: '#fff', borderRadius: 99, padding: '9px 16px', fontSize: 13, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 10px 22px -10px rgba(26,122,80,0.7)', whiteSpace: 'nowrap' }}>
                            <FiPlay size={12} /> START MISSION
                          </span>
                        )}
                        {isCompleted && (
                          <span style={{ flexShrink: 0, borderRadius: 99, padding: '7px 14px', fontSize: 12.5, fontWeight: 900, background: GREEN_SOFT, color: ACCENT_DEEP, border: `1px solid ${GREEN_EDGE}`, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                            <FiCheck size={12} /> Completed
                          </span>
                        )}
                        {isLocked && !isNext && (
                          <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 900, color: FAINT, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                            <FiLock size={12} /> Locked
                          </span>
                        )}
                        {isNext && (
                          <span style={{ flexShrink: 0, background: BLUE_SOFT, border: `1px solid ${BLUE_EDGE}`, color: BLUE_DEEP, borderRadius: 99, padding: '6px 12px', fontSize: 12, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                            <FiTarget size={12} /> NEXT
                          </span>
                        )}
                      </button>

                      {isLocked && prev && (
                        <div style={{ fontSize: 12.5, color: MUTED, margin: '6px 0 2px', textAlign: 'right' }}>
                          Unlocks after “{prev.name}”
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}

                {/* finish / conquered node */}
                <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                  <div style={{ width: 3, height: 24, borderLeft: '3px dotted rgba(142,169,214,0.7)', marginLeft: 26 }} />
                </div>
                <div style={{
                  width: '100%', boxSizing: 'border-box', borderRadius: 20, padding: '16px 18px',
                  background: topicCompleted ? 'rgba(26,122,80,0.12)' : SOFT_BG,
                  border: `1.5px dashed ${topicCompleted ? 'rgba(55,176,124,0.65)' : '#cbd5e1'}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{ width: 46, height: 46, borderRadius: 15, background: topicCompleted ? ACCENT : 'rgba(148,163,184,0.22)', color: topicCompleted ? '#fff' : FAINT, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <FiAward size={20} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontWeight: 900, fontSize: 16, color: topicCompleted ? ACCENT_DEEP : '#475569' }}>
                      {topicCompleted ? `${topic.worldName} conquered!` : 'Planet reward'}
                    </span>
                    <span style={{ display: 'block', fontSize: 13.5, color: topicCompleted ? '#3f7a5f' : MUTED, marginTop: 2, lineHeight: 1.45 }}>
                      {topicCompleted
                        ? `You earned every mission on this planet. The next world on the trail is now unlocked.`
                        : `Beat every mission — including the Master Challenge — to conquer ${topic.worldName}.`}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* guide + main action */}
          <div style={{ maxWidth: 720, margin: '30px auto 0' }}>
            <MissionGuide size="sm" message={guideMessage} />
            {!planned && currentMission && (
              <div style={{ textAlign: 'center', marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => selectMission(currentMission)}
                  style={{ background: topicCompleted ? '#f59e0b' : ACCENT, color: '#fff', border: 'none', borderRadius: 16, padding: '16px 36px', fontSize: 17.5, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: topicCompleted ? '0 20px 44px -22px rgba(245,158,11,0.7)' : '0 20px 44px -22px rgba(26,122,80,0.7)' }}
                >
                  {topicCompleted ? <FiAward size={18} /> : <FiZap size={18} />}
                  {topicCompleted ? `Revisit ${topic.worldName}` : `Start: ${currentMission.name}`}
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </SpaceScene>
    )
  }

  // ── Mission view (one mission at a time) ─────────────────────────────────
  return (
    <SpaceScene compact light stars={55} salt={13}>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '22px 20px 70px' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 700, color: MUTED, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={backToPlanet}
            style={{ background: '#fff', border: '1.5px solid #d9e6df', color: ACCENT_DEEP, borderRadius: 99, padding: '7px 16px', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: '0 8px 20px -14px rgba(15,23,42,0.3)' }}
          >
            <FiChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to {topic.worldName}
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Link to="/student/class8/maths" style={{ color: '#334155', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiMap size={13} /> Space map
          </Link>
        </nav>

        {selectedMission ? (
          <MathsMissionFlow
            key={selectedMission.missionId}
            topicId={topicId}
            missionId={selectedMission.missionId}
            mission={selectedMission}
            topicWorldName={topic.worldName}
            worldAccent={worldAccent}
            onProgressChange={(p) => {
              setLiveProgress(p)
              setData((d) => (d ? { ...d, progress: p } : d))
            }}
            onMissionComplete={handleMissionComplete}
            onExit={backToPlanet}
            onPlanetComplete={handlePlanetComplete}
          />
        ) : (
          <div style={{ background: '#fff', border: '1.5px solid #b7dcc9', borderRadius: 20, padding: '40px 24px', textAlign: 'center', boxShadow: '0 20px 50px -30px rgba(15,23,42,0.35)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: INK, marginBottom: 6 }}>Choose a mission to begin</div>
            <div style={{ fontSize: 15, color: MUTED }}>Pick any open mission on the planet to start playing.</div>
            <button type="button" onClick={backToPlanet} style={{ marginTop: 18, background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 15.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 26px -14px rgba(26,122,80,0.6)' }}>
              Show the mission path
            </button>
          </div>
        )}
      </div>
    </SpaceScene>
  )
}

function PlanetStat({ label, value, gold }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dce4ee', borderRadius: 16, padding: '12px 20px', minWidth: 104, textAlign: 'center', boxShadow: '0 10px 26px -20px rgba(15,23,42,0.3)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: gold ? '#b45309' : '#0f172a', marginTop: 3 }}>{value}</div>
    </div>
  )
}