import React from 'react'
import { C5 } from './class5Theme'
import { fmtDate } from './class5Theme'

const CATEGORY_COLORS = {
  skill: { bg: '#e6f0f7', text: C5.navy },
  streak: { bg: '#fff7ed', text: '#b45309' },
  seasonal: { bg: '#fdf2f8', text: '#be185d' },
}

// Badge grid: earned (colored) vs sealed (grey). Rewards by effort, not rank.
export default function BadgeShelf({ shelf = {} }) {
  const earnedCount = shelf.earnedCount ?? 0
  const badges = shelf.shelf || []
  return (
    <div>
      <div style={{ fontSize: 13, color: C5.faint, fontWeight: 700, marginBottom: 14 }}>
        {earnedCount} earned · keep exploring to unlock the rest
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 14,
        }}
      >
        {badges.map((b) => {
          const earned = Boolean(b.earnedAt)
          const c = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.skill
          return (
            <div
              key={b.key}
              style={{
                background: C5.bg,
                border: `1.5px solid ${earned ? c.text + '33' : C5.line}`,
                borderRadius: 20,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 8,
                filter: earned ? 'none' : 'grayscale(1)',
                opacity: earned ? 1 : 0.55,
                boxShadow: earned ? C5.shadow : 'none',
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: earned ? c.bg : '#eef3f8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 28,
                  boxShadow: earned ? `0 0 0 5px ${c.bg}` : 'none',
                }}
                aria-hidden="true"
              >
                {earned ? b.emoji : '🔒'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: earned ? C5.ink : C5.faint }}>{b.name}</div>
                <div style={{ fontSize: 11.5, color: earned ? C5.faint : C5.faint, marginTop: 2, lineHeight: 1.45, minHeight: 32 }}>
                  {b.description}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '2px 9px',
                  borderRadius: 99,
                  background: earned ? `${c.text}1a` : '#eef3f8',
                  color: earned ? c.text : C5.faint,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {earned ? (b.earnedAt ? `Earned · ${fmtDate(b.earnedAt)}` : 'Earned') : b.category}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}