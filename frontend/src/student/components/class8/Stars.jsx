import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Stars — the 1–3 star mission rating (kind, never punishing). Earned stars are
// gold and solid; unearned ones stay as soft outlines so the student always
// sees how close they were. No emojis — filled SVG stars only.
// ─────────────────────────────────────────────────────────────────────────────

const STAR_PATH = 'M8 1l1.8 3.9 4.2.5-3.1 2.9.8 4.1L8 10.4 4.3 12.4l.8-4.1L2 5.4l4.2-.5z'

export function StarMark({ filled = true, size = 26, accent = '#f59e0b', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{
        display: 'inline-block',
        filter: filled ? 'drop-shadow(0 3px 6px rgba(217,119,6,0.45))' : 'none',
        ...style,
      }}
    >
      <path
        d={STAR_PATH}
        fill={filled ? accent : 'none'}
        stroke={filled ? shade(accent, -0.18) : '#cbd5e1'}
        strokeWidth="1.2"
      />
    </svg>
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

// 3-star rating row. `value` = 1..3. Accessible via the visible text label.
export function StarsRow({ value = 0, size = 30, label = true }) {
  return (
    <div
      role="img"
      aria-label={`${value} of 3 stars`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      {[1, 2, 3].map((i) => (
        <StarMark key={i} filled={i <= value} size={size} />
      ))}
      {label && (
        <span style={{ fontSize: 15, fontWeight: 900, color: '#92400e', marginLeft: 2 }}>
          {value}/3
        </span>
      )}
    </div>
  )
}