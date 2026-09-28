import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'

// Science Advent gains a live session. The Science Adventure map stays
// browseable logged out, but every playable world and the Daily Science
// Challenge requires the student's account. Logged-out students are sent to
// the shared Sign In screen with the world they tapped as `from`, so after
// login they continue exactly where they left off.
export default function RequireScienceLogin({ children }) {
  const { isAuthenticated, loading } = useStudentAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="student-root" style={{
        minHeight: '40vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--s-border)',
          borderTop: '3px solid var(--s-primary)',
          animation: 's-spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/student/signin" state={{ from: location }} replace />
  }

  return children
}