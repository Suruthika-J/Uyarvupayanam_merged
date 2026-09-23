import React from 'react'
import { C5, ICONS } from './class5Theme'

// Readable, positive "star student" note (effort, not ranking — no numbers).
export default function SpotlightCard({ spotlight }) {
  if (!spotlight) return null
  const photo = spotlight.image || ''
  return (
    <div
      style={{
        background: 'linear-gradient(120deg,#fffbeb 0%,#fff7e0 100%)',
        border: '1.5px solid #fde68a',
        borderRadius: C5.radiusLg,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        boxShadow: C5.shadow,
        marginBottom: 24,
      }}
    >
      {photo ? (
        <div
          role="presentation"
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            backgroundImage: `url(${photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            borderRadius: 18,
            background: '#fff',
            color: '#b45309',
            padding: 12,
            lineHeight: 1,
            boxShadow: '0 6px 12px -4px rgba(217,119,6,0.35)',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
          }}
          aria-hidden="true"
        >
          <ICONS.star size={26} strokeWidth={2.2} />
        </div>
      )}
      <div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#b45309',
          }}
        >
          Squad spotlight
        </span>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.6, color: '#78350f', fontWeight: 600 }}>
          <strong style={{ color: C5.navy }}>{spotlight.studentName}</strong> {spotlight.reasonNote}
        </p>
      </div>
    </div>
  )
}