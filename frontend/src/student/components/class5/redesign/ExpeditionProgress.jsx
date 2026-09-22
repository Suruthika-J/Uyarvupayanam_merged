import React from 'react'
import { C5, worldColor, clampPct } from './class5Theme'

// Whole-class goal bar. Shows only contribution effort — never a ranking.
export default function ExpeditionProgress({ expedition, onContribute, contributedToast }) {
  if (!expedition) return null
  const pct = clampPct(expedition.pct ?? (expedition.currentXp / expedition.targetXp) * 100)
  const color = worldColor('blue')
  return (
    <div
      style={{
        background: C5.bg,
        border: `1px solid ${C5.line}`,
        borderRadius: C5.radiusLg,
        boxShadow: C5.shadow,
        padding: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              background: 'linear-gradient(135deg,#e6f0f7,#dbeafe)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            🚩
          </div>
          <div>
            <div style={{ fontSize: 16.5, fontWeight: 900, color: C5.ink, lineHeight: 1.2 }}>{expedition.title}</div>
            <div style={{ fontSize: 12.5, color: C5.faint, marginTop: 2 }}>{expedition.subtitle}</div>
          </div>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: C5.navy,
            background: '#e6f0f7',
            borderRadius: 99,
            padding: '6px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          Goal: {expedition.currentXp} / {expedition.targetXp} XP
        </span>
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 99,
          background: '#eef3f8',
          margin: '18px 0 8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg,${color},${C5.navy})`,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: C5.faint }}>
        <span>{pct}% to unlocking this career world</span>
        <span>{Math.max(0, expedition.targetXp - expedition.currentXp)} XP to go</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => onContribute?.(expedition)}
          style={{
            background: C5.navy,
            color: '#fff',
            border: 'none',
            borderRadius: 99,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: 'pointer',
            boxShadow: '0 8px 16px -6px rgba(15,76,117,0.55)',
          }}
        >
          Contribute my XP 💙
        </button>
        <span style={{ fontSize: 12.5, color: C5.faint, fontWeight: 600 }}>
          {expedition.myXp || 0} XP from you so far
        </span>
        {contributedToast && (
          <span style={{ fontSize: 12.5, fontWeight: 800, color: '#059669', background: '#ecfdf5', borderRadius: 99, padding: '6px 12px' }}>
            ✓ XP added! Thank you!
          </span>
        )}
      </div>

      {expedition.recentCheer?.length > 0 && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${C5.line}`, paddingTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C5.muted, marginBottom: 10 }}>Recent cheers from the class 🎉</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {expedition.recentCheer.slice(0, 5).map((c, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 700, color: C5.muted, background: C5.soft, padding: '6px 12px', borderRadius: 99, border: `1px solid ${C5.line}` }}>
                {c.name} +{c.xp} XP
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}