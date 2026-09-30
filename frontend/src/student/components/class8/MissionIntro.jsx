import React from 'react'
import { FiAward, FiBookOpen, FiChevronRight, FiEye, FiSun, FiTarget, FiZap } from 'react-icons/fi'
import MissionGuide from './MissionGuide'

// ─────────────────────────────────────────────────────────────────────────────
// MissionIntro — the single "one stage at a time" gate before a mission runs.
// The student sees ONE mission (name, goal, journey, reward) and one obvious
// action: Launch. The learn/example/questions are never visible yet.
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT = '#1a7a50'
const INK = '#0f172a'
const MUTED = '#5b6b80'

const JOURNEY = [
  { label: 'Learn', icon: FiBookOpen },
  { label: 'Example', icon: FiEye },
  { label: 'Practice', icon: FiTarget },
  { label: 'Challenge', icon: FiSun },
  { label: 'Master', icon: FiZap },
]

export default function MissionIntro({
  mission,
  onStart,
  onBack,
  topicWorldName = '',
  worldAccent = ACCENT,
}) {
  const isBoss = Boolean(mission && mission.isBoss)
  const name = mission ? mission.name : 'Mission'
  const tagline = mission && mission.tagline ? mission.tagline : 'Learn, practise and master this skill one step at a time.'
  const reward = mission && mission.reward ? mission.reward : 'Mission Card'

  return (
    <div className="mm-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ background: '#fff', border: isBoss ? '1.5px solid #eccd97' : '1.5px solid #b7dcc9', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px -32px rgba(15,23,42,0.4)' }}>
        {/* header band */}
        <div style={{ background: `linear-gradient(120deg, ${worldAccent} 0%, ${shade(worldAccent, 0.22)} 100%)`, padding: '30px 28px 26px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.92, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 99, padding: '5px 14px' }}>
            {isBoss ? <FiAward size={13} /> : <FiTarget size={13} />} {isBoss ? 'Master Challenge' : `Mission ${mission.order || ''}`}
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, margin: '12px 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {name}
          </h2>
          <p style={{ fontSize: 15.5, margin: 0, lineHeight: 1.6, opacity: 0.95 }}>
            {isBoss
              ? 'The final challenge of this world — combine everything you learned to prove you have mastered it.'
              : tagline}
          </p>
          {topicWorldName && (
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 800, opacity: 0.92, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiZap size={12} /> {topicWorldName}
            </div>
          )}
        </div>

        <div style={{ padding: '26px 28px 30px' }}>
          {/* one-stage learning journey strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
            {JOURNEY.map((j, i) => (
              <React.Fragment key={j.label}>
                {i > 0 && <span aria-hidden="true" style={{ width: 18, height: 2, background: '#d9e6df', borderRadius: 99 }} />}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f6fbf8', border: '1px solid #d9e6df', borderRadius: 99, padding: '6px 12px', fontSize: 12.5, fontWeight: 800, color: INK }}>
                  <j.icon size={13} color={ACCENT} /> {j.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* reward preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff8ec', border: '1.5px dashed #eccd97', borderRadius: 14, padding: '13px 16px', marginBottom: 20 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: '1.5px solid #eccd97', color: '#b45309', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FiAward size={19} />
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Reward on completion</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#92400e' }}>{reward}</div>
            </div>
          </div>

          <MissionGuide
            size="sm"
            message={isBoss
              ? 'This is the big one! Read each step carefully — I am right here if you need a hint.'
              : 'Ready when you are. Read the concept, watch the example, then we solve together.'}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onStart}
              style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 34px', fontSize: 17, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 16px 34px -16px rgba(26,122,80,0.65)' }}
            >
              <FiZap size={18} /> Launch mission <FiChevronRight size={18} />
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{ background: '#fff', color: ACCENT, border: '1.5px solid var(--s-border)', borderRadius: 14, padding: '13px 24px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
              >
                Back to the planet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function shade(hex, amt) {
  const n = hex.replace('#', '')
  const num = parseInt(n, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * amt)))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amt)))
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amt)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}