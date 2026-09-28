import React from 'react'
import { STREAM_THEMES, FALLBACK_THEME } from '../../../constants/streamThemes'

/**
 * StreamBackdrop — vector "background image" for a stream's theme key.
 * Professional, minimal: gradient wash + dot grid + a large translucent
 * outline glyph. No external assets, no emoji.
 */

function Glyph({ glyph, accent }) {
  const stroke = accent
  const common = { stroke, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  const solid = { fill: 'rgba(255,255,255,0.22)', stroke: 'none' }

  switch (glyph) {
    case 'science':
      return (
        <g>
          <path {...common} d="M60 36 L68 50 L52 50 Z" />
          <path {...common} d="M60 50 L60 74" />
          <path {...common} d="M48 74 L72 74 M44 80 L76 80" />
          <path {...common} d="M86 40 h14 M93 33 v14" />
          <circle cx="44" cy="34" r="3" {...solid} />
          <circle cx="92" cy="66" r="2.5" {...solid} />
        </g>
      )
    case 'finance':
      return (
        <g>
          <path {...common} d="M44 34 v46 M44 74 h44" />
          <path {...common} d="M50 36 h30 l4 6 -34 26 -8 -10 Z" />
          <path {...common} d="M56 88 h22 M54 94 h30" />
        </g>
      )
    case 'library':
      return (
        <g>
          <path {...common} d="M52 38 h26 v30 h-26 Z" />
          <path {...common} d="M50 68 h30 M51 62 h28 v6 h-28 Z" />
          <path {...common} d="M46 42 h6 M78 42 h6 M48 50 h4 M78 50 h4" />
          <path {...common} d="M85 48 l12 -8 v28 l-12 8 Z" />
        </g>
      )
    case 'farm':
      return (
        <g>
          <path {...common} d="M46 74 c2 -16 10 -24 16 -24 c8 0 8 14 0 24 Z" />
          <path {...common} d="M62 50 v24 M58 74 h8" />
          <path {...common} d="M82 74 c-4 -12 -10 -18 -14 -18 c-5 0 -5 9 0 18 Z" />
          <path {...common} d="M90 40 v30 h8 v-30 Z" />
        </g>
      )
    case 'textile':
      return (
        <g>
          <circle cx="58" cy="58" r="18" {...common} />
          <path {...common} d="M58 40 v36 M40 58 h36" />
          <circle cx="58" cy="58" r="6" {...common} />
          <path {...common} d="M88 46 q8 4 0 10 q8 6 0 12" />
        </g>
      )
    case 'home':
      return (
        <g>
          <path {...common} d="M44 60 L58 44 L74 60 Z" />
          <path {...common} d="M48 58 v20 h20 v-16 M64 62 v16" />
          <path {...common} d="M88 46 v28 h-6 M88 52 h10" />
        </g>
      )
    case 'culinary':
      return (
        <g>
          <path {...common} d="M40 60 q0 -18 18 -18 q18 0 18 18 Z" />
          <rect x="40" y="60" width="36" height="8" rx="2" {...common} />
          <path {...common} d="M58 60 v14" />
          <path {...common} d="M86 34 q10 16 0 30 M86 34 v42" />
        </g>
      )
    case 'housekeeping':
      return (
        <g>
          <path {...common} d="M44 40 h26 a8 8 0 0 1 8 8 v30 h-34 Z" />
          <path {...common} d="M48 36 v6 M60 36 v6 M72 38 v6" />
          <path {...common} d="M74 60 h10 v10 h-10 Z" />
          <circle cx="79" cy="55" r="3" {...solid} />
        </g>
      )
    case 'medical':
      return (
        <g>
          <rect x="48" y="38" width="20" height="36" rx="4" {...common} />
          <path {...common} d="M56 44 v24 M44 56 h24" />
          <path {...common} d="M82 40 h14 M89 33 v14" />
          <circle cx="76" cy="50" r="2" {...solid} />
        </g>
      )
    case 'office':
      return (
        <g>
          <path {...common} d="M42 70 V44 h32 v26" />
          <path {...common} d="M38 70 h40 M60 50 v10 M54 60 h12" />
          <path {...common} d="M88 40 v30 M84 44 h8 M84 70 h8" />
        </g>
      )
    case 'sports':
      return (
        <g>
          <path {...common} d="M42 70 v-26 a6 6 0 0 1 6 -6 h20 a6 6 0 0 1 6 6 v26 Z" />
          <path {...common} d="M48 46 l6 8 h6 l-2 10 l14 8" />
          <path {...common} d="M88 42 v26 M80 48 h16 M80 62 h16" />
        </g>
      )
    case 'workshop':
      return (
        <g>
          <circle cx="58" cy="56" r="16" {...common} />
          <path {...common} d="M58 40 v6 M58 66 v6 M42 56 h6 M68 56 h6" />
          <path {...common} d="M86 40 v28 h8 M86 44 h-4 M86 64 h-4" />
        </g>
      )
    case 'printing':
      return (
        <g>
          <path {...common} d="M44 42 v26 h32 v-26 Z" />
          <path {...common} d="M44 52 h32 M44 60 h24" />
          <path {...common} d="M84 38 v24 a4 4 0 0 0 4 4 h4 v-24 a4 4 0 0 0 -4 -4 Z" />
        </g>
      )
    case 'camera':
      return (
        <g>
          <rect x="40" y="46" width="40" height="24" rx="5" {...common} />
          <path {...common} d="M50 42 l3 -6 h10 l3 6" />
          <circle cx="58" cy="58" r="7" {...common} />
          <circle cx="58" cy="58" r="2.5" {...solid} />
        </g>
      )
    case 'music':
      return (
        <g>
          <path {...common} d="M78 44 v22" />
          <ellipse cx="74" cy="70" rx="6" ry="4.5" {...solid} />
          <path {...common} d="M78 48 c8 4 8 12 0 14" />
          <path {...common} d="M46 52 v20" />
          <ellipse cx="42" cy="76" rx="6" ry="4.5" {...solid} />
          <path {...common} d="M46 56 c8 4 8 12 0 14" />
        </g>
      )
    case 'engineer':
      return (
        <g>
          <circle cx="58" cy="56" r="17" {...common} />
          <circle cx="58" cy="56" r="6" {...common} />
          <path {...common} d="M58 33 v8 M58 71 v8 M35 56 h8 M73 56 h8" />
          <path {...common} d="M41.5 39.5 l5.5 5.5 M69 67 l5.5 5.5 M74.5 39.5 l-5.5 5.5 M47 67 l-5.5 5.5" />
          <circle cx="58" cy="56" r="2.4" {...solid} />
        </g>
      )
    case 'electronics':
      return (
        <g>
          <rect x="48" y="44" width="20" height="20" rx="3" {...common} />
          <path {...common} d="M56 44 v-6 M56 64 v6 M48 52 h-6 M68 52 h6" />
          <path {...common} d="M48 48 h-4 M48 60 h-4 M68 48 h4 M68 60 h4" />
          <rect x="54" y="50" width="8" height="8" rx="1.5" {...common} />
          <circle cx="58" cy="54" r="1.8" {...solid} />
        </g>
      )
    case 'computer':
      return (
        <g>
          <rect x="42" y="38" width="32" height="22" rx="3" {...common} />
          <path {...common} d="M58 60 v7 M51 67 h14" />
          <path {...common} d="M48 44 l-4 3 4 3 M56 50 h7" />
          <path {...common} d="M84 42 v28 M78 46 h12 M78 64 h12" />
        </g>
      )
    case 'architecture':
      return (
        <g>
          <path {...common} d="M58 38 L46 76 M58 38 L70 76" />
          <path {...common} d="M46 76 q12 10 24 0" />
          <circle cx="58" cy="38" r="2.6" {...solid} />
          <path {...common} d="M50 40 h16" />
          <path {...common} d="M86 40 v34 h-8 M86 46 h10 M86 62 h10" />
        </g>
      )
    default:
      return (
        <g>
          <circle cx="58" cy="58" r="16" {...common} />
          <circle cx="58" cy="58" r="6" {...common} />
          <path {...common} d="M84 40 v28 M76 44 h16 M76 64 h16" />
        </g>
      )
  }
}

export default function StreamBackdrop({ themeKey, height = 150, style }) {
  const theme = STREAM_THEMES[themeKey] || FALLBACK_THEME
  return (
    <svg
      viewBox="0 0 120 90"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height, display: 'block', ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sb-${themeKey || 'fb'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.top} />
          <stop offset="100%" stopColor={theme.bottom} />
        </linearGradient>
        <radialGradient id={`sb-halo-${themeKey || 'fb'}`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wash */}
      <rect width="120" height="90" fill={`url(#sb-${themeKey || 'fb'})`} />

      {/* Dot grid */}
      <g fill={theme.accent} opacity="0.1">
        {Array.from({ length: 42 }).map((_, i) => {
          const x = (i % 7) * 17 + 8
          const y = Math.floor(i / 7) * 14 + 8
          return <circle key={i} cx={x} cy={y} r="1.4" />
        })}
      </g>

      {/* Halo */}
      <rect width="120" height="90" fill={`url(#sb-halo-${themeKey || 'fb'})`} />

      {/* Themed glyph */}
      <g transform="translate(30, 12) scale(0.62)" opacity="0.9">
        <Glyph glyph={theme.glyph} accent={theme.accent} />
      </g>

      {/* Ground accent strip */}
      <rect y="84" width="120" height="6" fill={theme.accent} opacity="0.35" />
    </svg>
  )
}