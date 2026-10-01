import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../../config/axios'
import { useStudentAuth } from './StudentAuthContext'

const CollegeProfileContext = createContext(null)

export function useCollegeProfile() {
  const ctx = useContext(CollegeProfileContext)
  if (!ctx) {
    return {
      profile: null,
      studentContext: null,
      targetCareer: '',
      loading: false,
      refetch: () => {},
      patchProfile: () => {},
      setTargetCareer: () => {}
    }
  }
  return ctx
}

// Alias for central student context
export const useStudentContext = useCollegeProfile

export function CollegeProfileProvider({ children }) {
  const { student, token } = useStudentAuth()
  const [profile, setProfile] = useState(null)
  const [studentContext, setStudentContext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContext = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get('/college-profile/my-context')
      if (res.data?.success) {
        setStudentContext(res.data.studentContext || null)
        setProfile(res.data.profile || null)
      }
    } catch (err) {
      console.warn('CollegeProfileContext: Failed to fetch student context', err.message)
      // Fallback to legacy my-profile if my-context encounters issue
      try {
        const fallbackRes = await axiosInstance.get('/college-profile/my-profile')
        if (fallbackRes.data?.success) {
          setProfile(fallbackRes.data.profile)
        }
      } catch (fErr) {
        setError(fErr.message)
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch on mount and when token changes
  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  // Partial update — call PUT /api/college-profile/patch with field subset
  const patchProfile = useCallback(async (fields) => {
    if (!token) return { success: false }
    try {
      const res = await axiosInstance.put('/college-profile/patch', fields)
      if (res.data?.success) {
        await fetchContext()
      }
      return res.data
    } catch (err) {
      console.error('CollegeProfileContext: patch failed', err.message)
      return { success: false }
    }
  }, [token, fetchContext])

  // Change target career across all connected modules
  const setTargetCareer = useCallback(async (newRole) => {
    if (!token || !newRole) return { success: false }
    try {
      const res = await axiosInstance.post('/college-advisor/target-career', { targetCareer: newRole })
      if (res.data?.success) {
        await fetchContext()
      }
      return res.data
    } catch (err) {
      console.error('CollegeProfileContext: setTargetCareer failed', err.message)
      return { success: false }
    }
  }, [token, fetchContext])

  const targetCareer = studentContext?.targetCareer || profile?.targetCareer || ''
  const profileCompleteness = studentContext?.profileCompleteness || {
    score: profile?.profileCompletion || 0,
    isComplete: profile?.isCompleted || false,
    checks: {}
  }

  return (
    <CollegeProfileContext.Provider value={{
      studentContext,
      profile,
      targetCareer,
      profileCompleteness,
      loading,
      error,
      refetch: fetchContext,
      patchProfile,
      setTargetCareer
    }}>
      {children}
    </CollegeProfileContext.Provider>
  )
}

