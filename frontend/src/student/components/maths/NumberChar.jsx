import React from 'react'
import { DIGIT_META } from '../../data/numberChars'

// NumberChar: one agent for each digit 0-9. Every digit wears its own accent
// colour and acts out one tiny personality trait (used as a short animation),
// so numbers feel like friendly characters across every Math Adventure World.
// The animation IS the "number's personality", kept short and non-looping.

function traitClass(trait) {
  return `mth-num-${trait}`
}

export default function NumberChar({ digit, size = 44, animate = true, title }) {
  const meta = DIGIT_META[String(digit)] || { color: '#ffcf6b', trait: 'pop' }
  const box = String(digit)
  return (
    <span
      className={`mth-num${animate ? ` ${traitClass(meta.trait)}` : ''}`}
      style={{
        '--ncolor': meta.color,
        '--nsize': `${Math.round(size)}px`,
      }}
      title={title ? `${digit} is ${meta.trait}` : undefined}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title ? `${digit}-digit, ${meta.trait}` : undefined}
    >
      {box}
    </span>
  )
}

export function DigitWord({ text, size = 40, animate = true }) {
  return (
    <span className="mth-num-word" aria-hidden="true">
      {String(text)
        .split('')
        .filter((ch) => ch !== '-')
        .map((ch, i) => (
          <NumberChar key={`${ch}-${i}`} digit={ch} size={size} animate={animate} />
        ))}
    </span>
  )
}