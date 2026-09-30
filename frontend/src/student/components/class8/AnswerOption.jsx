import React from 'react'
import { FiCheck } from 'react-icons/fi'

const ACCENT = '#1a7a50'
const INK = '#0f172a'
const MUTED = '#5b6b80'
const SOFT_BG = '#e6f4ec'

// A game-challenge answer option: letter circle + big readable label.
// Used for multiple-choice, true-false and word-problem options.
export default function AnswerOption({ option, index, selected, onSelect, disabled }) {
  const on = selected === option
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onSelect(on ? null : option)}
      className="hover-lift"
      style={{
        textAlign: 'left', background: on ? SOFT_BG : '#fff',
        border: `2px solid ${on ? ACCENT : 'var(--s-border)'}`,
        borderRadius: 16, padding: '16px 20px', fontSize: 17.5, fontWeight: 800, color: INK,
        cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 14,
        opacity: disabled ? 0.7 : 1,
        boxShadow: on ? '0 8px 20px -12px rgba(26,122,80,0.5)' : 'var(--s-shadow)',
        transition: 'border-color 0.15s ease, background 0.15s ease',
        width: '100%',
      }}
    >
      <span style={{
        width: 32, height: 32, borderRadius: 99, flexShrink: 0,
        background: on ? ACCENT : '#eef2f5', color: on ? '#fff' : MUTED,
        display: 'grid', placeItems: 'center', fontSize: 14.5, fontWeight: 900,
      }}>
        {on ? <FiCheck size={17} /> : String.fromCharCode(65 + index)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>{option}</span>
    </button>
  )
}