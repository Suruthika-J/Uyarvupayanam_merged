import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
      setAdmin(adminData)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await adminService.login(email, password)
      localStorage.setItem('adminToken', data.token)
      const adminData = { email, name: 'Super Admin', role: 'System Administrator' }
      localStorage.setItem('adminData', JSON.stringify(adminData))
      setAdmin(adminData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    setAdmin(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
