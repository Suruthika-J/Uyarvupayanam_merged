import React, { useState } from 'react'

// SciOrdering: arrange the steps in the right order. Up/down arrows reorder the
// cards; a "Check answer" button submits the key sequence. `reveal` = correct
// array of keys for post-submission highlighting.

export default function SciOrdering({ question, disabled, reveal, onAnswer }) {
  const { objects = {} } = question
  const items = Array.isArray(objects.items) ? objects.items : []
  const [order, setOrder] = useState(items.map((it) => it.key))
  const [submitted, setSubmitted] = useState(false)

  function move(index, dir) {
    if (disabled || submitted || order.length === 0) return
    const target = index + dir
    if (target < 0 || target >= order.length) return
    const next = [...order]
    const [k] = next.splice(index, 1)
    next.splice(target, 0, k)
    setOrder(next)
  }

  function check() {
    if (submitted || disabled || order.length === 0) return
    setSubmitted(true)
    onAnswer(order)
  }

  const revealKeys = Array.isArray(reveal) ? reveal.map((k) => String(k)) : []

  return (
    <div className="sci-order">
      <ol className="sci-order-list">
        {order.map((key, index) => {
          const item = items.find((it) => String(it.key) === String(key)) || { key, label: key }
          const revealed = submitted && revealKeys.length > 0
          const pos = revealKeys.indexOf(String(key))
          const isRight = revealed && pos === index
          const isWrong = revealed && pos !== index
          return (
            <li
              key={String(key)}
              className={`sci-order-item${isRight ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
            >
              <button
                type="button"
                className="sci-order-arrow"
                onClick={() => move(index, -1)}
                disabled={disabled || submitted || index === 0}
                aria-label="move up"
              >
                ▲
              </button>
              <span className="sci-order-rank">{index + 1}</span>
              <span className="sci-order-label">{item.label}</span>
              <button
                type="button"
                className="sci-order-arrow"
                onClick={() => move(index, 1)}
                disabled={disabled || submitted || index === order.length - 1}
                aria-label="move down"
              >
                ▼
              </button>
            </li>
          )
        })}
      </ol>
      <div className="sci-action-row">
        <button type="button" className="sci-btn sci-btn-main" onClick={check} disabled={disabled || submitted}>
          Check answer
        </button>
      </div>
    </div>
  )
}