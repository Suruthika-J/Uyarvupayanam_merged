import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import {
  FiGrid, FiUser, FiCompass, FiZap, FiBriefcase,
  FiFileText, FiAward, FiTarget, FiBarChart2,
  FiBook, FiMessageSquare, FiLogOut, FiMenu, FiX, FiCheckSquare, FiTrendingUp
} from 'react-icons/fi'

const GRADUATE_SIDEBAR_NAV = [
  { id: 'dashboard',      icon: FiGrid,          label: 'Dashboard',          to: '/graduate/dashboard' },
  { id: 'careers',        icon: FiBriefcase,     label: 'My Career',          to: '/graduate/careers' },
  { id: 'skill-gap',      icon: FiZap,           label: 'Skills & Gap',       to: '/graduate/skill-gap' },
  { id: 'roadmap',        icon: FiTarget,        label: 'Career Roadmap',     to: '/graduate/roadmap' },
  { id: 'exams',          icon: FiBook,          label: 'Competitive Exams',  to: '/graduate/exams' },
  { id: 'higher-studies', icon: FiAward,         label: 'Higher Studies',     to: '/graduate/higher-studies' },
  { id: 'upskilling',     icon: FiTrendingUp,    label: 'Upskilling Hub',     to: '/graduate/upskilling' },
  { id: 'placement',      icon: FiCheckSquare,   label: 'Placement Hub',      to: '/graduate/placement' },
  { id: 'resume',         icon: FiFileText,      label: 'Resume Builder',     to: '/graduate/resume' },
  { id: 'interview',      icon: FiBarChart2,     label: 'Interview Prep',     to: '/graduate/interview' },
  { id: 'advisor',        icon: FiMessageSquare, label: 'AI Advisor',         to: '/graduate/ai-advisor' },
  { id: 'profile',        icon: FiUser,          label: 'My Profile',         to: '/graduate/profile' },
]

export default function GraduateLayout() {
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/student/signin')
  }

  return (
    <div className="student-root" style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 89 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── CONSTANT GRADUATE SIDEBAR ── */}
      <aside style={{
        width: 260, background: '#0f172a', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        zIndex: 90, borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.25s ease'
      }}>

        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/graduate/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 18, flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
            }}>
              G
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', fontFamily: 'var(--s-font-display)', lineHeight: 1.2 }}>
                Uyarvu Payanam
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Graduate Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          {GRADUATE_SIDEBAR_NAV.map(({ id, icon: Icon, label, to }) => {
            const isActive = location.pathname === to || (to !== '/graduate/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={id}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                  fontSize: 13.5, fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? '#2563eb' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
            {student?.name?.[0] || 'G'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {student?.name || 'Graduate'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
              Graduate Professional
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6 }}
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <FiMenu size={22} />
          </button>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎓 Graduate Transition Hub
          </div>
          <div style={{ width: 22 }} />
        </header>

        <main style={{ flex: 1, padding: '24px 28px', maxWidth: 1240, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
