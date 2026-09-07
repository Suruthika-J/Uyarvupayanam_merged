import React from 'react'
import { FiInfo } from 'react-icons/fi'
import { eligibilityBanner } from '../utils/schoolEligibility'

// Shows a small info banner when a school student's course/college list is
// scoped to their academic level. Renders nothing for guests, graduates,
// college students and admins.
export default function EligibilityBanner({ student, style, compact }) {
  const banner = eligibilityBanner(student)
  if (!banner) return null

  return (
    <div
      data-testid="eligibility-banner"
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: 14,
        padding: compact ? '10px 14px' : '14px 18px',
        margin: '0 0 20px',
        ...style,
      }}
    >
      <span style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 2 }}>
        <FiInfo size={18} />
      </span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: '#1e3a8a' }}>{banner.title}</div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{banner.desc}</div>
      </div>
    </div>
  )
}