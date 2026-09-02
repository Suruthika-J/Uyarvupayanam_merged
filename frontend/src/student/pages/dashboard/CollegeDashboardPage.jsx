import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { userActionService } from '../../../services/userActionService'
import { SBtn, SCard, SBadge, SLoader } from '../../components/ui'
import {
  FiCompass, FiAward, FiFileText, FiMapPin, FiBell,
  FiArrowRight, FiCheckCircle, FiTarget, FiZap, FiBookmark,
  FiTrendingUp, FiSliders, FiUser
} from 'react-icons/fi'

export default function CollegeDashboardPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [topCareer, setTopCareer] = useState(null)
  const [savedItems, setSavedItems] = useState([])
  const [missingProfileItems, setMissingProfileItems] = useState([])

  useEffect(() => {
    const fetchCollegeDashboardData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('studentToken')
        if (token) {
          const profileRes = await axios.get('http://localhost:5000/api/college-profile/my-profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (profileRes.data?.success && profileRes.data.profile) {
            const p = profileRes.data.profile
            setProfile(p)
            const missing = []
            if (!p.institution) missing.push('Institution Name')
            if (!p.skills || p.skills.length === 0) missing.push('Skills')
            if (!p.careerInterests || p.careerInterests.length === 0) missing.push('Career Interests')
            if (!p.academicInterests || p.academicInterests.length === 0) missing.push('Academic Focus')
            setMissingProfileItems(missing)
          }

          try {
            const advisorRes = await axios.get('http://localhost:5000/api/college-advisor/recommendations', {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (advisorRes.data?.success && advisorRes.data.recommendations?.length) {
              setTopCareer(advisorRes.data.recommendations[0])
            }
          } catch (e) { /* advisor may not have data yet */ }

          try {
            const bRes = await userActionService.getBookmarks()
            if (bRes.data?.bookmarks) setSavedItems(bRes.data.bookmarks)
          } catch (e) { /* bookmarks optional */ }
        }
      } catch (err) {
        console.warn('Failed to load college dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCollegeDashboardData()
  }, [])

  if (loading) {
    return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>
  }

  const completionScore = profile?.profileCompletion || 75
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = student?.name?.split(' ')[0] || 'Student'

  return (
    <div className="s-anim-up">

      {/* ── HERO WELCOME BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        color: '#fff', padding: '32px 36px', borderRadius: 24,
        boxShadow: '0 10px 30px rgba(4, 120, 87, 0.2)', marginBottom: 32,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
          <FiCompass size={13} /> AI Academic & Career Guidance Platform
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px', fontFamily: 'var(--s-font-display)', color: '#fff' }}>
          {greet}, {firstName}! 👋
        </h1>
        <p style={{ fontSize: 15, color: '#a7f3d0', fontWeight: 700, margin: '0 0 20px' }}>
          {profile?.degreeProgramme || 'Degree Programme'} • {profile?.domain || 'Domain'} • {profile?.currentYear || 'Current Year'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Field</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 2 }}>{profile?.field?.toUpperCase() || 'Engineering'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Institution</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>{profile?.institution || 'Not set yet'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Specialization</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>{profile?.specialization || 'Not set'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Profile Completion</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiCheckCircle size={14} /> {completionScore}%
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }} className="s-grid-2col">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* TOP CAREER RECOMMENDATION */}
          {topCareer && (
            <SCard style={{ padding: '28px 32px', borderRadius: 20, borderLeft: '5px solid var(--s-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)', letterSpacing: '0.05em' }}>
                  🌟 Top Recommended Career Direction
                </span>
                <SBadge color="green">{topCareer.matchPercentage}% {topCareer.matchCategory}</SBadge>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 6px' }}>{topCareer.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 16px', lineHeight: 1.5 }}>"{topCareer.explanation}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>
                <div style={{ fontSize: 13, color: 'var(--s-text2)', fontWeight: 600 }}>
                  Matching Skills: {topCareer.matchedSkills?.join(', ') || 'Degree Core Alignment'}
                </div>
                <SBtn variant="primary" onClick={() => navigate('/student/advisor')} style={{ padding: '8px 20px', borderRadius: 12 }}>
                  View Recommendation <FiArrowRight style={{ marginLeft: 6 }} />
                </SBtn>
              </div>
            </SCard>
          )}

          {/* CAREER PATHWAY PROGRESSION */}
          <SCard style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTrendingUp color="var(--s-primary)" /> Career Pathway Progression
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, textAlign: 'center' }}>
              {[
                { label: '1. Degree', value: profile?.degreeProgramme?.split(' ')[0] || 'B.E./B.Tech', color: 'var(--s-primary)' },
                { label: '2. Domain', value: profile?.domain?.split(' ')[0] || 'CS/IT', color: '#047857' },
                { label: '3. Skills', value: `${profile?.skills?.length || 0} Acquired`, color: '#7c3aed' },
                { label: '4. Career', value: topCareer?.title || 'Target Role', color: '#b45309' },
              ].map(step => (
                <div key={step.label} style={{ background: 'var(--s-surface2)', padding: 14, borderRadius: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>{step.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: step.color, marginTop: 4 }}>{step.value}</div>
                </div>
              ))}
            </div>
          </SCard>

          {/* QUICK ACTIONS */}
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }} className="s-grid-3col">
              {[
                { to: '/student/advisor', icon: FiCompass, label: 'AI Advisor', bg: '#ede9fe', color: '#6d28d9' },
                { to: '/student/career/skill-gap', icon: FiZap, label: 'Skill Gap', bg: '#dbeafe', color: '#1e40af' },
                { to: '/student/college-profile', icon: FiUser, label: 'My Profile', bg: '#d1fae5', color: '#047857' },
                { to: '/student/career/resume', icon: FiFileText, label: 'Resume Builder', bg: '#fce4ec', color: '#c62828' },
                { to: '/student/scholarships', icon: FiAward, label: 'Scholarships', bg: '#fef3c7', color: '#b45309' },
                { to: '/student/academic/planner', icon: FiSliders, label: 'Study Planner', bg: '#f1f5f9', color: '#475569' },
              ].map(({ to, icon: Icon, label, bg, color }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                  <SCard style={{ padding: 18, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>{label}</div>
                  </SCard>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ACADEMIC PROFILE WIDGET */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>Academic Profile</h4>
              <SBadge color={completionScore >= 80 ? 'green' : 'orange'}>{completionScore}%</SBadge>
            </div>
            <div style={{ background: '#e2e8f0', height: 8, borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${completionScore}%`, height: '100%', background: completionScore >= 80 ? '#047857' : '#d97706', transition: 'width 0.5s ease' }} />
            </div>
            {missingProfileItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>Missing:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {missingProfileItems.map(item => (
                    <span key={item} style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>• {item}</span>
                  ))}
                </div>
              </div>
            )}
            <SBtn variant="primary" onClick={() => navigate('/student/college-profile')} style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>
              {completionScore < 100 ? 'Complete Profile' : 'View Profile'}
            </SBtn>
          </SCard>

          {/* SAVED ITEMS */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>Saved Items ({savedItems.length})</h4>
              <Link to="/student/bookmarks" style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)', textDecoration: 'none' }}>View All →</Link>
            </div>
            {savedItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedItems.slice(0, 4).map((item, idx) => (
                  <div key={idx} style={{ padding: 10, background: 'var(--s-surface2)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiBookmark color="var(--s-primary)" size={14} />
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.title || item.name || 'Saved Item'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--s-text3)', textAlign: 'center', padding: '16px 0' }}>
                No saved items yet. Bookmark resources to view them here.
              </div>
            )}
          </SCard>

          {/* NOTIFICATIONS SHORTCUT */}
          <SCard style={{ padding: 20, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>🔔 Notifications</h4>
              <Link to="/student/notifications" style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)', textDecoration: 'none' }}>View All →</Link>
            </div>
            <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>Check your latest academic alerts, mentor messages, and opportunities.</p>
          </SCard>
        </div>
      </div>
    </div>
  )
}
