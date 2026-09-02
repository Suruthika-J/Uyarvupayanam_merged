import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { notificationService } from '../../services'
import { SNotifBadge } from '../ui'
import {
  FiBell, FiUser, FiMenu, FiX, FiLogOut,
  FiChevronDown, FiGrid,
} from 'react-icons/fi'

const PUBLIC_NAV_LINKS = [
  { to: '/',                 label: 'Home',         end: true  },
  { to: '/explore',           label: 'Explore',      end: false },
  { to: '/#how-it-works',     label: 'How It Works', end: false },
  { to: '/#features',         label: 'Features',     end: false },
  { to: '/#about',            label: 'About',        end: false },
]



export default function StudentNavbar() {
  const { isAuthenticated, student, logout } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropRef = useRef(null)

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !student?._id) return
    notificationService.getUserNotifications(student._id)
      .then(res => {
        const list = Array.isArray(res) ? res : (res.data || [])
        setUnreadCount(list.filter(n => !n.isRead).length)
      })
      .catch(() => { })
  }, [isAuthenticated, location.pathname, student?._id])

  const handleLogout = () => {
    logout()
    navigate('/student/signin')
  }

  const handleNavClick = (e, to) => {
    if (to.includes('#')) {
      const targetId = to.split('#')[1]
      if (location.pathname === '/') {
        e.preventDefault()
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <nav className={`s-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="s-navbar-inner" style={{ maxWidth: 1240 }}>

        {/* Logo */}
        <Link to="/student/home" className="s-nav-logo" style={{ textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Uyarvu Payanam"
            style={{ height: 42, width: 'auto', objectFit: 'contain', background: 'transparent' }}
          />
          <div className="s-nav-logo-text" style={{ marginLeft: 8 }}>
            <span className="s-nav-logo-title" style={{ fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--s-primary)' }}>Uyarvu Payanam</span>
            <span className="s-nav-logo-sub" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, opacity: 0.6 }}>Career Platform</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="s-nav-links">
          {PUBLIC_NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={(e) => handleNavClick(e, to)}
              className={({ isActive }) => `s-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <NavLink
                to="/student/dashboard"
                end
                className={({ isActive }) => `s-nav-link ${isActive ? 'active' : ''}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/student/notifications"
                end
                className={({ isActive }) => `s-nav-link ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                Alerts
                <SNotifBadge count={unreadCount} />
              </NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="s-nav-right">
          {isAuthenticated ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="s-profile-btn"
              >
                <div className="s-profile-avatar" style={{ background: 'var(--s-primary)' }}>
                  {student?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <span className="s-hide-sm" style={{ fontWeight: 700 }}>{student?.name?.split(' ')[0] || 'Student'}</span>
                <FiChevronDown size={13} style={{
                  transition: 'transform 0.2s',
                  transform: profileOpen ? 'rotate(180deg)' : 'none',
                }} />
              </button>

              {profileOpen && (
                <div className="s-profile-dropdown s-anim-down">
                  <Link to="/student/profile">
                    <FiUser size={15} /> My Profile
                  </Link>
                  <Link to="/student/dashboard">
                    <FiGrid size={15} /> Dashboard
                  </Link>
                  <div style={{ height: 1, background: 'var(--s-border)', margin: '4px 8px' }} />
                  <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="s-nav-desktop-auth" style={{ display: 'flex', gap: 16 }}>
              <Link to="/student/signin" className="s-nav-auth-btn login">Sign In</Link>
              <Link to="/student/signup" className="s-nav-auth-btn signup">Get Started</Link>
            </div>
          )}

          <button
            className="s-nav-toggle"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="s-nav-mobile s-anim-down">
          {PUBLIC_NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={(e) => { handleNavClick(e, to); setMobileOpen(false); }}
              className={({ isActive }) => `s-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <NavLink
                to="/student/dashboard"
                end
                className={({ isActive }) => `s-nav-link ${isActive ? 'active' : ''}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/student/notifications"
                end
                className={({ isActive }) => `s-nav-link ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                Alerts
                <SNotifBadge count={unreadCount} />
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{
              marginTop: 14, display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#dc2626', fontFamily: 'var(--s-font-display)',
              fontWeight: 700, fontSize: 15, padding: '12px 0',
            }}>
              <FiLogOut size={16} /> Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link to="/student/signin" className="s-nav-auth-btn login" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
              <Link to="/student/signup" className="s-nav-auth-btn signup" style={{ flex: 1, justifyContent: 'center' }}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
