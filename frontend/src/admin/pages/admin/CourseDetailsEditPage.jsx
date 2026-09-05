import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, SBtn, FormGrid, FormGroup, FormInput, FormActions } from '../../components/UI'
import { courseService } from '../../../services/courseService'

export default function CourseDetailsEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [form, setForm] = useState({
    courseName: '', targetLevel: 'After 10th', level: 'Polytechnic', category: '',
    duration: '', eligibility: '', shortDescription: '',
    overview: '', admissionProcess: '', careerScope: '', higherStudies: '', studentNote: '',
    salaryRange: { starting: '', growth: '' },
    subjectsCovered: [], skillsRequired: [], jobRoles: [], workSectors: [],
    advantages: [], challenges: [], faqs: []
  })

  useEffect(() => {
    fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const res = await courseService.getCourseById(id)
      if (res.success) {
        setForm(res.data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setMessage({ type: 'error', text: 'Failed to load course details' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [p, c] = name.split('.')
      setForm(prev => ({ ...prev, [p]: { ...prev[p], [c]: value } }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    setForm(prev => {
      const arr = [...prev[field]]
      arr[index] = value
      return { ...prev, [field]: arr }
    })
  }

  const addItem = (field, defaultValue = '') => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }))
  }

  const removeItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const handleFaqChange = (index, field, value) => {
    setForm(prev => {
      const faqs = [...prev.faqs]
      faqs[index][field] = value
      return { ...prev, faqs }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await courseService.updateCourse(id, form)
      if (res.success) {
        setMessage({ type: 'success', text: 'Course details updated successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update course' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading details...</div>

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both', maxWidth: 1000, margin: '0 auto' }}>
      
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
           <button onClick={() => navigate('/admin/courses')} style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontWeight:800, fontSize:14 }}>← Back to Courses</button>
           <h1 style={{ fontFamily:'Nunito', fontSize:26, fontWeight:950, margin:'8px 0 0', color:'var(--text)' }}>
              Edit Course Details: {form.courseName}
           </h1>
        </div>
        <SBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save All Changes'}</SBtn>
      </header>

      {message.text && (
        <div style={{ 
          padding: 12, marginBottom:16, borderRadius:12, fontSize:14, fontWeight:700,
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
        }}>
          {message.text}
        </div>
      )}

      {/* ── Section 1: Core ── */}
      <Card style={{ marginBottom:24 }}>
        <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:900, textTransform:'uppercase', color:'var(--text3)' }}>1. Core Information</h3>
        <FormGrid>
          <FormGroup label="Course Name" full>
            <FormInput name="courseName" value={form.courseName} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="Trajectory">
             <select name="targetLevel" value={form.targetLevel} onChange={handleChange} style={selectStyle}>
                <option value="After 10th">After 10th</option>
                <option value="After 12th">After 12th</option>
             </select>
          </FormGroup>
          <FormGroup label="Category">
             <FormInput name="category" value={form.category} onChange={handleChange} placeholder="e.g. Engineering" />
          </FormGroup>
          <FormGroup label="Short Description" full>
             <FormInput as="textarea" name="shortDescription" value={form.shortDescription} onChange={handleChange} />
          </FormGroup>
        </FormGrid>
      </Card>

      {/* ── Section 2: Full Page Detail ── */}
      <Card style={{ marginBottom:24 }}>
        <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:900, textTransform:'uppercase', color:'var(--text3)' }}>2. Full Detailed Content</h3>
        <FormGroup label="Overall Overview" full>
            <FormInput as="textarea" name="overview" value={form.overview} onChange={handleChange} placeholder="What is this course about?" />
        </FormGroup>
        <div style={{ marginTop:20 }}>
          <FormGroup label="Admission Process" full>
              <FormInput as="textarea" name="admissionProcess" value={form.admissionProcess} onChange={handleChange} placeholder="Entrance exams, counselling, etc." />
          </FormGroup>
        </div>
        
        <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div>
            <label style={labelStyle}>Subjects Covered</label>
            {form.subjectsCovered.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                <FormInput value={s} onChange={(e) => handleArrayChange('subjectsCovered', i, e.target.value)} />
                <button onClick={() => removeItem('subjectsCovered', i)} style={delBtnStyle}>×</button>
              </div>
            ))}
            <button onClick={() => addItem('subjectsCovered')} style={addBtnStyle}>+ Add Subject</button>
          </div>
          <div>
            <label style={labelStyle}>Skills Required</label>
            {form.skillsRequired.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                <FormInput value={s} onChange={(e) => handleArrayChange('skillsRequired', i, e.target.value)} />
                <button onClick={() => removeItem('skillsRequired', i)} style={delBtnStyle}>×</button>
              </div>
            ))}
            <button onClick={() => addItem('skillsRequired')} style={addBtnStyle}>+ Add Skill</button>
          </div>
        </div>
      </Card>

      {/* ── Section 3: Professional ── */}
      <Card style={{ marginBottom:24 }}>
        <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:900, textTransform:'uppercase', color:'var(--text3)' }}>3. Career & Salary</h3>
        <FormGroup label="Career Scope" full>
            <FormInput as="textarea" name="careerScope" value={form.careerScope} onChange={handleChange} />
        </FormGroup>
        <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <FormGroup label="Starting Salary (Realistic)">
              <FormInput name="salaryRange.starting" value={form.salaryRange.starting} onChange={handleChange} placeholder="e.g. 3.5L - 5L per annum" />
          </FormGroup>
          <FormGroup label="Salary Growth Path">
              <FormInput name="salaryRange.growth" value={form.salaryRange.growth} onChange={handleChange} placeholder="e.g. High growth after 5 years" />
          </FormGroup>
        </div>
        <div style={{ marginTop:20 }}>
           <label style={labelStyle}>Specific Job Roles</label>
           <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {form.jobRoles.map((r, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', background:'var(--surface2)', padding:'4px 12px', borderRadius:8, border:'1px solid var(--border)' }}>
                   <input value={r} onChange={(e) => handleArrayChange('jobRoles', i, e.target.value)} style={{ border:'none', background:'none', color:'var(--text)', fontSize:13 }} />
                   <button onClick={() => removeItem('jobRoles', i)} style={{ background:'none', border:'none', cursor:'pointer' }}>×</button>
                </div>
              ))}
              <button onClick={() => addItem('jobRoles')} style={addBtnStyle}>+ Add Role</button>
           </div>
        </div>
      </Card>

      {/* ── Section 4: FAQs ── */}
      <Card style={{ marginBottom:40 }}>
        <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:900, textTransform:'uppercase', color:'var(--text3)' }}>4. FAQs (Student Common Questions)</h3>
        {form.faqs.map((f, i) => (
           <div key={i} style={{ padding:16, border:'1.5px solid var(--border)', borderRadius:16, marginBottom:14, background:'var(--surface2)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontWeight:900, color:'var(--primary)', fontSize:12 }}>FAQ NO. {i+1}</span>
                <button onClick={() => removeItem('faqs', i)} style={delBtnStyle}>Remove FAQ</button>
              </div>
              <FormGroup label="Question">
                 <FormInput value={f.question} onChange={(e) => handleFaqChange(i, 'question', e.target.value)} />
              </FormGroup>
              <div style={{ marginTop:14 }}>
                 <FormGroup label="Answer">
                   <FormInput as="textarea" value={f.answer} onChange={(e) => handleFaqChange(i, 'answer', e.target.value)} />
                 </FormGroup>
              </div>
           </div>
        ))}
        <button onClick={() => addItem('faqs', { question:'', answer:'' })} style={addBtnStyle}>+ Add Frequently Asked Question</button>
      </Card>

      <div style={{ display:'flex', justifyContent:'flex-end', paddingBottom:60 }}>
          <SBtn onClick={handleSave} disabled={saving} style={{ padding:'16px 48px' }}>
             {saving ? 'Saving...' : 'COMMIT ALL UPDATES'}
          </SBtn>
      </div>

    </div>
  )
}

const selectStyle = { 
  width: '100%', background: 'var(--surface2)', border: '1.5px solid var(--border)', 
  color: 'var(--text)', borderRadius: 12, padding: '11px 16px', fontSize: 14, 
  fontFamily: 'Outfit,sans-serif', outline: 'none' 
}
const labelStyle = { fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', marginBottom:8, display:'block' }
const delBtnStyle = { background:'none', border:'none', color:'#dc2626', fontSize:18, cursor:'pointer', fontWeight:900 }
const addBtnStyle = { 
  background:'var(--primary-l)', border:'none', color:'var(--primary)', 
  padding:'8px 16px', borderRadius:10, fontSize:12.5, fontWeight:800, 
  cursor:'pointer', marginTop:10 
}
