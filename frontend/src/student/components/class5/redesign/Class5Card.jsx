import React from 'react'
import { C5, worldColor } from './class5Theme'
import { SBadge } from '../../ui'

// Standard card: photo header (or gradient + icon block), tag pills,
// oneLiner chip, then title + description + full-width navy CTA button.
// The oneLiner chip is the "why it matters" callback every card repeats.
export default function Class5Card({
  title,
  tag = 'Skill',
  tagColor = 'blue',
  description,
  oneLiner,
  icon: Icon,
  gradient,
  imageUrl,
  cta = 'Start',
  ctaIcon: CtaIcon,
  onClick,
  footer,
  style = {},
}) {
  const showPhoto = Boolean(imageUrl)
  return (
    <div
      className="c5-card hover-lift"
      style={{
        background: C5.bg,
        borderRadius: C5.radiusLg,
        border: `1px solid ${C5.line}`,
        boxShadow: C5.shadow,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style,
      }}
    >
      {showPhoto ? (
        <div
          role="presentation"
          aria-hidden="true"
          style={{
            height: 96,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <div
          role="presentation"
          aria-hidden="true"
          style={{
            background: gradient || `linear-gradient(135deg, ${worldColor(tagColor)} 0%, ${C5.navy} 100%)`,
            padding: '22px 24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
          }}
        >
          {Icon && (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.22)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={28} strokeWidth={2.2} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            {oneLiner && (
              <span
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255,255,255,0.24)',
                  color: '#fff',
                  padding: '3px 10px',
                  borderRadius: 99,
                  fontSize: 11.5,
                  fontWeight: 700,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {oneLiner}
              </span>
            )}
            <span
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: worldColor(tagColor),
                alignSelf: 'flex-start',
                padding: '2px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {tag}
            </span>
          </div>
        </div>
      )}

      <div style={{ padding: '18px 22px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C5.ink, letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <p style={{ color: C5.muted, fontSize: 13.5, lineHeight: 1.6, margin: '8px 0 16px', flex: 1 }}>
          {description}
        </p>
        {footer}
        <button
          onClick={onClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            background: C5.navy,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 8px 16px -8px rgba(15,76,117,0.5)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C5.navyDeep)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C5.navy)}
        >
          {CtaIcon ? <CtaIcon size={16} /> : null}
          {cta}
        </button>
      </div>
    </div>
  )
}

export function TagPill({ label, color = 'blue' }) {
  return <SBadge color={color}>{label}</SBadge>
}