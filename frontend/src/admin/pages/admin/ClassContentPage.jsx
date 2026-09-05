import React, { useState, useEffect } from 'react'
import { 
  Card, ActionBtn, PrimaryBtn, Modal, FormGrid, FormGroup, FormInput, FormActions, 
  DataTable, TR, TD, SearchInput, FilterSelect, Toggle 
} from '../../components/UI'
import { classContentService } from '../../../services/classContentService'
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiCheckCircle, FiFileText, FiTarget, FiActivity, FiVideo, FiStar, FiHeart } from 'react-icons/fi'

const SECTION_OPTIONS = [
  { value: 'Foundation', label: '1. Foundation Building', icon: FiFileText, color: '#6366f1' },
  { value: 'Scholarships', label: '2. Scholarships & Exams', icon: FiAward, color: '#f59e0b' },
  { value: 'Activities', label: '3. Learning Activities', icon: FiActivity, color: '#ec4899' },
  { value: 'Skill Development', label: '4. Skill Development', icon: FiTarget, color: '#10b981' },
  { value: 'Fun Learning', label: '5. Fun & Games', icon: FiStar, color: '#8b5cf6' },
  { value: 'Videos', label: '6. Recommended Videos', icon: FiVideo, color: '#ef4444' },
  { value: 'Career Awareness', label: '7. Career Awareness', icon: FiBriefcase, color: '#3b82f6' },
  { value: 'Motivation', label: '8. Motivation & Tips', icon: FiHeart, color: '#f43f5e' },
]

// Note: FiAward and FiBriefcase might not be imported from Fi, let's substitute or ensure they're available
import { FiAward, FiBriefcase } from 'react-icons/fi'

export default function ClassContentPage() {
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSection, setFilterSection] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    targetClass: '5',
    sectionType: 'Foundation',
    category: '',
    shortDescription: '',
    fullDescription: '',
    image: '',
    isFeatured: false,
    status: 'published',
    displayOrder: 0,
    tags: '',
    youtubeUrl: '', // helper field
  })

  const [message, setMessage] = useState({ type: '', text: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      setLoading(true)
      const res = await classContentService.getAllAdmin({ targetClass: '5' })
      if (res.success) setContents(res.data)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load content' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleAddNew = () => {
    setFormData({
      title: '',
      targetClass: '5',
      sectionType: 'Foundation',
      category: '',
      shortDescription: '',
      fullDescription: '',
      image: '',
      isFeatured: false,
      status: 'published',
      displayOrder: contents.length + 1,
      tags: '',
      youtubeUrl: '',
    })
    setIsEditing(false)
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setFormData({
      ...item,
      tags: (item.tags || []).join(', '),
      youtubeUrl: item.youtubeLinks?.[0]?.url || '',
    })
    setIsEditing(true)
    setCurrentId(item._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content permanently?')) return
    try {
      const res = await classContentService.deleteContent(id)
      if (res.success) {
        setMessage({ type: 'success', text: 'Content deleted' })
        fetchContents()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed' })
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        youtubeLinks: formData.youtubeUrl ? [{ url: formData.youtubeUrl, title: formData.title }] : []
      }

      const res = isEditing 
        ? await classContentService.updateContent(currentId, payload)
        : await classContentService.createContent(payload)

      if (res.success) {
        setMessage({ type: 'success', text: isEditing ? 'Updated successfully' : 'Created successfully' })
        fetchContents()
        setShowModal(false)
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed' })
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = contents.filter(c => 
    (!search || c.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterSection || c.sectionType === filterSection)
  )

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:'var(--text)', margin:0 }}>Class 5 Content Library</h1>
          <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Comprehensive guidance, activities, and resources for 5th graders.</p>
        </div>
        <PrimaryBtn onClick={handleAddNew}>+ Add New Module</PrimaryBtn>
      </div>

      {message.text && (
        <div style={{ padding: 12, marginBottom: 16, background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', borderRadius: 8 }}>
          {message.text}
        </div>
      )}

      <Card>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title..." />
          <FilterSelect value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="">All Sections</option>
            {SECTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label.split('. ')[1]}</option>)}
          </FilterSelect>
        </div>

        {loading ? <div style={{ padding:40, textAlign:'center' }}>Loading Library...</div> : (
          <DataTable 
            columns={['DISPLAY', 'TITLE / CATEGORY', 'SECTION', 'STATUS', 'ACTIONS']}
            data={filtered}
            renderRow={(item) => (
              <TR key={item._id}>
                <TD style={{ width:60, fontWeight:700, color:'var(--text3)' }}>#{item.displayOrder}</TD>
                <TD>
                  <div style={{ fontWeight:700, color:'var(--text)' }}>{item.title}</div>
                  <div style={{ fontSize:11, color:'var(--accent)', fontWeight:600 }}>{item.category}</div>
                </TD>
                <TD>
                  <span style={{ fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'var(--surface2)', color:'var(--text2)' }}>
                    {item.sectionType}
                  </span>
                </TD>
                <TD>
                  <span style={{ fontSize:10, textTransform:'uppercase', fontWeight:800, padding:'2px 8px', borderRadius:4, background: item.status === 'published' ? '#dcfce7' : '#f3f4f6', color: item.status === 'published' ? '#166534' : '#374151' }}>
                    {item.status}
                  </span>
                  {item.isFeatured && <span style={{ marginLeft:6, color:'#f59e0b' }}><FiStar size={12} fill="#f59e0b" /></span>}
                </TD>
                <TD>
                  <div style={{ display:'flex', gap:8 }}>
                    <ActionBtn onClick={() => handleEdit(item)}><FiEdit2 size={13} /></ActionBtn>
                    <ActionBtn onClick={() => handleDelete(item._id)} danger><FiTrash2 size={13} /></ActionBtn>
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </Card>

      {showModal && (
        <Modal title={isEditing ? 'Edit Content Module' : 'Create Content Module'} onClose={() => setShowModal(false)}>
          <FormGrid>
            <FormGroup label="Content Title" full>
              <FormInput name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Master Basic Multiplication" />
            </FormGroup>
            
            <FormGroup label="Section Type">
              <select name="sectionType" value={formData.sectionType} onChange={handleInputChange} style={{ width:'100%', background:'var(--surface2)', border:'1.5px solid var(--border)', color:'var(--text)', borderRadius:10, padding:'9px 12px' }}>
                {SECTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Sub-Category">
              <FormInput name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Maths Mastery" />
            </FormGroup>

            <FormGroup label="Short Intro" full>
              <FormInput as="textarea" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} placeholder="Visible in card..." />
            </FormGroup>

            <FormGroup label="Full Guidance / Content" full>
              <FormInput as="textarea" name="fullDescription" value={formData.fullDescription} onChange={handleInputChange} placeholder="Detailed content for reader..." style={{ minHeight:150 }} />
            </FormGroup>

            <FormGroup label="Image URL">
              <FormInput name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
            </FormGroup>

            <FormGroup label="YouTube Link">
              <FormInput name="youtubeUrl" value={formData.youtubeUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." />
            </FormGroup>

            <FormGroup label="Tags (comma-separated)" full>
               <FormInput name="tags" value={formData.tags} onChange={handleInputChange} placeholder="puzzle, curiosity, basics" />
            </FormGroup>

            <div style={{ gridColumn:'1/-1', display:'flex', gap:30, alignItems:'center', background:'var(--surface2)', padding:'12px 16px', borderRadius:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                   <Toggle on={formData.isFeatured} onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })} />
                   <span style={{ fontSize:13, fontWeight:600 }}>Feature on Landing</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                   <Toggle on={formData.status === 'published'} onClick={() => setFormData({ ...formData, status: formData.status === 'published' ? 'draft' : 'published' })} />
                   <span style={{ fontSize:13, fontWeight:600 }}>Published</span>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
                   <span style={{ fontSize:13, fontWeight:600 }}>Order:</span>
                   <FormInput type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} style={{ width:60 }} />
                </div>
            </div>
          </FormGrid>
          <FormActions onSave={handleSubmit} onClose={() => setShowModal(false)} saveDisabled={submitting} saveText={submitting ? 'Saving...' : 'Save Module'} />
        </Modal>
      )}
    </div>
  )
}
