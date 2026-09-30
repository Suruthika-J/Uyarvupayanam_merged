import React, { useMemo } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// SpaceScene — backdrop for the Class 8 Maths Space Adventure. Supports two
// moods: `light` (default for the Uyarvu look — white/soft-blue sky with pastel
// stars, colourful planets pop on top) and the legacy dark starfield (when
// `light` is omitted). Pure CSS/SVG: dots for stars, soft gradient blobs for
// nebulae, no images, no emojis.
// ─────────────────────────────────────────────────────────────────────────────

// Deterministic pseudo-random stars — same layout on every render/reload.
function seededStars(count, salt) {
  let s = (salt || 7) * 48271 % 2147483647
  const rand = () => {
    s = (s * 48271) % 2147483647
    return s / 2147483647
  }
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 2.1,
    delay: rand() * 4,
    dur: 2.8 + rand() * 3,
    bright: rand() > 0.8,
  }))
}

export default function SpaceScene({
  children,
  style = {},
  stars = 90,
  salt = 7,
  compact = false,
  light = false,
  className = '',
}) {
  const starList = useMemo(() => seededStars(stars, salt), [stars, salt])
  const isLight = Boolean(light)
  const starColor = isLight ? '#a8bcd9' : '#c7d2fe'
  const brightColor = isLight ? '#5f7fb0' : '#fff'
  const starGlow = isLight ? '0 0 5px rgba(95,127,176,0.5)' : '0 0 6px rgba(255,255,255,0.8)'

  return (
    <div
      className={`mm-space-root${compact ? ' mm-space-compact' : ''} ${isLight ? ' mm-space-light' : ''} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: isLight
          ? 'linear-gradient(180deg, #ffffff 0%, #f4f8fd 55%, #edf4fb 100%)'
          : `radial-gradient(1200px 700px at 75% -10%, #24306e 0%, #181d47 45%, #0c1128 100%)`,
        ...style,
      }}
    >
      {/* nebulae / soft pastel blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
          width: 480, height: 480, left: '-140px', top: '-120px',
          background: isLight
            ? 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0) 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(124,58,237,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
          width: 520, height: 520, right: '-180px', top: '10%',
          background: isLight
            ? 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, rgba(14,165,233,0) 70%)'
            : 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, rgba(14,165,233,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
          width: 420, height: 420, left: '30%', bottom: '-180px',
          background: isLight
            ? 'radial-gradient(circle, rgba(26,122,80,0.10) 0%, rgba(26,122,80,0) 70%)'
            : 'radial-gradient(circle, rgba(26,122,80,0.2) 0%, rgba(26,122,80,0) 70%)',
        }}
      />

      {/* starfield dots */}
      {starList.map((st) => (
        <span
          key={st.id}
          aria-hidden="true"
          className="mm-star"
          style={{
            position: 'absolute',
            left: `${st.left}%`,
            top: `${st.top}%`,
            width: st.size,
            height: st.size,
            borderRadius: '50%',
            background: st.bright ? brightColor : starColor,
            opacity: isLight ? (st.bright ? 0.7 : 0.4) : st.bright ? 0.95 : 0.55,
            boxShadow: st.bright ? starGlow : 'none',
            animationDelay: `${st.delay}s`,
            animationDuration: `${st.dur}s`,
          }}
        />
      ))}

      {/* content sits above the starfield */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</div>
    </div>
  )
}