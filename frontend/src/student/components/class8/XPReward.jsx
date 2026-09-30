import React from 'react'
import { FiZap } from 'react-icons/fi'

// Animated "+N XP" reward chip, shown after every correct answer and on
// mission-complete panels. `tone` switches between green (question) and
// gold (mission/boss reward).
export default function XPReward({ points, tone = 'green', size = 'md' }) {
  const isGold = tone === 'gold'
  const pad = size === 'lg' ? '9px 18px' : '5px 14px'
  const font = size === 'lg' ? 17 : 14.5
  return (
    <span
      className="mm-achievement"
      style={{
        background: isGold ? '#fff7e6' : '#fff',
        border: `1.5px solid ${isGold ? '#eccd97' : '#a7d8bd'}`,
        color: isGold ? '#92400e' : '#145c3d',
        borderRadius: 99, padding: pad, fontSize: font, fontWeight: 900,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        boxShadow: isGold ? '0 10px 24px -14px rgba(180,83,9,0.45)' : 'none',
      }}
    >
      <FiZap size={size === 'lg' ? 17 : 14} /> +{points} XP
    </span>
  )
}