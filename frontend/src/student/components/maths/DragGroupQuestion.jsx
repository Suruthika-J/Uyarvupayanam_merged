import React, { useMemo, useState } from 'react'
import MathObject from './MathObject'
import NumberChar from './NumberChar'

// DragGroupQuestion: build equal groups on screen.
// - multiplication: {groups, perGroup, item} - put the SAME number in every
//   group, then count the grand total (groups x perGroup).
// - division: {total, groups, item} - share every item out fairly so all
//   piles end up equal, then read how many each pile holds.
// Tap an item to carry it with your finger, tap a group to drop it there
// (the group with the fewest members glows to guide fair sharing).

export default function DragGroupQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, answer } = question
  const dividing = objects.total != null && objects.groups != null
  const itemName = objects.item || 'star'
  const total = dividing ? Number(objects.total) : Number(objects.groups) * Number(objects.perGroup)
  const groupCount = Number(objects.groups)

  const items = useMemo(() => Array.from({ length: total }, (_, i) => i), [total])
  const [carried, setCarried] = useState(null)
  const [placed, setPlaced] = useState([])
  const [done, setDone] = useState(false)

  const groupSizes = Array.from({ length: groupCount }, (_, gi) =>
    placed.filter((p) => p.group === gi).length
  )
  const least = Math.min(...(dividing ? groupSizes : []), 0)
  const placedTotal = placed.length

  function carry(item) {
    if (disabled || done) return
    if (carried === item) {
      setCarried(null)
      return
    }
    setCarried(item)
  }

  function drop(group) {
    if (disabled || done || carried == null) return
    const next = [...placed, { item: carried, group }]
    setPlaced(next)
    setCarried(null)
    if (next.length === total && total > 0) {
      window.setTimeout(() => {
        setDone(true)
        const stacks = Array.from({ length: groupCount }, (_, gi) =>
          next.filter((p) => p.group === gi).length
        )
        const pilesEqual = stacks.every((s) => s === stacks[0])
        const countsOk = dividing ? pilesEqual : stacks.every((s) => s === Number(objects.perGroup))
        onAnswer(countsOk && Number(stacks[0]) === Number(answer))
      }, 420)
    }
  }

  const placedInGroup = (gi) => placed.filter((p) => p.group === gi)

  return (
    <div className="mth-drag">
      <div className="mth-drag-groups" role="group" aria-label="share slots">
        {groupSizes.map((_, gi) => {
          const isLeast = dividing && groupSizes[gi] === least
          const full = dividing ? false : groupSizes[gi] === Number(objects.perGroup)
          return (
            <button
              key={gi}
              type="button"
              className={`mth-drag-slot${isLeast ? ' is-least' : ''}${full ? ' is-full' : ''}`}
              onClick={() => drop(gi)}
              disabled={disabled || done}
              aria-label={`group ${gi + 1}`}
            >
              <span className="mth-drag-slot-count">
                <NumberChar digit={String(groupSizes[gi] || 0)} size={26} animate={false} />
              </span>
              <div className="mth-drag-slot-items">
                {placedInGroup(gi).map((p) => (
                  <MathObject key={p.item} name={itemName} size={34} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mth-drag-pool" role="group" aria-label="items to share">
        {items.map((item) => {
          const isPlaced = placed.some((p) => p.item === item)
          const isCarried = carried === item
          return (
            <button
              key={item}
              type="button"
              className={`mth-tile${isPlaced ? ' is-gone' : ''}${isCarried ? ' is-carried' : ''}`}
              onClick={() => carry(item)}
              disabled={disabled || done || isPlaced}
              aria-label={`pick up ${itemName} ${item + 1}`}
            >
              <MathObject name={itemName} size={44} />
            </button>
          )
        })}
      </div>

      <div className="mth-vc-counter" aria-live="polite">
        <span className="mth-vc-counter-label">
          {carried != null ? 'carrying one' : `${placedTotal} of ${total} shared`}
        </span>
        <NumberChar digit={String(carried != null ? total : placedTotal)} size={54} />
      </div>

      {(done || disabled) && (
        <div className="mth-equation" aria-label={`${dividing ? `${total} divided by ${groupCount} equals ${answer}` : `${groupCount} times ${objects.perGroup} equals ${answer}`}`}>
          <DigitRow value={dividing ? total : groupCount} />
          <span className="mth-eq-sign">{dividing ? '÷' : '×'}</span>
          <DigitRow value={dividing ? groupCount : objects.perGroup} />
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