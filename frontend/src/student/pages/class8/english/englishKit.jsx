import React, { useState, useEffect } from 'react'
import {
  FiVolume2, FiPlay, FiSquare, FiCheckCircle, FiLock, FiTarget,
  FiChevronRight, FiArrowLeft, FiAlertCircle, FiCloudOff, FiBookOpen,
} from 'react-icons/fi'
import { speak, stopSpeaking } from '../../../utils/speech'

// ── English Space Explorer shared UI (dark galaxy theme) ────────────────────

export const EM = {
  ink: '#eef1fb',        // primary text on dark
  muted: '#a9b4d4',      // secondary text
  faint: '#7c88ad',      // tertiary text
  panel: 'rgba(23, 28, 64, 0.72)',   // glass panel
  panel2: 'rgba(13, 17, 42, 0.6)',   // deeper glass
  line: 'rgba(168, 180, 235, 0.18)', // borders
  violet: '#8b5cf6',
  sky: '#38bdf8',
  amber: '#f59e0b',
  green: '#34d399',
  rose: '#fb7185',
}

export function EmButton({ children, onClick, kind = 'primary', disabled, loading, icon, style = {}, fullWidth }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderRadius: 14, padding: '12px 22px', fontSize: 15, fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
    border: '1.5px solid transparent', transition: 'all 0.18s ease',
    fontFamily: 'inherit',
    ...style,
  }
  const kinds = {
    primary: { background: `linear-gradient(120deg, ${EM.violet}, #6d28d9)`, color: '#fff', boxShadow: '0 12px 26px -14px rgba(139,92,246,0.8)' },
    sky: { background: `linear-gradient(120deg, ${EM.sky}, #2563eb)`, color: '#fff', boxShadow: '0 12px 26px -14px rgba(56,189,248,0.8)' },
    ghost: { background: 'rgba(255,255,255,0.06)', color: EM.ink, border: `1.5px solid ${EM.line}` },
    green: { background: `linear-gradient(120deg, ${EM.green}, #059669)`, color: '#052e22', boxShadow: '0 12px 26px -14px rgba(52,211,153,0.8)' },
  }
  return (
    <button
      type="button"
      className="hover-lift em-fade-in"
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...kinds[kind], width: fullWidth ? '100%' : undefined }}
    >
      {loading ? <FiChevronRight className="em-spin" size={17} /> : icon}
      {children}
    </button>
  )
}

export function EmChip({ text, tone = 'muted', style = {} }) {
  const tones = {
    muted: { color: EM.muted, background: 'rgba(255,255,255,0.07)', border: `1px solid ${EM.line}` },
    violet: { color: '#e9defe', background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.45)' },
    green: { color: '#d3f7e8', background: 'rgba(52,211,153,0.16)', border: '1px solid rgba(52,211,153,0.4)' },
    amber: { color: '#fdeeca', background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(245,158,11,0.4)' },
    rose: { color: '#ffd7dd', background: 'rgba(251,113,133,0.16)', border: '1px solid rgba(251,113,133,0.4)' },
  }
  return (
    <span className="em-chip" style={{ fontSize: 12.5, fontWeight: 800, borderRadius: 99, padding: '5px 12px', letterSpacing: '0.02em', ...tones[tone], ...style }}>
      {text}
    </span>
  )
}

export function EmBar({ value, accent = EM.violet, height = 10, style = {} }) {
  return (
    <div
      style={{
        height, borderRadius: 99, background: 'rgba(255,255,255,0.09)',
        overflow: 'hidden', position: 'relative', ...style,
      }}
    >
      <div
        className="em-progress-fill"
        style={{
          height: '100%', borderRadius: 99, width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
        }}
      />
    </div>
  )
}

export function EmOption({ option, index, selected, onSelect, disabled, correct, reveal }) {
  // reveal: null = normal quiz; 'correct' / 'wrong' used after submission
  let bg = 'rgba(255,255,255,0.05)'
  let border = EM.line
  let letterColor = EM.muted
  let letterBg = 'rgba(255,255,255,0.08)'
  if (selected && !reveal) {
    bg = 'rgba(139,92,246,0.2)'
    border = EM.violet
    letterColor = '#fff'
    letterBg = EM.violet
  }
  if (reveal === 'correct') {
    bg = 'rgba(52,211,153,0.16)'
    border = EM.green
    letterColor = '#d3f7e8'
    letterBg = EM.green
  } else if (reveal === 'wrong') {
    bg = 'rgba(251,113,133,0.14)'
    border = EM.rose
    letterColor = '#ffd7dd'
    letterBg = EM.rose
  }
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => (selected ? onSelect(null) : onSelect(option))}
      className="em-fade-in"
      style={{
        textAlign: 'left', background: bg, border: `2px solid ${border}`,
        borderRadius: 15, padding: '14px 18px', fontSize: 16, fontWeight: 700, color: EM.ink,
        cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 13,
        width: '100%', transition: 'border-color 0.15s ease, background 0.15s ease', fontFamily: 'inherit',
      }}
    >
      <span style={{
        width: 30, height: 30, borderRadius: 99, flexShrink: 0, display: 'grid', placeItems: 'center',
        fontSize: 13.5, fontWeight: 900, background: letterBg, color: letterColor,
      }}>
        {String.fromCharCode(65 + index)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>{option}</span>
      {reveal === 'correct' && <FiCheckCircle size={18} color={EM.green} aria-label="correct" />}
    </button>
  )
}

export function StateBadge({ state, size = 34 }) {
  const map = {
    locked: { icon: <FiLock size={15} />, color: EM.faint },
    open: { icon: <FiBookOpen size={16} />, color: EM.sky },
    ready: { icon: <FiTarget size={17} />, color: EM.amber },
    completed: { icon: <FiCheckCircle size={18} />, color: EM.green },
  }
  const s = map[state] || map.locked
  return (
    <span
      aria-label={state}
      style={{
        width: size, height: size, borderRadius: 12, display: 'grid', placeItems: 'center',
        background: 'rgba(255,255,255,0.07)', border: `1px solid ${EM.line}`, color: s.color, flexShrink: 0,
      }}
    >
      {s.icon}
    </span>
  )
}

// ── Listen control: text-to-speech playback (replay + stop) ────────────────
// Used for Listening + Speaking topics. Replays the transcript; the full text
// is always visible below (accessible alternative). No recording is implied.
const LISTEN_STRIP = [
  /^listen\s+(to|again)[^:]*:\s*/i,
  /\(your device can read it aloud\)/gi,
  /\(your device can read this model\)/gi,
]

function cleanForSpeech(text) {
  let out = String(text || '')
  for (const re of LISTEN_STRIP) out = out.replace(re, '')
  return out.trim()
}

export function ListenControl({ text, label = 'Listen to the passage', accent = EM.violet, compact = false }) {
  const [playing, setPlaying] = useState(false)
  const payload = cleanForSpeech(text)

  const start = () => {
    setPlaying(true)
    speak(payload, {
      rate: 0.92,
      pitch: 1.0,
      lang: 'en-IN',
      onEnd: () => setPlaying(false),
    })
  }

  const stop = () => {
    stopSpeaking()
    setPlaying(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {!playing ? (
        <EmButton kind="sky" onClick={start} icon={<FiVolume2 size={17} />} style={{ padding: '9px 16px', fontSize: 13.5 }}>
          {label}
        </EmButton>
      ) : (
        <>
          <EmButton kind="ghost" onClick={stop} icon={<FiSquare size={16} />} style={{ padding: '9px 16px', fontSize: 13.5 }}>
            Stop
          </EmButton>
          <EmButton kind="ghost" onClick={start} icon={<FiPlay size={16} />} style={{ padding: '9px 16px', fontSize: 13.5 }}>
            Replay
          </EmButton>
        </>
      )}
      {playing && <span style={{ fontSize: 12.5, color: EM.sky, fontWeight: 700 }} className="em-pop">Reading aloud…</span>}
      {!compact && <span style={{ fontSize: 12, color: EM.faint }}>Full transcript is shown below.</span>}
    </div>
  )
}

// ── Full-panel states ───────────────────────────────────────────────────────

export function LoadingState({ text = 'Launching the explorer…' }) {
  return (
    <div className="em-fade-in" style={{ textAlign: 'center', padding: '90px 20px' }}>
      <FiCloudOff size={30} className="em-spin" color={EM.violet} style={{ margin: '0 auto 14px', display: 'block' }} />
      <div style={{ color: EM.muted, fontWeight: 700, fontSize: 15 }}>{text}</div>
    </div>
  )
}

export function ErrorState({ error, onBack, onRetry }) {
  const auth = error && error.auth
  const notFound = error && error.notFound
  let title = 'Could not load this page'
  let msg = error && error.message && error.message !== 'network' ? error.message : 'Please check your connection and try again.'
  if (auth) { title = 'Please sign in'; msg = 'Your session has expired. Sign in again to continue your journey.' }
  if (notFound) { title = 'Not found'; msg = 'This area or topic is not available.' }
  return (
    <div className="em-fade-in" style={{ textAlign: 'center', padding: '80px 20px', maxWidth: 480, margin: '0 auto' }}>
      <FiAlertCircle size={34} color={auth ? EM.amber : EM.rose} style={{ margin: '0 auto 16px', display: 'block' }} />
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: EM.ink }}>{title}</h2>
      <p style={{ color: EM.muted, fontSize: 14.5, lineHeight: 1.6, margin: '0 0 22px' }}>{msg}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onBack && <EmButton kind="ghost" onClick={onBack} icon={<FiArrowLeft size={16} />}>Go back</EmButton>}
        {onRetry && <EmButton onClick={onRetry}>Try again</EmButton>}
      </div>
    </div>
  )
}

export function LockedState({ message, onBack, label = 'Back to map' }) {
  return (
    <div className="em-fade-in" style={{ textAlign: 'center', padding: '70px 20px', maxWidth: 480, margin: '0 auto' }}>
      <FiLock size={32} color={EM.faint} style={{ margin: '0 auto 14px', display: 'block' }} />
      <h2 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 8px', color: EM.ink }}>This is locked</h2>
      <p style={{ color: EM.muted, fontSize: 14.5, lineHeight: 1.6, margin: '0 0 20px' }}>{message}</p>
      {onBack && <EmButton kind="ghost" onClick={onBack} icon={<FiChevronRight size={16} />}>{label}</EmButton>}
    </div>
  )
}