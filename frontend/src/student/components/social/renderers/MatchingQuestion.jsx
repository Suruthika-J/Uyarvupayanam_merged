import React, { useMemo, useState } from 'react'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// MatchingQuestion: tap one "left" chip then one "right" chip to pair them.
// A correct pair joins together (stays matched); a wrong pair is gently undone
// with a "let's explore this again" nudge and the round keeps going. When every
// pair is matched the parent is told "correct". pairs: [[left, right], ...]
// and answer is the same array, so the pairing order is by array index.

export default function MatchingQuestion({ question, disabled, onAnswer }) {
  const { objects = {} } = question
  const pairs = useMemo(() => (Array.isArray(objects.pairs) ? objects.pairs : []), [objects])
  const lefts = pairs.map((p) => String(p[0]))
  const rights = useMemo(() => shuffle(pairs.map((p) => String(p[1]))), [pairs])

  const [selLeft, setSelLeft] = useState(null)
  const [selRight, setSelRight] = useState(null)
  const [done, setDone] = useState([]) // [{ left, right }]
  const [nudge, setNudge] = useState('')
  const [nudgeKey, setNudgeKey] = useState(0)

  function rightFor(left) {
    const idx = lefts.indexOf(left)
    return idx >= 0 ? String(pairs[idx][1]) : null
  }

  function pickLeft(left) {
    if (disabled || done.some((d) => d.left === left)) return
    setNudge('')
    if (selLeft === left) setSelLeft(null)
    else setSelLeft(left)
  }

  function pickRight(right) {
    if (disabled || done.some((d) => d.right === right)) return
    setNudge('')
    if (selRight === right) setSelRight(null)
    else if (selLeft) setSelRight(right)
  }

  function evaluate() {
    if (!selLeft || !selRight) return
    if (selLeft === selRight || selRight === rightFor(selLeft)) {
      const next = [...done, { left: selLeft, right: selRight }]
      setDone(next)
      setSelLeft(null)
      setSelRight(null)
      if (next.length >= pairs.length) {
        onAnswer(true)
      }
    } else {
      setNudge("Not quite — those two don't belong together. Tap them again and look closely!")
      setNudgeKey((k) => k + 1)
      setSelLeft(null)
      setSelRight(null)
    }
  }

  function chipClass(v, kind) {
    const isDone = done.some((d) => (kind === 'left' ? d.left === v : d.right === v))
    const sel = kind === 'left' ? selLeft === v : selRight === v
    return `${isDone ? ' is-done' : ''}${sel ? ' is-picked' : ''}`
  }

  return (
    <div className="soc-match">
      <div className="soc-match-note" key={nudgeKey} aria-live="polite">
        {nudge}
      </div>
      <div className="soc-match-cols" role="group" aria-label="match each pair">
        <div className="soc-match-col">
          <span className="soc-match-head">Tap one from here…</span>
          {lefts.map((left) => (
            <button
              key={left}
              type="button"
              className={`soc-match-chip${chipClass(left, 'left')}`}
              onClick={() => pickLeft(left)}
              disabled={disabled}
            >
              {left}
            </button>
          ))}
        </div>
        <div className="soc-match-link" aria-hidden="true">
          ↔
        </div>
        <div className="soc-match-col">
          <span className="soc-match-head">…and its partner here</span>
          {rights.map((right) => (
            <button
              key={right}
              type="button"
              className={`soc-match-chip${chipClass(right, 'right')}`}
              onClick={() => pickRight(right)}
              disabled={disabled}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
      {selLeft && selRight && (
        <button type="button" className="soc-match-check" onClick={evaluate} disabled={disabled}>
          Check this pair →
        </button>
      )}
    </div>
  )
}