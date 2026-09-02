import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import {
  FiSearch, FiFilter, FiBookmark, FiExternalLink, FiCheckCircle,
  FiCalendar, FiAward, FiDollarSign, FiStar, FiClock, FiAlertTriangle,
  FiUserCheck, FiBookOpen, FiFileText
} from 'react-icons/fi'
import { SCard, SBtn, SBadge, SLoader } from '../../components/ui'

const CATEGORIES = [
  "All",
  "Government Scholarship",
  "Private Scholarship",
  "Merit-Based",
  "Need-Based",
  "Women in Education",
  "Minority / Community Schemes",
  "Research Scholarship",
  "Technical Education Scholarship",
  "Engineering Scholarship",
  "Medical Scholarship",
  "Management Scholarship",
  "Law Scholarship",
  "Design Scholarship",
  "General Higher Education Scholarship"
]

export default function CollegeScholarshipsPage() {
  const { student, isAuthenticated } = useStudentAuth()

  const [scholarships, setScholarships] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const [recLoading, setRecLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recently_added')
  const [viewSavedOnly, setViewSavedOnly] = useState(false)

  const [savedIds, setSavedIds] = useState(new Set())
  const [selectedScholarship, setSelectedScholarship] = useState(null)

  useEffect(() => {
    fetchCollegeScholarships()
    fetchRecommendedScholarships()
    fetchSavedScholarships()
  }, [selectedCategory, sortBy])

  const fetchCollegeScholarships = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/college-scholarships', {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: search || undefined,
          sortBy
        }
      })
      if (res.data?.success) {
        setScholarships(res.data.scholarships || [])
      }
    } catch (err) {
      console.error("Failed to fetch college scholarships:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedScholarships = async () => {
    setRecLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      if (token) {
        const res = await axiosInstance.get('/college-scholarships/recommended', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success) {
          setRecommended(res.data.recommended || [])
        }
      }
    } catch (err) {
      console.warn("Failed to fetch recommended scholarships:", err)
    } finally {
      setRecLoading(false)
    }
  }

  const fetchSavedScholarships = async () => {
    if (!isAuthenticated) return
    try {
      const res = await userActionService.getSavedList('CollegeScholarship')
      if (res.data) {
        setSavedIds(new Set(res.data.map(item => item.contentId?._id || item.contentId)))
      }
    } catch (err) {
      console.warn("Saved list fetch error")
    }
  }

  const handleToggleSave = async (id, e) => {
    if (e) e.stopPropagation()
    if (!isAuthenticated) return
    try {
      if (savedIds.has(id)) {
        await userActionService.unsaveItem(id)
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; })
      } else {
        await userActionService.saveItem(id, 'CollegeScholarship')
        setSavedIds(prev => new Set([...prev, id]))
      }
    } catch (err) {
      console.error("Bookmark toggle failed", err)
    }
  }

  const calculateDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return { text: 'Ongoing Scheme', type: 'info' }
    const match = deadlineStr.match(/(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/)
    if (!match) return { text: `Deadline: ${deadlineStr}`, type: 'normal' }

    const day = parseInt(match[1], 10)
    const month = new Date(`${match[2]} 1, 2000`).getMonth()
    const year = parseInt(match[3], 10)

    const deadlineDate = new Date(year, month, day)
    const today = new Date()
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: 'Expired', type: 'expired' }
    if (diffDays <= 5) return { text: `⚠️ Deadline in ${diffDays} day${diffDays === 1 ? '' : 's'}`, type: 'urgent' }
    return { text: `${diffDays} days remaining`, type: 'normal' }
  }

  const filteredList = scholarships.filter(s => {
    if (viewSavedOnly && !savedIds.has(s._id)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (s.scholarshipName || '').toLowerCase().includes(q) ||
           (s.provider || '').toLowerCase().includes(q) ||
           (s.category || '').toLowerCase().includes(q)
  })

  return (
    <div className="s-anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        color: '#fff', padding: '32px 36px', borderRadius: 24,
        boxShadow: '0 10px 30px rgba(4, 120, 87, 0.2)', position: 'relative'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
          <FiAward size={14} /> Higher Education Financial Assistance Portal
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px', fontFamily: 'var(--s-font-display)', color: '#fff' }}>
          College Scholarships & Schemes 🎓
        </h1>
        <p style={{ fontSize: 15, color: '#a7f3d0', fontWeight: 700, margin: 0, maxWidth: 680 }}>
          Explore government stipends, merit grants, research funding, and private trusts tailored to your degree programme and academic focus.
        </p>
      </div>

      {/* SECTION 1: BEST MATCH FOR YOU (AI Matching Engine) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🌟</span>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
              Best Match For You
            </h2>
            <SBadge color="green">AI Eligible Matches</SBadge>
          </div>
          <div style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>
            Matched against your enrolled academic profile
          </div>
        </div>

        {recLoading ? (
          <div style={{ padding: '30px 0', textAlign: 'center' }}><SLoader /></div>
        ) : recommended.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {recommended.map(sch => (
              <SCard
                key={sch._id}
                onClick={() => setSelectedScholarship(sch)}
                style={{
                  padding: 22, borderRadius: 20, cursor: 'pointer',
                  border: '1px solid var(--s-border)', borderTop: '4px solid #047857',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {sch.category}
                    </span>
                    <SBadge color="green">{sch.matchPercentage}% Match</SBadge>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {sch.scholarshipName}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600, marginBottom: 12 }}>
                    {sch.provider}
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Financial Benefit</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#047857', marginTop: 2 }}>{sch.benefit}</div>
                  </div>

                  {/* Matching Reasons Checklist */}
                  {sch.matchReasons && sch.matchReasons.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                      {sch.matchReasons.slice(0, 3).map((reason, idx) => (
                        <div key={idx} style={{ fontSize: 11.5, color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>
                    Deadline: {sch.deadline || 'Ongoing'}
                  </span>
                  <SBtn variant="primary" style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12 }}>
                    View & Apply →
                  </SBtn>
                </div>
              </SCard>
            ))}
          </div>
        ) : (
          <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, textAlign: 'center', color: 'var(--s-text3)' }}>
            Complete your academic profile to unlock personalized AI scholarship recommendations.
          </div>
        )}
      </div>

      {/* SECTION 2: BROWSE ALL SCHOLARSHIPS */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Browse All Higher Education Schemes ({filteredList.length})
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setViewSavedOnly(v => !v)}
              style={{
                padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                border: viewSavedOnly ? '2px solid #047857' : '1px solid var(--s-border)',
                background: viewSavedOnly ? '#d1fae5' : '#fff',
                color: viewSavedOnly ? '#047857' : 'var(--s-text2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <FiBookmark size={15} /> Saved ({savedIds.size})
            </button>

            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
            >
              <option value="recently_added">Recently Added</option>
              <option value="deadline_soon">Deadline Soon</option>
              <option value="highest_benefit">Highest Benefit</option>
            </select>
          </div>
        </div>

        {/* Search & Category Pills Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search scheme name, provider, or financial benefit..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14,
                border: '1px solid var(--s-border)', fontSize: 14, outline: 'none', background: '#fff'
              }}
            />
            <FiSearch style={{ position: 'absolute', left: 14, top: 14, color: 'var(--s-text3)' }} size={18} />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: selectedCategory === cat ? 800 : 600,
                  whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                  background: selectedCategory === cat ? '#047857' : '#fff',
                  color: selectedCategory === cat ? '#fff' : 'var(--s-text2)',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(4, 120, 87, 0.2)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scholarship Cards Grid */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}><SLoader /></div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)' }}>No Scholarships Found</div>
            <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>Try clearing your search or category filters.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {filteredList.map(sch => {
              const daysInfo = calculateDaysRemaining(sch.deadline)
              const isSaved = savedIds.has(sch._id)

              return (
                <SCard
                  key={sch._id}
                  onClick={() => setSelectedScholarship(sch)}
                  style={{
                    padding: 24, borderRadius: 20, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Top Pill Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase' }}>
                        {sch.category}
                      </span>
                      <button
                        onClick={(e) => handleToggleSave(sch._id, e)}
                        title={isSaved ? "Remove Bookmark" : "Save Scholarship"}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? '#047857' : 'var(--s-text3)', padding: 4 }}
                      >
                        <FiBookmark size={18} fill={isSaved ? '#047857' : 'none'} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {sch.scholarshipName}
                    </h3>
                    <div style={{ fontSize: 12.5, color: 'var(--s-text3)', fontWeight: 600, marginBottom: 14 }}>
                      {sch.provider}
                    </div>

                    {/* Benefit Box */}
                    <div style={{ background: 'var(--s-surface2)', padding: '12px 14px', borderRadius: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Financial Benefit</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#047857', marginTop: 2 }}>{sch.benefit}</div>
                    </div>

                    {/* Eligibility Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {(sch.eligibleFields || []).slice(0, 2).map(f => (
                        <span key={f} style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>
                          🎓 {f}
                        </span>
                      ))}
                      {sch.minCGPA && sch.minCGPA !== "No minimum CGPA criteria" && (
                        <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>
                          📊 {sch.minCGPA}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Deadline & Apply */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800,
                      color: daysInfo.type === 'urgent' ? '#dc2626' : daysInfo.type === 'expired' ? '#94a3b8' : '#047857'
                    }}>
                      {daysInfo.text}
                    </span>

                    <SBtn variant="primary" style={{ padding: '7px 16px', borderRadius: 12, fontSize: 12.5 }}>
                      Apply Now <FiExternalLink style={{ marginLeft: 6 }} size={13} />
                    </SBtn>
                  </div>
                </SCard>
              )
            })}
          </div>
        )}
      </div>

      {/* DETAILED SCHOLARSHIP MODAL */}
      {selectedScholarship && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 24, width: '100%', maxWidth: 720,
            maxHeight: '90vh', overflowY: 'auto', padding: 32, display: 'flex',
            flexDirection: 'column', gap: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '4px 12px', borderRadius: 14, textTransform: 'uppercase' }}>
                  {selectedScholarship.category}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '10px 0 4px', fontFamily: 'var(--s-font-display)' }}>
                  {selectedScholarship.scholarshipName}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>
                  Provided by: {selectedScholarship.provider}
                </div>
              </div>
              <button
                onClick={() => setSelectedScholarship(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--s-text3)' }}
              >
                ✕
              </button>
            </div>

            {/* Financial Benefit Banner */}
            <div style={{ background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)', color: '#fff', padding: '18px 24px', borderRadius: 16 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 800 }}>Total Scheme Benefit</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}>{selectedScholarship.benefit}</div>
            </div>

            {/* AI Eligibility Match Box */}
            {selectedScholarship.matchReasons && selectedScholarship.matchReasons.length > 0 && (
              <div style={{ padding: 18, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheckCircle color="#166534" /> Why You May Be Eligible ({selectedScholarship.matchPercentage}% Match)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedScholarship.matchReasons.map((r, idx) => (
                    <div key={idx} style={{ fontSize: 12.5, color: '#15803d', fontWeight: 600 }}>{r}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>Scheme Overview</h4>
              <p style={{ fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.6, margin: 0 }}>
                {selectedScholarship.description || 'Full higher education grant designed to assist college students pursuing degree and diploma programmes.'}
              </p>
            </div>

            {/* Criteria Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--s-surface2)', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Academic CGPA Criteria</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginTop: 4 }}>{selectedScholarship.minCGPA || 'No CGPA cut-off'}</div>
              </div>
              <div style={{ background: 'var(--s-surface2)', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Family Income Criteria</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginTop: 4 }}>{selectedScholarship.familyIncomeLimit || 'No income ceiling'}</div>
              </div>
            </div>

            {/* Eligible Hierarchy */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid var(--s-border)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>Target College Eligibility</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div><strong>Fields:</strong> {(selectedScholarship.eligibleFields || []).join(', ')}</div>
                <div><strong>Degrees:</strong> {(selectedScholarship.eligibleDegrees || []).join(', ')}</div>
                <div><strong>Domains:</strong> {(selectedScholarship.eligibleDomains || []).join(', ')}</div>
                <div><strong>Years:</strong> {(selectedScholarship.eligibleYears || []).join(', ')}</div>
              </div>
            </div>

            {/* Required Documents */}
            {selectedScholarship.requiredDocuments?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>Required Verification Documents</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedScholarship.requiredDocuments.map((doc, idx) => (
                    <span key={idx} style={{ background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--s-text3)', fontWeight: 800 }}>APPLICATION DEADLINE</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#047857' }}>{selectedScholarship.deadline || 'Ongoing'}</div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SBtn
                  variant="outline"
                  onClick={(e) => handleToggleSave(selectedScholarship._id, e)}
                  style={{ borderRadius: 12 }}
                >
                  <FiBookmark style={{ marginRight: 6 }} />
                  {savedIds.has(selectedScholarship._id) ? 'Saved' : 'Save'}
                </SBtn>

                {selectedScholarship.applicationLink ? (
                  <SBtn
                    variant="primary"
                    onClick={() => window.open(selectedScholarship.applicationLink, '_blank', 'noopener,noreferrer')}
                    style={{ borderRadius: 12, padding: '10px 24px', fontSize: 14 }}
                  >
                    Apply Now <FiExternalLink style={{ marginLeft: 8 }} size={16} />
                  </SBtn>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--s-text3)', fontStyle: 'italic' }}>Official portal link pending</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
