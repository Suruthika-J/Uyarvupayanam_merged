import React, { useState } from 'react'
import NumberChar from './NumberChar'

// ChartBuildQuestion: build the tally into a real bar chart, then read it.
// Each category's bar grows from its tally (one short animation, not looping)
// and glows when done. Afterwards the child taps the bar that answers the
// survey question (the favourite, the fewest, or the bar with an exact count).

const CHART_MAX = 220

export default function ChartBuildQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, answer } = question
  const data = objects.data || []

  const [picked, setPicked] = useState(null)

  const maxVal = Math.max(1, ...data.map((d) => Number(d.value || 0)))
  const tallest = (d) => Number(d.value || 0) === maxVal

  function choose(label) {
    if (picked != null || disabled) return
    setPicked(label)
    onAnswer(String(label) === String(answer))
  }

  return (
    <div className="mth-chart">
      <div className="mth-chart-tally" aria-hidden="true">
        {data.map((d) => (
          <div key={d.label} className="mth-chart-tally-col">
            <span className="mth-chart-tally-val">{Number(d.value)}</span>
            <span className="mth-chart-tally-label">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="mth-chart-area">
        <svg viewBox="0 0 300 220" width="100%" height={220} className="mth-chart-svg" role="img" aria-label="tally chart">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((line) => (
            <line key={line} x1={0} x2={300} y1={CHART_MAX - line * 24} y2={CHART_MAX - line * 24} stroke="#cfe0ee" strokeWidth={1.5} strokeDasharray="3 5" opacity={0.7} />
          ))}
          <g>
            {data.map((d, i) => {
              const w = 300 / data.length
              const x = i * w + w * 0.22
              const barW = w * 0.56
              const h = (Number(d.value || 0) / maxVal) * 190
              const selected = picked != null && String(d.label) === String(picked)
              const showGood = picked != null && String(d.label) === String(answer)
              return (
                <rect
                  key={d.label}
                  x={x}
                  y={CHART_MAX - h}
                  width={barW}
                  height={Math.max(4, h)}
                  rx={10}
                  fill={showGood ? '#7fd8d8' : tallest(d) ? 'var(--mth-accent)' : '#8fb4f0'}
                  opacity={selected ? 1 : 0.92}
                  stroke={selected ? 'var(--mth-card-accent)' : 'none'}
                  strokeWidth={selected ? 6 : 0}
                  className="mth-chart-bar"
                  style={{ '--bar-h': `${Math.max(4, h)}px` }}
                />
              )
            })}
          </g>
        </svg>
        <div className="mth-chart-labels">
          {data.map((d) => {
            const selected = picked != null && String(d.label) === String(picked)
            const showGood = picked != null && String(d.label) === String(answer)
            const showWrong = selected && String(d.label) !== String(answer)
            return (
              <button
                key={d.label}
                type="button"
                className={`mth-chart-btn${selected ? ' is-picked' : ''}${showGood ? ' is-correct' : ''}${showWrong ? ' is-wrong' : ''}`}
                onClick={() => choose(d.label)}
                disabled={disabled || picked != null}
                aria-pressed={selected}
              >
                <span className="mth-chart-btn-label">{d.label}</span>
                <span className="mth-chart-btn-count">
                  <NumberChar digit={String(d.value)} size={26} animate={false} />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}