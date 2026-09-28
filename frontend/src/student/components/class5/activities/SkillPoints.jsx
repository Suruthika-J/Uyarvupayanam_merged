import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function SkillPoints({ label, points, emoji = '⭐', color = '#f59e0b' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: `${color}1a`,
        border: `1.5px solid ${color}33`,
        borderRadius: 18,
        padding: '16px 20px',
        maxWidth: 420,
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color }}>
          <FiStar size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          +{points}
        </div>
      </div>
    </div>
  );
}
