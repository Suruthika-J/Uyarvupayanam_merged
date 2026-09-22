import React from 'react'
import { C5 } from './class5Theme'

// Parent/mentor conversation starters — always positive, effort-based.
export default function NudgeFeed({ nudges = [], compact = false }) {
  if (!nudges || !nudges.length) return null
  const list = compact ? nudges.slice(0, 3) : nudges
  return (
    <div
      style={{
        background: C5.bg,
        border: `1px solid ${C5.line}`,
        borderRadius: C5.radiusLg,
        boxShadow: C5.shadow,
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${C5.line}`,
          background: C5.soft,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span aria-hidden="true">💬</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: C5.ink, fontFamily: 'var(--s-font-display)' }}>
          Ask your child about…
        </span>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: '10px 20px 16px' }}>
        {list.map((n, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              padding: '9px 0',
              borderBottom: i < list.length - 1 ? `1px solid ${C5.line}` : 'none',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                background: '#e6f0f7',
                color: C5.navy,
                fontSize: 11,
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.55, color: C5.muted }}>
              <strong style={{ color: C5.ink }}>{n.context}: </strong>
              {n.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}