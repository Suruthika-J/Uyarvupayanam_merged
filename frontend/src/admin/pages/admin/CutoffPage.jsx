import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, DataTable, TR, TD, ActionBtn, FiltersRow, FilterSelect, PrimaryBtn, Modal, FormGrid, FormGroup, FormInput, FormActions, SBtn, SearchInput, SLoader, SBadge } from '../../components/UI'
import { cutoffService } from '../../../services/cutoffService'
import { courseService } from '../../../services/courseService'
import { adminService } from '../../../services/adminService'
import { FiDownload, FiTrash2, FiChevronDown, FiRefreshCw } from 'react-icons/fi'
import axiosInstance from '../../../config/axios'

export default function CutoffPage() {
  const [cutoffs, setCutoffs] = useState([])
  const [courses, setCourses] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2024')
  const [search, setSearch] = useState('')
  
  // Modal state
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [collegeSearch, setCollegeSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  
  const [form, setForm] = useState({
    courseId: '', collegeId: '', year: 2025, round: 'Round 1',
    cutoffData: [
      { category: 'OC', score: '' }, { category: 'BC', score: '' },
      { category: 'BCM', score: '' }, { category: 'MBC', score: '' },
      { category: 'SC', score: '' }, { category: 'SCA', score: '' },
      { category: 'ST', score: '' }
    ],
    downloadUrl: ''
  })

  const fetchDependencies = async () => {
    try {
      const [cRes, clRes] = await Promise.all([
        courseService.getAllCourses(),
        adminService.getColleges()
      ])
      setCourses(cRes.data || [])
      setColleges(clRes.data || [])
    } catch (err) {
      console.error('Failed to fetch dependencies:', err)
    }
  }

  const fetchCutoffs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await cutoffService.getCutoffs({ year: selectedYear })
      setCutoffs(res.data || [])
    } catch (err) {
      console.error('Failed to fetch cutoffs:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchDependencies()
  }, [])

  useEffect(() => {
    fetchCutoffs()
  }, [fetchCutoffs])

  const [sortField, setSortField] = useState('collegeId.collegeName')
  const [sortDir, setSortDir] = useState('asc')

  const filteredCutoffs = useMemo(() => {
    let list = [...cutoffs].filter(c => {
      const colName = (c.collegeId?.collegeName || c.collegeName || c.college || '').toLowerCase()
      const crsName = (c.courseId?.courseName || c.department || c.course || '').toLowerCase()
      const searchLower = search.toLowerCase()
      return colName.includes(searchLower) || crsName.includes(searchLower)
    })

    return list.sort((a,b) => {
      const getVal = (obj, field) => {
        if(field.includes('.')) return field.split('.').reduce((o,i)=>o?.[i], obj) || ''
        const foundScore = obj.cutoffData?.find(d => d.category?.toUpperCase() === field.toUpperCase())?.score
        if (foundScore !== undefined && foundScore !== null) return Number(foundScore)
        const legacyVal = obj[field.toLowerCase()]
        return (legacyVal !== undefined && legacyVal !== null) ? Number(legacyVal) : 0
      }
      const vA = getVal(a, sortField); const vB = getVal(b, sortField)
      const res = vA < vB ? -1 : (vA > vB ? 1 : 0)
      return sortDir === 'asc' ? res : -res
    })
  }, [cutoffs, search, sortField, sortDir])

  const toggleSort = (f) => {
     if(sortField === f) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
     else { setSortField(f); setSortDir('asc'); }
  }

  const handleSave = async () => {
    if (!form.courseId || !form.collegeId) {
      alert('Please select both college and course');
      return;
    }
    try {
      setSaving(true)
      if (editing) {
          await cutoffService.updateCutoff(editing._id, form)
      } else {
          await cutoffService.createCutoff(form)
      }
      fetchCutoffs()
      setModal(false)
      setEditing(null)
      setForm({
        courseId: '', collegeId: '', year: 2025, round: 'Round 1',
        cutoffData: [
            { category: 'OC', score: '' }, { category: 'BC', score: '' },
            { category: 'BCM', score: '' }, { category: 'MBC', score: '' },
            { category: 'SC', score: '' }, { category: 'SCA', score: '' },
            { category: 'ST', score: '' }
        ],
        downloadUrl: ''
      })
    } catch (err) {
      alert('Failed to save cutoff data')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cutoff entry?')) return
    try {
      await cutoffService.deleteCutoff(id)
      fetchCutoffs()
    } catch (err) {
      alert('Failed to delete cutoff record')
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const res = await axiosInstance.post('/cutoffs/sync-orphans')
      alert(`Successfully synced ${res.data.count || 0} records!`)
      fetchCutoffs()
    } catch (err) {
      alert('Failed to sync records')
    } finally {
      setSyncing(false)
    }
  }

  const filteredModalColleges = useMemo(() => {
    if (!collegeSearch) return colleges.slice(0, 50)
    return colleges.filter(c => 
      c.collegeName.toLowerCase().includes(collegeSearch.toLowerCase()) || 
      c.collegeCode?.includes(collegeSearch)
    ).slice(0, 50)
  }, [colleges, collegeSearch])

  const handleExport = () => {
    const headers = ['College', 'Course', 'Year', 'OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST'];
    const rows = filteredCutoffs.map(r => {
      const getScore = (cat) => {
        const found = r.cutoffData?.find(d => d.category.toUpperCase() === cat.toUpperCase());
        return found ? found.score : (r[cat.toLowerCase()] || '-');
      }
      return [
        r.collegeId?.collegeName || r.collegeName || r.college || '',
        r.courseId?.courseName || r.course || '',
        r.year,
        getScore('OC'), getScore('BC'), getScore('BCM'), getScore('MBC'), getScore('SC'), getScore('SCA'), getScore('ST')
      ]
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TNEA_Cutoff_${selectedYear}.csv`;
    a.click();
  }

  const renderCategoryScore = (item, cat) => {
    const found = item.cutoffData?.find(d => d.category.toUpperCase() === cat.toUpperCase());
    if (found) return found.score;
    const legacy = item[cat.toLowerCase()];
    return (legacy === undefined || legacy === null || legacy === '')  ? '-' : legacy;
  }

  return (
    <div style={{ animation:'fadeUp 0.4s ease both', padding: '0 10px' }}>
      
      <FiltersRow style={{ background: '#fff', padding: '16px 24px', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: 24, border: '1px solid var(--border)' }}>
        <div style={{ flex: 1 }}>
           <SearchInput 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search colleges by name or location or branch . . ." 
              style={{ width: '100%', maxWidth: 500, borderRadius: 99, background: '#f8fafc' }} 
           />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
           <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'var(--text2)' }}>
              Cutoffs <FiChevronDown />
           </div>
           <FilterSelect value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ borderRadius: 99, padding: '8px 20px' }}>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
           </FilterSelect>
           <SBtn variant="outline" onClick={handleExport} style={{ borderRadius: 99, background: '#fff' }}>
              <FiDownload /> Export
           </SBtn>
           <SBtn variant="outline" onClick={handleSync} loading={syncing} style={{ borderRadius: 99, background: '#fff' }}>
              <FiRefreshCw className={syncing ? 's-anim-spin' : ''} /> Sync Records
           </SBtn>
           <PrimaryBtn onClick={()=>{ setEditing(null); setModal(true); }} style={{ borderRadius: 99 }}>
              + Add Cutoff Entry
           </PrimaryBtn>
        </div>
      </FiltersRow>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div style={{ padding:60 }}><SLoader /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1.5px solid var(--border)' }}>
                  <th onClick={() => toggleSort('collegeId.collegeName')} style={{ padding: '20px 24px', textAlign: 'left', width: 450, cursor: 'pointer' }}>
                     College Name {sortField === 'collegeId.collegeName' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                  </th>
                  <th onClick={() => toggleSort('courseId.courseName')} style={{ padding: '20px 24px', textAlign: 'left', cursor: 'pointer' }}>
                     Branch {sortField === 'courseId.courseName' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                  </th>
                  {['OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST'].map(cat => (
                    <th key={cat} onClick={() => toggleSort(cat)} style={{ padding: '20px 10px', textAlign: 'center', cursor: 'pointer' }}>
                       {cat} {sortField === cat ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </th>
                  ))}
                  <th style={{ padding: '20px 24px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCutoffs.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="admin-table-row">
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ textAlign:'left' }}>
                           <span style={{ fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 4, lineHeight: 1.4 }}>
                            {r.collegeId?.collegeName || r.collegeName || r.college || 'N/A'}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
                             ({r.collegeId?.collegeCode || r.collegeCode || r.coc || '—'})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text2)' }}>
                        {r.courseId?.courseName || r.department || r.course || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', marginTop: 4, textTransform: 'uppercase' }}>
                        {r.courseId?.branchCode || r.branchCode || r.brc || '—'}
                      </div>
                    </td>
                    {['OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST'].map(cat => (
                      <td key={cat} style={{ padding: '24px 10px', textAlign: 'center', fontWeight: 800, color: 'var(--text)' }}>
                         {renderCategoryScore(r, cat)}
                      </td>
                    ))}
                    <td style={{ padding: '24px', textAlign: 'center' }}>
                       <ActionBtn danger onClick={() => handleDelete(r._id)}>
                          <FiTrash2 size={14} />
                       </ActionBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={editing ? 'Edit Cutoff' : 'Add Cutoff Entry'} onClose={()=>setModal(false)}>
           <FormGrid>
              <FormGroup label="Search & Select College" full>
                 <div style={{ position: 'relative' }}>
                   <FormInput 
                      placeholder="Type name or code to find college..." 
                      value={collegeSearch} 
                      onChange={e => setCollegeSearch(e.target.value)} 
                      style={{ marginBottom: 8, paddingLeft: 40 }}
                   />
                   <span style={{ position:'absolute', left:14, top:12, opacity:0.5 }}>🔍</span>
                 </div>
                 <FilterSelect value={form.collegeId} onChange={e=>setForm({...form, collegeId: e.target.value})} style={{ width:'100%' }}>
                    <option value="">{filteredModalColleges.length > 0 ? 'Choose from results...' : 'No colleges found'}</option>
                    {filteredModalColleges.map(c => <option key={c._id} value={c._id}>{c.collegeName} ({c.collegeCode})</option>)}
                    {form.collegeId && !filteredModalColleges.find(c => c._id === form.collegeId) && (
                      <option value={form.collegeId}>
                         {colleges.find(c => c._id === form.collegeId)?.collegeName || 'Selected College'} 
                      </option>
                    )}
                 </FilterSelect>
              </FormGroup>
              <FormGroup label="Select Course" full>
                 <FilterSelect value={form.courseId} onChange={e=>setForm({...form, courseId: e.target.value})} style={{ width:'100%' }}>
                    <option value="">Choose Course...</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.courseName} ({c.branchCode || 'No Code'})</option>)}
                 </FilterSelect>
              </FormGroup>
              <FormGrid>
                <FormGroup label="Year">
                    <FormInput type="number" value={form.year} onChange={e=>setForm({...form, year: e.target.value})}/>
                </FormGroup>
                <FormGroup label="Round / Notes">
                    <FormInput value={form.round} onChange={e=>setForm({...form, round: e.target.value})} placeholder="Round 1, Final, etc." />
                </FormGroup>
              </FormGrid>
              
              <FormGroup label="Category Marks Configuration" full>
                 <div style={{ background:'var(--surface2)', padding:20, borderRadius:16, border:'1px solid var(--border)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:12 }}>
                       {['OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST'].map(cat => {
                          const val = form.cutoffData.find(d => d.category === cat)?.score || '';
                          return (
                            <div key={cat}>
                               <label style={{ fontSize:11, fontWeight:800, marginBottom:4, display:'block' }}>{cat}</label>
                               <FormInput 
                                  placeholder="0.00" 
                                  value={val} 
                                  onChange={e => {
                                      const data = [...form.cutoffData];
                                      const idx = data.findIndex(d => d.category === cat);
                                      if(idx > -1) data[idx].score = e.target.value;
                                      else data.push({ category: cat, score: e.target.value });
                                      setForm({...form, cutoffData: data});
                                  }} 
                                  type="number" 
                               />
                            </div>
                          )
                       })}
                    </div>
                 </div>
              </FormGroup>
           </FormGrid>
           <FormActions onClose={()=>setModal(false)} onSave={handleSave} saveText={saving ? 'Saving...' : 'Save Cutoff'} />
        </Modal>
      )}

      <style>{`
        .admin-table-row:hover { background: #f1f5f980; }
        .s-anim-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
