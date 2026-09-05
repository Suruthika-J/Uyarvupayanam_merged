import React, { useState, useEffect, useCallback } from 'react'
import {
  FiltersRow,
  PrimaryBtn,
  ActionBtn,
  Modal,
  FormGrid,
  FormGroup,
  FormInput,
  FormActions,
} from '../../components/UI'
import { notificationService } from '../../../services/notificationService'
import { useNotifications } from '../../context/NotificationContext'

// ── Helpers ──────────────────────────────────────────────────────────────
const TYPE_META = {
  announcement: { icon: '📢', color: '#6c5ce7' },
  exam: { icon: '📝', color: '#e17055' },
  scholarship: { icon: '🎓', color: '#00b894' },
  career: { icon: '🎯', color: '#0984e3' },
  college: { icon: '🏫', color: '#fdcb6e' },
  course: { icon: '📘', color: '#a29bfe' },
  system: { icon: '⚙️', color: '#74b9ff' },
  counselling: { icon: '🤝', color: '#fd79a8' },
}

const TYPES = Object.keys(TYPE_META)
const LEVELS = ['All', '5th', '8th', '10th', '12th', 'Graduate']

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 16,
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      borderTop: `4px solid ${color}`,
      flex: 1,
      minWidth: 130,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Nunito' }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { addNotification, deleteNotification: ctxDelete } = useNotifications()

  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterLevel, setFilterLevel] = useState('All')
  const [searchQ, setSearchQ] = useState('')

  // Modal state
  const [modal, setModal] = useState(false)     // 'create' | 'edit' | false
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Form fields
  const [form, setForm] = useState({
    title: '', message: '', type: 'announcement',
    targetLevel: 'All', isBroadcast: true, expiresAt: '',
  })
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ── Fetch data ───────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterType !== 'all') params.type = filterType
      if (filterLevel !== 'All') params.targetLevel = filterLevel

      const [dataRes, statsRes] = await Promise.all([
        notificationService.getAll(params),
        notificationService.getStats(),
      ])
      setNotifications(dataRes.notifications || [])
      setStats(statsRes)
    } catch (e) {
      console.error('Fetch notifications error:', e)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterLevel])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Form helpers ─────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ title: '', message: '', type: 'announcement', targetLevel: 'All', isBroadcast: true, expiresAt: '' })
    setFormError('')
    setEditTarget(null)
  }

  const openCreate = () => { resetForm(); setModal('create') }

  const openEdit = (n) => {
    setEditTarget(n)
    setForm({
      title: n.title,
      message: n.message,
      type: n.type || 'announcement',
      targetLevel: n.targetLevel || 'All',
      isBroadcast: n.isBroadcast,
      expiresAt: n.expiresAt ? n.expiresAt.split('T')[0] : '',
    })
    setModal('edit')
  }

  const closeModal = () => { setModal(false); resetForm() }

  // ── Submit Create / Edit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) return setFormError('Title is required')
    if (!form.message.trim()) return setFormError('Message is required')
    setFormError('')
    setSaving(true)
    try {
      if (modal === 'create') {
        const res = await notificationService.create({
          ...form,
          expiresAt: form.expiresAt || undefined,
        })
        addNotification(res.notification)
        setNotifications((p) => [res.notification, ...p])
        setSuccessMsg(`✅ Notification "${form.title}" sent successfully!`)
      } else if (modal === 'edit' && editTarget) {
        const res = await notificationService.update(editTarget._id, {
          title: form.title,
          message: form.message,
          type: form.type,
          targetLevel: form.targetLevel,
          expiresAt: form.expiresAt || undefined,
        })
        setNotifications((p) =>
          p.map((n) => (n._id === editTarget._id ? res.notification : n))
        )
        setSuccessMsg('✅ Notification updated!')
      }
      closeModal()
      setTimeout(() => setSuccessMsg(''), 3500)
      fetchAll()
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to save notification')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id)
      ctxDelete(id)
      setNotifications((p) => p.filter((n) => n._id !== id))
      setDeleteConfirm(null)
      setSuccessMsg('🗑 Notification deleted.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL notifications? This cannot be undone.')) return
    try {
      await notificationService.deleteAll()
      setNotifications([])
      setStats(null)
      setSuccessMsg('🗑 All notifications cleared.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      console.error('Delete all error:', e)
    }
  }

  // ── Filter client-side search ────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    const q = searchQ.toLowerCase()
    return !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
  })

  const totalSent = Number(stats?.totalSent ?? stats?.total ?? 0) || 0
  const broadcasts = Number(stats?.broadcasts ?? 0) || 0
  const unread = Number(stats?.unread ?? 0) || 0
  const read = Math.max(0, totalSent - unread)

  const selectStyle = {
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      {/* ── Success Toast ──────────────────────────────────────────── */}
      {successMsg && (
        <div style={{
          background: 'linear-gradient(135deg,#00b894,#00cec9)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 12,
          marginBottom: 16,
          fontWeight: 700,
          fontSize: 14,
          animation: 'fadeUp 0.3s ease',
        }}>
          {successMsg}
        </div>
      )}

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard icon="🔔" label="Total Sent" value={totalSent} color="#6c5ce7" />
        <StatCard icon="📡" label="Broadcasts" value={broadcasts} color="#0984e3" />
        <StatCard icon="📬" label="Unread" value={unread} color="#e17055" />
        <StatCard icon="✅" label="Read" value={read} color="#00b894" />
      </div>

      {/* ── Filters Row ────────────────────────────────────────────── */}
      <FiltersRow>
        {/* Search */}
        <input
          id="notif-search"
          placeholder="🔍 Search notifications..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          style={{ ...selectStyle, minWidth: 200 }}
        />

        {/* Type filter */}
        <select id="notif-filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
          <option value="all">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_META[t].icon} {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        {/* Level filter */}
        <select id="notif-filter-level" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={selectStyle}>
          {LEVELS.map((l) => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
        </select>

        <span style={{ fontSize: 13, color: 'var(--text3)' }}>
          {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {notifications.length > 0 && (
            <ActionBtn danger onClick={handleDeleteAll} id="delete-all-btn">
              🗑 Clear All
            </ActionBtn>
          )}
          <PrimaryBtn onClick={openCreate} id="create-notif-btn">
            + New Notification
          </PrimaryBtn>
        </div>
      </FiltersRow>

      {/* ── Notification List ───────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)', fontSize: 15 }}>
          ⏳ Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 64,
          color: 'var(--text3)', fontSize: 15,
          background: 'var(--surface)',
          border: '1.5px dashed var(--border)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No notifications found</div>
          <div style={{ fontSize: 13 }}>Create your first notification to alert students.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.announcement
            return (
              <div
                key={n._id}
                id={`notif-card-${n._id}`}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: 16,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${meta.color}22` }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Type Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${meta.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                        background: '#e17055', color: '#fff',
                      }}>NEW</span>
                    )}
                    {n.isBroadcast && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                        background: `${meta.color}22`, color: meta.color,
                      }}>📡 Broadcast</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10, lineHeight: 1.6 }}>
                    {n.message}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px',
                      background: `${meta.color}22`, color: meta.color,
                      borderRadius: 20, fontWeight: 700, textTransform: 'capitalize',
                    }}>
                      {meta.icon} {n.type}
                    </span>
                    {n.targetLevel && n.targetLevel !== 'All' && (
                      <span style={{
                        fontSize: 11, padding: '3px 10px',
                        background: 'rgba(0,184,148,0.15)', color: '#00b894',
                        borderRadius: 20, fontWeight: 700,
                      }}>
                        🎓 {n.targetLevel}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>
                      🕐 {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <ActionBtn onClick={() => openEdit(n)} id={`edit-notif-${n._id}`}>
                    ✏️ Edit
                  </ActionBtn>
                  <ActionBtn
                    danger
                    onClick={() => setDeleteConfirm(n)}
                    id={`delete-notif-${n._id}`}
                  >
                    🗑 Delete
                  </ActionBtn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────── */}
      {modal && (
        <Modal
          title={modal === 'create' ? '📢 Create Notification' : '✏️ Edit Notification'}
          onClose={closeModal}
        >
          <FormGrid>
            <FormGroup label="Title" full>
              <FormInput
                id="notif-title"
                placeholder="e.g. JEE Main Registration Open"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </FormGroup>

            <FormGroup label="Message" full>
              <textarea
                id="notif-message"
                placeholder="Enter the notification details..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                style={{
                  background: 'var(--surface2)', border: '1.5px solid var(--border)',
                  color: 'var(--text)', borderRadius: 10,
                  padding: '10px 12px', fontSize: 13.5, fontFamily: 'Outfit', outline: 'none',
                  width: '100%', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </FormGroup>

            <FormGroup label="Type">
              <select
                id="notif-type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '9px 12px', fontSize: 13.5, fontFamily: 'Outfit', outline: 'none', width: '100%' }}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].icon} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Target Level">
              <select
                id="notif-level"
                value={form.targetLevel}
                onChange={(e) => setForm((f) => ({ ...f, targetLevel: e.target.value }))}
                style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '9px 12px', fontSize: 13.5, fontFamily: 'Outfit', outline: 'none', width: '100%' }}
              >
                {LEVELS.map((l) => <option key={l} value={l}>{l === 'All' ? 'All Students' : `${l} Grade`}</option>)}
              </select>
            </FormGroup>

            {modal === 'create' && (
              <FormGroup label="Send To" full>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                    <input
                      type="radio"
                      name="broadcast"
                      checked={form.isBroadcast}
                      onChange={() => setForm((f) => ({ ...f, isBroadcast: true }))}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    📡 Broadcast to All Students
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                    <input
                      type="radio"
                      name="broadcast"
                      checked={!form.isBroadcast}
                      onChange={() => setForm((f) => ({ ...f, isBroadcast: false }))}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    👤 Targeted (by User ID)
                  </label>
                </div>
              </FormGroup>
            )}

            <FormGroup label="Expiry Date (optional)">
              <FormInput
                id="notif-expires"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </FormGroup>
          </FormGrid>

          {formError && (
            <div style={{
              background: 'rgba(225,112,85,0.12)', border: '1px solid #e17055',
              color: '#e17055', borderRadius: 10, padding: '10px 14px',
              fontSize: 13, fontWeight: 600, marginTop: 12,
            }}>
              ⚠️ {formError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              onClick={closeModal}
              style={{
                padding: '10px 22px', borderRadius: 12, border: '1.5px solid var(--border)',
                background: 'var(--surface2)', color: 'var(--text)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              id="notif-submit-btn"
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '10px 26px', borderRadius: 12, border: 'none',
                background: saving ? 'var(--border)' : 'linear-gradient(135deg,#6c5ce7,#a29bfe)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '⏳ Saving...' : modal === 'create' ? '📢 Send Notification' : '💾 Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────────── */}
      {deleteConfirm && (
        <Modal title="🗑 Delete Notification?" onClose={() => setDeleteConfirm(null)}>
          <p style={{ color: 'var(--text3)', fontSize: 14, lineHeight: 1.6 }}>
            Are you sure you want to delete the notification:
            <br />
            <strong style={{ color: 'var(--text)' }}>"{deleteConfirm.title}"</strong>?
            <br />
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                padding: '10px 22px', borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--surface2)', color: 'var(--text)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              onClick={() => handleDelete(deleteConfirm._id)}
              style={{
                padding: '10px 26px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#e17055,#d63031)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              🗑 Yes, Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}



