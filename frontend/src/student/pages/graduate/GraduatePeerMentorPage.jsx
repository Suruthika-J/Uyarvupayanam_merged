import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader, SBadge, SInput, STextarea } from '../../components/ui'
import { FiUsers, FiMessageSquare, FiCheck, FiX, FiUser, FiClock, FiBriefcase, FiEdit3 } from 'react-icons/fi'

export default function GraduatePeerMentorPage() {
  const [requests, setRequests] = useState([])
  const [mentees, setMentees] = useState([])
  const [mentorProfile, setMentorProfile] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({
    headline: 'Graduate Mentor & Senior Career Guide',
    graduationDegree: 'B.E. Computer Science',
    graduationYear: '2026',
    currentRole: 'Software Engineer / Graduate Trainee',
    company: 'Tech Sector',
    experienceYears: 1,
    skills: 'React, Node.js, DSA, System Design',
    bio: 'Happy to guide college students with technical preparation, placements, and competitive exam strategies.',
    availability: 'Available 2-3 hours/week',
    linkedinUrl: '',
    githubUrl: ''
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, mentRes, profRes] = await Promise.all([
        graduateService.getMentorRequests(),
        graduateService.getActiveMentees(),
        graduateService.getMentorProfile()
      ])

      if (reqRes?.success) setRequests(reqRes.requests || [])
      if (mentRes?.success) setMentees(mentRes.mentees || [])
      if (profRes?.success && profRes.profile) {
        setMentorProfile(profRes.profile)
        setProfileForm({
          headline: profRes.profile.headline || '',
          graduationDegree: profRes.profile.graduationDegree || '',
          graduationYear: profRes.profile.graduationYear || '',
          currentRole: profRes.profile.currentRole || '',
          company: profRes.profile.company || '',
          experienceYears: profRes.profile.experienceYears || 1,
          skills: Array.isArray(profRes.profile.skills) ? profRes.profile.skills.join(', ') : '',
          bio: profRes.profile.bio || '',
          availability: profRes.profile.availability || '',
          linkedinUrl: profRes.profile.linkedinUrl || '',
          githubUrl: profRes.profile.githubUrl || ''
        })
      }
    } catch (err) {
      console.warn('Fetch mentor data error:', err)
      setError('Could not load peer mentor dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAcceptRequest = async (id) => {
    setActionLoading(true)
    try {
      const res = await graduateService.acceptMentorRequest(id)
      if (res?.success) {
        fetchData()
      } else {
        alert('Failed to accept request.')
      }
    } catch (err) {
      alert('Error accepting mentor request.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeclineRequest = async (id) => {
    setActionLoading(true)
    try {
      const res = await graduateService.rejectMentorRequest(id)
      if (res?.success) {
        fetchData()
      }
    } catch (err) {
      alert('Error declining mentor request.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...profileForm,
        skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      }
      const res = await graduateService.updateMentorProfile(payload)
      if (res?.success) {
        setMentorProfile(res.profile)
        setShowProfileModal(false)
        alert('Mentor Profile updated successfully!')
      }
    } catch (err) {
      alert('Failed to save Mentor Profile.')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Loading graduate peer mentor dashboard & incoming student requests...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fae8ff', color: '#a21caf', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            <FiUsers size={14} /> GRADUATE MENTOR PORTAL
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            🎓 Peer Mentorship — Graduate Side
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            College students are looking for guidance from graduates like you. Accept requests and open 1-on-1 chats.
          </p>
        </div>

        <SBtn variant="secondary" onClick={() => setShowProfileModal(true)} style={{ borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiEdit3 size={15} /> Edit Mentor Profile
        </SBtn>
      </div>

      {/* SECTION 1: INCOMING MENTOR REQUESTS */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          🎓 Incoming Student Guidance Requests ({requests.length})
        </h3>

        {requests.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--s-text3)', fontSize: 13 }}>
            No pending mentor requests right now. New requests from college students will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.map((req) => (
              <div key={req._id} style={{
                padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>
                      {req.studentName}
                    </span>
                    <SBadge color="blue">{req.classLevel || 'College Student'}</SBadge>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>
                    Interested in: <strong>{req.interest}</strong>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--s-text2)', marginTop: 6, fontStyle: 'italic', background: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    "{req.message}"
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--s-text3)', marginTop: 6 }}>
                    Requested: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req._id)}
                    disabled={actionLoading}
                    style={{ background: '#fff', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}
                  >
                    DECLINE
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req._id)}
                    disabled={actionLoading}
                    style={{ background: '#047857', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <FiCheck size={16} /> ACCEPT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SCard>

      {/* SECTION 2: ACTIVE MENTEES LIST */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
          🤝 Active Mentees ({mentees.length})
        </h3>

        {mentees.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--s-text3)', fontSize: 13 }}>
            You have no active mentees yet. Accept an incoming request above to start guiding a student.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {mentees.map((m) => (
              <div key={m._id} style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>{m.studentName}</span>
                    <SBadge color="green">ACTIVE MENTEE</SBadge>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--s-text3)' }}>
                    {m.studentDegree || 'College Student'}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 700, marginTop: 4 }}>
                    Goal: {m.interest || 'Software Engineering'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s-text2)', marginTop: 8, fontStyle: 'italic' }}>
                    "{m.message?.substring(0, 70)}..."
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
                  <Link to={`/graduate/peer-mentor/${m._id}/chat`}>
                    <SBtn variant="primary" style={{ width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FiMessageSquare size={14} /> OPEN CHAT
                    </SBtn>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SCard>

      {/* EDIT MENTOR PROFILE MODAL */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 550, borderRadius: 24, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                Edit Graduate Mentor Profile
              </h3>
              <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SInput label="Profile Headline" value={profileForm.headline} onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })} required />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="s-grid-2col">
                <SInput label="Degree" value={profileForm.graduationDegree} onChange={e => setProfileForm({ ...profileForm, graduationDegree: e.target.value })} />
                <SInput label="Graduation Year" value={profileForm.graduationYear} onChange={e => setProfileForm({ ...profileForm, graduationYear: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="s-grid-2col">
                <SInput label="Current Role" value={profileForm.currentRole} onChange={e => setProfileForm({ ...profileForm, currentRole: e.target.value })} />
                <SInput label="Company / Sector" value={profileForm.company} onChange={e => setProfileForm({ ...profileForm, company: e.target.value })} />
              </div>

              <SInput label="Skills (Comma separated)" value={profileForm.skills} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })} />
              <SInput label="Availability" value={profileForm.availability} onChange={e => setProfileForm({ ...profileForm, availability: e.target.value })} />
              <STextarea label="Mentorship Bio" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <SBtn variant="secondary" onClick={() => setShowProfileModal(false)}>Cancel</SBtn>
                <SBtn type="submit" variant="primary">Save Mentor Profile</SBtn>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
