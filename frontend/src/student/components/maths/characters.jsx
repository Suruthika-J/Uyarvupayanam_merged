import React from 'react'

// The single explorer character who travels through all Math Adventure Worlds.
// A happy child with a backpack and a little compass in hand. Colors come from
// the active world's palette via CSS custom properties so she matches each world.

const EXPLORER_SKIN = '#ffd9a0'
const EXPLORER_HAIR = '#6b4a2f'

export function Explorer({ pose = 'wave' }) {
  const wave = pose === 'wave'
  const tilt = pose === 'think'
  return (
    <svg
      viewBox="0 0 200 260"
      width={168}
      height={218}
      aria-hidden="true"
      className="mth-explorer-figure"
      style={{ transform: tilt ? 'rotate(-6deg)' : undefined, transformOrigin: 'bottom center' }}
    >
      {/* shadow */}
      <ellipse cx={100} cy={246} rx={52} ry={12} fill="#000" opacity={0.14} />
      {/* legs */}
      <g stroke={EXPLORER_SKIN} strokeWidth={16} strokeLinecap="round">
        <line x1={80} y1={196} x2={78} y2={234} />
        <line x1={122} y1={196} x2={124} y2={234} />
      </g>
      {/* shoes */}
      <ellipse cx={74} cy={240} rx={16} ry={9} fill="var(--mth-accent)" />
      <ellipse cx={128} cy={240} rx={16} ry={9} fill="var(--mth-accent)" />
      {/* body */}
      <rect x={64} y={128} width={74} height={72} rx={22} fill="var(--mth-card-accent)" />
      {/* backpack */}
      <g>
        <rect x={128} y={132} width={34} height={58} rx={14} fill="var(--mth-ground)" opacity={0.9} />
        <path d="M128 150 q -12 0 -12 22 q0 22 12 22" fill="var(--mth-ground)" opacity={0.7} />
        <rect x={134} y={142} width={18} height={8} rx={4} fill="var(--mth-accent)" />
      </g>
      {/* arms */}
      <g stroke={EXPLORER_SKIN} strokeWidth={16} strokeLinecap="round">
        {wave ? (
          <path d="M70 158 q -26 -10 -30 -38" fill="none" />
        ) : (
          <line x1={70} y1={158} x2={56} y2={194} />
        )}
        <line x1={132} y1={158} x2={146} y2={188} />
      </g>
      {/* hands */}
      <circle cx={70} cy={158} r={9} fill={EXPLORER_SKIN} />
      {wave && <circle cx={40} cy={120} r={9} fill={EXPLORER_SKIN} />}
      <circle cx={146} cy={188} r={9} fill={EXPLORER_SKIN} />
      {/* compass in hand */}
      <circle cx={146} cy={174} r={13} fill="#fff" stroke="var(--mth-accent)" strokeWidth={4} />
      <path d="M146 166 L153 180 L146 176 L139 180 Z" fill="var(--mth-accent)" />
      {/* neck + head */}
      <rect x={86} y={118} width={30} height={14} rx={6} fill={EXPLORER_SKIN} />
      <circle cx={101} cy={92} r={40} fill={EXPLORER_SKIN} />
      {/* hair */}
      <path d="M61 92 C 61 48 141 48 141 92 C 128 74 112 68 84 68 C 72 68 66 78 61 92 Z" fill={EXPLORER_HAIR} />
      <circle cx={101} cy={56} r={12} fill={EXPLORER_HAIR} />
      {/* eyes */}
      <circle cx={87} cy={92} r={5} fill="#2b2b52" />
      <circle cx={113} cy={92} r={5} fill="#2b2b52" />
      {tilt && <circle cx={86} cy={90} r={2.2} fill="#fff" />}
      <circle cx={112} cy={90} r={2.2} fill="#fff" />
      {/* blush */}
      <ellipse cx={74} cy={106} rx={8} ry={5} fill="#ffb3b3" opacity={0.75} />
      <ellipse cx={128} cy={106} rx={8} ry={5} fill="#ffb3b3" opacity={0.75} />
      {/* smile */}
      <path d="M86 112 Q 101 128 116 112" stroke="#a85a3a" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* little friend: a coloured square badge */}
      <circle cx={101} cy={132} r={7} fill="var(--mth-accent)" />
    </svg>
  )
}