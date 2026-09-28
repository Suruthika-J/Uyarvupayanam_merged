import React from 'react';
import { FiRefreshCcw, FiArrowLeft, FiAward } from 'react-icons/fi';
import SkillPoints from './SkillPoints';

export default function ActivityCompletion({
  emoji = '🎉',
  title = 'Great Job!',
  message,
  points = [],
  skillChips = [],
  onTryAgain,
  onBack,
  backLabel = 'Back to Fun',
  tryAgainLabel = 'Try Again',
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 32,
        border: '1px solid #f1f5f9',
        padding: '40px 32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        maxWidth: 640,
        margin: '0 auto',
        textAlign: 'center',
        animation: 'fadeUp 0.4s ease-out',
      }}
    >
      <div style={{ fontSize: 54, marginBottom: 12 }}>{emoji}</div>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      {message && (
        <p style={{ color: '#64748b', fontSize: 16, margin: '10px 0 28px', lineHeight: 1.5 }}>{message}</p>
      )}

      {points.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {points.map((p, i) => (
            <SkillPoints key={i} label={p.label} points={p.points} emoji={p.emoji} color={p.color} />
          ))}
        </div>
      )}

      {skillChips.length > 0 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {skillChips.map((chip) => (
            <span
              key={chip.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: chip.color ? `${chip.color}1a` : '#f8fafc',
                border: `1.5px solid ${chip.color ? `${chip.color}33` : '#e2e8f0'}`,
                color: chip.color || '#475569',
                padding: '8px 16px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 18 }}>{chip.emoji}</span> {chip.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onTryAgain}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 10px 20px -6px rgba(249,115,22,0.5)',
          }}
        >
          <FiRefreshCcw /> {tryAgainLabel}
        </button>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 24px',
            borderRadius: 14,
            background: '#fff',
            color: '#f97316',
            border: '2px solid #fed7aa',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft /> {backLabel}
        </button>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', color: '#a0aec0', fontSize: 13 }}>
        <FiAward size={14} style={{ marginRight: 6 }} /> This is a creativity activity, not a test.
      </div>
    </div>
  );
}
