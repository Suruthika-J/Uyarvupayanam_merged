import React, { useState, useEffect, useCallback } from 'react'
import { Card, LevelBadge, DataTable, TR, TD, ActionBtn, FiltersRow, SearchInput, FilterSelect } from '../../components/UI'
import { adminService } from '../../../services/adminService'
import { FiEye, FiLock, FiUnlock, FiTrash2, FiUser, FiBookOpen, FiAward, FiX, FiCheckCircle } from 'react-icons/fi'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [userType, setUserType] = useState('all')
  const [fieldFilter, setFieldFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Selected User Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (status !== 'all') params.status = status
      if (userType !== 'all') params.userType = userType
      if (fieldFilter !== 'all') params.field = fieldFilter

      const data = await adminService.getUsers(params)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [search, status, userType, fieldFilter])

  useEffect(() => {
    const delay = setTimeout(fetchUsers, 300)
    return () => clearTimeout(delay)
  }, [fetchUsers])

  const handleOpenDetails = async (u) => {
    setSelectedUser(u)
    setLoadingDetails(true)
    try {
      if (u.userType === 'administrator') {
        setUserDetails({ user: u })
      } else {
        const res = await adminService.getUserDetails(u._id)
        if (res.success) {
          setUserDetails(res)
        }
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleBlock = async (id) => {
    try {
      const { user } = await adminService.blockUser(id)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, status: 'blocked' } : u))
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(prev => ({ ...prev, status: 'blocked' }))
      }
    } catch (err) {
      console.error('Failed to block user:', err)
    }
  }

  const handleUnblock = async (id) => {
    try {
      const { user } = await adminService.unblockUser(id)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, status: 'active' } : u))
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(prev => ({ ...prev, status: 'active' }))
      }
    } catch (err) {
      console.error('Failed to unblock user:', err)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return
    try {
      await adminService.deleteUser(id)
      setUsers(prev => prev.filter(u => u._id !== id))
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  const getUserTypeBadgeLabel = (uType) => {
    if (uType === 'college_student') return 'College Student'
    if (uType === 'graduate') return 'Graduate'
    if (uType === 'administrator') return 'Administrator'
    return 'School Student'
  }

  const getUserTypeColor = (uType) => {
    if (uType === 'college_student') return 'green'
    if (uType === 'graduate') return 'blue'
    if (uType === 'administrator') return 'purple'
    return 'purple'
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      {/* ── FILTERS BAR ── */}
      <FiltersRow style={{ flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <SearchInput
          placeholder="🔍 Search by student name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />

        <FilterSelect value={userType} onChange={e => setUserType(e.target.value)}>
          <option value="all">All User Types</option>
          <option value="school_student">School Students</option>
          <option value="college_student">College Students</option>
          <option value="graduate">Graduates</option>
          <option value="administrator">Administrators</option>
        </FilterSelect>

        <FilterSelect value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Account Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </FilterSelect>

        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>
          Showing <strong style={{ color: 'var(--primary)' }}>{users.length}</strong> users
        </span>
      </FiltersRow>

      {/* ── MAIN DATA TABLE ── */}
      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading central user records...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No user accounts found matching your filter criteria</div>
        ) : (
          <DataTable
            columns={['User Name', 'Email', 'User Category', 'District', 'Status', 'Registered Date', 'Actions']}
            data={users}
            renderRow={(u) => (
              <TR key={u._id}>
                <TD>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `hsl(${u.name ? u.name.charCodeAt(0) * 7 : 45},60%,85%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14, color: `hsl(${u.name ? u.name.charCodeAt(0) * 7 : 45},50%,35%)`
                    }}>
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{u.name || 'User'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.classLevel ? `Class ${u.classLevel}` : u.userType || 'Student'}</div>
                    </div>
                  </div>
                </TD>

                <TD style={{ color: 'var(--text2)', fontSize: 13 }}>{u.email}</TD>

                <TD>
                  <LevelBadge level={getUserTypeBadgeLabel(u.userType)} />
                </TD>

                <TD style={{ color: 'var(--text2)', fontSize: 13 }}>{u.district || '—'}</TD>

                <TD>
                  <span style={{
                    fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 12,
                    background: u.status === 'blocked' ? '#fee2e2' : '#d1fae5',
                    color: u.status === 'blocked' ? '#dc2626' : '#047857'
                  }}>
                    {u.status === 'blocked' ? 'Blocked' : 'Active'}
                  </span>
                </TD>

                <TD style={{ color: 'var(--text3)', fontSize: 12 }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </TD>

                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn onClick={() => handleOpenDetails(u)} title="View User Details">
                      👁️ Details
                    </ActionBtn>
                    {u.status === 'active' ? (
                      <ActionBtn onClick={() => handleBlock(u._id)} title="Block User">
                        🔒 Block
                      </ActionBtn>
                    ) : (
                      <ActionBtn onClick={() => handleUnblock(u._id)} title="Unblock User">
                        🔓 Activate
                      </ActionBtn>
                    )}
                    <ActionBtn danger onClick={() => handleDelete(u._id, u.name)} title="Delete User">
                      🗑
                    </ActionBtn>
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </Card>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* USER DETAILS SLIDE-OVER DRAWER MODAL                         */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', justifyContent: 'flex-end', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 540, height: '100vh',
            padding: 32, overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
            animation: 'slideLeft 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  User Account Details
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', margin: '4px 0 0' }}>
                  {selectedUser.name}
                </h2>
              </div>
              <button type="button" onClick={() => { setSelectedUser(null); setUserDetails(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                <FiX size={22} />
              </button>
            </div>

            {loadingDetails ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading profile telemetry...</div>
            ) : userDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Account Summary */}
                <div style={{ background: 'var(--surface2)', padding: 18, borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Email Address:</span>
                    <strong style={{ fontSize: 13, color: 'var(--text)' }}>{userDetails.user?.email || selectedUser.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Category:</span>
                    <strong style={{ fontSize: 13, color: 'var(--primary)' }}>{getUserTypeBadgeLabel(selectedUser.userType)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>District:</span>
                    <strong style={{ fontSize: 13, color: 'var(--text)' }}>{selectedUser.district || 'Not set'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Status:</span>
                    <strong style={{ fontSize: 13, color: selectedUser.status === 'blocked' ? '#dc2626' : '#047857' }}>
                      {selectedUser.status === 'blocked' ? 'Blocked' : 'Active'}
                    </strong>
                  </div>
                </div>

                {/* College Student Academic Profile Breakdown */}
                {userDetails.collegeProfile && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiBookOpen color="var(--primary)" /> College Academic Profile
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                      <div><strong style={{ fontSize: 12, color: 'var(--text3)' }}>Degree Programme:</strong> <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{userDetails.collegeProfile.degreeProgramme}</div></div>
                      <div><strong style={{ fontSize: 12, color: 'var(--text3)' }}>Domain Branch:</strong> <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{userDetails.collegeProfile.domain}</div></div>
                      <div><strong style={{ fontSize: 12, color: 'var(--text3)' }}>Specialization:</strong> <div style={{ fontSize: 14, fontWeight: 800, color: '#047857' }}>{userDetails.collegeProfile.specialization || 'N/A'}</div></div>
                      <div><strong style={{ fontSize: 12, color: 'var(--text3)' }}>Institution:</strong> <div style={{ fontSize: 13, color: 'var(--text2)' }}>{userDetails.collegeProfile.institution || 'N/A'}</div></div>
                      <div><strong style={{ fontSize: 12, color: 'var(--text3)' }}>Skills:</strong> <div style={{ fontSize: 13, color: 'var(--text2)' }}>{userDetails.collegeProfile.skills?.join(', ') || 'None added'}</div></div>
                      <div><strong style={{ fontSize: 12, color: 'var(--text3)' }}>Career Focus:</strong> <div style={{ fontSize: 13, color: 'var(--text2)' }}>{userDetails.collegeProfile.careerInterests?.join(', ') || 'None added'}</div></div>
                    </div>
                  </div>
                )}

                {/* Academic Advisor Recommendation Summary */}
                {userDetails.recommendation && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiAward color="#d97706" /> Academic Advisor Recommendations
                    </h3>
                    <div style={{ background: '#fef3c7', padding: 18, borderRadius: 16, border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>
                        Recommended Career Pathways:
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>
                        {userDetails.recommendation.recommendedCareerPaths?.join(' • ') || 'Recommendations Assessed'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Admin Control Actions */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  {selectedUser.status === 'active' ? (
                    <ActionBtn onClick={() => handleBlock(selectedUser._id)} style={{ flex: 1, justifyContent: 'center' }}>
                      🔒 Block Account
                    </ActionBtn>
                  ) : (
                    <ActionBtn onClick={() => handleUnblock(selectedUser._id)} style={{ flex: 1, justifyContent: 'center' }}>
                      🔓 Activate Account
                    </ActionBtn>
                  )}
                  <ActionBtn danger onClick={() => handleDelete(selectedUser._id, selectedUser.name)} style={{ flex: 1, justifyContent: 'center' }}>
                    🗑 Delete User
                  </ActionBtn>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  )
}
