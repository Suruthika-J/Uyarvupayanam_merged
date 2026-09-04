import React, { useState, useEffect } from 'react'
import {
  FiUser, FiAward, FiBook, FiBriefcase, FiZap, FiTarget,
  FiCheckCircle, FiPlus, FiTrash2, FiSave, FiAlertCircle, FiTrendingUp
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

const DEGREE_OPTIONS = [
  'B.E / B.Tech', 'B.Sc', 'BCA', 'B.Com', 'BBA', 'B.A',
  'M.E / M.Tech', 'M.Sc', 'MCA', 'M.Com', 'MBA', 'Other'
]

const DOMAIN_OPTIONS = [
  'Computer Science & IT', 'Mechanical & Automobile', 'Electrical & Electronics',
  'Civil & Structural', 'Commerce & Banking', 'Management & Business',
  'Life Sciences & Healthcare', 'Arts & Humanities', 'Data Science & AI', 'Other'
]

const EMPLOYMENT_STATUS_OPTIONS = [
  'Fresher / Looking for first job',
  'Working full-time (Seeking career growth)',
  'Working in another field (Seeking career switch)',
  'Preparing for Competitive Exams',
  'Preparing for Higher Studies (India / Abroad)',
  'Entrepreneur / Freelancer'
]

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function GraduateProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [profile, setProfile] = useState({
    degree: '',
    field: '',
    domain: '',
    specialization: '',
    college: '',
    university: '',
    graduationYear: '',
    cgpa: '',
    percentage: '',
    hasBacklogs: false,
    backlogCount: 0,
    employmentStatus: 'Fresher / Looking for first job',
    technicalSkills: [],
    softSkills: [],
    tools: [],
    primaryCareerDirection: 'Get a Job',
    targetCareer: '',
    examInterest: 'No',
    selectedExams: [],
    higherStudyInterest: 'No',
    preferredHigherDegrees: [],
    targetCountries: [],
    lookingForOpportunity: 'Full-time job',
    preferredRoles: [],
    preferredLocations: [],
    expectedSalary: '',
    careerReadinessScore: 45,
    projects: [],
    internships: [],
    certifications: []
  })

  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' })
  const [newSoftSkill, setNewSoftSkill] = useState('')
  const [newTool, setNewTool] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newProject, setNewProject] = useState({ title: '', techStack: '', description: '', projectUrl: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) {
        setProfile((prev) => ({
          ...prev,
          ...res.profile,
          technicalSkills: res.profile.technicalSkills || [],
          softSkills: res.profile.softSkills || [],
          tools: res.profile.tools || [],
          preferredRoles: res.profile.preferredRoles || [],
          preferredLocations: res.profile.preferredLocations || [],
          projects: res.profile.projects || [],
          internships: res.profile.internships || [],
          certifications: res.profile.certifications || []
        }))
      }
    } catch (err) {
      console.error('Failed to load graduate profile:', err)
      setMsg({ type: 'error', text: 'Could not load profile. Please refresh.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return
    const exists = profile.technicalSkills.some(
      (s) => s.name.toLowerCase() === newSkill.name.trim().toLowerCase()
    )
    if (exists) return
    setProfile((prev) => ({
      ...prev,
      technicalSkills: [...prev.technicalSkills, { name: newSkill.name.trim(), proficiency: newSkill.proficiency }]
    }))
    setNewSkill({ name: '', proficiency: 'Intermediate' })
  }

  const handleRemoveSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((_, i) => i !== index)
    }))
  }

  const handleAddSoftSkill = () => {
    if (!newSoftSkill.trim()) return
    if (!profile.softSkills.includes(newSoftSkill.trim())) {
      setProfile((prev) => ({ ...prev, softSkills: [...prev.softSkills, newSoftSkill.trim()] }))
    }
    setNewSoftSkill('')
  }

  const handleRemoveSoftSkill = (idx) => {
    setProfile((prev) => ({ ...prev, softSkills: prev.softSkills.filter((_, i) => i !== idx) }))
  }

  const handleAddTool = () => {
    if (!newTool.trim()) return
    if (!profile.tools.includes(newTool.trim())) {
      setProfile((prev) => ({ ...prev, tools: [...prev.tools, newTool.trim()] }))
    }
    setNewTool('')
  }

  const handleRemoveTool = (idx) => {
    setProfile((prev) => ({ ...prev, tools: prev.tools.filter((_, i) => i !== idx) }))
  }

  const handleAddRole = () => {
    if (!newRole.trim()) return
    if (!profile.preferredRoles.includes(newRole.trim())) {
      setProfile((prev) => ({ ...prev, preferredRoles: [...prev.preferredRoles, newRole.trim()] }))
    }
    setNewRole('')
  }

  const handleRemoveRole = (idx) => {
    setProfile((prev) => ({ ...prev, preferredRoles: prev.preferredRoles.filter((_, i) => i !== idx) }))
  }

  const handleAddProject = () => {
    if (!newProject.title.trim()) return
    setProfile((prev) => ({ ...prev, projects: [...prev.projects, newProject] }))
    setNewProject({ title: '', techStack: '', description: '', projectUrl: '' })
  }

  const handleRemoveProject = (idx) => {
    setProfile((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMsg(null)
      const res = await graduateService.saveStep({
        step: profile.currentStep || 6,
        data: profile
      })
      if (res.success) {
        setMsg({ type: 'success', text: 'Graduate Profile updated successfully!' })
        if (res.readinessScore) {
          setProfile((p) => ({ ...p, careerReadinessScore: res.readinessScore }))
        }
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setMsg({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 4000)
    }
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
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiAward size={16} /> Professional Profile
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 4px', color: '#fff' }}>
            {profile.degree ? `${profile.degree} in ${profile.specialization || profile.domain || 'Engineering'}` : 'Graduate Profile'}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
            Keep your skills, qualifications, and placement targets updated to receive tailored recommendations.
          </p>
        </div>

        {/* Career Readiness Badge */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Career Readiness</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: profile.careerReadinessScore >= 70 ? '#10b981' : '#38bdf8' }}>
              {profile.careerReadinessScore}%
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#2563eb', color: '#fff', border: 'none',
              padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
            }}
          >
            <FiSave size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '14px 20px', borderRadius: 10,
          background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: msg.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10
        }}>
          {msg.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>

        {/* Section 1: Education */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBook size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Degree & Education</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Your completed college academic credentials</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Degree</label>
              <select
                value={profile.degree || ''}
                onChange={(e) => handleChange('degree', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              >
                <option value="">Select Degree</option>
                {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Domain / Field</label>
              <select
                value={profile.domain || ''}
                onChange={(e) => handleChange('domain', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              >
                <option value="">Select Domain</option>
                {DOMAIN_OPTIONS.map((dm) => <option key={dm} value={dm}>{dm}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Branch / Specialization</label>
              <input
                type="text"
                placeholder="e.g. Mechanical Engineering, Computer Science"
                value={profile.specialization || ''}
                onChange={(e) => handleChange('specialization', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>College / Institute</label>
                <input
                  type="text"
                  placeholder="Institute Name"
                  value={profile.college || ''}
                  onChange={(e) => handleChange('college', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Graduation Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  value={profile.graduationYear || ''}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>CGPA (out of 10)</label>
                <input
                  type="text"
                  placeholder="e.g. 8.4"
                  value={profile.cgpa || ''}
                  onChange={(e) => handleChange('cgpa', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Current Status</label>
                <select
                  value={profile.employmentStatus || ''}
                  onChange={(e) => handleChange('employmentStatus', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  {EMPLOYMENT_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills with Ratings */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiZap size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Technical Skills & Ratings</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Rate your self-assessed proficiency</p>
            </div>
          </div>

          {/* Add skill row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="e.g. Python, SQL, AutoCAD, React"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <select
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
              style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
            >
              {PROFICIENCY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={handleAddSkill}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <FiPlus size={16} />
            </button>
          </div>

          {/* Skill tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto', paddingRight: 4 }}>
            {profile.technicalSkills.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', margin: 0 }}>No skills added yet. Add your core technical proficiencies.</p>
            ) : (
              profile.technicalSkills.map((sk, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{sk.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: sk.proficiency === 'Advanced' ? '#ecfdf5' : sk.proficiency === 'Intermediate' ? '#eff6ff' : '#fef3c7',
                      color: sk.proficiency === 'Advanced' ? '#059669' : sk.proficiency === 'Intermediate' ? '#2563eb' : '#d97706'
                    }}>
                      {sk.proficiency}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Tools & Soft Skills */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Industry Tools & Software</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="e.g. Git, Docker, Excel, Jira"
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
              />
              <button onClick={handleAddTool} style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer' }}>
                <FiPlus size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.tools.map((t, idx) => (
                <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t} <span onClick={() => handleRemoveTool(idx)} style={{ cursor: 'pointer', color: '#ef4444' }}>×</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Career Direction & Targets */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiTarget size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Career Direction & Targets</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Where do you see yourself moving?</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Primary Direction</label>
              <select
                value={profile.primaryCareerDirection || 'Get a Job'}
                onChange={(e) => handleChange('primaryCareerDirection', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              >
                <option value="Get a Job">Get a Core / IT Job (Immediate Employment)</option>
                <option value="Switch Careers">Switch Careers (Cross-domain to IT / Analytics / Product)</option>
                <option value="Competitive Exams">Prepare for Government / Banking / GATE Exams</option>
                <option value="Higher Studies">Pursue Higher Studies (M.Tech, MBA, MS Abroad)</option>
                <option value="Upskilling / Freelancing">Upskilling & Building Projects First</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Target Career / Desired Role</label>
              <input
                type="text"
                placeholder="e.g. Data Analyst, Cloud DevOps Engineer, Junior Project Lead"
                value={profile.targetCareer || ''}
                onChange={(e) => handleChange('targetCareer', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Target Roles List</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Add target role (e.g. Backend Dev)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                />
                <button onClick={handleAddRole} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer' }}>
                  <FiPlus size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.preferredRoles.map((r, idx) => (
                  <span key={idx} style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r} <span onClick={() => handleRemoveRole(idx)} style={{ cursor: 'pointer', color: '#ef4444' }}>×</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Competitive Exams</label>
                <select
                  value={profile.examInterest || 'No'}
                  onChange={(e) => handleChange('examInterest', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="Yes">Yes, actively preparing</option>
                  <option value="Maybe">Maybe in the future</option>
                  <option value="No">No, focusing on private jobs</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Higher Studies</label>
                <select
                  value={profile.higherStudyInterest || 'No'}
                  onChange={(e) => handleChange('higherStudyInterest', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="Yes">Yes, planning M.Tech/MS/MBA</option>
                  <option value="Maybe">Maybe in 1-2 years</option>
                  <option value="No">No, not interested now</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Projects & Portfolio */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBriefcase size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Projects & Capstones</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Showcase projects that prove your capabilities</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, background: '#f8fafc', padding: 14, borderRadius: 10 }}>
            <input
              type="text"
              placeholder="Project Title (e.g. Sales Insights Dashboard)"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
            <input
              type="text"
              placeholder="Tech Stack (e.g. Python, Tableau, SQL)"
              value={newProject.techStack}
              onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
            <textarea
              rows={2}
              placeholder="Brief description (outcome & metrics)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, resize: 'vertical' }}
            />
            <button
              onClick={handleAddProject}
              style={{
                alignSelf: 'flex-start', background: '#7c3aed', color: '#fff',
                border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <FiPlus size={14} /> Add Project
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.projects.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', margin: 0 }}>No projects added yet.</p>
            ) : (
              profile.projects.map((p, idx) => (
                <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{p.title}</h4>
                    <button onClick={() => handleRemoveProject(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                  {p.techStack && <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>{p.techStack}</div>}
                  {p.description && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{p.description}</div>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
