import React from 'react'

// Playful animated accents for each world. Items are absolutely positioned
// within the scene; the theme's animation class drives their motion.

function Cloud({ style }) {
  return (
    <svg className="adh-deco-item" viewBox="0 0 120 60" style={style} aria-hidden="true">
      <ellipse cx="34" cy="40" rx="26" ry="16" fill="#fff" opacity="0.85" />
      <ellipse cx="70" cy="32" rx="30" ry="20" fill="#fff" opacity="0.9" />
      <ellipse cx="96" cy="42" rx="22" ry="13" fill="#fff" opacity="0.8" />
    </svg>
  )
}

function Streak({ style, delay }) {
  return (
    <span
      className="adh-deco-item adh-rain-streak"
      style={{ ...style, animationDelay: delay, position: 'absolute', height: 22, width: 3 }}
    />
  )
}

function Sparkle({ style, delay }) {
  return <span className="adh-deco-item adh-sparkle" style={{ ...style, animationDelay: delay }} />
}

function Leaf({ style, delay }) {
  return (
    <span
      className="adh-deco-item adh-leaf"
      style={{ ...style, animationDelay: delay, position: 'absolute' }}
    />
  )
}

function Bird({ style }) {
  return (
    <svg className="adh-deco-item" viewBox="0 0 40 20" style={style} aria-hidden="true">
      <path d="M2 14 q8 -10 16 0 q8 -10 18 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  )
}

const DECORATIONS = {
  sunrise: (
    <>
      <Cloud style={{ left: '8%', top: '8%', width: 110 }} />
      <Cloud style={{ left: '58%', top: '16%', width: 90, opacity: 0.85 }} />
      <Cloud style={{ left: '30%', top: '28%', width: 70, opacity: 0.6 }} />
    </>
  ),
  rain: (
    <>
      <Streak style={{ left: '16%', top: '30%' }} delay="0s" />
      <Streak style={{ left: '24%', top: '30%' }} delay="0.25s" />
      <Streak style={{ left: '34%', top: '30%' }} delay="0.5s" />
      <Streak style={{ left: '46%', top: '30%' }} delay="0.12s" />
      <Streak style={{ left: '54%', top: '30%' }} delay="0.38s" />
      <Streak style={{ left: '66%', top: '30%' }} delay="0.05s" />
      <Streak style={{ left: '76%', top: '30%' }} delay="0.3s" />
      <Streak style={{ left: '12%', top: '44%' }} delay="0.45s" />
      <Streak style={{ left: '60%', top: '48%' }} delay="0.2s" />
    </>
  ),
  warmHome: (
    <>
      <Sparkle style={{ left: '18%', top: '22%' }} delay="0s" />
      <Sparkle style={{ left: '40%', top: '12%' }} delay="0.6s" />
      <Sparkle style={{ left: '72%', top: '20%' }} delay="1.1s" />
      <Sparkle style={{ left: '84%', top: '40%' }} delay="0.3s" />
      <Sparkle style={{ left: '8%', top: '44%' }} delay="0.9s" />
    </>
  ),
  classroom: (
    <>
      <Sparkle style={{ left: '62%', top: '24%' }} delay="0s" />
      <Sparkle style={{ left: '74%', top: '38%' }} delay="0.5s" />
      <Sparkle style={{ left: '42%', top: '16%' }} delay="0.8s" />
      <Leaf style={{ left: '56%', top: '30%' }} delay="0.2s" />
    </>
  ),
  playground: (
    <>
      <Leaf style={{ left: '12%', top: '24%' }} delay="0s" />
      <Leaf style={{ left: '68%', top: '18%' }} delay="0.7s" />
      <Bird style={{ left: '42%', top: '12%', width: 42 }} />
      <Bird style={{ left: '84%', top: '26%', width: 34, opacity: 0.8 }} />
      <Cloud style={{ left: 0, top: '6%', width: 110 }} />
    </>
  ),
  farm: (
    <>
      <Bird style={{ left: '18%', top: '16%', width: 44 }} />
      <Bird style={{ left: '30%', top: '8%', width: 34, opacity: 0.8 }} />
      <Leaf style={{ left: '70%', top: '34%' }} delay="0.4s" />
      <Cloud style={{ left: '60%', top: '6%', width: 120 }} />
    </>
  ),
}

export default function DecorationLayer({ environment, animation }) {
  const animClass = animation ? ` adh-anim-${animation}` : ''
  return <div className={`adh-deco${animClass}`} aria-hidden="true">{DECORATIONS[environment] || DECORATIONS.sunrise}</div>
}