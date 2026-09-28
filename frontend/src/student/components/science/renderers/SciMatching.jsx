import React, { useState } from 'react'

// SciMatching: match each item on the left to its partner on the right. The
// student taps a left tile then a right tile to make a pair (pairs may be made
// in any order — the server compares them ignoring order). A "Check" button
// submits once every left tile is paired. `reveal` = correct array of
// [left, right] pairs for post-submission highlighting.

export default function SciMatching({ question, disabled, reveal, onAnswer }) {
  const { objects = {} } = question
  const lefts = Array.isArray(objects.lefts) ? objects.lefts : []
  const rights = Array.isArray(objects.rights) ? objects.rights : []
  const [pairs, setPairs] = useState([])
  const [activeLeft, setActiveLeft] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const usedRight = (r) => pairs.some((p) => p[1] === r)
  const pairedLeft = (l) => pairs.some((p) => p[0] === l)

  function tapLeft(l) {
    if (disabled || submitted || pairedLeft(l)) return
    setActiveLeft(l)
  }

  function tapRight(r) {
    if (disabled || submitted || activeLeft == null || usedRight(r)) return
    setPairs((prev) => [...prev, [activeLeft, r]])
    setActiveLeft(null)
  }

  function clearPair(i) {
    if (disabled || submitted) return
    setPairs((prev) => prev.filter((_, j) => j !== i))
  }

  const complete = pairs.length === lefts.length && lefts.length > 0

  function check() {
    if (!complete || submitted || disabled) return
    setSubmitted(true)
    onAnswer(pairs)
  }

  const correctPair = Array.isArray(reveal)
    ? reveal.map((p) => `${String(p[0])}::${String(p[1])}`)
    : []

  return (
    <div className="sci-match">
      <div className="sci-match-stage">
        <div className="sci-match-col" role="group" aria-label="left items">
          {lefts.map((l) => {
            const p = pairs.find((x) => x[0] === l)
            const isActive = activeLeft === l
            const locked = disabled || submitted || pairedLeft(l)
            return (
              <div
                key={String(l)}
                className={`sci-match-tile sci-match-left${isActive ? ' is-active' : ''}${pairedLeft(l) ? ' is-paired' : ''}`}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-disabled={locked}
                onClick={() => tapLeft(l)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapLeft(l) } }}
              >
                <span className="sci-match-txt">{String(l)}</span>
                {p ? (
                  <button
                    type="button"
                    className="sci-match-x"
                    onClick={(e) => { e.stopPropagation(); clearPair(lefts.indexOf(l)) }}
                    aria-label="undo pair"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="sci-match-col" role="group" aria-label="right items">
          {rights.map((r) => {
            const p = pairs.find((x) => x[1] === r)
            const style = p || activeLeft == null ? {} : { borderColor: 'var(--sci-accent)' }
            const isPairRight = submitted && p && correctPair.includes(`${String(p[0])}::${String(r)}`)
            const isPairWrong = submitted && p && !correctPair.includes(`${String(p[0])}::${String(r)}`)
            return (
              <button
                key={String(r)}
                type="button"
                className={`sci-match-tile sci-match-right${p ? ' is-paired' : ''}${isPairRight ? ' is-correct' : ''}${isPairWrong ? ' is-wrong' : ''}`}
                style={style}
                onClick={() => tapRight(r)}
                disabled={disabled || submitted || usedRight(r)}
              >
                <span className="sci-match-txt">{String(r)}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="sci-action-row">
        <button
          type="button"
          className={`sci-btn sci-btn-main${complete ? ' is-ready' : ''}`}
          onClick={check}
          disabled={disabled || submitted || !complete}
        >
          Check answer
        </button>
      </div>
    </div>
  )
}