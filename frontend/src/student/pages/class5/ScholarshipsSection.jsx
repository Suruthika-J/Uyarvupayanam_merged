import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SLoader, SEmpty, SAlert } from '../../components/ui'
import AuthModal from '../../components/ui/AuthModal'
import SectionHeader from '../../components/class5/redesign/SectionHeader'
import ScholarshipCard from '../../components/scholarships/ScholarshipCard'

// Scholarships tab for Class 5. Content and behaviour mirror the original
// ClassLevelPage Scholarships section exactly (same API, same card layout,
// same save-to-profile + apply flows).
export default function ScholarshipsSection() {
  const { isAuthenticated } = useStudentAuth()
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set())
  const [alert, setAlert] = useState({ type: '', text: '' })
  const [authData, setAuthData] = useState({ isOpen: false, message: '' })

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      const scholarshipRes = await axiosInstance
        .get('/scholarships', { params: { grade: '5th', userSide: true } })
        .catch(() => null)
      const scholarshipList = scholarshipRes?.data?.data || (Array.isArray(scholarshipRes?.data) ? scholarshipRes.data : [])
      if (scholarshipRes && scholarshipRes.success !== false) {
        const mapped = scholarshipList.map((s) => ({
          ...s,
          title: s.scholarshipName,
          coverImage: s.image,
          shortDescription: s.benefit || s.eligibility || s.description || 'Active scholarship for students.',
          sectionType: 'Scholarships',
          category: s.category || 'Direct',
          subCategoryLabel: s.provider,
          slug: `direct-${s._id}`,
          isDirect: true,
        }))
        setScholarships(mapped)
      } else {
        setScholarships([])
      }
    } catch {
      setScholarships([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedItems = async () => {
    try {
      const res = await userActionService.getSavedList('ClassContent')
      if (res.success) setSavedIds(new Set(res.data.map((item) => item.contentId?._id || item.contentId)))
    } catch {
      /* saved list unavailable — ignore */
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchSavedItems()
  }, [isAuthenticated])

  const handleSaveAction = async (item) => {
    if (!isAuthenticated) {
      setAuthData({
        isOpen: true,
        message: 'Please sign in to save this to your profile.',
        pendingAction: () => handleSaveAction(item),
      })
      return
    }
    try {
      if (savedIds.has(item._id)) {
        await userActionService.unsaveItem(item._id)
        const newSet = new Set(savedIds)
        newSet.delete(item._id)
        setSavedIds(newSet)
        setAlert({ type: 'info', text: 'Removed from your library' })
      } else {
        await userActionService.saveItem(item._id, 'Scholarship')
        setSavedIds(new Set([...savedIds, item._id]))
        setAlert({ type: 'success', text: 'Saved to success path!' })
      }
      setTimeout(() => setAlert({ type: '', text: '' }), 3000)
    } catch {
      setAlert({ type: 'error', text: 'Action failed.' })
    }
  }

  const handleCardClick = (item) => {
    if (item.applicationLink) window.open(item.applicationLink, '_blank')
    else window.alert('No direct application link provided for this item.')
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Funding your dreams"
        title="Scholarships"
        subtitle="Explore available scholarships you are eligible for."
      />

      {loading ? (
        <SLoader />
      ) : scholarships.length === 0 ? (
        <SEmpty title="No scholarships found" desc="We couldn't find any scholarships matching your criteria." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: 24 }}>
          {scholarships.map((item) => (
            <ScholarshipCard
              key={item._id}
              item={item}
              saved={savedIds.has(item._id)}
              onToggleSave={handleSaveAction}
              onApply={handleCardClick}
            />
          ))}
        </div>
      )}

      <AuthModal
        isOpen={authData.isOpen}
        onClose={() => setAuthData({ ...authData, isOpen: false })}
        message={authData.message}
        onLoginSuccess={() => fetchSavedItems()}
      />
      {alert.text && (
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000 }}>
          <SAlert type={alert.type}>{alert.text}</SAlert>
        </div>
      )}
    </div>
  )
}