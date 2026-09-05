import React, { useState, useEffect } from 'react'
import { SCard as Card, CardHeader, SBtn, SLoader } from '../../components/UI'
import { adminService } from '../../../services/adminService'
import axiosInstance from '../../../config/axios'
import BulkCollegeCourseMapperModal from './BulkCollegeCourseMapperModal'

const STREAMS = [
  "Engineering",
  "Medical",
  "Arts & Science",
  "Law",
  "Diploma",
  "Media & Journalism",
  "Polytechnic",
  "Agriculture",
  "Others",
]

export default function CollegeCourseMappingPage() {
  const [colleges, setColleges] = useState([])
  const [selectedStream, setSelectedStream] = useState('')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [selectedCourses, setSelectedCourses] = useState([])
  const [courseSearch, setCourseSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState({ type: '', text: '' })
  const [collegeSearch, setCollegeSearch] = useState('')
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
  const [suggestedCourses, setSuggestedCourses] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [collegeDetails, setCollegeDetails] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [manualWebsite, setManualWebsite] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const collegesRes = await adminService.getColleges()
      setColleges(collegesRes.data)
    } catch (err) {
      console.error('Failed to fetch colleges:', err)
      setAlert({ type: 'error', text: 'Failed to load colleges.' })
    } finally {
      setLoading(false)
    }
  }

  const filteredColleges = selectedStream 
    ? colleges.filter(c => {
        if (selectedStream === 'Arts & Science') return c.stream === 'Arts & Science' || c.stream === 'Arts' || c.stream === 'Science';
        if (selectedStream === 'Diploma') {
          return c.stream === 'Diploma' || c.stream === 'Polytechnic' || c.stream === 'ITI' ||
            (c.streamsOffered && c.streamsOffered.some(s => /diploma|polytechnic|iti/i.test(s)));
        }
        if (selectedStream === 'Polytechnic') {
          return c.stream === 'Polytechnic' ||
            (c.streamsOffered && c.streamsOffered.some(s => /polytechnic|diploma in engineering/i.test(s)));
        }
        return c.stream === selectedStream || (c.streamsOffered && c.streamsOffered.includes(selectedStream));
      })
    : colleges

  const filteredCollegesBySearch = filteredColleges.filter(c => 
    c.collegeName.toLowerCase().includes(collegeSearch.toLowerCase()) || 
    (c.collegeCode && c.collegeCode.includes(collegeSearch))
  )

  const handleCollegeChange = async (id) => {
    const collegeId = id ? String(id) : ''
    setSelectedCollege(collegeId)
    if (!collegeId) {
      setSelectedCourses([])
      setSuggestedCourses([])
      setCollegeDetails(null)
      return
    }

    try {
      setActionLoading(true)
      const res = await axiosInstance.get(`/college-courses/suggested/${collegeId}`)
      const { data, college } = res.data
      
      setSuggestedCourses(data || [])
      setCollegeDetails(college || null)
      setManualWebsite(college?.website || '')
      
      // Auto-check anything that is an ACTUAL mapping or from a high-conf source
      const initialCheckedIds = (data || [])
        .filter(c => c.checked)
        .map(c => c._id)
      
      setSelectedCourses(initialCheckedIds)
    } catch (err) {
      console.error('Failed to fetch actual mappings:', err)
      setAlert({ type: 'error', text: 'Failed to fetch actual mappings.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleScanWebsite = async () => {
    const urlToScan = manualWebsite || collegeDetails?.website;
    
    if (!urlToScan) {
      setAlert({ type: 'error', text: 'Please provide a website URL to scan.' })
      return
    }

    try {
      setScanning(true)
      setAlert({ type: 'info', text: `Analyzing ${urlToScan}... 🌐` })
      
      const res = await axiosInstance.post('/college-courses/scan-website', {
        collegeId: selectedCollege,
        websiteUrl: urlToScan
      })

      if (res.data.success) {
        const foundIds = res.data.foundCourseIds;
        
        // Update suggested courses to mark website matches
        setSuggestedCourses(prev => prev.map(c => {
          if (foundIds.includes(c._id.toString())) {
            return { ...c, source: 'website_match' };
          }
          return c;
        }));

        // Tick found ones
        setSelectedCourses(prev => [...new Set([...prev, ...foundIds])]);
        
        setAlert({ type: 'success', text: `AI scanned website & matched ${foundIds.length} courses! 🎯` })
      }
    } catch (err) {
      console.error('Website scan failed:', err)
      setAlert({ type: 'error', text: 'Website analysis failed. The site might be blocking scans.' })
    } finally {
      setScanning(false)
    }
  }

  const finalSuggestedFiltered = suggestedCourses.filter(c => {
    if (!courseSearch) return true;
    const term = courseSearch.toLowerCase();
    return (
      c.courseName.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term)
    );
  });

  const handleSave = async () => {
    if (!selectedCollege) {
      setAlert({ type: 'error', text: 'Please select a college.' })
      return
    }

    try {
      setSubmitting(true)
      const res = await axiosInstance.post('/college-courses', {
        collegeId: selectedCollege,
        coursesOffered: selectedCourses
      })

      if (res.data.success) {
        setAlert({ type: 'success', text: 'Actual mapping verified and saved! ✨' })
        handleCollegeChange(selectedCollege)
      }
    } catch (err) {
      console.error('Save mapping error:', err)
      setAlert({ type: 'error', text: 'Failed to save mapping.' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setAlert({ type: '', text: '' }), 4000)
    }
  }

  const handlePdfImport = async () => {
    if (!window.confirm("This will scan the TNEA PDF and update all Engineering colleges. It may take a minute. Proceed?")) return
    
    try {
      setLoading(true)
      setAlert({ type: 'info', text: 'Starting PDF deep-scan... 📄' })
      const res = await axiosInstance.post('/colleges/import-courses-from-pdf')
      if (res.data.success) {
        setAlert({ type: 'success', text: `Sync complete! Parsed: ${res.data.stats.totalCollegesParsed}, Updated: ${res.data.stats.updatedColleges}, Removed: ${res.data.stats.removedColleges}` })
        fetchInitialData()
      }
    } catch (err) {
      console.error('PDF Import failed:', err)
      setAlert({ type: 'error', text: 'PDF Import failed. Ensure the file exists on server.' })
    } finally {
      setLoading(false)
      setTimeout(() => setAlert({ type: '', text: '' }), 6000)
    }
  }

  const getSourceBadge = (source) => {
    switch(source) {
      case 'verified_mapping':
        return <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>✅ VERIFIED</span>;
      case 'imported_data':
        return <span style={{ fontSize: 10, background: '#e0f2fe', color: '#075985', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>📂 IMPORTED</span>;
      case 'website_match':
        return <span style={{ fontSize: 10, background: '#dcfce7', color: '#047857', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>🌐 WEBSITE MATCH</span>;
      case 'existing_mapping':
        return <span style={{ fontSize: 10, background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>🔗 EXISTING</span>;
      case 'cutoff_data':
        return <span style={{ fontSize: 10, background: '#ede9fe', color: '#5b21b6', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>📊 CUTOFF MATCH</span>;
      case 'similar_match':
        return <span style={{ fontSize: 10, background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>⚠️ SIMILAR - VERIFY</span>;
      case 'stream_suggest':
        return <span style={{ fontSize: 10, background: '#ffedd5', color: '#9a3412', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>🤖 STREAM SUGGEST</span>;
      default:
        return <span style={{ fontSize: 10, background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>🔍 FETCHED</span>;
    }
  }

  if (loading) return <SLoader />

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <Card>
        <CardHeader 
          title="⚡ Actual College-Course Mapping Engine" 
          extra={
            <div style={{ display: 'flex', gap: 10 }}>
              <SBtn 
                variant="outline" 
                onClick={handlePdfImport}
                style={{ padding: '8px 20px', borderRadius: 12, fontSize: 12, borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                📄 Sync from TNEA PDF
              </SBtn>
              <SBtn 
                variant="primary" 
                onClick={() => setShowBulkModal(true)}
                style={{ padding: '8px 20px', borderRadius: 12, fontSize: 12 }}
              >
                🚀 Bulk Auto-Map Engine
              </SBtn>
            </div>
          }
        />
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div style={{ padding: '16px 20px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 16, border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
              <b>💡 Data-Driven Mapping:</b> This system uses actual college-wise course lists from imported datasets. 
              <b> Verified</b> and <b>Imported</b> courses are automatically pre-selected. Suggestions based on streams are shown but left unchecked for manual verification.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text3)', marginBottom: 8, letterSpacing: '0.05em' }}>
                  STEP 1: FILTER BY STREAM
                </label>
                <div style={{ display:'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STREAMS.map(s => (
                    <button 
                      key={s}
                      onClick={() => { setSelectedStream(s); setSelectedCollege(''); setCourseSearch(''); setSuggestedCourses([]); }}
                      style={{
                        padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
                        background: selectedStream === s ? 'var(--primary)' : 'var(--surface)',
                        color: selectedStream === s ? '#fff' : 'var(--text2)',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text3)', marginBottom: 12, letterSpacing: '0.05em' }}>
                  STEP 2: SEARCH INSTITUTION
                </label>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="Type college name (e.g. CEG)..."
                      value={collegeSearch}
                      onChange={e => { setCollegeSearch(e.target.value); setShowCollegeDropdown(true); }}
                      onFocus={() => setShowCollegeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 200)}
                      style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}
                    />
                    {actionLoading && (
                      <div style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="spinner-small" style={{ width: 16, height: 16 }}></div>
                      </div>
                    )}
                  </div>

                  {showCollegeDropdown && (
                    <div style={{ 
                      position: 'absolute', top: '110%', left: 0, right: 0, 
                      background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
                      border: '1px solid var(--border)', overflowY: 'auto', maxHeight: 300, zIndex: 1000 
                    }}>
                      {filteredCollegesBySearch.length === 0 ? (
                        <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No colleges found</div>
                      ) : (
                        filteredCollegesBySearch.map(c => (
                          <div 
                            key={c._id} 
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleCollegeChange(c._id)
                              setCollegeSearch(c.collegeName)
                              setShowCollegeDropdown(false)
                            }}
                            style={{ 
                              padding: '12px 16px', cursor: 'pointer', transition: '0.15s',
                              borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10
                            }}
                            className="dropdown-item-hover"
                          >
                             <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{c.collegeName}</div>
                             <div style={{ fontSize: 10, color: 'var(--text3)' }}>{c.collegeCode || c.district}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedCollege && (
                  <div style={{ animation: 'fadeIn 0.3s ease both', marginTop: 16 }}>
                    {!collegeDetails?.website ? (
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text3)', marginBottom: 6 }}>OFFICIAL WEBSITE (MISSING IN PROFILE)</label>
                        <input 
                          type="text"
                          placeholder="https://www.college.edu.in"
                          value={manualWebsite}
                          onChange={e => setManualWebsite(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #10b981', background: 'var(--surface)', color: 'var(--text)', fontSize: 12 }}
                        />
                      </div>
                    ) : (
                      <div style={{ marginBottom: 12, fontSize: 11, color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✅ Profile URL: {collegeDetails.website}
                      </div>
                    )}
                    
                    <button 
                      onClick={handleScanWebsite}
                      disabled={scanning}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 12, background: scanning ? 'var(--surface2)' : 'rgba(16, 185, 129, 0.1)',
                        border: '1.5px dashed #10b981', color: '#059669', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: '0.2s'
                      }}
                    >
                      {scanning ? '🌐 ANALYZING LIVE WEBSITE...' : `🔍 SCAN WEBSITE FOR COURSES`}
                    </button>
                    <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>
                      AI will browse the site and find mentioned courses automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedCollege ? (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text3)', letterSpacing: '0.05em', marginBottom: 12 }}>
                      ✅ OFFICIAL BRANCHES IDENTIFIED FROM PDF
                    </label>
                    <div style={{ 
                      background: 'var(--surface2)', borderRadius: 16, padding: 20, 
                      border: '1.5px solid var(--primary)', marginBottom: 24,
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12
                    }}>
                      {suggestedCourses.filter(c => c.checked).length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: 20 }}>
                          No official PDF branches matched for this college yet. Run "Sync from TNEA PDF" to populate.
                        </div>
                      ) : (
                        suggestedCourses.filter(c => c.checked).map(c => (
                          <div key={c._id} style={{ 
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', 
                            background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{c.courseName}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text3)', letterSpacing: '0.05em' }}>
                      STEP 3: VERIFY & EDIT MAPPING
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      onClick={() => {
                        const allIds = finalSuggestedFiltered.map(c => c._id);
                        setSelectedCourses([...new Set([...selectedCourses, ...allIds])]);
                      }}
                      style={{ fontSize: 11, background: 'rgba(var(--primary-rgb), 0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 800, padding: '6px 14px', borderRadius: 8 }}
                    >
                      SELECT ALL
                    </button>
                    <button 
                      onClick={() => {
                        const allIds = finalSuggestedFiltered.map(c => c._id);
                        setSelectedCourses(selectedCourses.filter(id => !allIds.includes(String(id))));
                      }}
                      style={{ fontSize: 11, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer', fontWeight: 800, padding: '6px 14px', borderRadius: 8 }}
                    >
                      CLEAR ALL
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <input 
                    type="text"
                    placeholder="🔍 Filter actual or suggested courses..."
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14 }}
                  />
                </div>

                <div style={{ maxHeight: 500, overflowY: 'auto', border: '2px solid var(--border)', borderRadius: 20, padding: 16, background: 'var(--surface2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {finalSuggestedFiltered.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
                      No actual records found for this college in any datasets.
                    </div>
                  ) : (
                    finalSuggestedFiltered.map(c => {
                      const isSelected = selectedCourses.some(sc => String(sc) === String(c._id));
                      return (
                        <label key={c._id} 
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', cursor: 'pointer', borderRadius: 16, transition: '0.2s',
                            background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--surface)',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                          }} 
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) setSelectedCourses([...selectedCourses, c._id])
                              else setSelectedCourses(selectedCourses.filter(id => String(id) !== String(c._id)))
                            }}
                            style={{ width: 22, height: 22, accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{c.courseName}</div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {getSourceBadge(c.source)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, opacity: 0.8 }}>⏱️ {c.duration}</span>
                              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, opacity: 0.8 }}>🎓 {c.level}</span>
                              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, opacity: 0.8 }}>📁 {c.category}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <SBtn 
                    variant="primary" 
                    onClick={handleSave} 
                    disabled={submitting || !selectedCollege}
                    style={{ padding: '16px 48px', borderRadius: 16, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.3)' }}
                  >
                    {submitting ? 'Updating Mapping...' : 'Verify & Update Actual Registry'}
                  </SBtn>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, background: 'var(--surface2)', borderRadius: 24, border: '2px dashed var(--border)', color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: 40 }}>
                <div>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🏢</div>
                  <b>Select an institution to verify offerings</b><br/>
                  The system will load findings from actual datasets and high-confidence sources.
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {showBulkModal && (
        <BulkCollegeCourseMapperModal 
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => fetchInitialData()}
        />
      )}

      <style>{`
        .course-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.1);
          border-color: var(--s-primary);
        }
        .dropdown-item-hover:hover {
          background: #f8fafc;
        }
        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(var(--primary-rgb), 0.1);
          border-left-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      {alert.text && (
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000, padding: '16px 24px', borderRadius: 16, background: alert.type === 'success' ? '#10b981' : '#ef4444', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 700, animation: 'fadeUp 0.3s ease' }}>
          {alert.text}
        </div>
      )}
    </div>
  )
}
