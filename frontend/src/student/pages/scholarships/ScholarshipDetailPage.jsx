import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiChevronLeft, FiCalendar, FiDollarSign, FiAward, 
  FiCheckCircle, FiInfo, FiExternalLink, FiBookmark,
  FiFileText, FiTarget, FiHelpCircle
} from 'react-icons/fi'
import { SBadge, SCard, SBtn, SLoader, SEmpty } from '../../components/ui'
import { scholarshipService } from '../../services'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'

export default function ScholarshipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()
  
  const [scholarship, setScholarship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    console.log("Frontend: Scholarship ID from route params:", id)
    fetchScholarship()
  }, [id])

  const fetchScholarship = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await scholarshipService.getById(id)
      setScholarship(res.data || res)
      
      if (isAuthenticated) {
        const savedRes = await userActionService.getSavedList('Scholarship')
        const alreadySaved = savedRes.data?.some(item => (item.contentId?._id || item.contentId) === id)
        setIsSaved(alreadySaved)
      }
    } catch (err) {
      console.error('Failed to fetch scholarship:', err)
      if (err.response?.status === 404) {
        setError('Scholarship not found')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load scholarship details')
      }
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
        await userActionService.saveItem(id, 'Scholarship')
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <SLoader fullScreen />
  if (error) return <SEmpty title={error} />
  if (!scholarship) return <SEmpty title="Scholarship not found" />

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Banner */}
      <section style={{ background: '#059669', color: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontWeight: 700, fontSize: 14 }}>
            <FiChevronLeft /> Back to List
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <SBadge color="white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>{scholarship.category}</SBadge>
                <SBadge color="white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  For Class {Array.isArray(scholarship.targetClass) ? scholarship.targetClass.join(', ') : scholarship.targetClass}
                </SBadge>
              </div>
              <h1 style={{ fontFamily: 'var(--s-font-display)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: 0, textTransform: 'capitalize' }}>
                {scholarship.scholarshipName || scholarship.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
                  <FiAward /> {scholarship.provider || 'Verified Scheme'}
                </div>
                {scholarship.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700 }}>
                    <FiCalendar /> Deadline: {scholarship.deadline}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <SBtn 
                variant={isSaved ? 'white' : 'outline'} 
                style={{ borderRadius: 14, padding: '16px 24px', background: isSaved ? '#fff' : 'rgba(255,255,255,0.1)', color: isSaved ? '#059669' : '#fff', border: '1px solid rgba(255,255,255,0.2)' }} 
                onClick={handleToggleSave}
                disabled={saving}
              >
                <FiBookmark fill={isSaved ? 'currentColor' : 'none'} style={{ marginRight: 8 }} />
                {isSaved ? 'Saved to Profile' : 'Save Scholarship'}
              </SBtn>
              {scholarship.applicationLink && (
                <a href={scholarship.applicationLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <SBtn variant="white" style={{ borderRadius: 14, padding: '16px 32px', color: '#059669' }}>
                    Apply Online <FiExternalLink style={{ marginLeft: 8 }} />
                  </SBtn>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Benefits */}
          <SCard style={{ padding: 32, borderLeft: '5px solid #059669' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiDollarSign color="#059669" /> Scholarship Benefits
            </h2>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginBottom: 16 }}>
              {scholarship.amount || scholarship.benefit || 'Financial assistance provided based on merit/need.'}
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--s-text2)' }}>
              {scholarship.description || 'This scholarship aims to support deserving students in their academic journey by covering tuition fees and providing other educational allowances.'}
            </p>
          </SCard>

          {/* Eligibility */}
          <SCard style={{ padding: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiTarget color="#059669" /> Eligibility Criteria
            </h2>
            <div style={{ background: '#f0fdf4', padding: 24, borderRadius: 16, border: '1px solid #dcfce7' }}>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: '#166534', margin: 0 }}>
                {scholarship.eligibility || 'Standard eligibility criteria apply. Usually requires minimum marks in previous examination and family income certificate.'}
              </p>
            </div>
          </SCard>

          {/* How to Apply */}
          <SCard style={{ padding: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiFileText color="#059669" /> Application Steps
            </h2>
            {scholarship.stepsToApply?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {scholarship.stepsToApply.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#059669', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 14, fontWeight: 900 }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--s-text2)', lineHeight: 1.6 }}>{step}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 15, color: 'var(--s-text3)' }}>
                1. Visit the official application link.<br/>
                2. Register with your basic details.<br/>
                3. Upload required documents (Income, Marks, ID).<br/>
                4. Submit and track application status.
              </p>
            )}
          </SCard>
        </div>

        <aside>
          <SCard style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Quick Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Provider</div>
                  <div style={{ fontSize: 14, color: 'var(--s-text)', fontWeight: 600 }}>{scholarship.provider}</div>
               </div>
               <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Category</div>
                  <div style={{ fontSize: 14, color: 'var(--s-text)', fontWeight: 600 }}>{scholarship.category}</div>
               </div>
               <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12, border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', gap: 8, color: '#1e40af' }}>
                     <FiInfo size={18} style={{ flexShrink: 0 }} />
                     <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                       Keep your income certificate and previous marksheets ready before applying.
                     </div>
                  </div>
               </div>
               <SBtn 
                 fullWidth 
                 variant="primary" 
                 style={{ background: '#059669', borderColor: '#059669' }}
                 onClick={() => scholarship.applicationLink ? window.open(scholarship.applicationLink, '_blank') : alert('Application link not available for this scholarship.')}
               >
                 Apply Now
               </SBtn>
               <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => alert('Our mentors are available to help! Contact support at support@uyarvupayanam.in')}
                    style={{ background: 'none', border: 'none', color: 'var(--s-text3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: '0 auto' }}
                  >
                    <FiHelpCircle /> Need help applying?
                  </button>
               </div>
            </div>
          </SCard>
        </aside>

      </main>

    </div>
  )
}
