import React, { useState } from 'react'
import MathObject from './MathObject'
import NumberChar from './NumberChar'

// VisualCountQuestion: learn join/take-away by tapping the objects themselves.
// - addition/story: two groups; tap each object to carry it into the total
//   basket, the NumberChar counter climbs, then the sum equation builds.
// - subtraction/fill-blank: tap the objects that fly away; the counter shows
//   what stays behind, then the difference equation builds.
// The animation of objects joining / drifting IS the explanation.

function ObjectTile({ name, tapIndex, done, gone, onTap, disabled }) {
  return (
    <button
      type="button"
      className={`mth-tile${done ? ' is-done' : ''}${gone ? ' is-gone' : ''}`}
      onClick={disabled || done || gone ? undefined : onTap}
      disabled={disabled || done || gone}
      aria-label={`${tapIndex + 1}${suffix(tapIndex + 1)} ${name}`}
    >
      <MathObject name={name} size={46} />
    </button>
  )
}

function suffix(n) {
  if (n === 1) return 'st'
  if (n === 2) return 'nd'
  if (n === 3) return 'rd'
  return 'th'
}

const isSubtract = (type, objects) =>
  type === 'subtraction' || type === 'fill-blank' || objects.takeAway > 0

export default function VisualCountQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, answer } = question
  const subtract = isSubtract(question.type, objects)
  const objectName = objects.object || 'star'

  const groups = subtract
    ? [objects.firstGroup]
    : [objects.firstGroup || 0, objects.secondGroup || 0]
  const totalObjs = groups.reduce((s, g) => s + Number(g || 0), 0)
  const takeAway = subtract ? Number(objects.takeAway || 0) : 0

  const [goneIdx, setGoneIdx] = useState([])
  const [joinedIdx, setJoinedIdx] = useState([])
  const [done, setDone] = useState(false)

  const remaining = subtract ? totalObjs - goneIdx.length : Number(joinedIdx.length)

  const finishVerify = (finalCount) => {
    setDone(true)
    onAnswer(Number(finalCount) === Number(answer))
  }

  function tapObject(idx) {
    if (disabled || done) return
    if (subtract) {
      if (goneIdx.includes(idx)) return
      const next = [...goneIdx, idx]
      setGoneIdx(next)
      if (next.length === takeAway) {
        window.setTimeout(() => finishVerify(totalObjs - takeAway), 360)
      }
    } else {
      if (joinedIdx.includes(idx)) return
      const next = [...joinedIdx, idx]
      setJoinedIdx(next)
      if (next.length === totalObjs) {
        window.setTimeout(() => finishVerify(totalObjs), 360)
      }
    }
  }

  const groupsList = groups.flatMap((size, gi) => Array.from({ length: Number(size || 0) }, () => gi))

  const isJoining = groupsList.length === 2

  return (
    <div className={`mth-vc ${subtract ? 'is-subtract' : 'is-add'}`}>
      <div className="mth-vc-cols">
        {groups.map((size, gi) => (
          <div key={gi} className={`mth-vc-col mth-vc-col-${gi + 1}`}>
            <span className="mth-vc-col-label">
              {isJoining
                ? gi === 1
                  ? `and ${size} more`
                  : `${size}${subtract ? '' : ' to start'}`
                : `${size} ${objectName}s to start`}
            </span>
            <div className="mth-tile-row">
              {groupsList
                .map((g, gi2) => ({ g, i: gi2 }))
                .filter((x) => x.g === gi)
                .map((x) => {
                  const idx = x.i
                  const doneObj = joinedIdx.includes(idx)
                  const goneObj = goneIdx.includes(idx)
                  return (
                    <ObjectTile
                      key={idx}
                      name={objectName}
                      tapIndex={idx}
                      done={doneObj}
                      gone={goneObj}
                      disabled={disabled}
                      onTap={() => tapObject(idx)}
                    />
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mth-vc-counter" aria-live="polite">
        {subtract ? (
          <>
            <span className="mth-vc-counter-label">stays behind</span>
            <NumberChar digit={String(remaining)} size={54} />
          </>
        ) : (
          <>
            <span className="mth-vc-counter-label">in the basket</span>
            <NumberChar digit={String(joinedIdx.length)} size={54} />
          </>
        )}
        <span className="mth-vc-counter-hint">
          {done
            ? 'Tap anything to start a new count'
            : subtract
              ? `Tap all ${takeAway} that fly away`
              : `Tap every ${objectName} to carry it over`}
        </span>
      </div>

      {(done || disabled) && (
        <div className="mth-equation" aria-label={`${subtract ? totalObjs : groups[0] || 0} ${subtract ? 'minus' : 'plus'} ${subtract ? takeAway : groups[1] || 0} equals ${answer}`}>
          <DigitRow value={subtract ? totalObjs : groups[0] || 0} />
          <span className="mth-eq-sign">{subtract ? '−' : '+'}</span>
          <DigitRow value={subtract ? takeAway : groups[1] || 0} />
          <span className="mth-eq-sign">=</span>
          <DigitRow value={answer} highlighted />
        </div>
      )}
    </div>
  )
}

function DigitRow({ value, highlighted }) {
  return (
    <span className={`mth-eq-num${highlighted ? ' is-hot' : ''}`}>
      <NumberChar digit={String(Number(value) || 0)} size={38} animate={!highlighted} />
    </span>
  )
}