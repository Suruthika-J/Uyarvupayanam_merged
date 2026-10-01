import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { useCollegeTheme } from '../../context/CollegeThemeContext'
import axiosInstance from '../../../config/axios'
import { SBtn, SCard, SBadge, SLoader, SInput, SSelect } from '../../components/ui'
import {
  FiUser, FiEdit2, FiCheckCircle, FiBook, FiMapPin,
  FiAward, FiTarget, FiZap, FiCalendar, FiArrowRight, FiX, FiCheck
} from 'react-icons/fi'

export default function CollegeProfilePage() {
  const { student } = useStudentAuth()
  const { theme, themeKey } = useCollegeTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [discoveryResult, setDiscoveryResult] = useState(null)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  // Edit form fields
  const [editCgpa, setEditCgpa] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editSemester, setEditSemester] = useState('')
  const [editSpecialization, setEditSpecialization] = useState('')
  const [editTargetCareer, setEditTargetCareer] = useState('')
  const [editInstitution, setEditInstitution] = useState('')
  const [editSkillsText, setEditSkillsText] = useState('')

  const isGamified = themeKey === 'gamified'

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) { setLoading(false); return }
      const res = await axiosInstance.get('/college-profile/my-profile')
      if (res.data?.success && res.data.profile) {
        const p = res.data.profile
        setProfile(p)
        setEditCgpa(p.cgpa || '')
        setEditYear(p.currentYear || '3rd Year')
        setEditSemester(p.currentSemester || 'Semester 5')
        setEditSpecialization(p.specialization || '')
        setEditTargetCareer(p.targetCareer || '')
        setEditInstitution(p.institution || '')
        setEditSkillsText((p.skills || []).join(', '))
      } else {
        setError('Profile not set up yet.')
      }

      try {
        const discRes = await axiosInstance.get('/onboarding/discovery/result')
        if (discRes.data?.success && discRes.data.recommendedDomain) {
          setDiscoveryResult(discRes.data)
        }
      } catch (e) {
        // Discovery result optional if not completed yet
      }
    } catch (err) {
      setError('Could not load profile. Please complete your onboarding.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleQuickSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess('')
    try {
      const parsedSkills = editSkillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const res = await axiosInstance.post('/college-profile/save', {
        cgpa: editCgpa,
        currentYear: editYear,
        currentSemester: editSemester,
        specialization: editSpecialization,
        targetCareer: editTargetCareer,
        institution: editInstitution,
        skills: parsedSkills
      })

      if (res.data?.success && res.data.profile) {
        setProfile(res.data.profile)
        setSaveSuccess('Profile updated successfully!')
        setTimeout(() => {
          setSaveSuccess('')
          setShowEditModal(false)
        }, 1200)
      }
    } catch (err) {
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>

  if (error || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
        <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: 'var(--s-text)', marginBottom: 8 }}>
          Academic Profile Not Set Up
        </h2>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24 }}>
          Please complete your college onboarding to populate your academic profile.
        </p>
        <SBtn variant="primary" onClick={() => navigate('/student/onboarding/college')}>
          Complete Onboarding <FiArrowRight style={{ marginLeft: 8 }} />
        </SBtn>
      </div>
    )
  }

  const completionScore = profile.profileCompletion || 75

  const profileSections = [
    { icon: FiBook, label: 'Field / Discipline', value: profile.field },
    { icon: FiAward, label: 'Degree Programme', value: profile.degreeProgramme },
    { icon: FiTarget, label: 'Domain / Branch', value: profile.domain },
    { icon: FiZap, label: 'Specialization', value: profile.specialization || 'Not specified' },
    { icon: FiMapPin, label: 'Institution', value: profile.institution || 'Not specified' },
    { icon: FiCalendar, label: 'Academic Year', value: profile.currentYear || 'Not set' },
    { icon: FiCalendar, label: 'Current Semester', value: profile.currentSemester || 'Not set' },
    { icon: FiAward, label: 'Current CGPA', value: profile.cgpa ? `${profile.cgpa} / 10.0` : 'Not recorded' },
    { icon: FiTarget, label: 'Target Career Goal', value: profile.targetCareer || 'Not chosen' },
    { icon: FiBook, label: 'Study Mode', value: profile.studyMode || 'Full-time' },
  ]

  return (
    <div className="s-anim-up" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 26, color: 'var(--s-text)', margin: '0 0 6px' }}>
            My Academic Profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0 }}>
            Your enrolled degree details, skills, CGPA, and target career goals stored in the platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SBtn variant="primary" onClick={() => setShowEditModal(true)} style={{ borderRadius: 12 }}>
            <FiEdit2 size={15} style={{ marginRight: 6 }} /> Quick Edit Profile
          </SBtn>
          <SBtn variant="secondary" onClick={() => navigate('/student/onboarding/college')} style={{ borderRadius: 12 }}>
            Full Setup Wizard
          </SBtn>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <SCard style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 24, background: completionScore >= 80 ? '#f0fdf4' : '#fffbeb', border: `1px solid ${completionScore >= 80 ? '#86efac' : '#fcd34d'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: completionScore >= 80 ? '#166534' : '#b45309' }}>
            Profile Completion: {completionScore}%
          </span>
          {completionScore >= 100 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#166534' }}>
              <FiCheckCircle size={16} /> Complete
            </span>
          )}
        </div>
        <div style={{ background: '#e2e8f0', height: 10, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${completionScore}%`, height: '100%', background: completionScore >= 80 ? '#047857' : '#d97706', transition: 'width 0.6s ease' }} />
        </div>
      </SCard>

      {/* Student Identity Card */}
      <SCard style={{
        padding: '28px 32px', borderRadius: 20, marginBottom: 28,
        background: isGamified
          ? 'linear-gradient(135deg, #0f2044 0%, #080d1f 100%)'
          : 'linear-gradient(135deg, #1a6fc4 0%, #0ea5e9 100%)',
        color: '#fff',
        border: isGamified ? '1px solid rgba(0,245,212,0.2)' : 'none',
        boxShadow: isGamified ? '0 0 24px rgba(0,245,212,0.1)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 28, flexShrink: 0 }}>
            {student?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{student?.name}</div>
            <div style={{ fontSize: 14, color: '#a7f3d0', fontWeight: 700 }}>
              {profile.degreeProgramme} • {profile.domain}
            </div>
            <div style={{ fontSize: 13, color: '#6ee7b7', marginTop: 4 }}>
              {profile.institution || 'Institution not set'} • {profile.currentYear || 'Year not set'} {profile.currentSemester ? `(${profile.currentSemester})` : ''}
            </div>
          </div>
          {profile.cgpa && (
            <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current CGPA</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 2 }}>{profile.cgpa}</div>
            </div>
          )}
        </div>
      </SCard>

      {/* Profile Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">

        {/* Academic Details Column */}
        <SCard style={{ padding: '24px 28px', borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiAward color="#1a6fc4" /> Academic Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {profileSections.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: idx < profileSections.length - 1 ? '1px solid var(--s-border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color="var(--s-text3)" />
                    <span style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', textAlign: 'right' }}>
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        </SCard>

        {/* Skills & Interests Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Skills */}
          <SCard style={{ padding: '22px 24px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiZap color="#7c3aed" /> Technical Skills
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                + Edit Skills
              </button>
            </div>
            {profile.skills?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.skills.map(skill => (
                  <SBadge key={skill} color="purple">{skill}</SBadge>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>No skills added yet.</p>
            )}
          </SCard>

          {/* Academic Interests */}
          <SCard style={{ padding: '22px 24px', borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBook color="#047857" /> Academic Interests
            </h3>
            {profile.academicInterests?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.academicInterests.map(interest => (
                  <SBadge key={interest} color="green">{interest}</SBadge>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>No interests added yet.</p>
            )}
          </SCard>

          {/* Career Interests */}
          <SCard style={{ padding: '22px 24px', borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTarget color="#b45309" /> Target Career Focus
            </h3>
            {profile.targetCareer ? (
              <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, color: '#b45309', fontWeight: 800, fontSize: 14 }}>
                🎯 {profile.targetCareer}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>No target career specified yet.</p>
            )}
          </SCard>
        </div>
      </div>

      {/* QUICK EDIT MODAL */}
      {showEditModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                  Quick Edit Academic Profile
                </h3>
                <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '4px 0 0' }}>
                  Update your latest semester, CGPA, institution, and skills
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <FiX size={18} color="var(--s-text)" />
              </button>
            </div>

            {saveSuccess && (
              <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, color: '#166534', marginBottom: 18, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCheck size={16} /> {saveSuccess}
              </div>
            )}

            <form onSubmit={handleQuickSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                    Current CGPA (out of 10.0)
                  </label>
                  <SInput
                    placeholder="e.g. 8.4"
                    value={editCgpa}
                    onChange={e => setEditCgpa(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                    Academic Year
                  </label>
                  <SSelect
                    value={editYear}
                    onChange={e => setEditYear(e.target.value)}
                    options={[
                      { value: '1st Year', label: '1st Year' },
                      { value: '2nd Year', label: '2nd Year' },
                      { value: '3rd Year', label: '3rd Year' },
                      { value: '4th Year', label: '4th Year' },
                      { value: 'Passed Out / Graduate', label: 'Passed Out / Graduate' },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                    Current Semester
                  </label>
                  <SSelect
                    value={editSemester}
                    onChange={e => setEditSemester(e.target.value)}
                    options={[
                      { value: 'Semester 1', label: 'Semester 1' },
                      { value: 'Semester 2', label: 'Semester 2' },
                      { value: 'Semester 3', label: 'Semester 3' },
                      { value: 'Semester 4', label: 'Semester 4' },
                      { value: 'Semester 5', label: 'Semester 5' },
                      { value: 'Semester 6', label: 'Semester 6' },
                      { value: 'Semester 7', label: 'Semester 7' },
                      { value: 'Semester 8', label: 'Semester 8' },
                    ]}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                    Specialization
                  </label>
                  <SInput
                    placeholder="e.g. AI & ML, VLSI, Thermal"
                    value={editSpecialization}
                    onChange={e => setEditSpecialization(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                  Target Career Goal
                </label>
                <SInput
                  placeholder="e.g. Software Engineer, Robotics Engineer"
                  value={editTargetCareer}
                  onChange={e => setEditTargetCareer(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                  College / Institution Name
                </label>
                <SInput
                  placeholder="e.g. College of Engineering Guindy (CEG)"
                  value={editInstitution}
                  onChange={e => setEditInstitution(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                  Technical Skills (Comma separated)
                </label>
                <textarea
                  rows={3}
                  value={editSkillsText}
                  onChange={e => setEditSkillsText(e.target.value)}
                  placeholder="e.g. Python, React, Data Structures, SQL, Git"
                  style={{
                    width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)',
                    fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <SBtn variant="secondary" onClick={() => setShowEditModal(false)} type="button" style={{ borderRadius: 12 }}>
                  Cancel
                </SBtn>
                <SBtn variant="primary" type="submit" disabled={saving} style={{ borderRadius: 12 }}>
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </SBtn>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
