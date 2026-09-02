import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function OptionButton({
  option,
  index,
  selected,
  revealed,
  isCorrectOption,
  disabled,
  onSelect,
}) {
  let bg = '#f8fafc';
  let border = '2px solid #e2e8f0';
  let text = '#334155';
  let icon = null;

  if (revealed) {
    if (isCorrectOption) {
      bg = '#ecfdf5';
      border = '2px solid #10b981';
      text = '#065f46';
      icon = <FiCheckCircle size={22} color="#10b981" />;
    } else if (selected) {
      bg = '#fef2f2';
      border = '2px solid #ef4444';
      text = '#991b1b';
      icon = <FiXCircle size={22} color="#ef4444" />;
    } else {
      bg = '#f8fafc';
      border = '1.5px solid #e2e8f0';
      text = '#94a3b8';
    }
  } else if (selected) {
    bg = '#eef2ff';
    border = '2px solid #6366f1';
    text = '#4338ca';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        borderRadius: 18,
        background: bg,
        border,
        cursor: disabled ? (revealed ? 'default' : 'not-allowed') : 'pointer',
        transition: 'all 0.2s ease',
        fontSize: 16,
        fontWeight: 700,
        color: text,
        textAlign: 'left',
        boxShadow: selected && !revealed ? '0 6px 12px -4px rgba(99,102,241,0.3)' : 'none',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          background: revealed ? (isCorrectOption ? '#10b981' : selected ? '#ef4444' : '#e2e8f0') : selected ? '#6366f1' : '#e2e8f0',
          color: revealed ? (isCorrectOption || selected ? '#fff' : '#94a3b8') : selected ? '#fff' : '#64748b',
          display: 'grid',
          placeItems: 'center',
          fontSize: 14,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {String.fromCharCode(65 + index)}
      </span>
      <span style={{ flex: 1 }}>{option}</span>
      {icon}
    </button>
  );
}
