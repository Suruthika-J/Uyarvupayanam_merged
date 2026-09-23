import React, { useState, useEffect } from 'react'
import { FiHeart, FiBookmark, FiBriefcase } from 'react-icons/fi'
import axiosInstance from '../../../config/axios'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SBtn, SLoader, SEmpty, SBadge, SAlert } from '../../components/ui'
import AuthModal from '../../components/ui/AuthModal'
import SectionHeader from '../../components/class5/redesign/SectionHeader'

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {scholarships.map((item) => (
            <div
              key={item._id}
              style={{
                background: '#fff',
                borderRadius: 32,
                border: '1px solid #f1f5f9',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)',
                transition: '0.3s',
              }}
              className="hover-lift"
            >
              <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <button
                  onClick={() => handleSaveAction(item)}
                  style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    width: 44,
                    height: 44,
                    borderRadius: 99,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    color: savedIds.has(item._id) ? '#ef4444' : '#64748b',
                    transition: 'all 0.2s',
                  }}
                  aria-label={savedIds.has(item._id) ? 'Unsave scholarship' : 'Save scholarship'}
                >
                  {savedIds.has(item._id) ? <FiHeart size={20} fill="#ef4444" /> : <FiBookmark size={20} />}
                </button>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', paddingRight: 50 }}>
                  <SBadge color="green">Scholarship</SBadge>
                  {(item.grades || []).map((g) => (
                    <SBadge key={g} color="purple">{g}</SBadge>
                  ))}
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.3 }}>
                  {item.scholarshipName}
                </h3>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#64748b',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FiBriefcase size={14} /> {item.provider || 'Unknown Provider'}
                </div>

                <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 20, flex: 1 }}>
                  {item.benefit && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Benefit
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{item.benefit}</div>
                    </div>
                  )}
                  {item.eligibility && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Eligibility
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.5 }}>{item.eligibility}</div>
                    </div>
                  )}
                  {item.deadline && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Last Date
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{item.deadline}</div>
                    </div>
                  )}
                </div>

                <SBtn
                  variant="outline"
                  style={{ width: '100%', borderRadius: 16, padding: '14px 0', border: '2px solid #3b82f6', color: '#3b82f6' }}
                  onClick={() => handleCardClick(item)}
                >
                  Apply / View Details ↗
                </SBtn>
              </div>
            </div>
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