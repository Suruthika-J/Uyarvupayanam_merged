import React, { useState } from 'react'

export default function KuralDetail({ kural, onClose }) {
  const [showExample, setShowExample] = useState(false)

  return (
    <article className="kural-detail" aria-label={`Kural ${kural.number} detail`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className="kural-no">Kural {kural.number}</span>
        <button type="button" className="adh-btn adh-btn-ghost" onClick={onClose} aria-label="Close">
          Close
        </button>
      </div>

      <p className="kural-detail-verse">{kural.tamil[0]}</p>
      <p className="kural-detail-verse">{kural.tamil[1]}</p>

      <div className="kural-detail-label">Simple meaning</div>
      <p className="body">{kural.easyMeaning}</p>

      <div className="kural-detail-actions">
        <button type="button" className="adh-btn adh-btn-primary" onClick={() => setShowExample((v) => !v)}>
          {showExample ? 'Hide example' : 'Show example'}
        </button>
      </div>

      {showExample && (
        <div style={{ marginTop: 8 }}>
          <div className="kural-detail-label">A child-story example</div>
          <p className="body">{kural.example}</p>
        </div>
      )}
    </article>
  )
}