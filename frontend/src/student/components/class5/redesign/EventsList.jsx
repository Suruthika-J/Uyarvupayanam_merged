import React from 'react'
import { C5, ICONS } from './class5Theme'
import { SAlert } from '../../ui'

export default function EventsList({ events = [], onAttend, attendedState }) {
  if (!events || !events.length) {
    return <SAlert type="info">No events right now — check back soon!</SAlert>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {events.map((ev) => {
        const date = new Date(ev.dateTime)
        const attended = attendedState?.[ev.id] ?? ev.attended
        const isLive = ev.type === 'live'
        const TypeIcon = isLive ? ICONS.radio : ICONS.film
        return (
          <div
            key={ev.id}
            style={{
              background: C5.bg,
              border: `1px solid ${C5.line}`,
              borderRadius: 22,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
              boxShadow: C5.shadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 220 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  background: isLive ? C5.navy : '#64748b',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
                aria-hidden="true"
              >
                {ev.coverImage ? (
                  <span
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${ev.coverImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'block',
                    }}
                  />
                ) : (
                  <TypeIcon size={20} strokeWidth={2.2} />
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C5.ink }}>{ev.title}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: isLive ? '#e6f0f7' : '#eef3f8',
                      color: isLive ? C5.navy : C5.faint,
                    }}
                  >
                    {isLive ? 'Live' : 'Recorded'}
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: C5.faint }}>{ev.description}</p>
                <div style={{ fontSize: 11.5, color: C5.faint, marginTop: 4, fontWeight: 700 }}>
                  {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {ev.durationMin} min
                </div>
              </div>
            </div>
            {attended ? (
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: '#059669',
                  background: '#ecfdf5',
                  borderRadius: 99,
                  padding: '8px 14px',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ICONS.check size={14} strokeWidth={2.6} />
                Attended
              </span>
            ) : (
              <button
                onClick={() => onAttend?.(ev)}
                style={{
                  background: C5.navy,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 99,
                  padding: '9px 16px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  fontFamily: 'var(--s-font-display)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 12px -5px rgba(15,76,117,0.5)',
                }}
              >
                Attend →
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}