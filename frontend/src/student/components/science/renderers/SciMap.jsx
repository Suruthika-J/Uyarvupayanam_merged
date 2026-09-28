import React, { useState } from 'react'
import { SCIENCE_MAPS } from '../../../data/scienceMaps'
import { SCIENCE_SCENES } from '../../../data/scienceEnvironments'

// SciMap (image-map): a cartoon diagram with tappable hotspots. `objects.map`
// picks the base artwork, `objects.hotspots` lists [{ id, x, y, label }] where
// x/y are percentages of the diagram. The tapped hotspot id is sent to the
// parent; `reveal` = the correct hotspot id for highlighting afterwards.

export default function SciMap({ question, disabled, reveal, onAnswer }) {
  const { objects = {} } = question
  const hotspots = Array.isArray(objects.hotspots) ? objects.hotspots : []
  const Diagram = SCIENCE_MAPS[objects.map] || SCIENCE_SCENES.forest
  const [picked, setPicked] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function choose(hp) {
    if (isSubmitted || picked != null || disabled) return
    setPicked(hp.id)
    setIsSubmitted(true)
    onAnswer(String(hp.id))
  }

  const revealed = isSubmitted && reveal != null && reveal !== ''

  return (
    <div className="sci-mapq">
      <div className={`sci-mapq-frame${isSubmitted ? ' is-done' : ''}`}>
        <div className="sci-mapq-bg">
          <Diagram />
        </div>
        {hotspots.map((hp) => {
          const selected = picked != null && String(hp.id) === String(picked)
          const isCorrect = revealed && String(reveal) === String(hp.id)
          const isWrong = selected && revealed && String(hp.id) !== String(reveal)
          return (
            <button
              key={hp.id}
              type="button"
              className={`sci-mapq-hot${selected ? ' is-picked' : ''}${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
              style={{
                left: `${Number(hp.x) || 0}%`,
                top: `${Number(hp.y) || 0}%`,
              }}
              onClick={() => choose(hp)}
              disabled={disabled || isSubmitted}
              aria-label={hp.label}
            >
              <span className="sci-mapq-dot" aria-hidden="true" />
              <span className="sci-mapq-label">{hp.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}