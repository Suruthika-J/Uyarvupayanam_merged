import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SCard, SAlert, SBadge, SLoader } from '../../components/ui'
import {
  FiAward, FiCheckCircle, FiAlertCircle, FiRefreshCw,
  FiBookOpen, FiZap, FiArrowRight, FiCheck, FiX,
  FiSliders, FiTrendingUp, FiTarget, FiLayers, FiCompass
} from 'react-icons/fi'

export default function CollegeAdvisorDashboardPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileSummary, setProfileSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [filterCategory, setFilterCategory] = useState('ALL')

  // Career Comparison state
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [comparing, setComparing] = useState(false)
  const [comparisonData, setComparisonData] = useState([])
  const [loadingCompare, setLoadingCompare] = useState(false)

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
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <SLoader />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--s-text3)' }}>
          Evaluating your academic profile & analyzing career matches...
        </div>
      </div>
    )
  }

  return (
    <div className="student-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* ── PROFILE SUMMARY BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff', padding: '32px 36px', borderRadius: 24,
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)', marginBottom: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                <FiCompass size={14} /> College Academic Advisor Engine
              </div>
              <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', color: '#fff', margin: '0 0 8px' }}>
                Academic & Career Recommendations
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 620, margin: 0, lineHeight: 1.5 }}>
                Personalized career direction analysis derived from your degree, specialization, skill profile, and career interests.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/student/onboarding/college')}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', padding: '10px 18px', borderRadius: 14, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <FiRefreshCw size={14} /> Re-assess Profile
              </button>
            </div>
          </div>

          {/* Profile Attribute Tags */}
          {profileSummary && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Degree Programme</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>{profileSummary.degreeProgramme}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Domain Branch</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{profileSummary.domain}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Specialization</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#34d399', marginTop: 2 }}>{profileSummary.specialization || 'General Focus'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Institution</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 2 }}>{profileSummary.institution || 'Configured'}</div>
              </div>
            </div>
          )}
        </div>

        {error && <SAlert type="error" style={{ marginBottom: 24 }}>{error}</SAlert>}

        {/* ── ACTION & FILTER CONTROLS ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          {/* Category Tabs */}
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

        {/* ── RECOMMENDATIONS LIST ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredRecommendations.map((rec) => {
            const isSelected = selectedForCompare.includes(rec.slug)
            return (
              <SCard key={rec.slug} style={{ padding: '28px 32px', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }} className="s-anim-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                        {rec.title}
                      </h3>
                      <SBadge color={rec.matchPercentage >= 90 ? 'green' : rec.matchPercentage >= 80 ? 'blue' : 'gray'}>
                        {rec.category}
                      </SBadge>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0, maxWidth: 680 }}>
                      {rec.shortDescription}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: rec.matchPercentage >= 90 ? '#d1fae5' : rec.matchPercentage >= 80 ? '#dbeafe' : '#f1f5f9',
                      color: rec.matchPercentage >= 90 ? '#047857' : rec.matchPercentage >= 80 ? '#1e40af' : '#475569',
                      padding: '8px 16px', borderRadius: 20, fontSize: 15, fontWeight: 900
                    }}>
                      <FiZap size={16} /> {rec.matchPercentage}% {rec.matchCategory}
                    </div>

                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompare(rec.slug)}
                        style={{ accentColor: 'var(--s-primary)', width: 16, height: 16 }}
                      />
                      Select to Compare
                    </label>
                  </div>
                </div>

                {/* Why This Matches Box */}
                <div style={{ background: '#f8fafc', borderLeft: '4px solid var(--s-primary)', padding: '14px 18px', borderRadius: '0 12px 12px 0', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)', marginBottom: 4 }}>
                    Why This Direction Matches Your Profile
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--s-text)', lineHeight: 1.5, fontWeight: 600 }}>
                    "{rec.explanation}"
                  </div>
                </div>

                {/* Skill Match & Skill Gap Analysis */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 18 }} className="s-grid-2col">
                  {/* Skills You Have */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCheckCircle size={14} /> Skills & Competencies You Have:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {rec.matchedSkills.length > 0 ? rec.matchedSkills.map(s => (
                        <span key={s} style={{ fontSize: 12, fontWeight: 700, background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: 12 }}>
                          ✓ {s}
                        </span>
                      )) : (
                        <span style={{ fontSize: 12, color: 'var(--s-text3)' }}>Foundational alignment based on degree discipline</span>
                      )}
                    </div>
                  </div>

                  {/* Skills You May Want to Develop */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#d97706', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiTarget size={14} /> You May Want to Develop (Skill Gaps):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {rec.skillGaps.length > 0 ? rec.skillGaps.map(sg => (
                        <span key={sg} style={{ fontSize: 12, fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 12 }}>
                          + {sg}
                        </span>
                      )) : (
                        <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>Full core skill alignment!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested Next Steps */}
                {rec.suggestedNextSteps?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--s-border)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Suggested Action Plan:</span>
                    {rec.suggestedNextSteps.map((stepItem, idx) => (
                      <span key={idx} style={{ fontSize: 12, fontWeight: 600, color: 'var(--s-text2)', background: 'var(--s-surface2)', padding: '3px 10px', borderRadius: 8 }}>
                        {idx + 1}. {stepItem}
                      </span>
                    ))}
                  </div>
                )}
              </SCard>
            )
          })}
        </div>

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
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Typical Work Area</td>
                        {comparisonData.map(c => <td key={c.slug} style={{ padding: 12, fontSize: 13, color: 'var(--s-text2)' }}>{c.typicalWorkArea}</td>)}
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Required Skills</td>
                        {comparisonData.map(c => (
                          <td key={c.slug} style={{ padding: 12, fontSize: 12 }}>
                            {c.requiredSkills?.map(s => <div key={s} style={{ margin: '2px 0' }}>• {s}</div>)}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Skill Gaps</td>
                        {comparisonData.map(c => (
                          <td key={c.slug} style={{ padding: 12, fontSize: 12, color: '#b45309', fontWeight: 700 }}>
                            {c.skillGaps?.map(sg => <div key={sg} style={{ margin: '2px 0' }}>+ {sg}</div>)}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 13, color: 'var(--s-text3)' }}>Target Industry Sectors</td>
                        {comparisonData.map(c => (
                          <td key={c.slug} style={{ padding: 12, fontSize: 12 }}>
                            {c.workSectors?.join(', ')}
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
