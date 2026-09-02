import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

export default function ActivityStepProgress({
  steps = [],
  current = 0,
  accent = '#8b5cf6',
  gradient = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  onStepClick,
  rightLabel,
  showStepCount = true,
}) {
  const labelFor = (s) => (typeof s === 'string' ? s : s.label || s.title);
  const stepLabel = (label) => label.replace(/^Choose Your /, '').replace(/^Choose /, '');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <button
            type="button"
            onClick={() => onStepClick && onStepClick(i)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: i < current ? '#10b981' : i === current ? gradient : '#e2e8f0',
              color: i <= current ? '#fff' : '#94a3b8',
              border: 'none',
              fontWeight: 900,
              fontSize: 14,
              cursor: onStepClick ? 'pointer' : 'default',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {i < current ? <FiCheckCircle size={18} /> : i + 1}
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: i === current ? accent : '#94a3b8' }}>
            {stepLabel(labelFor(s))}
          </span>
          {i < steps.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 14 }}>→</span>}
        </React.Fragment>
      ))}
      {showStepCount && (
        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: '#64748b' }}>
          {rightLabel || `Step ${Math.min(current + 1, steps.length)} of ${steps.length}`}
        </span>
      )}
    </div>
  );
}