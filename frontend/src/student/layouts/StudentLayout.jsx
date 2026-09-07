import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import StudentNavbar from '../components/common/StudentNavbar'
import StudentFooter from '../components/common/StudentFooter'
import StudentAppSidebar from './StudentAppSidebar'
import { useStudentAuth } from '../context/StudentAuthContext'

// Paths that belong to the authenticated student app (sidebar enabled).
// Public/marketing, auth, and onboarding pages stay navbar-only.
const APP_PREFIXES = [
  '/student/dashboard',
  '/student/bookmarks',
  '/student/notifications',
  '/student/profile',
  '/student/courses',
  '/student/colleges',
  '/student/scholarships',
  '/student/career',
  '/student/course',
  '/student/class',
]

export default function StudentLayout() {
  const { isAuthenticated, student } = useStudentAuth()
  const location = useLocation()

  const isSchoolUser =
    student?.userType !== 'college_student' && student?.userType !== 'graduate'
  const showSidebar =
    isAuthenticated &&
    isSchoolUser &&
    APP_PREFIXES.some((p) => location.pathname.startsWith(p))

  return (
    <div className="student-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StudentNavbar />
      {showSidebar ? (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, paddingTop: 64 }}>
          <StudentAppSidebar />
          <main style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </main>
        </div>
      ) : (
        <main style={{ flex: 1, paddingTop: 64 }}>
          <Outlet />
        </main>
      )}
      <StudentFooter />
    </div>
  )
}
