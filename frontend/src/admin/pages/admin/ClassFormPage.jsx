import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowLeft, FiSave, FiEye, FiTrash2, FiPlus, FiX, 
  FiLayout, FiImage, FiList, FiCheckCircle, FiGlobe, FiTarget, FiInfo,
  FiAward, FiCreditCard, FiBookOpen, FiActivity, FiHelpCircle
} from 'react-icons/fi'
import { classContentService } from '../../../services/classContentService'
import { SCard, SBtn, SBadge, SLoader, FormGrid, FormGroup, FormInput, ActivityDot, Toggle } from '../../components/UI'

const SECTION_OPTIONS = [
  "Basics", "Exams", "Fun", "Skills", "Games", "Careers", "Videos", "Habits",
  "Streams", "Entrance Exams", "Resources", "FAQs"
]

const TARGET_CLASSES = ["5", "8", "10", "12"]

export default function ClassFormPage() {
  const { level, id } = useParams()
  const cleanLevel = level.replace('class', '')
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    targetClass: cleanLevel,
    sectionType: 'Basics',
    category: '',
    subCategoryLabel: '',
    shortDescription: '',
    fullDescription: '',
    coverImage: '',
    galleryImages: [],
    benefitType: '',
    scholarshipType: '',
    eligibilityClass: '',
    eligibilityMarks: '',
    familyIncomeLimit: '',
    benefitAmount: '',
    conductedBy: '',
    applicationMode: '',
    importantNote: '',
    examPattern: '',
    relatedSubjects: '',
    whyItMatters: '',
    activities: [],
    tips: [],
    faqs: [],
    youtubeLink: '',
    externalLink: '',
    displayOrder: 0,
    status: 'draft',
    featured: false,
    tags: []
  })

  // Local states for array fields
  const [tagsLabel, setTagsLabel] = useState('')
  const [newGalleryUrl, setNewGalleryUrl] = useState('')
  const [newActivity, setNewActivity] = useState('')
  const [newTip, setNewTip] = useState('')
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (isEdit) fetchExisting()
  }, [id])

  const fetchExisting = async () => {
    try {
      const res = await classContentService.getAdminList(cleanLevel)
      if (res.success) {
        const item = res.data.find(c => c._id === id)
        if (item) {
          setFormData({
            ...formData,
            ...item,
            activities: item.activities || [],
            tips: item.tips || [],
            faqs: item.faqs || [],
            tags: item.tags || []
          })
          setTagsLabel((item.tags || []).join(', '))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleTagsChange = (e) => {
    const val = e.target.value
    setTagsLabel(val)
    const array = val.split(',').map(t => t.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags: array }))
  }

  // List Management
  const addToList = (field, value, clearFn) => {
    if (!value.trim()) return
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
    clearFn('')
  }
  const removeFromList = (field, idx) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))
  }

  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) return
    setFormData(prev => ({ ...prev, faqs: [...prev.faqs, newFaq] }))
    setNewFaq({ question: '', answer: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = isEdit 
        ? await classContentService.update(id, formData)
        : await classContentService.create(formData)
      
      if (res.success) {
        setMessage({ type: 'success', text: isEdit ? 'Content updated successfully!' : 'New content created successfully!' })
        setTimeout(() => navigate(`/admin/career-paths/${level}`), 1000)
      } else {
        setMessage({ type: 'error', text: res.message || 'Save failed' })
      }
    } catch (err) { 
      console.error('Submit failed', err)
      setMessage({ type: 'error', text: err.response?.data?.message || 'Server error occurred' })
    }
    finally { setSaving(false) }
  }

  if (loading) return <SLoader />

  const isExamSection = formData.sectionType === 'Exams' || formData.sectionType === 'Scholarships' || formData.sectionType === 'Entrance Exams'
  const isSkillSection = formData.sectionType === 'Skills' || formData.sectionType === 'Fun' || formData.sectionType === 'Games'
  const isCareerSection = formData.sectionType === 'Careers' || formData.sectionType === 'Streams'
  const isHabitSection = formData.sectionType === 'Habits' || formData.sectionType === 'Basics'

  return (
    <div className="admin-page">
      <form onSubmit={handleSubmit}>
        {/* Header Bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, position:'sticky', top:0, zIndex:100, background:'#fff', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <SBtn variant="outline" type="button" onClick={() => navigate(`/admin/career-paths/${level}`)} style={{ padding:10, borderRadius:12 }}>
               <FiArrowLeft size={18} />
            </SBtn>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <h1 style={{ fontSize:24, fontWeight:900, margin:0 }}>{isEdit ? 'Edit Class Content' : 'Add Class Content'}</h1>
                <SBadge color={formData.status === 'published' ? 'green' : 'gold'}>{formData.status.toUpperCase()}</SBadge>
              </div>
              <p style={{ color:'var(--text3)', fontSize:13 }}>Class {cleanLevel} Content Management</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
             <SBtn variant="outline" type="button" onClick={() => navigate(`/admin/career-paths/${level}`)}>Cancel</SBtn>
             <SBtn type="submit" disabled={saving}>
                <FiSave style={{ marginRight:8 }} /> {saving ? 'Saving...' : (isEdit ? 'Update Content' : 'Publish Live')}
             </SBtn>
          </div>
        </div>

        {message.text && (
          <div style={{ padding: 16, marginBottom: 24, background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', borderRadius: 12, textAlign: 'center', fontWeight: 600, border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}` }}>
            {message.text}
          </div>
        )}

        <FormGrid>
           {/* Column 1: Core Details */}
           <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <SCard>
                 <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--surface2)', display:'grid', placeItems:'center', color:'var(--primary)' }}><FiLayout size={16} /></div>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Primary Details</h3>
                 </div>
                 <FormGroup label="Content Title" full><FormInput name="title" value={formData.title} onChange={handleChange} required /></FormGroup>
                 <FormGrid style={{ gap:16 }}>
                    <FormGroup label="Target Class">
                      <select name="targetClass" value={formData.targetClass} onChange={handleChange} style={{ width:'100%', padding:'11px 16px', borderRadius:14, border:'1.5px solid var(--border)', fontFamily:'inherit', background:'#fff' }}>
                        {TARGET_CLASSES.map(cls => <option key={cls} value={cls}>{cls}th Standard</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Section Group">
                      <select name="sectionType" value={formData.sectionType} onChange={handleChange} style={{ width:'100%', padding:'11px 16px', borderRadius:14, border:'1.5px solid var(--border)', fontFamily:'inherit', background:'#fff' }}>
                        {SECTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </FormGroup>
                 </FormGrid>
                 {formData.targetClass === '10' && formData.sectionType === 'Streams' ? (
                   <FormGroup label="Stream Category" full>
                     <select name="category" value={formData.category} onChange={handleChange} style={{ width:'100%', padding:'11px 16px', borderRadius:14, border:'1.5px solid var(--border)', fontFamily:'inherit', background:'#fff' }} required>
                       <option value="">Select Stream</option>
                       <option value="Maths Biology (PCMB)">Maths Biology (PCMB)</option>
                       <option value="Maths Computer Science (PCM-CS)">Maths Computer Science (PCM-CS)</option>
                       <option value="Biology (PCB)">Biology (PCB)</option>
                       <option value="Commerce with Accountancy">Commerce with Accountancy</option>
                       <option value="Commerce with Business Maths">Commerce with Business Maths</option>
                       <option value="Commerce with Computer Science">Commerce with Computer Science</option>
                       <option value="Arts with Humanities subjects">Arts with Humanities subjects</option>
                       <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                       <option value="ITI / Vocational">ITI / Vocational</option>
                     </select>
                   </FormGroup>
                 ) : (
                   <FormGroup label="Category Label" full><FormInput name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Science, Tamil Nadu Scholarships" required /></FormGroup>
                 )}
                 <FormGroup label="Sub-Category (Badge)" full><FormInput name="subCategoryLabel" value={formData.subCategoryLabel} onChange={handleChange} placeholder="e.g. Scholarship, Soft Skills" /></FormGroup>
                 <FormGroup label="Short Card Description" full><FormInput as="textarea" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required style={{ minHeight:80 }} /></FormGroup>
                 <FormGroup label="Promotional Tags (comma separated)" full><FormInput value={tagsLabel} onChange={handleTagsChange} placeholder="e.g. nmms, merit, class8" /></FormGroup>
              </SCard>

              {/* Conditional: Scholarship / Exam Details */}
              {isExamSection && (
                <SCard>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'#fff7ed', display:'grid', placeItems:'center', color:'#ea580c' }}><FiAward size={16} /></div>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Scholarship & Exam Facts</h3>
                  </div>
                  <FormGrid style={{ gap:16, marginBottom:16 }}>
                     <FormGroup label="Benefit Category"><FormInput name="benefitType" value={formData.benefitType} onChange={handleChange} placeholder="e.g. Cash, Fee Concession" /></FormGroup>
                     <FormGroup label="Scholarship Type"><FormInput name="scholarshipType" value={formData.scholarshipType} onChange={handleChange} placeholder="e.g. Government, Private" /></FormGroup>
                  </FormGrid>
                  <FormGrid style={{ gap:16, marginBottom:16 }}>
                     <FormGroup label="Eligible Class"><FormInput name="eligibilityClass" value={formData.eligibilityClass} onChange={handleChange} placeholder="e.g. Class 8" /></FormGroup>
                     <FormGroup label="Marks Criteria"><FormInput name="eligibilityMarks" value={formData.eligibilityMarks} onChange={handleChange} placeholder="e.g. 55% in Class 7" /></FormGroup>
                  </FormGrid>
                  <FormGrid style={{ gap:16, marginBottom:16 }}>
                     <FormGroup label="Family Income Limit"><FormInput name="familyIncomeLimit" value={formData.familyIncomeLimit} onChange={handleChange} placeholder="e.g. ₹3,50,000" /></FormGroup>
                     <FormGroup label="Benefit Amount"><FormInput name="benefitAmount" value={formData.benefitAmount} onChange={handleChange} placeholder="e.g. ₹12,000 / year" /></FormGroup>
                  </FormGrid>
                  <FormGroup label="Conducted By" full><FormInput name="conductedBy" value={formData.conductedBy} onChange={handleChange} placeholder="e.g. Ministry of Education" /></FormGroup>
                  <FormGroup label="Application Mode" full><FormInput name="applicationMode" value={formData.applicationMode} onChange={handleChange} placeholder="e.g. NSP Portal / Offline" /></FormGroup>
                  <FormGroup label="Exam Pattern / Subjects" full><FormInput as="textarea" name="examPattern" value={formData.examPattern} onChange={handleChange} placeholder="Describe the test format..." /></FormGroup>
                </SCard>
              )}

              {/* Conditional: Skills & Activities */}
              {isSkillSection && (
                <SCard>
                   <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                     <div style={{ width:32, height:32, borderRadius:8, background:'#f0fdf4', display:'grid', placeItems:'center', color:'#16a34a' }}><FiActivity size={16} /></div>
                     <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Activities & Skill Building</h3>
                   </div>
                   <FormGroup label="Why it Matters?" full><FormInput name="whyItMatters" value={formData.whyItMatters} onChange={handleChange} placeholder="State the learning benefit..." /></FormGroup>
                   <FormGroup label="Suggested Activities" full>
                      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                         <FormInput value={newActivity} onChange={e => setNewActivity(e.target.value)} placeholder="Add an activity..." />
                         <SBtn variant="outline" type="button" onClick={() => addToList('activities', newActivity, setNewActivity)}><FiPlus /></SBtn>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                         {formData.activities.map((a, i) => (
                           <SBadge key={i} color="blue" dot style={{ padding:'6px 12px', fontSize:13 }}>
                             {a} <FiX onClick={() => removeFromList('activities', i)} style={{ marginLeft:6, cursor:'pointer' }} />
                           </SBadge>
                         ))}
                      </div>
                   </FormGroup>
                </SCard>
              )}
           </div>

           {/* Column 2: Media & Content */}
           <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <SCard>
                 <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--surface2)', display:'grid', placeItems:'center', color:'var(--primary)' }}><FiImage size={16} /></div>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Media & Resources</h3>
                 </div>
                 <FormGroup label="Cover URL" full><FormInput name="coverImage" value={formData.coverImage} onChange={handleChange} /></FormGroup>
                 <FormGrid style={{ gap:16 }}>
                    <FormGroup label="Youtube Video ID"><FormInput name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} placeholder="e.g. xyz123" /></FormGroup>
                    <FormGroup label="Direct Action Link"><FormInput name="externalLink" value={formData.externalLink} onChange={handleChange} placeholder="https://..." /></FormGroup>
                 </FormGrid>
              </SCard>

              <SCard>
                 <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--surface2)', display:'grid', placeItems:'center', color:'var(--primary)' }}><FiTarget size={16} /></div>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Article Content</h3>
                 </div>
                 {isCareerSection && <FormGroup label="Related Subjects" full><FormInput name="relatedSubjects" value={formData.relatedSubjects} onChange={handleChange} placeholder="e.g. Biology, Sci" /></FormGroup>}
                 <FormGroup label="Main Detailed Description" full><FormInput as="textarea" name="fullDescription" value={formData.fullDescription} onChange={handleChange} style={{ minHeight:200 }} required /></FormGroup>
                 <FormGroup label="Important Note / Caution" full><FormInput name="importantNote" value={formData.importantNote} onChange={handleChange} /></FormGroup>
                 
                 {isHabitSection && (
                   <FormGroup label="Habits & Study Tips" full>
                      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                         <FormInput value={newTip} onChange={e => setNewTip(e.target.value)} placeholder="Add a tip..." />
                         <SBtn variant="outline" type="button" onClick={() => addToList('tips', newTip, setNewTip)}><FiPlus /></SBtn>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                         {formData.tips.map((t, i) => (
                           <div key={i} style={{ display:'flex', gap:10, alignItems:'center', background:'var(--surface2)', padding:10, borderRadius:10, fontSize:13 }}>
                             <FiCheckCircle size={14} color="var(--primary)" /> {t}
                             <FiTrash2 size={14} onClick={() => removeFromList('tips', i)} style={{ marginLeft:'auto', color:'#ef4444', cursor:'pointer' }} />
                           </div>
                         ))}
                      </div>
                   </FormGroup>
                 )}
              </SCard>

              <SCard>
                 <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'#fef2f2', display:'grid', placeItems:'center', color:'#ef4444' }}><FiHelpCircle size={16} /></div>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Quick FAQs</h3>
                 </div>
                 <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
                    <FormInput value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} placeholder="Question..." />
                    <FormInput as="textarea" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} placeholder="Answer..." style={{ minHeight:60 }} />
                    <SBtn variant="outline" type="button" onClick={addFaq}><FiPlus style={{ marginRight:8 }} /> Add FAQ</SBtn>
                 </div>
                 <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {formData.faqs.map((f, i) => (
                      <div key={i} style={{ border:'1px solid var(--border)', borderRadius:12, padding:12 }}>
                         <div style={{ fontSize:14, fontWeight:800, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                            {f.question} <FiTrash2 size={13} color="#ef4444" onClick={() => removeFromList('faqs', i)} style={{ cursor:'pointer' }} />
                         </div>
                         <div style={{ fontSize:13, color:'var(--text3)' }}>{f.answer}</div>
                      </div>
                    ))}
                 </div>
              </SCard>

              <SCard>
                 <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--surface2)', display:'grid', placeItems:'center', color:'var(--primary)' }}><FiCheckCircle size={16} /></div>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Publication</h3>
                 </div>
                 <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                       <Toggle on={formData.status === 'published'} onClick={() => setFormData({...formData, status: formData.status === 'published' ? 'draft' : 'published'})} />
                       <span style={{ fontSize:14, fontWeight:700 }}>Published (Verified Student Only)</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                       <Toggle on={formData.featured} onClick={() => setFormData({...formData, featured: !formData.featured})} />
                       <span style={{ fontSize:14, fontWeight:700 }}>Featured Highlight</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                       <label style={{ fontSize:14, fontWeight:700 }}>Sort Order:</label>
                       <FormInput type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} style={{ width:80 }} />
                    </div>
                 </div>
              </SCard>
           </div>
        </FormGrid>
      </form>
    </div>
  )
}
