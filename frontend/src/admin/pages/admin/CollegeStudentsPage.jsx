import React, { useState, useEffect } from 'react'
import { adminService } from '../../../services/adminService'
import CollegeStudentProfileModal from './CollegeStudentProfileModal'

export default function CollegeStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [filterOptions, setFilterOptions] = useState({ fields: [], degrees: [], domains: [], colleges: [], years: [] })

  // Filters State
  const [search, setSearch] = useState('')
  const [field, setField] = useState('all')
  const [degree, setDegree] = useState('all')
  const [domain, setDomain] = useState('all')
  const [specialization, setSpecialization] = useState('all')
  const [college, setCollege] = useState('all')
  const [year, setYear] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')

  // Selected student for Profile Modal
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  useEffect(() => {
    fetchCollegeStudents()
  }, [pagination.page, field, degree, domain, specialization, college, year, status, sortBy, order])

  const fetchCollegeStudents = async () => {
    setLoading(true)
    try {
      const params = {
        search,
        field: field !== 'all' ? field : undefined,
        degree: degree !== 'all' ? degree : undefined,
        domain: domain !== 'all' ? domain : undefined,
        specialization: specialization !== 'all' ? specialization : undefined,
        college: college !== 'all' ? college : undefined,
        year: year !== 'all' ? year : undefined,
        status: status !== 'all' ? status : undefined,
        sortBy,
        order,
        page: pagination.page,
        limit: pagination.limit
      }

      const res = await adminService.getCollegeStudents(params)
      if (res.success) {
        setStudents(res.students || [])
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 })
        if (res.filterOptions) {
          setFilterOptions(res.filterOptions)
        }
      }
    } catch (err) {
      console.error('Failed to fetch college students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPagination(p => ({ ...p, page: 1 }))
    fetchCollegeStudents()
  }

  const handleResetFilters = () => {
    setSearch('')
    setField('all')
    setDegree('all')
    setDomain('all')
    setSpecialization('all')
    setCollege('all')
    setYear('all')
    setStatus('all')
    setSortBy('createdAt')
    setOrder('desc')
    setPagination(p => ({ ...p, page: 1 }))
  }

  const handleToggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    try {
      const res = await adminService.toggleCollegeStudentStatus(studentId, newStatus)
      if (res.success) {
        fetchCollegeStudents()
      }
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Title & Banner */}
      <div style={{
        padding: '24px 28px', background: 'linear-gradient(135deg, #0b1329 0%, #1e293b 100%)',
        color: '#fff', borderRadius: 20, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎓 Dedicated Portal
          </div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 900, fontFamily: 'var(--s-font-display)', color: '#fff' }}>
            College Student Management
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            View & manage registered higher education students, academic profiles, skills, career roadmaps, and assessments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Total Enrolled</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#38bdf8' }}>{pagination.total} Students</div>
          </div>
        </div>
      </div>

      {/* Search & Comprehensive Filters Panel */}
      <div style={{
        background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        
        {/* Top Row: Search & Refresh */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by student name, email, or institution..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                border: '1px solid #cbd5e1', fontSize: 13, outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8', fontSize: 14 }}>🔍</span>
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px', borderRadius: 10, background: '#0284c7', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: '10px 16px', borderRadius: 10, background: '#f1f5f9', color: '#475569',
              border: '1px solid #cbd5e1', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </form>

        {/* Dropdowns Row: Field, Degree, Domain, College, Year, Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Field</label>
            <select
              value={field} onChange={e => setField(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
            >
              <option value="all">All Fields</option>
              {filterOptions.fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Degree</label>
            <select
              value={degree} onChange={e => setDegree(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
            >
              <option value="all">All Degrees</option>
              {filterOptions.degrees.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Domain / Branch</label>
            <select
              value={domain} onChange={e => setDomain(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
            >
              <option value="all">All Domains</option>
              {filterOptions.domains.map(dm => <option key={dm} value={dm}>{dm}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Institution / College</label>
            <select
              value={college} onChange={e => setCollege(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
            >
              <option value="all">All Institutions</option>
              {filterOptions.colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Academic Year</label>
            <select
              value={year} onChange={e => setYear(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
            >
              <option value="all">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Account Status</label>
            <select
              value={status} onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

        </div>

      </div>

      {/* College Students Table */}
      <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            Loading college students data...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>No College Students Found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing search or filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Student Name & Email</th>
                  <th style={{ padding: '14px 14px' }}>Institution / College</th>
                  <th style={{ padding: '14px 14px' }}>Field</th>
                  <th style={{ padding: '14px 14px' }}>Degree</th>
                  <th style={{ padding: '14px 14px' }}>Domain / Branch</th>
                  <th style={{ padding: '14px 14px' }}>Year</th>
                  <th style={{ padding: '14px 14px' }}>Status</th>
                  <th style={{ padding: '14px 14px' }}>Registered</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{st.email}</div>
                    </td>
                    <td style={{ padding: '14px 14px', fontWeight: 600, color: '#334155' }}>
                      {st.institution}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {st.field}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', fontWeight: 700, color: '#0284c7' }}>
                      {st.degreeProgramme}
                    </td>
                    <td style={{ padding: '14px 14px', color: '#475569' }}>
                      {st.domain}
                    </td>
                    <td style={{ padding: '14px 14px', fontWeight: 700, color: '#475569' }}>
                      {st.currentYear}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800,
                        background: st.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: st.status === 'active' ? '#15803d' : '#b91c1c'
                      }}>
                        {st.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', color: '#64748b', fontSize: 12 }}>
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedStudentId(st._id)}
                          style={{
                            padding: '6px 12px', borderRadius: 8, background: '#0284c7', color: '#fff',
                            border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer'
                          }}
                        >
                          👁️ Profile
                        </button>
                        <button
                          onClick={() => handleToggleStatus(st._id, st.status)}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1',
                            background: st.status === 'active' ? '#fef2f2' : '#f0fdf4',
                            color: st.status === 'active' ? '#991b1b' : '#166534',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {st.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {!loading && students.length > 0 && (
          <div style={{
            padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 12 }}
              >
                Previous
              </button>
              <span style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                Page {pagination.page} of {pagination.pages || 1}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 12 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabbed Profile Modal */}
      {selectedStudentId && (
        <CollegeStudentProfileModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onRefresh={fetchCollegeStudents}
        />
      )}

    </div>
  )
}
