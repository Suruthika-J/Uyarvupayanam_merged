import React, { useId } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Planet — original Uyarvu Payanam space-sky SVG bodies used all over the
// Maths Space Adventure (map, planet journeys, celebrations). Data-driven:
// `kind` (planet / moon / station / city / galaxy / trophy) + `accent` colour
// give every Maths topic its own visual identity without any image assets.
// The exact world identity comes from the backend topic metadata — this
// component only knows how to draw a body.
// ─────────────────────────────────────────────────────────────────────────────

function shade(hex, amt) {
  const n = hex.replace('#', '')
  const num = parseInt(n.length === 3 ? n.split('').map((c) => c + c).join('') : n, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * amt)))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amt)))
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amt)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function SphereBody({ x = 50, y = 50, r = 34, c1, c2 }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={`url(#${c1})`}
      stroke={shade(c2, 0.18)}
      strokeWidth="1.4"
    />
  )
}

export default function Planet({
  kind = 'planet',
  accent = '#1a7a50',
  size = 92,
  glow = false,
  dim = false,
  boss = false,
  style = {},
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const light = shade(accent, 0.28)
  const dark = shade(accent, -0.28)
  const mid = shade(accent, -0.05)
  const grad = `${uid}grad`
  const grad2 = `${uid}grad2`

  const body = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      style={{
        display: 'block',
        filter: dim ? 'grayscale(0.85) brightness(0.72)' : glow ? `drop-shadow(0 0 14px ${shade(accent, 0.15)}66)` : 'none',
        transition: 'filter 0.3s ease',
      }}
    >
      <defs>
        <radialGradient id={grad} cx="0.32" cy="0.28" r="0.95">
          <stop offset="0%" stopColor={light} />
          <stop offset="52%" stopColor={accent} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <radialGradient id={grad2} cx="0.35" cy="0.3" r="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor={mid} />
        </radialGradient>
      </defs>

      {kind === 'planet' && (
        <g>
          <SphereBody c1={grad} c2={dark} />
          <ellipse cx="50" cy="84" rx="30" ry="8" fill={dark} opacity="0.5" />
          <circle cx="34" cy="42" r="6.5" fill={dark} opacity="0.5" />
          <circle cx="63" cy="58" r="4.2" fill={dark} opacity="0.42" />
          <circle cx="58" cy="26" r="2.6" fill={dark} opacity="0.4" />
          <path d="M18 34 Q30 24 52 22" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.28" fill="none" />
        </g>
      )}

      {kind === 'moon' && (
        <g>
          <SphereBody c1={grad} c2={dark} />
          <circle cx="60" cy="36" r="8" fill={dark} opacity="0.55" />
          <circle cx="40" cy="58" r="9" fill={dark} opacity="0.5" />
          <circle cx="56" cy="64" r="5" fill={dark} opacity="0.5" />
          <circle cx="36" cy="34" r="4" fill={dark} opacity="0.45" />
          <circle cx="70" cy="52" r="3" fill={dark} opacity="0.45" />
          <path d="M20 30 Q32 20 50 18" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.3" fill="none" />
        </g>
      )}

      {kind === 'station' && (
        <g>
          <SphereBody c1={grad} c2={dark} />
          <ellipse cx="50" cy="50" rx="42" ry="10" fill="none" stroke={light} strokeWidth="3" opacity="0.85" transform="rotate(-14 50 50)" />
          <line x1="50" y1="10" x2="50" y2="22" stroke={light} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="50" cy="7" r="4.4" fill="#fff" opacity="0.92" />
          <rect x="72" y="26" width="17" height="4.4" rx="2.2" fill={dark} opacity="0.75" transform="rotate(24 80 28)" />
          <circle cx="32" cy="38" r="3.4" fill={dark} opacity="0.5" />
          <circle cx="66" cy="56" r="3.4" fill={dark} opacity="0.5" />
          <circle cx="41" cy="70" r="3.4" fill={dark} opacity="0.5" />
        </g>
      )}

      {kind === 'city' && (
        <g>
          <SphereBody c1={grad} c2={dark} />
          <g fill={dark} opacity="0.75">
            <rect x="28" y="52" width="8" height="22" rx="1.5" />
            <rect x="38" y="46" width="9" height="28" rx="1.5" />
            <rect x="49" y="54" width="8" height="20" rx="1.5" />
            <rect x="59" y="44" width="9" height="30" rx="1.5" />
            <rect x="70" y="55" width="7" height="19" rx="1.5" />
          </g>
          <g fill="#ffe08a" opacity="0.85">
            <rect x="30.4" y="56" width="2.4" height="2.4" rx="0.6" />
            <rect x="40.4" y="50" width="2.4" height="2.4" rx="0.6" />
            <rect x="40.4" y="60" width="2.4" height="2.4" rx="0.6" />
            <rect x="61.4" y="48" width="2.4" height="2.4" rx="0.6" />
            <rect x="61.4" y="58" width="2.4" height="2.4" rx="0.6" />
            <rect x="71.4" y="59" width="2.4" height="2.4" rx="0.6" />
          </g>
          <circle cx="34" cy="34" r="2.6" fill={dark} opacity="0.4" />
          <circle cx="68" cy="30" r="2.6" fill={dark} opacity="0.4" />
        </g>
      )}

      {kind === 'galaxy' && (
        <g>
          <circle cx="50" cy="50" r="30" fill={dark} opacity="0.9" />
          <circle cx="50" cy="50" r="24" fill={grad2} opacity="0.55" />
          <circle cx="50" cy="50" r="10" fill="#fff" opacity="0.9" />
          <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke={light} strokeWidth="5" opacity="0.75" transform="rotate(-22 50 50)" />
          <ellipse cx="50" cy="50" rx="34" ry="11" fill="none" stroke="#fff" strokeWidth="3.6" opacity="0.4" transform="rotate(-22 50 50)" />
          <circle cx="22" cy="42" r="2" fill="#fff" opacity="0.9" />
          <circle cx="76" cy="58" r="2" fill="#fff" opacity="0.9" />
          <circle cx="34" cy="70" r="1.7" fill="#fff" opacity="0.85" />
        </g>
      )}

      {kind === 'trophy' && (
        <g>
          <path d="M30 22 H70 V34 Q70 50 50 50 Q30 50 30 34 Z" fill={grad} stroke={shade(accent, 0.2)} strokeWidth="1.6" />
          <path d="M26 24 H34 V36 Q30 44 26 44 Z" fill={accent} stroke={dark} strokeWidth="1.4" />
          <path d="M74 24 H66 V36 Q70 44 74 44 Z" fill={accent} stroke={dark} strokeWidth="1.4" />
          <path d="M50 50 V62" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M38 66 H62" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <rect x="36" y="63" width="28" height="7" rx="3" fill={accent} />
          <circle cx="50" cy="31" r="4.4" fill="#fff" opacity="0.85" />
        </g>
      )}

      {kind === 'start' && (
        <g>
          <path d="M50 8 L64 30 L58 38 L50 26 L42 38 L36 30 Z" fill={accent} />
          <path d="M50 24 L58 34 L50 22 L42 34 Z" fill={light} />
          <line x1="50" y1="10" x2="50" y2="38" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
        </g>
      )}
    </svg>
  )

  return (
    <div
      style={{ position: 'relative', width: size, height: size, ...style }}
      aria-hidden="true"
    >
      {body}
      {boss && kind !== 'trophy' && (
        <span
          style={{
            position: 'absolute', top: -5, right: -5, width: 26, height: 26,
            borderRadius: 50, background: '#fff', border: `2px solid ${accent}`,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 6px 14px -6px rgba(15,23,42,0.4)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill={accent} aria-hidden="true">
            <path d="M8 1l1.8 3.9 4.2.5-3.1 2.9.8 4.1L8 10.4 4.3 12.4l.8-4.1L2 5.4l4.2-.5z" />
          </svg>
        </span>
      )}
    </div>
  )
}