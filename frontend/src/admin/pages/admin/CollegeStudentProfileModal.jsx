import React, { useState, useEffect } from 'react'
import { adminService } from '../../../services/adminService'

export default function CollegeStudentProfileModal({ studentId, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  // Edit / Notification Modal states inside profile
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  const [notifyMode, setNotifyMode] = useState(false)
  const [notifyForm, setNotifyForm] = useState({ title: '', message: '', type: 'info' })
  const [sendingNotify, setSendingNotify] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState('')

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails()
    }
  }, [studentId])

  const fetchStudentDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getCollegeStudentProfile(studentId)
      if (res.success) {
        setData(res)
        setEditForm({
          name: res.user?.name || '',
          email: res.user?.email || '',
          status: res.user?.status || 'active',
          institution: res.profile?.institution || '',
          field: res.profile?.field || '',
          degreeProgramme: res.profile?.degreeProgramme || '',
          domain: res.profile?.domain || '',
          specialization: res.profile?.specialization || '',
          currentYear: res.profile?.currentYear || '',
          studyMode: res.profile?.studyMode || 'Full-time',
          skills: (res.profile?.skills || []).join(', '),
          academicInterests: (res.profile?.academicInterests || []).join(', '),
          careerInterests: (res.profile?.careerInterests || []).join(', ')
        })
      } else {
        setError(res.message || 'Failed to load details')
      }
    } catch (err) {
      setError('Error fetching student details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!data?.user) return
    const newStatus = data.user.status === 'active' ? 'blocked' : 'active'
    try {
      const res = await adminService.toggleCollegeStudentStatus(studentId, newStatus)
      if (res.success) {
        fetchStudentDetails()
        if (onRefresh) onRefresh()
      }
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const res = await adminService.updateCollegeStudent(studentId, editForm)
      if (res.success) {
        setEditMode(false)
        fetchStudentDetails()
        if (onRefresh) onRefresh()
      } else {
        alert(res.message || 'Failed to update student')
      }
    } catch (err) {
      alert('Error updating student profile')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    setSendingNotify(true)
    setNotifySuccess('')
    try {
      const res = await adminService.sendCollegeStudentNotification(studentId, notifyForm)
      if (res.success) {
        setNotifySuccess('Notification dispatched successfully!')
        setNotifyForm({ title: '', message: '', type: 'info' })
        setTimeout(() => {
          setNotifyMode(false)
          setNotifySuccess('')
        }, 1500)
        fetchStudentDetails()
      } else {
        alert(res.message || 'Failed to send notification')
      }
    } catch (err) {
      alert('Error sending notification')
    } finally {
      setSendingNotify(false)
    }
  }

  if (!studentId) return null

  const user = data?.user || {}
  const profile = data?.profile || {}
  const rec = data?.recommendation || {}
  const testResults = data?.testResults || []
  const activities = data?.activities || []
  const savedItems = data?.savedItems || []
  const notifications = data?.notifications || []

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 960,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
      }}>
        
        {/* Modal Top Header */}
        <div style={{
          padding: '20px 28px', background: 'linear-gradient(135deg, #0b1329 0%, #1e293b 100%)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#0284c7',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 22
            }}>
              {user.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>{user.name || 'Loading...'}</h3>
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 12, fontWeight: 700,
                  background: user.status === 'active' ? '#166534' : '#991b1b',
                  color: user.status === 'active' ? '#86efac' : '#fca5a5'
                }}>
                  {user.status === 'active' ? '● Active' : '● Blocked'}
                </span>
                <span style={{ fontSize: 11, background: '#0284c7', color: '#fff', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
                  College Student
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                {user.email} • Enrolled: {profile.degreeProgramme || 'Degree N/A'} ({profile.institution || 'College N/A'})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setEditMode(true)}
              style={{ padding: '8px 14px', borderRadius: 10, background: '#334155', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setNotifyMode(true)}
              style={{ padding: '8px 14px', borderRadius: 10, background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
            >
              🔔 Send Alert
            </button>
            <button
              onClick={handleToggleStatus}
              style={{
                padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: user.status === 'active' ? '#ef4444' : '#22c55e', color: '#fff'
              }}
            >
              {user.status === 'active' ? '🚫 Deactivate' : '✅ Activate'}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer', padding: '4px 8px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 7 Tabs Header */}
        <div style={{
          display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          padding: '0 20px', overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'academic', label: '🎓 Academic' },
            { id: 'skills', label: '⚡ Skills' },
            { id: 'career', label: '🎯 Career Profile' },
            { id: 'roadmap', label: '🗺️ Learning Roadmap' },
            { id: 'assessments', label: '📝 Assessments' },
            { id: 'activity', label: '📜 Activity History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px', border: 'none', background: 'transparent',
                fontSize: 13, fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#0284c7' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #0284c7' : '3px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#ffffff' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              Fetching complete college student details...
            </div>
          ) : error ? (
            <div style={{ padding: 20, background: '#fef2f2', color: '#991b1b', borderRadius: 12 }}>{error}</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: 11, color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Profile Completion</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#15803d', marginTop: 4 }}>{profile.profileCompletion || 0}%</div>
                    </div>
                    <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 14, border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 800, textTransform: 'uppercase' }}>Field & Domain</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>{profile.field} ({profile.domain})</div>
                    </div>
                    <div style={{ padding: 16, background: '#faf5ff', borderRadius: 14, border: '1px solid #e9d5ff' }}>
                      <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 800, textTransform: 'uppercase' }}>Skills Acquired</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#7e22ce', marginTop: 4 }}>{profile.skills?.length || 0} Skills</div>
                    </div>
                    <div style={{ padding: 16, background: '#fffbeb', borderRadius: 14, border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: 11, color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Target Career Match</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#b45309', marginTop: 4 }}>{rec.recommendations?.[0]?.matchPercentage || 85}% Match</div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>College Student Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                      <div><strong>Full Name:</strong> {user.name}</div>
                      <div><strong>Email Address:</strong> {user.email}</div>
                      <div><strong>Institution:</strong> {profile.institution || 'Not Configured'}</div>
                      <div><strong>District:</strong> {profile.institutionDistrict || user.district || 'Tamil Nadu'}</div>
                      <div><strong>Academic Year:</strong> {profile.currentYear}</div>
                      <div><strong>Study Mode:</strong> {profile.studyMode}</div>
                      <div><strong>Registered Date:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                      <div><strong>Account Status:</strong> {user.status}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC */}
              {activeTab === 'academic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Academic Hierarchy & Enrollment</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                      <div><span style={{ color: '#64748b' }}>Discipline Field:</span> <strong style={{ color: '#0f172a' }}>{profile.field}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Degree Programme:</span> <strong style={{ color: '#0284c7' }}>{profile.degreeProgramme}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Domain / Branch:</span> <strong style={{ color: '#0f172a' }}>{profile.domain}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Specialization:</span> <strong style={{ color: '#0f172a' }}>{profile.specialization || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>College Institution:</span> <strong style={{ color: '#0f172a' }}>{profile.institution}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Academic Year:</span> <strong style={{ color: '#0f172a' }}>{profile.currentYear}</strong></div>
                    </div>
                  </div>

                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Academic Interests & Focus Areas</h4>
                    {profile.academicInterests?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {profile.academicInterests.map((item, i) => (
                          <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: 13, color: '#64748b' }}>No specific academic interests configured yet.</p>}
                  </div>
                </div>
              )}

              {/* TAB 3: SKILLS */}
              {activeTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ padding: 20, background: '#faf5ff', borderRadius: 16, border: '1px solid #e9d5ff' }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#6b21a8' }}>Configured Skills & Competencies</h4>
                    {profile.skills?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {profile.skills.map((sk, i) => (
                          <span key={i} style={{ background: '#f3e8ff', color: '#7e22ce', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            ⚡ {sk}
                          </span>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: 13, color: '#64748b' }}>No skills added yet.</p>}
                  </div>

                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Identified Strengths</h4>
                    {profile.strengths?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {profile.strengths.map((st, i) => (
                          <span key={i} style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            💪 {st}
                          </span>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: 13, color: '#64748b' }}>No strengths noted yet.</p>}
                  </div>
                </div>
              )}

              {/* TAB 4: CAREER PROFILE */}
              {activeTab === 'career' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {rec.recommendations?.length > 0 ? (
                    <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>🌟 Primary Career Recommendation</div>
                      <h3 style={{ margin: '6px 0 8px', fontSize: 20, fontWeight: 900, color: '#15803d' }}>{rec.recommendations[0].title}</h3>
                      <p style={{ margin: '0 0 12px', fontSize: 14, color: '#166534' }}>{rec.recommendations[0].explanation}</p>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                        Match Score: {rec.recommendations[0].matchPercentage}% • Matching Skills: {rec.recommendations[0].matchedSkills?.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 20, background: '#fffbeb', borderRadius: 16, border: '1px solid #fde68a' }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>Advisor AI recommendation generated when student completes onboarding test.</p>
                    </div>
                  )}

                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Student Selected Career Interests</h4>
                    {profile.careerInterests?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {profile.careerInterests.map((ci, i) => (
                          <span key={i} style={{ background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            🎯 {ci}
                          </span>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: 13, color: '#64748b' }}>No career interests added yet.</p>}
                  </div>
                </div>
              )}

              {/* TAB 5: LEARNING ROADMAP */}
              {activeTab === 'roadmap' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Active Degree Learning Roadmap</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>1. Fundamental Core Courses</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Degree foundation mathematics & domain fundamentals</div>
                        </div>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Completed</span>
                      </div>

                      <div style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>2. Domain Specialization Modules</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Advanced specialization topics & industry project work</div>
                        </div>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>In Progress</span>
                      </div>

                      <div style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>3. Placement Prep & Capstone Project</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Skill gap resolution, resume builder, and mock interviews</div>
                        </div>
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Upcoming</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ASSESSMENTS */}
              {activeTab === 'assessments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {testResults.length > 0 ? (
                    testResults.map((tr, i) => (
                      <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <strong style={{ fontSize: 15, color: '#0f172a' }}>{tr.testName || 'Assessment'}</strong>
                          <span style={{ fontWeight: 800, color: '#0284c7' }}>Score: {tr.score}%</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Taken on: {new Date(tr.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 24, textAlign: 'center', background: '#f8fafc', borderRadius: 16, color: '#64748b' }}>
                      No practice assessment history recorded yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: ACTIVITY HISTORY */}
              {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bookmarks / Saved Resources: <strong>{savedItems.length} items</strong></span>
                    <span>System Alerts Sent: <strong>{notifications.length} alerts</strong></span>
                  </div>

                  <h4 style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Recent Activity Logs</h4>
                  {activities.length > 0 ? (
                    activities.map((act, i) => (
                      <div key={i} style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{act.action || act.description || 'Student Activity'}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Date(act.timestamp || act.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No recent activity logs recorded.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* EDIT MODAL OVERLAY */}
      {editMode && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form onSubmit={handleSaveEdit} style={{
            background: '#fff', padding: 28, borderRadius: 20, width: '100%', maxWidth: 580,
            display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>Edit College Student Profile</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Student Name</label>
                <input
                  type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Email Address</label>
                <input
                  type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Discipline Field</label>
                <input
                  type="text" value={editForm.field} onChange={e => setEditForm({ ...editForm, field: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Degree Programme</label>
                <input
                  type="text" value={editForm.degreeProgramme} onChange={e => setEditForm({ ...editForm, degreeProgramme: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Domain / Branch</label>
                <input
                  type="text" value={editForm.domain} onChange={e => setEditForm({ ...editForm, domain: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Specialization</label>
                <input
                  type="text" value={editForm.specialization} onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>College Institution</label>
                <input
                  type="text" value={editForm.institution} onChange={e => setEditForm({ ...editForm, institution: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Academic Year</label>
                <select
                  value={editForm.currentYear} onChange={e => setEditForm({ ...editForm, currentYear: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button" onClick={() => setEditMode(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={savingEdit}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTIFY MODAL OVERLAY */}
      {notifyMode && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form onSubmit={handleSendNotification} style={{
            background: '#fff', padding: 28, borderRadius: 20, width: '100%', maxWidth: 480,
            display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>Send Alert to {user.name}</h3>
            {notifySuccess && <div style={{ padding: 10, background: '#dcfce7', color: '#15803d', borderRadius: 8, fontSize: 13 }}>{notifySuccess}</div>}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Notification Title</label>
              <input
                type="text" required placeholder="e.g. Scholarship Deadline Alert"
                value={notifyForm.title} onChange={e => setNotifyForm({ ...notifyForm, title: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Message Body</label>
              <textarea
                rows={4} required placeholder="Enter message details..."
                value={notifyForm.message} onChange={e => setNotifyForm({ ...notifyForm, message: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button" onClick={() => setNotifyMode(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={sendingNotify}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {sendingNotify ? 'Sending...' : 'Dispatch Alert'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
