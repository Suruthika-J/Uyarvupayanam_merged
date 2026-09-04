import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import { CollegeProfileProvider } from '../context/CollegeProfileContext'
import {
  FiGrid, FiUser, FiCompass, FiZap, FiBriefcase,
  FiFileText, FiAward, FiBookmark, FiTarget, FiBarChart2,
  FiBook, FiMessageSquare, FiLogOut, FiMenu, FiX, FiBell
} from 'react-icons/fi'

const COLLEGE_SIDEBAR_NAV = [
  { id: 'dashboard',     icon: FiGrid,         label: 'Dashboard',           to: '/college/dashboard' },
  { id: 'profile',       icon: FiUser,         label: 'My Academic Profile', to: '/college/profile' },
  { id: 'advisor',       icon: FiCompass,      label: 'Academic Advisor',    to: '/college/advisor' },
  { id: 'skill-gap',     icon: FiZap,          label: 'Skill Gap Analysis',  to: '/college/career/skill-gap' },
  { id: 'resume',        icon: FiFileText,     label: 'Resume Builder',      to: '/college/career/resume' },
  { id: 'interview',     icon: FiBriefcase,    label: 'Interview Prep',      to: '/college/career/interview-prep' },
  { id: 'planner',       icon: FiBook,         label: 'Study Planner',       to: '/college/academic/planner' },
  { id: 'roadmap',       icon: FiTarget,       label: 'Learning Roadmap',    to: '/college/academic/roadmap' },
  { id: 'performance',   icon: FiBarChart2,    label: 'Performance',         to: '/college/academic/performance' },
  { id: 'chat',          icon: FiMessageSquare,label: 'Ask AI',               to: '/college/advisor/chat' },
  { id: 'scholarships',  icon: FiAward,        label: 'Scholarships',        to: '/college/scholarships' },
  { id: 'bookmarks',     icon: FiBookmark,     label: 'Saved Items',         to: '/college/bookmarks' },
]

export default function CollegeStudentLayout() {
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/student/signin')
  }

  return (
    <div className="student-root" style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9' }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 89 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── CONSTANT COLLEGE SIDEBAR ── */}
      <aside style={{
        width: 256, background: '#0b1329', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        zIndex: 90, borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.25s ease',
      }}>

        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/college/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#047857', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
              U
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', fontFamily: 'var(--s-font-display)', lineHeight: 1.2 }}>Uyarvu Payanam</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>College Portal</div>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          {COLLEGE_SIDEBAR_NAV.map(({ id, icon: Icon, label, to }) => {
            const isActive = location.pathname === to || (to !== '/college/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={id}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                  fontSize: 13.5, fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? '#0284c7' : 'transparent',
                  transition: 'all 0.15s ease',
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
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
            {student?.name?.[0] || 'S'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {student?.name}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>College Student</div>
          </div>
          <button
            type="button" onClick={handleLogout} title="Logout"
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          >
            <FiLogOut size={17} />
          </button>
        </div>
      </aside>

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          height: 64, background: '#fff', borderBottom: '1px solid var(--s-border)',
          padding: '0 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 80,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button" onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'none', border: 'none', color: 'var(--s-text)', cursor: 'pointer', display: 'none' }}
              className="mobile-toggle-btn"
            >
              <FiMenu size={22} />
            </button>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text2)' }}>
              🎓 AI Academic Guidance Platform
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/college/advisor/chat"
              style={{
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                background: '#0284c7', color: '#fff', padding: '7px 16px',
                borderRadius: 20, fontSize: 13, fontWeight: 700
              }}
            >
              <FiCompass size={14} /> Ask AI Advisor
            </Link>
            <Link
              to="/college/notifications"
              style={{
                textDecoration: 'none', width: 36, height: 36, borderRadius: 10,
                background: '#f8fafc', border: '1px solid var(--s-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--s-text2)'
              }}
            >
              <FiBell size={16} />
            </Link>
          </div>
        </header>

        {/* Main Content via Outlet */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <CollegeProfileProvider>
            <Outlet />
          </CollegeProfileProvider>
        </main>
      </div>
    </div>
  )
}
