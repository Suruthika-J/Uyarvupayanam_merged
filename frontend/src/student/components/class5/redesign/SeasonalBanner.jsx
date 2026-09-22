import React from 'react'
import { C5, worldColor, timeLeftLabel } from './class5Theme'

// Limited-time celebration strip for seasonal events.
export default function SeasonalBanner({ event, onExplore }) {
  if (!event) return null
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: C5.radiusLg,
        background: 'linear-gradient(120deg, #0f4c75 0%, #1d5f96 55%, #2f7bb5 100%)',
        color: '#fff',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        boxShadow: C5.shadowLg,
        marginBottom: 28,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -30,
          top: -40,
          fontSize: 120,
          opacity: 0.14,
          transform: 'rotate(-12deg)',
        }}
      >
        {event.emoji || '🎪'}
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 30,
          }}
          aria-hidden="true"
        >
          {event.emoji || '🎪'}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#ffe7b3',
              marginBottom: 4,
            }}
          >
            Seasonal · {event.worldName || ''}
          </div>
          <div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.15 }}>{event.title}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 3, maxWidth: 420 }}>
            {event.description}
          </div>
        </div>
      </div>
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 99,
          fontSize: 12.5,
          fontWeight: 800,
          border: '1px solid rgba(255,255,255,0.35)',
        }}
      >
        ⏳ {timeLeftLabel(event.endsAt, event.timeLeftMs)}
      </span>
      {onExplore && (
        <button
          onClick={onExplore}
          style={{
            position: 'relative',
            zIndex: 1,
            background: '#fff',
            color: worldColor('navy'),
            border: 'none',
            borderRadius: 99,
            padding: '11px 20px',
            fontSize: 13.5,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: 'pointer',
            boxShadow: '0 8px 16px -6px rgba(0,0,0,0.35)',
          }}
        >
          Explore now →
        </button>
      )}
    </div>
  )
}