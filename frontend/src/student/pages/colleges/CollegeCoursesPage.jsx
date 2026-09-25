import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiMapPin, FiRefreshCw, FiBookOpen, FiClock, FiExternalLink
} from 'react-icons/fi'
import { SBtn, SEmpty, SLoader } from '../../components/ui'
import InsightRow, { StatusBadge, TypeBadge, Chip } from '../../components/colleges/InsightRow'
import { collegesInsightService } from '../../../services/collegesInsightService'
import { getInsightStyle, getLevelLabel } from '../../../constants/collegesInsightTheme'

/**
 * /student/class12/colleges/:category/college/:collegeId
 * Step 3b — every course a college offers, from confirmed mappings only.
 * Multi-stream colleges get their courses grouped by stream for clarity.
 * Each course row drills into that stream's course detail page.
 */
export default function CollegeCoursesPage() {
  const { category, collegeId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null) // { college, groups, totalCourses }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await collegesInsightService.getCollegeCourses(collegeId)
      if (res.success) {
        setData({
          college: res.college,
          groups: res.groups || [],
          totalCourses: res.totalCourses || 0,
        })
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Error fetching college courses', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [collegeId])

  useEffect(() => {
    load()
  }, [load])

  const style = getInsightStyle(category)
  const backToCategory = () => navigate(`/student/class12/colleges/${category}`)

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 80px', fontFamily: 'var(--s-font-display)' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f1f5f9', marginBottom: 24 }} />
        <SLoader />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 80px', fontFamily: 'var(--s-font-display)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button
            onClick={backToCategory}
            aria-label="Back"
            style={{
              width: 44, height: 44, borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', display: 'grid', placeItems: 'center', cursor: 'pointer',
              boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)',
            }}
          >
            <FiArrowLeft size={20} />
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiMapPin /></div>
          <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>Couldn't load this college</p>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>It may not exist or is not mapped to any public course yet.</p>
          <SBtn variant="outline" size="sm" onClick={load}><FiRefreshCw size={14} /> Retry</SBtn>
        </div>
      </div>
    )
  }

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
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>College → Courses</span>
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
            {data.college.name}
          </h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {data.college.location && (
              <Chip icon={<FiMapPin size={13} color="#f59e0b" />}>{data.college.location}</Chip>
            )}
            {data.college.district && data.college.district !== data.college.location && (
              <Chip icon={<FiMapPin size={13} color="#22c55e" />}>{data.college.district}</Chip>
            )}
            <TypeBadge type={data.college.type} />
            <Chip icon={<FiBookOpen size={13} color="#6366f1" />}>
              {data.totalCourses} course{data.totalCourses === 1 ? '' : 's'} offered
            </Chip>
          </div>
          {(data.college.feesPerYear > 0 || data.college.placementPercentage > 0) && (
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#64748b' }}>
              {data.college.feesPerYear > 0 && (
                <strong style={{ color: '#334155' }}>₹{Number(data.college.feesPerYear).toLocaleString()}/year</strong>
              )}
              {data.college.feesPerYear > 0 && data.college.placementPercentage > 0 ? ' · ' : ''}
              {data.college.placementPercentage > 0 && (
                <>
                  <strong style={{ color: '#15803d' }}>{data.college.placementPercentage}% placement</strong>
                </>
              )}
            </p>
          )}
          {data.college.streamsOffered.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {data.college.streamsOffered.slice(0, 3).map((s) => (
                <Chip key={s} style={{ background: '#f1f5f9', color: '#475569' }}>{s}</Chip>
              ))}
              {data.college.streamsOffered.length > 3 && (
                <Chip style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  +{data.college.streamsOffered.length - 3} more streams
                </Chip>
              )}
            </div>
          )}
          {data.college.website && (
            <a
              href={data.college.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12,
                fontSize: 14, fontWeight: 800, color: '#1d5fba', textDecoration: 'none',
              }}
            >
              <FiExternalLink size={15} /> {data.college.website}
            </a>
          )}
        </div>
      </div>

      {/* Body — courses grouped by stream */}
      {data.groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
          <SEmpty
            icon={<FiBookOpen size={48} />}
            title="No published courses yet"
            desc="Ask your admin to verify this college's mappings — its courses will appear here."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 28 }}>
          {data.groups.map((group) => {
            const groupStyle = getInsightStyle(group.key)
            return (
              <section key={group.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: 10, background: groupStyle.bg, color: groupStyle.color,
                    display: 'grid', placeItems: 'center', fontSize: 17,
                  }}>
                    {groupStyle.icon}
                  </span>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1e293b' }}>{group.label}</h2>
                  <span style={{
                    fontSize: 12.5, fontWeight: 800, color: groupStyle.color, background: groupStyle.bg,
                    padding: '3px 10px', borderRadius: 99,
                  }}>
                    {group.courses.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {group.courses.map((course) => (
                    <InsightRow
                      key={course.id}
                      title={course.name}
                      subtitle={course.category || undefined}
                      onOpen={() => navigate(`/student/class12/colleges/${group.key}/course/${course.id}`)}
                      accentColor={groupStyle.color}
                      accentBg={groupStyle.bg}
                      footer={
                        <>
                          {course.level && (
                            <Chip>{getLevelLabel(course.level)}</Chip>
                          )}
                          {course.duration && (
                            <Chip icon={<FiClock size={13} color="#94a3b8" />}>{course.duration}</Chip>
                          )}
                          <StatusBadge status={course.status} />
                        </>
                      }
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}