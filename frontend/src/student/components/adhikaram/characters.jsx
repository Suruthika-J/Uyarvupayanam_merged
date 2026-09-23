import React from 'react'

// Flat cartoon child figures that stand in each illustrated world.
// Drawn as simple shapes so they stay friendly and style-safe for kids.

const SKIN = '#ffd9a8'
const HAIR = '#5d4037'
const SHOE = '#6f4226'

export function ChildWave() {
  return (
    <svg viewBox="0 0 220 260" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      <ellipse cx={110} cy={246} rx={62} ry={10} fill="#000" opacity={0.12} />
      {/* legs */}
      <rect x={88} y={172} width={18} height={66} rx={8} fill="#ff8a3d" />
      <rect x={114} y={172} width={18} height={66} rx={8} fill="#ff8a3d" />
      <ellipse cx={97} cy={240} rx={14} ry={8} fill={SHOE} />
      <ellipse cx={123} cy={240} rx={14} ry={8} fill={SHOE} />
      {/* arm down */}
      <rect x={34} y={110} width={16} height={62} rx={8} fill="#ff8a3d" transform="rotate(14 42 110)" />
      <circle cx={36} cy={176} r={11} fill={SKIN} />
      {/* torso */}
      <rect x={72} y={92} width={76} height={86} rx={22} fill="#ffb03a" />
      <rect x={72} y={92} width={76} height={20} rx={10} fill="#ffe0a3" />
      {/* waving arm up */}
      <rect x={140} y={74} width={16} height={58} rx={8} fill="#ffb03a" transform="rotate(-55 148 80)" />
      <circle cx={158} cy={58} r={12} fill={SKIN} />
      {/* head */}
      <circle cx={110} cy={64} r={40} fill={SKIN} />
      <path d="M70 60 a40 40 0 0 1 80 0 q-4 26 -40 26 q-36 0 -40 -26 Z" fill={HAIR} />
      <circle cx={96} cy={70} r={4.5} fill="#3a2a22" />
      <circle cx={124} cy={70} r={4.5} fill="#3a2a22" />
      <path d="M98 86 q12 12 24 0" stroke="#3a2a22" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={90} cy={84} r={5} fill="#ff95a0" opacity={0.6} />
    </svg>
  )
}

export function ChildRead() {
  return (
    <svg viewBox="0 0 220 260" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      <ellipse cx={110} cy={246} rx={62} ry={10} fill="#000" opacity={0.12} />
      <rect x={88} y={172} width={18} height={66} rx={8} fill="#3fa0d8" />
      <rect x={114} y={172} width={18} height={66} rx={8} fill="#3fa0d8" />
      <ellipse cx={97} cy={240} rx={14} ry={8} fill={SHOE} />
      <ellipse cx={123} cy={240} rx={14} ry={8} fill={SHOE} />
      <rect x={72} y={92} width={76} height={86} rx={22} fill="#f2953f" />
      <rect x={72} y={92} width={76} height={20} rx={10} fill="#ffe0a3" />
      {/* arms holding book */}
      <rect x={40} y={128} width={18} height={60} rx={9} fill="#f2953f" transform="rotate(24 49 128)" />
      <rect x={162} y={128} width={18} height={60} rx={9} fill="#f2953f" transform="rotate(-24 171 128)" />
      {/* open book */}
      <g transform="translate(88 120)">
        <path d="M0 8 Q 22 -4 44 8 L44 48 Q 22 36 0 48 Z" fill="#fff" stroke="#c98a3d" strokeWidth={3} />
        <path d="M44 8 Q 66 -4 88 8 L88 48 Q 66 36 44 48 Z" fill="#fff" stroke="#c98a3d" strokeWidth={3} />
        <line x1={22} y1={12} x2={22} y2={44} stroke="#ffd99a" strokeWidth={3} />
        <line x1={66} y1={12} x2={66} y2={44} stroke="#ffd99a" strokeWidth={3} />
      </g>
      <circle cx={110} cy={56} r={40} fill={SKIN} />
      <path d="M70 52 a40 40 0 0 1 80 0 q-4 26 -40 26 q-36 0 -40 -26 Z" fill={HAIR} />
      <circle cx={96} cy={62} r={4.5} fill="#3a2a22" />
      <circle cx={124} cy={62} r={4.5} fill="#3a2a22" />
      <path d="M98 80 q12 12 24 0" stroke="#3a2a22" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={90} cy={78} r={5} fill="#ff95a0" opacity={0.6} />
    </svg>
  )
}

export function ChildFarm() {
  return (
    <svg viewBox="0 0 220 260" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      <ellipse cx={110} cy={246} rx={62} ry={10} fill="#000" opacity={0.12} />
      <rect x={90} y={172} width={18} height={66} rx={8} fill="#58b368" />
      <rect x={116} y={172} width={18} height={66} rx={8} fill="#58b368" />
      <ellipse cx={99} cy={240} rx={14} ry={8} fill={SHOE} />
      <ellipse cx={125} cy={240} rx={14} ry={8} fill={SHOE} />
      <rect x={72} y={92} width={76} height={86} rx={22} fill="#2f9e6b" />
      <rect x={72} y={92} width={76} height={20} rx={10} fill="#dff0c8" />
      {/* arm holding spade */}
      <rect x={148} y={118} width={18} height={62} rx={9} fill="#2f9e6b" transform="rotate(-34 157 118)" />
      <circle cx={176} cy={92} r={11} fill={SKIN} />
      <g transform="rotate(-34 176 108)">
        <rect x={172} y={104} width={8} height={86} rx={4} fill="#6f4226" />
        <path d="M163 180 h26 v18 h-26 Z" fill="#a8a29a" />
      </g>
      {/* free arm */}
      <rect x={36} y={118} width={18} height={60} rx={9} fill="#2f9e6b" transform="rotate(20 45 118)" />
      <circle cx={40} cy={182} r={11} fill={SKIN} />
      <circle cx={110} cy={58} r={40} fill={SKIN} />
      <path d="M70 54 a40 40 0 0 1 80 0 q-4 26 -40 26 q-36 0 -40 -26 Z" fill={HAIR} />
      <circle cx={96} cy={64} r={4.5} fill="#3a2a22" />
      <circle cx={124} cy={64} r={4.5} fill="#3a2a22" />
      <path d="M98 82 q12 12 24 0" stroke="#3a2a22" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={90} cy={80} r={5} fill="#ff95a0" opacity={0.6} />
    </svg>
  )
}

export function ChildUmbrella() {
  return (
    <svg viewBox="0 0 220 260" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      <ellipse cx={110} cy={246} rx={62} ry={10} fill="#000" opacity={0.12} />
      <rect x={90} y={172} width={18} height={66} rx={8} fill="#3fa0d8" />
      <rect x={116} y={172} width={18} height={66} rx={8} fill="#3fa0d8" />
      <ellipse cx={99} cy={240} rx={14} ry={8} fill={SHOE} />
      <ellipse cx={125} cy={240} rx={14} ry={8} fill={SHOE} />
      <rect x={72} y={92} width={76} height={86} rx={22} fill="#e2636f" />
      <rect x={72} y={92} width={76} height={20} rx={10} fill="#ffd9d9" />
      {/* handle arm up */}
      <rect x={140} y={66} width={16} height={56} rx={8} fill="#e2636f" transform="rotate(-48 148 72)" />
      <circle cx={168} cy={48} r={11} fill={SKIN} />
      {/* umbrella dome */}
      <path d="M96 48 Q 110 4 124 48 Z" fill="#4a7fb5" />
      <path d="M82 50 Q 110 14 138 50 Z" fill="#4a7fb5" />
      <path d="M82 50 Q 110 30 138 50 Z" fill="#7fc8d8" opacity={0.8} />
      <circle cx={110} cy={50} r={4} fill="#e8f8ff" />
      {/* free arm */}
      <rect x={36} y={118} width={18} height={60} rx={9} fill="#e2636f" transform="rotate(20 45 118)" />
      <circle cx={40} cy={182} r={11} fill={SKIN} />
      <circle cx={110} cy={64} r={40} fill={SKIN} />
      <path d="M70 62 a40 40 0 0 1 80 0 q-4 26 -40 26 q-36 0 -40 -26 Z" fill={HAIR} />
      <circle cx={96} cy={68} r={4.5} fill="#3a2a22" />
      <circle cx={124} cy={68} r={4.5} fill="#3a2a22" />
      <path d="M98 86 q12 12 24 0" stroke="#3a2a22" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function ChildHug() {
  return (
    <svg viewBox="0 0 220 260" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      <ellipse cx={110} cy={246} rx={62} ry={10} fill="#000" opacity={0.12} />
      <rect x={88} y={172} width={18} height={66} rx={8} fill="#e2636f" />
      <rect x={114} y={172} width={18} height={66} rx={8} fill="#e2636f" />
      <ellipse cx={97} cy={240} rx={14} ry={8} fill={SHOE} />
      <ellipse cx={123} cy={240} rx={14} ry={8} fill={SHOE} />
      <rect x={72} y={92} width={76} height={86} rx={22} fill="#e2636f" />
      <rect x={72} y={92} width={76} height={20} rx={10} fill="#ffe0d0" />
      {/* open arms (hug) */}
      <rect x={30} y={120} width={18} height={56} rx={9} fill="#e2636f" transform="rotate(42 39 120)" />
      <rect x={172} y={120} width={18} height={56} rx={9} fill="#e2636f" transform="rotate(-42 181 120)" />
      <circle cx={30} cy={182} r={11} fill={SKIN} />
      <circle cx={190} cy={182} r={11} fill={SKIN} />
      {/* little heart */}
      <path
        d="M103 152 q3 -7 7 -7 q4 0 7 7 q-4 7 -7 10 q-3 -3 -7 -10 Z"
        fill="#ff4d6d"
      />
      <circle cx={110} cy={56} r={40} fill={SKIN} />
      <path d="M70 52 a40 40 0 0 1 80 0 q-4 26 -40 26 q-36 0 -40 -26 Z" fill={HAIR} />
      <circle cx={96} cy={62} r={4.5} fill="#3a2a22" />
      <circle cx={124} cy={62} r={4.5} fill="#3a2a22" />
      <path d="M98 80 q12 12 24 0" stroke="#3a2a22" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={90} cy={78} r={5} fill="#ff95a0" opacity={0.6} />
    </svg>
  )
}