import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import {
  FiSearch, FiPlus, FiUpload, FiEdit2, FiTrash2, FiExternalLink,
  FiFilter, FiCheckCircle, FiBookOpen, FiDollarSign, FiCalendar, FiAward
} from 'react-icons/fi'

const API_ROUTE = "/college-scholarships"

const CATEGORIES = [
  "Government Scholarship",
  "Private Scholarship",
  "Merit-Based",
  "Need-Based",
  "Women in Education",
  "Minority / Community Schemes",
  "Research Scholarship",
  "Technical Education Scholarship",
  "Engineering Scholarship",
  "Medical Scholarship",
  "Management Scholarship",
  "Law Scholarship",
  "Design Scholarship",
  "General Higher Education Scholarship"
]

const FIELDS = [
  "All",
  "Engineering & Technology",
  "Medicine & Health Sciences",
  "Design & Creative Arts",
  "Law & Legal Studies",
  "Management & Business Administration",
  "Hospitality & Tourism",
  "Pharmacy & Pharmaceutical Sciences",
  "Arts & Social Sciences",
  "Pure Sciences",
  "Agriculture & Veterinary Sciences",
  "Education & Teaching",
  "Commerce & Accountancy",
  "Mass Communication & Journalism"
]

export default function CollegeScholarshipsPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterField, setFilterField] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modal State
  const [modal, setModal] = useState({ open: false, isEdit: false, data: null })
  const [uploadModal, setUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState(null)
  const [rawCsvText, setRawCsvText] = useState('')

  const initialFormState = {
    scholarshipName: '',
    provider: 'Government of India / State Govt',
    category: 'Government Scholarship',
    benefit: '₹25,000 / Year',
    description: '',
    applicationLink: '',
    deadline: '',
    status: 'published',
    eligibleFields: ['All'],
    eligibleDegrees: ['All'],
    eligibleDomains: ['All'],
    eligibleYears: ['All'],
    minCGPA: 'No minimum CGPA criteria',
    familyIncomeLimit: 'No family income limit',
    additionalEligibility: '',
    termsAndConditions: 'Must be actively enrolled in a recognized college.'
  }

  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(API_ROUTE, { params: { status: 'all' } })
      if (res.data?.success) {
        setScholarships(res.data.scholarships || [])
      }
    } catch (err) {
      console.error("Error fetching college scholarships:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        ...item,
        eligibleFields: item.eligibleFields || ['All'],
        eligibleDegrees: item.eligibleDegrees || ['All'],
        eligibleDomains: item.eligibleDomains || ['All'],
        eligibleYears: item.eligibleYears || ['All']
      })
      setModal({ open: true, isEdit: true, data: item })
    } else {
      setFormData(initialFormState)
      setModal({ open: true, isEdit: false, data: null })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modal.isEdit) {
        await axiosInstance.put(`${API_ROUTE}/${modal.data._id}`, formData)
      } else {
        await axiosInstance.post(API_ROUTE, formData)
      }
      setModal({ open: false, isEdit: false, data: null })
      fetchScholarships()
    } catch (err) {
      alert("Failed to save: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college scholarship?")) return
    try {
      await axiosInstance.delete(`${API_ROUTE}/${id}`)
      fetchScholarships()
    } catch (err) {
      alert("Failed to delete scholarship")
    }
  }

  const handleBulkImport = async () => {
    if (!rawCsvText.trim()) {
      alert("Please paste CSV or JSON data first")
      return
    }
    setUploading(true)
    setUploadFeedback(null)
    try {
      // Simple CSV parser
      const lines = rawCsvText.trim().split("\n")
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''))
      
      const parsedData = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''))
        const obj = {}
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || ""
        })
        if (obj.scholarshipName || obj.name) {
          parsedData.push({
            scholarshipName: obj.scholarshipName || obj.name,
            provider: obj.provider || "Government / Trust",
            category: obj.category || "Government Scholarship",
            benefit: obj.benefit || "Tuition Assistance",
            description: obj.description || "",
            applicationLink: obj.applicationLink || obj.link || "",
            deadline: obj.deadline || "",
            eligibleFields: obj.eligibleFields || obj.field || "All",
            eligibleDegrees: obj.eligibleDegrees || obj.degree || "All",
            minCGPA: obj.minCGPA || "No minimum CGPA criteria",
            familyIncomeLimit: obj.familyIncomeLimit || "No family income limit"
          })
        }
      }

      const res = await axiosInstance.post(`${API_ROUTE}/import`, { scholarshipsData: parsedData })
      if (res.data?.success) {
        setUploadFeedback(res.data.message)
        fetchScholarships()
        setTimeout(() => {
          setUploadModal(false)
          setUploadFeedback(null)
          setRawCsvText('')
        }, 2000)
      }
    } catch (err) {
      setUploadFeedback("Import failed: " + (err.response?.data?.message || err.message))
    } finally {
      setUploading(false)
    }
  }

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = (s.scholarshipName || "").toLowerCase().includes(search.toLowerCase()) ||
                          (s.provider || "").toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === "all" || s.category === filterCategory
    const matchesField = filterField === "all" || (s.eligibleFields || []).includes(filterField) || (s.eligibleFields || []).includes("All")
    const matchesStatus = filterStatus === "all" || s.status === filterStatus
    return matchesSearch && matchesCategory && matchesField && matchesStatus
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header Banner */}
      <div style={{
        padding: '24px 28px', background: 'linear-gradient(135deg, #0b1329 0%, #1e293b 100%)',
        color: '#fff', borderRadius: 20, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎓 College Financial Schemes
          </div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 900, fontFamily: 'var(--s-font-display)', color: '#fff' }}>
            College Scholarship Management
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            Manage higher education scholarships, AI profile eligibility criteria, deadlines, and CSV imports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setUploadModal(true)}
            style={{
              padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.1)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <FiUpload size={16} /> Import CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '10px 20px', borderRadius: 12, background: '#0284c7', color: '#fff',
              border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <FiPlus size={16} /> Add College Scholarship
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{
        background: '#fff', padding: 18, borderRadius: 16, border: '1px solid #e2e8f0',
        display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search scholarship name or provider..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
              border: '1px solid #cbd5e1', fontSize: 13, outline: 'none'
            }}
          />
          <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} size={16} />
        </div>

        <select
          value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterField} onChange={e => setFilterField(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
        >
          <option value="all">All Academic Fields</option>
          {FIELDS.filter(f => f !== 'All').map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* College Scholarships Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            Loading college scholarships...
          </div>
        ) : filteredScholarships.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>No College Scholarships Found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing search or category filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Scholarship & Provider</th>
                  <th style={{ padding: '14px 14px' }}>Category</th>
                  <th style={{ padding: '14px 14px' }}>Benefit Amount</th>
                  <th style={{ padding: '14px 14px' }}>Eligible Fields</th>
                  <th style={{ padding: '14px 14px' }}>Deadline</th>
                  <th style={{ padding: '14px 14px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScholarships.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{item.scholarshipName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.provider}</div>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', fontWeight: 800, color: '#0284c7' }}>
                      {item.benefit}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(item.eligibleFields || []).map(f => (
                          <span key={f} style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px', color: '#475569', fontWeight: 600 }}>
                      {item.deadline || 'Ongoing'}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800,
                        background: item.status === 'published' ? '#dcfce7' : '#fee2e2',
                        color: item.status === 'published' ? '#15803d' : '#b91c1c'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenModal(item)} title="Edit"
                          style={{ padding: 6, borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', color: '#334155' }}
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)} title="Delete"
                          style={{ padding: 6, borderRadius: 8, background: '#fef2f2', border: '1px solid #fca5a5', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                        {item.applicationLink && (
                          <button
                            onClick={() => window.open(item.applicationLink, '_blank')} title="Test Link"
                            style={{ padding: 6, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', cursor: 'pointer', color: '#0284c7' }}
                          >
                            <FiExternalLink size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modal.open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form onSubmit={handleSubmit} style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 780,
            maxHeight: '90vh', overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
                {modal.isEdit ? "Edit College Scholarship" : "Add College Scholarship"}
              </h3>
              <button type="button" onClick={() => setModal({ open: false, isEdit: false, data: null })} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Scholarship Name *</label>
                <input
                  type="text" required value={formData.scholarshipName}
                  onChange={e => setFormData({ ...formData, scholarshipName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Provider / Organization</label>
                <input
                  type="text" value={formData.provider}
                  onChange={e => setFormData({ ...formData, provider: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Category</label>
                <select
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Benefit Amount</label>
                <input
                  type="text" value={formData.benefit} placeholder="e.g. ₹50,000 / Year"
                  onChange={e => setFormData({ ...formData, benefit: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Application Deadline</label>
                <input
                  type="text" value={formData.deadline} placeholder="e.g. 31st October 2026"
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Minimum CGPA / Marks</label>
                <input
                  type="text" value={formData.minCGPA} placeholder="e.g. 7.5 CGPA or 75%"
                  onChange={e => setFormData({ ...formData, minCGPA: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Family Income Limit</label>
                <input
                  type="text" value={formData.familyIncomeLimit} placeholder="e.g. Below ₹5,00,000 per annum"
                  onChange={e => setFormData({ ...formData, familyIncomeLimit: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Application Portal Link</label>
                <input
                  type="text" value={formData.applicationLink} placeholder="https://scholarships.gov.in/..."
                  onChange={e => setFormData({ ...formData, applicationLink: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Eligible Academic Fields (comma separated)</label>
                <input
                  type="text" value={Array.isArray(formData.eligibleFields) ? formData.eligibleFields.join(', ') : formData.eligibleFields}
                  onChange={e => setFormData({ ...formData, eligibleFields: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="Engineering & Technology, Medicine... or All"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Visibility Status</label>
                <select
                  value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="published">Published (Visible to Students)</option>
                  <option value="active">Active (Internal Use)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Detailed Description</label>
                <textarea
                  rows={3} value={formData.description} placeholder="Describe the scheme goals, eligibility, and benefits..."
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 4 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button" onClick={() => setModal({ open: false, isEdit: false, data: null })}
                style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#0284c7', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                {modal.isEdit ? 'Update Scholarship' : 'Publish Scholarship'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {uploadModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540,
            padding: 28, display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Import College Scholarships via CSV</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Paste raw CSV text below with headers: <code>scholarshipName, provider, category, benefit, eligibleFields, deadline</code>
            </p>

            {uploadFeedback && (
              <div style={{ padding: 12, background: '#f0fdf4', color: '#166534', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                {uploadFeedback}
              </div>
            )}

            <textarea
              rows={8}
              placeholder={`scholarshipName,provider,category,benefit,eligibleFields,deadline\n"AICTE Pragati","AICTE","Women in Education","₹50,000","Engineering & Technology","15th Nov 2026"`}
              value={rawCsvText}
              onChange={e => setRawCsvText(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button" onClick={() => setUploadModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleBulkImport} disabled={uploading}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {uploading ? 'Processing...' : 'Run Import'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
