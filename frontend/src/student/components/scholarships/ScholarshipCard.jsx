import React from 'react'
import { FiHeart, FiBookmark, FiBriefcase } from 'react-icons/fi'
import { SBtn, SBadge } from '../ui'

// The one scholarship card used by every class page.
//
// It was originally written inline inside the Class 5 Scholarships tab and is
// the design reference for the whole student area: rounded white panel, green
// "Scholarship" badge plus a purple grade badge, a bookmark/heart toggle in the
// top-right, a muted detail block (Benefit / Eligibility / Last Date) and a
// full-width outlined "Apply / View Details" action.
//
// Extracted so the Class 10 tab renders through exactly the same markup instead
// of a second, slightly different card. Styling is deliberately kept inline (as
// it always was) so the two pages cannot drift apart again.

// Apply action colour. Blue here to match the Class 5 page exactly.
const APPLY_COLOR = '#3b82f6'

// Shown in place of a value that the source data genuinely does not contain.
// We never invent scholarship facts; we only say plainly that we don't have one.
const NOT_AVAILABLE = 'Information not available'

const LABEL = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 4,
}

// One labelled detail row. `value` is either the real data or an explicit
// "Information not available", styled muted so a genuine gap in the data reads
// as a gap rather than looking like a real value.
//
// Multi-line values (PM-YASASVI's bullet-point eligibility) render as a bulleted
// list. The list reuses the exact same computed style as a single-line value, so
// a bulleted row is typographically identical to Vidyadhan's plain one — the
// bullets are a content difference, never a styling difference.
function DetailRow({ label, value, variant, marginBottom }) {
  const style =
    variant === 'benefit'
      ? { fontSize: 15, fontWeight: 800, color: '#10b981' }
      : variant === 'deadline'
        ? { fontSize: 13, fontWeight: 700, color: '#ef4444' }
        : { fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.5 }

  if (!value) {
    return (
      <div style={{ marginBottom }}>
        <div style={LABEL}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', fontStyle: 'italic' }}>
          {NOT_AVAILABLE}
        </div>
      </div>
    )
  }

  const lines = value.split('\n').map((l) => l.trim()).filter(Boolean)

  return (
    <div style={{ marginBottom }}>
      <div style={LABEL}>{label}</div>
      {lines.length > 1 ? (
        <ul style={{ ...style, margin: 0, paddingLeft: 18 }}>
          {lines.map((line, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{line.replace(/^[-•]\s*/, '')}</li>
          ))}
        </ul>
      ) : (
        <div style={style}>{value}</div>
      )}
    </div>
  )
}

export default function ScholarshipCard({
  item,
  saved,
  onToggleSave,
  onApply,
  // Opt-in. When set, every card renders the full fixed layout — provider plus
  // all three detail rows — so a grid of cards lines up instead of mixing tall
  // complete cards with short bare ones. Class 5 leaves this off and keeps its
  // original "only show rows that have data" behaviour.
  alwaysShowFields = false,
}) {
  const name = item.scholarshipName || item.title || ''
  const provider = item.provider || ''
  const grades = Array.isArray(item.grades) ? item.grades : item.targetClass ? [].concat(item.targetClass) : []

  const benefit = item.benefit || ''
  const eligibility = item.eligibility || ''
  const deadline = item.deadline || ''

  const hasDetail = Boolean(benefit || eligibility || deadline)
  const showDetail = alwaysShowFields || hasDetail
  const showProvider = Boolean(provider) || alwaysShowFields

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 32,
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)',
        transition: '0.3s',
      }}
      className="hover-lift"
    >
      <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <button
          onClick={() => onToggleSave(item)}
          aria-label={saved ? 'Unsave scholarship' : 'Save scholarship'}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: 99,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            color: saved ? '#ef4444' : '#64748b',
            transition: 'all 0.2s',
          }}
        >
          {saved ? <FiHeart size={20} fill="#ef4444" /> : <FiBookmark size={20} />}
        </button>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', paddingRight: 50 }}>
          <SBadge color="green">Scholarship</SBadge>
          {grades.map((g) => (
            <SBadge key={g} color="purple">{g}</SBadge>
          ))}
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.3 }}>
          {name}
        </h3>
        {showProvider ? (
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: provider ? '#64748b' : '#94a3b8',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiBriefcase size={14} /> {provider || NOT_AVAILABLE}
          </div>
        ) : null}

        {showDetail ? (
          // Default (Class 5): the panel grows so the button sits at the card
          // foot. With alwaysShowFields the panel instead hugs its three rows and
          // a spacer below absorbs the slack — the grey block then never reads as
          // a hollow empty box on a card whose neighbour is taller.
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              flex: alwaysShowFields ? 0 : 1,
            }}
          >
            <DetailRow label="Benefit" value={benefit} variant="benefit" marginBottom={12} />
            <DetailRow label="Eligibility" value={eligibility} variant="eligibility" marginBottom={12} />
            {/* Optional extra guidance. Rendered with the same label + body
                typography as the rows above and given no separate coloured
                treatment, so a card carrying a note still matches the cards
                that don't. */}
            {item.importantNote ? (
              <div style={{ marginBottom: 12 }}>
                <div style={LABEL}>Note</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.5 }}>
                  {item.importantNote}
                </div>
              </div>
            ) : null}
            <DetailRow label="Last Date" value={deadline} variant="deadline" marginBottom={0} />
          </div>
        ) : null}

        {alwaysShowFields && showDetail ? <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" /> : null}

        <SBtn
          variant="outline"
          style={{
            width: '100%',
            borderRadius: 16,
            padding: '14px 0',
            border: `2px solid ${APPLY_COLOR}`,
            color: APPLY_COLOR,
            marginTop: !showDetail ? 'auto' : 0,
          }}
          onClick={() => onApply(item)}
        >
          Apply / View Details ↗
        </SBtn>
      </div>
    </div>
  )
}
