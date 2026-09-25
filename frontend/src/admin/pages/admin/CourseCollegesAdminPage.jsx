import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card, DataTable, TR, TD, ActionBtn, LevelBadge, FiltersRow, SearchInput } from '../../components/UI'
import { seatMatrixService, streamLabel } from '../../../services/seatMatrixService'

const LIMIT = 20

const SEAT_KEYS = [
  { key: 'oc', label: 'OC', color: '#2563eb' },
  { key: 'bc', label: 'BC', color: '#7c3aed' },
  { key: 'bcm', label: 'BCM', color: '#2563eb' },
  { key: 'mbc', label: 'MBC', color: '#0891b2' },
  { key: 'sc', label: 'SC', color: '#d97706' },
  { key: 'sca', label: 'SCA', color: '#16a34a' },
  { key: 'st', label: 'ST', color: '#dc2626' },
]

function SeatBreakdown({ seats }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {SEAT_KEYS.map(({ key, label, color }) => (
        <span key={key} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 11px', borderRadius: 10, background: 'rgba(0,0,0,0.03)',
          border: '1.5px solid var(--border)', fontSize: 12,
        }}>
          <span style={{ fontWeight: 800, color, minWidth: 32 }}>{label}</span>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{(seats && seats[key]) || 0}</span>
        </span>
      ))}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 11px', borderRadius: 10, background: 'var(--primary-l)',
        border: '1.5px solid var(--primary)', fontSize: 12,
      }}>
        <span style={{ fontWeight: 800, color: 'var(--primary)', minWidth: 32 }}>TOTAL</span>
        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{(seats && seats.total) || 0}</span>
      </span>
    </div>
  )
}

export default function CourseCollegesAdminPage() {
  const navigate = useNavigate()
  const { courseId, stream } = useParams()
  const streamName = streamLabel(stream)

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [course, setCourse] = useState(null)
  const [colleges, setColleges] = useState([])
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [expanded, setExpanded] = useState({})

  const fetchColleges = useCallback(async () => {
    if (!courseId) return
    try {
      setLoading(true)
      const res = await seatMatrixService.getCourseColleges(courseId, { stream, search: search || undefined, page, limit: LIMIT })
      setCourse(res.course || null)
      setColleges(res.data || [])
      setCount(res.count || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch course colleges:', err)
      if (err.response?.status === 404) setCourse(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, stream, search, page])

  useEffect(() => {
    const delay = setTimeout(fetchColleges, 300)
    return () => clearTimeout(delay)
  }, [fetchColleges])

  const toggleRow = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  if (!loading && !course) {
    return (
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>
        <ActionBtn onClick={() => navigate(`/admin/courses-colleges/${stream}`)}>← Back to Courses</ActionBtn>
        <Card style={{ marginTop: 16, padding: 50, textAlign: 'center', color: 'var(--text3)' }}>
          Course not found in {streamName}.
        </Card>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--text3)' }}>
        <Link to="/admin/courses-colleges" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Courses &amp; Colleges</Link>
        <span>/</span>
        <Link to={`/admin/courses-colleges/${stream}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{streamName}</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <ActionBtn onClick={() => navigate(`/admin/courses-colleges/${stream}`)}>← Courses</ActionBtn>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontFamily: 'Nunito', fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>
              {course?.courseName || 'Loading…'}
            </h2>
            {course?.branchCode && <LevelBadge level={course.branchCode} />}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 2, fontWeight: 600 }}>
            {count} college{count !== 1 ? 's' : ''} offering this course · {course?.duration || ''}
          </div>
        </div>
      </div>

      <FiltersRow>
        <SearchInput placeholder="🔍 Search college name or code..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)', fontWeight: 700 }}>
          {count} college{count !== 1 ? 's' : ''}
        </div>
      </FiltersRow>

      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading colleges...</div>
        ) : colleges.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
            {search ? 'No colleges match your search.' : 'No colleges mapped for this course yet — import the seat-matrix PDF to populate seat data.'}
          </div>
        ) : (
          <DataTable
            columns={['College Code', 'College Name', 'District', 'Total Seats', '']}
            data={colleges}
            renderRow={(col) => {
              const isOpen = !!expanded[col.id]
              return (
                <React.Fragment key={col.id}>
                  <TR style={{ cursor: 'pointer' }} onClick={() => toggleRow(col.id)}>
                    <TD><span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'ui-monospace, monospace' }}>{col.collegeCode}</span></TD>
                    <TD>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{col.collegeName}</div>
                      {col.location && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{col.location}</div>}
                    </TD>
                    <TD style={{ color: 'var(--text2)' }}>{col.district || '\u2014'}</TD>
                    <TD>
                      {col.seats ? (
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{col.seats.total}</span>
                      ) : (
                        <span style={{ color: 'var(--text3)' }}>—</span>
                      )}
                    </TD>
                    <TD>
                      <ActionBtn onClick={(e) => { e.stopPropagation(); toggleRow(col.id) }}>
                        {isOpen ? '▲ Hide seats' : '▼ Seats'}
                      </ActionBtn>
                    </TD>
                  </TR>
                  {isOpen && (
                    <TR style={{ background: 'var(--surface2)' }}>
                      <TD colSpan={5} style={{ padding: '18px 16px' }}>
                        {col.seats ? (
                          <SeatBreakdown seats={col.seats} />
                        ) : (
                          <span style={{ fontSize: 13, color: 'var(--text3)' }}>No seat data for this college.</span>
                        )}
                      </TD>
                    </TR>
                  )}
                </React.Fragment>
              )
            }}
          />
        )}
      </Card>

      {/* Pagination */}
      {!loading && colleges.length > 0 && (
        <div style={{ padding: '14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Showing {(page - 1) * LIMIT + 1} to {Math.min(page * LIMIT, count)} of {count}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <ActionBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</ActionBtn>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Page {page} of {totalPages}</span>
            <ActionBtn disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</ActionBtn>
          </div>
        </div>
      )}
    </div>
  )
}