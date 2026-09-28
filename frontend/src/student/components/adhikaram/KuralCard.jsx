import React from 'react'

export default function KuralCard({ kural, cardStyle = 'storybook', isOpen = false, onOpen }) {
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(kural.id)
    }
  }

  return (
    <article
      className={`kural-card card-${cardStyle}${isOpen ? ' is-open' : ''}`}
      onClick={() => onOpen(kural.id)}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
    >
      <span className="kural-no">Kural {kural.number}</span>
      <div className="kural-body-wrap">
        <p className="kural-tamil">{kural.tamil[0]}</p>
        <p className="kural-tamil">{kural.tamil[1]}</p>
        <p className="kural-meaning">{kural.easyMeaning}</p>
      </div>
    </article>
  )
}