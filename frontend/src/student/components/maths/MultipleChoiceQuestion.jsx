import React, { useState } from 'react'
import NumberChar from './NumberChar'

// MultipleChoiceQuestion: pick the answer from a group of big, tappable chips.
// - multiple-choice / matching: options are text like the money coins.
// - numerical: options are numbers drawn as NumberChar digits so the answer
//   itself reads as friendly characters, never a bare equation.
// The first tap that ends the round counts; after that the parent locks it.

export default function MultipleChoiceQuestion({ question, disabled, onAnswer }) {
  const { type, objects = {}, options = [], answer } = question
  const numeric = type === 'numerical'

  const [picked, setPicked] = useState(null)

  const leadIn = objects.number != null
    ? { number: objects.number, place: objects.place }
    : objects.numbers
      ? { numbers: objects.numbers }
      : objects

  function choose(opt) {
    if (picked != null || disabled) return
    setPicked(opt)
    onAnswer(String(opt) === String(answer))
  }

  function isCorrect(opt) {
    return String(opt) === String(answer)
  }

  return (
    <div className="mth-mc">
      {leadIn && (
        <div className="mth-mc-leadin" aria-hidden="true">
          {leadIn.numbers ? (
            leadIn.numbers.map((n, i) => (
              <span key={`${n}-${i}`} className="mth-mc-leadin-num">
                <NumberChar digit={String(n)} size={40} />
              </span>
            ))
          ) : leadIn.number != null ? (
            <span className="mth-mc-leadin-num">
              <NumberChar digit={String(leadIn.number)} size={52} />
            </span>
          ) : null}
        </div>
      )}

      <div className="mth-mc-opts" role="group" aria-label="answer choices">
        {options.map((opt) => {
          const selected = picked != null && String(opt) === String(picked)
          const showCorrect = picked != null && isCorrect(opt)
          const showWrong = selected && !isCorrect(opt)
          return (
            <button
              key={String(opt)}
              type="button"
              className={`mth-opt${selected ? ' is-picked' : ''}${showCorrect ? ' is-correct' : ''}${showWrong ? ' is-wrong' : ''}`}
              onClick={() => choose(opt)}
              disabled={disabled || picked != null}
            >
              {numeric ? (
                <NumberChar digit={String(opt)} size={42} animate={false} />
              ) : (
                <span className="mth-opt-text">{String(opt)}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}