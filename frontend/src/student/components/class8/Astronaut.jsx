import React, { useId } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Astronaut — the Uyarvu Payanam space guide. One consistent character across
// the whole Maths Space Adventure: heads in speech bubbles (MissionGuide) and
// a full standing figure beside the current planet on the map and journeys.
// Pure inline SVG, no images, no emojis. The green accents keep the character
// recognisably part of Uyarvu Payanam.
// ─────────────────────────────────────────────────────────────────────────────

export function AstronautHead({ size = 56, style = {} }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const v = `${uid}visor`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Astronaut guide"
      style={{ display: 'block', ...style }}
    >
      <defs>
        <linearGradient id={v} x1="0.2" y1="0.1" x2="0.9" y2="0.95">
          <stop offset="0%" stopColor="#334190" />
          <stop offset="55%" stopColor="#151a45" />
          <stop offset="100%" stopColor="#0b0f2b" />
        </linearGradient>
      </defs>
      {/* antenna */}
      <line x1="32" y1="8" x2="38" y2="2" stroke="#1a7a50" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="38" cy="2" r="2.6" fill="#1a7a50" />
      {/* helmet */}
      <circle cx="32" cy="32" r="26" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="26" fill="url(#mmA-helmet)" opacity="0.5" />
      <defs>
        <radialGradient id="mmA-helmet" cx="0.3" cy="0.25" r="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </radialGradient>
      </defs>
      {/* visor */}
      <path
        d="M20 22 Q30 13 42 20 Q48 26 46 34 Q40 48 28 47 Q19 42 21 32 Z"
        fill={`url(#${v})`}
        stroke="#0b0f2b"
        strokeWidth="1.4"
      />
      {/* visor glint */}
      <path d="M27 24 Q33 20 39 23 Q33 26 27 24 Z" fill="#ffffff" opacity="0.75" />
      <circle cx="35" cy="36" r="1.6" fill="#ffffff" opacity="0.5" />
      {/* small smile peeking below visor */}
      <path d="M26 50 Q32 56 38 50" stroke="#0b0f2b" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function AstronautStanding({ size = 76, accent = '#1a7a50', style = {} }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const v = `${uid}visorL`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      role="img"
      aria-label="Astronaut explorer"
      style={{ display: 'block', ...style }}
    >
      <defs>
        <linearGradient id={v} x1="0.2" y1="0.1" x2="0.9" y2="0.95">
          <stop offset="0%" stopColor="#39448f" />
          <stop offset="100%" stopColor="#0b0f2b" />
        </linearGradient>
      </defs>
      {/* backpack */}
      <rect x="26" y="26" width="20" height="30" rx="7" fill="#cbd5e1" opacity="0.85" />
      <line x1="30" y1="32" x2="42" y2="32" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="37" x2="38" y2="37" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {/* antenna */}
      <line x1="38" y1="10" x2="44" y2="4" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="45" cy="3.4" r="2.4" fill={accent} />
      {/* body */}
      <path d="M24 26 L56 26 L62 46 Q62 60 52 62 L28 62 Q18 60 18 46 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
      {/* chest stripe */}
      <rect x="26" y="34" width="28" height="6" rx="3" fill={accent} opacity="0.9" />
      <rect x="34" y="44" width="14" height="5" rx="2.4" fill={accent} opacity="0.9" />
      {/* left arm */}
      <path d="M20 30 Q8 34 10 48 L15 48 Q14 36 24 34 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
      {/* right arm */}
      <path d="M60 30 Q72 34 70 48 L65 48 Q66 36 56 34 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
      {/* helmet */}
      <circle cx="40" cy="22" r="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
      <path
        d="M30 15 Q38 9 47 14 Q52 19 50 27 Q45 36 36 35 Q29 31 30 22 Z"
        fill={`url(#${v})`}
        stroke="#0b0f2b"
        strokeWidth="1.2"
      />
      <path d="M35 16 Q40 13 45 16 Q41 19 35 16 Z" fill="#ffffff" opacity="0.8" />
      <circle cx="41" cy="26" r="1.4" fill="#ffffff" opacity="0.5" />
      {/* legs */}
      <path d="M28 62 Q26 72 30 76 L37 76 Q38 68 36 62 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
      <path d="M44 62 Q46 68 45 76 L52 76 Q54 72 52 62 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
      <rect x="30" y="66" width="8" height="3" rx="1.5" fill={accent} opacity="0.85" />
      <rect x="44" y="66" width="8" height="3" rx="1.5" fill={accent} opacity="0.85" />
    </svg>
  )
}