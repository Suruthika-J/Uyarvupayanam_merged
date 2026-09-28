import React, { useState } from 'react'
import SciArt from '../art'

// SciImageChoice: pick one answer from big cartoon image cards. The options are
// art keys drawn by SCI_ART. The first tap that ends the round is sent to the
// parent; `reveal` (correct art key) is passed back to highlight afterwards.

export default function SciImageChoice({ question, disabled, reveal, onAnswer }) {
  const { options = [] } = question
  const [picked, setPicked] = useState(null)

  function choose(k) {
    if (picked != null || disabled) return
    setPicked(k)
    onAnswer(String(k))
  }

  const revealed = reveal != null && reveal !== ''

  return (
    <div className="sci-imgc">
      <div className="sci-imgc-grid" role="group" aria-label="image choices">
        {options.map((k) => {
          const selected = picked !== null && String(k) === String(picked)
          const isCorrect = revealed && String(reveal) === String(k)
          const isWrong = selected && revealed && String(k) !== String(reveal)
          return (
            <button
              key={String(k)}
              type="button"
              className={`sci-imgc-opt${selected ? ' is-picked' : ''}${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
              onClick={() => choose(k)}
              disabled={disabled || picked != null}
              aria-label={String(k)}
            >
              <span className="sci-imgc-art"><SciArt k={String(k)} size={80} /></span>
              <span className="sci-imgc-label">{String(k)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}