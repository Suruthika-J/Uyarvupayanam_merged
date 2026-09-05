import React, { useState, useEffect, useMemo } from 'react'
import {
  FiUser, FiAward, FiBook, FiBriefcase, FiZap, FiTarget,
  FiCheckCircle, FiPlus, FiTrash2, FiSave, FiAlertCircle, FiTrendingUp
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'
import {
  MAJOR_FIELDS,
  getDegreesForField,
  getDomainsForDegree,
  getSpecializationsForDomain
} from '../../data/academicHierarchyCatalog'
import { getDynamicStage2Options } from '../../data/graduateSkillsCatalog'

const EMPLOYMENT_STATUS_OPTIONS = [
  'Fresher / Not currently working',
  'Actively searching for first job',
  'Currently employed (Seeking better role / career switch)',
  'Completing an Internship',
  'Preparing for competitive exams full-time',
  'Planning higher studies',
  'Career break / Transition period',
  'Other'
]

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function GraduateProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const [profile, setProfile] = useState({
    field: '',
    degree: '',
    domain: '',
    specialization: '',
    customDegree: '',
    customDomain: '',
    customSpecialization: '',
    college: '',
    university: '',
    graduationYear: '2025',
    cgpa: '',
    employmentStatus: 'Actively searching for first job',
    technicalSkills: [],
    softSkills: [],
    tools: [],
    interests: [],
    primaryCareerDirection: 'Get a Job',
    targetCareer: '',
    examInterest: 'No',
    selectedExams: [],
    higherStudyInterest: 'No',
    preferredHigherDegrees: [],
    projects: []
  })

  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' })
  const [newTool, setNewTool] = useState('')
  const [newInterest, setNewInterest] = useState('')

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
          tools: res.profile.tools || [],
          interests: res.profile.interests || [],
          projects: res.profile.projects || []
        }))
      }
    } catch (err) {
      console.error('Failed to load graduate profile:', err)
      setMsg({ type: 'error', text: 'Could not load profile. Please refresh.' })
    } finally {
      setLoading(false)
    }
  }

  // Cascading options calculation
  const availableDegrees = useMemo(() => getDegreesForField(profile.field), [profile.field])
  const availableDomains = useMemo(() => getDomainsForDegree(profile.field, profile.degree), [profile.field, profile.degree])
  const availableSpecializations = useMemo(() => getSpecializationsForDomain(profile.field, profile.degree, profile.domain), [profile.field, profile.degree, profile.domain])
  const dynamicStage2 = useMemo(() => getDynamicStage2Options(profile.field, profile.degree, profile.domain, profile.specialization), [profile.field, profile.degree, profile.domain, profile.specialization])

  const handleFieldChange = (newField) => {
    setProfile(p => ({
      ...p,
      field: newField,
      degree: '',
      domain: '',
      specialization: '',
      customDegree: '',
      customDomain: '',
      customSpecialization: ''
    }))
  }

  const handleDegreeChange = (newDegree) => {
    setProfile(p => ({
      ...p,
      degree: newDegree,
      domain: '',
      specialization: '',
      customDomain: '',
      customSpecialization: ''
    }))
  }

  const handleDomainChange = (newDomain) => {
    setProfile(p => ({
      ...p,
      domain: newDomain,
      specialization: '',
      customSpecialization: ''
    }))
  }

  const handleAddSkill = (skillName, proficiency = 'Intermediate') => {
    const sName = skillName || newSkill.name.trim()
    if (!sName) return
    const exists = profile.technicalSkills.some(
      s => (s.name || s).toLowerCase() === sName.toLowerCase()
    )
    if (exists) return
    setProfile(prev => ({
      ...prev,
      technicalSkills: [...prev.technicalSkills, { name: sName, proficiency }]
    }))
    setNewSkill({ name: '', proficiency: 'Intermediate' })
  }

  const handleRemoveSkill = (idx) => {
    setProfile(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((_, i) => i !== idx)
    }))
  }

  const handleAddTool = (toolName) => {
    const tName = toolName || newTool.trim()
    if (!tName) return
    if (!profile.tools.includes(tName)) {
      setProfile(prev => ({ ...prev, tools: [...prev.tools, tName] }))
    }
    setNewTool('')
  }

  const handleRemoveTool = (idx) => {
    setProfile(prev => ({ ...prev, tools: prev.tools.filter((_, i) => i !== idx) }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMsg(null)
      const res = await graduateService.saveStep(profile)
      if (res.success) {
        await graduateService.completeOnboarding(profile)
        setMsg({ type: 'success', text: 'Graduate Profile updated successfully!' })
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update profile.' })
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' })
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
            <FiAward size={16} /> Canonical Graduate Career Profile
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 4px', color: '#fff' }}>
            {profile.degree ? `${profile.degree} in ${profile.domain}` : 'Graduate Profile'}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
            Updating your profile updates personalized recommendations across all 12 Graduate pages.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
          }}
        >
          <FiSave size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>

      {msg && (
        <div style={{
          padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: msg.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
        }}>
          {msg.text}
        </div>
      )}

      {/* Stage 1: Academic Qualifications */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
          🎓 Stage 1: Academic Qualification Hierarchy
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Major Academic Field */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Major Academic Field *
            </label>
            <select
              value={profile.field}
              onChange={e => handleFieldChange(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            >
              <option value="">Select Major Academic Field</option>
              {MAJOR_FIELDS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Degree Qualification */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Degree Qualification *
            </label>
            <select
              value={profile.degree}
              onChange={e => handleDegreeChange(e.target.value)}
              disabled={!profile.field}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            >
              <option value="">Select Degree Qualification</option>
              {availableDegrees.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Domain / Branch */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Domain / Branch *
            </label>
            <select
              value={profile.domain}
              onChange={e => handleDomainChange(e.target.value)}
              disabled={!profile.degree}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            >
              <option value="">Select Domain / Branch</option>
              {availableDomains.map(dm => (
                <option key={dm} value={dm}>{dm}</option>
              ))}
            </select>
          </div>

          {/* Specialization */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Specialization / Elective Track
            </label>
            <select
              value={profile.specialization}
              onChange={e => setProfile({ ...profile, specialization: e.target.value })}
              disabled={!profile.domain}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            >
              <option value="">Select Specialization (Optional)</option>
              {availableSpecializations.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stage 2: Technical Skills & Tools */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
          ⚡ Stage 2: Dynamic Skills & Tools Assessment
        </h3>

        {/* Dynamic Skill Badges */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
            Recommended Technical Skills for {profile.domain || 'your domain'}:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dynamicStage2.technicalSkills.map(sk => (
              <button
                key={sk}
                onClick={() => handleAddSkill(sk)}
                style={{
                  padding: '6px 12px', borderRadius: 20, border: '1px solid #bfdbfe',
                  background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                + {sk}
              </button>
            ))}
          </div>
        </div>

        {/* Active Technical Skills List */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {profile.technicalSkills.map((sk, idx) => (
            <span key={idx} style={{ background: '#dcfce7', color: '#14532d', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {sk.name || sk} ({sk.proficiency || 'Intermediate'})
              <button onClick={() => handleRemoveSkill(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
