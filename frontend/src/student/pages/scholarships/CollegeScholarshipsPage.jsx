import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import { useStudentAuth } from '../../context/StudentAuthContext'
import {
  FiSearch, FiBookmark, FiExternalLink, FiCheckCircle,
  FiCalendar, FiAward, FiStar, FiClock, FiAlertTriangle,
  FiFileText, FiBookOpen, FiUser, FiX, FiChevronRight,
  FiInfo, FiTrendingUp, FiTarget, FiCheck
} from 'react-icons/fi'
import { SCard, SBtn, SBadge, SLoader } from '../../components/ui'

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SORT_OPTIONS = [
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'deadline_soon',  label: 'Deadline Soon'  },
  { value: 'highest_benefit', label: 'Highest Benefit' },
]

const STATUS_CONFIG = {
  "Interested":     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Interested',    icon: '⭐' },
  "Applied":        { color: '#047857', bg: '#f0fdf4', border: '#bbf7d0', label: 'Applied',       icon: '✅' },
  "Not Interested": { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Not Interested', icon: '–' },
}

const TABS = [
  { id: 'recommended', label: '🌟 Recommended',      short: 'Recommended'  },
  { id: 'all',         label: '🎓 All Scholarships', short: 'Browse All'   },
  { id: 'saved',       label: '🔖 Saved',            short: 'Saved'        },
  { id: 'tracking',   label: '📋 My Applications',  short: 'Tracking'     },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcDeadline(deadlineStr) {
  if (!deadlineStr || deadlineStr.trim() === '') return { text: 'Ongoing Scheme', type: 'info' }
  const match = deadlineStr.match(/(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/)
  if (!match) return { text: `Deadline: ${deadlineStr}`, type: 'normal' }
  const day = parseInt(match[1], 10)
  const month = new Date(`${match[2]} 1, 2000`).getMonth()
  const year = parseInt(match[3], 10)
  const diffDays = Math.ceil((new Date(year, month, day) - new Date()) / 86400000)
  if (diffDays < 0)  return { text: 'Expired', type: 'expired' }
  if (diffDays <= 3) return { text: `⚠️ Deadline in ${diffDays} day${diffDays === 1 ? '' : 's'}`, type: 'urgent' }
  if (diffDays <= 10) return { text: `Deadline in ${diffDays} days`, type: 'soon' }
  return { text: `${diffDays} days remaining`, type: 'normal' }
}

function DeadlineBadge({ deadlineStr }) {
  const d = calcDeadline(deadlineStr)
  const colors = {
    expired: { color: '#94a3b8', bg: '#f8fafc' },
    urgent:  { color: '#dc2626', bg: '#fef2f2' },
    soon:    { color: '#d97706', bg: '#fffbeb' },
    normal:  { color: '#047857', bg: '#f0fdf4' },
    info:    { color: '#2563eb', bg: '#eff6ff' },
  }
  const c = colors[d.type] || colors.normal
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 10,
      background: c.bg, color: c.color
    }}>
      {d.text}
    </span>
  )
}

function MatchBar({ pct }) {
  const color = pct >= 85 ? '#047857' : pct >= 65 ? '#2563eb' : '#d97706'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 38 }}>{pct}%</span>
    </div>
  )
}

// ─── Scholarship Card ─────────────────────────────────────────────────────────

function ScholarshipCard({ sch, isSaved, appStatus, onSave, onOpen, onStatusChange, compact = false }) {
  const deadline = calcDeadline(sch.deadline)
  const isExpired = deadline.type === 'expired'

  return (
    <SCard
      onClick={() => onOpen(sch)}
      style={{
        padding: 22, borderRadius: 20, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 14,
        borderTop: `4px solid ${isExpired ? '#e2e8f0' : '#047857'}`,
        opacity: isExpired ? 0.75 : 1,
        position: 'relative'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 800, color: '#047857',
          background: '#d1fae5', padding: '3px 10px', borderRadius: 10,
          textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0
        }}>
          {sch.category}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {sch.matchPercentage && (
            <span style={{
              fontSize: 11, fontWeight: 800,
              color: sch.matchPercentage >= 85 ? '#047857' : '#2563eb',
              background: sch.matchPercentage >= 85 ? '#d1fae5' : '#eff6ff',
              padding: '2px 8px', borderRadius: 8
            }}>
              {sch.matchPercentage}% Match
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onSave(sch._id, e) }}
            title={isSaved ? 'Remove Bookmark' : 'Save Scholarship'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: isSaved ? '#047857' : 'var(--s-text3)' }}
          >
            <FiBookmark size={17} fill={isSaved ? '#047857' : 'none'} />
          </button>
        </div>
      </div>

      {/* Name + Provider */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 4px', lineHeight: 1.3 }}>
          {sch.scholarshipName}
        </h3>
        <div style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>{sch.provider}</div>
      </div>

      {/* Benefit Box */}
      <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 2 }}>Financial Benefit</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#047857' }}>{sch.benefit}</div>
      </div>

      {/* Match Reasons (for recommended) */}
      {sch.matchReasons && sch.matchReasons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sch.matchReasons.slice(0, 2).map((r, i) => (
            <div key={i} style={{ fontSize: 11.5, color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--s-border)', marginTop: 'auto' }}>
        <DeadlineBadge deadlineStr={sch.deadline} />

        {appStatus ? (
          <span style={{
            fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 8,
            background: STATUS_CONFIG[appStatus]?.bg, color: STATUS_CONFIG[appStatus]?.color,
            border: `1px solid ${STATUS_CONFIG[appStatus]?.border}`
          }}>
            {STATUS_CONFIG[appStatus]?.icon} {appStatus}
          </span>
        ) : (
          <SBtn variant="primary" size="sm" style={{ borderRadius: 10, fontSize: 12 }}>
            View &amp; Apply →
          </SBtn>
        )}
      </div>
    </SCard>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ScholarshipDetailModal({ sch, isSaved, appStatus, onClose, onSave, onStatusChange }) {
  const [settingStatus, setSettingStatus] = useState(false)
  const deadline = calcDeadline(sch.deadline)

  const handleStatus = async (status) => {
    setSettingStatus(true)
    await onStatusChange(sch._id, status)
    setSettingStatus(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)',
      backdropFilter: 'blur(6px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 760,
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Sticky Header */}
        <div style={{
          padding: '24px 28px 20px', borderBottom: '1px solid var(--s-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          position: 'sticky', top: 0, background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 10
        }}>
          <div style={{ flex: 1 }}>
            <span style={{
              fontSize: 10.5, fontWeight: 800, color: '#047857',
              background: '#d1fae5', padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase'
            }}>
              {sch.category}
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: '10px 0 4px', fontFamily: 'var(--s-font-display)', lineHeight: 1.3 }}>
              {sch.scholarshipName}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>by {sch.provider}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'var(--s-text2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Benefit Banner */}
          <div style={{ background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)', color: '#fff', padding: '20px 24px', borderRadius: 18 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 800, marginBottom: 4 }}>Total Scheme Benefit</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{sch.benefit}</div>
            <div style={{ marginTop: 12 }}>
              <DeadlineBadge deadlineStr={sch.deadline} />
            </div>
          </div>

          {/* Match Score (if present) */}
          {sch.matchPercentage != null && (
            <div style={{ padding: 18, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheckCircle size={15} /> Profile Match Score
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', fontStyle: 'italic' }}>
                  Potentially Eligible — verify requirements
                </span>
              </div>
              <MatchBar pct={sch.matchPercentage} />
              {sch.matchReasons?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sch.matchReasons.map((r, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>{r}</div>
                  ))}
                </div>
              )}
              {sch.unverifiedCriteria?.length > 0 && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', marginBottom: 4 }}>⚠️ Eligibility Cannot Be Fully Verified:</div>
                  {sch.unverifiedCriteria.map((c, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: '#92400e', fontWeight: 600 }}>• {c}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 8 }}>Scheme Overview</div>
            <p style={{ fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.65, margin: 0 }}>
              {sch.description || 'Full higher education grant designed to assist college students pursuing degree and diploma programmes.'}
            </p>
          </div>

          {/* Eligibility Criteria Grid */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 12 }}>Eligibility Criteria</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InfoBox label="Academic CGPA" value={sch.minCGPA || 'No minimum CGPA criteria'} />
              <InfoBox label="Family Income Limit" value={sch.familyIncomeLimit || 'No income ceiling'} />
            </div>
          </div>

          {/* Academic Target */}
          <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 12 }}>Target Academic Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <EligRow label="Eligible Fields"           values={sch.eligibleFields} />
              <EligRow label="Eligible Degrees"          values={sch.eligibleDegrees} />
              <EligRow label="Eligible Domains/Branches" values={sch.eligibleDomains} />
              <EligRow label="Eligible Years"            values={sch.eligibleYears} />
              {sch.eligibleSemesters?.length > 0 && sch.eligibleSemesters[0] !== 'All' && (
                <EligRow label="Eligible Semesters" values={sch.eligibleSemesters} />
              )}
            </div>
          </div>

          {/* Additional Eligibility */}
          {sch.additionalEligibility && (
            <div style={{ padding: 16, background: '#eff6ff', borderRadius: 14, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: 6 }}>
                <FiInfo size={12} style={{ marginRight: 4 }} />Additional Requirements
              </div>
              <div style={{ fontSize: 13, color: '#1e40af', fontWeight: 600, lineHeight: 1.5 }}>{sch.additionalEligibility}</div>
            </div>
          )}

          {/* Required Documents */}
          {sch.requiredDocuments?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 10 }}>Required Documents</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sch.requiredDocuments.map((doc, i) => (
                  <span key={i} style={{ background: '#f1f5f9', color: '#334155', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Terms */}
          {sch.termsAndConditions && (
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid var(--s-border)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 6 }}>TERMS & CONDITIONS</div>
              <div style={{ fontSize: 12.5, color: 'var(--s-text2)', lineHeight: 1.5 }}>{sch.termsAndConditions}</div>
            </div>
          )}

          {/* Application Status Tracker */}
          <div style={{ padding: 18, background: '#f8fafc', borderRadius: 16, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 12 }}>Track Your Application</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Interested', 'Applied', 'Not Interested'].map(s => {
                const cfg = STATUS_CONFIG[s]
                const isActive = appStatus === s
                return (
                  <button
                    key={s}
                    onClick={() => handleStatus(isActive ? 'remove' : s)}
                    disabled={settingStatus}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                      cursor: settingStatus ? 'wait' : 'pointer',
                      background: isActive ? cfg.bg : '#fff',
                      color: isActive ? cfg.color : 'var(--s-text2)',
                      border: isActive ? `2px solid ${cfg.color}` : '1.5px solid var(--s-border)',
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cfg.icon} {cfg.label}
                    {isActive && <FiCheck size={13} />}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--s-text3)', marginTop: 10 }}>
              Click again on an active status to remove it. This only tracks your intent — it does not submit an application on your behalf.
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--s-text3)', fontWeight: 800 }}>APPLICATION DEADLINE</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#047857', marginTop: 2 }}>{sch.deadline || 'Ongoing / Rolling Basis'}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <SBtn
                variant="outline"
                onClick={e => onSave(sch._id, e)}
                style={{ borderRadius: 12 }}
              >
                <FiBookmark style={{ marginRight: 5 }} size={14} />
                {isSaved ? 'Saved ✓' : 'Save'}
              </SBtn>

              {sch.applicationLink ? (
                <SBtn
                  variant="primary"
                  onClick={() => window.open(sch.applicationLink, '_blank', 'noopener,noreferrer')}
                  style={{ borderRadius: 12, padding: '10px 24px' }}
                >
                  Apply Now <FiExternalLink style={{ marginLeft: 6 }} size={14} />
                </SBtn>
              ) : (
                <span style={{ fontSize: 12.5, color: 'var(--s-text3)', fontStyle: 'italic', alignSelf: 'center' }}>
                  Official portal link pending
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--s-surface2)', padding: '12px 14px', borderRadius: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text)' }}>{value}</div>
    </div>
  )
}

function EligRow({ label, values }) {
  const all = !values || values.length === 0 || (values.length === 1 && values[0] === 'All')
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', minWidth: 150, flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: all ? '#047857' : 'var(--s-text)' }}>
        {all ? '✅ Open to All' : values.join(', ')}
      </span>
    </div>
  )
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, subtitle, action }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid var(--s-border)' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--s-text3)', maxWidth: 380, margin: '0 auto 16px' }}>{subtitle}</div>}
      {action}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CollegeScholarshipsPage() {
  const { student, isAuthenticated } = useStudentAuth()

  // Data state
  const [scholarships, setScholarships] = useState([])
  const [recommended,  setRecommended]  = useState([])
  const [savedIds,     setSavedIds]     = useState(new Set())
  const [statusMap,    setStatusMap]    = useState({}) // { scholarshipId: applicationStatus }

  // UI state
  const [activeTab,          setActiveTab]          = useState('recommended')
  const [loading,            setLoading]            = useState(true)
  const [recLoading,         setRecLoading]         = useState(true)
  const [profileComplete,    setProfileComplete]    = useState(true)
  const [search,             setSearch]             = useState('')
  const [selectedCategory,   setSelectedCategory]  = useState('All')
  const [sortBy,             setSortBy]             = useState('recently_added')
  const [selectedScholarship, setSelectedScholarship] = useState(null)
  const [apiError,           setApiError]           = useState(null)

  // ── Fetch all scholarships ──────────────────────────────────────────────
  const fetchScholarships = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const params = { sortBy }
      if (selectedCategory !== 'All') params.category = selectedCategory
      if (search.trim()) params.search = search.trim()

      const res = await axiosInstance.get('/college-scholarships', { params })
      if (res.data?.success) setScholarships(res.data.scholarships || [])
    } catch (err) {
      console.error('Fetch scholarships error:', err)
      setApiError('Failed to load scholarships. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, sortBy, search])

  // ── Fetch recommended scholarships ──────────────────────────────────────
  const fetchRecommended = useCallback(async () => {
    if (!isAuthenticated) { setRecLoading(false); return }
    setRecLoading(true)
    try {
      const res = await axiosInstance.get('/college-scholarships/recommended')
      if (res.data?.success) {
        setRecommended(res.data.recommended || [])
        setProfileComplete(res.data.profileComplete !== false)
      }
    } catch (err) {
      console.warn('Recommended fetch error:', err)
      setRecommended([])
    } finally {
      setRecLoading(false)
    }
  }, [isAuthenticated])

  // ── Fetch saved scholarships ─────────────────────────────────────────────
  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await axiosInstance.get('/user-actions/saved-list', { params: { contentType: 'CollegeScholarship' } })
      if (res.data?.data) {
        setSavedIds(new Set(res.data.data.map(item => item.contentId?._id || item.contentId)))
      }
    } catch (err) {
      console.warn('Saved list error:', err)
    }
  }, [isAuthenticated])

  // ── Fetch application statuses ───────────────────────────────────────────
  const fetchStatuses = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await axiosInstance.get('/college-scholarships/my-applications')
      if (res.data?.success) setStatusMap(res.data.statusMap || {})
    } catch (err) {
      console.warn('Status fetch error:', err)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchScholarships()
  }, [fetchScholarships])

  useEffect(() => {
    fetchRecommended()
    fetchSaved()
    fetchStatuses()
  }, [fetchRecommended, fetchSaved, fetchStatuses])

  // ── Save / Unsave toggle ─────────────────────────────────────────────────
  const handleToggleSave = async (id, e) => {
    if (e) e.stopPropagation()
    if (!isAuthenticated) return
    try {
      if (savedIds.has(id)) {
        await axiosInstance.delete(`/user-actions/unsave/${id}`)
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      } else {
        await axiosInstance.post('/user-actions/save', { contentId: id, contentType: 'CollegeScholarship' })
        setSavedIds(prev => new Set([...prev, id]))
      }
    } catch (err) {
      console.error('Save toggle error:', err)
    }
  }

  // ── Application status update ────────────────────────────────────────────
  const handleStatusChange = async (scholarshipId, status) => {
    if (!isAuthenticated) return
    try {
      await axiosInstance.post(`/college-scholarships/${scholarshipId}/apply-status`, { status })
      setStatusMap(prev => {
        const next = { ...prev }
        if (status === 'remove') {
          delete next[scholarshipId]
        } else {
          next[scholarshipId] = status
        }
        return next
      })
    } catch (err) {
      console.error('Status update error:', err)
    }
  }

  // ── Derived lists ────────────────────────────────────────────────────────
  const savedList    = scholarships.filter(s => savedIds.has(s._id))
  const trackingList = scholarships.filter(s => statusMap[s._id])

  const tabCounts = {
    recommended: recommended.length,
    all:         scholarships.length,
    saved:       savedList.length,
    tracking:    Object.keys(statusMap).length,
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="s-anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100 }}>

      {/* ── Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #0f3460 100%)',
        color: '#fff', padding: '32px 36px', borderRadius: 24,
        boxShadow: '0 12px 40px rgba(4, 120, 87, 0.25)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, marginBottom: 14 }}>
          <FiAward size={13} /> Higher Education Financial Assistance Portal
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', fontFamily: 'var(--s-font-display)', color: '#fff', lineHeight: 1.2 }}>
          College Scholarships &amp; Schemes 🎓
        </h1>
        <p style={{ fontSize: 14.5, color: '#a7f3d0', fontWeight: 600, margin: 0, maxWidth: 640 }}>
          Discover government stipends, merit grants, research funding, and private trusts — matched to your academic profile.
        </p>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Schemes', value: scholarships.length, icon: '📋' },
            { label: 'AI Matches', value: recommended.length, icon: '🌟' },
            { label: 'Saved', value: savedIds.size, icon: '🔖' },
            { label: 'Tracking', value: Object.keys(statusMap).length, icon: '📈' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{stat.icon} {stat.value}</div>
              <div style={{ fontSize: 10.5, color: '#a7f3d0', fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Profile Incomplete Warning ── */}
      {isAuthenticated && !profileComplete && (
        <div style={{
          padding: '16px 22px', background: '#fffbeb', borderRadius: 16,
          border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>Your academic profile is incomplete</div>
              <div style={{ fontSize: 12.5, color: '#b45309', marginTop: 2 }}>Complete your profile to receive accurate scholarship recommendations based on your field, degree, and year.</div>
            </div>
          </div>
          <Link to="/college/profile" style={{ textDecoration: 'none' }}>
            <SBtn variant="primary" size="sm" style={{ background: '#d97706', borderRadius: 10, whiteSpace: 'nowrap' }}>
              <FiUser size={13} style={{ marginRight: 5 }} /> Complete Profile
            </SBtn>
          </Link>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 16, padding: 4 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 12, fontSize: 13, fontWeight: isActive ? 800 : 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#047857' : 'var(--s-text3)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 800,
                  background: isActive ? '#047857' : '#e2e8f0',
                  color: isActive ? '#fff' : '#64748b',
                  padding: '1px 6px', borderRadius: 6
                }}>
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════════════════════ */}

      {/* ── TAB: RECOMMENDED ── */}
      {activeTab === 'recommended' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🌟</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', fontFamily: 'var(--s-font-display)' }}>Best Match For You</div>
              <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 1 }}>AI-matched against your enrolled academic profile. Shows "Potentially Eligible" — always verify requirements before applying.</div>
            </div>
          </div>

          {!isAuthenticated ? (
            <EmptyState emoji="🔒" title="Login Required" subtitle="Log in to see scholarships matched to your academic profile." />
          ) : recLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}><SLoader /></div>
          ) : recommended.length === 0 ? (
            <EmptyState
              emoji="🎓"
              title="No recommendations yet"
              subtitle="Complete your academic profile so our AI can match scholarships to your field, degree, and year."
              action={<Link to="/college/profile"><SBtn variant="primary">Complete Profile →</SBtn></Link>}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {recommended
                .filter(s => calcDeadline(s.deadline).type !== 'expired')
                .map(sch => (
                  <ScholarshipCard
                    key={sch._id}
                    sch={sch}
                    isSaved={savedIds.has(sch._id)}
                    appStatus={statusMap[sch._id]}
                    onSave={handleToggleSave}
                    onOpen={setSelectedScholarship}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ALL SCHOLARSHIPS ── */}
      {activeTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name, provider, or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12,
                  border: '1px solid var(--s-border)', fontSize: 13.5, outline: 'none',
                  background: '#fff', boxSizing: 'border-box'
                }}
              />
              <FiSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--s-text3)' }} size={16} />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 700, background: '#fff' }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: selectedCategory === cat ? 800 : 600,
                  whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                  background: selectedCategory === cat ? '#047857' : '#fff',
                  color: selectedCategory === cat ? '#fff' : 'var(--s-text2)',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(4, 120, 87, 0.2)' : '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* API Error */}
          {apiError && (
            <div style={{ padding: 16, background: '#fef2f2', borderRadius: 12, color: '#dc2626', fontSize: 13, fontWeight: 700 }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}><SLoader /></div>
          ) : scholarships.length === 0 ? (
            <EmptyState emoji="🔍" title="No scholarships found" subtitle="Try clearing your search or selecting a different category." />
          ) : (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--s-text3)', fontWeight: 700 }}>
                Showing {scholarships.length} scheme{scholarships.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                {scholarships.map(sch => (
                  <ScholarshipCard
                    key={sch._id}
                    sch={sch}
                    isSaved={savedIds.has(sch._id)}
                    appStatus={statusMap[sch._id]}
                    onSave={handleToggleSave}
                    onOpen={setSelectedScholarship}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: SAVED ── */}
      {activeTab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔖</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>Saved Scholarships</div>
              <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>Scholarships you've bookmarked for easy access.</div>
            </div>
          </div>

          {!isAuthenticated ? (
            <EmptyState emoji="🔒" title="Login to see saved scholarships" />
          ) : savedList.length === 0 ? (
            <EmptyState
              emoji="🔖"
              title="No saved scholarships yet"
              subtitle="Browse scholarships and click the bookmark icon to save them here."
              action={<SBtn variant="primary" onClick={() => setActiveTab('all')}>Browse Scholarships →</SBtn>}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {savedList.map(sch => (
                <ScholarshipCard
                  key={sch._id}
                  sch={sch}
                  isSaved={true}
                  appStatus={statusMap[sch._id]}
                  onSave={handleToggleSave}
                  onOpen={setSelectedScholarship}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: APPLICATION TRACKING ── */}
      {activeTab === 'tracking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>My Application Tracking</div>
              <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>
                Scholarships you've marked as Interested, Applied, or Not Interested.
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            <EmptyState emoji="🔒" title="Login to track your applications" />
          ) : trackingList.length === 0 ? (
            <EmptyState
              emoji="📈"
              title="No applications tracked yet"
              subtitle="Open any scholarship and use the status tracker to mark it as Interested, Applied, or Not Interested."
              action={<SBtn variant="primary" onClick={() => setActiveTab('recommended')}>View Recommendations →</SBtn>}
            />
          ) : (
            <>
              {/* Status Summary Pills */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = Object.values(statusMap).filter(s => s === status).length
                  if (count === 0) return null
                  return (
                    <div key={status} style={{
                      padding: '8px 18px', borderRadius: 12,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: cfg.color }}>{count}</div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Grouped by Status */}
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const group = trackingList.filter(s => statusMap[s._id] === status)
                if (group.length === 0) return null
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 15 }}>{cfg.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: cfg.color }}>{cfg.label} ({group.length})</span>
                      <div style={{ flex: 1, height: 1, background: cfg.border }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                      {group.map(sch => (
                        <ScholarshipCard
                          key={sch._id}
                          sch={sch}
                          isSaved={savedIds.has(sch._id)}
                          appStatus={statusMap[sch._id]}
                          onSave={handleToggleSave}
                          onOpen={setSelectedScholarship}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          sch={selectedScholarship}
          isSaved={savedIds.has(selectedScholarship._id)}
          appStatus={statusMap[selectedScholarship._id]}
          onClose={() => setSelectedScholarship(null)}
          onSave={handleToggleSave}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
