import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiAlertCircle, FiXCircle, FiCalendar,
  FiExternalLink, FiArrowRight, FiTarget, FiAward, FiBookOpen
} from 'react-icons/fi'

export default function ExamCard({ exam }) {
  const navigate = useNavigate()

  if (!exam) return null

  // Eligibility Status styling
  const renderEligibilityBadge = () => {
    const status = exam.eligibilityStatus || "ELIGIBLE"
    if (status === "ELIGIBLE") {
      return (
        <span style={{ fontSize: 11.5, fontWeight: 800, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <FiCheckCircle size={12} /> Your profile appears eligible
        </span>
      )
    }
    if (status === "CHECK_REQUIRED") {
      return (
        <span style={{ fontSize: 11.5, fontWeight: 800, background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7', padding: '3px 9px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <FiAlertCircle size={12} /> Eligibility Check Required
        </span>
      )
    }
    return (
      <span style={{ fontSize: 11.5, fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 9px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <FiXCircle size={12} /> Not Currently Eligible
      </span>
    )
  }

  // Application Status styling
  const renderStatusBadge = () => {
    const st = exam.status || "OPEN"
    let bg = '#eff6ff', color = '#2563eb', text = 'OPEN'

    if (st === "CLOSING_SOON") {
      bg = '#fff7ed'; color = '#c2410c'; text = 'CLOSING SOON'
    } else if (st === "UPCOMING") {
      bg = '#f5f3ff'; color = '#7c3aed'; text = 'UPCOMING'
    } else if (st === "CLOSED") {
      bg = '#f1f5f9'; color = '#64748b'; text = 'CLOSED'
    } else if (st === "COMPLETED") {
      bg = '#f8fafc'; color = '#475569'; text = 'COMPLETED'
    } else if (st === "NOT_VERIFIED") {
      bg = '#fffbe0'; color = '#b45309'; text = 'NOT VERIFIED'
    }

    return (
      <span style={{ fontSize: 11, fontWeight: 800, background: bg, color: color, padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Application: {text}
      </span>
    )
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
      padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.2s ease'
    }}>
      <div>
        {/* Top Header badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase' }}>
              🏛 {exam.category}
            </span>
            {exam.subCategory && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                • {exam.subCategory}
              </span>
            )}
          </div>
          {renderStatusBadge()}
        </div>

        {/* Exam Title & Authority */}
        <h3 style={{ margin: '4px 0 4px', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
          {exam.shortName}
        </h3>
        <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 700, marginBottom: 10 }}>
          {exam.conductingOrganization}
        </div>

        {/* Short Description */}
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#475569', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {exam.description}
        </p>

        {/* Match & Eligibility Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
          <div>
            {renderEligibilityBadge()}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiTarget size={14} /> Profile Match: {exam.matchScore || 85}%
          </div>
        </div>
      </div>

      {/* Dates & Actions */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', flexWrap: 'wrap', gap: 8 }}>
          <div>
            Exam Date: <strong style={{ color: '#0f172a' }}>{exam.importantDates?.examDate || 'Verified'}</strong>
          </div>
          {exam.importantDates?.applicationDeadline && (
            <div>
              Deadline: <strong style={{ color: '#dc2626' }}>{exam.importantDates.applicationDeadline}</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => navigate(`/graduate/exams/${exam.examId}`)}
            style={{
              flex: 1, minWidth: 100, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
              padding: '9px 12px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: 'pointer'
            }}
          >
            VIEW EXAM
          </button>

          <button
            onClick={() => navigate(`/graduate/roadmap/${exam.examId}`)}
            style={{
              flex: 1, minWidth: 120, background: '#2563eb', color: '#fff', border: 'none',
              padding: '9px 12px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}
          >
            START PREP <FiArrowRight size={14} />
          </button>

          {exam.applicationUrl && (
            <a
              href={exam.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Official Application Portal"
              style={{
                background: '#10b981', color: '#fff', textDecoration: 'none',
                padding: '9px 12px', borderRadius: 10, fontSize: 12.5, fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', gap: 4
              }}
            >
              APPLY <FiExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
