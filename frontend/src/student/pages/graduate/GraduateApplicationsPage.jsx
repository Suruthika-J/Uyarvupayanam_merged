import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader, SBadge, SSelect } from '../../components/ui'
import { FiCheckSquare, FiClock, FiExternalLink, FiBell, FiPlus } from 'react-icons/fi'

const STATUS_OPTIONS = [
  'NOT_STARTED',
  'PLANNING',
  'APPLIED',
  'EXAM_COMPLETED',
  'RESULT_WAITING',
  'SELECTED',
  'REJECTED'
]

export default function GraduateApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await graduateService.getApplications()
      if (res?.success) {
        setApplications(res.applications || [])
      } else {
        setError('Failed to fetch applications.')
      }
    } catch (err) {
      console.warn('Fetch applications error:', err)
      setError('Could not connect to application tracker API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const app = applications.find(a => a._id === appId)
      if (!app) return

      await graduateService.saveApplication({
        opportunityId: app.opportunityId?._id || app.opportunityId,
        status: newStatus
      })

      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a))
    } catch (err) {
      alert('Failed to update status.')
    }
  }

  const handleSetReminder = async (oppId) => {
    try {
      const res = await graduateService.setReminder(oppId)
      if (res?.success) {
        alert(res.message || 'Reminder notification set!')
        fetchApplications()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set reminder.')
    }
  }

  const handleOpenOfficial = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Official application portal link unavailable.')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Loading your application tracker & deadline alerts...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            <FiCheckSquare size={14} /> APPLICATION TRACKER
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            My Applications Tracker
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Track your progress across government exams, higher study entrances, PSUs, and private applications.
          </p>
        </div>

        <Link to="/graduate/opportunities">
          <SBtn variant="primary" style={{ borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={15} /> Find Opportunities
          </SBtn>
        </Link>
      </div>

      {applications.length === 0 ? (
        <SCard style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
            No Applications Added Yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--s-text3)', maxWidth: 460, margin: '0 auto 20px' }}>
            Browse government exams, higher education routes, or private jobs and click "Add to My Applications" to track deadlines and status.
          </p>
          <Link to="/graduate/opportunities">
            <SBtn variant="primary">Explore Opportunities</SBtn>
          </Link>
        </SCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app) => {
            const opp = app.opportunityId || {}
            const isApplied = app.status === 'APPLIED' || app.status === 'EXAM_COMPLETED' || app.status === 'SELECTED'

            return (
              <SCard key={app._id} style={{ padding: 22, borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
                      {app.opportunityName || opp.opportunityName}
                    </span>
                    <SBadge color={isApplied ? 'green' : 'orange'}>
                      {app.status}
                    </SBadge>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>
                    🏛 {app.organization || opp.organization} • <span style={{ textTransform: 'uppercase', color: '#2563eb' }}>{app.category}</span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--s-text2)', marginTop: 8 }}>
                    Application Deadline: <strong>{app.deadline ? new Date(app.deadline).toLocaleDateString('en-IN') : 'Upcoming'}</strong>
                  </div>
                </div>

                {/* STATUS DROPDOWN & REMINDER BUTTON */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ width: 160 }}>
                    <SSelect
                      value={app.status}
                      onChange={e => handleStatusChange(app._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </SSelect>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetReminder(opp._id || app.opportunityId)}
                    style={{
                      padding: '10px 14px', borderRadius: 10,
                      border: app.reminderSet ? '1px solid #bbf7d0' : '1px solid var(--s-border)',
                      background: app.reminderSet ? '#f0fdf4' : '#fff',
                      color: app.reminderSet ? '#15803d' : 'var(--s-text2)',
                      fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <FiBell size={14} /> {app.reminderSet ? 'Reminder Set' : 'Remind Me'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenOfficial(app.officialApplicationUrl || opp.applicationUrl)}
                    style={{
                      padding: '10px 16px', borderRadius: 10, border: 'none',
                      background: 'var(--s-primary)', color: '#fff',
                      fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    Apply Portal <FiExternalLink size={13} />
                  </button>
                </div>
              </SCard>
            )
          })}
        </div>
      )}

    </div>
  )
}
