import React, { useState } from 'react'
import { SOCIAL_MAPS } from '../../../data/socialMaps'

// MapQuestion (image-map): a cartoon map with tappable hotspots. `objects.map`
// picks the base artwork and `objects.hotspots` lists [{ id, x, y, label }]
// where x/y are percentages of the map. The first hotspot tapped that ends the
// round counts; after that the parent locks it. answer = hotspot id.

export default function MapQuestion({ question, disabled, onAnswer }) {
  const { objects = {}, answer } = question
  const hotspots = Array.isArray(objects.hotspots) ? objects.hotspots : []
  const BaseMap = SOCIAL_MAPS[objects.map] || SOCIAL_MAPS.globe
  const [picked, setPicked] = useState(null)

  function choose(hp) {
    if (picked != null || disabled) return
    setPicked(hp.id)
    onAnswer(String(hp.id) === String(answer))
  }

  return (
    <div className="soc-mapq">
      <div className={`soc-mapq-frame${picked != null ? ' is-done' : ''}`}>
        <BaseMap />
        {hotspots.map((hp) => {
          const selected = picked != null && String(hp.id) === String(picked)
          const isThisCorrect = String(hp.id) === String(answer)
          const showCorrect = picked != null && isThisCorrect
          const showWrong = selected && !isThisCorrect
          return (
            <button
              key={hp.id}
              type="button"
              className={`soc-mapq-hot${selected ? ' is-picked' : ''}${showCorrect ? ' is-correct' : ''}${showWrong ? ' is-wrong' : ''}`}
              style={{
                left: `${Number(hp.x) || 0}%`,
                top: `${Number(hp.y) || 0}%`,
              }}
              onClick={() => choose(hp)}
              disabled={disabled || picked != null}
              aria-label={hp.label}
            >
              <span className="soc-mapq-dot" aria-hidden="true" />
              <span className="soc-mapq-label">{hp.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}