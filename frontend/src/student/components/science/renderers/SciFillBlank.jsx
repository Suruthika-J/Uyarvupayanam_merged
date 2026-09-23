import React, { useMemo, useState } from 'react'

// SciFillBlank: spell the missing word. The student types (or taps the letter
// chips) to build the word shown in the gap. The server accepts the spelled
// word string. `reveal` = the correct word for highlighting after submission.

function shuffleLetters(letters) {
  const a = [...letters]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SciFillBlank({ question, disabled, reveal, onAnswer }) {
  const { objects = {} } = question
  const tiles = useMemo(
    () => shuffleLetters(Array.isArray(objects.tiles) ? objects.tiles : []),
    [objects.tiles]
  )
  const [word, setWord] = useState('')
  const [used, setUsed] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function addTile(letter, i) {
    if (submitted || disabled) return
    setUsed((prev) => ({ ...prev, [i]: true }))
    setWord((w) => w + letter)
  }

  function removeLast() {
    if (submitted || disabled || word.length === 0) return
    const last = word.slice(-1)
    const lastIndex = tiles.findIndex((t, i) => t === last && used[i])
    setUsed((prev) => {
      const next = { ...prev }
      if (lastIndex !== -1) delete next[lastIndex]
      return next
    })
    setWord((w) => w.slice(0, -1))
  }

  function clearAll() {
    if (submitted || disabled) return
    setUsed({})
    setWord('')
  }

  function check() {
    if (submitted || disabled || word.trim() === '') return
    setSubmitted(true)
    onAnswer(word.trim())
  }

  const revealed = submitted && reveal != null && reveal !== ''
  const isRight = revealed && word.trim().toLowerCase() === String(reveal).toLowerCase()

  return (
    <div className="sci-fill">
      <div className="sci-fill-input" aria-label="your answer">
        {word.length === 0 ? <span className="sci-fill-ph">Type or tap the letters…</span> : null}
        <span className={`sci-fill-word${isRight ? ' is-correct' : ''}${revealed && !isRight ? ' is-wrong' : ''}`}>{word}</span>
        {revealed && !isRight ? <span className="sci-fill-reveal">→ {String(reveal)}</span> : null}
      </div>
      <div className="sci-fill-tiles" role="group" aria-label="letter tiles">
        {tiles.map((letter, i) => (
          <button
            key={`${letter}-${i}`}
            type="button"
            className={`sci-fill-tile${used[i] ? ' is-used' : ''}`}
            onClick={() => addTile(letter, i)}
            disabled={disabled || submitted || used[i]}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="sci-fill-actions">
        <button type="button" className="sci-btn" onClick={removeLast} disabled={disabled || submitted || word.length === 0}>
          ⌫
        </button>
        <button type="button" className="sci-btn" onClick={clearAll} disabled={disabled || submitted || word.length === 0}>
          Clear
        </button>
        <button
          type="button"
          className="sci-btn sci-btn-main"
          onClick={check}
          disabled={disabled || submitted || word.trim() === ''}
        >
          Check answer
        </button>
      </div>
    </div>
  )
}