import React, { useState } from 'react'

// MultipleChoiceQuestion: pick the answer from big, tappable chip cards.
// Covers `multiple-choice`, `true-false`, `fact-myth` and `scenario` — they all
// share the same wire shape (options: string[], answer: string) and the same
// friendly card UI. The first tap that ends the round counts; after that the
// parent locks it.

export default function MultipleChoiceQuestion({ question, disabled, onAnswer }) {
  const { options = [], answer } = question
  const [picked, setPicked] = useState(null)

  function choose(opt) {
    if (picked != null || disabled) return
    setPicked(opt)
    onAnswer(String(opt) === String(answer))
  }

  function isCorrect(opt) {
    return String(opt) === String(answer)
  }

  return (
    <div className="soc-mc">
      <div className="soc-mc-opts" role="group" aria-label="answer choices">
        {options.map((opt) => {
          const selected = picked != null && String(opt) === String(picked)
          const showCorrect = picked != null && isCorrect(opt)
          const showWrong = selected && !isCorrect(opt)
          return (
            <button
              key={String(opt)}
              type="button"
              className={`soc-opt${selected ? ' is-picked' : ''}${showCorrect ? ' is-correct' : ''}${showWrong ? ' is-wrong' : ''}`}
              onClick={() => choose(opt)}
              disabled={disabled || picked != null}
            >
              <span className="soc-opt-text">{String(opt)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}