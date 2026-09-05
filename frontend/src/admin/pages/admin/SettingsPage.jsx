import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../config/axios'
import { Card, Toggle } from '../../components/UI'
import { 
  FiShield, FiSettings, FiBell, FiUsers, FiLock, 
  FiUserPlus, FiTrash2, FiSave, FiAlertCircle, FiPlus 
} from 'react-icons/fi'

const initialToggles = {
  twoFactorAuth: false,
  maintenanceMode: false,
  studentRegistration: true,
  pushNotifications: true,
}

function SettingsRow({ icon: Icon, label, desc, on, onClick, disabled, color = 'var(--primary)' }) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ 
        width: 44, height: 44, borderRadius: 12, background: `${color}15`, 
        color: color, display: 'grid', placeItems: 'center', fontSize: 20 
      }}>
        <Icon />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.4 }}>{desc}</div>
      </div>
      <Toggle on={on} onClick={disabled ? undefined : onClick} />
    </div>
  )
}

function SectionTitle({ icon: Icon, children, count }) {
  return (
    <div
      style={{
        fontFamily: 'Nunito',
        fontSize: 16,
        fontWeight: 900,
        color: 'var(--text)',
        marginBottom: 18,
        marginTop: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon style={{ opacity: 0.6 }} />
        {children}
      </div>
      {count !== undefined && (
        <span style={{ fontSize: 12, background: 'var(--surface3)', padding: '2px 10px', borderRadius: 20, color: 'var(--text2)' }}>
          {count} active
        </span>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [toggles, setToggles] = useState(initialToggles)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState('')

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdSaving, setPwdSaving] = useState(false)

  const [subAdminForm, setSubAdminForm] = useState({ name: '', email: '', password: '' })
  const [subAdmins, setSubAdmins] = useState([])
  const [subAdminSaving, setSubAdminSaving] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const showMessage = (text) => {
    setMessage(text)
    setError('')
    setTimeout(() => setMessage(''), 3000)
  }

  const showError = (text) => {
    setError(text)
    setMessage('')
    setTimeout(() => setError(''), 4000)
  }

  const loadAll = async () => {
    try {
      setLoading(true)
      const [settingsRes, subAdminsRes] = await Promise.all([
        axiosInstance.get('/settings'),
        axiosInstance.get('/admin/subadmins'),
      ])

      const s = settingsRes.data || {}
      setToggles({
        twoFactorAuth: Boolean(s.twoFactorAuth),
        maintenanceMode: Boolean(s.maintenanceMode),
        studentRegistration: Boolean(s.studentRegistration),
        pushNotifications: Boolean(s.pushNotifications),
      })

      setSubAdmins(subAdminsRes.data?.subAdmins || [])
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const updateToggle = async (key) => {
    const nextValue = !toggles[key]
    setToggles((prev) => ({ ...prev, [key]: nextValue }))
    setSavingKey(key)

    try {
      await axiosInstance.put('/settings/update', { [key]: nextValue })
      showMessage('Settings updated successfully')
    } catch (e) {
      setToggles((prev) => ({ ...prev, [key]: !nextValue }))
      showError(e.response?.data?.message || 'Failed to update setting')
    } finally {
      setSavingKey('')
    }
  }

  const handleChangePassword = async () => {
    if (!pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword) {
      showError('Please fill all password fields')
      return
    }

    if (pwd.newPassword !== pwd.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    try {
      setPwdSaving(true)
      await axiosInstance.put('/admin/change-password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      })
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showMessage('Password updated successfully')
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to update password')
    } finally {
      setPwdSaving(false)
    }
  }

  const handleCreateSubAdmin = async () => {
    if (!subAdminForm.email || !subAdminForm.password) {
      showError('Email and password are required')
      return
    }

    try {
      setSubAdminSaving(true)
      await axiosInstance.post('/admin/create-subadmin', {
        name: subAdminForm.name || 'Sub Admin',
        email: subAdminForm.email,
        password: subAdminForm.password,
        permissions: {
          manageUsers: true,
          manageSettings: false,
          manageContent: true,
          manageNotifications: true,
          viewReports: true,
        },
      })
      setSubAdminForm({ name: '', email: '', password: '' })
      await loadAll()
      showMessage('Sub-admin added successfully')
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to add sub-admin')
    } finally {
      setSubAdminSaving(false)
    }
  }

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm('Remove this sub-admin?')) return
    try {
      await axiosInstance.delete(`/admin/subadmin/${id}`)
      setSubAdmins((prev) => prev.filter((a) => a._id !== id))
      showMessage('Sub-admin removed')
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to remove sub-admin')
    }
  }

  return (
    <div style={{ maxWidth: 800, paddingBottom: 100, animation: 'fadeUp 0.4s ease both' }}>
      {/* Alert Messages */}
      <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {message && (
          <div style={{ background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: '0 10px 20px rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiSave /> {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: '0 10px 20px rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiAlertCircle /> {error}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 32, color: 'var(--text)', margin: '0 0 8px' }}>Admin Settings</h1>
        <p style={{ color: 'var(--text3)', margin: 0, fontSize: 15 }}>Manage security, system controls, and staff permissions.</p>
      </div>

      {/* 🔐 1. SECURITY */}
      <SectionTitle icon={FiShield}>Security</SectionTitle>
      <SettingsRow 
        icon={FiLock} 
        label="Two-Factor Authentication" 
        desc="Add an extra layer of security to the admin login process" 
        on={toggles.twoFactorAuth} 
        disabled={loading || savingKey === 'twoFactorAuth'} 
        onClick={() => updateToggle('twoFactorAuth')}
        color="#8b5cf6"
      />
      
      <Card style={{ marginTop: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <FiLock style={{ color: 'var(--text3)' }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Change Password</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <input type="password" placeholder="Current Password" value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
          <input type="password" placeholder="New Password" value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
          <input type="password" placeholder="Confirm Password" value={pwd.confirmPassword} onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
        </div>
        <button onClick={handleChangePassword} disabled={pwdSaving} style={{ padding: '12px 24px', background: 'var(--primary)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, cursor: pwdSaving ? 'not-allowed' : 'pointer', opacity: pwdSaving ? 0.7 : 1 }}>
          {pwdSaving ? 'Updating...' : 'Update Password'}
        </button>
      </Card>

      {/* ⚙️ 2. SYSTEM CONTROLS */}
      <SectionTitle icon={FiSettings}>System Controls</SectionTitle>
      <SettingsRow 
        icon={FiUserPlus} 
        label="Student Registration" 
        desc="Toggle whether new students can sign up for the platform" 
        on={toggles.studentRegistration} 
        disabled={loading || savingKey === 'studentRegistration'} 
        onClick={() => updateToggle('studentRegistration')}
        color="#10b981"
      />
      <SettingsRow 
        icon={FiAlertCircle} 
        label="Maintenance Mode" 
        desc="Disable student access while performing updates" 
        on={toggles.maintenanceMode} 
        disabled={loading || savingKey === 'maintenanceMode'} 
        onClick={() => updateToggle('maintenanceMode')}
        color="#f59e0b"
      />

      {/* 🔔 3. NOTIFICATIONS */}
      <SectionTitle icon={FiBell}>Notifications</SectionTitle>
      <SettingsRow 
        icon={FiBell} 
        label="Push Notifications" 
        desc="Enable system-wide alerts and deadline reminders for students" 
        on={toggles.pushNotifications} 
        disabled={loading || savingKey === 'pushNotifications'} 
        onClick={() => updateToggle('pushNotifications')}
        color="#3b82f6"
      />

      {/* 👥 4. SUB-ADMIN */}
      <SectionTitle icon={FiUsers} count={subAdmins.length}>Sub-Admin Management</SectionTitle>
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 24 }}>
          <input placeholder="Full Name" value={subAdminForm.name} onChange={(e) => setSubAdminForm((f) => ({ ...f, name: e.target.value }))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
          <input placeholder="Email Address" value={subAdminForm.email} onChange={(e) => setSubAdminForm((f) => ({ ...f, email: e.target.value }))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
          <input type="password" placeholder="Password" value={subAdminForm.password} onChange={(e) => setSubAdminForm((f) => ({ ...f, password: e.target.value }))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
          <button onClick={handleCreateSubAdmin} disabled={subAdminSaving} style={{ width: 44, height: 44, background: 'var(--primary)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center', cursor: subAdminSaving ? 'not-allowed' : 'pointer', opacity: subAdminSaving ? 0.7 : 1 }}>
            <FiPlus />
          </button>
        </div>

        {subAdmins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--border)', borderRadius: 20 }}>
            <FiUsers size={32} style={{ color: 'var(--text3)', marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500 }}>No sub-admins added yet.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {subAdmins.map((a) => (
              <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', borderRadius: 16, padding: '14px 20px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{a.name || 'Staff Member'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>{a.email}</div>
                </div>
                <button onClick={() => handleDeleteSubAdmin(a._id)} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: '1px solid #ef444433', color: '#ef4444', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#ef444411'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* 💾 5. SAVE SETTINGS (Informational Footer) */}
      <div style={{ marginTop: 60, padding: 30, background: 'var(--surface2)', borderRadius: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)15', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 20 }}>
          <FiSave />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>Auto-Save Active</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>All toggle changes are saved instantly to the system database.</div>
        </div>
      </div>
    </div>
  )
}
