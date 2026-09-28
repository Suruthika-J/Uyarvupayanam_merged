import React from 'react'
import { FiZap, FiRefreshCw, FiAlertTriangle, FiCpu } from 'react-icons/fi'
import { useTypewriter } from './useTypewriter'

/* ── Streaming text ─────────────────────────────────────────
   Renders AI-generated text with a typewriter/streaming effect
   and a blinking cursor until fully revealed. Falls back to the
   full text immediately when streaming is complete or disabled. */
export function StreamingText({ text, as: Tag = 'span', style = {}, speed, cursor = true }) {
  const { text: display, done } = useTypewriter(text || '', { speed })
  return (
    <Tag style={{ ...style }}>
      {display}
      {cursor && !done && <span style={{ display: 'inline-block', width: 7, height: '1em', marginLeft: 2, verticalAlign: '-0.1em', background: 'var(--s-accent)', animation: 's-blink 0.9s steps(2) infinite' }} />}
    </Tag>
  )
}

/* ── "Generating" placeholder ──────────────────────────────
   Shown while an AI/content call is in flight. Replaces a blank
   region so the user knows something is being generated. */
export function AIGenerating({ label = 'Generating your plan', sub, color = 'var(--s-primary)' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '64px 24px', borderRadius: 18,
      border: '1px dashed var(--s-border)', background: 'var(--s-surface)',
    }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--s-purple-l, #ede9fe)', color: 'var(--s-purple, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <FiCpu size={26} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--s-font-display)', fontWeight: 800,
        fontSize: 16, color: 'var(--s-text)', marginBottom: 8,
      }}>
        <FiZap size={15} color={color} />
        {label}
        <span className="ai-dots"><span>.</span><span>.</span><span>.</span></span>
      </div>
      {sub && (
        <p style={{ fontSize: 13, color: 'var(--s-text3)', maxWidth: 420, margin: 0, lineHeight: 1.6 }}>
          {sub}
        </p>
      )}
      <div style={{ width: 'min(260px, 70%)', height: 6, borderRadius: 99, background: 'var(--s-bg2, #f1f5f9)', marginTop: 22, overflow: 'hidden' }}>
        <div className="ai-shimmer-bar" style={{ height: '100%', background: `linear-gradient(90deg, transparent, ${color}, transparent)`, width: '40%' }} />
      </div>
    </div>
  )
}

/* ── Graceful failure state ───────────────────────────────
   Shown when an AI/content call fails. Includes a Retry action
   that re-triggers the generation. */
export function AIFailure({
  title = 'We couldn’t finish that request',
  message = 'The AI service didn’t respond in time. Please try again.',
  onRetry, retryLabel = 'Try Again',
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '60px 24px', borderRadius: 18,
      border: '1px solid #fecaca', background: '#fef2f2',
    }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <FiAlertTriangle size={24} />
      </div>
      <div style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 16, color: 'var(--s-text)', marginBottom: 6 }}>
        {title}
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--s-text3)', maxWidth: 380, margin: '0 0 18px', lineHeight: 1.6 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'var(--s-primary)', color: '#fff', border: 'none',
            padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            fontFamily: 'var(--s-font-display)', cursor: 'pointer',
          }}
        >
          <FiRefreshCw size={15} /> {retryLabel}
        </button>
      )}
    </div>
  )
}
