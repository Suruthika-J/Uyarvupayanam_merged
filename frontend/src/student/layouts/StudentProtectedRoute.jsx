import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'

export default function StudentProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useStudentAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="student-root" style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--s-border)',
          borderTop: '3px solid var(--s-primary)',
          animation: 's-spin 0.7s linear infinite',
        }} />
        <p style={{ fontFamily: 'var(--s-font-display)', fontSize: 14, color: 'var(--s-text3)' }}>
          Loading…
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/student/signin" state={{ from: location }} replace />
  }

  const { student } = useStudentAuth()
  const path = location.pathname

  const isSchoolStudent = student?.userType === 'school_student' || (student?.classLevel && ['5','8','10','12'].includes(String(student.classLevel).replace(/\D/g,'')))
  const isCollegeStudent = student?.userType === 'college_student' || String(student?.classLevel || '').toLowerCase().includes('college') || /(\.edu|\.ac)\.in$/i.test(student?.email || '') || /@nec\.edu\.in$/i.test(student?.email || '')
  const isGraduate = student?.userType === 'graduate' && !isCollegeStudent

  // 1. Cross-Portal Redirection & Isolation Protection
  if (isCollegeStudent && path.startsWith('/graduate')) {
    return <Navigate to="/college/dashboard" replace />
  }

  if (isGraduate && path.startsWith('/college')) {
    return <Navigate to="/graduate/dashboard" replace />
  }

  // 2. Onboarding Redirection Safeguard
  if (isCollegeStudent && student?.onboardingCompleted === false && path !== '/student/onboarding/college') {
    return <Navigate to="/college/dashboard" replace />
  }

  if (isGraduate && student?.onboardingCompleted === false && path !== '/student/onboarding/graduate' && path !== '/graduate/onboarding') {
    return <Navigate to="/graduate/onboarding" replace />
  }

  if (isSchoolStudent && student?.onboardingCompleted === false && path !== '/student/onboarding') {
    return <Navigate to="/student/onboarding" replace />
  }

  // 3. School vs College Route Isolation
  const collegeOnlyPaths = ['/student/academic/planner', '/student/academic/roadmap', '/student/career/skill-gap', '/student/career/compare', '/student/career/resume', '/student/career/interview-prep', '/student/study-tools/notes-summarizer']
  if (isSchoolStudent && collegeOnlyPaths.some(p => path.startsWith(p))) {
    return <Navigate to="/student/dashboard" replace />
  }

  const schoolOnlyPaths = ['/student/class5', '/student/class8', '/student/class10', '/student/class12']
  if (isCollegeStudent && schoolOnlyPaths.some(p => path.startsWith(p))) {
    return <Navigate to="/college/dashboard" replace />
  }

  return children
}
