import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiSearch, FiClock, FiHome, FiX, FiChevronRight,
  FiMapPin, FiRefreshCw, FiBookOpen
} from 'react-icons/fi'
import { SBtn, SEmpty } from '../../components/ui'
import { collegesInsightService } from '../../../services/collegesInsightService'

const STATUS_BADGE_COLOR = {
  Verified: 'green',
  Imported: 'blue',
  Manual: 'purple',
}

const TYPE_BADGE_COLOR = {
  Government: 'blue',
  Private: 'green',
  Aided: 'orange',
}

/**
 * /student/class12/colleges/:category
 * Drill-down from a "Colleges Insight" summary card: lists the category's
 * published courses with a live "X colleges offer this" count, plus a search
 * box. Clicking a course opens the colleges modal for that course.
 */
export default function CollegesCategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()

  const [label, setLabel] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  // Colleges modal state
  const [modalCourse, setModalCourse] = useState(null)
  const [colleges, setColleges] = useState([])
  const [collegesLoading, setCollegesLoading] = useState(false)
  const [collegesError, setCollegesError] = useState(false)

  const load = useCallback(async () => {
    if (!category) return
    setLoading(true)
    setError(false)
    try {
      const res = await collegesInsightService.getCourses(category)
      if (res.success) {
        setLabel(res.label || '')
        setCourses(res.data || [])
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Error fetching category courses', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (modalCourse) {
      loadColleges(modalCourse)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalCourse])

  const loadColleges = useCallback(async (course) => {
    setColleges([])
    setCollegesError(false)
    setCollegesLoading(true)
    try {
      const res = await collegesInsightService.getColleges(category, course.id)
      if (res.success) setColleges(res.data || [])
      else setCollegesError(true)
    } catch (err) {
      console.error('Error fetching colleges for course', err)
      setCollegesError(true)
    } finally {
      setCollegesLoading(false)
    }
  }, [category])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) => (c.name || '').toLowerCase().includes(q))
  }, [courses, search])

  const title = label.replace(/\s+Insight$/i, '') || 'Courses'

  const closeModal = () => {
    setModalCourse(null)
    setColleges([])
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 80px', fontFamily: 'var(--s-font-display)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
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
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
            {title} Courses
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Explore the courses in this category and the colleges that offer them
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 460 }}>
        <FiSearch size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()} courses...`}
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
              <div style={{ width: '80%', height: 13, borderRadius: 8, background: '#f8fafc', marginBottom: 14 }} />
              <div style={{ width: 160, height: 26, borderRadius: 99, background: '#eef2ff' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiBookOpen /></div>
          <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>Couldn't load these courses</p>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>Please try again in a moment.</p>
          <SBtn variant="outline" size="sm" onClick={load}><FiRefreshCw size={14} /> Retry</SBtn>
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
          <div style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
          </div>
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => setModalCourse(course)}
              className="insight-header-hover hover-lift"
              style={{
                background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '24px 28px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                boxShadow: '0 8px 12px -3px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{course.name}</h3>
                {course.description && (
                  <p style={{
                    margin: '6px 0 0', fontSize: 13.5, color: '#64748b', maxWidth: 640, overflow: 'hidden',
                    textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {course.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {course.duration && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700,
                      color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: 99,
                    }}>
                      <FiClock size={13} /> {course.duration}
                    </span>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700,
                    color: '#4f46e5', background: '#eef2ff', padding: '4px 10px', borderRadius: 99,
                  }}>
                    <FiHome size={13} /> {course.collegeCount} college{course.collegeCount === 1 ? '' : 's'} offer this
                  </span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#64748b', flexShrink: 0 }}>
                <FiChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Colleges modal */}
      {modalCourse && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              animation: 'slideUp 0.22s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '24px 28px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.01em' }}>{modalCourse.name}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748b' }}>
                  Colleges offering this course
                </p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                style={{
                  width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc',
                  color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <FiX size={17} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
              {collegesLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ borderRadius: 16, border: '1px solid #f1f5f9', padding: 18 }}>
                      <div style={{ width: '50%', height: 15, borderRadius: 8, background: '#f1f5f9', marginBottom: 8 }} />
                      <div style={{ width: '70%', height: 12, borderRadius: 8, background: '#f8fafc' }} />
                    </div>
                  ))}
                </div>
              ) : collegesError ? (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Couldn't load the college list</p>
                  <SBtn variant="outline" size="sm" onClick={() => loadColleges(modalCourse)}><FiRefreshCw size={14} /> Retry</SBtn>
                </div>
              ) : colleges.length === 0 ? (
                <SEmpty
                  icon={<FiMapPin size={44} />}
                  title="No colleges mapped yet"
                  desc="Ask your admin to verify a mapping for this course — colleges will appear here."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {colleges.map((col) => (
                    <div key={col.id} style={{ borderRadius: 16, border: '1px solid #f1f5f9', padding: 18, background: '#fcfdff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: '#1e293b' }}>{col.name}</h3>
                        <SBadge color={STATUS_BADGE_COLOR[col.status] || 'gray'} style={{ flexShrink: 0 }}>{col.status}</SBadge>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {col.location && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>
                            <FiMapPin size={13} color="#f59e0b" /> {col.location}
                          </span>
                        )}
                        <SBadge color={TYPE_BADGE_COLOR[col.type] || 'gray'}>{col.type}</SBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}