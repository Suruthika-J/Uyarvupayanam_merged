import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './admin/context/AuthContext'
import { NotificationProvider } from './admin/context/NotificationContext'
import LoginPage from './admin/pages/LoginPage'
import AdminLayout from './admin/pages/AdminLayout'

// ── Student Frontend ─────────────────────────────────────────────────────────
import StudentRoutes from './student/StudentRoutes'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  // Wait for the token restore effect to finish before deciding auth state,
  // otherwise a hard refresh of a deep admin link bounces to /admin.
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: '#64748b', fontWeight: 700 }}>
        Loading…
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      {/* ── Admin Auth ── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />}
      />
      <Route
        path="/admin/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />}
      />

      {/* ── Admin Panel ── */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <NotificationProvider>
              <AdminLayout />
            </NotificationProvider>
          </ProtectedRoute>
        }
      />

      {/* ── Common Public Platform & Student Routes ── */}
      <Route path="/*" element={<StudentRoutes />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
