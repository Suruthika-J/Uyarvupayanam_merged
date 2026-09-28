import React, { useState, useEffect } from 'react'
import {
  FiCheckSquare, FiPlus, FiBriefcase, FiSend,
  FiClock, FiAward, FiTrash2, FiExternalLink, FiCopy, FiCheck, FiHelpCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedPlacement,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduatePlacementPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [applications, setApplications] = useState([])
  const [newApp, setNewApp] = useState({ company: '', role: '', date: '', status: 'Applied', notes: '' })

  useEffect(() => {
    fetchProfile()
    const saved = localStorage.getItem('graduate_job_applications')
    if (saved) {
      try { setApplications(JSON.parse(saved)) } catch (e) {}
    }
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for placement:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const placementInfo = generatePersonalizedPlacement(profile)

  const saveApps = (list) => {
    setApplications(list)
    localStorage.setItem('graduate_job_applications', JSON.stringify(list))
  }

  const handleAddApp = () => {
    if (!newApp.company.trim() || !newApp.role.trim()) return
    const updated = [
      { ...newApp, id: Date.now(), date: newApp.date || new Date().toISOString().split('T')[0] },
      ...applications
    ]
    saveApps(updated)
    setNewApp({ company: '', role: '', date: '', status: 'Applied', notes: '' })
  }

  const handleStatusChange = (id, newStatus) => {
    const updated = applications.map((app) => app.id === id ? { ...app, status: newStatus } : app)
    saveApps(updated)
  }

  const handleDelete = (id) => {
    const updated = applications.filter((app) => app.id !== id)
    saveApps(updated)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#bae6fd', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiBriefcase size={16} /> PROFILE-DRIVEN PLACEMENT COMMAND CENTER
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Placement Strategy for {placementInfo.targetRole}
          </h1>
          <p style={{ margin: 0, color: '#e0f2fe', fontSize: 14 }}>
            Tailored application templates, resume projects, and pipeline tracking for {academic.fullHierarchyText}.
          </p>
        </div>
      </div>

      {/* Suggested Projects Section */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          💡 Recommended Resume Evidence Projects for {placementInfo.targetRole}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {placementInfo.suggestedProjects.map((p, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <GraduateCourseImage course={p.title} height={150} borderRadius={10} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0369a1', marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 700, marginBottom: 8 }}>Tech Stack: {p.techStack}</div>
                <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 8 }}>{p.description}</div>
                <div style={{ fontSize: 11.5, color: '#0369a1', fontWeight: 600 }}>• {p.highlights.join(' • ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Tracker */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          📌 Job Application Pipeline Tracker
        </h3>

        {/* Add Application Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 20 }}>
          <input
            type="text" placeholder="Company Name" value={newApp.company}
            onChange={e => setNewApp({ ...newApp, company: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
          />
          <input
            type="text" placeholder="Target Role" value={newApp.role}
            onChange={e => setNewApp({ ...newApp, role: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
          />
          <input
            type="date" value={newApp.date}
            onChange={e => setNewApp({ ...newApp, date: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
          />
          <select
            value={newApp.status}
            onChange={e => setNewApp({ ...newApp, status: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
          >
            {['Applied', 'OA / Assessment', 'Interview Scheduled', 'Offer', 'Rejected'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleAddApp}
            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
          >
            + Log App
          </button>
        </div>

        {/* Applications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.map(app => (
            <div key={app.id} style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{app.role} @ {app.company}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Applied on: {app.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <select
                  value={app.status}
                  onChange={e => handleStatusChange(app.id, e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700 }}
                >
                  {['Applied', 'OA / Assessment', 'Interview Scheduled', 'Offer', 'Rejected'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button onClick={() => handleDelete(app.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
