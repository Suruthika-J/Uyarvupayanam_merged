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
  const isCollegeStudent = student?.userType === 'college_student'
  const isGraduate = student?.userType === 'graduate'

  // 1. Onboarding Redirection Safeguard
  if (isCollegeStudent && student?.onboardingCompleted === false && path !== '/student/onboarding/college') {
    return <Navigate to="/student/onboarding/college" replace />
  }

  if (isGraduate && student?.onboardingCompleted === false && path !== '/student/onboarding/graduate') {
    return <Navigate to="/student/onboarding/graduate" replace />
  }

  if (isSchoolStudent && student?.onboardingCompleted === false && path !== '/student/onboarding') {
    return <Navigate to="/student/onboarding" replace />
  }

  // 2. Cross-Access Protection
  // Graduate routes blocked for non-graduates
  if (!isGraduate && path.startsWith('/graduate')) {
    return <Navigate to={isCollegeStudent ? "/college/dashboard" : "/student/dashboard"} replace />
  }

  // College-only routes blocked for school students and graduates
  const collegeOnlyPaths = ['/student/academic/planner', '/student/academic/roadmap', '/student/career/skill-gap', '/student/career/compare', '/student/career/resume', '/student/career/interview-prep', '/student/study-tools/notes-summarizer']
  if (isSchoolStudent && collegeOnlyPaths.some(p => path.startsWith(p))) {
    return <Navigate to="/student/dashboard" replace />
  }
  if (isGraduate && (path.startsWith('/college') || collegeOnlyPaths.some(p => path.startsWith(p)))) {
    return <Navigate to="/graduate/dashboard" replace />
  }

  // School-only routes blocked for college students and graduates
  const schoolOnlyPaths = ['/student/class5', '/student/class8', '/student/class10', '/student/class12']
  if (isCollegeStudent && schoolOnlyPaths.some(p => path.startsWith(p))) {
    return <Navigate to="/college/dashboard" replace />
  }
  if (isGraduate && schoolOnlyPaths.some(p => path.startsWith(p))) {
    return <Navigate to="/graduate/dashboard" replace />
  }

  return children
}
