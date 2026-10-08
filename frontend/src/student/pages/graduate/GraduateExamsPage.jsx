import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import { FiBook, FiCheckCircle, FiExternalLink, FiCalendar, FiShield, FiAlertCircle, FiArrowRight } from 'react-icons/fi'

export default function GraduateExamsPage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await graduateService.getGovernmentExams()
      if (res?.success) {
        setExams(res.exams || [])
      } else {
        setError('Failed to load government examinations.')
      }
    } catch (err) {
      console.warn('Exams fetch error:', err)
      setError('Could not connect to government exams API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleApplyNow = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Official application URL unavailable or opening soon.')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Loading verified government examinations & PSU recruitments...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          <FiBook size={14} /> GOVERNMENT EXAMS & PUBLIC RECRUITMENT
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Relevant Government Examinations
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Personalized graduate-level government recruitments, SSC, UPSC, State PSC & PSU executive notifications.
        </p>
      </div>

      {error && (
        <div style={{ padding: 16, borderRadius: 14, background: '#fef2f2', color: '#dc2626', marginBottom: 24, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* EXAMS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {exams.map((exam) => {
          const evalRes = exam.eligibilityEvaluation || {}
          const isEligible = evalRes.eligible !== false

          return (
            <SCard key={exam._id} style={{ padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* CARD TOP BADGES */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
                    {exam.opportunityName}
                  </span>
                  <SBadge color={exam.status === 'OPEN' ? 'green' : 'orange'}>
                    {exam.status || 'OPEN'}
                  </SBadge>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 12 }}>
                  🏛 {exam.organization}
                </div>

                {/* ELIGIBILITY STATUS */}
                <div style={{ padding: 12, borderRadius: 12, background: isEligible ? '#f0fdf4' : '#fffbe6', border: `1px solid ${isEligible ? '#bbf7d0' : '#ffe58f'}`, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: isEligible ? '#15803d' : '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isEligible ? '✓ Appears Eligible' : '⚠️ Check Specific Notification Criteria'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s-text2)', marginTop: 4 }}>
                    <strong>Stated Qualification:</strong> {exam.eligibility || 'Graduate Degree'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4, fontStyle: 'italic' }}>
                    <strong>Why this is shown:</strong> "{evalRes.reasons?.[0] || 'Your graduate degree satisfies the stated graduation requirement.'}"
                  </div>
                </div>

                {/* DATES & MODE */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: 'var(--s-text2)', marginBottom: 16 }}>
                  <div>
                    <span style={{ color: 'var(--s-text3)' }}>Application Mode:</span><br />
                    <strong>{exam.applicationMode || 'Online'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--s-text3)' }}>Verification Status:</span><br />
                    <strong style={{ color: '#047857' }}>✓ Verified Official</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--s-text3)' }}>Application Deadline:</span><br />
                    <strong>{exam.applicationDeadline ? new Date(exam.applicationDeadline).toLocaleDateString('en-IN') : 'TBA'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--s-text3)' }}>Exam Date:</span><br />
                    <strong>{exam.examDate ? new Date(exam.examDate).toLocaleDateString('en-IN') : 'As notified'}</strong>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                <Link to={`/graduate/opportunities/${exam._id}`} style={{ flex: 1 }}>
                  <SBtn variant="secondary" style={{ width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 13 }}>
                    View Details
                  </SBtn>
                </Link>
                <SBtn
                  variant="primary"
                  onClick={() => handleApplyNow(exam.applicationUrl)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  Apply Now <FiExternalLink size={13} />
                </SBtn>
              </div>

            </SCard>
          )
        })}
      </div>

    </div>
  )
}
