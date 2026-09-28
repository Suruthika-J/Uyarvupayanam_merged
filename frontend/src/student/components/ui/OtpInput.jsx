import React, { useRef } from 'react'

/**
 * 6-digit one-time-password input.
 * Controlled: parent supplies `value` (string) and receives changes via `onChange`.
 * Boxes auto-advance on typing, auto-rewind on Backspace, and accept a pasted code.
 */
export default function OtpInput({ length = 6, value = '', onChange, disabled = false, id }) {
  const refs = useRef([])
  const digits = Array.from({ length }, (_, i) => (value || '')[i] || '')

  const setAt = (idx, char) => {
    const next = (value || '').split('')
    next[idx] = char
    return next.join('')
  }

  const handleChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      onChange(setAt(idx, ''))
      return
    }
    if (raw.length > 1) {
      // Paste into the middle: fill forward from the current box.
      const chars = raw.split('').slice(0, length - idx)
      const next = (value || '').split('')
      chars.forEach((c, i) => { next[idx + i] = c })
      onChange(next.join(''))
      refs.current[Math.min(idx + chars.length, length - 1)]?.focus()
      return
    }
    onChange(setAt(idx, raw))
    if (idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!text) return
    e.preventDefault()
    onChange(text)
    refs.current[Math.min(text.length, length - 1)]?.focus()
  }

  return (
    <div
      style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
      role="group"
      aria-label="One-time verification code"
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          id={id ? `${id}-${i}` : undefined}
          className="s-otp-input"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          autoFocus={i === 0}
          value={d}
          disabled={disabled}
          onPaste={handlePaste}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1}`}
          style={{
            width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800,
            fontFamily: 'var(--s-font-display)', color: 'var(--s-text)',
            border: d ? '2px solid var(--s-primary)' : '2px solid #c9d3dd',
            background: d ? 'var(--s-primary-l)' : 'var(--s-surface2)',
            borderRadius: 13,
            boxShadow: '0 1px 3px rgba(15,76,117,0.06)',
            outline: 'none', caretColor: 'var(--s-primary)',
            transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          }}
        />
      ))}
    </div>
  )
}