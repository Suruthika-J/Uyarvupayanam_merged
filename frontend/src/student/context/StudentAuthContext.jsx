import React, { createContext, useContext, useState, useEffect } from 'react'

const StudentAuthCtx = createContext(null)

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('studentToken')
    const saved = localStorage.getItem('studentData')
    if (token && saved) {
      try {
        setStudent(JSON.parse(saved))
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('studentToken')
        localStorage.removeItem('studentData')
      }
    }
    setLoading(false)
  }, [])

  const login = (token, data) => {
    localStorage.setItem('studentToken', token)
    localStorage.setItem('studentData', JSON.stringify(data))
    setStudent(data)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('studentToken')
    localStorage.removeItem('studentData')
    setStudent(null)
    setIsAuthenticated(false)
  }

  const updateStudent = (patch) => {
    const next = { ...student, ...patch }
    localStorage.setItem('studentData', JSON.stringify(next))
    setStudent(next)
  }

  return (
    <StudentAuthCtx.Provider value={{ student, isAuthenticated, loading, login, logout, updateStudent }}>
      {children}
    </StudentAuthCtx.Provider>
  )
}

export const useStudentAuth = () => useContext(StudentAuthCtx)
