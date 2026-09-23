import React, { useState } from 'react'

// SciMultipleChoice: pick one answer from tappable cards. Covers
// multiple-choice, true-false, scenario, predict and compare — all share the
// same wire shape (options: string[], answer: string). The first tap that ends
// the round is sent to the parent (onAnswer(pick)); correctness is decided by
// the server. `reveal` = correct option value passed back after submission so
// this renderer can highlight which one was right.

export default function SciMultipleChoice({ question, disabled, reveal, onAnswer }) {
  const { options = [] } = question
  const [picked, setPicked] = useState(null)

  function choose(opt) {
    if (picked != null || disabled) return
    setPicked(opt)
    onAnswer(String(opt))
  }

  const revealed = reveal != null && reveal !== ''

  return (
    <div className="sci-mc-wrap">
      <div className="sci-mc-opts" role="group" aria-label="answer choices">
        {options.map((opt) => {
          const selected = picked !== null && String(opt) === String(picked)
          const isCorrect = revealed && String(reveal) === String(opt)
          const isWrong = selected && revealed && String(opt) !== String(reveal)
          return (
            <button
              key={String(opt)}
              type="button"
              className={`sci-opt${selected ? ' is-picked' : ''}${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
              onClick={() => choose(opt)}
              disabled={disabled || picked != null}
            >
              <span className="sci-opt-text">{String(opt)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}