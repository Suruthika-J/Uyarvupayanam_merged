import React from 'react';
import { SBadge, SBtn } from '../../ui';
import { FiPlay } from 'react-icons/fi';

export default function ActivityCard({
  title,
  category,
  description,
  skill,
  difficulty,
  cta = 'Play Now',
  icon: Icon,
  gradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  onStart,
  emoji,
}) {
  return (
    <div
      className="hover-lift"
      style={{
        background: '#fff',
        borderRadius: 32,
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: gradient,
          padding: '28px 28px 24px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 34,
            flexShrink: 0,
          }}
        >
          {emoji || (Icon ? <Icon size={34} /> : null)}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em' }}>{title}</h3>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.22)',
                color: '#fff',
                padding: '3px 10px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {category}
            </span>
            <span
              style={{
                background: 'rgba(255,255,255,0.22)',
                color: '#fff',
                padding: '3px 10px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
          {description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <SBadge color="purple" dot>
            {skill}
          </SBadge>
          <SBtn variant="primary" onClick={onStart} style={{ borderRadius: 14, padding: '12px 22px', fontWeight: 800 }}>
            <FiPlay /> {cta}
          </SBtn>
        </div>
      </div>
    </div>
  );
}
