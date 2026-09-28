import React from 'react'

// Tiny flat object icons used by the visual / drag / story / money question
// components. Everything is data-driven: a question supplies an object name
// and MathObject draws the matching mini-icon in the world's accent colour.
// Unlisted names fall back to a friendly star so any new bank item still renders.

function Apple({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M24 12 c-4 -5 -12 -6 -14 -3 c-2 3 1 8 5 10 C11 21 8 25 9 30 c1 7 7 12 15 12 s14 -5 15 -12 c1 -5 -2 -9 -6 -11 c4 -2 7 -7 5 -10 c-2 -3 -10 -2 -14 3 Z" fill="#e8603a" />
      <path d="M24 12 c3 -4 4 -8 2 -10 c-2 -2 -6 0 -8 4" fill="#5fae58" />
      <path d="M25 10 c1 -2 1 -4 -1 -5" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Bird({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx={24} cy={27} rx={15} ry={13} fill={color} />
      <circle cx={35} cy={21} r={9} fill={color} />
      <path d="M41 15 l8 4 l-9 3 Z" fill={color} />
      <path d="M11 31 l-6 5 l9 -2 Z" fill="#ffd166" />
      <circle cx={37} cy={19} r={2} fill="#1f2733" />
      <path d="M40 24 l6 1" stroke="#1f2733" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <path d="M30 39 q2 5 6 7 M18 39 q-2 5 -6 7" stroke={color} strokeWidth={4} strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Mango({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M22 8 c10 4 16 14 15 24 c-1 8 -8 10 -14 6 c-7 -4 -10 -14 -6 -24 c2 -5 7 -4 5 -6 Z" fill={color} opacity={0.95} />
      <path d="M22 8 l-5 -4" stroke="#3f7a3a" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M14 30 q10 -4 16 4" stroke="#e2a23f" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />
    </svg>
  )
}

function Flower({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={24 + 11 * Math.cos((a * Math.PI) / 180)} cy={24 + 11 * Math.sin((a * Math.PI) / 180)} rx={8} ry={7} fill={color} transform={`rotate(${a} 24 24)`} />
      ))}
      <circle cx={24} cy={24} r={7} fill="#ffd166" />
      <rect x={23} y={34} width={3} height={10} rx={1.5} fill="#4f9c96" />
    </svg>
  )
}

function Bun({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx={24} cy={30} rx={17} ry={11} fill={color} opacity={0.95} />
      <path d="M12 28 C 10 16 38 16 36 28" fill={color} opacity={0.6} />
      <circle cx={20} cy={24} r={3} fill="#fff" opacity={0.7} />
      <circle cx={28} cy={22} r={3} fill="#fff" opacity={0.6} />
    </svg>
  )
}

function Leaf({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M26 6 C 44 12 42 36 20 42 C 8 46 6 30 12 20 C 16 12 24 8 26 6 Z" fill={color} />
      <path d="M25 10 C 30 22 18 32 16 38" stroke="#2f5d46" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Balloon({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx={24} cy={22} rx={14} ry={17} fill={color} />
      <path d="M24 39 q -9 -6 -10 -18" stroke="#c8d0da" strokeWidth={1.5} fill="none" opacity={0.7} />
      <path d="M24 39 l-3 6 M24 39 l3 6" stroke="#8a94a6" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function Dragonfly({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx={18} cy={27} rx={12} ry={8} fill="#cfe3f5" opacity={0.9} />
      <ellipse cx={34} cy={27} rx={12} ry={8} fill="#cfe3f5" opacity={0.9} />
      <rect x={23} y={12} width={3} height={24} rx={1.5} fill={color} />
      <circle cx={24.5} cy={10} r={4} fill={color} />
      <path d="M20 16 q 8 10 0 20 M28 16 q -8 10 0 20" stroke="#cfe3f5" strokeWidth={4} fill="none" opacity={0.8} />
      <circle cx={20} cy={16} r={2} fill="#1f2733" />
    </svg>
  )
}

function Egg({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M24 6 C 34 10 38 24 36 33 C 34 41 28 44 24 44 C 20 44 14 41 12 33 C 10 24 14 10 24 6 Z" fill={color} opacity={0.95} />
      <ellipse cx={19} cy={30} rx={4} ry={6} fill="#fff" opacity={0.5} />
    </svg>
  )
}

function Gem({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M24 4 L42 18 L24 44 L6 18 Z" fill="#cfd6e4" />
      <path d="M24 4 L32 18 L24 44 L16 18 Z" fill={color} />
      <path d="M6 18 L42 18 L32 18 L24 4 L16 18 Z" fill="#e9edf5" opacity={0.6} />
      <path d="M24 44 L16 18 L32 18 Z" fill={color} opacity={0.85} />
    </svg>
  )
}

function Ring({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <circle cx={24} cy={22} r={14} fill="none" stroke={color} strokeWidth={7} />
      <circle cx={24} cy={22} r={14} fill="none" stroke="#fff" strokeWidth={2} opacity={0.55} />
      <rect x={20} y={32} width={8} height={10} rx={3} fill={color} />
    </svg>
  )
}

function Pearl({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx={14} cy={34} rx={11} ry={5} fill="#1f2733" opacity={0.2} />
      <circle cx={24} cy={18} r={13} fill={color} />
      <circle cx={19} cy={14} r={4} fill="#fff" opacity={0.8} />
      <ellipse cx={24} cy={40} rx={15} ry={5} fill={color} opacity={0.4} />
    </svg>
  )
}

function Coin({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <circle cx={24} cy={24} r={19} fill={color} />
      <circle cx={24} cy={24} r={19} fill="none" stroke="#d8a63f" strokeWidth={4} opacity={0.6} />
      <circle cx={24} cy={24} r={12} fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />
      <text x={24} y={30} textAnchor="middle" fontSize={18} fontWeight={800} fill="#7a4f1f">₹</text>
    </svg>
  )
}

function Note({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x={8} y={10} width={32} height={28} rx={5} fill="#cfe3f5" />
      <rect x={12} y={16} width={24} height={4} rx={2} fill={color} opacity={0.9} />
      <rect x={12} y={24} width={24} height={4} rx={2} fill={color} opacity={0.5} />
      <text x={24} y={38} textAnchor="middle" fontSize={14} fontWeight={800} fill="#4a78b0">₹</text>
    </svg>
  )
}

function Window({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x={6} y={6} width={36} height={36} rx={5} fill={color} opacity={0.95} />
      <rect x={6} y={6} width={36} height={36} rx={5} fill="none" stroke="var(--mth-ground)" strokeWidth={5} />
      <line x1={24} y1={6} x2={24} y2={42} stroke="var(--mth-ground)" strokeWidth={5} />
      <line x1={6} y1={24} x2={42} y2={24} stroke="var(--mth-ground)" strokeWidth={5} />
      <rect x={10} y={10} width={12} height={12} rx={2} fill="#fff" opacity={0.6} />
    </svg>
  )
}

function Jug({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x={12} y={12} width={24} height={30} rx={6} fill={color} opacity={0.9} />
      <path d="M12 28 C 6 30 6 40 12 44" fill={color} opacity={0.5} />
      <rect x={18} y={4} width={12} height={10} rx={3} fill={color} opacity={0.8} />
    </svg>
  )
}

function Pencil({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x={10} y={8} width={22} height={8} rx={3} fill={color} />
      <polygon points="10,26 32,26 24,40 8,40" fill={color} opacity={0.85} />
      <rect x={8} y={26} width={26} height={8} rx={2} fill="#ffd166" />
      <path d="M8 22 L8 30 M14 22 L14 30 M20 22 L20 30 M26 22 L26 30" stroke="#7a4f1f" strokeWidth={1.5} opacity={0.5} />
    </svg>
  )
}

function Ruler({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x={6} y={17} width={36} height={14} rx={4} fill={color} opacity={0.9} />
      {[14, 20, 26, 32, 38].map((x) => (
        <line key={x} x1={x} y1={17} x2={x} y2={x % 6 === 2 ? 24 : 27} stroke="#7a4f1f" strokeWidth={1.5} />
      ))}
    </svg>
  )
}

function Ribbon({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M8 8 L40 8 L40 18 L8 18 Z" fill={color} />
      <path d="M30 18 L40 18 L34 28 L24 28 Z" fill={color} opacity={0.7} />
      <path d="M40 28 L8 28 M44 28 L44 40 L36 40 L36 30 Z" fill={color} opacity={0.55} />
    </svg>
  )
}

function Star({ color }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M24 4 L29 18 L44 18 L32 28 L37 44 L24 34 L11 44 L16 28 L4 18 L19 18 Z" fill={color} />
      <circle cx={24} cy={26} r={4} fill="#fff" opacity={0.6} />
    </svg>
  )
}

const ART = {
  apple: Apple,
  bird: Bird,
  mango: Mango,
  flower: Flower,
  bun: Bun,
  leaf: Leaf,
  balloon: Balloon,
  dragonfly: Dragonfly,
  egg: Egg,
  gem: Gem,
  ring: Ring,
  pearl: Pearl,
  coin: Coin,
  note: Note,
  window: Window,
  jar: Jug,
  jug: Jug,
  cup: Jug,
  pencil: Pencil,
  ruler: Ruler,
  ribbon: Ribbon,
  star: Star,
}

export default function MathObject({ name, color, size = 44 }) {
  const Key = ART[name] || Star
  return (
    <span
      className={`mth-obj mth-obj-${name || 'star'}`}
      style={{ width: `${Math.round(size)}px`, height: `${Math.round(size)}px`, color: color || 'var(--mth-accent)' }}
      aria-hidden="true"
    >
      <Key color={color || 'var(--mth-accent)'} />
    </span>
  )
}