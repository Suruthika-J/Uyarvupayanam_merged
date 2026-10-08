import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import { FiExternalLink, FiCheckCircle, FiClock, FiShield, FiBookmark, FiArrowRight, FiBookOpen, FiAlertCircle } from 'react-icons/fi'

export default function GraduateOpportunityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [oppData, setOppData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingApp, setAddingApp] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)

  const fetchOpportunityDetails = async () => {
    setLoading(true)
    try {
      const res = await graduateService.getOpportunityById(id)
      if (res?.success) {
        setOppData(res.opportunity)
        if (res.opportunity.existingApplication) {
          setAddedSuccess(true)
        }
      } else {
        setError('Opportunity details not found.')
      }
    } catch (err) {
      console.warn('Fetch opportunity detail error:', err)
      setError('Could not load opportunity details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunityDetails()
  }, [id])

  const handleApplyNow = () => {
    const url = oppData?.applicationUrl || oppData?.officialWebsite
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Official portal link is currently being updated.')
    }
  }

  const handleAddToApplications = async () => {
    setAddingApp(true)
    try {
      const res = await graduateService.saveApplication({
        opportunityId: id,
        status: 'PLANNING',
        notes: 'Added from Opportunity Details Page'
      })
      if (res?.success) {
        setAddedSuccess(true)
      }
    } catch (err) {
      alert('Failed to add to My Applications.')
    } finally {
      setAddingApp(false)
    }
  }

  const handleSetReminder = async () => {
    try {
      const res = await graduateService.setReminder(id)
      if (res?.success) {
        alert(res.message || 'Deadline reminder set!')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set deadline reminder.')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Evaluating deterministic eligibility and loading official notification details...
        </div>
      </div>
    )
  }

  if (error || !oppData) {
    return (
      <SCard style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)' }}>{error || 'Opportunity Not Found'}</h3>
        <Link to="/graduate/opportunities" style={{ marginTop: 16, display: 'inline-block' }}>
          <SBtn variant="primary">Back to Opportunities</SBtn>
        </Link>
      </SCard>
    )
  }

  const evalRes = oppData.eligibilityEvaluation || {}
  const isEligible = evalRes.eligible !== false

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER CARD */}
      <SCard style={{ padding: 32, borderRadius: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SBadge color={isEligible ? 'green' : 'orange'}>
                {isEligible ? '✓ Appears Eligible' : 'Check Requirements'}
              </SBadge>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '4px 12px', borderRadius: 12 }}>
                {oppData.matchScore || 90}% Match Score
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--s-text)', margin: '0 0 6px', fontFamily: 'var(--s-font-display)' }}>
              {oppData.opportunityName}
            </h1>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>
              🏛 {oppData.organization}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <SBtn variant="secondary" onClick={handleSetReminder} style={{ borderRadius: 12, fontSize: 13 }}>
              ⏰ Remind Me
            </SBtn>
            <SBtn variant="primary" onClick={handleApplyNow} style={{ borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              Apply Now <FiExternalLink size={14} />
            </SBtn>
          </div>
        </div>

        <p style={{ fontSize: 14.5, color: 'var(--s-text2)', lineHeight: 1.6, margin: '16px 0 0' }}>
          {oppData.description}
        </p>
      </SCard>

      {/* DETAILED ELIGIBILITY BREAKDOWN */}
      <SCard style={{ padding: 28, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiShield color="#2563eb" size={20} /> Eligibility Analysis Breakdown
        </h3>

        <div style={{ padding: 16, borderRadius: 14, background: isEligible ? '#f0fdf4' : '#fffbe6', border: `1px solid ${isEligible ? '#bbf7d0' : '#ffe58f'}`, marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: isEligible ? '#15803d' : '#b45309' }}>
            {isEligible ? '✓ You Appear Fully Eligible for this Opportunity' : '⚠️ Additional Specific Criteria Required'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--s-text2)', marginTop: 6 }}>
            <strong>Stated Eligibility:</strong> {oppData.eligibility}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13, color: 'var(--s-text2)' }} className="s-grid-2col">
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <strong>Eligible Degrees:</strong><br />
            {(oppData.eligibleDegrees || ['Graduate Degree']).join(', ')}
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <strong>Minimum Qualification:</strong><br />
            {oppData.minimumQualification || 'Graduation'}
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <strong>Age Limit / Criteria:</strong><br />
            {oppData.ageRequirement?.description || 'As per official rules'}
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <strong>Experience Required:</strong><br />
            {oppData.experienceRequirement || 'Freshers Eligible'}
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: 4 }}>
            Why Recommended:
          </div>
          <div style={{ fontSize: 13, color: '#1e3a8a', fontStyle: 'italic' }}>
            "{evalRes.reasons?.[0] || oppData.whyRecommendedDefault || 'Your degree matches the minimum criteria.'}"
          </div>
        </div>
      </SCard>

      {/* DATES & OFFICIAL SOURCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }} className="s-grid-2col">
        
        {/* IMPORTANT DATES */}
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 14px' }}>
            📅 Important Dates
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div>Application Start: <strong>{oppData.applicationStartDate ? new Date(oppData.applicationStartDate).toLocaleDateString('en-IN') : 'Open'}</strong></div>
            <div>Application Deadline: <strong style={{ color: '#dc2626' }}>{oppData.applicationDeadline ? new Date(oppData.applicationDeadline).toLocaleDateString('en-IN') : 'Closing Soon'}</strong></div>
            <div>Exam Date: <strong>{oppData.examDate ? new Date(oppData.examDate).toLocaleDateString('en-IN') : 'As notified'}</strong></div>
          </div>
        </SCard>

        {/* OFFICIAL SOURCE */}
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 14px' }}>
            🌐 Official Source Metadata
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div>Source Portal: <strong>{oppData.source}</strong></div>
            <div>Source Type: <strong style={{ color: '#047857' }}>{oppData.sourceType || 'Official Portal'}</strong></div>
            <div>Last Verified: <strong>{oppData.lastVerifiedAt ? new Date(oppData.lastVerifiedAt).toLocaleDateString('en-IN') : 'Recently Verified'}</strong></div>
            <div>Official Portal URL: <a href={oppData.officialWebsite} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{oppData.officialWebsite}</a></div>
          </div>
        </SCard>

      </div>

      {/* ACTION FOOTER */}
      <SCard style={{ padding: 24, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>Ready to apply or prepare?</div>
          <div style={{ fontSize: 13, color: 'var(--s-text3)' }}>Track your progress or open the official application portal directly.</div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={handleAddToApplications}
            disabled={addingApp || addedSuccess}
            style={{
              padding: '10px 20px', borderRadius: 12, border: '1px solid var(--s-border)',
              background: addedSuccess ? '#dcfce7' : '#fff',
              color: addedSuccess ? '#15803d' : 'var(--s-text)',
              fontSize: 13, fontWeight: 800, cursor: 'pointer'
            }}
          >
            {addedSuccess ? '✓ Added to My Applications' : 'Add to My Applications'}
          </button>

          <Link to="/graduate/roadmap">
            <SBtn variant="secondary" style={{ padding: '10px 20px', borderRadius: 12, fontSize: 13 }}>
              Prepare Roadmap
            </SBtn>
          </Link>

          <SBtn variant="primary" onClick={handleApplyNow} style={{ padding: '10px 24px', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            Apply Now <FiExternalLink size={14} />
          </SBtn>
        </div>
      </SCard>

    </div>
  )
}
