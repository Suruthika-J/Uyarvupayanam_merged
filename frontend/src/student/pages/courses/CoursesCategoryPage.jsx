import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { courseService } from '../../services'
import { SBtn, SCard, SEmpty, SInput, SLoader, SSelect, SBadge } from '../../components/ui'

const CATEGORY_FILTERS = ['All', 'Medical', 'Engineering', 'Arts']

const CATEGORY_BADGE_COLOR = {
  Medical: 'green',
  Engineering: 'blue',
  Arts: 'purple',
}

export default function CoursesCategoryPage({ categoryType, title }) {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)

      const params = { categoryType }
      if (categoryFilter !== 'All') params.category = categoryFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const result = await courseService.getAll(params)

      const list = Array.isArray(result?.data) ? result.data : (result?.data || [])
      setCourses(list)
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [categoryType, categoryFilter, searchTerm])

  useEffect(() => {
    const t = setTimeout(fetchCourses, 350)
    return () => clearTimeout(t)
  }, [fetchCourses])

  const handleViewDetails = (course) => {
    navigate(`/student/course/${course.slug || course._id}`)
  }

  return (
    <div className="student-root" style={{ padding: '32px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="s-anim-up" style={{ marginBottom: 26 }}>
        <h1 style={{
          fontFamily: 'var(--s-font-display)',
          fontWeight: 900,
          fontSize: 'clamp(24px,4vw,32px)',
          color: 'var(--s-text)',
          marginBottom: 6,
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--s-text3)' }}>
          Explore curated courses for your education stage. Filter by domain and search by course name.
        </p>
      </div>

      {/* Filters */}
      <div className="s-anim-up" style={{
        display: 'flex',
        gap: 12,
        marginBottom: 22,
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: '1 1 260px' }}>
          <SInput
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FiSearch size={16} />}
          />
        </div>
        <div style={{ flex: '0 0 220px' }}>
          <SSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORY_FILTERS.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Domains' : c}</option>
            ))}
          </SSelect>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--s-text3)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          <span style={{
            fontFamily: 'var(--s-font-display)',
            fontSize: 17,
            fontWeight: 900,
            color: 'var(--s-primary)',
          }}>
            {courses.length}
          </span> courses
        </div>
      </div>

      {loading ? (
        <SLoader />
      ) : courses.length === 0 ? (
        <SEmpty icon="📚" title="No courses found" desc="Try changing the domain filter or search term." />
      ) : (
        <div className="s-anim-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
          gap: 16,
        }}>
          {courses.map((c) => {
            const badgeColor = CATEGORY_BADGE_COLOR[c.category] || 'gray'
            return (
              <SCard key={c._id} hover style={{ padding: 18, borderTop: `4px solid var(--s-border)` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--s-font-display)',
                      fontWeight: 900,
                      fontSize: 15,
                      color: 'var(--s-text)',
                      marginBottom: 6,
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}>
                      {c.courseName}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <SBadge color={badgeColor}>{c.category}</SBadge>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        background: 'var(--s-bg2)',
                        color: 'var(--s-text3)',
                        borderRadius: 999,
                        padding: '4px 10px',
                      }}>
                        {c.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                  gap: 10,
                  marginBottom: 14,
                }}>
                  <div style={{ background: 'var(--s-bg2)', borderRadius: 10, padding: 10, textAlign: 'left' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--s-text3)', fontWeight: 700 }}>Duration</div>
                    <div style={{ fontSize: 13.5, color: 'var(--s-text)', fontWeight: 900, marginTop: 3 }}>{c.duration || '—'}</div>
                  </div>
                  <div style={{ background: 'var(--s-bg2)', borderRadius: 10, padding: 10, textAlign: 'left' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--s-text3)', fontWeight: 700 }}>Eligibility</div>
                    <div style={{ fontSize: 13.5, color: 'var(--s-text)', fontWeight: 900, marginTop: 3 }}>{c.eligibility || '—'}</div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--s-surface2)',
                  border: '1.5px solid var(--s-border)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 14,
                }}>
                  <div style={{ fontSize: 11.5, color: 'var(--s-text3)', fontWeight: 700, marginBottom: 6 }}>
                    Future Scope
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--s-text)', fontWeight: 850, lineHeight: 1.35 }}>
                    {c.futureScope || '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SBtn
                    variant="accent"
                    size="md"
                    onClick={() => handleViewDetails(c)}
                    style={{ padding: '10px 18px' }}
                  >
                    View Details
                  </SBtn>
                </div>
              </SCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

