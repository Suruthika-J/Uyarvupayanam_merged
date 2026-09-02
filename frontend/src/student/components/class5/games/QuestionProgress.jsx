import React from 'react';

export default function QuestionProgress({ current, total, color = '#6366f1' }) {
  const pct = total === 0 ? 0 : Math.round(((current + 1) / total) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color,
            background: `${color}1a`,
            padding: '6px 14px',
            borderRadius: 12,
          }}
        >
          Question {current + 1} of {total}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>{pct}%</span>
      </div>
      <div style={{ height: 12, background: '#eef2f7', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            width: `${pct}%`,
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
