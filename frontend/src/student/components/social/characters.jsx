// Original cartoon characters for the World Explorer — the student explorer
// and respectful (cartoon, non-photographic) sketches of national heroes.

export function Explorer({ className = '' }) {
  return (
    <svg className={`soc-explorer ${className}`} viewBox="0 0 64 64" role="img" aria-label="Student explorer">
      <circle cx="32" cy="17" r="10" fill="#e6aa6a" stroke="#a06a3a" strokeWidth="2.4" />
      <path d="M24 12 Q32 4 40 12 Q44 8 36 7 Q32 4 28 6 Z" fill="#6e4a2b" />
      <circle cx="28.5" cy="16" r="1.8" fill="#2f3a1f" />
      <circle cx="35.5" cy="16" r="1.8" fill="#2f3a1f" />
      <path d="M27 23 Q32 26 37 23" stroke="#a06a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M23 28 Q21 40 24 52 L30 52 L30 40 L32 46 L33 34 L36 52 L42 52 Q46 40 42 28 Z" fill="#2f5aa8" stroke="#1f4a8a" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="21" y="26" width="22" height="5" rx="2.4" fill="#ff9f6b" stroke="#e07a40" strokeWidth="1.8" />
      <circle cx="45" cy="32" r="7" fill="none" stroke="#c9c0b0" strokeWidth="3.4" />
      <circle cx="45" cy="32" r="4.4" fill="#8fd0f5" stroke="#5b8def" strokeWidth="1.6" />
    </svg>
  )
}

// Friendly, respectful cartoon sketches — stylised, not photographic.
const PORTRAITS = {
  gandhi: {
    fill: '#e6b98a',
    hair: '#cfd8de',
    feature: (
      <g>
        <circle cx="28.5" cy="30" r="1.8" fill="#2f3a1f" />
        <circle cx="35.5" cy="30" r="1.8" fill="#2f3a1f" />
        <path d="M25 40 Q32 44 39 40" stroke="#7a6a5a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M25 30 Q20 36 22 46" stroke="#cfd8de" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M39 30 Q44 36 42 46" stroke="#cfd8de" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M28 22 Q32 19 36 22" stroke="#2f3a1f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="34" r="6" fill="none" stroke="#c9c0b0" strokeWidth="2.6" />
      </g>
    ),
    glasses: true,
    body: <circle cx="32" cy="52" r="14" fill="#f5efea" stroke="#c9c0b0" strokeWidth="2.4" />,
    robe: <path d="M24 44 Q32 40 40 44 L40 64 L24 64 Z" fill="#5b8def" opacity="0.25" />,
  },
  bose: {
    fill: '#e6aa6a',
    hair: '#3a2a1a',
    feature: (
      <g>
        <circle cx="28.5" cy="30" r="1.8" fill="#2f3a1f" />
        <circle cx="35.5" cy="30" r="1.8" fill="#2f3a1f" />
        <rect x="26" y="22" width="12" height="4" rx="2" fill="#3a2a1a" />
        <path d="M28 20 Q32 16 36 20 Q33 18 30 19 Z" fill="#3a2a1a" />
        <path d="M27 34 Q32 38 37 34" stroke="#3a2a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
    body: <path d="M23 40 Q23 34 30 34 L34 34 Q41 34 41 40 L41 62 L23 62 Z" fill="#314a6b" stroke="#1f3450" strokeWidth="2.4" />,
  },
  nehru: {
    fill: '#eab98a',
    hair: '#8fbfd9',
    feature: (
      <g>
        <circle cx="28.5" cy="30" r="1.8" fill="#2f3a1f" />
        <circle cx="35.5" cy="30" r="1.8" fill="#2f3a1f" />
        <path d="M26 22 Q32 18 38 22" stroke="#8fbfd9" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <circle cx="27.5" cy="25.5" r="1" fill="#2f3a1f" />
      </g>
    ),
    body: <path d="M24 48 L40 48 L40 62 L24 62 Z" fill="#f7f3e8" stroke="#c9c0b0" strokeWidth="2.2" />,
    rose: <circle cx="40" cy="36" r="3" fill="#e0664f" />,
  },
  rani: {
    fill: '#d99a6a',
    hair: '#2a1a1a',
    feature: (
      <g>
        <circle cx="28.5" cy="31" r="1.7" fill="#2f3a1f" />
        <circle cx="35.5" cy="31" r="1.7" fill="#2f3a1f" />
        <path d="M26 27 Q32 30 38 27 M24 40 Q32 44 40 40" stroke="#2a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M26 24 Q32 20 38 24 L36 20 L28 19 Z" fill="#2a1a1a" />
        <circle cx="27" cy="25" r="1.2" fill="#e0664f" opacity="0.8" />
      </g>
    ),
    body: <path d="M24 40 Q24 33 32 33 Q40 33 40 40 L40 44 L24 44 Z" fill="#5b3a6b" stroke="#3a2550" strokeWidth="2.2" />,
  },
  patel: {
    fill: '#e6aa6a',
    hair: '#a08a6a',
    feature: (
      <g>
        <circle cx="28.5" cy="30" r="1.8" fill="#2f3a1f" />
        <circle cx="35.5" cy="30" r="1.8" fill="#2f3a1f" />
        <path d="M25 36 Q32 40 39 36" stroke="#2f3a1f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M24 26 Q30 22 36 26" stroke="#a08a6a" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    ),
    body: <path d="M24 46 L40 46 L40 62 L24 62 Z" fill="#f5efea" stroke="#c9c0b0" strokeWidth="2.2" />,
  },
  bhagat: {
    fill: '#e6aa6a',
    hair: '#3a2a1a',
    feature: (
      <g>
        <circle cx="28.5" cy="30" r="1.8" fill="#2f3a1f" />
        <circle cx="35.5" cy="30" r="1.8" fill="#2f3a1f" />
        <path d="M24 38 Q32 42 40 38" stroke="#2f3a1f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M26 22 Q32 18 38 22 L37 18 L27 18 Z" fill="#3a2a1a" />
      </g>
    ),
    body: <path d="M24 46 L40 46 L40 62 L24 62 Z" fill="#c8a25a" stroke="#8a6a3a" strokeWidth="2.2" />,
  },
  sarojini: {
    fill: '#d99a6a',
    hair: '#2a1a1a',
    feature: (
      <g>
        <circle cx="28.5" cy="31" r="1.7" fill="#2f3a1f" />
        <circle cx="35.5" cy="31" r="1.7" fill="#2f3a1f" />
        <path d="M25 27 Q32 30 39 27 M26 40 Q32 42 38 40" stroke="#2a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M26 24 Q32 19 38 24 L37 21 L27 21 Z" fill="#2a1a1a" />
      </g>
    ),
    body: <path d="M25 40 L25 35 Q32 32 39 35 L39 40 Z" fill="#b03a5a" stroke="#8a2b44" strokeWidth="2.2" />,
  },
  besant: {
    fill: '#e6b98a',
    hair: '#dfe8f0',
    feature: (
      <g>
        <circle cx="28.5" cy="31" r="1.7" fill="#2f3a1f" />
        <circle cx="35.5" cy="31" r="1.7" fill="#2f3a1f" />
        <path d="M26 40 Q32 43 38 40" stroke="#b0886a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M26 24 Q32 20 38 24 L38 18 L26 18 Q24 22 26 24 Z" fill="#dfe8f0" stroke="#b6c2cc" strokeWidth="1.6" />
      </g>
    ),
    body: <path d="M25 40 L25 34 Q32 31 39 34 L39 40 Z" fill="#5b6ba0" stroke="#3a4a7a" strokeWidth="2.2" />,
  },
}

export function Portrait({ person, size = 80, className = '' }) {
  const p = PORTRAITS[person] || PORTRAITS.gandhi
  return (
    <svg className={`soc-portrait soc-portrait-${person} ${className}`} viewBox="0 0 64 64" width={size} height={size} role="img" aria-hidden="true">
      {p.robe}
      {p.rose}
      <circle cx="32" cy="26" r="15" fill={p.fill} stroke="#a06a3a" strokeWidth="2.4" />
      {p.glasses && (
        <g>
          <circle cx="28.5" cy="30" r="5" fill="none" stroke="#3a2f2a" strokeWidth="1.8" />
          <circle cx="35.5" cy="30" r="5" fill="none" stroke="#3a2f2a" strokeWidth="1.8" />
          <line x1="33.5" y1="30" x2="30.5" y2="30" stroke="#3a2f2a" strokeWidth="1.6" />
        </g>
      )}
      <circle cx="32" cy="12" r="7" fill={p.hair} />
      {p.feature}
      {p.body}
    </svg>
  )
}

export const PORTRAIT_KEYS = Object.keys(PORTRAITS)