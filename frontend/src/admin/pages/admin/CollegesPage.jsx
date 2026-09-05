import React, { useState, useEffect, useCallback } from 'react'
import { Card, LevelBadge, DataTable, TR, TD, ActionBtn, FiltersRow, SearchInput, FilterSelect, PrimaryBtn, Modal, FormGrid, FormGroup, FormInput, FormActions } from '../../components/UI'
import { adminService } from '../../../services/adminService'
import { courseService } from '../../../services/courseService'

const STREAMS = ['All', 'Engineering', 'Medical', 'Arts & Science', 'Law', 'Commerce', 'Management', 'IT & Computer', 'Agriculture', 'Architecture', 'Design', 'Hotel Management', 'ITI', 'Polytechnic', 'Media & Journalism', 'Others']

const TN_DISTRICTS = [
  'All', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
]

const EMPTY_FORM = {
  collegeName: '',
  stream: 'Engineering',
  category: '',
  type: '',
  district: '',
  location: '',
  state: 'Tamil Nadu',
  feesPerYear: '',
  placementPercentage: '',
  rank: '',
  accreditation: '',
  coursesOffered: [],
  website: '',
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState([])
  const [courses, setCourses] = useState([]) // For selection
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeStream, setActiveStream] = useState('All')
  const [activeDistrict, setActiveDistrict] = useState('All')

  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Fetch courses state
  const [fetchModal, setFetchModal] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [fetchedCourses, setFetchedCourses] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [isBulkFetching, setIsBulkFetching] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)

  // ── Fetch dependencies ──
  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses()
      setCourses(res.data || [])
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    }
  }

  // ── Fetch colleges ──
  const fetchColleges = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeStream !== 'All') params.stream = activeStream
      if (activeDistrict !== 'All') params.district = activeDistrict
      if (search) params.search = search
      const res = await adminService.getColleges(params)
      setColleges(res.data || [])
    } catch (err) {
      console.error('Failed to fetch colleges:', err)
    } finally {
      setLoading(false)
    }
  }, [activeStream, activeDistrict, search])

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    const delay = setTimeout(fetchColleges, 300)
    return () => clearTimeout(delay)
  }, [fetchColleges])

  // ── Form helpers ──
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleCourse = (courseId) => {
    setForm(prev => {
      const exists = prev.coursesOffered.includes(courseId)
      if (exists) return { ...prev, coursesOffered: prev.coursesOffered.filter(id => id !== courseId) }
      return { ...prev, coursesOffered: [...prev.coursesOffered, courseId] }
    })
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModal(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    // Map existing courses if they are objects with _id
    const selectedIds = (c.coursesOffered || []).map(item => typeof item === 'object' ? item._id : item)
    setForm({
      collegeName: c.collegeName,
      stream: c.stream,
      category: c.category || '',
      type: c.type || '',
      district: c.district || '',
      location: c.location || '',
      state: c.state || 'Tamil Nadu',
      feesPerYear: c.feesPerYear || '',
      placementPercentage: c.placementPercentage || '',
      rank: c.rank || '',
      accreditation: c.accreditation || '',
      coursesOffered: selectedIds,
      website: c.website || ''
    })
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  // ── Save (Create / Update) ──
  const handleSave = async () => {
    if (!form.collegeName || !form.stream) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        feesPerYear: form.feesPerYear ? Number(form.feesPerYear) : 0,
        placementPercentage: form.placementPercentage ? Number(form.placementPercentage) : 0,
      }

      if (editing) {
        const res = await adminService.updateCollege(editing._id, payload)
        fetchColleges() // Refresh list
      } else {
        const res = await adminService.createCollege(payload)
        fetchColleges() // Refresh list
      }
      closeModal()
    } catch (err) {
      console.error('Save college error:', err)
      alert(err.response?.data?.message || 'Failed to save college')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await adminService.deleteCollege(id)
      setColleges(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      console.error('Delete college error:', err)
      alert('Failed to delete college')
    }
  }

  // ── Automated Course Fetching ──
  const handleFetchCourses = async (college) => {
    if (!college.website) {
      alert("Please add a website URL for this college first.")
      return
    }

    setIsFetching(true)
    try {
      const res = await adminService.fetchCollegeCourses(college._id)
      alert(res.message || "Courses fetched successfully")
      fetchColleges() // Refresh to update status and count
      
      // Optionally open view modal
      handleViewCourses(college)
    } catch (err) {
      console.error('Fetch courses error:', err)
      alert(err.response?.data?.message || 'Failed to fetch courses')
    } finally {
      setIsFetching(false)
    }
  }

  const handleViewCourses = async (college) => {
    setSelectedCollege(college)
    setFetchLoading(true)
    setFetchModal(true)
    try {
      const res = await adminService.getFetchedCourses(college._id)
      setFetchedCourses(res.data || [])
    } catch (err) {
      console.error('Get fetched courses error:', err)
      alert('Failed to load courses')
    } finally {
      setFetchLoading(false)
    }
  }

  const closeFetchModal = () => {
    setFetchModal(false)
    setFetchedCourses([])
    setSelectedCollege(null)
  }

  const handleBulkFetch = async () => {
    if (!window.confirm("This will fetch courses for ALL colleges with a website. This might take some time and overwrite auto-mapped data. Proceed?")) return
    
    setIsBulkFetching(true)
    try {
      const res = await adminService.bulkFetchAllCollegeCourses()
      alert(res.message)
      fetchColleges()
    } catch (err) {
      console.error('Bulk fetch error:', err)
      alert(err.response?.data?.message || 'Bulk fetch failed')
    } finally {
      setIsBulkFetching(false)
    }
  }

  const formatFees = (n) => {
    if (!n) return '\u2014'
    if (n >= 100000) return `\u20B9${(n / 100000).toFixed(1)}L/yr`
    if (n >= 1000) return `\u20B9${(n / 1000).toFixed(1)}K/yr`
    return `\u20B9${n}/yr`
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {STREAMS.map(s => (
          <button key={s} onClick={() => setActiveStream(s)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              border: activeStream === s ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
              background: activeStream === s ? 'var(--primary)' : 'var(--surface)',
              color: activeStream === s ? '#fff' : 'var(--text2)',
            }}>
            {s}
          </button>
        ))}
      </div>

      <FiltersRow>
        <SearchInput placeholder="🔍 Search colleges..." value={search} onChange={e => setSearch(e.target.value)} />
        <FilterSelect value={activeDistrict} onChange={e => setActiveDistrict(e.target.value)}>
          {TN_DISTRICTS.map(d => (
            <option key={d} value={d}>{d === 'All' ? '📍 All Districts' : d}</option>
          ))}
        </FilterSelect>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <ActionBtn 
            onClick={handleBulkFetch} 
            disabled={isBulkFetching}
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            {isBulkFetching ? '🔄 Processing...' : '🤖 Bulk Sync All'}
          </ActionBtn>
          <PrimaryBtn onClick={openAdd}>+ Add College</PrimaryBtn>
        </div>
      </FiltersRow>

      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading colleges...</div>
        ) : colleges.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No colleges found</div>
        ) : (
          <DataTable
            columns={['College Name', 'Stream', 'District', 'Location', 'Auto Fetch', 'Actions']}
            data={colleges}
            renderRow={(c) => (
              <TR key={c._id}>
                <TD>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.collegeName}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{c.website || 'No website'}</div>
                </TD>
                <TD><LevelBadge level={c.stream} /></TD>
                <TD style={{ color: 'var(--text2)' }}>{c.district || '\u2014'}</TD>
                <TD style={{ color: 'var(--text3)' }}>{c.location || '\u2014'}</TD>
                <TD>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ActionBtn 
                          title="Fetch from Website" 
                          onClick={() => handleFetchCourses(c)}
                          disabled={isFetching || !c.website}
                        >
                          {c.fetchStatus === 'pending' ? '⏳' : '📥'}
                        </ActionBtn>
                        <ActionBtn 
                          title="View Fetched" 
                          onClick={() => handleViewCourses(c)}
                        >
                          👁️
                        </ActionBtn>
                      </div>
                      {c.fetchStatus && c.fetchStatus !== 'ideal' && (
                        <div style={{ 
                          fontSize: 10, 
                          color: c.fetchStatus === 'success' ? '#10b981' : c.fetchStatus === 'failed' ? '#ef4444' : '#f59e0b',
                          fontWeight: 600
                        }}>
                          {c.fetchStatus.toUpperCase()} {c.totalCoursesFound > 0 && `(${c.totalCoursesFound})`}
                        </div>
                      )}
                   </div>
                </TD>
                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn onClick={() => openEdit(c)}>✏️</ActionBtn>
                    <ActionBtn danger onClick={() => handleDelete(c._id, c.collegeName)}>🗑</ActionBtn>
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </Card>

      {modal && (
        <Modal title={editing ? 'Edit College' : 'Add New College'} onClose={closeModal}>
          <FormGrid>
            <FormGroup label="College Name" full>
              <FormInput name="collegeName" value={form.collegeName} onChange={handleChange} placeholder="e.g. SRM IST" />
            </FormGroup>
            <FormGroup label="Stream">
              <FilterSelect name="stream" value={form.stream} onChange={handleChange} style={{ width:'100%' }}>
                {STREAMS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
              </FilterSelect>
            </FormGroup>
            <FormGroup label="Type (Govt/Private)">
               <FormInput name="type" value={form.type} onChange={handleChange} placeholder="e.g. Govt / Private / Deemed" />
            </FormGroup>
            <FormGroup label="Institutional Category">
               <FormInput name="category" value={form.category} onChange={handleChange} placeholder="e.g. Co-Ed / Women / Minority" />
            </FormGroup>
            <FormGroup label="District">
               <FilterSelect name="district" value={form.district} onChange={handleChange} style={{ width:'100%' }}>
                  <option value="">Select District</option>
                  {TN_DISTRICTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
               </FilterSelect>
            </FormGroup>
            <FormGroup label="Location">
              <FormInput name="location" value={form.location} onChange={handleChange} placeholder="e.g. Kattankulathur" />
            </FormGroup>
            <FormGroup label="Website URL">
              <FormInput name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
            </FormGroup>
            <FormGroup label="Fees/yr" >
              <FormInput name="feesPerYear" value={form.feesPerYear} onChange={handleChange} type="number" />
            </FormGroup>

            <FormGroup label="Map Offered Courses (Select Below)" full>
               <div style={{ 
                 maxHeight: 200, overflowY: 'auto', border: '1.5px solid var(--border)', 
                 borderRadius: 16, padding: 12, background: 'var(--surface2)',
                 display:'grid', gridTemplateColumns:'1fr 1fr', gap:8
               }}>
                  {courses.map(course => (
                    <label key={course._id} style={{ 
                      fontSize: 12, display:'flex', alignItems:'center', gap:8, 
                      cursor:'pointer', padding:4, borderRadius:6,
                      background: form.coursesOffered.includes(course._id) ? 'var(--primary-l)' : 'transparent'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={form.coursesOffered.includes(course._id)} 
                        onChange={() => toggleCourse(course._id)}
                      />
                      {course.courseName}
                    </label>
                  ))}
               </div>
            </FormGroup>
          </FormGrid>
          <FormActions
            onClose={closeModal}
            onSave={handleSave}
            saveDisabled={saving}
            saveText={saving ? 'Saving...' : editing ? 'Update College' : 'Add College'}
          />
        </Modal>
      )}
      {fetchModal && (
        <Modal 
          title={`Courses for ${selectedCollege?.collegeName}`} 
          onClose={closeFetchModal}
          width="600px"
        >
          {fetchLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading fetched courses...</div>
          ) : fetchedCourses.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ color: 'var(--text3)', marginBottom: 16 }}>No courses found for this college yet.</div>
              <PrimaryBtn onClick={() => handleFetchCourses(selectedCollege)} disabled={isFetching}>
                {isFetching ? 'Fetching...' : 'Start Fetching Now'}
              </PrimaryBtn>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 16, padding: '10px 16px', background: 'var(--primary-l)', borderRadius: 12, border: '1px solid var(--primary-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  Total Courses Identified: {fetchedCourses.length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Last Checked: {selectedCollege?.lastFetchedAt ? new Date(selectedCollege.lastFetchedAt).toLocaleString() : 'Just now'}
                </div>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
                <DataTable
                  columns={['Full Name', 'Code', 'Status']}
                  data={fetchedCourses}
                  renderRow={(rc) => (
                    <TR key={rc._id}>
                      <TD style={{ fontWeight: 600 }}>{rc.courseFullName}</TD>
                      <TD><LevelBadge level={rc.normalizedCourseName} /></TD>
                      <TD>
                        <span style={{ 
                          fontSize: 10, padding: '2px 8px', borderRadius: 10,
                          background: rc.isActive ? '#dcfce7' : '#fee2e2',
                          color: rc.isActive ? '#166534' : '#991b1b',
                          fontWeight: 700
                        }}>
                          {rc.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </TD>
                    </TR>
                  )}
                />
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <ActionBtn onClick={closeFetchModal}>Close</ActionBtn>
                <PrimaryBtn onClick={() => handleFetchCourses(selectedCollege)} disabled={isFetching}>
                  {isFetching ? 'Syncing...' : 'Sync Now'}
                </PrimaryBtn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
