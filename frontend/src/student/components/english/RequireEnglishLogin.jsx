import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'

// English Adventure play-gate: the hub and topic/skill maps stay browseable
// logged out, but every playable activity (writing, speaking, grammar rounds,
// vocabulary games, sentence building, listen & speak, daily + weekly missions
// and progress) requires a live student session. Guests are sent to the shared
// Sign In screen with the page they tapped saved as `from`, so after login
// they continue exactly where they started.
export default function RequireEnglishLogin({ children }) {
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