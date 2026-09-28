import React, { useMemo, useState } from 'react'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// OrderingQuestion: tap the chips one-by-one to arrange the steps in order.
// Chips start shuffled; tapping a chip appends it to the sequence and tapping
// a placed chip sends it back to the pool. When every chip is placed the order
// is checked — right is "correct", wrong is a gentle nudge to try again.
// items: [{ key, label }] and answer is the ordered array of keys.

export default function OrderingQuestion({ question, disabled, onAnswer }) {
  const { objects = {} } = question
  const rawItems = useMemo(() => (Array.isArray(objects.items) ? objects.items : []), [objects])
  const pool = useMemo(() => shuffle(rawItems.slice()), [rawItems])
  const [placed, setPlaced] = useState([]) // array of { key, label }
  const [nudge, setNudge] = useState('')
  const [nudgeKey, setNudgeKey] = useState(0)

  function place(item) {
    if (disabled || placed.some((p) => p.key === item.key)) return
    setNudge('')
    setPlaced((prev) => [...prev, item])
  }

  function unplace(item) {
    if (disabled) return
    setPlaced((prev) => prev.filter((p) => p.key !== item.key))
  }

  function check() {
    const expected = Array.isArray(question.answer) ? question.answer.map(String) : []
    const got = placed.map((p) => String(p.key))
    if (got.length === expected.length && got.every((k, i) => k === expected[i])) {
      onAnswer(true)
    } else {
      setNudge('Not quite the right order — tap a placed step to send it back, then try again!')
      setNudgeKey((k) => k + 1)
      setPlaced((prev) => prev.map((p) => ({ ...p })))
    }
  }

  const orderLabels = placed.map((p) => p.key)
  const placing = placed.length < pool.length

  return (
    <div className="soc-order">
      <div className="soc-order-note" key={nudgeKey} aria-live="polite">
        {nudge}
      </div>
      <div className="soc-order-track" aria-label="your order">
        {placed.length === 0 && <span className="soc-order-empty">Tap the steps below, in the order they happen.</span>}
        {placed.map((item, i) => (
          <button
            key={item.key}
            type="button"
            className={`soc-order-step is-placed${orderLabels.join('|') === '' ? '' : ''}`}
            onClick={() => unplace(item)}
            disabled={disabled}
            aria-label={`step ${i + 1}, ${item.label} — tap to remove`}
          >
            <span className="soc-order-num">{i + 1}</span>
            <span className="soc-order-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="soc-order-pool" aria-label="steps to arrange">
        {pool.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`soc-match-chip soc-order-chip${placed.some((p) => p.key === item.key) ? ' is-placed' : ''}`}
            onClick={() => place(item)}
            disabled={disabled || placed.some((p) => p.key === item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!placing && (
        <button type="button" className="soc-match-check" onClick={check} disabled={disabled}>
          Check the order →
        </button>
      )}
    </div>
  )
}