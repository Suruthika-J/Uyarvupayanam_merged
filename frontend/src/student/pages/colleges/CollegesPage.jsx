import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { collegeService } from '../../services'
import { userActionService } from '../../../services/userActionService'
import { SCard, SBadge, SLoader, SEmpty, SInput, SSelect, SBtn } from '../../components/ui'
import { FiMapPin, FiSearch, FiBookmark, FiArrowRight, FiGrid, FiList, FiX } from 'react-icons/fi'

// Must match the admin STREAMS list exactly
const STREAMS = [
  'Engineering', 'Medical', 'Arts & Science', 'Law', 'Commerce', 'Management',
  'IT & Computer', 'Agriculture', 'Architecture', 'Design', 'Hotel Management',
  'ITI', 'Polytechnic', 'Media & Journalism', 'Others'
]

const TN_DISTRICTS = [
  'All', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
]

const STREAM_STYLE = {
  Engineering:        { color: '#1d5fba', bg: '#eaf0fb', icon: '⚙️' },
  Medical:            { color: '#16a34a', bg: '#f0fdf4', icon: '🩺' },
  'Arts & Science':   { color: '#7c3aed', bg: '#f3effe', icon: '🎭' },
  Law:                { color: '#c48a1a', bg: '#fdf4e0', icon: '⚖️' },
  Polytechnic:        { color: '#e05e24', bg: '#fdeee6', icon: '🔧' },
  Agriculture:        { color: '#15803d', bg: '#dcfce7', icon: '🌱' },
  Commerce:           { color: '#10b981', bg: '#ecfdf5', icon: '📊' },
  Management:         { color: '#2563eb', bg: '#dbeafe', icon: '👔' },
  Architecture:       { color: '#0891b2', bg: '#ecfeff', icon: '🏛️' },
  Design:             { color: '#db2777', bg: '#fce7f3', icon: '🎨' },
  ITI:                { color: '#475569', bg: '#f1f5f9', icon: '🛠️' },
  'IT & Computer':    { color: '#6366f1', bg: '#eef2ff', icon: '💻' },
  'Hotel Management': { color: '#f59e0b', bg: '#fffbeb', icon: '🏨' },
  'Media & Journalism': { color: '#ef4444', bg: '#fef2f2', icon: '📰' },
  Others:             { color: '#64748b', bg: '#f1f5f9', icon: '🎓' },
}

// ─── Helper ──────────────────────────────────────────────────────────────
function extractColleges(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

// ─── CollegeCard ─────────────────────────────────────────────────────────
function CollegeCard({ college, isSaved, onToggleSave }) {
  const navigate = useNavigate()
  const sc = STREAM_STYLE[college.stream] || STREAM_STYLE.Others

  return (
    <SCard
      hover
      style={{ borderTop: `3px solid ${sc.color}`, position: 'relative', cursor: 'pointer', transition: 'all 0.22s ease' }}
      onClick={() => navigate(`/student/colleges/${college._id}`)}
    >
      {/* Bookmark button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(college._id) }}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: isSaved ? 'var(--s-primary)' : 'rgba(0,0,0,0.05)',
          border: 'none', borderRadius: '50%', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: isSaved ? '#fff' : 'var(--s-text3)', zIndex: 5, transition: '0.2s'
        }}
        title={isSaved ? 'Remove from saved' : 'Save college'}
      >
        <FiBookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingRight: 40 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: sc.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
        }}>
          {sc.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 14.5,
            color: 'var(--s-text)', marginBottom: 4, lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {college.collegeName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--s-text3)' }}>
            <FiMapPin size={11} />
            <span>{[college.district, college.location].filter(Boolean).join(', ') || 'Tamil Nadu'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <SBadge color="blue">{college.stream || 'General'}</SBadge>
        {college.accreditation && (
          <SBadge color="green">⭐ {college.accreditation}</SBadge>
        )}
        {college.type && (
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{college.type}</span>
        )}
      </div>

      {college.website && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          🔗 {college.website.replace(/^https?:\/\//, '')}
        </div>
      )}

      <div style={{ paddingTop: 12, borderTop: '1px solid var(--s-border)', display: 'flex', justifyContent: 'flex-end' }}>
        <SBtn variant="primary" size="sm" style={{ borderRadius: 10 }}>View Details</SBtn>
      </div>
    </SCard>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CollegesPage() {
  const { isAuthenticated } = useStudentAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // All colleges fetched from API (no server-side filter — fetch all, filter client-side)
  const [allColleges, setAllColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Active filters
  const [activeStream, setActiveStream] = useState('All')
  const [activeDistrict, setActiveDistrict] = useState('All')
  const [search, setSearch] = useState('')

  // Bookmarks
  const [savedIds, setSavedIds] = useState(new Set())

  // ── Fetch all colleges once ──
  const fetchColleges = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await collegeService.getAll()          // GET /api/colleges
      const list = extractColleges(res)
      console.log(`[CollegesPage] Fetched ${list.length} colleges`, list.slice(0, 3))
      setAllColleges(list)
    } catch (err) {
      console.error('[CollegesPage] Fetch error:', err)
      setError('Failed to load colleges. Please refresh.')
      setAllColleges([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchColleges() }, [fetchColleges])

  // ── Fetch saved colleges (authenticated) ──
  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await userActionService.getSavedList('College')
      const ids = (res?.data || []).map(item => item.contentId?._id || item.contentId).filter(Boolean)
      setSavedIds(new Set(ids))
    } catch (err) {
      console.error('[CollegesPage] Saved fetch error:', err)
    }
  }, [isAuthenticated])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  // ── Category counts — based on stream field ──
  const streamCounts = useMemo(() => {
    const counts = {}
    STREAMS.forEach(s => { counts[s] = 0 })
    allColleges.forEach(c => {
      const s = (c.stream || '').trim()
      if (counts[s] !== undefined) counts[s]++
      else if (s) counts['Others'] = (counts['Others'] || 0) + 1
    })
    return counts
  }, [allColleges])

  // Only show category cards that have at least 1 college
  const activeCategories = useMemo(() =>
    STREAMS.filter(s => streamCounts[s] > 0),
    [streamCounts]
  )

  // ── Filtered college list ──
  const filteredColleges = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allColleges.filter(c => {
      const collegeStream = (c.stream || '').trim()
      const matchesStream   = activeStream === 'All' || collegeStream === activeStream
      const matchesDistrict = activeDistrict === 'All' ||
        (c.district || '').toLowerCase() === activeDistrict.toLowerCase()
      const matchesSearch   = !q ||
        (c.collegeName || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q)
      return matchesStream && matchesDistrict && matchesSearch
    })
  }, [allColleges, activeStream, activeDistrict, search])

  // ── Toggle bookmark ──
  const handleToggleSave = async (id) => {
    if (!isAuthenticated) return navigate('/student/signin')
    try {
      if (savedIds.has(id)) {
        await userActionService.unsaveItem(id)
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      } else {
        await userActionService.saveItem(id, 'College')
        setSavedIds(prev => new Set([...prev, id]))
      }
    } catch (err) { console.error(err) }
  }

  // ── Helpers ──
  const handleStreamClick = (stream) => {
    setActiveStream(prev => prev === stream ? 'All' : stream)
    setSearch('')
  }

  const clearFilters = () => {
    setActiveStream('All')
    setActiveDistrict('All')
    setSearch('')
  }

  const hasActiveFilter = activeStream !== 'All' || activeDistrict !== 'All' || search !== ''

  return (
    <div className="student-root" style={{ padding: '32px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 36 }} className="s-anim-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 900,
              fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--s-text)', marginBottom: 8
            }}>
              🏫 College Exploration Hub
            </h1>
            <p style={{ fontSize: 15, color: 'var(--s-text3)', maxWidth: 580, margin: 0 }}>
              Discover {allColleges.length > 0 ? allColleges.length.toLocaleString() : ''} colleges across Tamil Nadu.
              Filter by stream, district, or search by name.
            </p>
          </div>
          <Link to="/student/colleges/explorer" style={{ textDecoration: 'none' }}>
            <SBtn variant="outline" style={{ borderRadius: 12, padding: '10px 18px', border: '2px solid var(--s-primary)', whiteSpace: 'nowrap' }}>
              📚 Course-Wise Lookup
            </SBtn>
          </Link>
        </div>
      </div>

      {/* ── Stream Category Cards ── */}
      <div style={{ marginBottom: 40 }} className="s-anim-up s-d1">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, margin: 0 }}>
            Filter by Stream
          </h2>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <FiX size={14} /> Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', display: 'grid', placeItems: 'center' }}>
            <SLoader />
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>
            {error}
            <button onClick={fetchColleges} style={{ marginLeft: 12, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--s-primary)', fontWeight: 700 }}>
              Retry
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

            {/* All Categories card */}
            <div
              onClick={() => setActiveStream('All')}
              style={{
                background: activeStream === 'All'
                  ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)'
                  : '#fff',
                padding: '20px 24px', borderRadius: 20,
                border: activeStream === 'All' ? '2px solid #4f46e5' : '1px solid #f1f5f9',
                cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: activeStream === 'All' ? '0 8px 20px rgba(79,70,229,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 14,
                color: activeStream === 'All' ? '#fff' : '#1e293b',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: activeStream === 'All' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0
              }}>🌍</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>All Categories</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{allColleges.length} Colleges Total</div>
              </div>
            </div>

            {/* Individual stream cards */}
            {activeCategories.map(streamName => {
              const sc = STREAM_STYLE[streamName] || STREAM_STYLE.Others
              const isActive = activeStream === streamName
              const count = streamCounts[streamName] || 0
              return (
                <div
                  key={streamName}
                  onClick={() => handleStreamClick(streamName)}
                  style={{
                    background: isActive ? sc.bg : '#fff',
                    padding: '20px 24px', borderRadius: 20,
                    border: isActive ? `2px solid ${sc.color}` : '1px solid #f1f5f9',
                    cursor: 'pointer', transition: 'all 0.25s',
                    boxShadow: isActive ? `0 8px 20px ${sc.color}30` : '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: isActive ? '#fff' : sc.bg, color: sc.color,
                      display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0
                    }}>
                      {sc.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{streamName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{count} College{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/colleges/category/${encodeURIComponent(streamName)}`) }}
                    style={{
                      background: isActive ? '#fff' : '#f8fafc',
                      border: `1px solid ${isActive ? sc.color : '#e2e8f0'}`,
                      width: 32, height: 32, borderRadius: 8,
                      display: 'grid', placeItems: 'center',
                      color: sc.color, cursor: 'pointer', transition: '0.2s', flexShrink: 0
                    }}
                    title={`Browse all ${streamName} colleges`}
                  >
                    <FiArrowRight size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── College List ── */}
      <div className="s-anim-up s-d2">

        {/* List header + filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, margin: '0 0 4px' }}>
              {activeStream === 'All' ? 'All Colleges' : `${activeStream} Colleges`}
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
              Showing <strong>{filteredColleges.length}</strong> institution{filteredColleges.length !== 1 ? 's' : ''}
              {activeDistrict !== 'All' && ` in ${activeDistrict}`}
              {search && ` matching "${search}"`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 280 }}>
              <SInput
                placeholder="Search by name, district..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                icon={<FiSearch />}
              />
            </div>
            <div style={{ width: 200 }}>
              <SSelect value={activeDistrict} onChange={e => setActiveDistrict(e.target.value)}>
                {TN_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d === 'All' ? '📍 All Districts' : d}</option>
                ))}
              </SSelect>
            </div>
            <div style={{ width: 200 }}>
              <SSelect value={activeStream} onChange={e => setActiveStream(e.target.value)}>
                <option value="All">🎓 All Streams</option>
                {STREAMS.map(s => (
                  <option key={s} value={s}>{s} {streamCounts[s] > 0 ? `(${streamCounts[s]})` : ''}</option>
                ))}
              </SSelect>
            </div>
          </div>
        </div>

        {/* College grid */}
        {loading ? (
          <div style={{ padding: '80px 0', display: 'grid', placeItems: 'center' }}>
            <SLoader />
          </div>
        ) : filteredColleges.length === 0 ? (
          <SEmpty
            icon="🏫"
            title={
              hasActiveFilter
                ? `No ${activeStream !== 'All' ? activeStream : ''} colleges found`
                : 'No colleges available yet'
            }
            desc={
              hasActiveFilter
                ? 'Try changing your stream, district, or search term.'
                : 'Our admin team is adding colleges soon. Check back later.'
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filteredColleges.map(c => (
              <CollegeCard
                key={c._id}
                college={c}
                isSaved={savedIds.has(c._id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── CTA for guests ── */}
      {!isAuthenticated && (
        <div
          className="s-anim-up"
          style={{
            background: 'var(--s-surface2)', border: '1.5px solid var(--s-border)',
            borderRadius: 24, padding: '40px', textAlign: 'center', marginTop: 60
          }}
        >
          <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: 'var(--s-text)', marginBottom: 8 }}>
            Unlock Full Features
          </h3>
          <p style={{ fontSize: 15, color: 'var(--s-text3)', margin: '0 auto 24px', maxWidth: 500 }}>
            Login to save your favourite colleges, track application deadlines, and get personalised recommendations.
          </p>
          <Link to="/student/signin" state={{ from: location.pathname }} style={{ textDecoration: 'none' }}>
            <SBtn variant="primary" size="lg">Login / Sign Up</SBtn>
          </Link>
        </div>
      )}
    </div>
  )
}
