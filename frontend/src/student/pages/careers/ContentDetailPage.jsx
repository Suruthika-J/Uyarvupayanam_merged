import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowLeft, FiTag, FiVideo, FiExternalLink, 
  FiClock, FiGrid, FiUser, FiShare2, FiHeart, FiBookmark,
  FiAward, FiCreditCard, FiCheckCircle, FiInfo, FiActivity, FiBookOpen, FiHelpCircle, FiCheck
} from 'react-icons/fi'
import { classContentService } from '../../../services/classContentService'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SLoader, SBtn, SBadge, SAlert } from '../../components/ui'
import AuthModal from '../../components/ui/AuthModal'
import MentorRequestModal from '../../components/mentor/MentorRequestModal'

export default function ContentDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()
  
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set())
  const [related, setRelated] = useState([])
  const [alert, setAlert] = useState({ type: '', text: '' })
  const [authData, setAuthData] = useState({ isOpen: false, message: '' })
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [slug])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await classContentService.getBySlug(slug)
      if (res.success) {
        setContent(res.data)
        // Fetch related from same section
        const relatedRes = await classContentService.getPublicList({ targetClass: res.data.targetClass })
        if (relatedRes.success) {
          setRelated(relatedRes.data.filter(c => c.sectionType === res.data.sectionType && c._id !== res.data._id).slice(0, 3))
        }
      }
      if (isAuthenticated) fetchSavedStatus()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedStatus = async () => {
    try {
      const res = await userActionService.getSavedList('ClassContent')
      if (res.success) {
        setSavedIds(new Set(res.data.map(item => item.contentId._id || item.contentId)))
      }
    } catch (err) { }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      setAuthData({ isOpen: true, message: 'Sign in to save this guide to your profile.' })
      return
    }
    try {
      if (savedIds.has(content._id)) {
        await userActionService.unsaveItem(content._id)
        const newSet = new Set(savedIds)
        newSet.delete(content._id)
        setSavedIds(newSet)
        setAlert({ type: 'info', text: 'Removed from library' })
      } else {
        await userActionService.saveItem(content._id, 'ClassContent')
        setSavedIds(new Set([...savedIds, content._id]))
        setAlert({ type: 'success', text: 'Saved to success path!' })
      }
      setTimeout(() => setAlert({ type: '', text: '' }), 3000)
    } catch (err) { }
  }

  if (loading) return <SLoader fullPage />
  if (!content) return (
    <div style={{ textAlign:'center', padding:'100px 20px' }}>
      <h2>Guide Not Found</h2>
      <SBtn onClick={() => navigate(-1)}>Go Back</SBtn>
    </div>
  )

  const hasScholarshipFacts = content.benefitAmount || content.conductedBy || content.eligibilityClass
  const hasSkillFacts = content.activities?.length > 0 || content.whyItMatters
  const hasTips = content.tips?.length > 0
  const hasFaqs = content.faqs?.length > 0

  return (
    <div className="content-detail-page" style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Header / Banner */}
      <div style={{ position: 'relative', height: '450px', width: '100%', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: content.coverImage ? `url(${content.coverImage}) center/cover no-repeat` : 'linear-gradient(135deg, #0f4c75 0%, #3282b8 100%)',
          filter: 'brightness(0.7)'
        }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)' 
        }} />
        
        <div style={{ position: 'absolute', top: 30, left: 30, zIndex: 10 }}>
           <button onClick={() => navigate(-1)} style={{ 
             display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
             borderRadius: 14, border:'none', background: 'rgba(255,255,255,0.2)', 
             backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 700, cursor: 'pointer' 
           }}>
             <FiArrowLeft size={18} /> Back to Class Guidance
           </button>
        </div>

        <div style={{ position: 'absolute', bottom: 60, left: 0, width: '100%', padding: '0 40px' }}>
           <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                 <SBadge color="blue">{content.sectionType}</SBadge>
                 {content.subCategoryLabel && <SBadge color="gold">{content.subCategoryLabel}</SBadge>}
                 {content.scholarshipType && <SBadge color="green">{content.scholarshipType.toUpperCase()}</SBadge>}
              </div>
              <h1 style={{ color: '#fff', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {content.title}
              </h1>
              {content.relatedSubjects && (
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginTop: 15, fontWeight: 600 }}>
                   Related Subjects: <span style={{ color: '#7dd3fc' }}>{content.relatedSubjects}</span>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 60 }}>
        
        <article>
          {/* Metadata Row */}
          <div style={{ display:'flex', alignItems:'center', gap:30, marginBottom:40, paddingBottom:30, borderBottom:'1px solid #f1f5f9' }}>
             <div style={{ display:'flex', alignItems:'center', gap:10, color:'#64748b', fontSize:14 }}>
                <FiClock size={16} /> <span>{new Date(content.createdAt).toLocaleDateString()}</span>
             </div>
             <div style={{ display:'flex', alignItems:'center', gap:10, color:'#64748b', fontSize:14 }}>
                <FiTag size={16} /> <span>{content.category}</span>
             </div>
             <button 
                onClick={handleSave}
                style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color: savedIds.has(content._id) ? '#ef4444' : '#64748b', fontWeight:700 }}
             >
                {savedIds.has(content._id) ? <FiHeart size={18} fill="#ef4444" /> : <FiBookmark size={18} />}
                {savedIds.has(content._id) ? 'Saved to Profile' : 'Save for Later'}
             </button>
          </div>

          <p style={{ fontSize: 20, color: '#475569', lineHeight: 1.6, fontWeight: 500, marginBottom: 40, background: '#f8fafc', padding: '30px 32px', borderRadius: 24, borderLeft: '6px solid var(--s-primary)' }}>
            {content.shortDescription}
          </p>

          {/* QUICK FACTS BOX (Scholarships / Exams) */}
          {hasScholarshipFacts && (
            <div style={{ marginBottom: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
               <div style={{ background: '#f8fafc', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiAward size={20} color="#ea580c" />
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Opportunity Quick Facts</h3>
               </div>
               <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {content.conductedBy && <div style={{ fontSize:14 }}><label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:4 }}>Conducted By</label><strong>{content.conductedBy}</strong></div>}
                  {content.benefitAmount && <div style={{ fontSize:14 }}><label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:4 }}>Benefit Amount</label><strong style={{ color:'#16a34a', fontSize:18 }}>{content.benefitAmount}</strong></div>}
                  {content.eligibilityClass && <div style={{ fontSize:14 }}><label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:4 }}>Eligibility Class</label><strong>{content.eligibilityClass}</strong></div>}
                  {content.eligibilityMarks && <div style={{ fontSize:14 }}><label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:4 }}>Marks Required</label><strong>{content.eligibilityMarks}</strong></div>}
                  {content.familyIncomeLimit && <div style={{ fontSize:14 }}><label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:4 }}>Family Income Limit</label><strong>{content.familyIncomeLimit}</strong></div>}
                  {content.applicationMode && <div style={{ fontSize:14 }}><label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:4 }}>Application Mode</label><strong>{content.applicationMode}</strong></div>}
               </div>
               {content.examPattern && (
                 <div style={{ padding: '0 24px 24px', fontSize: 14 }}>
                    <label style={{ display:'block', color:'#64748b', fontWeight:600, marginBottom:8 }}>Exam Pattern / Subjects</label>
                    <div style={{ background: '#f1f5f9', padding: 16, borderRadius: 12, lineHeight: 1.5 }}>{content.examPattern}</div>
                 </div>
               )}
            </div>
          )}

          {/* MAIN ARTICLE BODY */}
          <div style={{ fontSize: 18, color: '#1e293b', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 60, fontFamily: 'var(--s-font-body)' }}>
            {content.fullDescription}
          </div>

          {/* TIPS & HABITS SECTION */}
          {hasTips && (
            <div style={{ marginBottom: 60, padding: 40, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: 32, border: '1px solid #bae6fd' }}>
               <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiCheckCircle size={26} color="#0ea5e9" /> Success Tips & Habits
               </h3>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                  {content.tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, background: '#fff', padding: 20, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                       <FiCheck size={18} color="#0ea5e9" style={{ marginTop: 3, flexShrink: 0 }} />
                       <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{tip}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* ACTIVITIES SECTION */}
          {hasSkillFacts && (
            <div style={{ marginBottom: 60 }}>
               <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiActivity size={26} color="#8b5cf6" /> Why it Matters & Activities
               </h3>
               {content.whyItMatters && (
                 <p style={{ color: '#475569', fontSize: 17, marginBottom: 30 }}>{content.whyItMatters}</p>
               )}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {content.activities.map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: '#f5f3ff', color: '#6d28d9', borderRadius: 100, fontWeight: 700, fontSize: 14 }}>
                       <FiCheckCircle size={16} /> {act}
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* FAQ SECTION */}
          {hasFaqs && (
             <div style={{ marginBottom: 60 }}>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiHelpCircle size={26} color="#ef4444" /> Quick FAQs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {content.faqs.map((f, i) => (
                     <div key={i} style={{ padding: 24, borderRadius: 20, border: '1.5px solid #f1f5f9', background: '#fafafa' }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{f.question}</h4>
                        <p style={{ margin: 0, fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>{f.answer}</p>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {/* Gallery */}
          {content.galleryImages?.length > 0 && (
            <div style={{ marginBottom: 60 }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Image Gallery</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                {content.galleryImages.map((img, i) => (
                  <img key={i} src={img} style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 24, border: '1px solid #eee' }} />
                ))}
              </div>
            </div>
          )}

          {/* Important Note */}
          {content.importantNote && (
            <div style={{ padding: 24, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, color: '#92400e', fontSize: 15, marginBottom: 40, display: 'flex', gap: 12 }}>
               <FiInfo size={20} style={{ flexShrink: 0, marginTop: 2 }} />
               <strong>Note: </strong> {content.importantNote}
            </div>
          )}

          {/* External Resources */}
          {(content.youtubeLink || content.externalLink) && (
            <div style={{ padding: 40, background: '#0f172a', borderRadius: 32, color: '#fff' }}>
               <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, color: '#fff' }}>Official Links & Tools</h3>
               <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                 {content.youtubeLink && (
                   <SBtn style={{ background: '#ef4444', color: '#fff', border:'none' }} onClick={() => window.open(content.youtubeLink)}>
                     <FiVideo /> Watch Tutorial
                   </SBtn>
                 )}
                 {content.externalLink && (
                   <SBtn style={{ background: '#3b82f6', color: '#fff', border:'none' }} onClick={() => window.open(content.externalLink)}>
                     <FiExternalLink /> Official Website
                   </SBtn>
                 )}
               </div>
            </div>
          )}

          {/* Tags */}
          {content.tags?.length > 0 && (
            <div style={{ marginTop: 60, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {content.tags.map(t => (
                <span key={t} style={{ padding: '8px 20px', borderRadius: 100, background: '#f1f5f9', fontSize: 13, fontWeight: 700, color: '#64748b' }}>#{t}</span>
              ))}
            </div>
          )}
        </article>

        <aside>
          <div style={{ position: 'sticky', top: 100 }}>
             <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiGrid size={20} color="#3b82f6" /> Related Guides
             </h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {related.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>Explore other sections for more guides.</p>
                ) : related.map(item => (
                  <Link key={item._id} to={`/student/career-path/class-${item.targetClass}/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 15 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 16, background: '#f1f5f9', flexShrink:0, display:'grid', placeItems:'center' }}>
                       {item.coverImage ? <img src={item.coverImage} style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} /> : <FiBookOpen color="#3b82f6" />}
                    </div>
                    <div>
                      <h5 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.3 }}>{item.title}</h5>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{item.category}</span>
                    </div>
                  </Link>
                ))}
             </div>

             <div style={{ marginTop: 60, padding: 32, background: 'linear-gradient(to bottom, #eff6ff, #f8faff)', borderRadius: 28, textAlign: 'center', border: '1px solid #dbeafe' }}>
                <div style={{ width: 56, height: 56, background: '#fff', borderRadius: 16, display: 'grid', placeItems:'center', margin: '0 auto 20px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)' }}>
                   <FiUser size={24} color="#3b82f6" />
                </div>
                <h5 style={{ fontWeight: 900, fontSize: 17, marginBottom: 10 }}>Need Guidance?</h5>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>Talk to our experts for personalized career roadmap.</p>
                <SBtn variant="primary" style={{ width: '100%', borderRadius:14 }} onClick={() => setIsMentorModalOpen(true)}>Talk to Mentor</SBtn>
             </div>
          </div>
        </aside>

      </div>

      <AuthModal isOpen={authData.isOpen} onClose={() => setAuthData({...authData, isOpen:false})} message={authData.message} onLoginSuccess={() => fetchData()} />
      <MentorRequestModal isOpen={isMentorModalOpen} onClose={() => setIsMentorModalOpen(false)} initialInterest={content?.title || ''} />
      {alert.text && <div style={{ position:'fixed', bottom:30, right:30, zIndex:1000 }}><SAlert type={alert.type} onClose={() => setAlert({ type:'', text:'' })}>{alert.text}</SAlert></div>}
    </div>
  )
}
