import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SCard, SBadge, SLoader } from '../../components/ui'
import {
  FiUser, FiEdit2, FiCheckCircle, FiBook, FiMapPin,
  FiAward, FiTarget, FiZap, FiCalendar, FiArrowRight
} from 'react-icons/fi'

export default function CollegeProfilePage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken')
        if (!token) { setLoading(false); return }
        const res = await axios.get('http://localhost:5000/api/college-profile/my-profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success && res.data.profile) {
          setProfile(res.data.profile)
        } else {
          setError('Profile not set up yet.')
        }
      } catch (err) {
        setError('Could not load profile. Please complete your onboarding.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

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
    { icon: FiCalendar, label: 'Academic Year', value: profile.currentYear },
    { icon: FiCalendar, label: 'Current Semester', value: profile.currentSemester },
    { icon: FiBook, label: 'Study Mode', value: profile.studyMode || 'Full-time' },
  ]

  return (
    <div className="s-anim-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 26, color: 'var(--s-text)', margin: '0 0 6px' }}>
            My Academic Profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0 }}>
            Your enrolled degree details, skills, and career interests stored in the platform.
          </p>
        </div>
        <SBtn variant="primary" onClick={() => navigate('/student/onboarding/college')} style={{ flexShrink: 0 }}>
          <FiEdit2 size={15} /> Edit / Update Profile
        </SBtn>
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
      <SCard style={{ padding: '28px 32px', borderRadius: 20, marginBottom: 28, background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)', color: '#fff' }}>
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
              {profile.institution || 'Institution not set'} • {profile.currentYear || 'Year not set'}
            </div>
          </div>
        </div>
      </SCard>

      {/* 2-Column Section Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-2col">

        {/* Academic Details */}
        <SCard style={{ padding: '24px 28px', borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiBook color="var(--s-primary)" /> Academic Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {profileSections.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--s-primary-l)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text)', marginTop: 2 }}>{value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </SCard>

        {/* Skills & Interests Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Skills */}
          <SCard style={{ padding: '22px 24px', borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiZap color="#7c3aed" /> Skills
            </h3>
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
              <FiTarget color="#b45309" /> Career Interests
            </h3>
            {profile.careerInterests?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.careerInterests.map(c => (
                  <SBadge key={c} color="orange">{c}</SBadge>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>No career interests added yet.</p>
            )}
          </SCard>
        </div>
      </div>

      {/* Edit CTA */}
      <div style={{ marginTop: 28, padding: '24px 28px', background: '#f0fdf4', borderRadius: 16, border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#166534', marginBottom: 4 }}>Want to update your information?</div>
          <div style={{ fontSize: 13, color: '#166534' }}>Keep your academic profile up-to-date for the best AI advisor recommendations.</div>
        </div>
        <SBtn variant="primary" onClick={() => navigate('/student/onboarding/college')}>
          <FiEdit2 size={15} /> Update Profile
        </SBtn>
      </div>
    </div>
  )
}
