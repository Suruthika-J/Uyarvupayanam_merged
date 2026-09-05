import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../../config/axios'
import { useStudentAuth } from './StudentAuthContext'

const CollegeProfileContext = createContext(null)

export function useCollegeProfile() {
  const ctx = useContext(CollegeProfileContext)
  if (!ctx) {
    // Return safe defaults when used outside provider (e.g. in school routes)
    return { profile: null, loading: false, refetch: () => {}, patchProfile: () => {} }
  }
  return ctx
}

export function CollegeProfileProvider({ children }) {
  const { student, token } = useStudentAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      setLoading(true)
      const res = await axiosInstance.get('/college-profile/my-profile')
      if (res.data?.success) {
        setProfile(res.data.profile)
      }
    } catch (err) {
      console.warn('CollegeProfileContext: Failed to fetch profile', err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch on mount and when token changes
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Partial update — call PUT /api/college-profile/patch with field subset
  const patchProfile = useCallback(async (fields) => {
    if (!token) return
    try {
      const res = await axios.put(
        `${API_BASE}/api/college-profile/patch`,
        fields,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success) {
        setProfile(res.data.profile)
      }
      return res.data
    } catch (err) {
      console.error('CollegeProfileContext: patch failed', err.message)
      return { success: false }
    }
  }, [token, API_BASE])

  return (
    <CollegeProfileContext.Provider value={{ profile, loading, refetch: fetchProfile, patchProfile }}>
      {children}
    </CollegeProfileContext.Provider>
  )
}
