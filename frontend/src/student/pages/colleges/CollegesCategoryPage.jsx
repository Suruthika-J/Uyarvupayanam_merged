import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiSearch, FiClock, FiHome,
  FiMapPin, FiRefreshCw, FiBookOpen
} from 'react-icons/fi'
import { SBtn, SEmpty } from '../../components/ui'
import InsightRow, { StatusBadge, TypeBadge, Chip } from '../../components/colleges/InsightRow'
import { collegesInsightService } from '../../../services/collegesInsightService'
import { getInsightStyle, getInsightShortLabel, getLevelLabel } from '../../../constants/collegesInsightTheme'

const COLLEGE_PAGE_SIZE = 100

/** Normalize a string for search matching (lowercase, collapse whitespace). */
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * /student/class12/colleges/:category
 * Step 2 — stream drill-down with a "By Course" (default) / "By College"
 * toggle. Courses and colleges are both fetched in full (all pages) so every
 * item is visible at once; search filters client-side over the complete list.
 * Tapping any row routes to the matching detail view (Step 3a / Step 3b).
 */
export default function CollegesCategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()

  const [tab, setTab] = useState('courses') // 'courses' | 'colleges'
  const [label, setLabel] = useState('')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('') // '' = all levels
  const [districtFilter, setDistrictFilter] = useState('') // '' = all districts

  // Category totals from the summary endpoint, shown on the toggle pills.
  const [summaryCounts, setSummaryCounts] = useState(null)

  // —— By Course state ——
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(false)

  // —— By College state (fetched in full, client-side search) ——
  const [colleges, setColleges] = useState([])
  const [collegeCount, setCollegeCount] = useState(0)
  const [collegesLoading, setCollegesLoading] = useState(false)
  const [collegesError, setCollegesError] = useState(false)

  const loadCourses = useCallback(async () => {
    if (!category) return
    setCoursesLoading(true)
    setCoursesError(false)
    try {
      const res = await collegesInsightService.getCourses(category)
      if (res.success) {
        setLabel(res.label || '')
        setCourses(res.data || [])
      } else {
        setCoursesError(true)
      }
    } catch (err) {
      console.error('Error fetching category courses', err)
      setCoursesError(true)
    } finally {
      setCoursesLoading(false)
    }
  }, [category])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  // Reset filters whenever the stream changes (fresh start per category).
  useEffect(() => {
    setSearch('')
    setLevelFilter('')
    setDistrictFilter('')
  }, [category])

  // Fetch the category's live totals for the toggle pill counts.
  useEffect(() => {
    let cancelled = false
    collegesInsightService.getSummary()
      .then((res) => {
        if (cancelled || !res.success) return
        const row = (res.data || []).find((r) => r.category === category)
        if (row) setSummaryCounts({ courseCount: row.courseCount, collegeCount: row.collegeCount })
      })
      .catch(() => { /* non-fatal — pills fall back to local counts */ })
    return () => { cancelled = true }
  }, [category])

  const filtered = useMemo(() => {
    const q = norm(search)
    let list = courses
    if (levelFilter) list = list.filter((c) => (c.level || '') === levelFilter)
    if (!q) return list
    return list.filter((c) => norm(c.name).includes(q))
  }, [courses, search, levelFilter])

  // Distinct level values present in this stream (single source of truth:
  // comes from the API, so an admin adding a new level shows automatically).
  const levels = useMemo(() => {
    const set = new Set()
    for (const c of courses) if (c.level) set.add(c.level)
    return [...set].sort()
  }, [courses])

  // Fetch EVERY college in the category (walks all server pages) so the
  // complete list is available for instant client-side search.
  const loadAllColleges = useCallback(async () => {
    setCollegesLoading(true)
    setCollegesError(false)
    try {
      const all = []
      let total = 0
      let page = 1
      let totalPages = 1
      do {
        const res = await collegesInsightService.getStreamColleges(category, { page, limit: COLLEGE_PAGE_SIZE })
        if (!res.success) throw new Error('load failed')
        total = res.count || 0
        totalPages = res.totalPages || 0
        all.push(...(res.data || []))
        page += 1
      } while (page <= totalPages)
      setColleges(all)
      setCollegeCount(total)
    } catch (err) {
      console.error('Error fetching category colleges', err)
      setCollegesError(true)
    } finally {
      setCollegesLoading(false)
    }
  }, [category])

  useEffect(() => {
    if (tab !== 'colleges') return
    loadAllColleges()
  }, [tab, loadAllColleges])

  const filteredColleges = useMemo(() => {
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

  // Distinct districts in this stream, derived from the fetched data.
  const districts = useMemo(() => {
    const set = new Set()
    for (const c of colleges) if (c.district) set.add(c.district)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [colleges])

  const switchTab = (next) => {
    if (next === tab) return
    setTab(next)
    setSearch('')
  }

  const style = getInsightStyle(category)
  const shortLabel = getInsightShortLabel(category, label)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 80px', fontFamily: 'var(--s-font-display)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/student/class12?section=Colleges')}
          aria-label="Back to Colleges"
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
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
            {shortLabel}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Pick a course to see its colleges, or browse the colleges in this stream
          </p>
        </div>
      </div>

      {/* By Course / By College toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'courses', label: 'By Course', icon: <FiBookOpen size={15} />, count: summaryCounts ? summaryCounts.courseCount : filtered.length },
          { key: 'colleges', label: 'By College', icon: <FiMapPin size={15} />, count: summaryCounts ? summaryCounts.collegeCount : (tab === 'colleges' ? collegeCount : null) },
        ].map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 99,
                border: active ? '1.5px solid #1e293b' : '1.5px solid #e2e8f0',
                background: active ? '#1e293b' : '#fff',
                color: active ? '#fff' : '#475569',
                fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--s-font-display)',
                boxShadow: active ? '0 8px 16px -6px rgba(15,23,42,0.35)' : '0 2px 6px -1px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              {t.icon}
              {t.label}
              {t.count !== null && (
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 99,
                  background: active ? 'rgba(255,255,255,0.18)' : '#f1f5f9',
                  color: active ? '#fff' : '#64748b',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 460 }}>
        <FiSearch size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'courses'
            ? `Search ${shortLabel.toLowerCase()} courses...`
            : 'Search colleges by name or location...'}
          style={{
            width: '100%', padding: '14px 18px 14px 46px', borderRadius: 14,
            border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', background: '#fff',
            color: '#1e293b', boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
            fontFamily: 'var(--s-font-display)',
          }}
        />
      </div>

      {/* —— By Course body —— */}
      {tab === 'courses' && (
        coursesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '24px 28px' }}>
                <div style={{ width: '55%', height: 18, borderRadius: 8, background: '#f1f5f9', marginBottom: 10 }} />
                <div style={{ width: '80%', height: 13, borderRadius: 8, background: '#f8fafc', marginBottom: 14 }} />
                <div style={{ width: 160, height: 26, borderRadius: 99, background: '#eef2ff' }} />
              </div>
            ))}
          </div>
        ) : coursesError ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiBookOpen /></div>
            <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>Couldn't load these courses</p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>Please try again in a moment.</p>
            <SBtn variant="outline" size="sm" onClick={loadCourses}><FiRefreshCw size={14} /> Retry</SBtn>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
            <SEmpty
              icon={<FiBookOpen size={48} />}
              title={search ? 'No matching courses' : 'No courses added yet for this category'}
              desc={search ? 'Try a different search term.' : 'Ask your admin to add courses for this category — they will appear here automatically.'}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {levels.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['', ...levels].map((lv) => {
                  const active = (levelFilter || '') === lv
                  return (
                    <button
                      key={lv || 'all-levels'}
                      onClick={() => setLevelFilter(lv)}
                      style={{
                        padding: '7px 14px', borderRadius: 99, border: active ? '1.5px solid #1e293b' : '1.5px solid #e2e8f0',
                        background: active ? '#1e293b' : '#fff', color: active ? '#fff' : '#475569',
                        fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--s-font-display)',
                      }}
                    >
                      {lv ? getLevelLabel(lv) : 'All levels'}
                    </button>
                  )
                })}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
              {search || levelFilter
                ? `${filtered.length} of ${courses.length} courses`
                : `${filtered.length} ${filtered.length === 1 ? 'course' : 'courses'}`}
            </div>
            {filtered.map((course) => (
              <InsightRow
                key={course.id}
                title={course.name}
                subtitle={course.description || undefined}
                onOpen={() => navigate(`/student/class12/colleges/${category}/course/${course.id}`)}
                accentColor={style.color}
                accentBg={style.bg}
                footer={
                  <>
                    {course.level && (
                      <Chip>{getLevelLabel(course.level)}</Chip>
                    )}
                    {course.duration && (
                      <Chip icon={<FiClock size={13} color="#94a3b8" />}>{course.duration}</Chip>
                    )}
                    <Chip icon={<FiHome size={13} color="#4f46e5" />}>
                      {course.collegeCount} college{course.collegeCount === 1 ? '' : 's'} offer this
                    </Chip>
                  </>
                }
              />
            ))}
          </div>
        )
      )}

      {/* —— By College body —— */}
      {tab === 'colleges' && (
        collegesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '24px 28px' }}>
                <div style={{ width: '55%', height: 18, borderRadius: 8, background: '#f1f5f9', marginBottom: 10 }} />
                <div style={{ width: '70%', height: 13, borderRadius: 8, background: '#f8fafc', marginBottom: 14 }} />
                <div style={{ width: 200, height: 26, borderRadius: 99, background: '#eef2ff' }} />
              </div>
            ))}
          </div>
        ) : collegesError ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiMapPin /></div>
            <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>Couldn't load these colleges</p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>Please try again in a moment.</p>
            <SBtn variant="outline" size="sm" onClick={loadAllColleges}><FiRefreshCw size={14} /> Retry</SBtn>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
            <SEmpty
              icon={<FiMapPin size={48} />}
              title={search ? 'No matching colleges' : 'No colleges mapped yet in this stream'}
              desc={search ? 'Try a different search term.' : 'Ask your admin to map courses to colleges — they will appear here automatically.'}
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
                ? `${filteredColleges.length} of ${collegeCount} colleges match`
                : `${collegeCount} college${collegeCount === 1 ? '' : 's'} in this stream`}
            </div>
            {filteredColleges.map((col) => (
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
                    <Chip icon={<FiBookOpen size={13} color="#6366f1" />}>
                      {col.courseCount} course{col.courseCount === 1 ? '' : 's'}
                    </Chip>
                  </>
                }
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}