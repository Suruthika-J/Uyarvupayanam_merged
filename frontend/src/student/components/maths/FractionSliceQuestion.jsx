import React, { useState } from 'react'
import NumberChar from './NumberChar'

// FractionSliceQuestion: share a cake/pizza/pie fairly, then answer with the
// part that is left. The item is already cut into `parts` equal slices; the
// eaten slices (parts - filled) start faded. Tap every slice that is left to
// light it up - the fraction builds itself as numerator over denominator and
// the child confirms when the number on the plate matches their count.

function platePosition(i, total, r = 74, cx = 110, cy = 100) {
  const a = (i / total) * 2 * Math.PI - Math.PI / 2
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  }
}

export default function FractionSliceQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, answer } = question
  const parts = Number(objects.parts || 4)
  const filled = Number(objects.filled || 0)
  const eaten = filled > 0 ? Math.max(0, parts - filled) : 0
  const num = parseInt(String(answer).split('/')[0], 10)
  const den = parseInt(String(answer).split('/')[1], 10)

  const [kept, setKept] = useState([])
  const [done, setDone] = useState(false)

  function tapSlice(i) {
    if (disabled || done) return
    if (kept.includes(i)) {
      setKept(kept.filter((k) => k !== i))
      return
    }
    const next = [...kept, i]
    setKept(next)
  }

  function confirm() {
    if (disabled || done) return
    // the part shown on the plate must equal the fraction in the answer
    const good = kept.length > 0 && kept.length * den === num * parts
    setDone(true)
    onAnswer(good)
  }

  function wedge(i) {
    const startA = (i / parts) * 2 * Math.PI - Math.PI / 2
    const endA = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2
    const large = endA - startA > Math.PI ? 1 : 0
    const p1 = { x: 110 + 98 * Math.cos(startA), y: 100 + 98 * Math.sin(startA) }
    const p2 = { x: 110 + 98 * Math.cos(endA), y: 100 + 98 * Math.sin(endA) }
    return `M110 100 L${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A98 98 0 ${large} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`
  }

  return (
    <div className="mth-frac">
      <div className="mth-frac-plate">
        <svg viewBox="0 0 220 200" width={280} height={260} aria-label={`dish cut into ${parts} equal slices, ${filled} slices left to count`} role="img">
          <ellipse cx={110} cy={185} rx={130} ry={18} fill="rgba(0,0,0,0.12)" />
          {Array.from({ length: parts }).map((_, i) => {
            const isKept = kept.includes(i)
            const isEaten = i < eaten
            return (
              <path
                key={i}
                d={wedge(i)}
                fill={isEaten ? 'var(--mth-accent)' : isKept ? '#ffd9a0' : '#ffe2cf'}
                opacity={isEaten ? 0.45 : 1}
                stroke="#d96a4a"
                strokeWidth={2.5}
              />
            )
          })}
          <circle cx={110} cy={100} r={18} fill="#ffc9a0" stroke="#d96a4a" strokeWidth={2} opacity={0.6} />
        </svg>
        <div className="mth-frac-taps">
          {Array.from({ length: parts }).map((_, i) => {
            const pos = platePosition(i, parts, 74, 110, 100)
            const isEaten = i < eaten
            const isKept = kept.includes(i)
            return (
              <button
                key={i}
                type="button"
                className={`mth-frac-tap${isKept ? ' is-lit' : ''}${isEaten ? ' is-eaten' : ''}`}
                style={{ left: `${(pos.x / 220) * 100}%`, top: `${(pos.y / 200) * 100}%` }}
                onClick={() => tapSlice(i)}
                disabled={disabled || done || isEaten}
                aria-label={`slice ${i + 1}`}
              />
            )
          })}
          <div className="mth-frac-badge">
            <span className="mth-frac-readout">
              <NumberChar digit={String(kept.length)} size={40} />
              <span className="mth-frac-bar" />
              <NumberChar digit={String(parts)} size={40} />
            </span>
            <button type="button" className="mth-frac-confirm" onClick={confirm} disabled={disabled || done || kept.length === 0}>
              That&apos;s the part left
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}