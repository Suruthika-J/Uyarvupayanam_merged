import React from 'react'
import { C5 } from './class5Theme'

// 7-day streak grid + read-only counters.
export default function StreakWidget({ streak, compact = false }) {
  const days = streak?.last7Days || []
  const activeCount = days.filter((d) => d.active).length

  return (
    <div
      style={{
        background: C5.bg,
        border: `1px solid ${C5.line}`,
        borderRadius: C5.radiusLg,
        boxShadow: C5.shadow,
        padding: 20,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 26,
          }}
          aria-hidden="true"
        >
          🔥
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C5.ink, lineHeight: 1 }}>
            {streak?.currentStreak || 0} <span style={{ fontSize: 13, fontWeight: 700, color: C5.faint }}>day streak</span>
          </div>
          {!compact && (
            <div style={{ fontSize: 12.5, color: C5.faint, fontWeight: 600, marginTop: 2 }}>
              Best: {streak?.longestStreak || 0} days
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {days.map((d, i) => (
          <div key={i} title={d.day}>
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 8,
                background: d.active ? C5.navy : '#eef3f8',
                boxShadow: d.active ? '0 4px 8px -3px rgba(15,76,117,0.4)' : 'none',
              }}
            />
            {!compact && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C5.faint,
                  textAlign: 'center',
                  marginTop: 5,
                }}
              >
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeCount >= 5 && (
        <p style={{ margin: '12px 0 0', fontSize: 12.5, color: '#b45309', fontWeight: 700 }}>
          🎉 You stayed active {activeCount} days this week — steady wins!
        </p>
      )}
    </div>
  )
}