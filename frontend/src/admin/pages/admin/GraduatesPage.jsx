import React, { useState, useEffect } from 'react'
import { adminService } from '../../../services/adminService'
import {
  FiUsers, FiSearch, FiFilter, FiRefreshCw, FiEye,
  FiCheckCircle, FiXCircle, FiAward, FiBriefcase, FiZap
} from 'react-icons/fi'

export default function GraduatesPage() {
  const [graduates, setGraduates] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })

  // Filters
  const [search, setSearch] = useState('')
  const [degree, setDegree] = useState('all')
  const [status, setStatus] = useState('all')
  const [direction, setDirection] = useState('all')

  // Modal detail
  const [selectedGraduate, setSelectedGraduate] = useState(null)

  useEffect(() => {
    fetchGraduates()
  }, [pagination.page, degree, status, direction])

  const fetchGraduates = async () => {
    setLoading(true)
    try {
      const params = {
        search: search.trim() || undefined,
        degree: degree !== 'all' ? degree : undefined,
        status: status !== 'all' ? status : undefined,
        page: pagination.page,
        limit: pagination.limit
      }

      const res = await adminService.getGraduates(params)
      if (res.success) {
        setGraduates(res.graduates || [])
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 })
      }
    } catch (err) {
      console.error('Failed to fetch graduates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPagination(p => ({ ...p, page: 1 }))
    fetchGraduates()
  }

  const handleReset = () => {
    setSearch('')
    setDegree('all')
    setStatus('all')
    setDirection('all')
    setPagination(p => ({ ...p, page: 1 }))
  }

  const handleToggleStatus = async (graduateId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    try {
      const res = await adminService.toggleCollegeStudentStatus(graduateId, newStatus)
      if (res.success) {
        fetchGraduates()
        if (selectedGraduate && selectedGraduate._id === graduateId) {
          setSelectedGraduate(prev => ({ ...prev, status: newStatus }))
        }
      }
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header Banner */}
      <div style={{
        padding: '24px 28px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        borderRadius: 16, color: '#fff', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiAward size={16} /> Higher Education & Placement
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '6px 0 4px', color: '#fff' }}>
            Graduate Students Management
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: '#cbd5e1' }}>
            Monitor graduated professionals, career transition targets, skill proficiencies, and placement readiness.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700 }}>Total Graduates</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{pagination.total || graduates.length}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '16px 20px',
        border: '1px solid #e2e8f0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
            <FiSearch size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by name, email, degree, specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13 }}
            />
          </div>
          <button
            type="submit"
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Search
          </button>
        </form>

        <select
          value={degree}
          onChange={(e) => { setDegree(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
        >
          <option value="all">All Degrees</option>
          <option value="B.E / B.Tech">B.E / B.Tech</option>
          <option value="B.Sc">B.Sc</option>
          <option value="BCA">BCA</option>
          <option value="B.Com">B.Com</option>
          <option value="M.E / M.Tech">M.E / M.Tech</option>
          <option value="MBA">MBA</option>
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>

        <button
          onClick={handleReset}
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FiRefreshCw size={13} /> Reset
        </button>
      </div>

      {/* Graduates Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Graduate Details</th>
                <th style={{ padding: '14px 20px' }}>Degree & Branch</th>
                <th style={{ padding: '14px 20px' }}>Graduation Year</th>
                <th style={{ padding: '14px 20px' }}>Career Target</th>
                <th style={{ padding: '14px 20px' }}>Readiness</th>
                <th style={{ padding: '14px 20px' }}>Account Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    Loading graduate records...
                  </td>
                </tr>
              ) : graduates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    No graduate profiles found matching the filters.
                  </td>
                </tr>
              ) : (
                graduates.map((grad) => {
                  const prof = grad.profile || {}
                  const score = prof.careerReadinessScore || 45

                  return (
                    <tr key={grad._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{grad.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{grad.email}</div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{prof.degree || 'Degree not logged'}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{prof.specialization || prof.domain || '—'}</div>
                      </td>

                      <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 600 }}>
                        {prof.graduationYear || '—'}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: '#eff6ff', color: '#2563eb'
                        }}>
                          {prof.targetCareer || prof.primaryCareerDirection || 'Get a Job'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: 11.5, fontWeight: 800, padding: '3px 8px', borderRadius: 12,
                          background: score >= 70 ? '#ecfdf5' : '#eff6ff',
                          color: score >= 70 ? '#059669' : '#2563eb'
                        }}>
                          {score}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 12,
                          background: grad.status === 'active' ? '#ecfdf5' : '#fef2f2',
                          color: grad.status === 'active' ? '#059669' : '#dc2626',
                          textTransform: 'uppercase'
                        }}>
                          {grad.status || 'active'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedGraduate(grad)}
                            style={{
                              background: '#eff6ff', color: '#2563eb', border: 'none',
                              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <FiEye size={13} /> View
                          </button>
                          <button
                            onClick={() => handleToggleStatus(grad._id, grad.status || 'active')}
                            style={{
                              background: grad.status === 'active' ? '#fef2f2' : '#ecfdf5',
                              color: grad.status === 'active' ? '#dc2626' : '#059669',
                              border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12,
                              fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            {grad.status === 'active' ? 'Block' : 'Unblock'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Showing Page {pagination.page} of {pagination.pages}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12, cursor: 'pointer' }}
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12, cursor: 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Graduate Detail Modal */}
      {selectedGraduate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 640, width: '100%',
            padding: 28, maxHeight: '85vh', overflowY: 'auto', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#2563eb' }}>
                  Graduate Profile Audit
                </span>
                <h2 style={{ margin: '4px 0 2px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {selectedGraduate.name}
                </h2>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedGraduate.email}</div>
              </div>
              <button
                onClick={() => setSelectedGraduate(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            {(() => {
              const prof = selectedGraduate.profile || {}
              return (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Degree & Branch</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{prof.degree || '—'} ({prof.specialization || prof.domain || 'General'})</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>College / Year</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{prof.college || '—'} • {prof.graduationYear || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CGPA / Percentage</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{prof.cgpa ? `${prof.cgpa} CGPA` : '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Readiness Score</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#059669' }}>{prof.careerReadinessScore || 45}%</div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      Technical Skills & Ratings
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(prof.technicalSkills || []).length === 0 ? (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No skills logged</span>
                      ) : (
                        prof.technicalSkills.map((sk, idx) => (
                          <span key={idx} style={{
                            fontSize: 11.5, fontWeight: 700, background: '#f1f5f9', color: '#334155',
                            padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6
                          }}>
                            {sk.name} <span style={{ color: '#2563eb', fontSize: 10.5 }}>({sk.proficiency})</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Career Direction */}
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      Career Direction & Preferences
                    </h4>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      <div><strong>Primary Focus:</strong> {prof.primaryCareerDirection || 'Get a Job'}</div>
                      <div><strong>Target Career:</strong> {prof.targetCareer || '—'}</div>
                      <div><strong>Target Roles:</strong> {(prof.preferredRoles || []).join(', ') || '—'}</div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      Projects ({ (prof.projects || []).length })
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(prof.projects || []).length === 0 ? (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No projects logged yet</span>
                      ) : (
                        prof.projects.map((p, idx) => (
                          <div key={idx} style={{ padding: '8px 12px', borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                            <strong>{p.title}</strong> — <span style={{ color: '#2563eb' }}>{p.techStack}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedGraduate(null)}
                style={{ padding: '10px 18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
