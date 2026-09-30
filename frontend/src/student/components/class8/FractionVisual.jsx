import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// FractionVisual — inline visual math (no image dependencies). Supports the
// descriptor shapes that the Maths Missions backend seed data produces:
//   { kind: "fractionBar", total, shaded, label }
//   { kind: "circle", parts: [0|1, ...], label }           (1 = shaded slice)
//   { kind: "grid", cols, rows, shaded, label }
//   { kind: "numberLine", from, to, marker, label }
// Plus FractionParts: a big annotated numerator / denominator display.
// ─────────────────────────────────────────────────────────────────────────────

const SHADE = '#1a7a50'
const SHADE_SOFT = '#e6f4ec'
const EMPTY = '#eef2f5'
const EDGE = '#d9e6df'
const INK = '#0f172a'
const MUTED = '#5b6b80'

export function FractionParts({ numerator, denominator, size = 34 }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: size, fontWeight: 900, color: SHADE, lineHeight: 1.05 }}>{numerator}</span>
      <span style={{ display: 'block', width: Math.max(30, size * 0.92), height: 3, borderRadius: 99, background: '#1e293b', margin: '0 auto' }} />
      <span style={{ fontSize: size, fontWeight: 900, color: '#145c3d', lineHeight: 1.05 }}>{denominator}</span>
    </div>
  )
}

export function FractionBar({ total = 1, shaded = 0, label, annotate, barHeight = 34, cellGap = 4 }) {
  const parts = Math.max(1, Math.min(20, Number(total) || 1))
  const fill = Math.max(0, Math.min(parts, Number(shaded) || 0))
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: cellGap, marginBottom: label || annotate ? 12 : 0 }}>
        {Array.from({ length: parts }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: barHeight,
              borderRadius: 8,
              background: i < fill ? SHADE : EMPTY,
              border: `1.5px solid ${i < fill ? '#0e5f3c' : EDGE}`,
              transition: 'background 0.25s ease',
            }}
          />
        ))}
      </div>
      {annotate && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <FractionParts numerator={fill} denominator={parts} />
        </div>
      )}
      {label && (
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, textAlign: 'center' }}>{label}</div>
      )}
    </div>
  )
}

export function FractionCircle({ parts = [], total, shaded, label, radius = 54 }) {
  // Build the slice list: prefer `parts` (explicit 0/1 per slice), fall back
  // to `total` + `shaded` (contiguous shading from the top).
  let slices = Array.isArray(parts) && parts.length ? parts : []
  if (!slices.length && total) {
    const n = Number(total) || 1
    const f = Math.max(0, Math.min(n, Number(shaded) || 0))
    slices = Array.from({ length: n }, (_, i) => (i < f ? 1 : 0))
  }
  const n = slices.length || 4
  const cx = 70
  const cy = 70
  const r = radius || 54
  const sectors = slices.map((on, i) => {
    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2)
    const y2 = cy + r * Math.sin(a2)
    const large = a2 - a1 > Math.PI ? 1 : 0
    return { on: Boolean(on), d: `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z` }
  })
  const shadedCount = slices.filter(Boolean).length

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <svg width={radius * 2 + 32} height={radius * 2 + 32} viewBox="0 0 140 140" role="img" aria-label={`A circle showing ${shadedCount} of ${n} equal parts`} style={{ display: 'block', margin: '0 auto' }}>
        {sectors.map((s, i) => (
          <path key={i} d={s.d} fill={s.on ? SHADE : EMPTY} stroke="#fff" strokeWidth="2" />
        ))}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={EDGE} strokeWidth="2" />
      </svg>
      {label && (
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>{label}</div>
      )}
    </div>
  )
}

export function FractionGrid({ cols = 1, rows = 1, shaded = 0, cells = null, label }) {
  const c = Math.max(1, Math.min(12, Number(cols) || 1))
  const rw = Math.max(1, Math.min(12, Number(rows) || 1))
  const total = c * rw
  let lit = []
  if (Array.isArray(cells) && cells.length) {
    lit = cells.slice(0, total)
  } else {
    const f = Math.max(0, Math.min(total, Number(shaded) || 0))
    lit = Array.from({ length: total }, (_, i) => i < f)
  }
  const shadedCount = lit.filter(Boolean).length
  const cell = Math.max(26, Math.min(44, Math.floor(300 / c)))

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${c}, ${cell}px)`,
          gap: 3,
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: cell,
              height: cell,
              borderRadius: 7,
              background: lit[i] ? SHADE : EMPTY,
              border: `1.5px solid ${lit[i] ? '#0e5f3c' : EDGE}`,
            }}
          />
        ))}
      </div>
      {label && (
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>{label}</div>
      )}
    </div>
  )
}

export function FractionNumberLine({ from = 0, to = 10, marker, label }) {
  const lo = Number(from) || 0
  const hi = Number(to) || 10
  const m = marker === undefined || marker === null ? null : Number(marker)
  const X0 = 24
  const X1 = 200
  const Y = 34
  const span = hi - lo || 1
  const xFor = (v) => X0 + ((v - lo) / span) * (X1 - X0)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <svg width={228} height={64} viewBox="0 0 228 64" role="img" aria-label={`Number line from ${lo} to ${hi}${m !== null ? ` marked at ${m}` : ''}`} style={{ display: 'block', margin: '0 auto' }}>
        {/* ticks */}
        {Array.from({ length: span + 1 }, (_, i) => {
          const v = lo + i
          const x = xFor(v)
          return (
            <g key={v}>
              <line x1={x} y1={Y} x2={x} y2={Y + 7} stroke={EDGE} strokeWidth="2" />
              <text x={x} y={Y + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={MUTED}>{v}</text>
            </g>
          )
        })}
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {m !== null && lo <= m && m <= hi && (
          <g className="mm-fade-in">
            <circle cx={xFor(m)} cy={Y} r={7} fill={SHADE} stroke="#fff" strokeWidth="2.5" />
            <line x1={xFor(m)} y1={Y - 12} x2={xFor(m)} y2={Y + 24} stroke={SHADE} strokeWidth="2.5" strokeDasharray="3 3" />
          </g>
        )}
      </svg>
      {label && (
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>{label}</div>
      )}
    </div>
  )
}

// Switch on the backend visual descriptor.
export default function FractionVisual({ visual, annotate = false }) {
  if (!visual) return null
  switch (visual.kind) {
    case 'fractionBar':
      return <FractionBar total={visual.total} shaded={visual.shaded} label={visual.label} annotate={annotate} />
    case 'circle':
      return <FractionCircle parts={visual.parts} total={visual.total} shaded={visual.shaded} label={visual.label} />
    case 'grid':
      return <FractionGrid cols={visual.cols} rows={visual.rows} shaded={visual.shaded} cells={visual.cells} label={visual.label} />
    case 'numberLine':
      return <FractionNumberLine from={visual.from} to={visual.to} marker={visual.marker} label={visual.label} />
    default:
      return null
  }
}