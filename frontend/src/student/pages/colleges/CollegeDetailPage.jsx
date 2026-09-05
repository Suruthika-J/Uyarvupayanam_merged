import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiChevronLeft, FiMapPin, FiGlobe, FiStar, FiAward, 
  FiCheckCircle, FiInfo, FiExternalLink, FiBookmark
} from 'react-icons/fi'
import { SBadge, SCard, SBtn, SLoader, SEmpty } from '../../components/ui'
import { collegeService } from '../../services'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import AdmissionHelpModal from '../../components/colleges/AdmissionHelpModal'

const STREAM_STYLE = {
  Engineering: { color: '#1d5fba', bg: '#eaf0fb', icon: '⚙️' },
  Medical: { color: '#16a34a', bg: '#f0fdf4', icon: '🩺' },
  'Arts & Science': { color: '#7c3aed', bg: '#f3effe', icon: '🎨' },
  Law: { color: '#c48a1a', bg: '#fdf4e0', icon: '⚖️' },
  Polytechnic: { color: '#e05e24', bg: '#fdeee6', icon: '🔧' },
  Agriculture: { color: '#15803d', bg: '#dcfce7', icon: '🌱' },
  Others: { color: '#64748b', bg: '#f1f5f9', icon: '🎓' },
}

export default function CollegeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()
  
  const [college, setCollege] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchCollege()
  }, [id])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      const res = await collegeService.getById(id)
      setCollege(res.data || res)
      
      if (isAuthenticated) {
        const savedRes = await userActionService.getSavedList('College')
        const alreadySaved = savedRes.data?.some(item => (item.contentId?._id || item.contentId) === id)
        setIsSaved(alreadySaved)
      }
    } catch (err) {
      console.error('Failed to fetch college:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async () => {
    if (!isAuthenticated) return navigate('/student/signin')
    try {
      setSaving(true)
      if (isSaved) {
        await userActionService.unsaveItem(id)
        setIsSaved(false)
      } else {
        await userActionService.saveItem(id, 'College')
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <SLoader fullScreen />
  if (!college) return <SEmpty title="College not found" />

  const style = STREAM_STYLE[college.stream] || STREAM_STYLE.Others

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Banner */}
      <section style={{ background: 'var(--s-primary)', color: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontWeight: 700, fontSize: 14 }}>
            <FiChevronLeft /> Back to List
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <SBadge color="blue" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>{college.stream}</SBadge>
                {college.accreditation && <SBadge color="white" style={{ background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.4)', color: '#ffd700' }}>⭐ {college.accreditation}</SBadge>}
              </div>
              <h1 style={{ fontFamily: 'var(--s-font-display)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: 0 }}>
                {college.collegeName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
                  <FiMapPin /> {college.district}, {college.state || 'Tamil Nadu'}
                </div>
                {college.rank && <div style={{ fontSize: 16, fontWeight: 700 }}>🏆 Rank #{college.rank}</div>}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <SBtn 
                variant={isSaved ? 'white' : 'outline'} 
                style={{ borderRadius: 14, padding: '16px 24px', background: isSaved ? '#fff' : 'rgba(255,255,255,0.1)', color: isSaved ? 'var(--s-primary)' : '#fff', border: '1px solid rgba(255,255,255,0.2)' }} 
                onClick={handleToggleSave}
                disabled={saving}
              >
                <FiBookmark fill={isSaved ? 'currentColor' : 'none'} style={{ marginRight: 8 }} />
                {isSaved ? 'Saved to Profile' : 'Save College'}
              </SBtn>
              {college.website && (
                <a href={college.website} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <SBtn variant="white" style={{ borderRadius: 14, padding: '16px 32px' }}>
                    Official Website <FiExternalLink style={{ marginLeft: 8 }} />
                  </SBtn>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Overview */}
          <SCard style={{ padding: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>About the Institution</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--s-text2)' }}>
              {college.description || `${college.collegeName} is a premier ${college.stream} institution located in ${college.district}, dedicated to providing high-quality education and student growth opportunities in Tamil Nadu.`}
            </p>
          </SCard>

          {/* Facilities */}
          {college.facilities?.length > 0 && (
            <SCard style={{ padding: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Campus Facilities</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                 {college.facilities.map(f => (
                   <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#166534', padding: '10px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
                      <FiCheckCircle size={16} /> {f}
                   </div>
                 ))}
              </div>
            </SCard>
          )}
        </div>

        <aside>
          <SCard style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Admissions Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Contact Info</div>
                  <div style={{ fontSize: 14, color: 'var(--s-text)', fontWeight: 600 }}>{college.contactNo || 'Available on Website'}</div>
               </div>
               <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Counseling Code</div>
                  <div style={{ fontSize: 18, color: 'var(--s-primary)', fontWeight: 900 }}>{college.collegeCode || 'TNEA'}</div>
               </div>
               <div style={{ background: '#fffbeb', padding: 16, borderRadius: 12, border: '1px solid #fef3c7' }}>
                  <div style={{ display: 'flex', gap: 8, color: '#92400e' }}>
                     <FiInfo size={18} style={{ flexShrink: 0 }} />
                     <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                       Make sure to check the latest <strong>TNEA Cutoffs</strong> for this college before applying.
                     </div>
                  </div>
               </div>
                <SBtn 
                  fullWidth 
                  variant="primary" 
                  onClick={() => setIsModalOpen(true)}
                  style={{ 
                    borderRadius: 12, 
                    padding: '16px 0', 
                    fontSize: 16, 
                    fontWeight: 900,
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                  }}
               >
                 Get Admission Help
               </SBtn>
            </div>
          </SCard>
        </aside>

      </main>

      <AdmissionHelpModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        college={college} 
        student={isAuthenticated ? JSON.parse(localStorage.getItem('student_user')) : null} 
      />
    </div>
  )
}
