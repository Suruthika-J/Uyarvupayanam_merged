import React from 'react'
import { FiCheck, FiChevronRight, FiLock, FiPlay, FiStar, FiTarget, FiZap } from 'react-icons/fi'
import Planet from './Planet'
import { AstronautStanding } from './Astronaut'
import { StarsRow } from './Stars'
import MissionGuide from './MissionGuide'

const ACCENT = '#1a7a50'
const ACCENT_DEEP = '#145c3d'
const GOLD = '#b45309'
const GOLD_SOFT = '#fff7e6'
const GOLD_EDGE = '#eccd97'
const INK = '#0f172a'
const MUTED = '#64748b'
const FAINT = '#94a3b8'
const CARD = '#ffffff'
const BORDER = '#dce4ee'
const GREEN_SOFT = '#e9f7ef'
const GREEN_EDGE = '#b7dcc9'
const BLUE_SOFT = '#e8f1ff'
const BLUE_EDGE = '#bcd6ff'
const BLUE_DEEP = '#1d4ed8'
const VB_W = 1160
const VB_H = 640

// ── The serpentine space trail: LAUNCH → 15 worlds → MATH GALAXY ───────────
const TRAVEL = [
  { kind: 'start', x: 150, y: 52 },
  { kind: 'planet', x: 160, y: 176 }, //  1 Fraction Planet
  { kind: 'planet', x: 372, y: 176 }, //  2
  { kind: 'planet', x: 584, y: 176 }, //  3
  { kind: 'planet', x: 796, y: 176 }, //  4
  { kind: 'planet', x: 1008, y: 176 }, // 5
  { kind: 'planet', x: 1008, y: 356 }, // 6
  { kind: 'planet', x: 796, y: 356 }, //  7
  { kind: 'planet', x: 584, y: 356 }, //  8
  { kind: 'planet', x: 372, y: 356 }, //  9
  { kind: 'planet', x: 160, y: 356 }, //  10
  { kind: 'planet', x: 160, y: 536 }, //  11
  { kind: 'planet', x: 372, y: 536 }, //  12
  { kind: 'planet', x: 584, y: 536 }, //  13
  { kind: 'planet', x: 796, y: 536 }, //  14
  { kind: 'planet', x: 1008, y: 536 }, // 15
  { kind: 'finish', x: 1114, y: 500 },
]

// Sweep a path between two travel points (gentle arcs, never a boring line).
function segmentPath(a, b) {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  if (a.y === b.y) return `M ${a.x} ${a.y} Q ${mx} ${a.y - 18} ${b.x} ${b.y}`
  if (a.x === b.x) return `M ${a.x} ${a.y} Q ${a.x - 18} ${my} ${b.x} ${b.y}`
  return `M ${a.x} ${a.y} Q ${mx} ${(a.y + my) / 2 - 26} ${b.x} ${b.y}`
}

export function statusOf(topic) {
  if (!topic) return 'locked'
  if (topic.completed) return 'completed'
  if (topic.unlocked) return 'current'
  return 'locked'
}

// The TRAVEL entry right before index i is a planet whose topic lives at
// topics[(i - 1)] — the helper keeps the segment-lighting logic readable.
function planetIndexOf(travelIndex) {
  return travelIndex - 1
}

// ── Journey header: MATH EXPLORER + compact progress ───────────────────────
export function MathsJourneyHeader({
  overview,
  topics,
  currentTopic,
  allDone,
  guideMsg,
  onContinue,
  onToggleTrophy,
  showTrophy,
}) {
  const totalScore = overview ? overview.totalScore || 0 : 0
  const totalStars = overview ? overview.totalStars || 0 : 0
  const level = 1 + Math.floor(totalScore / 100)
  const xpIntoLevel = totalScore % 100
  const planetsDone = topics.filter((t) => t.completed).length

  return (
    <div style={{ textAlign: 'center', marginBottom: 30 }}>
      <span className="mm-space-kicker" style={{ color: ACCENT }}>Uyarvu Payanam · Class 8</span>
      <h1 className="mm-space-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)', margin: '8px 0 6px', color: INK }}>
        MATH EXPLORER
      </h1>
      <p style={{ fontSize: 17.5, fontWeight: 800, color: '#334155', margin: '0 auto 6px' }}>
        Your Class 8 Maths Adventure
      </p>
      <p style={{ fontSize: 15, color: MUTED, maxWidth: 640, margin: '0 auto', lineHeight: 1.65 }}>
        Fifteen Maths worlds float in the galaxy. Land on each world, complete every mission,
        defeat the Master Challenge — and you rule the Math Galaxy.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={{ maxWidth: 560, width: '100%' }}>
          <MissionGuide size="md" message={guideMsg} />
        </div>
      </div>

      {/* Compact progress tray */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
        <StatTile label={`Level ${level}`} value={`${xpIntoLevel}/100 XP`} bar={xpIntoLevel} barColor="#37b07c" />
        <StatTile label="Total XP" value={`${totalScore}`} icon={<FiZap size={14} />} />
        <StatTile label="Stars" value={`${totalStars}`} icon={<FiStar size={14} />} gold />
        <StatTile label="Planets mastered" value={`${planetsDone}/${topics.length}`} icon={<FiCheck size={14} />} />
        <StatTile label="Missions done" value={`${overview ? overview.completedMissions : 0}/${overview ? overview.totalMissions : 0}`} icon={<FiTarget size={14} />} />
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {currentTopic && (
          <button
            type="button"
            onClick={onContinue}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 30px', fontSize: 16.5, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 14px 30px -14px rgba(26,122,80,0.55)' }}
          >
            <FiPlay size={17} /> {currentTopic.completedMissions > 0 ? 'Continue the journey' : 'Start the adventure'}
            <FiChevronRight size={17} />
          </button>
        )}
        {allDone && (
          <button
            type="button"
            onClick={onToggleTrophy}
            style={{ background: CARD, color: ACCENT_DEEP, border: '1.5px solid #d9e6df', borderRadius: 14, padding: '13px 26px', fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 26px -16px rgba(15,23,42,0.35)' }}
          >
            <FiStar size={17} /> {showTrophy ? 'Hide the trophy' : 'View the trophy'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Adventure map ──────────────────────────────────────────────────────────
export function AdventureMap({ topics, allDone, onOpenTopic, onOpenTrophy }) {
  const currentTopic = topics.find((t) => statusOf(t) === 'current') || null
  const firstLockedId = topics.find((t) => statusOf(t) === 'locked')
  const nextHint = currentTopic ? `NEXT · unlocks after ${currentTopic.worldName}` : 'NEXT'

  return (
    <>
      {/* DESKTOP: the serpentine space map */}
      <div className="mm-map-desktop" style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="auto" aria-hidden="true" style={{ display: 'block' }}>
          {/* segments of the trail — lit up once the explorer has travelled them */}
          {TRAVEL.slice(0, -1).map((a, i) => {
            const b = TRAVEL[i + 1]
            const prev = TRAVEL[i]
            const nxt = TRAVEL[i + 1]
            const passed =
              prev.kind === 'start' ||
              (prev.kind === 'planet' && topics[planetIndexOf(i)] && topics[planetIndexOf(i)].completed) ||
              (nxt.kind === 'planet' && topics[planetIndexOf(i + 1)] && topics[planetIndexOf(i + 1)].unlocked) ||
              (nxt.kind === 'finish' && topics.length > 0 && topics[topics.length - 1].completed)
            return (
              <path
                key={i}
                d={segmentPath(a, b)}
                fill="none"
                stroke={passed ? '#37b07c' : 'rgba(148,163,184,0.45)'}
                strokeWidth={passed ? 4 : 3}
                strokeLinecap="round"
                strokeDasharray="1 11"
                style={passed ? { filter: 'drop-shadow(0 0 6px rgba(55,176,124,0.75))' } : undefined}
              />
            )
          })}
          {/* faint guide rings around each landing spot */}
          {TRAVEL.map((n, i) => (
            <circle key={`r${i}`} cx={n.x} cy={n.y} r={58} fill="none" stroke="rgba(100,116,139,0.12)" strokeWidth="2" />
          ))}
        </svg>

        {/* world overlays */}
        {TRAVEL.map((n, i) => {
          if (n.kind === 'start') return <LaunchNode key={i} node={n} />
          if (n.kind === 'finish') {
            return <FinishNode key={i} node={n} locked={!allDone} onOpen={onOpenTrophy} />
          }
          const topic = topics[i - 1]
          const status = statusOf(topic)
          return (
            <WorldNode
              key={topic.id}
              node={n}
              topic={topic}
              status={status}
              isNext={status === 'locked' && firstLockedId ? topic.id === firstLockedId.id : false}
              nextHint={nextHint}
              onOpen={() => onOpenTopic(topic.id)}
            />
          )
        })}
      </div>

      {/* MOBILE: the same journey, as a vertical star-trail */}
      <div className="mm-map-mobile">
        {/* Launch pad */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: CARD, border: '1.5px solid #d9e6df', borderRadius: 18, padding: '12px 18px', width: '100%', boxSizing: 'border-box', boxShadow: '0 10px 26px -16px rgba(15,23,42,0.25)' }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: ACCENT, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FiZap size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16.5, color: INK }}>Adventure launch pad</div>
              <div style={{ fontSize: 13.5, color: MUTED, marginTop: 1 }}>The journey begins here</div>
            </div>
          </div>

          {topics.map((topic, i) => {
            const status = statusOf(topic)
            const isNext = status === 'locked' && firstLockedId && topic.id === firstLockedId.id
            const row = (
              <button
                key={topic.id}
                type="button"
                disabled={status === 'locked'}
                onClick={() => onOpenTopic(topic.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                  background: status === 'locked' ? '#eef2f6' : CARD,
                  border: `1.5px solid ${status === 'current' ? ACCENT : isNext ? BLUE_EDGE : status === 'locked' ? '#dfe6ee' : '#d9e6df'}`,
                  borderRadius: 18, padding: '13px 16px', cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                  opacity: status === 'locked' ? (isNext ? 0.85 : 0.65) : 1, boxSizing: 'border-box',
                  boxShadow: status === 'current' ? '0 12px 30px -16px rgba(26,122,80,0.5)' : '0 10px 26px -18px rgba(15,23,42,0.3)',
                }}
              >
                <span style={{ flexShrink: 0, position: 'relative' }}>
                  <Planet kind={topic.world} accent={topic.accent} size={status === 'current' ? 54 : 46} dim={status === 'locked'} glow={status !== 'locked'} />
                  {status === 'locked' && !isNext && (
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#64748b' }}>
                      <FiLock size={16} />
                    </span>
                  )}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 900, fontSize: 16, color: status === 'locked' ? '#94a3b8' : INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topic.worldName}
                  </span>
                  <span style={{ display: 'block', fontSize: 13, color: status === 'locked' ? '#94a3b8' : MUTED, marginTop: 1 }}>
                    {i + 1} · {topic.name}
                  </span>
                  {status === 'completed' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <StarsRow value={topic.stars >= 3 ? 3 : topic.stars >= 1 ? topic.stars : 0} size={16} label={false} />
                      {topic.score > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: GOLD }}>+{topic.score} XP</span>
                      )}
                    </span>
                  )}
                </span>
                {status === 'current' && (
                  <span style={{ background: ACCENT, color: '#fff', borderRadius: 99, padding: '6px 12px', fontSize: 12, fontWeight: 900, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: '0 8px 18px -10px rgba(26,122,80,0.8)' }}>
                    <FiTarget size={11} /> YOU ARE HERE
                  </span>
                )}
                {status === 'completed' && (
                  <span style={{ borderRadius: 99, padding: '6px 11px', fontSize: 12, fontWeight: 900, flexShrink: 0, background: GREEN_SOFT, border: '1px solid #b7dcc9', color: ACCENT_DEEP, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                    <FiCheck size={11} /> Completed
                  </span>
                )}
                {isNext && (
                  <span style={{ borderRadius: 99, padding: '6px 11px', fontSize: 12, fontWeight: 900, flexShrink: 0, background: BLUE_SOFT, border: `1px solid ${BLUE_EDGE}`, color: BLUE_DEEP, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                    NEXT
                  </span>
                )}
                {status === 'locked' && !isNext && (
                  <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>Locked</span>
                )}
              </button>
            )
            const isLast = i === topics.length - 1
            return (
              <React.Fragment key={topic.id}>
                {row}
                {!isLast && (
                  <div aria-hidden="true" style={{ height: 22, width: 3, borderLeft: '3px dotted #8ea9d6', margin: '2px auto 2px 23px' }} />
                )}
              </React.Fragment>
            )
          })}

          {/* Final galaxy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: allDone ? GOLD_SOFT : '#eef2f6', border: `1.5px solid ${allDone ? '#eccd97' : '#dfe6ee'}`, borderRadius: 18, padding: '13px 16px', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ flexShrink: 0, opacity: allDone ? 1 : 0.45, filter: allDone ? 'none' : 'grayscale(0.85)' }}>
              <Planet kind="trophy" accent="#f59e0b" size={46} glow={allDone} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 900, fontSize: 16, color: allDone ? '#92400e' : INK }}>Math Galaxy</span>
              <span style={{ display: 'block', fontSize: 13, color: MUTED, marginTop: 1 }}>
                {allDone ? 'Conquered! You are the Math Master.' : 'Conquer all 15 worlds to reach the trophy.'}
              </span>
            </span>
            {allDone && (
              <button type="button" onClick={onOpenTrophy} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                View trophy
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// A world on the desktop serpentine: planet + label + clear state chips.
// The CURRENT world is the hero — bigger, glowing, with "YOU ARE HERE" + CTA.
export function WorldNode({ node, topic, status, isNext, nextHint = 'NEXT', onOpen }) {
  const isCurrent = status === 'current'
  const isCompleted = status === 'completed'
  const locked = status === 'locked'
  const size = isCurrent ? 104 : isCompleted ? 76 : isNext ? 72 : 62
  const left = `${(node.x / VB_W) * 100}%`
  const top = `${(node.y / VB_H) * 100}%`

  const label = `${topic.worldName} — ${topic.name}, ${
    isCompleted ? 'completed' : isCurrent ? 'current world, you are here' : isNext ? 'next to unlock' : 'locked'
  }`

  return (
    <div style={{ position: 'absolute', left, top, transform: 'translate(-50%, -50%)', width: 170, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: isCurrent ? 3 : 1 }}>
      {/* YOU ARE HERE banner hovering above the hero world */}
      {isCurrent && (
        <span style={{ position: 'absolute', top: -88, left: '50%', transform: 'translateX(-50%)', background: ACCENT, color: '#fff', borderRadius: 99, padding: '5px 13px', fontSize: 11.5, fontWeight: 900, letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: '0 10px 22px -10px rgba(26,122,80,0.8)', whiteSpace: 'nowrap' }}>
          <FiTarget size={11} /> YOU ARE HERE
        </span>
      )}

      <button
        type="button"
        onClick={onOpen}
        disabled={locked}
        aria-label={label}
        className="mm-map-node"
        style={{
          background: 'none', border: 'none', cursor: locked ? 'not-allowed' : 'pointer', padding: 0,
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'var(--s-font-body)',
        }}
      >
        <span
          className={isCurrent ? 'mm-planet-glow mm-float' : ''}
          style={{ borderRadius: '50%', display: 'inline-block', opacity: locked ? (isNext ? 0.75 : 0.6) : 1, transition: 'transform 0.2s ease' }}
          onMouseEnter={(e) => { if (!locked) e.currentTarget.style.transform = 'scale(1.06)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <Planet kind={topic.world} accent={topic.accent} size={size} dim={locked} glow={!locked} />
        </span>

        {locked && !isNext && (
          <span style={{ position: 'absolute', top: 24, right: 36, width: 22, height: 22, borderRadius: 99, background: 'rgba(71,85,105,0.85)', border: '1.5px solid #cbd5e1', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <FiLock size={11} />
          </span>
        )}

        <span style={{ textAlign: 'center', lineHeight: 1.2 }}>
          <span style={{ display: 'block', fontSize: isCurrent ? 14 : 12.5, fontWeight: 900, color: locked ? '#94a3b8' : INK, maxWidth: 170 }}>
            {topic.worldName}
          </span>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: locked ? '#a5b4c6' : MUTED, marginTop: 2 }}>
            {topic.name}
          </span>
        </span>
      </button>

      {/* status strip under the world */}
      {isCompleted && (
        <span style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: GREEN_SOFT, border: '1px solid #b7dcc9', color: ACCENT_DEEP, borderRadius: 99, padding: '4px 11px', fontSize: 11.5, fontWeight: 900, whiteSpace: 'nowrap' }}>
          <FiCheck size={12} /> Completed
        </span>
      )}
      {isCompleted && (
        <span style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <StarsRow value={topic.stars >= 3 ? 3 : topic.stars >= 1 ? topic.stars : 0} size={14} label={false} />
          {topic.score > 0 && (
            <span style={{ fontSize: 11.5, fontWeight: 900, color: GOLD, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <FiStar size={10} /> +{topic.score} XP
            </span>
          )}
        </span>
      )}
      {isCurrent && (
        <button
          type="button"
          onClick={onOpen}
          style={{ marginTop: isCurrent ? 14 : 6, background: ACCENT, color: '#fff', border: 'none', borderRadius: 99, padding: '9px 18px', fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 12px 26px -12px rgba(26,122,80,0.7)', whiteSpace: 'nowrap' }}
        >
          <FiPlay size={12} /> START MISSION
        </button>
      )}
      {isNext && (
        <span style={{ marginTop: 6, background: BLUE_SOFT, border: `1px solid ${BLUE_EDGE}`, color: BLUE_DEEP, borderRadius: 99, padding: '4px 12px', fontSize: 11.5, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
          {nextHint}
        </span>
      )}
      {locked && !isNext && (
        <span style={{ marginTop: 6, fontSize: 11.5, fontWeight: 800, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <FiLock size={11} /> Locked
        </span>
      )}

      {/* the astronaut floats beside the hero world */}
      {isCurrent && (
        <div className="mm-drift" style={{ position: 'absolute', left: '66%', top: '40%', pointerEvents: 'none', zIndex: 4 }} aria-hidden="true">
          <AstronautStanding size={64} accent={topic.accent} />
        </div>
      )}
    </div>
  )
}

// ── Explore/next-world helpers ─────────────────────────────────────────────
function LaunchNode({ node }) {
  const left = `${(node.x / VB_W) * 100}%`
  const top = `${(node.y / VB_H) * 100}%`
  return (
    <div style={{ position: 'absolute', left, top, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <Planet kind="start" accent="#37b07c" size={50} glow />
      <span style={{ fontSize: 11.5, fontWeight: 900, color: '#334155', letterSpacing: '0.06em' }}>LAUNCH</span>
    </div>
  )
}

function FinishNode({ node, locked, onOpen }) {
  const left = `${(node.x / VB_W) * 100}%`
  const top = `${(node.y / VB_H) * 100}%`
  return (
    <div style={{ position: 'absolute', left, top, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        onClick={onOpen}
        disabled={locked}
        aria-label={locked ? 'Math Galaxy — locked until every world is conquered' : 'Math Galaxy trophy'}
        className="mm-map-node"
        style={{ background: 'none', border: 'none', cursor: locked ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'var(--s-font-body)' }}
      >
        <span style={{ opacity: locked ? 0.45 : 1, filter: locked ? 'grayscale(0.85)' : 'none' }}>
          <Planet kind="trophy" accent="#f59e0b" size={96} glow={!locked} />
        </span>
        <span style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 900, color: locked ? '#94a3b8' : '#92400e' }}>Math Galaxy</span>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, marginTop: 2 }}>
            {locked ? 'Final destination' : 'The trophy awaits'}
          </span>
        </span>
      </button>
      {locked && (
        <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <FiLock size={11} /> Locked
        </span>
      )}
    </div>
  )
}

function StatTile({ label, value, icon, bar, barColor = '#37b07c', gold }) {
  return (
    <div style={{ background: CARD, border: '1px solid #dce4ee', borderRadius: 16, padding: '12px 18px', minWidth: 108, textAlign: 'center', boxShadow: '0 10px 26px -18px rgba(15,23,42,0.3)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: MUTED, display: 'inline-flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon || null} {label}
      </div>
      <div style={{ fontSize: 21, fontWeight: 900, color: gold ? GOLD : '#0f172a', marginTop: 3 }}>{value}</div>
      {bar !== undefined && (
        <div style={{ width: '100%', height: 7, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden', marginTop: 7 }}>
          <div style={{ width: `${bar}%`, height: '100%', borderRadius: 99, background: barColor, transition: 'width 0.6s ease' }} className="mm-progress-fill" />
        </div>
      )}
    </div>
  )
}