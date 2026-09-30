import React from 'react'
import { AstronautHead } from './Astronaut'

// ─────────────────────────────────────────────────────────────────────────────
// MissionGuide — the friendly astronaut assistant used throughout the Maths
// Space Adventure (map, planet journeys, mission flow, celebrations). One
// consistent character everywhere; swap the illustration later in one file.
// Feather icons only, no emojis.
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = {
  sm: { box: 50 },
  md: { box: 64 },
  lg: { box: 84 },
}

export default function MissionGuide({ message, size = 'md', style = {}, bubble = true, top = 0 }) {
  const s = SIZES[size] || SIZES.md
  return (
    <div
      className="mm-guide"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        className="mm-float"
        style={{
          width: s.box,
          height: s.box,
          flexShrink: 0,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 10px 24px -12px rgba(15,23,42,0.45), 0 0 0 1px #d9e6df',
          display: 'grid',
          placeItems: 'center',
          marginTop: top,
        }}
      >
        <AstronautHead size={s.box - 8} />
      </div>
      {bubble && message && (
        <div
          className="mm-fade-in"
          style={{
            position: 'relative',
            background: '#fff',
            border: '1.5px solid #d9e6df',
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: '12px 16px',
            maxWidth: 520,
            fontSize: 15.5,
            lineHeight: 1.55,
            color: '#334155',
            fontWeight: 600,
            boxShadow: '0 8px 22px -12px rgba(15,23,42,0.18)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}