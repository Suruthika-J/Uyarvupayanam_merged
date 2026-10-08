import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import { FiAward, FiBookOpen, FiCheckCircle, FiExternalLink, FiInfo, FiArrowRight, FiCheck } from 'react-icons/fi'

const TARGET_PROGRAMS = [
  'M.Tech / M.E.',
  'MS (Master of Science)',
  'MCA',
  'MBA / PGDM',
  'M.Sc',
  'PhD / Doctorate',
  'Other Master\'s',
  'International Master\'s'
]

export default function GraduateHigherStudiesPage() {
  const [selectedProgram, setSelectedProgram] = useState('M.Tech / M.E.')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHigherStudiesData = async () => {
    setLoading(true)
    try {
      const res = await graduateService.getHigherStudies()
      if (res?.success) {
        setData(res)
      } else {
        setError('Failed to load higher studies guidance.')
      }
    } catch (err) {
      console.warn('Higher studies fetch error:', err)
      setError('Could not connect to higher studies API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHigherStudiesData()
  }, [])

  const handleApplyNow = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Official entrance / admission portal URL opening soon.')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Analyzing higher study entrance routes for your degree...
        </div>
      </div>
    )
  }

  const degreeCompleted = data?.degree || 'B.E.'
  const applicationFlow = data?.applicationFlow || []
  const entranceExams = data?.entranceExams || []

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          <FiAward size={14} /> POSTGRADUATE & HIGHER STUDIES PORTAL
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Higher Studies & Postgraduate Entrance Routes
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Personalized higher education routes for <strong>{degreeCompleted}</strong> graduates across M.Tech, MS, MBA, MCA, and Research.
        </p>
      </div>

      {/* SECTION 1: WHAT DO YOU WANT TO STUDY? */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 14px' }}>
          🎓 What do you want to study?
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {TARGET_PROGRAMS.map(prog => {
            const isSelected = selectedProgram === prog
            return (
              <button
                key={prog}
                type="button"
                onClick={() => setSelectedProgram(prog)}
                style={{
                  padding: '10px 18px', borderRadius: 14, cursor: 'pointer',
                  border: isSelected ? '2px solid #4338ca' : '1px solid var(--s-border)',
                  background: isSelected ? '#4338ca' : '#fff',
                  color: isSelected ? '#fff' : 'var(--s-text2)',
                  fontSize: 13, fontWeight: isSelected ? 800 : 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {prog}
              </button>
            )
          })}
        </div>
      </SCard>

      {/* SECTION 2: UNIVERSITY ELIGIBILITY DISCLAIMER NOTICE */}
      <div style={{ padding: '14px 20px', borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        <FiInfo size={20} color="#1d4ed8" />
        <div style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 600 }}>
          <strong>Notice:</strong> Eligibility varies by university/program. Verify the official admission notification before applying.
        </div>
      </div>

      {/* SECTION 3: STEP-BY-STEP HIGHER STUDIES APPLICATION FLOW */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 18px' }}>
          🚀 Higher Studies 7-Step Application Process
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {applicationFlow.map((step) => (
            <div key={step.step} style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4338ca', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, marginBottom: 10 }}>
                {step.step}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>{step.title}</div>
              <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4, lineHeight: 1.4 }}>{step.description}</div>
            </div>
          ))}
        </div>
      </SCard>

      {/* SECTION 4: ENTRANCE EXAM CARDS */}
      <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', marginBottom: 16 }}>
        Verified Entrance Exams for {selectedProgram}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 36 }}>
        {entranceExams.map((exam) => (
          <SCard key={exam._id} style={{ padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
                  {exam.opportunityName}
                </span>
                <SBadge color={exam.status === 'OPEN' ? 'green' : 'orange'}>
                  {exam.status || 'UPCOMING'}
                </SBadge>
              </div>

              <div style={{ fontSize: 12.5, color: '#4338ca', fontWeight: 800, marginBottom: 10 }}>
                Target Program: {selectedProgram} ({exam.organization})
              </div>

              <p style={{ fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.5, margin: '0 0 14px' }}>
                {exam.description}
              </p>

              <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)', marginBottom: 16, fontSize: 12 }}>
                <div><strong>Suitable for:</strong> {(exam.eligibleDegrees || ['Graduates']).join(', ')}</div>
                <div style={{ marginTop: 4 }}><strong>Application Mode:</strong> {exam.applicationMode || 'Online'}</div>
                <div style={{ marginTop: 4 }}><strong>Official Link:</strong> <a href={exam.officialWebsite} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{exam.officialWebsite}</a></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
              <Link to={`/graduate/opportunities/${exam._id}`} style={{ flex: 1 }}>
                <SBtn variant="secondary" style={{ width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 12 }}>
                  View Eligibility
                </SBtn>
              </Link>
              <Link to="/graduate/roadmap" style={{ flex: 1 }}>
                <SBtn variant="secondary" style={{ width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 12 }}>
                  View Syllabus
                </SBtn>
              </Link>
              <SBtn
                variant="primary"
                onClick={() => handleApplyNow(exam.applicationUrl)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                Apply <FiExternalLink size={12} />
              </SBtn>
            </div>
          </SCard>
        ))}
      </div>

    </div>
  )
}
