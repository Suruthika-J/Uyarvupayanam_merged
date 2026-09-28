import React, { useState } from 'react'
import SciArt from '../art'

// SciSort: move each item into the bucket where it belongs. Tap an item to pick
// it up, then tap a bucket to drop it in (tap it again to take it back out).
// A "Check answer" button submits the placements as [itemKey, bucketLabel]
// pairs. `reveal` = the correct pairs for post-submission highlighting.

export default function SciSort({ question, disabled, reveal, onAnswer }) {
  const { objects = {} } = question
  const buckets = Array.isArray(objects.buckets) ? objects.buckets : []
  const items = Array.isArray(objects.items) ? objects.items : []
  const [placed, setPlaced] = useState({})
  const [inHand, setInHand] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  function pick(key) {
    if (disabled || submitted) return
    setInHand(key)
  }

  function drop(bucket) {
    if (disabled || submitted || inHand == null) return
    setPlaced((prev) => ({ ...prev, [inHand]: bucket }))
    setInHand(null)
  }

  function pickupFromBucket(key) {
    if (disabled || submitted) return
    const next = { ...placed }
    delete next[key]
    setPlaced(next)
  }

  function check() {
    if (submitted || disabled) return
    const allPlaced = items.every((it) => placed[it.key])
    if (!allPlaced) return
    setSubmitted(true)
    onAnswer(items.map((it) => [it.key, placed[it.key]]))
  }

  const revealPairs = Array.isArray(reveal) ? reveal.map((p) => `${String(p[0])}::${String(p[1])}`) : []

  return (
    <div className="sci-sort">
      <div className="sci-sort-buckets">
        {buckets.map((b) => {
          const inBucket = items.filter((it) => placed[it.key] === b)
          return (
            <div
              key={String(b)}
              className={`sci-sort-bucket${inHand != null && !submitted ? ' is-open' : ''}`}
              onClick={() => drop(String(b))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(String(b)) } }}
              aria-label={`put item in ${b}`}
            >
              <div className="sci-sort-bucket-label">{String(b)}</div>
              <div className="sci-sort-bucket-items">
                {inBucket.map((it) => {
                  const wrong = submitted && !revealPairs.includes(`${String(it.key)}::${String(b)}`)
                  const right = submitted && revealPairs.includes(`${String(it.key)}::${String(b)}`)
                  return (
                    <button
                      key={String(it.key)}
                      type="button"
                      className={`sci-sort-chip${right ? ' is-correct' : ''}${wrong ? ' is-wrong' : ''}`}
                      onClick={() => pickupFromBucket(it.key)}
                      disabled={disabled || submitted}
                      aria-label={`take out ${it.label}`}
                    >
                      {it.art ? <SciArt k={it.art} size={26} /> : null}
                      <span>{it.label}</span>
                    </button>
                  )
                })}
                {inBucket.length === 0 ? <span className="sci-sort-empty">tap a card first</span> : null}
              </div>
            </div>
          )
        })}
      </div>
      <div className="sci-sort-tray" role="group" aria-label="items to sort">
        {items.map((it) => {
          const isPlaced = placed[it.key] != null
          const inHandStyle = inHand === it.key
          if (isPlaced && !submitted) {
            return (
              <button
                key={String(it.key)}
                type="button"
                className="sci-sort-chip is-placed"
                onClick={() => pickupFromBucket(it.key)}
                disabled={disabled || submitted}
                aria-label={`put back ${it.label}`}
              >
                {it.art ? <SciArt k={it.art} size={26} /> : null}
                <span>{it.label}</span>
              </button>
            )
          }
          return (
            <button
              key={String(it.key)}
              type="button"
              className={`sci-sort-chip${inHandStyle ? ' is-hand' : ''}`}
              onClick={() => (isPlaced ? pickupFromBucket(it.key) : pick(it.key))}
              disabled={disabled || submitted}
              aria-label={`pick up ${it.label}`}
            >
              {it.art ? <SciArt k={it.art} size={26} /> : null}
              <span>{it.label}</span>
            </button>
          )
        })}
      </div>
      <div className="sci-action-row">
        <button
          type="button"
          className="sci-btn sci-btn-main"
          onClick={check}
          disabled={disabled || submitted || !items.every((it) => placed[it.key] != null)}
        >
          Check answer
        </button>
      </div>
    </div>
  )
}