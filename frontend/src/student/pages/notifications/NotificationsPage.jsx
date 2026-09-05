import React, { useState, useEffect } from 'react'
import { notificationService } from '../../services'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SCard, SBtn, SBadge, SLoader, SEmpty, SAlert } from '../../components/ui'
import { FiCheckCircle, FiCheck } from 'react-icons/fi'

const TYPE_META = {
  exam:         { emoji: '📝', color: '#c48a1a', badge: 'gold',   label: 'Exam'         },
  scholarship:  { emoji: '🎓', color: '#16a34a', badge: 'green',  label: 'Scholarship'  },
  cutoff:       { emoji: '📊', color: '#dc2626', badge: 'orange', label: 'Cutoff'        },
  registration: { emoji: '📋', color: '#1d5fba', badge: 'blue',   label: 'Registration' },
  course:       { emoji: '📚', color: '#7c3aed', badge: 'purple', label: 'Course'        },
  general:      { emoji: '📢', color: 'var(--s-primary)', badge: 'green', label: 'Update' },
}

function TimeAgo({ date }) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  const m    = Math.floor(diff / 60000)
  if (m < 1)   return <>Just now</>
  if (m < 60)  return <>{m}m ago</>
  const h = Math.floor(m / 60)
  if (h < 24)  return <>{h}h ago</>
  const day = Math.floor(h / 24)
  return day === 1 ? <>Yesterday</> : <>{day} days ago</>
}

export default function NotificationsPage() {
  const { student } = useStudentAuth()
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [markingAll,    setMarkingAll]    = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    if (!student?._id) return
    try {
      setLoading(true)
      const res = await notificationService.getUserNotifications(student._id)
      setNotifications(Array.isArray(res) ? res : (res.notifications || res.data || []))
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch { }
  }

  const handleMarkAllRead = async () => {
    if (!student?._id) return
    setMarkingAll(true)
    try {
      await notificationService.markAllRead(student._id)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {
      setError('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="student-root" style={{ padding: '32px 20px', maxWidth: 760, margin: '0 auto' }}>

      <div className="s-anim-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 'clamp(22px,4vw,30px)', color: 'var(--s-text)', marginBottom: 6 }}>
            Notifications
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)' }}>
            {unread > 0
              ? <><span style={{ fontWeight: 700, color: 'var(--s-accent)' }}>{unread} unread</span> — stay on top of important updates</>
              : 'All caught up — no unread notifications'
            }
          </p>
        </div>
        {unread > 0 && (
          <SBtn variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll}>
            <FiCheckCircle size={14} /> {markingAll ? 'Marking...' : 'Mark all read'}
          </SBtn>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <SAlert type="error" onClose={() => setError('')}>{error}</SAlert>
        </div>
      )}

      {loading ? <SLoader /> : notifications.length === 0 ? (
        <SEmpty icon="🔔" title="No notifications yet" desc="Important updates from your admin will appear here." />
      ) : (
        <div className="s-anim-up s-d1" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n, i) => {
            const meta = TYPE_META[n.type] || TYPE_META.general
            return (
              <SCard key={n._id || i} style={{
                padding: '18px 20px',
                borderLeft: `4px solid ${n.isRead ? 'var(--s-border)' : meta.color}`,
                opacity: n.isRead ? 0.8 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'var(--s-bg2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{meta.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 15, color: 'var(--s-text)' }}>
                        {n.title}
                      </span>
                      <SBadge color={meta.badge}>{meta.label}</SBadge>
                      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--s-accent)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--s-text2)', lineHeight: 1.65, marginBottom: 8 }}>
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--s-text3)' }}><TimeAgo date={n.createdAt} /></span>
                      {!n.isRead && (
                        <button onClick={() => handleMarkRead(n._id)} style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          fontSize: 12.5, fontWeight: 700, color: 'var(--s-primary)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--s-font-display)', padding: 0,
                        }}>
                          <FiCheck size={12} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </SCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
