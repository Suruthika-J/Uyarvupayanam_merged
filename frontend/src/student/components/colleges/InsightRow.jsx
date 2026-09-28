import React from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { SBadge } from '../ui'

/**
 * Shared list-item card for every Colleges Insight drill-down screen.
 * One row = one course or college; all rows share the same visual theme
 * (white card, hover-lift, arrow chip) so the explorer feels consistent.
 */

const STATUS_BADGE_COLOR = {
  Verified: 'green',
  Imported: 'blue',
  Manual: 'purple',
}

const TYPE_BADGE_COLOR = {
  Government: 'blue',
  Private: 'green',
  Aided: 'orange',
}

export function StatusBadge({ status }) {
  return <SBadge color={STATUS_BADGE_COLOR[status] || 'gray'}>{status}</SBadge>
}

export function TypeBadge({ type }) {
  return <SBadge color={TYPE_BADGE_COLOR[type] || 'gray'}>{type}</SBadge>
}

/** Small inline chip used inside a row's footer (location, duration, ...). */
export function Chip({ icon, children, style }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700,
        color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: 99,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  )
}

/**
 * @param {object} props
 * @param {string} props.title       Row heading (course or college name)
 * @param {React.ReactNode} [props.subtitle]  Optional muted description line
 * @param {React.ReactNode} [props.footer]    Optional row of chips/badges
 * @param {() => void} [props.onOpen]         Called when the row is tapped
 * @param {string} [props.accentColor]        Chevron chip colour (stream colour)
 * @param {string} [props.accentBg]           Chevron chip background (stream tint)
 */
export default function InsightRow({ title, subtitle, footer, onOpen, accentColor = '#4f46e5', accentBg = '#eef2ff' }) {
  return (
    <div
      onClick={onOpen}
      className="insight-header-hover hover-lift"
      style={{
        background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        boxShadow: '0 8px 12px -3px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: '#1e293b' }}>{title}</h3>
        {subtitle && (
          <p style={{
            margin: '6px 0 0', fontSize: 13.5, color: '#64748b', maxWidth: 640, overflow: 'hidden',
            textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {subtitle}
          </p>
        )}
        {footer && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {footer}
          </div>
        )}
      </div>
      <div style={{ background: accentBg, width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', color: accentColor, flexShrink: 0 }}>
        <FiChevronRight size={20} />
      </div>
    </div>
  )
}