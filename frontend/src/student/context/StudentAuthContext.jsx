import React, { createContext, useContext, useState, useEffect } from 'react'

const StudentAuthCtx = createContext(null)

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('studentToken')
    const saved = localStorage.getItem('studentData')
    if (savedToken && saved) {
      try {
        setStudent(JSON.parse(saved))
        setToken(savedToken)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('studentToken')
        localStorage.removeItem('studentData')
      }
    }
    setLoading(false)
  }, [])

  const login = (tok, data) => {
    localStorage.setItem('studentToken', tok)
    localStorage.setItem('studentData', JSON.stringify(data))
    setStudent(data)
    setToken(tok)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('studentToken')
    localStorage.removeItem('studentData')
    setStudent(null)
    setToken(null)
    setIsAuthenticated(false)
  }

  const updateStudent = (patch) => {
    const next = { ...student, ...patch }
    localStorage.setItem('studentData', JSON.stringify(next))
    setStudent(next)
  }

  return (
    <StudentAuthCtx.Provider value={{ student, token, isAuthenticated, loading, login, logout, updateStudent }}>
      {children}
    </StudentAuthCtx.Provider>
  )
}

export const useStudentAuth = () => useContext(StudentAuthCtx)
