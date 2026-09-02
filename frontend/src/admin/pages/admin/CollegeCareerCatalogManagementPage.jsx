import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { Card, LevelBadge, DataTable, TR, TD, ActionBtn, FiltersRow, SearchInput, FilterSelect } from '../../components/UI'
import { FiPlus, FiEdit2, FiTrash2, FiBriefcase, FiZap, FiCheck, FiX } from 'react-icons/fi'

export default function CollegeCareerCatalogManagementPage() {
  const [careers, setCareers] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'Software & Computing',
    shortDescription: '',
    typicalWorkArea: '',
    requiredSkills: '',
    requiredDomains: '',
    growthOutlook: 'High Demand'
  })

  const fetchCareers = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/college-advisor/admin/careers')
      if (res.data?.success) {
        setCareers(res.data.careers || [])
      }
    } catch (err) {
      console.error('Failed to fetch college careers admin:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCareers()
  }, [])

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      title: '',
      category: 'Software & Computing',
      shortDescription: '',
      typicalWorkArea: '',
      requiredSkills: 'Python / Data Science, Problem Solving & Logic',
      requiredDomains: 'Computer Science, Information Technology',
      growthOutlook: 'High Demand'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (c) => {
    setFormData({
      id: c._id,
      title: c.title,
      category: c.category,
      shortDescription: c.shortDescription || '',
      typicalWorkArea: c.typicalWorkArea || '',
      requiredSkills: (c.requiredSkills || []).join(', '),
      requiredDomains: (c.requiredDomains || []).join(', '),
      growthOutlook: c.growthOutlook || 'High Demand'
    })
    setModalOpen(true)
  }

  const handleSaveCareer = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        requiredDomains: formData.requiredDomains.split(',').map(d => d.trim()).filter(Boolean)
      }
      const res = await axiosInstance.post('/college-advisor/admin/careers', payload)
      if (res.data?.success) {
        alert('Career saved successfully into database catalog!')
        setModalOpen(false)
        fetchCareers()
      }
    } catch (err) {
      alert('Failed to save career entity.')
    }
  }

  const handleDeleteCareer = async (id, title) => {
    if (!window.confirm(`Delete ${title} from career catalogue?`)) return
    try {
      await axiosInstance.delete(`/college-advisor/admin/careers/${id}`)
      setCareers(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      alert('Failed to delete career.')
    }
  }

  const filteredCareers = careers.filter(c => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      {/* ── FILTERS BAR ── */}
      <FiltersRow style={{ flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <SearchInput
          placeholder="🔍 Search career title or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />

        <FilterSelect value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Software & Computing">Software & Computing</option>
          <option value="AI & Data Science">AI & Data Science</option>
          <option value="Core Engineering">Core Engineering</option>
          <option value="R&D">R&D</option>
        </FilterSelect>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            marginLeft: 'auto', background: 'var(--primary)', color: '#fff', border: 'none',
            padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <FiPlus size={16} /> Create New College Career
        </button>
      </FiltersRow>

      {/* ── DATA TABLE ── */}
      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading college career catalogue...</div>
        ) : (
          <DataTable
            columns={['Career Title', 'Category', 'Required Skills Mapping', 'Matching Domains', 'Actions']}
            data={filteredCareers}
            renderRow={(c) => (
              <TR key={c._id}>
                <TD>
                  <div>
                    <strong style={{ color: 'var(--text)', fontSize: 14 }}>{c.title}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.growthOutlook || 'Active'}</div>
                  </div>
                </TD>

                <TD><LevelBadge level={c.category} /></TD>

                <TD>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {c.requiredSkills?.map(s => (
                      <span key={s} style={{ fontSize: 11, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </TD>

                <TD style={{ color: 'var(--text2)', fontSize: 12 }}>
                  {c.requiredDomains?.join(', ') || 'All Domains'}
                </TD>

                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn onClick={() => handleOpenEdit(c)}>
                      ✏️ Edit
                    </ActionBtn>
                    <ActionBtn danger onClick={() => handleDeleteCareer(c._id, c.title)}>
                      🗑
                    </ActionBtn>
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </Card>

      {/* ── CREATE / EDIT CAREER MODAL ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', borderRadius: 20, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                {formData.id ? 'Edit College Career Entity' : 'Create New College Career Entity'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSaveCareer} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Career Title *</label>
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Quantum Computing Engineer" required />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Category *</label>
                <select style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Software & Computing">Software & Computing</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="R&D">R&D</option>
                  <option value="Management & Strategy">Management & Strategy</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Short Overview Description</label>
                <textarea style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', minHeight: 70 }} value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief summary of role responsibilities..." />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Required Skills (Comma separated)</label>
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.requiredSkills} onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })} placeholder="Python / Data Science, AI & Machine Learning, Problem Solving" />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Associated Domains (Comma separated)</label>
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.requiredDomains} onChange={e => setFormData({ ...formData, requiredDomains: e.target.value })} placeholder="Computer Science, Information Technology, Robotics Engineering" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Career Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
