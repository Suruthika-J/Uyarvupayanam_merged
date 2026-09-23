import React, { useState } from 'react'
import NumberChar from './NumberChar'

// ShapeTouchQuestion: count the corners of a real drawn shape by tapping each
// corner. Every tap lights the corner up and the NumberChar counter climbs,
// teaching sides-and-corners through touch instead of bare notation.

const SIDES = {
  triangle: 3,
  square: 4,
  rectangle: 4,
  hexagon: 6,
  pentagon: 5,
}

const SHAPE_SVG = {
  triangle: 'M110 20 L195 170 L25 170 Z',
  square: 'M30 30 L190 30 L190 190 L30 190 Z',
  rectangle: 'M25 60 L195 60 L195 160 L25 160 Z',
  hexagon: 'M145 20 L200 105 L145 190 L75 190 L20 105 L75 20 Z',
  pentagon: 'M110 18 L196 82 L165 188 L55 188 L24 82 Z',
}

const SHAPE_CORNERS = {
  triangle: [
    [110, 26],
    [190, 172],
    [30, 172],
  ],
  square: [
    [34, 34],
    [186, 34],
    [186, 186],
    [34, 186],
  ],
  rectangle: [
    [27, 62],
    [193, 62],
    [193, 158],
    [27, 158],
  ],
  hexagon: [
    [145, 26],
    [198, 108],
    [143, 188],
    [77, 188],
    [22, 108],
    [75, 26],
  ],
  pentagon: [
    [106, 26],
    [190, 82],
    [161, 184],
    [59, 184],
    [30, 82],
  ],
}

export default function ShapeTouchQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, answer } = question
  const shape = objects.shape || 'triangle'
  const corners = SHAPE_CORNERS[shape] || SHAPE_CORNERS.triangle
  const sides = SIDES[shape] || 3

  const [lit, setLit] = useState([])
  const [done, setDone] = useState(false)

  function tapCorner(i) {
    if (disabled || done || lit.includes(i)) return
    const next = [...lit, i]
    setLit(next)
    if (next.length === corners.length) {
      window.setTimeout(() => {
        setDone(true)
        onAnswer(next.length === Number(answer) && next.length === sides)
      }, 340)
    }
  }

  return (
    <div className="mth-shape">
      <svg viewBox="0 0 220 210" width={280} height={268} className="mth-shape-svg" aria-label={`a ${shape} with ${sides} sides to count`} role="img">
        <path
          d={SHAPE_SVG[shape] || SHAPE_SVG.triangle}
          fill="var(--mth-card-bg)"
          stroke="var(--mth-card-accent)"
          strokeWidth={10}
          strokeLinejoin="round"
        />
        {corners.map(([x, y], i) => {
          const on = lit.includes(i)
          return (
            <circle key={i} cx={x} cy={y} r={on ? 22 : 15} fill={on ? 'var(--mth-accent)' : '#fff'} stroke="var(--mth-card-accent)" strokeWidth={5} />
          )
        })}
      </svg>

      <div className="mth-shape-count" role="group" aria-label="tap each corner to count">
        {corners.map(([x, y], i) => (
          <button
            key={i}
            type="button"
            className={`mth-shape-tap${lit.includes(i) ? ' is-lit' : ''}`}
            style={{ left: `${(x / 220) * 100}%`, top: `${(y / 210) * 100}%` }}
            onClick={() => tapCorner(i)}
            disabled={disabled || done || lit.includes(i)}
            aria-label={`corner ${i + 1}`}
          />
        ))}
        <div className="mth-shape-count-badge">
          <NumberChar digit={String(lit.length)} size={46} />
        </div>
      </div>
    </div>
  )
}