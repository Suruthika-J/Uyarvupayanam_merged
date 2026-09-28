import React, { useState } from 'react'
import NumberChar from './NumberChar'

// ClockQuestion: read the big station clock and tap the matching time.
// The hands are drawn from the question's {hour, minute}; the options are
// time labels so the child practises the visual skill of reading a clock
// (never just solving bare notation).

function clockPath(center, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: center + r * Math.cos(a),
    y: center + r * Math.sin(a),
  }
}

export default function ClockQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, options = [], answer } = question
  const hour = Number(objects.hour || 12)
  const minute = Number(objects.minute || 0)

  const [picked, setPicked] = useState(null)

  const cx = 110
  const cy = 110
  const r = 92
  const hourAngle = ((hour % 12) + minute / 60) * 30
  const minuteAngle = minute * 6
  const hourTip = clockPath(cx, cy, 46, hourAngle)
  const minuteTip = clockPath(cx, cy, 72, minuteAngle)

  function choose(opt) {
    if (picked != null || disabled) return
    setPicked(opt)
    onAnswer(String(opt) === String(answer))
  }

  return (
    <div className="mth-clock">
      <svg viewBox="0 0 220 220" width={200} height={200} className="mth-clock-face" aria-label={`clock showing time ${answer}`} role="img">
        <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="var(--mth-card-accent)" strokeWidth={10} />
        {Array.from({ length: 12 }).map((_, i) => {
          const tick = clockPath(cx, cy, r - 12, i * 30)
          return (
            <text key={i} x={tick.x} y={tick.y + 8} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--mth-card-accent)">
              {(i === 0 ? 12 : i) + 0}
            </text>
          )
        })}
        <line x1={cx} y1={cy} x2={hourTip.x} y2={hourTip.y} stroke="#2b2b52" strokeWidth={9} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={minuteTip.x} y2={minuteTip.y} stroke="var(--mth-accent)" strokeWidth={5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={7} fill="#2b2b52" />
      </svg>
      <div className="mth-clock-opts" role="group" aria-label="choose the time">
        {options.map((opt) => {
          const selected = picked != null && String(opt) === String(picked)
          const showCorrect = picked != null && String(opt) === String(answer)
          const showWrong = selected && String(opt) !== String(answer)
          return (
            <button
              key={String(opt)}
              type="button"
              className={`mth-opt${selected ? ' is-picked' : ''}${showCorrect ? ' is-correct' : ''}${showWrong ? ' is-wrong' : ''}`}
              onClick={() => choose(opt)}
              disabled={disabled || picked != null}
            >
              <DigitTime label={String(opt)} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DigitTime({ label }) {
  const clean = String(label).replace(':', '')
  return (
    <span className="mth-clock-opt-label">
      {clean.split('').map((ch, i) => (
        <NumberChar key={`${ch}-${i}`} digit={ch} size={30} animate={false} />
      ))}
      <span className="mth-clock-opt-colon">:</span>
    </span>
  )
}