import React, { useState, useEffect, useRef } from 'react'
import { collegeService } from '../../services'
import { SCard, SBadge, SLoader, SEmpty, SInput, SBtn } from '../../components/ui'
import { FiSearch, FiMapPin, FiBookOpen, FiClock, FiLayers, FiExternalLink } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function CollegeCourseExplorer() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [verifiedCourses, setVerifiedCourses] = useState([])
  const [autoFetchedCourses, setAutoFetchedCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingCourses, setFetchingCourses] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await collegeService.getAll({ search: search.trim() })
        setResults(res.data || [])
        setShowDropdown(true)
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const handleSelectCollege = async (college) => {
    setSelectedCollege(college)
    setSearch(college.collegeName)
    setShowDropdown(false)
    fetchOfferedCourses(college._id)
  }

  const fetchOfferedCourses = async (collegeId) => {
    setFetchingCourses(true)
    try {
      const res = await collegeService.getOfferedCourses(collegeId)
      setVerifiedCourses(res.verifiedCourses || [])
      setAutoFetchedCourses(res.autoFetchedCourses || [])
    } catch (err) {
      console.error('Fetch offered courses failed', err)
      setVerifiedCourses([])
      setAutoFetchedCourses([])
    } finally {
      setFetchingCourses(false)
    }
  }

  return (
    <div className="student-root" style={{ padding: '40px 20px', maxWidth: 900, margin: '0 auto', minHeight: '80vh' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }} className="s-anim-up">
        <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 42px)', color: 'var(--s-text)', marginBottom: 12, letterSpacing: '-0.02em' }}>
          College Course <span style={{ color: 'var(--s-primary)' }}>Explorer</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--s-text3)', maxWidth: 600, margin: '0 auto' }}>
          Enter a college name to instantly fetch and view all courses officially offered by that institution.
        </p>
      </div>

      {/* Search Section */}
      <div style={{ position: 'relative', marginBottom: 50, zIndex: 100 }} className="s-anim-up s-d1" ref={dropdownRef}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <SInput 
              placeholder="Search for a college (e.g., National Engineering College)..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value)
                if (!e.target.value) setSelectedCollege(null)
              }}
              icon={<FiSearch />}
              style={{ fontSize: 16, padding: '16px 20px 16px 48px', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            />
            {loading && (
              <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}>
                <div className="spinner-small"></div>
              </div>
            )}
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && results.length > 0 && (
          <div style={{ 
            position: 'absolute', top: '110%', left: 0, right: 0, 
            background: '#fff', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.12)', 
            border: '1px solid var(--s-border)', overflow: 'hidden', zIndex: 1000,
            animation: 'fadeUp 0.2s ease'
          }}>
            {results.map((c) => (
              <div 
                key={c._id} 
                onClick={() => handleSelectCollege(c)}
                style={{ 
                  padding: '14px 20px', cursor: 'pointer', transition: '0.15s',
                  borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14
                }}
                className="dropdown-item-hover"
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--s-primary-l)', color: 'var(--s-primary)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                  ðŸ «
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--s-text)' }}>{c.collegeName}</div>
                  <div style={{ fontSize: 12, color: 'var(--s-text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiMapPin size={11} /> {c.district}, {c.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="s-anim-up s-d2">
        {fetchingCourses ? (
          <div style={{ padding: '60px 0' }}><SLoader /></div>
        ) : selectedCollege ? (
          <div>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--s-primary) 0%, #1e40af 100%)', 
              borderRadius: 24, padding: '32px', color: '#fff', marginBottom: 32,
              boxShadow: '0 15px 30px rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', fontSize: 28 }}>
                  ðŸ «
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{selectedCollege.collegeName}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiMapPin size={14} /> {selectedCollege.location}, {selectedCollege.district}
                  </p>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiBookOpen style={{ color: 'var(--s-primary)' }} /> Offered Courses ({verifiedCourses.length + autoFetchedCourses.length})
            </h3>

            {verifiedCourses.length === 0 && autoFetchedCourses.length === 0 ? (
              <SEmpty 
                title="No mapped courses found" 
                desc="This college hasn't listed its courses in our database yet. Please contact the administrator to map them." 
                icon="âš ï¸ "
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {/* Verified Courses */}
                {verifiedCourses.map((course, idx) => (
                  <div key={course._id} style={{ 
                    background: '#fff', borderRadius: 20, border: '1.5px solid var(--s-border)', 
                    padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    gap: 20, transition: '0.25s', animation: `fadeUp 0.3s ease both ${idx * 0.05}s`
                  }} className="course-card-hover">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--s-bg2)', display: 'grid', placeItems: 'center', color: 'var(--s-primary)', fontSize: 20 }}>
                        🎓
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--s-text)' }}>{course.courseName}</h4>
                          <SBadge color="green" style={{ fontSize: 9 }}>VERIFIED</SBadge>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--s-text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiLayers size={13} /> {course.level || 'Degree'}
                          </span>
                          <span style={{ fontSize: 12.5, color: 'var(--s-text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiClock size={13} /> {course.duration || 'N/A'}
                          </span>
                          <SBadge color="blue" style={{ fontSize: 10 }}>{course.category}</SBadge>
                        </div>
                      </div>
                    </div>
                    <SBtn variant="outline" size="sm" onClick={() => navigate(`/courses/${course._id}`)} style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      View Details <FiExternalLink size={13} />
                    </SBtn>
                  </div>
                ))}

                {/* Auto-Fetched Courses */}
                {autoFetchedCourses.map((course, idx) => (
                  <div key={course._id} style={{ 
                    background: 'rgba(248, 250, 252, 0.5)', borderRadius: 20, border: '1.5px dashed var(--s-border)', 
                    padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    gap: 20, transition: '0.25s', animation: `fadeUp 0.3s ease both ${(verifiedCourses.length + idx) * 0.05}s`
                  }} className="course-card-hover">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--s-secondary-l)', display: 'grid', placeItems: 'center', color: 'var(--s-secondary)', fontSize: 20 }}>
                        🤖
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--s-text)' }}>{course.courseFullName}</h4>
                          <SBadge color="gold" style={{ fontSize: 9 }}>AUTO-IDENTIFIED</SBadge>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--s-text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiLayers size={13} /> {course.normalizedCourseName}
                          </span>
                          <span style={{ fontSize: 12.5, color: 'var(--s-text3)' }}>
                            Found on Official Website
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* No "View Details" for auto-identified as they might not have a page yet */}
                    <div style={{ fontSize: 12, color: 'var(--s-text3)', fontStyle: 'italic' }}>
                      Website Match
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            background: 'var(--s-surface2)', borderRadius: 24, padding: 40, border: '2px dashed var(--s-border)', color: 'var(--s-text3)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>ðŸ”Ž</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Global College Course Lookup</h3>
            <p style={{ maxWidth: 400, margin: 0, fontSize: 14.5 }}>Find any institution above to see exactly what they offer. We use verified mapping data for 100% accuracy.</p>
          </div>
        )}
      </div>

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
          border: 2.5px solid rgba(59, 130, 246, 0.1);
          border-left-color: var(--s-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
