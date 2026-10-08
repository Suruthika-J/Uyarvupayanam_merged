import React, { useState } from 'react'

export { StreamingText, AIGenerating, AIFailure } from './AiStates'
export { useTypewriter } from './useTypewriter'

/* ── Button ──────────────────────────────────────────────── */
const BTN_SIZES = {
  sm: { height: 34, padding: '0 16px',  fontSize: 12.5, borderRadius: 9  },
  md: { height: 42, padding: '0 22px', fontSize: 14,   borderRadius: 10 },
  lg: { height: 48, padding: '0 30px', fontSize: 15.5, borderRadius: 12 },
}
const BTN_VARIANTS = {
  primary:   { background: 'var(--s-primary)', color: '#fff', border: '1.5px solid var(--s-primary)' },
  secondary: { background: 'var(--s-surface)', color: 'var(--s-primary)', border: '1.5px solid var(--s-border)' },
  accent:    { background: 'var(--s-accent)',  color: '#fff', border: '1.5px solid var(--s-accent)' },
  outline:   { background: 'transparent',      color: 'var(--s-primary)', border: '1.5px solid var(--s-primary)' },
  ghost:     { background: 'var(--s-surface2)', color: 'var(--s-text2)',  border: '1.5px solid var(--s-border)' },
  danger:    { background: 'var(--s-error-l)', color: 'var(--s-error)',   border: '1.5px solid #fecaca' },
  white:     { background: '#fff',             color: 'var(--s-primary)', border: 'none' },
}
const BTN_HOVERS = {
  primary:   { background: 'var(--s-primary-d)', boxShadow: '0 6px 18px rgba(26,122,80,0.28)' },
  secondary: { borderColor: 'var(--s-primary)',  boxShadow: '0 4px 12px rgba(15,23,42,0.08)' },
  accent:    { background: '#0369a1',            boxShadow: '0 6px 18px rgba(2,132,199,0.28)' },
  outline:   { background: 'var(--s-primary-l)', boxShadow: 'none' },
  ghost:     { borderColor: 'var(--s-primary)',  color: 'var(--s-primary)', boxShadow: 'none' },
  danger:    { background: 'var(--s-error-l)',   boxShadow: 'none' },
  white:     { background: '#f0faf5',            boxShadow: '0 4px 12px rgba(15,23,42,0.10)' },
}

export function SBtn({ children, variant = 'primary', size = 'md', style = {}, disabled, fullWidth, loading = false, icon, ...props }) {
  const [hov, setHov] = useState(false)
  const blocked = disabled || loading
  const hovered = hov && !blocked
  const hoverPatch = BTN_HOVERS[variant] || {}
  return (
    <button
      className="s-kit-btn"
      disabled={blocked}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        gap: 8, cursor: blocked ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--s-font-display)', fontWeight: 600,
        transition: 'all 0.2s ease', textDecoration: 'none',
        opacity: disabled ? 0.55 : 1,
        ...BTN_SIZES[size],
        ...BTN_VARIANTS[variant],
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? (hoverPatch.boxShadow || '0 4px 12px rgba(0,0,0,0.1)') : 'none',
        ...(hovered ? hoverPatch : {}),
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span aria-hidden="true" style={{
          display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          animation: 's-spin 0.7s linear infinite', flexShrink: 0,
        }} />
      )}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
      {children}
    </button>
  )
}

/* ── Card ────────────────────────────────────────────────── */
const CARD_VARIANTS = {
  default:     {},
  elevated:    { boxShadow: 'var(--s-shadow-md)' },
  bordered:    { boxShadow: 'none' },
  compact:     { padding: 12 },
  interactive: { cursor: 'pointer' },
}

export function SCard({ children, variant = 'default', hover = false, style = {}, fullWidth, ...props }) {
  const [hov, setHov] = useState(false)
  const lift = hover || variant === 'interactive'
  return (
    <div
      className="s-kit-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--s-surface)',
        border: '1px solid var(--s-border)',
        borderRadius: 'var(--s-radius-lg)',
        padding: 20,
        boxShadow: hov && lift ? 'var(--s-shadow-lg)' : 'var(--s-shadow)',
        transform: hov && lift ? 'translateY(-3px)' : 'none',
        transition: 'all 0.22s ease',
        width: fullWidth ? '100%' : 'auto',
        ...CARD_VARIANTS[variant],
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
  red:    { bg: 'var(--s-error-l)',  text: 'var(--s-error)'  },
  indigo: { bg: 'var(--s-blue-l)',   text: 'var(--s-blue)'   },
  white:  { bg: '#ffffff',           text: 'var(--s-primary)' },
}

export function SBadge({ children, color = 'green', dot = false, style = {} }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.green
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      padding: '4px 11px', borderRadius: 99,
      fontSize: 12.5, fontWeight: 600,
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
export function SInput({ label, error, icon, rightElement, style = {}, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 600, color: 'var(--s-text2)',
          fontFamily: 'var(--s-font-display)',
        }}>{label}</label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', fontSize: 15,
            color: focused ? 'var(--s-primary)' : 'var(--s-text3)',
            pointerEvents: 'none', transition: 'color 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            paddingLeft: icon ? 38 : 14,
            paddingRight: rightElement ? 40 : 14,
            paddingTop: 11,
            paddingBottom: 11,
            fontSize: 14, color: 'var(--s-text)', outline: 'none',
            transition: 'border-color 0.2s ease', ...style,
          }}
          {...props}
        />
        {rightElement && (
          <span style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rightElement}
          </span>
        )}
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

/* ── Textarea ────────────────────────────────────────────── */
export function STextarea({ label, error, style = {}, rows = 3, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 600, color: 'var(--s-text2)',
          fontFamily: 'var(--s-font-display)',
        }}>{label}</label>
      )}
      <textarea
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', fontFamily: 'var(--s-font-body)',
          background: 'var(--s-surface)',
          border: `1.5px solid ${focused ? 'var(--s-primary)' : error ? '#dc2626' : 'var(--s-border)'}`,
          borderRadius: 10,
          padding: '11px 14px',
          fontSize: 14, color: 'var(--s-text)', outline: 'none',
          resize: 'vertical',
          transition: 'border-color 0.2s ease', ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 1 }}>{error}</span>}
    </div>
  )
}


/* ── Alert ───────────────────────────────────────────────── */
const ALERT_STYLES = {
  success: { bg: 'var(--s-success-l)', border: '#a7f3d0', text: 'var(--s-success)' },
  error:   { bg: 'var(--s-error-l)',   border: '#fecaca', text: 'var(--s-error)' },
  warning: { bg: 'var(--s-warning-l)', border: '#fde68a', text: 'var(--s-warning)' },
  info:    { bg: 'var(--s-info-l)',    border: '#bae6fd', text: 'var(--s-info)' },
}

export function SAlert({ type = 'info', children, onClose }) {
  const s = ALERT_STYLES[type]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      borderRadius: 10, padding: '12px 16px',
      fontSize: 14, fontWeight: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', fontSize: 18, lineHeight: 1, flexShrink: 0,
        }}>×</button>
      )}
    </div>
  )
}

/* ── Section Header ────────────────────────────────────────
   Consistent PAGE → SECTION hierarchy: 21px semibold title,
   14px muted subtitle, right-aligned action link.            */
export function SSectionHeader({ title, subtitle, action, actionLabel, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', marginBottom: 22, gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {icon && <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--s-primary)', flexShrink: 0 }}>{icon}</span>}
        <div style={{ minWidth: 0 }}>
          <h2 style={{
            fontFamily: 'var(--s-font-display)', fontWeight: 700,
            fontSize: 21, color: 'var(--s-text)', marginBottom: 2,
            letterSpacing: '-0.01em', lineHeight: 1.3,
          }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.55, margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button onClick={action} aria-label={actionLabel} style={{
          fontSize: 14, fontWeight: 700, color: 'var(--s-primary)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--s-font-display)', whiteSpace: 'nowrap',
          padding: '4px 0', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>{actionLabel} →</button>
      )}
    </div>
  )
}

/* ── Tabs / Switch (shared primitive) ──────────────────────
   One component, three variants. Green is the active color;
   blue is reserved for genuinely informational states.      */
export function STabs({ tabs, active, onChange, variant = 'pill', size = 'md', fullWidth, style = {} }) {
  const compact = size === 'sm'
  const tabBase = {
    fontFamily: 'var(--s-font-display)', fontWeight: 600,
    fontSize: compact ? 13 : 14,
    background: 'none', border: 'none', cursor: 'pointer',
    transition: 'all 0.18s ease', whiteSpace: 'nowrap',
    color: 'var(--s-text3)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  }
  // NOTE: `extra` is spread AFTER color/fontWeight so variants may override
  // the active color (e.g. pill active = #fff on green).
  const shared = (t, on, extra = {}) => ({
    ...tabBase,
    color: on ? 'var(--s-primary)' : 'var(--s-text3)',
    fontWeight: on ? 700 : 600,
    ...extra,
  })
  const iconStyle = (t, on) => ({
    display: 'inline-flex', flexShrink: 0,
    color: on ? undefined : (t.iconColor || undefined),
  })

  if (variant === 'underline') {
    return (
      <div role="tablist" className="s-tabs" style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--s-border)', overflowX: 'auto', maxWidth: '100%', ...style }}>
        {tabs.map(t => {
          const on = active === t.id
          return (
            <button key={t.id} role="tab" aria-selected={on} className="s-tab"
              onClick={() => onChange && onChange(t.id)}
              style={shared(t, on, {
                height: compact ? 40 : 46, padding: '0 16px',
                borderBottom: `2px solid ${on ? 'var(--s-primary)' : 'transparent'}`,
                marginBottom: -1,
              })}
            >
              {t.icon && <span style={iconStyle(t, on)}>{t.icon}</span>}
              {t.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'segmented') {
    return (
      <div role="tablist" className="s-tabs s-tabs-segmented" style={{ display: 'inline-flex', background: 'var(--s-surface2)', borderRadius: 10, padding: 3, gap: 2, overflowX: 'auto', maxWidth: '100%', ...style }}>
        {tabs.map(t => {
          const on = active === t.id
          return (
            <button key={t.id} role="tab" aria-selected={on} className="s-tab"
              onClick={() => onChange && onChange(t.id)}
              style={shared(t, on, {
                flex: fullWidth ? 1 : 'none',
                height: compact ? 32 : 38, padding: '0 18px', borderRadius: 8,
                background: on ? 'var(--s-surface)' : 'transparent',
                boxShadow: on ? '0 1px 3px rgba(15,23,42,0.1)' : 'none',
              })}
            >
              {t.icon && <span style={iconStyle(t, on)}>{t.icon}</span>}
              {t.label}
            </button>
          )
        })}
      </div>
    )
  }

  // pill (default)
  return (
    <div role="tablist" className="s-tabs s-tabs-pill" style={{ display: 'inline-flex', background: 'var(--s-surface2)', borderRadius: 'var(--s-radius-pill)', padding: 4, gap: 2, flexWrap: 'wrap', maxWidth: '100%', ...style }}>
      {tabs.map(t => {
        const on = active === t.id
        return (
          <button key={t.id} role="tab" aria-selected={on} className="s-tab"
            onClick={() => onChange && onChange(t.id)}
            style={shared(t, on, {
              height: compact ? 32 : 42, padding: '0 20px', borderRadius: 'var(--s-radius-pill)',
              background: on ? 'var(--s-primary)' : 'transparent',
              color: on ? '#fff' : 'var(--s-text3)',
            })}
          >
            {t.icon && <span style={iconStyle(t, on)}>{t.icon}</span>}
            {t.label}
          </button>
        )
      })}
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
