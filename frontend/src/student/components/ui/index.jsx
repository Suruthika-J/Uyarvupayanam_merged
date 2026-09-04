import React, { useState } from 'react'

/* ── Button ──────────────────────────────────────────────── */
const BTN_SIZES = {
  sm: { padding: '6px 14px',  fontSize: 12.5, borderRadius: 8  },
  md: { padding: '10px 22px', fontSize: 14,   borderRadius: 10 },
  lg: { padding: '13px 30px', fontSize: 15.5, borderRadius: 12 },
}
const BTN_VARIANTS = {
  primary: { background: 'var(--s-primary)',  color: '#fff',             border: 'none' },
  accent:  { background: 'var(--s-accent)',   color: '#fff',             border: 'none' },
  outline: { background: 'transparent',       color: 'var(--s-primary)', border: '1.5px solid var(--s-primary)' },
  ghost:   { background: 'var(--s-surface2)', color: 'var(--s-text2)',   border: '1.5px solid var(--s-border)' },
  danger:  { background: '#fef2f2',           color: '#dc2626',          border: '1.5px solid #fecaca' },
  white:   { background: '#fff',              color: 'var(--s-primary)', border: 'none' },
}

export function SBtn({ children, variant = 'primary', size = 'md', style = {}, disabled, fullWidth, ...props }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        gap: 7, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--s-font-display)', fontWeight: 600,
        transition: 'all 0.2s ease', textDecoration: 'none',
        opacity: disabled ? 0.6 : 1,
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: hov && !disabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        ...BTN_SIZES[size],
        ...BTN_VARIANTS[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── Card ────────────────────────────────────────────────── */
export function SCard({ children, hover = false, style = {}, fullWidth, ...props }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--s-surface)',
        border: '1px solid var(--s-border)',
        borderRadius: 'var(--s-radius)',
        padding: 20,
        boxShadow: hov && hover ? 'var(--s-shadow-lg)' : 'var(--s-shadow)',
        transform: hov && hover ? 'translateY(-3px)' : 'none',
        transition: 'all 0.22s ease',
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── Badge ───────────────────────────────────────────────── */
const BADGE_COLORS = {
  green:  { bg: 'var(--s-green-l)',  text: 'var(--s-green)'  },
  orange: { bg: 'var(--s-accent-l)', text: 'var(--s-accent)' },
  gold:   { bg: 'var(--s-gold-l)',   text: 'var(--s-gold)'   },
  blue:   { bg: 'var(--s-blue-l)',   text: 'var(--s-blue)'   },
  purple: { bg: 'var(--s-purple-l)', text: 'var(--s-purple)' },
  gray:   { bg: 'var(--s-bg2)',      text: 'var(--s-text3)'  },
}

export function SBadge({ children, color = 'green', dot = false, style = {} }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.green
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      fontFamily: 'var(--s-font-display)', letterSpacing: '0.01em',
      whiteSpace: 'nowrap', ...style,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: c.text, flexShrink: 0,
          animation: 's-pulse-dot 2s ease infinite',
        }} />
      )}
      {children}
    </span>
  )
}

/* ── Notification dot ────────────────────────────────────── */
export function SNotifBadge({ count }) {
  if (!count) return null
  return (
    <span style={{
      position: 'absolute', top: -5, right: -5,
      background: '#ef4444', color: '#fff',
      fontSize: 10, fontWeight: 800,
      fontFamily: 'var(--s-font-display)',
      minWidth: 18, height: 18, borderRadius: 99,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 4px', border: '2px solid var(--s-surface)',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

/* ── Loader ──────────────────────────────────────────────── */
export function SLoader({ size = 34, color = 'var(--s-primary)', style = {} }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48, ...style }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '3px solid var(--s-border)',
        borderTop: `3px solid ${color}`,
        animation: 's-spin 0.7s linear infinite',
      }} />
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────── */
export function SEmpty({ icon, title = 'Nothing here', desc = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 14, color: 'var(--s-text3)' }}>
        {typeof icon === 'string' ? icon : icon}
      </div>
      <p style={{
        fontFamily: 'var(--s-font-display)', fontWeight: 700,
        fontSize: 17, color: 'var(--s-text)', marginBottom: 7,
      }}>{title}</p>
      {desc && (
        <p style={{ fontSize: 14, color: 'var(--s-text3)', maxWidth: 320, margin: '0 auto', lineHeight: 1.65 }}>
          {desc}
        </p>
      )}
    </div>
  )
}

/* ── Input ───────────────────────────────────────────────── */
export function SInput({ label, error, icon, style = {}, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 600, color: 'var(--s-text2)',
          fontFamily: 'var(--s-font-display)',
        }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', fontSize: 15,
            color: focused ? 'var(--s-primary)' : 'var(--s-text3)',
            pointerEvents: 'none', transition: 'color 0.15s',
          }}>{icon}</span>
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', fontFamily: 'var(--s-font-body)',
            background: 'var(--s-surface)',
            border: `1.5px solid ${focused ? 'var(--s-primary)' : error ? '#dc2626' : 'var(--s-border)'}`,
            borderRadius: 10,
            padding: icon ? '11px 14px 11px 38px' : '11px 14px',
            fontSize: 14, color: 'var(--s-text)', outline: 'none',
            transition: 'border-color 0.2s ease', ...style,
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 1 }}>{error}</span>}
    </div>
  )
}

/* ── Select ──────────────────────────────────────────────── */
export function SSelect({ label, options, children, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 600, color: 'var(--s-text2)',
          fontFamily: 'var(--s-font-display)',
        }}>{label}</label>
      )}
      <select style={{
        width: '100%', fontFamily: 'var(--s-font-body)',
        background: '#fff',
        border: '1.5px solid var(--s-border)',
        borderRadius: 10, padding: '11px 14px',
        fontSize: 14, color: 'var(--s-text)', outline: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
        ...style,
      }} {...props}>
        {children || (options && options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt
          const lbl = typeof opt === 'object' ? (opt.label || opt.value) : opt
          return <option key={val || idx} value={val}>{lbl}</option>
        }))}
      </select>
    </div>
  )
}

/* ── Alert ───────────────────────────────────────────────── */
const ALERT_STYLES = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
  info:    { bg: 'var(--s-blue-l)', border: '#93c5fd', text: 'var(--s-blue)' },
}

export function SAlert({ type = 'info', children, message, onClose, style = {} }) {
  const s = ALERT_STYLES[type] || ALERT_STYLES.info
  const alertContent = children || message
  if (!alertContent) return null
  return (
    <div style={{
      background: s.bg, border: `1.5px solid ${s.border}`, color: s.text,
      borderRadius: 12, padding: '12px 18px',
      fontSize: 14, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      ...style,
    }}>
      <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ'}</span>
        {alertContent}
      </span>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', fontSize: 20, fontWeight: 700, lineHeight: 1, flexShrink: 0,
          opacity: 0.8,
        }}>×</button>
      )}
    </div>
  )
}

/* ── Section Header ──────────────────────────────────────── */
export function SSectionHeader({ title, subtitle, action, actionLabel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', marginBottom: 18, gap: 12,
    }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--s-font-display)', fontWeight: 800,
          fontSize: 18, color: 'var(--s-text)', marginBottom: 2,
        }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--s-text3)' }}>{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action} style={{
          fontSize: 13, fontWeight: 700, color: 'var(--s-primary)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--s-font-display)', whiteSpace: 'nowrap',
        }}>{actionLabel} →</button>
      )}
    </div>
  )
}

/* ── Breadcrumb ──────────────────────────────────────────── */
export function SBreadcrumb({ items }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 13, color: 'var(--s-text3)',
      marginBottom: 22, flexWrap: 'wrap',
    }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ opacity: 0.5 }}>/</span>}
          {item.href ? (
            <a href={item.href} style={{
              color: i === items.length - 1 ? 'var(--s-text)' : 'var(--s-text3)',
              fontWeight: i === items.length - 1 ? 600 : 400,
              textDecoration: 'none',
            }}>{item.label}</a>
          ) : (
            <span style={{
              color: i === items.length - 1 ? 'var(--s-text)' : 'var(--s-text3)',
              fontWeight: i === items.length - 1 ? 600 : 400,
            }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ── Divider ─────────────────────────────────────────────── */
export function SDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--s-border)' }} />
      {label && <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--s-border)' }} />
    </div>
  )
}
