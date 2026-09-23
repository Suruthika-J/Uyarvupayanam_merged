import React from 'react'
import { C5, ICONS } from './class5Theme'

// Big tab hero: eyebrow + punchy title + subtitle + optional right-side action.
export default function SectionHeader({ eyebrow, title, subtitle, children, align = 'left' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: align === 'left' ? 'flex-end' : 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 26,
      }}
    >
      <div style={{ textAlign: align, maxWidth: 640 }}>
        {eyebrow && (
          <span
            style={{
              display: 'inline-block',
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C5.navy,
              background: '#e6f0f7',
              padding: '4px 12px',
              borderRadius: 99,
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </span>
        )}
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: C5.ink, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: C5.muted, fontSize: 15, lineHeight: 1.65, margin: '10px 0 0', maxWidth: 560 }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{children}</div>}
    </div>
  )
}

export function SubSection({ title, subtitle, action, onAction, actionLabel = 'See all' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 10,
        margin: '34px 0 14px',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C5.ink }}>{title}</h2>
        {subtitle && <p style={{ margin: '3px 0 0', fontSize: 13.5, color: C5.faint }}>{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            color: C5.navy,
            fontFamily: 'var(--s-font-display)',
            whiteSpace: 'nowrap',
          }}
        >
          {actionLabel} →
        </button>
      )}
    </div>
  )
}

// The recurring "why it matters" chip (accessibility-friendly label on cards).
export function WhyItMatters({ text }) {
  if (!text) return null
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        background: C5.soft,
        border: `1px solid ${C5.line}`,
        borderRadius: 12,
        padding: '9px 12px',
        marginBottom: 12,
      }}
    >
      <span aria-hidden="true" style={{ color: C5.navy, marginTop: 1 }}>
        <ICONS.messageSquare size={14} strokeWidth={2.4} />
      </span>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: C5.muted }}>
        <strong style={{ color: C5.ink }}>Why it matters: </strong>
        {text}
      </p>
    </div>
  )
}