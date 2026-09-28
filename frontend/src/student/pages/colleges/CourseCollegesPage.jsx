import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiSearch, FiMapPin, FiRefreshCw, FiBookOpen, FiClock
} from 'react-icons/fi'
import { SBtn, SEmpty } from '../../components/ui'
import InsightRow, { StatusBadge, TypeBadge, Chip } from '../../components/colleges/InsightRow'
import { collegesInsightService } from '../../../services/collegesInsightService'
import { getInsightStyle, getLevelLabel } from '../../../constants/collegesInsightTheme'

const PAGE_SIZE = 100

/** Normalize a string for search matching (lowercase, collapse whitespace). */
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * /student/class12/colleges/:category/course/:courseId
 * Step 3a — colleges that offer a specific course. The full college list is
 * fetched (all server pages) so nothing is hidden; search filters
 * client-side over the complete list. Rows reuse the shared InsightRow card
 * and drill into the college detail page.
 */
export default function CourseCollegesPage() {
  const { category, courseId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [colleges, setColleges] = useState([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('') // '' = all districts
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false) // course archived/no longer public

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(false)
    setNotFound(false)
    try {
      const all = []
      let total = 0
      let page = 1
      let totalPages = 1
      do {
        const res = await collegesInsightService.getColleges(category, courseId, { page, limit: PAGE_SIZE })
        if (!res.success) throw new Error('load failed')
        total = res.count || 0
        totalPages = res.totalPages || 0
        if (page === 1) setCourse(res.course || null)
        all.push(...(res.data || []))
        page += 1
      } while (page <= totalPages)
      setColleges(all)
      setCount(total)
    } catch (err) {
      console.error('Error fetching course colleges', err)
      // 404 = the course was archived or removed by an admin after this link
      // was opened → show a clear "no longer available" state instead of a
      // Retry loop.
      setNotFound(err && err.response && err.response.status === 404)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [category, courseId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const filtered = useMemo(() => {
    const q = norm(search)
    let list = colleges
    if (districtFilter) list = list.filter((c) => (c.district || '') === districtFilter)
    if (!q) return list
    return list.filter(
      (c) =>
        norm(c.name).includes(q) ||
        norm(c.location).includes(q)
    )
  }, [colleges, search, districtFilter])

  // Distinct districts among the colleges offering this course (from the API).
  const districts = useMemo(() => {
    const set = new Set()
    for (const c of colleges) if (c.district) set.add(c.district)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [colleges])

  const style = getInsightStyle(category)
  const backToCategory = () => navigate(`/student/class12/colleges/${category}`)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 80px', fontFamily: 'var(--s-font-display)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button
          onClick={backToCategory}
          aria-label="Back"
          style={{
            width: 44, height: 44, borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#fff',
            color: '#475569', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)', transition: 'all 0.2s ease',
          }}
        >
          <FiArrowLeft size={20} />
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800,
              color: style.color, background: style.bg, padding: '4px 12px', borderRadius: 99,
            }}>
              {style.icon} {style.short}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Course → Colleges</span>
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
            {course ? course.name : 'Colleges offering this course'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            {count} college{count === 1 ? '' : 's'} offer{count === 1 ? 's' : ''} this course
          </p>
          {course && (course.category || course.level || course.duration) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {course.category && <Chip>{course.category}</Chip>}
              {course.level && <Chip>{getLevelLabel(course.level)}</Chip>}
              {course.duration && <Chip icon={<FiClock size={13} color="#94a3b8" />}>{course.duration}</Chip>}
            </div>
          )}
          {course && (course.description || course.eligibility) && (
            <p style={{ margin: '12px 0 0', fontSize: 14.5, color: '#64748b', lineHeight: 1.55 }}>
              {course.description}
              {course.description && course.eligibility ? ' ' : ''}
              {course.eligibility && (
                <strong style={{ color: '#334155' }}>Eligibility: {course.eligibility}</strong>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', margin: '24px 0', maxWidth: 460 }}>
        <FiSearch size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search colleges by name or location..."
          style={{
            width: '100%', padding: '14px 18px 14px 46px', borderRadius: 14,
            border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', background: '#fff',
            color: '#1e293b', boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
            fontFamily: 'var(--s-font-display)',
          }}
        />
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '24px 28px' }}>
              <div style={{ width: '55%', height: 18, borderRadius: 8, background: '#f1f5f9', marginBottom: 10 }} />
              <div style={{ width: 160, height: 26, borderRadius: 99, background: '#eef2ff' }} />
            </div>
          ))}
        </div>
      ) : notFound ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiBookOpen /></div>
          <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>This course is no longer available</p>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
            It was removed or replaced by an admin. Browse the latest {style.short} courses instead.
          </p>
          <SBtn variant="outline" size="sm" onClick={backToCategory}><FiArrowLeft size={14} /> Back to {style.short} courses</SBtn>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiMapPin /></div>
          <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>Couldn't load these colleges</p>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>Please try again in a moment.</p>
          <SBtn variant="outline" size="sm" onClick={loadAll}><FiRefreshCw size={14} /> Retry</SBtn>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
          <SEmpty
            icon={<FiBookOpen size={48} />}
            title={search || districtFilter ? 'No matching colleges' : 'No colleges mapped yet for this course'}
            desc={search || districtFilter ? 'Try a different search term or district.' : 'Ask your admin to verify a mapping for this course — colleges will appear here.'}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {districts.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['', ...districts].map((d) => {
                const active = (districtFilter || '') === d
                return (
                  <button
                    key={d || 'all-districts'}
                    onClick={() => setDistrictFilter(d)}
                    style={{
                      padding: '7px 14px', borderRadius: 99, border: active ? '1.5px solid #1e293b' : '1.5px solid #e2e8f0',
                      background: active ? '#1e293b' : '#fff', color: active ? '#fff' : '#475569',
                      fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--s-font-display)',
                    }}
                  >
                    {d || 'All districts'}
                  </button>
                )
              })}
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            {search || districtFilter
              ? `${filtered.length} of ${count} colleges match`
              : `${count} college${count === 1 ? '' : 's'} offer this course`}
          </div>
          {filtered.map((col) => (
            <InsightRow
              key={col.id}
              title={col.name}
              onOpen={() => navigate(`/student/class12/colleges/${category}/college/${col.id}`)}
              accentColor={style.color}
              accentBg={style.bg}
              footer={
                <>
                  {col.location && (
                    <Chip icon={<FiMapPin size={13} color="#f59e0b" />}>{col.location}</Chip>
                  )}
                  <TypeBadge type={col.type} />
                  <StatusBadge status={col.status} />
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}