import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiFilter, FiSearch, FiTarget, FiArrowRight, FiInfo, FiMapPin, FiBookmark } from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { courseService } from '../../services'
import { userActionService } from '../../../services/userActionService'
import { SBadge, SBtn, SEmpty, SInput, SLoader, SSelect } from '../../components/ui'
import EligibilityBanner from '../../components/EligibilityBanner'
import { scopeCoursesForStudent } from '../../utils/schoolEligibility'
import {
  COURSE_LEVEL_MAP,
  COURSE_LEVEL_CONFIGS,
  extractCoursesResponse,
  getCourseDisplayName,
  COURSE_CATEGORIES,
} from './courseCatalog'

function CourseCard({ course, accent, isSaved, onToggleSave }) {
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)
  const [colleges, setColleges] = useState([])
  const [collegesLoading, setCollegesLoading] = useState(false)
  const [collegesFetched, setCollegesFetched] = useState(false)

  const courseId = course.slug || course._id

  useEffect(() => {
    setColleges([])
    setCollegesFetched(false)
  }, [courseId])

  useEffect(() => {
    if (!showDetails || collegesFetched || !courseId) return

    setCollegesLoading(true)
    courseService.getStudentCourseDetails(courseId)
      .then((res) => {
        if (res.success) {
          setColleges(res.offeringColleges || [])
        }
        setCollegesFetched(true)
      })
      .catch((err) => {
        console.error('Error fetching offering colleges:', err)
        setCollegesFetched(true)
      })
      .finally(() => setCollegesLoading(false))
  }, [showDetails, courseId, collegesFetched])

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--s-border)',
        borderRadius: 16,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.22s ease',
        boxShadow: showDetails ? 'var(--s-shadow-lg)' : 'none',
        transform: showDetails ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
             <SBadge color="gray" style={{ background: '#f1f5f9', color: '#475569' }}>{course.category}</SBadge>
             <SBadge color="gray" style={{ background: '#f1f5f9', color: '#475569' }}>Class {course.level}</SBadge>
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
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(course) }}
          style={{
            background: isSaved ? 'var(--s-primary)' : 'rgba(0,0,0,0.05)',
            border: 'none', borderRadius: '50%', width: 34, height: 34, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: isSaved ? '#fff' : 'var(--s-text3)', transition: '0.2s'
          }}
          title={isSaved ? 'Remove from saved' : 'Save course'}
        >
          <FiBookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
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

      {showDetails && (
        <div style={{
          marginTop: 8,
          paddingTop: 16,
          display: 'grid',
          gap: 12,
          animation: 's-anim-down 0.2s ease both'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Detailed Eligibility
            </div>
            <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
              {course.eligibility}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Future Career Scope
            </div>
            <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
              {course.futureScope}
            </div>
          </div>

          <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', marginBottom: 12,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
            }}>
              <span>Colleges Offering This Course{colleges.length > 0 ? ` (${colleges.length})` : ''}</span>
            </div>

            {collegesLoading ? (
              <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>Loading colleges...</div>
            ) : colleges.length === 0 ? (
              <div style={{ fontSize: 13.5, color: 'var(--s-text3)', lineHeight: 1.6 }}>
                No colleges are currently mapped for this course.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {colleges.map((clg, idx) => (
                  <div
                    key={clg._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                      paddingBottom: idx === colleges.length - 1 ? 0 : 16,
                      borderBottom: idx === colleges.length - 1 ? 'none' : '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: '#f8fafc',
                        fontSize: 18, display: 'grid', placeItems: 'center', flexShrink: 0,
                      }}>
                        🏫
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', marginBottom: 4, lineHeight: 1.4 }}>
                          {clg.collegeName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: 'var(--s-primary)',
                            background: '#e0f2fe', padding: '2px 8px', borderRadius: 6,
                          }}>
                            {clg.collegeType || 'Government College'}
                          </span>
                          {clg.district && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              color: 'var(--s-text3)', fontSize: 12, fontWeight: 600,
                            }}>
                              <FiMapPin size={11} /> {clg.district}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <SBtn
                      variant="outline"
                      size="sm"
                      style={{ borderRadius: 10, padding: '6px 14px', fontWeight: 700, flexShrink: 0 }}
                      onClick={() => navigate(`/student/colleges/${clg._id}`)}
                    >
                      View College
                    </SBtn>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <button
          onClick={() => setShowDetails(o => !o)}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: showDetails ? 'var(--s-bg)' : 'transparent',
            border: `1.5px solid ${showDetails ? 'var(--s-border)' : 'var(--s-primary)'}`,
            color: showDetails ? 'var(--s-text)' : 'var(--s-primary)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--s-font-display)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
          {showDetails ? <FiInfo size={14} /> : <FiArrowRight size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function CourseCategoryPage() {
  const { categoryKey } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const urlLevel = searchParams.get('level')
  const { isAuthenticated, student } = useStudentAuth()
  const navigate = useNavigate()

  const isSearchMode = categoryKey === 'search'
  const config = !isSearchMode ? COURSE_LEVEL_MAP[categoryKey] : null

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState(urlCategory || 'All')
  const [levelFilter, setLevelFilter] = useState(urlLevel || (config ? config.level : 'All'))
  const [savedIds, setSavedIds] = useState(new Set())

  // FETCH DATA WITH PARAMS (Dynamic Integration)
  useEffect(() => {
    setLoading(true)
    const params = {}
    
    // Use targetLevel (e.g. "After 12th") â€” NOT level (e.g. "12") â€” to match the DB field
    if (!isSearchMode && config?.targetLevel) {
        params.targetLevel = config.targetLevel
    } else {
        if (levelFilter !== 'All') {
          // Map UI filter values to DB targetLevel values
          const levelMap = { '10': 'After 10th', '12': 'After 12th', 'Diploma': 'After 10th', 'Undergraduate': 'After 12th' }
          params.targetLevel = levelMap[levelFilter] || levelFilter
        }
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
    if (urlLevel) setLevelFilter(urlLevel)
  }, [urlCategory, urlLevel])

  // ── Fetch saved courses (authenticated) ──
  useEffect(() => {
    if (!isAuthenticated) return
    userActionService.getSavedList('Course')
      .then((res) => {
        const ids = (res?.data || []).map(item => item.contentId?._id || item.contentId).filter(Boolean)
        setSavedIds(new Set(ids))
      })
      .catch((err) => console.error('Error fetching saved courses:', err))
  }, [isAuthenticated])

  // ── Toggle bookmark ──
  const handleToggleSave = async (course) => {
    if (!isAuthenticated) return navigate('/student/signin')
    const id = course?._id
    if (!id) return
    try {
      if (savedIds.has(id)) {
        await userActionService.unsaveItem(id)
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      } else {
        await userActionService.saveItem(id, 'Course')
        setSavedIds(prev => new Set([...prev, id]))
      }
    } catch (err) { console.error(err) }
  }

  const visibleCourses = useMemo(() => {
    const scoped = scopeCoursesForStudent(courses, student)
    const q = search.trim().toLowerCase()
    if (!q) return scoped
    
    return scoped.filter((course) => {
      return [
        getCourseDisplayName(course),
        course.category,
        course.eligibility,
        course.futureScope,
      ].some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [courses, search, student])

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
              {isSearchMode ? `Exploring ${streamFilter === 'All' ? 'All' : streamFilter} Specialists` : config.heading}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: 'var(--s-text3)', lineHeight: 1.7, maxWidth: 840 }}>
              {isSearchMode ? `Discover the top reputed ${streamFilter} programs dynamically tracked across Tamil Nadu colleges.` : config.description}
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
              style={{ width: 220 }}
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
              <option value="5">Class 5</option>
              <option value="8">Class 8</option>
              <option value="10">Class 10</option>
              <option value="12">Class 12</option>
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
            <FiFilter size={18} color={accentColor} /> Total Courses Found: ({visibleCourses.length})
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {visibleCourses.map((course) => (
              <CourseCard
                key={course._id || course.id}
                course={course}
                accent={accentColor}
                isSaved={savedIds.has(course._id)}
                onToggleSave={handleToggleSave}
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
