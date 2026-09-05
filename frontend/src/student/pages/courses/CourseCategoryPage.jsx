import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronDown, FiClock, FiFilter, FiSearch, FiTarget, FiArrowRight, FiInfo, FiMapPin } from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { courseService } from '../../../services/courseService'
import { SBadge, SBtn, SEmpty, SInput, SLoader, SSelect } from '../../components/ui'
import {
  COURSE_LEVEL_MAP,
  COURSE_LEVEL_CONFIGS,
  COURSE_CATEGORIES,
  extractCoursesResponse,
  getCourseDisplayName,
  getCourseLevelLabel,
  getCategoryColor,
} from './courseCatalog'

const PAGE_SIZE = 12

function CategoryTag({ category }) {
  const color = getCategoryColor(category)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: `${color}1a`, color, fontSize: 11.5, fontWeight: 800,
      padding: '4px 10px', borderRadius: 999, letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0 }} />
      {category}
    </span>
  )
}

function CourseCard({ course }) {
  const navigate = useNavigate()
  const courseId = course.slug || course._id
  const levelLabel = getCourseLevelLabel(course)

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--s-border)',
      borderRadius: 16,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'all 0.22s ease',
      boxShadow: 'var(--s-shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <CategoryTag category={course.category} />
            <SBadge color="gray" style={{ background: '#f1f5f9', color: '#475569' }}>{levelLabel}</SBadge>
          </div>
          <h2 style={{
            fontFamily: 'var(--s-font-display)',
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--s-text)',
            lineHeight: 1.4,
            margin: '0 0 6px',
          }}>
            {getCourseDisplayName(course)}
          </h2>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--s-text3)' }}>
        {course.futureScope && course.futureScope.length > 120 ? course.futureScope.slice(0, 117) + '...' : course.futureScope || 'Detailed curriculum and professional guidance for students.'}
      </p>

      <div style={{ display: 'flex', gap: 20, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--s-text2)', fontWeight: 600 }}>
          <FiClock size={15} color="#64748b" />
          <span>{course.duration}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--s-text2)', fontWeight: 600 }}>
          <FiTarget size={15} color="#64748b" />
          <span>{course.eligibility?.split(',')[0]}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <button
          onClick={() => navigate(`/student/course/${encodeURIComponent(courseId)}`)}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: 'transparent',
            border: '1.5px solid var(--s-primary)',
            color: 'var(--s-primary)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--s-font-display)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          View Details
          <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

function CategorySection({ title, courses, accent }) {
  const [expanded, setExpanded] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const shown = courses.slice(0, visibleCount)
  const hasMore = courses.length > visibleCount

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--s-border)',
      borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      <button
        onClick={() => { setExpanded(o => !o); if (!expanded) setVisibleCount(PAGE_SIZE) }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 22px', border: 'none', background: 'transparent',
          cursor: 'pointer', fontFamily: 'var(--s-font-display)', textAlign: 'left',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 3, background: accent, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 16, fontWeight: 800, color: 'var(--s-text)' }}>
          {title}
          <span style={{ fontWeight: 700, color: accent, marginLeft: 8 }}>({courses.length})</span>
        </span>
        <span style={{ color: 'var(--s-text3)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {expanded ? 'Collapse' : 'Expand'}
          <FiChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '6px 22px 22px' }}>
          {shown.length === 0 ? (
            <div style={{ fontSize: 13.5, color: 'var(--s-text3)', fontWeight: 600 }}>No courses match the current filters in this category.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {shown.map(course => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>
          )}

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <SBtn
                variant="outline"
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                style={{ borderRadius: 10, padding: '8px 24px', fontWeight: 700 }}
              >
                Show more ({courses.length - visibleCount} remaining)
              </SBtn>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CourseCategoryPage() {
  const { categoryKey } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const urlLevel = searchParams.get('level')
  const { isAuthenticated } = useStudentAuth()

  const isSearchMode = categoryKey === 'search'
  const config = !isSearchMode ? COURSE_LEVEL_MAP[categoryKey] : null

  const normalizeLevel = (val) => {
    if (!val || String(val).toLowerCase() === 'all') return 'All'
    const map = { '10': 'After 10th', '12': 'After 12th', 'Diploma': 'Diploma', 'Undergraduate': 'Undergraduate' }
    return map[val] || val
  }

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState(urlCategory || 'All')
  const [levelFilter, setLevelFilter] = useState(normalizeLevel(urlLevel || (config ? config.targetLevel || config.level : 'All')))

  // FETCH DATA
  useEffect(() => {
    setLoading(true)
    const params = {}
    if (!isSearchMode && config?.targetLevel) {
      params.targetLevel = config.targetLevel
    } else if (levelFilter !== 'All') {
      params.targetLevel = levelFilter
    }
    if (streamFilter !== 'All') params.category = streamFilter

    courseService.getAll(params)
      .then((response) => {
        setCourses(extractCoursesResponse(response))
      })
      .catch((err) => {
        console.error('Error fetching courses:', err)
        setCourses([])
      })
      .finally(() => setLoading(false))
  }, [config, streamFilter, levelFilter, isSearchMode])

  // Sync state if URL search param changes
  useEffect(() => {
    if (urlCategory) setStreamFilter(urlCategory)
    if (urlLevel) setLevelFilter(normalizeLevel(urlLevel))
  }, [urlCategory, urlLevel])

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses

    return courses.filter((course) => {
      return [
        getCourseDisplayName(course),
        course.category,
        course.eligibility,
        course.futureScope,
      ].some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [courses, search])

  // Group by category when showing all; otherwise single group
  const grouped = useMemo(() => {
    const groups = {}
    visibleCourses.forEach(course => {
      const cat = course.category || 'Others'
      if (!groups[cat]) groups[cat] = { title: cat, courses: [] }
      groups[cat].courses.push(course)
    })
    return Object.values(groups).sort((a, b) => b.courses.length - a.courses.length)
  }, [visibleCourses])

  const totalCount = grouped.reduce((s, g) => s + g.courses.length, 0)
  const accentColor = config?.accent || '#0f4c75'

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>

      {/* Modern Page Header */}
      <section style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          padding: '40px', background: '#fff', border: '1px solid var(--s-border)',
          borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div>
            <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--s-text3)', textDecoration: 'none', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <FiArrowLeft size={16} /> Course Browser Dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 38px)', color: 'var(--s-text)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              {isSearchMode ? (streamFilter === 'All' ? 'All Courses' : `${streamFilter} Courses`) : config.heading}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: 'var(--s-text3)', lineHeight: 1.7, maxWidth: 840 }}>
              {isSearchMode ? `Browse ${totalCount} programs across every stream — Engineering, Medical, Arts, Science, Commerce, Law, Polytechnic, ITI and more — dynamically tracked against Tamil Nadu colleges.` : config.description}
            </p>
          </div>

          {/* Filters Bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14,
            marginTop: 32, paddingTop: 32, borderTop: '1px solid #f1f5f9'
          }}>
            <SInput
              placeholder="Real-time search by course, skills, or career scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<FiSearch />}
            />
            <SSelect
              value={streamFilter}
              onChange={(e) => {
                setStreamFilter(e.target.value)
                setSearchParams({ category: e.target.value, level: levelFilter })
              }}
              style={{ width: 240 }}
            >
              <option value="All">All Streams</option>
              {COURSE_CATEGORIES.map(oc => (
                <option key={oc.key} value={oc.title}>{oc.title}</option>
              ))}
            </SSelect>
            <SSelect
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value)
                setSearchParams({ category: streamFilter, level: e.target.value })
              }}
              style={{ width: 180 }}
            >
              <option value="All">All Levels</option>
              <option value="After 10th">After 10th</option>
              <option value="After 12th">After 12th</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate</option>
            </SSelect>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 4px' }}>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontSize: 18, fontWeight: 800, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiFilter size={18} color={accentColor} /> Total Courses Found: {totalCount}
          </h2>
        </div>

        {loading ? <SLoader /> : visibleCourses.length === 0 ? (
          <div style={{ height: '400px', display: 'grid', placeItems: 'center' }}>
            <SEmpty
              icon={<FiSearch size={48} />}
              title={streamFilter !== 'All' ? `No ${streamFilter} programs available yet` : "No matches found"}
              desc={`Our admin team is constantly updating new courses for ${streamFilter}. Please check back later or try changing your filters.`}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {grouped.map(group => (
              <CategorySection
                key={group.title}
                title={group.title}
                courses={group.courses}
                accent={getCategoryColor(group.title)}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section style={{ maxWidth: 1000, margin: '60px auto 0', padding: '0 24px' }}>
          <div style={{
            background: 'var(--s-primary)', color: '#fff',
            borderRadius: 24, padding: '40px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(15, 76, 117, 0.15)'
          }}>
            <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 24, margin: '0 0 12px' }}>
              Want to apply for these programs?
            </h3>
            <p style={{ margin: '0 auto 24px', opacity: 0.8, maxWidth: 640, fontSize: 15.5, lineHeight: 1.7 }}>
              Create an account to track entrance dates, scholarship deadlines, and college admission portals for all these courses.
            </p>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <SBtn variant="white" size="lg">Join Uyarvu Payanam Free</SBtn>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}