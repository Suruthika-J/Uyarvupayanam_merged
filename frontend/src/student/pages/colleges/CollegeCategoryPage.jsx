import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collegeService } from '../../services'
import { SCard, SBadge, SLoader, SEmpty, SBtn, SInput } from '../../components/ui'
import { FiMapPin, FiChevronLeft, FiSearch, FiExternalLink } from 'react-icons/fi'

const STREAM_STYLE = {
  Engineering:          { color: '#1d5fba', bg: '#eaf0fb', icon: '⚙️' },
  Medical:              { color: '#16a34a', bg: '#f0fdf4', icon: '🩺' },
  'Arts & Science':     { color: '#7c3aed', bg: '#f3effe', icon: '🎭' },
  Law:                  { color: '#c48a1a', bg: '#fdf4e0', icon: '⚖️' },
  Commerce:             { color: '#10b981', bg: '#ecfdf5', icon: '📊' },
  Management:           { color: '#2563eb', bg: '#dbeafe', icon: '👔' },
  Architecture:         { color: '#0891b2', bg: '#ecfeff', icon: '🏛️' },
  Design:               { color: '#db2777', bg: '#fce7f3', icon: '🎨' },
  Polytechnic:          { color: '#e05e24', bg: '#fdeee6', icon: '🔧' },
  ITI:                  { color: '#475569', bg: '#f1f5f9', icon: '🛠️' },
  Agriculture:          { color: '#15803d', bg: '#dcfce7', icon: '🌱' },
  'IT & Computer':      { color: '#6366f1', bg: '#eef2ff', icon: '💻' },
  'Hotel Management':   { color: '#f59e0b', bg: '#fffbeb', icon: '🏨' },
  'Media & Journalism': { color: '#ef4444', bg: '#fef2f2', icon: '📰' },
  Others:               { color: '#64748b', bg: '#f1f5f9', icon: '🎓' },
}

export default function CollegeCategoryPage() {
  const { categoryName } = useParams()
  const navigate = useNavigate()

  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const decodedCategory = decodeURIComponent(categoryName || '')
  const sc = STREAM_STYLE[decodedCategory] || STREAM_STYLE.Others

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true)
        // Pass stream as a query param so backend filters server-side
        const res = await collegeService.getAll({ stream: decodedCategory })
        // Backend returns: { success, count, data: [...] }
        const list = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : []
        setColleges(list)
      } catch (err) {
        console.error('[CollegeCategoryPage] Fetch error:', err)
        setColleges([])
      } finally {
        setLoading(false)
      }
    }
    if (decodedCategory) fetchColleges()
  }, [decodedCategory])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return colleges
    return colleges.filter(c =>
      (c.collegeName || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q)
    )
  }, [colleges, search])

  return (
    <div className="student-root" style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Gradient Header */}
      <div style={{
        background: `linear-gradient(135deg, ${sc.color} 0%, #1e293b 100%)`,
        padding: '60px 24px', color: '#fff'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', padding: '8px 18px', borderRadius: 12,
              cursor: 'pointer', marginBottom: 28, fontWeight: 700, fontSize: 13
            }}
          >
            <FiChevronLeft size={16} /> Back to Colleges
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(255,255,255,0.15)',
              display: 'grid', placeItems: 'center', fontSize: 32, flexShrink: 0
            }}>
              {sc.icon}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: '0 0 8px' }}>
                {decodedCategory} Colleges
              </h1>
              <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>
                {loading ? 'Loading...' : `${colleges.length} institutions found across Tamil Nadu`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '-28px auto 60px', padding: '0 24px' }}>

        {/* Search bar */}
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '20px 24px', marginBottom: 28,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ flex: 1 }}>
            <SInput
              placeholder={`Search ${decodedCategory} colleges by name or district...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            >
              Clear
            </button>
          )}
          <div style={{
            background: sc.bg, color: sc.color, padding: '8px 16px',
            borderRadius: 12, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap'
          }}>
            {filtered.length} / {colleges.length}
          </div>
        </div>

        {/* College grid */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: 100, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <SLoader />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: 80, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <SEmpty
              icon={sc.icon}
              title={search ? `No matches for "${search}"` : `No ${decodedCategory} colleges found`}
              desc={search ? 'Try a different search term.' : 'Our admin team is constantly adding new institutions. Please check back later.'}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filtered.map(college => (
              <SCard
                key={college._id}
                hover
                style={{ borderTop: `4px solid ${sc.color}`, cursor: 'pointer', transition: 'all 0.22s ease' }}
                onClick={() => navigate(`/student/colleges/${college._id}`)}
              >
                <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: sc.bg, color: sc.color,
                    display: 'grid', placeItems: 'center', fontSize: 24, flexShrink: 0
                  }}>
                    {sc.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 6px', fontSize: 16, fontWeight: 900, lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {college.collegeName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                      <FiMapPin size={13} />
                      <span>{[college.district, college.location].filter(Boolean).join(', ') || 'Tamil Nadu'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <SBadge color="blue">{college.stream}</SBadge>
                  {college.accreditation && <SBadge color="green">⭐ {college.accreditation}</SBadge>}
                  {college.type && (
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, alignSelf: 'center' }}>
                      {college.type}
                    </span>
                  )}
                </div>

                {college.website && (
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🔗 {college.website.replace(/^https?:\/\//, '')}
                  </div>
                )}

                <div style={{ paddingTop: 14, borderTop: '1px solid var(--s-border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <SBtn variant="primary" size="sm" style={{ borderRadius: 10 }}>View Details</SBtn>
                </div>
              </SCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
