import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

export default function SelectionCard({
  option,
  selected = false,
  onSelect,
  accent = '#8b5cf6',
  disabled = false,
  meta,
  selectedCount,
  style = {},
}) {
  const handleClick = () => {
    if (!disabled && onSelect) onSelect(option.value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 20,
        border: selected ? `3px solid ${accent}` : '2px solid #e2e8f0',
        background: selected ? '#f8fafc' : '#fff',
        color: selected ? '#1e293b' : '#475569',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 800,
        fontSize: 16,
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s ease',
        opacity: disabled && !selected ? 0.5 : 1,
        boxShadow: selected ? `0 8px 20px -6px ${accent}59` : 'none',
        ...style,
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1 }}>{option.emoji}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block' }}>{option.label}</span>
        {meta && (
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>
            {meta}
          </span>
        )}
      </span>
      {selectedCount !== undefined && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: selected ? accent : '#cbd5e1',
            background: '#fff',
            border: `1.5px solid ${selected ? `${accent}55` : '#e2e8f0'}`,
            borderRadius: 99,
            padding: '2px 10px',
            minWidth: 34,
            textAlign: 'center',
          }}
        >
          {selectedCount}
        </span>
      )}
      {selected && <FiCheckCircle size={22} color={accent} />}
    </button>
  );
}