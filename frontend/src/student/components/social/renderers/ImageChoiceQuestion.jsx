import React, { useState } from 'react'
import SocialArt from '../art'
import { Portrait } from '../characters'

const PORTRAIT_KEYS = ['gandhi', 'bose', 'nehru', 'rani', 'patel', 'bhagat', 'sarojini', 'besant']

// ImageChoiceQuestion: "tap the picture". `options` are art/portrait keys and
// `answer` is the right key. Draws each choice as a cartoon art card so the
// round is always a picture-picking game, never a text list.

function ChoiceImage({ k }) {
  if (PORTRAIT_KEYS.includes(k)) return <Portrait person={k} size={72} className="soc-imgchoice-portrait" />
  return <SocialArt k={k} size={64} />
}

export default function ImageChoiceQuestion({ question, disabled, onAnswer }) {
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
    <div className="soc-mc soc-imgchoice">
      <div className="soc-mc-opts soc-imgchoice-opts" role="group" aria-label="choose the matching picture">
        {options.map((opt) => {
          const key = String(opt)
          const selected = picked != null && key === String(picked)
          const showCorrect = picked != null && isCorrect(opt)
          const showWrong = selected && !isCorrect(opt)
          return (
            <button
              key={key}
              type="button"
              className={`soc-opt soc-imgchoice-opt${selected ? ' is-picked' : ''}${showCorrect ? ' is-correct' : ''}${showWrong ? ' is-wrong' : ''}`}
              onClick={() => choose(opt)}
              disabled={disabled || picked != null}
              aria-label="picture choice"
            >
              <span className="soc-imgchoice-art">
                <ChoiceImage k={key} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}