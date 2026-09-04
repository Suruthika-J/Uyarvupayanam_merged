import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SCard, SAlert, SBadge, SLoader } from '../../components/ui'
import {
  FiAward, FiCheckCircle, FiAlertCircle, FiRefreshCw,
  FiBookOpen, FiZap, FiArrowRight, FiCheck, FiX,
  FiSliders, FiTrendingUp, FiTarget, FiLayers, FiCompass,
  FiBriefcase, FiCode, FiHelpCircle
} from 'react-icons/fi'

export default function CollegeAdvisorDashboardPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileSummary, setProfileSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [targetCareer, setTargetCareer] = useState('')
  const [settingTarget, setSettingTarget] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')

  // Career Comparison state
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [comparing, setComparing] = useState(false)
  const [comparisonData, setComparisonData] = useState([])
  const [loadingCompare, setLoadingCompare] = useState(false)

  // Career Details Modal state
  const [detailCareer, setDetailCareer] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchAdvisorData = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.get('http://localhost:5000/api/college-advisor/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data?.success) {
        setProfileSummary(res.data.profileSummary)
        setRecommendations(res.data.recommendations || [])
        setTargetCareer(res.data.targetCareer || res.data.profileSummary?.targetCareer || '')
      } else {
        setError(res.data?.message || 'Failed to fetch recommendations.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to Academic Advisor engine.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvisorData()
  }, [])

  const handleSetTargetCareer = async (careerTitle) => {
    setSettingTarget(careerTitle)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/college-advisor/target-career',
        { targetCareer: careerTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success) {
        setTargetCareer(careerTitle)
      }
    } catch (err) {
      alert('Failed to set target career.')
    } finally {
      setSettingTarget('')
    }
  }

  const handleOpenCareerDetails = async (slug) => {
    setLoadingDetail(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.get(`http://localhost:5000/api/college-advisor/career/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success) {
        setDetailCareer(res.data.career)
      }
    } catch (err) {
      alert('Failed to fetch full career details.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const toggleCompare = (slug) => {
    setSelectedForCompare(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug)
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 careers simultaneously.')
        return prev
      }
      return [...prev, slug]
    })
  }

  const handleOpenComparison = async () => {
    if (selectedForCompare.length < 2) {
      alert('Please select at least 2 careers to perform a side-by-side comparison.')
      return
    }
    setLoadingCompare(true)
    setComparing(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/college-advisor/compare',
        { slugs: selectedForCompare },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success) {
        setComparisonData(res.data.comparison)
      }
    } catch (err) {
      alert('Failed to load comparison data.')
    } finally {
      setLoadingCompare(false)
    }
  }

  const filteredRecommendations = recommendations.filter(r => {
    if (filterCategory === 'BEST') return r.matchCategory === 'Best Match'
    if (filterCategory === 'STRONG') return r.matchCategory === 'Strong Match'
    if (filterCategory === 'GOOD') return r.matchCategory === 'Good Match'
    if (filterCategory === 'EXPLORE') return r.matchCategory === 'Worth Exploring' || r.matchCategory === 'Potential Match'
    return true
  })

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <SLoader />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--s-text3)' }}>
          Evaluating multi-dimensional profile parameters & computing transparent career match scores...
        </div>
      </div>
    )
  }

  return (
    <div className="student-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '30px 20px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── PROFILE & TARGET SUMMARY BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff', padding: '32px 36px', borderRadius: 24,
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)', marginBottom: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                <FiCompass size={14} /> College Intelligent Career Recommendation Engine
              </div>
              <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', color: '#fff', margin: '0 0 8px' }}>
                Academic & Career Recommendations
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 650, margin: 0, lineHeight: 1.5 }}>
                Transparent 6-dimensional scoring evaluation based on academic relevance, core skills, analytical assessment performance, active projects, and career preferences.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              {targetCareer && (
                <div style={{ background: 'rgba(4, 120, 87, 0.25)', border: '1px solid #10b981', color: '#34d399', padding: '8px 16px', borderRadius: 16, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiTarget size={16} /> Target Career: <span>{targetCareer}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate('/student/onboarding/college')}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', padding: '8px 16px', borderRadius: 14, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <FiRefreshCw size={13} /> Update Profile Data
              </button>
            </div>
          </div>

          {/* Profile Attribute Bar */}
          {profileSummary && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Degree & Branch</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>{profileSummary.degreeProgramme}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Domain Field</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{profileSummary.domain || profileSummary.field}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Specialization</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#34d399', marginTop: 2 }}>{profileSummary.specialization || 'General Focus'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Acquired Skills</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 2 }}>{profileSummary.skills?.length || 0} Skills Logged</div>
              </div>
            </div>
          )}
        </div>

        {error && <SAlert type="error" style={{ marginBottom: 24 }}>{error}</SAlert>}

        {/* ── ACTION & FILTER CONTROLS ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Matches (${recommendations.length})` },
              { id: 'BEST', label: '🌟 Best Match (≥90%)' },
              { id: 'STRONG', label: '🚀 Strong Match (80-89%)' },
              { id: 'GOOD', label: '👍 Good Match (70-79%)' },
              { id: 'EXPLORE', label: '🔍 Worth Exploring' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 800,
                  border: filterCategory === tab.id ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: filterCategory === tab.id ? 'var(--s-primary)' : '#fff',
                  color: filterCategory === tab.id ? '#fff' : 'var(--s-text2)',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Comparison Trigger Button */}
          {selectedForCompare.length > 0 && (
            <SBtn variant="primary" onClick={handleOpenComparison} style={{ padding: '8px 20px', borderRadius: 14 }}>
              Compare ({selectedForCompare.length}) Careers <FiArrowRight style={{ marginLeft: 6 }} />
            </SBtn>
          )}
        </div>

        {/* ── RECOMMENDATIONS CARDS LIST ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filteredRecommendations.map((rec) => {
            const isTarget = targetCareer === rec.title
            const isSelected = selectedForCompare.includes(rec.slug)

            return (
              <SCard key={rec.slug} style={{
                padding: '30px 34px', borderRadius: 24,
                boxShadow: isTarget ? '0 8px 30px rgba(4, 120, 87, 0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
                border: isTarget ? '2px solid #10b981' : '1px solid var(--s-border)'
              }} className="s-anim-up">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                        {rec.title}
                      </h3>
                      {isTarget && (
                        <span style={{ background: '#d1fae5', color: '#047857', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiCheckCircle size={12} /> My Target Career
                        </span>
                      )}
                      <SBadge color={rec.matchPercentage >= 90 ? 'green' : rec.matchPercentage >= 80 ? 'blue' : 'gray'}>
                        {rec.category}
                      </SBadge>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0, maxWidth: 720 }}>
                      {rec.shortDescription}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: rec.matchPercentage >= 90 ? '#d1fae5' : rec.matchPercentage >= 80 ? '#dbeafe' : '#f1f5f9',
                      color: rec.matchPercentage >= 90 ? '#047857' : rec.matchPercentage >= 80 ? '#1e40af' : '#475569',
                      padding: '8px 18px', borderRadius: 20, fontSize: 16, fontWeight: 900
                    }}>
                      <FiZap size={16} /> {rec.title} — {rec.matchPercentage}%
                    </div>

                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompare(rec.slug)}
                        style={{ accentColor: 'var(--s-primary)', width: 15, height: 15 }}
                      />
                      Select for Compare
                    </label>
                  </div>
                </div>

                {/* EXPLANATIONS GRID: Why this career fits vs Skills to improve */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="s-grid-2col">

                  {/* Why this career fits */}
                  <div style={{ background: '#f0fdf4', borderLeft: '4px solid #047857', padding: '16px 20px', borderRadius: '0 14px 14px 0' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#047857', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCheckCircle size={14} /> Why this career fits:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(rec.whyFits || []).map((fit, idx) => (
                        <div key={idx} style={{ fontSize: 13, color: '#064e3b', fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#047857', fontWeight: 900 }}>✓</span> {fit}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills to improve */}
                  <div style={{ background: '#fffbeb', borderLeft: '4px solid #b45309', padding: '16px 20px', borderRadius: '0 14px 14px 0' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#b45309', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiAlertCircle size={14} /> Skills to improve:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(rec.skillsToImprove || []).length > 0 ? rec.skillsToImprove.map((sg, idx) => (
                        <span key={idx} style={{ fontSize: 12, fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 10 }}>
                          △ {sg}
                        </span>
                      )) : (
                        <span style={{ fontSize: 13, color: '#047857', fontWeight: 700 }}>✓ Core skills strongly aligned!</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* BOTTOM FOOTER ACTIONS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {!isTarget ? (
                      <button
                        type="button"
                        onClick={() => handleSetTargetCareer(rec.title)}
                        disabled={settingTarget === rec.title}
                        style={{
                          background: '#047857', color: '#fff', border: 'none',
                          padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <FiTarget size={14} /> {settingTarget === rec.title ? 'Setting Target...' : 'Set as My Target Career'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/college/career/skill-gap')}
                        style={{
                          background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                          padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <FiZap size={14} /> View Skill Gap Analysis <FiArrowRight size={12} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenCareerDetails(rec.slug)}
                      style={{
                        background: 'var(--s-surface2)', color: 'var(--s-text)', border: '1px solid var(--s-border)',
                        padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <FiBookOpen size={14} /> View Full Details & Roadmap
                    </button>
                  </div>

                  <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>
                    Outlook: {rec.growthOutlook}
                  </span>
                </div>

              </SCard>
            )
          })}
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* FULL CAREER DETAILS MODAL                                   */}
        {/* ──────────────────────────────────────────────────────────── */}
        {detailCareer && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20
          }}>
            <div style={{
              background: '#fff', width: '100%', maxWidth: 950, maxHeight: '90vh',
              borderRadius: 24, padding: 32, overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)', textTransform: 'uppercase' }}>
                    {detailCareer.category} Career Path Guide
                  </span>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: '4px 0 0' }}>
                    {detailCareer.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailCareer(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)' }}
                >
                  <FiX size={26} />
                </button>
              </div>

              {/* Role Description */}
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 24, borderLeft: '4px solid var(--s-primary)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 6px' }}>Role Description</h4>
                <p style={{ fontSize: 14, color: 'var(--s-text2)', margin: 0, lineHeight: 1.6 }}>
                  {detailCareer.roleDescription || detailCareer.shortDescription}
                </p>
              </div>

              {/* Required Skills (Core, Advanced, Optional) */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 12 }}>
                  Required Career Skills & Target Proficiency
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="s-grid-1col">
                  {/* Core */}
                  <div style={{ padding: 16, borderRadius: 14, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#047857', marginBottom: 8 }}>Core Required Skills</div>
                    {(detailCareer.coreSkills || []).map((s, idx) => (
                      <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#064e3b', margin: '4px 0' }}>
                        • {s.name} <span style={{ fontSize: 11, opacity: 0.8 }}>({s.suggestedProficiency})</span>
                      </div>
                    ))}
                  </div>
                  {/* Advanced */}
                  <div style={{ padding: 16, borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#1e40af', marginBottom: 8 }}>Advanced Skills</div>
                    {(detailCareer.advancedSkills || []).map((s, idx) => (
                      <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: '4px 0' }}>
                        • {s.name} <span style={{ fontSize: 11, opacity: 0.8 }}>({s.suggestedProficiency})</span>
                      </div>
                    ))}
                  </div>
                  {/* Optional */}
                  <div style={{ padding: 16, borderRadius: 14, background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#6d28d9', marginBottom: 8 }}>Optional / Industry Plus</div>
                    {(detailCareer.optionalSkills || []).map((s, idx) => (
                      <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6', margin: '4px 0' }}>
                        • {s.name} <span style={{ fontSize: 11, opacity: 0.8 }}>({s.suggestedProficiency})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typical Responsibilities */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 10 }}>Typical Key Responsibilities</h4>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.6 }}>
                  {(detailCareer.typicalResponsibilities || []).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Learning Roadmap */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 12 }}>Recommended Learning Roadmap</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(detailCareer.recommendedRoadmap || []).map((rm, idx) => (
                    <div key={idx} style={{ padding: 16, borderRadius: 14, background: 'var(--s-surface2)', border: '1px solid var(--s-border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-primary)', textTransform: 'uppercase' }}>{rm.phase}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', margin: '2px 0 4px' }}>{rm.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 8 }}>{rm.description}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(rm.items || []).map((item, iIdx) => (
                          <span key={iIdx} style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#fff', border: '1px solid var(--s-border)' }}>
                            • {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Certifications & Projects */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="s-grid-2col">
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 10 }}>Recommended Certifications</h4>
                  {(detailCareer.relatedCertifications || []).map((cert, idx) => (
                    <div key={idx} style={{ padding: 10, borderRadius: 10, background: '#fff3ed', color: '#c2410c', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      🏆 {cert}
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 10 }}>Portfolio Projects</h4>
                  {(detailCareer.relatedProjects || []).map((proj, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 12, background: 'var(--s-surface2)', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>{proj.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 4px' }}>{proj.description}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-primary)' }}>Tech: {proj.techStack}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interview Prep */}
              <div style={{ background: '#f1f5f9', padding: 18, borderRadius: 16, marginBottom: 24 }}>
                <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>Interview Preparation Guidelines</h4>
                {(detailCareer.interviewPrep || []).map((tip, idx) => (
                  <div key={idx} style={{ fontSize: 13, color: 'var(--s-text2)', fontWeight: 600, margin: '4px 0' }}>
                    💡 {tip}
                  </div>
                ))}
              </div>

              {/* Set Target Action inside modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleSetTargetCareer(detailCareer.title)
                    setDetailCareer(null)
                  }}
                  style={{
                    background: '#047857', color: '#fff', border: 'none',
                    padding: '10px 24px', borderRadius: 14, fontSize: 14, fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  <FiTarget size={16} /> Set as My Target Career
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* SIDE-BY-SIDE CAREER COMPARISON MODAL                         */}
        {/* ──────────────────────────────────────────────────────────── */}
        {comparing && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20
          }}>
            <div style={{
              background: '#fff', width: '100%', maxWidth: 1000, maxHeight: '90vh',
              borderRadius: 24, padding: 32, overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                  Side-by-Side Career Direction Comparison
                </h2>
                <button
                  type="button"
                  onClick={() => setComparing(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)' }}
                >
                  <FiX size={24} />
                </button>
              </div>

              {loadingCompare ? (
                <div style={{ padding: 40, textAlign: 'center' }}><SLoader /></div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--s-border)' }}>
                        <th style={{ padding: 12, fontSize: 14, color: 'var(--s-text3)', width: '20%' }}>Attribute</th>
                        {comparisonData.map(c => (
                          <th key={c.slug} style={{ padding: 12, fontSize: 16, fontWeight: 800, color: 'var(--s-text)' }}>
                            {c.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Category</td>
                        {comparisonData.map(c => <td key={c.slug} style={{ padding: 12, fontSize: 13, fontWeight: 700, color: 'var(--s-primary)' }}>{c.category}</td>)}
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Match Score</td>
                        {comparisonData.map(c => (
                          <td key={c.slug} style={{ padding: 12, fontSize: 14, fontWeight: 900, color: '#047857' }}>
                            {c.matchPercentage ? `${c.matchPercentage}% (${c.matchCategory})` : 'Assessed'}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Why It Fits</td>
                        {comparisonData.map(c => (
                          <td key={c.slug} style={{ padding: 12, fontSize: 12, color: '#047857' }}>
                            {c.whyFits?.map((w, idx) => <div key={idx} style={{ margin: '2px 0' }}>✓ {w}</div>)}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Skills to Improve</td>
                        {comparisonData.map(c => (
                          <td key={c.slug} style={{ padding: 12, fontSize: 12, color: '#b45309', fontWeight: 700 }}>
                            {c.skillsToImprove?.map((sg, idx) => <div key={idx} style={{ margin: '2px 0' }}>△ {sg}</div>)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
