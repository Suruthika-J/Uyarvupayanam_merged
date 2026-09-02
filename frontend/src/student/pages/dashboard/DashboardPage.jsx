import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import {
  notificationService,
  careerService,
  courseService,
  examService,
  scholarshipService,
  collegeService,
} from '../../services'
import { userActionService } from '../../../services/userActionService'
import { SBtn, SLoader, SSectionHeader, SEmpty, SBadge, SCard } from '../../components/ui'
import {
  FiGrid, FiBookOpen, FiMapPin, FiFileText, FiAward,
  FiBell, FiUser, FiSettings, FiLogOut, FiArrowRight,
  FiClock, FiMenu, FiX,
} from 'react-icons/fi'
import s from './DashboardPage.module.css'
import { mentorRequestService } from '../../services/mentorRequestService'
import MentorRequestModal from '../../components/mentor/MentorRequestModal'
import onboardingService from '../../../services/onboardingService'
import class5CommunicationService from '../../../services/class5CommunicationService'

/* â”€â”€ Sidebar navigation config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SIDEBAR_NAV = [
  { id: 'dashboard',     icon: FiGrid,     label: 'Dashboard',      to: '/student/dashboard' },
  { id: 'bookmarks',     icon: FiAward,    label: 'My Bookmarks',   to: '/student/bookmarks' },
  { id: 'courses',       icon: FiBookOpen, label: 'Courses',        to: '/student/courses' },
  { id: 'colleges',      icon: FiMapPin,   label: 'Colleges',       to: '/student/colleges' },
  { id: 'exams',         icon: FiFileText, label: 'Entrance Exams', to: '/student/careers' },
  { id: 'scholarships',  icon: FiAward,    label: 'Scholarships',   to: '/student/scholarships' },
  { id: 'notifications', icon: FiBell,     label: 'Notifications',  to: '/student/notifications' },
  { id: 'profile',       icon: FiUser,     label: 'Profile',        to: '/student/profile' },
  { id: 'settings',      icon: FiSettings, label: 'Settings',       to: '/student/profile' },
]

/* â”€â”€ Stat card gradient presets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STAT_GRADIENTS = [
  'linear-gradient(135deg, #1d5fba 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #e17055 0%, #f97316 100%)',
  'linear-gradient(135deg, #c48a1a 0%, #eab308 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
]

/* ── Recommended careers (static fallback & dynamic mapping) ──────── */
const CAREER_CARDS = [
  { icon: '⚙️', title: 'Engineering',  sub: 'Build the future',      bg: '#eaf0fb', color: '#1d5fba' },
  { icon: '🩺', title: 'Medicine',     sub: 'Heal & innovate',       bg: '#fce4ec', color: '#c62828' },
  { icon: '📊', title: 'Commerce',     sub: 'Business & finance',    bg: '#fdf4e0', color: '#c48a1a' },
  { icon: '🎨', title: 'Arts',         sub: 'Create & express',      bg: '#f3effe', color: '#7c3aed' },
]

const CAREER_INFO_MAP = {
  'Engineering': { icon: '⚙️', sub: 'Build the future', bg: '#eaf0fb', color: '#1d5fba' },
  'IT': { icon: '💻', sub: 'Tech & Software', bg: '#e0f2fe', color: '#0ea5e9' },
  'Data Science': { icon: '📈', sub: 'Analytics & AI', bg: '#f3e8ff', color: '#9333ea' },
  'Polytechnic': { icon: '🔧', sub: 'Technical Skills', bg: '#ffedd5', color: '#ea580c' },
  'Medical': { icon: '🩺', sub: 'Heal & innovate', bg: '#fce4ec', color: '#c62828' },
  'Nursing': { icon: '🏥', sub: 'Patient Care', bg: '#ffe4e6', color: '#e11d48' },
  'Pharmacy': { icon: '💊', sub: 'Medicine expert', bg: '#dcfce7', color: '#16a34a' },
  'Agriculture': { icon: '🌱', sub: 'Farming & Science', bg: '#fef08a', color: '#854d0e' },
  'Biotechnology': { icon: '🧬', sub: 'Bio & Tech', bg: '#e0e7ff', color: '#4f46e5' },
  'Design': { icon: '🎨', sub: 'Create & express', bg: '#f3effe', color: '#7c3aed' },
  'Media': { icon: '🎬', sub: 'Broadcast & Film', bg: '#fce7f3', color: '#db2777' },
  'Teaching': { icon: '👩‍🏫', sub: 'Educate the next gen', bg: '#fae8ff', color: '#c026d3' },
  'Journalism': { icon: '📰', sub: 'News & Writing', bg: '#f1f5f9', color: '#475569' },
  'Arts': { icon: '🎭', sub: 'Culture & Expression', bg: '#fee2e2', color: '#dc2626' },
  'Commerce': { icon: '📊', sub: 'Business & finance', bg: '#fdf4e0', color: '#c48a1a' },
  'CA': { icon: '🧮', sub: 'Accountancy', bg: '#fef3c7', color: '#d97706' },
  'B.Com': { icon: '💼', sub: 'Bachelor of Commerce', bg: '#ffedd5', color: '#ea580c' },
  'Business': { icon: '🏢', sub: 'Enterprise', bg: '#e0e7ff', color: '#4338ca' },
  'Management': { icon: '👔', sub: 'Lead & organize', bg: '#dbeafe', color: '#2563eb' },
  'Civil Services': { icon: '🏛️', sub: 'Public Administration', bg: '#e2e8f0', color: '#334155' },
  'Law': { icon: '⚖️', sub: 'Justice & Rights', bg: '#ffedd5', color: '#c2410c' },
  'Public Administration': { icon: '📋', sub: 'Government operations', bg: '#f1f5f9', color: '#475569' }
};

const getDefaultCareerCard = (title) => ({
  icon: '🎓', title, sub: 'Explore this path', bg: '#f3f4f6', color: '#4b5563'
});

/* ── TimeAgo helper ───────────────────────────────────────────── */
function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ────────────────────────────────────────────────────────────── 
   DASHBOARD PAGE
   ────────────────────────────────────────────────────────────── */
import { Navigate } from 'react-router-dom'

export default function DashboardPage() {
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (student?.userType === 'college_student') {
    return <Navigate to="/college/dashboard" replace />
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isClass5 = student?.classLevel === '5' || student?.classLevel === '5th' || student?.classLevel === 'Class 5';
  const [commProgress, setCommProgress] = useState(null);

  useEffect(() => {
    if (!student?._id || !isClass5) return;
    class5CommunicationService.getProgress().then(res => {
      if (res.success) {
        setCommProgress(res.data);
      }
    }).catch(err => console.error("Error fetching comm progress:", err));
  }, [student?._id, isClass5]);

  /* ── Data state ────────────────────────────────────────────── */
  const [notifications, setNotifications] = useState([])
  const [careers, setCareers] = useState([])
  const [exams, setExams] = useState([])
  const [scholarships, setScholarships] = useState([])
  const [stats, setStats] = useState({ courses: 0, exams: 0, scholarships: 0, colleges: 0 })
  const [savedGuidance, setSavedGuidance] = useState([])
  const [mentorRequests, setMentorRequests] = useState([])
  const [recommendedCareerCards, setRecommendedCareerCards] = useState(CAREER_CARDS)
  const [loading, setLoading] = useState(true)
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false)
  const [recommendation, setRecommendation] = useState(null)
  const [retaking, setRetaking] = useState(false)

  /* ── Fetch all data on mount ──────────────────────────────── */
  useEffect(() => {
    const normalize = (res) => {
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res?.careers)) return res.careers
      if (Array.isArray(res?.courses)) return res.courses
      if (Array.isArray(res?.exams)) return res.exams
      if (Array.isArray(res?.scholarships)) return res.scholarships
      if (Array.isArray(res?.colleges)) return res.colleges
      return []
    }

    Promise.allSettled([
      notificationService.getUserNotifications(student?._id),
      careerService.getAll(),
      examService.getAll(),
      scholarshipService.getAll(),
      courseService.getAll(),
      collegeService.getAll(),
      userActionService.getSavedList(), // Fetch ALL types
      mentorRequestService.getMyRequests(student?._id),
      onboardingService.getRecommendations(student?._id).catch(() => null)
    ]).then(([notifR, careerR, examR, scholR, courseR, collegeR, savedR, mentorR, onbR]) => {
      try {
        const notifs = normalize(notifR.value || notifR.reason?.response?.data)
        setNotifications(notifs.slice(0, 3))
        
        setCareers(normalize(careerR.value || careerR.reason?.response?.data).slice(0, 6))

        const examArr = normalize(examR.value || examR.reason?.response?.data)
        setExams(examArr.slice(0, 4))

        const scholArr = normalize(scholR.value || scholR.reason?.response?.data)
        setScholarships(scholArr.slice(0, 3))

        setStats({
          courses: normalize(courseR.value || courseR.reason?.response?.data).length,
          exams: examArr.length,
          scholarships: scholArr.length,
          colleges: normalize(collegeR.value || collegeR.reason?.response?.data).length,
        })

        if (savedR.status === 'fulfilled' && savedR.value?.success) {
          setSavedGuidance(savedR.value.data)
        }

        if (mentorR.status === 'fulfilled' && mentorR.value?.success) {
           setMentorRequests(mentorR.value.data)
        }

        // Process Onboarding Recommendations
        if (onbR?.status === 'fulfilled' && onbR?.value?.success) {
          const recData = onbR.value.result;
          setRecommendation(recData);

          const isClass5  = student?.classLevel === '5'  || student?.classLevel === '5th'  || student?.classLevel === 'Class 5';
          const isClass8  = student?.classLevel === '8'  || student?.classLevel === '8th'  || student?.classLevel === 'Class 8';
          const isClass10 = student?.classLevel === '10' || student?.classLevel === '10th' || student?.classLevel === 'Class 10';
          const isClass12 = student?.classLevel === '12' || student?.classLevel === '12th' || student?.classLevel === 'Class 12';

          if ((isClass5 || isClass8 || isClass10 || isClass12) && recData.fetchedClass5Content) {
            // Map Class 5 Content to Cards
            const skills = recData.fetchedClass5Content.skills || [];
            const mappedSkills = skills.map(s => ({
              title: s.title,
              sub: s.category || 'Skill',
              icon: '🚀',
              bg: '#e0f2fe',
              color: '#0ea5e9',
              link: `/student/career-path/class-5/${s.slug}`
            }));
            setRecommendedCareerCards(mappedSkills);
          } else if (recData?.recommendedCareers?.length > 0) {
            const recCareers = recData.recommendedCareers;
            const mappedCards = recCareers.map(c => {
              if (CAREER_INFO_MAP[c]) {
                return { title: c, ...CAREER_INFO_MAP[c] }
              }
              return getDefaultCareerCard(c)
            });
            setRecommendedCareerCards(mappedCards);
          }
        }
      } catch (err) {
        console.error("Error processing dashboard data:", err)
      } finally {
        setLoading(false)
      }
    })
  }, [student?._id])

  /* ── Derived ───────────────────────────────────────────────── */
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = student?.name?.split(' ')[0] || 'Student'

  const handleLogout = () => {
    logout()
    navigate('/student/signin')
  }

  const handleRetake = async () => {
    if (!window.confirm("Are you sure you want to retake the assessment? Your previous results will be reset.")) return;
    setRetaking(true);
    try {
      await onboardingService.retakeAssessment(student?._id || student?.id);
      // Update student context
      const updatedStudent = { ...student, onboardingCompleted: false, recommendationGenerated: false };
      const token = localStorage.getItem('studentToken');
      logout(); // We need to re-login or just update context. logout is safer or just reload.
      window.location.href = '/student/onboarding';
    } catch (err) {
      console.error("Retake failed", err);
    } finally {
      setRetaking(false);
    }
  }

  const handleUnsave = async (contentId) => {
    try {
      await userActionService.unsaveItem(contentId)
      setSavedGuidance(prev => prev.filter(item => {
        const id = item.contentId?._id || item.contentId
        return id !== contentId
      }))
    } catch (err) {
      console.error('Failed to remove saved item', err)
    }
  }

  /* ── Stat card data ────────────────────────────────────────── */
  const STAT_CARDS = [
    { icon: '📚', label: 'Courses Available', value: stats.courses },
    { icon: '📝', label: 'Entrance Exams', value: stats.exams },
    { icon: '🎓', label: 'Scholarships', value: stats.scholarships },
    { icon: '🏫', label: 'Colleges', value: stats.colleges },
  ]

  return (
    <div className={s.layout}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      {sidebarOpen && <div className={s.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${s.sidebar} ${sidebarOpen ? s.sidebarOpen : ''}`}>
        <div className={s.sidebarLabel}>Menu</div>

        {SIDEBAR_NAV.filter(item => {
          const isJunior = ['5', '8', '5th', '8th'].includes(String(student?.classLevel));
          if (isJunior && ['courses', 'colleges'].includes(item.id)) return false;
          return true;
        }).map(({ id, icon: Icon, label, to }) => {
          const isActive = location.pathname === to || (to !== '/student/dashboard' && location.pathname.startsWith(to))
          return (
            <Link
              key={id}
              to={to}
              className={`${s.navItem} ${isActive ? s.navItemActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              {label}
              {id === 'notifications' && unreadCount > 0 && (
                <span className={s.navBadge}>{unreadCount}</span>
              )}
            </Link>
          )
        })}

        <div className={s.sidebarDivider} />

        <button
          className={`${s.navItem} ${s.navItemDanger}`}
          onClick={handleLogout}
        >
          <FiLogOut size={16} />
          Logout
        </button>

        {/* Profile card at bottom */}
        <div className={s.sidebarBottom}>
          <div className={s.profileCard}>
            <div className={s.profileAvatar}>
              {student?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className={s.profileName}>{firstName}</div>
              <div className={s.profileSub}>
                {student?.classLevel ? `Class ${student.classLevel}` : 'Student'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        className={s.mobileToggle}
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className={s.main}>

        {/* Welcome Banner */}
        <div className={`${s.welcomeBanner} s-anim-up`}>
          <div className={s.welcomeGreet}>{greet} 👋</div>
          <div className={s.welcomeName}>Welcome back, {firstName}!</div>
          <div className={s.welcomeDesc}>
            Explore your future career paths, find the right colleges, and never miss an exam deadline.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <SBtn variant="primary" onClick={() => setIsMentorModalOpen(true)}>
              🤝 Talk to Mentor
            </SBtn>
            {String(student?.classLevel).includes('12') && (
              <SBtn variant="white" onClick={() => navigate('/student/colleges')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                🏫 Explore Colleges
              </SBtn>
            )}
          </div>
          <div className={s.welcomeBadges}>
            {student?.classLevel && <span className={s.welcomeTag}>🎓 Class {student.classLevel}</span>}
            {student?.district && <span className={s.welcomeTag}>📍 {student.district}</span>}
            {unreadCount > 0 && <span className={s.welcomeTag}>🔔 {unreadCount} new alert{unreadCount > 1 ? 's' : ''}</span>}
          </div>
        </div>

        {loading ? (
          <SLoader />
        ) : (
          <>
            {/* ── Statistics Cards ────────────────────────────────── */}
            <div className={`${s.statsGrid} s-anim-up s-d1`}>
              {STAT_CARDS.filter(stat => {
                const isVeryJunior = ['5', '8', '5th', '8th'].includes(String(student?.classLevel));
                if (isVeryJunior && (stat.label === 'Courses Available' || stat.label === 'Colleges')) return false;
                return true;
              }).map((stat, i) => (
                <div
                  key={stat.label}
                  className={s.statCard}
                  style={{ background: STAT_GRADIENTS[i % STAT_GRADIENTS.length] }}
                >
                  <div className={s.statIcon}>{stat.icon}</div>
                  <div className={s.statValue}>{stat.value}</div>
                  <div className={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* ── My Skill Recommendation (Class 5, 8, 10, 12) ─────────── */}
            {(['5', '5th', 'Class 5', '8', '8th', 'Class 8', '10', '10th', 'Class 10', '12', '12th', 'Class 12'].includes(String(student?.classLevel))) && recommendation && (
              <div className="s-anim-up s-d2" style={{ marginBottom: 32 }}>
                <SSectionHeader
                  title="🎯 My Personalized Recommendation"
                  subtitle="Detailed analysis based on your assessment and interests"
                  action={() => navigate('/student/onboarding/result')}
                  actionLabel="View Full Result"
                />
                <SCard style={{ padding: 0, borderRadius: 24, overflow: 'hidden', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '32px 40px', color: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase' }}>Overall Score</div>
                        <div style={{ fontSize: 48, fontWeight: 900 }}>{recommendation.scorePercentage}%</div>
                        <div style={{ marginTop: 8 }}><SBadge color="white" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{recommendation.performanceLevel}</SBadge></div>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <SBtn variant="white" onClick={() => navigate('/student/onboarding/result')} style={{ borderRadius: 14, fontWeight: 700 }}>
                          View Full Details <FiArrowRight style={{ marginLeft: 8 }} />
                        </SBtn>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: 32, background: '#fff' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }} className="s-grid-1col">
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                          <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 6, textTransform: 'uppercase' }}>Strong Areas</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{recommendation.strongSkills?.slice(0, 3).join(', ') || 'N/A'}</div>
                          </div>
                          <div style={{ padding: 16, background: '#fef2f2', borderRadius: 16, border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#991b1b', marginBottom: 6, textTransform: 'uppercase' }}>Skills to Improve</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#b91c1c' }}>{recommendation.weakSkills?.slice(0, 3).join(', ') || 'None'}</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 8, textTransform: 'uppercase' }}>Recommended Paths</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {recommendation.recommendedStreams?.map(s => (
                              <span key={s} style={{ padding: '6px 14px', background: '#f0f9ff', color: '#0369a1', borderRadius: 10, fontSize: 14, fontWeight: 700, border: '1px solid #bae6fd' }}>{s}</span>
                            ))}
                            {recommendation.recommendedCourses?.map(c => (
                              <span key={c} style={{ padding: '6px 14px', background: '#f5f3ff', color: '#6d28d9', borderRadius: 10, fontSize: 14, fontWeight: 700, border: '1px solid #ddd6fe' }}>{c}</span>
                            ))}
                            {recommendation.recommendedExams?.map(e => (
                              <span key={e} style={{ padding: '6px 14px', background: '#fff7ed', color: '#c2410c', borderRadius: 10, fontSize: 14, fontWeight: 700, border: '1px solid #ffedd5' }}>{e}</span>
                            ))}
                          </div>
                        </div>

                        {recommendation.recommendedColleges?.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 8, textTransform: 'uppercase' }}>Recommended Colleges</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {recommendation.recommendedColleges.map(c => (
                                <span key={c} style={{ padding: '6px 14px', background: '#f0fdf4', color: '#166534', borderRadius: 10, fontSize: 14, fontWeight: 700, border: '1px solid #bbf7d0' }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {recommendation.recommendedCutoffDetails && (
                          <div style={{ marginBottom: 20, padding: 16, background: '#fefce8', borderRadius: 16, border: '1px solid #fef08a' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#854d0e', marginBottom: 6, textTransform: 'uppercase' }}>Cutoff Guidance</div>
                            <p style={{ fontSize: 14, color: '#713f12', margin: 0, fontWeight: 600 }}>{recommendation.recommendedCutoffDetails}</p>
                          </div>
                        )}

                        {recommendation.improvementMessage && (
                          <p style={{ fontSize: 14, color: '#b91c1c', fontWeight: 600, background: '#fff1f2', padding: '10px 16px', borderRadius: 12, margin: 0 }}>
                            Note: {recommendation.improvementMessage}
                          </p>
                        )}
                      </div>

                      <div style={{ padding: 24, background: '#f8fafc', borderRadius: 20, border: '1px solid var(--s-border)', height: 'fit-content' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', marginBottom: 16 }}>Need Guidance?</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <SBtn variant="primary" size="sm" onClick={() => navigate('/student/guidance')} style={{ width: '100%', justifyContent: 'center' }}>Talk to Mentor</SBtn>
                          <button onClick={handleRetake} disabled={retaking} style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 8 }}>
                            {retaking ? 'Resetting...' : 'Retake Assessment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SCard>
              </div>
            )}

            {isClass5 && commProgress && (
              <div className="s-anim-up s-d2" style={{ marginBottom: 32 }}>
                <SSectionHeader
                  title="🚀 My Skill Journey"
                  subtitle="Track your real-time communication skills and achievements"
                  action={() => navigate('/student/class5/skills/communicationskills')}
                  actionLabel="Go to Interactive Lab"
                />
                <SCard style={{ padding: 32, borderRadius: 24, background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }} className="s-grid-1col">
                    <div>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
                        <div style={{ padding: '16px 20px', background: '#eff6ff', borderRadius: 18, border: '1px solid #bfdbfe', flex: 1, minWidth: 140 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Communication Level</span>
                          <strong style={{ fontSize: 20, color: '#1e3a8a' }}>Level {commProgress.progress?.level || 1}</strong>
                        </div>
                        <div style={{ padding: '16px 20px', background: '#f0fdf4', borderRadius: 18, border: '1px solid #bbf7d0', flex: 1, minWidth: 140 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Total XP Earned</span>
                          <strong style={{ fontSize: 20, color: '#14532d' }}>{commProgress.progress?.xp || 0} XP</strong>
                        </div>
                        <div style={{ padding: '16px 20px', background: '#fff7ed', borderRadius: 18, border: '1px solid #ffedd5', flex: 1, minWidth: 140 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Current Streak</span>
                          <strong style={{ fontSize: 20, color: '#7c2d12' }}>{commProgress.progress?.streak || 0} Days 🔥</strong>
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 12 }}>Unlocked Badges</span>
                        {commProgress.badges?.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#94a3b8' }}>No badges unlocked yet. Start the journey!</div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {commProgress.badges?.map(b => (
                              <span key={b} style={{ padding: '6px 12px', background: '#f5f3ff', color: '#6d28d9', borderRadius: 10, fontSize: 12, fontWeight: 800, border: '1px solid #ddd6fe' }}>
                                🌟 {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Ready to improve your skills?</h4>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                        Jump back into the Communication Lab to complete games, record speaking tasks, and build your passport.
                      </p>
                      <SBtn variant="primary" onClick={() => navigate('/student/class5/skills/communicationskills')} style={{ justifyContent: 'center' }}>
                        Open Communication Lab
                      </SBtn>
                    </div>
                  </div>
                </SCard>
              </div>
            )}

            {/* ── Recommended Resources ─────────────────────────────── */}
            <div className="s-anim-up s-d2" style={{ marginBottom: 28 }}>
              <SSectionHeader
                title={ (['5', '5th', 'Class 5', '8', '8th', 'Class 8', '10', '10th', 'Class 10', '12', '12th', 'Class 12'].includes(String(student?.classLevel))) ? `🚀 Recommended for Class ${student?.classLevel?.replace(/\D/g, '')}` : "🧩 Recommended Careers" }
                subtitle={ (['5', '5th', 'Class 5', '8', '8th', 'Class 8', '10', '10th', 'Class 10', '12', '12th', 'Class 12'].includes(String(student?.classLevel))) ? "Based on your assessment results." : "Explore popular career paths tailored for your future." }
                action={() => navigate((['5', '5th', 'Class 5', '8', '8th', 'Class 8', '10', '10th', 'Class 10', '12', '12th', 'Class 12'].includes(String(student?.classLevel))) ? `/student/career-path/class-${student?.classLevel?.replace(/\D/g, '')}` : '/student/careers')}
                actionLabel="View All"
              />
              <div className={s.careerGrid}>
                {recommendedCareerCards.map((c, idx) => (
                  <Link key={c.title + idx} to={c.link || "/student/careers"} className={s.careerCard}>
                    <div className={s.careerIcon} style={{ background: c.bg }}>
                      {c.icon}
                    </div>
                    <div className={s.careerTitle}>{c.title}</div>
                    <div className={s.careerSub}>{c.sub}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Saved Resources ─────────────────────────────── */}
            <div id="saved" className="s-anim-up s-d2" style={{ marginBottom: 28 }}>
              <SSectionHeader
                title="🔖 Saved Resources"
                subtitle="Your bookmarked careers, exams, and scholarships"
              />
              {savedGuidance.length === 0 ? (
                <SEmpty icon="🔖" title="No saved resources yet" desc="Bookmark items to keep track of your career journey." />
              ) : (
                <div className={s.savedGrid}>
                  {savedGuidance.map((item, i) => {
                    const c = item.contentId
                    const type = item.contentType
                    if (!c) return null
                    
                    // Dynamic configuration based on item type
                    const typeConfig = {
                      ClassContent: { badge: `Class ${c.targetClass || ''}`, color: 'blue',   link: `/student/career-path/class-${c.targetClass}/${c.slug}` },
                      Exam:         { badge: 'Entrance Exam',               color: 'orange', link: '/student/careers' },
                      Scholarship:  { badge: 'Scholarship',                 color: 'green',  link: `/student/scholarships/${c._id}` },
                      College:      { badge: 'College',                     color: 'purple', link: `/student/colleges/${c._id}` },
                      Course:       { badge: 'Course',                      color: 'indigo', link: `/student/course/${c.slug}` },
                      CareerPath:   { badge: 'Career Path',                 color: 'gold',   link: `/student/careers/path/${c._id}` }
                    }
                    const config = typeConfig[type] || { badge: type, color: 'gray', link: '#' }

                    return (
                      <div key={item._id || i} className={s.savedCard}>
                        <div className={s.savedCardImg}>
                          <img 
                            src={c.coverImage || c.image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400'} 
                            alt="thumbnail" 
                          />
                          <div className={s.savedCardOverlay}>
                             <SBadge color={config.color}>{config.badge}</SBadge>
                          </div>
                        </div>
                        <div className={s.savedCardBody}>
                          <h4 className={s.savedCardTitle}>{c.title || c.name || c.courseName || c.collegeName || c.scholarshipName || 'Untitled Item'}</h4>
                          <div className={s.savedCardActions}>
                            <SBtn variant="primary" size="sm" style={{ flex: 1, borderRadius: '8px' }} onClick={() => navigate(config.link)}>
                              View 
                            </SBtn>
                            <SBtn variant="outline" size="sm" style={{ flex: 1, borderRadius: '8px', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleUnsave(c._id)}>
                              Remove
                            </SBtn>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── My Guidance Requests ─────────────────────────────── */}
            <div className="s-anim-up s-d2" style={{ marginBottom: 28 }}>
              <SSectionHeader
                title="🗣️ My Guidance Requests"
                subtitle="Track your interactions with our mentors"
                action={() => setIsMentorModalOpen(true)}
                actionLabel="Request New Guidance"
              />
              {mentorRequests.length === 0 ? (
                <SEmpty icon="🗣️" title="No requests yet" desc="Need help? Talk to our mentors today." />
              ) : (
                <div className={s.mentorGrid}>
                  {mentorRequests.map((req) => (
                    <div key={req._id} className={s.mentorCard}>
                      <div className={s.mentorCardHeader}>
                        <div className={s.mentorTopic}>{req.interest}</div>
                        <SBadge color={
                          req.status === 'Completed' ? 'green' : 
                          req.status === 'In Progress' ? 'blue' : 
                          req.status === 'Rejected' ? 'red' : 'orange'
                        }>
                          {req.status}
                        </SBadge>
                      </div>
                      <div className={s.mentorMessage}>"{req.message}"</div>
                      <div className={s.mentorFooter}>
                        <div className={s.mentorDate}>{formatDate(req.createdAt)}</div>
                        {req.adminNotes && (
                          <div className={s.mentorNote}>
                             <strong>Admin Note:</strong> {req.adminNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 2-Column: Upcoming Exams + Latest Scholarships ── */}
            <div className={`${s.sectionGrid} s-anim-up s-d3`}>

              {/* Upcoming Exams */}
              <div>
                <SSectionHeader
                  title="📝 Upcoming Exams"
                  subtitle="Important entrance exams and their deadlines."
                />
                {exams.length === 0 ? (
                  <SEmpty icon="📝" title="No exams listed yet" />
                ) : (
                  <div className={s.examList}>
                    {exams.map((exam, i) => {
                      const colors = ['#eaf0fb', '#fce4ec', '#fdf4e0', '#f3effe']
                      const textColors = ['#1d5fba', '#c62828', '#c48a1a', '#7c3aed']
                      return (
                        <div key={exam._id || i} className={s.examCard}>
                          <div
                            className={s.examIcon}
                            style={{ background: colors[i % 4], color: textColors[i % 4] }}
                          >
                            📝
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className={s.examTitle}>{exam.name || exam.title || 'Exam'}</div>
                            <div className={s.examMeta}>
                              <FiClock size={11} />
                              {exam.date ? formatDate(exam.date) : exam.lastDate ? formatDate(exam.lastDate) : 'Date TBA'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Latest Scholarships */}
              <div>
                <SSectionHeader
                  title="🎓 Latest Scholarships"
                  subtitle="Don't miss these deadlines"
                />
                {scholarships.length === 0 ? (
                  <SEmpty icon="ðŸŽ“" title="No scholarships yet" />
                ) : (
                  <div className={s.scholarshipList}>
                    {scholarships.map((sch, i) => (
                      <div key={sch._id || i} className={s.scholarshipCard}>
                        <div className={s.scholarshipTitle}>
                          {sch.name || sch.title || 'Scholarship'}
                        </div>
                        <div className={s.scholarshipProvider}>
                          {sch.provider || sch.organization || sch.fundedBy || 'Provider N/A'}
                        </div>
                        {(sch.deadline || sch.lastDate) && (
                          <span className={s.scholarshipDeadline}>
                            <FiClock size={11} />
                            {formatDate(sch.deadline || sch.lastDate)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* â”€â”€ Notifications Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="s-anim-up s-d4" style={{ marginBottom: 28 }}>
              <SSectionHeader
                title="🔔 Notifications"
                subtitle="Latest 3 updates from admin"
                action={() => navigate('/student/notifications')}
                actionLabel="View All"
              />
              {notifications.length === 0 ? (
                <SEmpty icon="ðŸ””" title="No notifications yet" desc="Admin updates will appear here" />
              ) : (
                <div className={s.notifList}>
                  {notifications.map((n, i) => (
                    <div
                      key={n._id || i}
                      className={`${s.notifCard} ${!n.isRead ? s.notifUnread : ''}`}
                    >
                      <div className={s.notifTitle}>
                        {n.title}
                        {!n.isRead && <span className={s.notifDot} />}
                      </div>
                      <div className={s.notifMsg}>
                        {n.message?.substring(0, 120)}{n.message?.length > 120 ? 'â€¦' : ''}
                      </div>
                      <div className={s.notifTime}>{timeAgo(n.createdAt)}</div>
                    </div>
                  ))}
                  <Link to="/student/notifications" style={{ textDecoration: 'none' }}>
                    <SBtn variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                      View All Notifications <FiArrowRight size={13} />
                    </SBtn>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <MentorRequestModal 
        isOpen={isMentorModalOpen} 
        onClose={() => setIsMentorModalOpen(false)} 
      />
    </div>
  )
}
