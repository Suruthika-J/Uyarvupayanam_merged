import React, { useState, useEffect } from 'react'
import {
  FiCheckSquare, FiPlus, FiBriefcase, FiSend,
  FiClock, FiAward, FiTrash2, FiExternalLink, FiCopy, FiCheck
} from 'react-icons/fi'

const INITIAL_APPLICATIONS = [
  { id: 1, company: 'Zoho Corporation', role: 'Software Developer', date: '2026-08-20', status: 'OA / Assessment', notes: 'Completed online programming test round' },
  { id: 2, company: 'Freshworks', role: 'Product Operations / Analyst', date: '2026-08-25', status: 'Interview Scheduled', notes: 'Round 1 Technical scheduled on Friday' },
  { id: 3, company: 'TCS Digital', role: 'Digital Systems Engineer', date: '2026-08-10', status: 'Offer', notes: 'Offered 7.5 LPA' }
]

const STATUS_OPTIONS = ['Applied', 'OA / Assessment', 'Interview Scheduled', 'Offer', 'Rejected']

const TEMPLATES = [
  {
    title: 'LinkedIn Message to Recruiter / Engineering Lead',
    text: `Hi [Name],

I noticed [Company] is scaling its [Engineering/Data] team for [Role].

I recently graduated with a degree in [Degree/Branch] and have built [Name of Capstone Project] using [Tech Stack], which solves [Key Problem/Outcome].

Given your focus on [Team focus/Scale], I'd love to share my portfolio and see if my skills could support your current priorities.

Resume & Projects: [Portfolio/GitHub Link]

Best regards,
[Your Name]`
  },
  {
    title: 'Cold Email to Startup Founder / Hiring Manager',
    text: `Subject: Application: [Role] — [Your Name] ([Degree] Graduate)

Dear [Hiring Manager],

I've been following [Company]'s recent developments in [Domain/Product].

I am a proactive graduate with practical hands-on experience building [Project 1] and [Project 2], focusing on clean architecture and scalable code.

Key Highlights:
• Proficient in: [Skill 1, Skill 2, Skill 3]
• Built: [Brief 1-line description of high-impact project with metrics]
• Available for immediate joining

Would you have 10 minutes for a brief chat this week?

Best regards,
[Your Name] | [Phone] | [LinkedIn]`
  }
]

export default function GraduatePlacementPage() {
  const [applications, setApplications] = useState([])
  const [newApp, setNewApp] = useState({ company: '', role: '', date: '', status: 'Applied', notes: '' })
  const [copiedIdx, setCopiedIdx] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('graduate_job_applications')
    if (saved) {
      try {
        setApplications(JSON.parse(saved))
      } catch (e) {
        setApplications(INITIAL_APPLICATIONS)
      }
    } else {
      setApplications(INITIAL_APPLICATIONS)
    }
  }, [])

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

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2500)
  }

  const total = applications.length
  const interviews = applications.filter((a) => a.status === 'Interview Scheduled').length
  const offers = applications.filter((a) => a.status === 'Offer').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #065f46 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a7f3d0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiCheckSquare size={16} /> Placement Command Center
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Job Search & Application Pipeline
          </h1>
          <p style={{ margin: 0, color: '#d1fae5', fontSize: 14, lineHeight: 1.5 }}>
            Track off-campus outreach, manage interview schedules, and leverage proven recruiter messaging templates.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 700 }}>Total Tracked</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{total}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700 }}>Interviews</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#60a5fa' }}>{interviews}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#fed7aa', fontWeight: 700 }}>Offers</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>{offers}</div>
          </div>
        </div>
      </div>

      {/* Add New Application Card */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          + Log New Job Application
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Company Name (e.g. Infosys, Swiggy)"
            value={newApp.company}
            onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
          />
          <input
            type="text"
            placeholder="Target Role (e.g. SDE-1)"
            value={newApp.role}
            onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
          />
          <input
            type="date"
            value={newApp.date}
            onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
          />
          <select
            value={newApp.status}
            onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
          >
            {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Notes (referral name, job posting URL, rounds)"
            value={newApp.notes}
            onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddApp())}
          />
          <button
            onClick={handleAddApp}
            style={{
              background: '#059669', color: '#fff', border: 'none',
              padding: '9px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13.5,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <FiPlus size={16} /> Add Application
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            Active Application Pipeline
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Updated in real-time</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px' }}>Company</th>
                <th style={{ padding: '12px 20px' }}>Role</th>
                <th style={{ padding: '12px 20px' }}>Date Applied</th>
                <th style={{ padding: '12px 20px' }}>Status</th>
                <th style={{ padding: '12px 20px' }}>Notes</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No job applications logged yet. Add your first application above.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a' }}>{app.company}</td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{app.role}</td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 12.5 }}>{app.date}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          padding: '4px 10px', borderRadius: 20, border: 'none',
                          fontWeight: 700, fontSize: 12, cursor: 'pointer',
                          background: app.status === 'Offer' ? '#ecfdf5' : app.status === 'Interview Scheduled' ? '#eff6ff' : app.status === 'Rejected' ? '#fef2f2' : '#f1f5f9',
                          color: app.status === 'Offer' ? '#059669' : app.status === 'Interview Scheduled' ? '#2563eb' : app.status === 'Rejected' ? '#dc2626' : '#475569'
                        }}
                      >
                        {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 12.5 }}>{app.notes || '—'}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(app.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                        title="Delete application"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiter Outreach Templates */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          Proven Recruiter & Manager Outreach Templates
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
          Use these proven templates for cold messaging on LinkedIn and email to bypass crowded applicant tracking portals.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {TEMPLATES.map((tmpl, idx) => (
            <div key={idx} style={{ background: '#f8fafc', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{tmpl.title}</span>
                  <button
                    onClick={() => handleCopy(tmpl.text, idx)}
                    style={{
                      background: copiedIdx === idx ? '#ecfdf5' : '#fff',
                      border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 10px',
                      fontSize: 12, fontWeight: 600, color: copiedIdx === idx ? '#059669' : '#475569',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    {copiedIdx === idx ? <FiCheck size={13} /> : <FiCopy size={13} />}
                    {copiedIdx === idx ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre style={{
                  margin: 0, padding: 12, background: '#fff', borderRadius: 8,
                  fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.45,
                  fontFamily: 'inherit', border: '1px solid #f1f5f9'
                }}>
                  {tmpl.text}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
