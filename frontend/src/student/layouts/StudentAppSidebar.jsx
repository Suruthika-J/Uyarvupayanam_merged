import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import { notificationService } from '../services'
import {
  FiGrid, FiBookOpen, FiMapPin, FiFileText, FiAward,
  FiBell, FiUser, FiSettings, FiLogOut, FiMenu, FiX,
} from 'react-icons/fi'
import s from '../pages/dashboard/DashboardPage.module.css'

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

export default function StudentAppSidebar() {
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const firstName = student?.name?.split(' ')[0] || 'Student'

  useEffect(() => {
    if (!student?._id) return
    let cancelled = false
    notificationService.getUserNotifications(student._id)
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        setUnreadCount(list.filter((n) => !n.isRead).length)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [student?._id])

  const handleLogout = () => {
    logout()
    navigate('/student/signin')
  }

  return (
    <>
      {open && <div className={s.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ''}`}>
        <div className={s.sidebarLabel}>Menu</div>

        {SIDEBAR_NAV.filter((item) => {
          const isJunior = ['5', '8', '5th', '8th'].includes(String(student?.classLevel));
          if (isJunior && ['courses', 'colleges'].includes(item.id)) return false;
          return true;
        }).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to || (item.to !== '/student/dashboard' && location.pathname.startsWith(item.to))
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`${s.navItem} ${isActive ? s.navItemActive : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} />
              {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
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

      <button
        className={s.mobileToggle}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
    </>
  )
}