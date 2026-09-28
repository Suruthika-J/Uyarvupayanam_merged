import React from 'react'

export default function AdhikaramNav({ previousId, nextId, previousName, nextName, onNavigate, onAllWorlds }) {
  return (
    <nav className="adh-nav" aria-label="Adhikaram navigation">
      <div className="adh-nav-pair">
        <button
          type="button"
          className="adh-nav-btn"
          disabled={!previousId}
          onClick={() => previousId && onNavigate(previousId)}
        >
          <span aria-hidden="true">←</span>
          <span>
            <span className="tiny">Previous world</span>
            <br />
            {previousName || 'Start'}
          </span>
        </button>

        <button
          type="button"
          className="adh-nav-btn"
          disabled={!nextId}
          onClick={() => nextId && onNavigate(nextId)}
        >
          <span>
            <span className="tiny">Next world</span>
            <br />
            {nextName || 'End'}
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <button type="button" className="adh-nav-btn" onClick={onAllWorlds}>
        <span className="tiny">All worlds</span>
      </button>
    </nav>
  )
}