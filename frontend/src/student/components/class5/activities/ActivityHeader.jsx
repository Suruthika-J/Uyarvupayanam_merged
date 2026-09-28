import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function ActivityHeader({ title, subtitle, onBack, backLabel = 'Back to Games', emoji }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid #e2e8f0',
          color: '#475569',
          padding: '8px 16px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <FiArrowLeft /> {backLabel}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {emoji && <span style={{ fontSize: 40 }}>{emoji}</span>}
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {subtitle && <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 15 }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
