import React, { useState, useEffect } from 'react'
import { SCard, SSelect, SBtn, SBadge, SLoader } from '../../components/ui'
import {
  FiSliders, FiCheck, FiBookOpen, FiAward, FiTarget,
  FiZap, FiTrendingUp, FiLayers, FiAlertCircle, FiArrowRight
} from 'react-icons/fi'
import axiosInstance from '../../../config/axios'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'
import { useNavigate } from 'react-router-dom'

export default function CareerComparisonPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const { studentContext } = useStudentContext()

  const [availableCareers, setAvailableCareers] = useState([])
  const [slug1, setSlug1] = useState('software-engineer')
  const [slug2, setSlug2] = useState('data-scientist')
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState('')
  // True when the recommendations engine returned nothing and we fall back to the
  // generic career catalog for the selector — surfaced in the UI so it is never
  // mistaken for profile-matched choices.
  const [usingCatalogFallback, setUsingCatalogFallback] = useState(false)

  // 1. Fetch available careers
  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get('/college-advisor/recommendations')
        if (res.data?.success && Array.isArray(res.data.recommendations) && res.data.recommendations.length > 0) {
          const mapped = res.data.recommendations.map(r => ({
            value: r.slug,
            label: `${r.title} (${r.category || 'General'})`,
            slug: r.slug,
            title: r.title
          }))
          setAvailableCareers(mapped)
          setUsingCatalogFallback(false)
          if (mapped[0]) setSlug1(mapped[0].value)
          if (mapped[1]) setSlug2(mapped[1].value)
        } else {
          // Fallback options matching DB seed — labeled in the UI as catalog, so
          // they are never mistaken for profile-matched recommendations.
          const fallback = [
            { value: 'software-engineer', label: 'Software Engineer' },
            { value: 'data-scientist', label: 'Data Scientist' },
            { value: 'machine-learning-engineer', label: 'Machine Learning Engineer' },
            { value: 'robotics-engineer', label: 'Robotics Engineer' },
            { value: 'mechanical-engineer', label: 'Mechanical Engineer' },
            { value: 'electrical-engineer', label: 'Electrical Engineer' },
            { value: 'civil-engineer', label: 'Civil Engineer' },
            { value: 'biomedical-engineer', label: 'Biomedical Engineer' }
          ]
          setAvailableCareers(fallback)
          setUsingCatalogFallback(true)
        }
      } catch (err) {
        console.warn('Failed to load career options:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCareers()
  }, [])

  // 2. Fetch side-by-side comparison
  const fetchComparison = async (s1, s2) => {
    if (!s1 || !s2) return
    setComparing(true)
    setError('')
    try {
      const res = await axiosInstance.post('/college-advisor/compare', {
        slugs: [s1, s2]
      })
      if (res.data?.success && Array.isArray(res.data.comparison)) {
        setComparison(res.data.comparison)
      } else {
        setError('Comparison data not available for selected roles.')
      }
    } catch (err) {
      console.warn('Failed to compare careers:', err)
      setError('Could not connect to career comparison engine.')
    } finally {
      setComparing(false)
    }
  }

  useEffect(() => {
    if (slug1 && slug2) {
      fetchComparison(slug1, slug2)
    }
  }, [slug1, slug2])

  if (loading) {
    return (
      <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SLoader />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }} className="s-anim-up">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiSliders size={14} /> Telemetry-Aware Evaluation
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Career Options Comparison
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Compare qualifications, skills matching your profile, salary outlook, and actionable skill gaps side-by-side.
          </p>
          {usingCatalogFallback && (
            <p style={{ fontSize: 12, color: '#b45309', margin: '8px 0 0', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px' }}>
              Your career recommendations are not available right now, so the selector shows the general career catalog. Comparison data is still fetched live.
            </p>
          )}
        </div>

        <SBtn variant="secondary" onClick={() => navigate('/college/career/skill-gap')} style={{ borderRadius: 12 }}>
          <FiZap size={14} style={{ marginRight: 6 }} /> My Skill Gap Matrix
        </SBtn>
      </div>

      {/* Selectors */}
      <SCard style={{ padding: 22, borderRadius: 20, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="s-grid-1col">
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
              Career Role 1
            </label>
            <SSelect
              value={slug1}
              onChange={e => setSlug1(e.target.value)}
              options={availableCareers}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
              Career Role 2
            </label>
            <SSelect
              value={slug2}
              onChange={e => setSlug2(e.target.value)}
              options={availableCareers}
            />
          </div>
        </div>
      </SCard>

      {error && (
        <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c', marginBottom: 20, fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {comparing && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SLoader />
          <p style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 12 }}>Comparing profiles & skill sets...</p>
        </div>
      )}

      {/* Side-by-side Cards */}
      {!comparing && comparison.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
          {comparison.map((data, idx) => {
            const matchScore = data.matchPercentage || 70
            const isHighMatch = matchScore >= 75

            return (
              <SCard key={data.id || idx} style={{ padding: 30, borderRadius: 22, border: '1px solid var(--s-border)', position: 'relative' }}>
                {/* Header Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {data.category || 'Specialized Domain'}
                    </span>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '4px 0 0', fontFamily: 'var(--s-font-display)' }}>
                      {data.title}
                    </h2>
                  </div>

                  {data.matchPercentage !== null && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: isHighMatch ? '#d1fae5' : '#fef3c7',
                        color: isHighMatch ? '#047857' : '#b45309',
                        padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 900
                      }}>
                        <FiTarget size={13} /> {matchScore}% Match
                      </span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.6, margin: '0 0 20px' }}>
                  {data.roleDescription || data.shortDescription}
                </p>

                {/* Why it fits student */}
                {data.whyFits && data.whyFits.length > 0 && (
                  <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCheck size={14} /> Profile Match Insight
                    </div>
                    {data.whyFits.map((w, wIdx) => (
                      <div key={wIdx} style={{ fontSize: 12, color: '#15803d', margin: '2px 0' }}>
                        • {w}
                      </div>
                    ))}
                  </div>
                )}

                {/* Matched Skills */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    ✅ Your Matched Skills ({data.matchedSkills?.length || 0})
                  </div>
                  {data.matchedSkills && data.matchedSkills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {data.matchedSkills.map((s, sIdx) => (
                        <span key={sIdx} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#d1fae5', color: '#047857', fontWeight: 800 }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--s-text3)', fontStyle: 'italic' }}>No skills matched yet from your profile</span>
                  )}
                </div>

                {/* Skill Gaps */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    ⚠️ Skill Gaps to Bridge ({data.skillGaps?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(data.skillGaps || data.requiredSkills || []).slice(0, 5).map((s, sIdx) => (
                      <span key={sIdx} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#fffbeb', color: '#b45309', fontWeight: 700, border: '1px solid #fde68a' }}>
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Typical Work Area & Sectors */}
                {data.typicalWorkArea && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Work Scope & Sectors
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text)' }}>
                      {data.typicalWorkArea}
                    </div>
                    {data.workSectors?.length > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>
                        Sectors: {data.workSectors.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Related Degrees */}
                {data.relatedDegrees?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Eligible Degrees
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--s-text2)', fontWeight: 600 }}>
                      {data.relatedDegrees.slice(0, 3).join(', ')}
                    </div>
                  </div>
                )}

                {/* Growth Outlook */}
                {data.growthOutlook && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Industry Growth & Demand
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiTrendingUp size={14} /> {data.growthOutlook}
                    </div>
                  </div>
                )}

                {/* Action CTA */}
                <div style={{ paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/college/career/skill-gap')}
                    style={{
                      width: '100%', padding: '10px 16px', borderRadius: 12,
                      background: 'var(--s-primaryLight)', color: 'var(--s-primary)',
                      border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    View Skill Roadmap <FiArrowRight size={14} />
                  </button>
                </div>
              </SCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
