import React, { useMemo, useState } from 'react'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// FillBlankQuestion: spell the missing word by tapping letter tiles. The word
// to spell is the `answer` string; spaces are ignored. The round completes when
// every tile is placed and the spelling matches. Not used by the current
// 56-activity bank, but supported so the type stays playable.

export default function FillBlankQuestion({ question, disabled, onAnswer }) {
  const answer = String(question.answer || '')
  const letters = answer.replace(/\s+/g, '').split('')
  const tiles = useMemo(
    () => shuffle(letters.map((l, i) => ({ letter: l, i }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letters.length, letters.join('')]
  )

  const [pickedIdx, setPickedIdx] = useState([]) // tile indexes placed, in order
  const [nudge, setNudge] = useState('')
  const [nudgeKey, setNudgeKey] = useState(0)

  const isWordComplete = pickedIdx.length >= tiles.length

  function tapTile(tile) {
    if (disabled || pickedIdx.length >= tiles.length) return
    setNudge('')
    setPickedIdx((prev) => prev.concat([tile.i]))
  }

  function tapSlot(slotPos) {
    if (disabled) return
    setPickedIdx((prev) => prev.filter((_, idx) => idx !== slotPos))
  }

  function check() {
    const got = pickedIdx.map((ti) => tiles.find((t) => t.i === ti)?.letter || '').join('').toLowerCase()
    if (got === answer.replace(/\s+/g, '').toLowerCase()) {
      onAnswer(true)
    } else {
      setNudge("Not quite — tap a placed letter to send it back, then try again!")
      setNudgeKey((k) => k + 1)
    }
  }

  return (
    <div className="soc-fill">
      <div className="soc-fill-note" key={nudgeKey} aria-live="polite">
        {nudge}
      </div>
      <div className="soc-fill-slots" aria-label="spell the answer" role="group">
        {pickedIdx.map((ti, pos) => {
          const letter = tiles.find((t) => t.i === ti)?.letter || '?'
          return (
            <button key={`${ti}-${pos}`} type="button" className="soc-fill-slot" onClick={() => tapSlot(pos)} disabled={disabled}>
              {letter}
            </button>
          )
        })}
        {!isWordComplete && <span className="soc-fill-gap">…</span>}
      </div>
      <div className="soc-fill-tiles" role="group" aria-label="letters to choose">
        {tiles.map((tile) => {
          const placed = pickedIdx.includes(tile.i)
          return (
            <button
              key={tile.i}
              type="button"
              className={`soc-match-chip soc-fill-tile${placed ? ' is-placed' : ''}`}
              onClick={() => tapTile(tile)}
              disabled={disabled || placed}
            >
              {tile.letter}
            </button>
          )
        })}
      </div>
      {isWordComplete && (
        <button type="button" className="soc-match-check" onClick={check} disabled={disabled}>
          Check the word →
        </button>
      )}
    </div>
  )
}