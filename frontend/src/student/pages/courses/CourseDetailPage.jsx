import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiChevronLeft, FiMapPin, FiGlobe, FiChevronRight,
  FiDownload, FiBriefcase, FiTrendingUp, FiCheckCircle,
  FiInfo, FiBookOpen, FiPercent, FiDollarSign, FiAlertCircle
} from 'react-icons/fi'
import { SBadge, SCard, SBtn, SLoader, SEmpty } from '../../components/ui'
import { courseService } from '../../../services/courseService'
import { userActionService } from '../../../services/userActionService'
import { adminService } from '../../../services/adminService'
import { cutoffService } from '../../../services/cutoffService'

// Map course category → college stream field in DB
const CATEGORY_STREAM_MAP = {
  'Engineering': 'Engineering',
  'Medical': 'Medical',
  'Arts': 'Arts & Science',
  'Commerce': 'Arts & Science',
  'Science': 'Arts & Science',
  'Law': 'Law',
  'Agriculture': 'Agriculture',
  'Polytechnic': 'Polytechnic',
  'Hotel Management': 'Others',
  'IT & Computer': 'Engineering',
}

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [colleges, setColleges] = useState([])
  const [cutoffs, setCutoffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setIsSaving] = useState(false)

  const isEngineering = course?.category?.toLowerCase().includes('engineering') ||
    course?.category?.toLowerCase().includes('it') ||
    course?.category?.toLowerCase().includes('computer')

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true)
      const cRes = await courseService.getStudentCourseDetails(slug)
      if (!cRes.success) return

      const courseData = cRes.course
      setCourse(courseData)

      const isCourseEngineering =
        courseData.category?.toLowerCase().includes('engineering') ||
        courseData.category?.toLowerCase().includes('it') ||
        courseData.category?.toLowerCase().includes('computer')

      setColleges(cRes.offeringColleges || [])

      if (isCourseEngineering) {
        // Engineering: fetch TNEA cutoffs filtered by courseId
        const ctRes = await cutoffService.getCutoffs({ courseId: courseData._id })
        setCutoffs(ctRes.data || [])
      }

      // Check if already saved
      const savedList = await userActionService.getSavedList('Course')
      const alreadySaved = savedList.data?.some(item => (item.contentId?._id || item.contentId) === courseData._id)
      setIsSaved(alreadySaved)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const handleSave = async () => {
    if (saving) return
    try {
      setIsSaving(true)
      if (isSaved) {
        await userActionService.unsaveItem(course._id)
        setIsSaved(false)
      } else {
        await userActionService.saveItem(course._id, 'Course')
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Error toggling save:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Tabs depend on whether this is engineering (cutoffs + colleges) or not (colleges only)
  const getTabs = (cat) => {
    const isEng = cat?.toLowerCase().includes('engineering') ||
      cat?.toLowerCase().includes('it') ||
      cat?.toLowerCase().includes('computer')
    const base = ['Overview', 'Admission & Path', 'Offering Colleges']
    return isEng ? [...base, 'Cutoff Trends'] : base
  }

  if (loading) return <SLoader fullScreen />
  if (!course) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <SEmpty icon={<FiAlertCircle size={48} />} title="Course not found" desc="The course you're looking for doesn't exist or has been removed." />
    </div>
  )

  const tabs = getTabs(course.category)

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── BANNER / HEADER ── */}
      <section style={{ background: 'var(--s-primary)', color: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontWeight: 700, fontSize: 14 }}>
            <FiChevronLeft /> Back to Discovery
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <SBadge color="blue">{course.targetLevel}</SBadge>
                <SBadge color="white" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>{course.category}</SBadge>
                {isEngineering && (
                  <SBadge color="white" style={{ background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.4)', color: '#ffd700' }}>
                    📊 TNEA Cutoffs Available
                  </SBadge>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--s-font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                {course.courseName}
              </h1>
              <p style={{ fontSize: 18, opacity: 0.9, marginTop: 16, maxWidth: 700, lineHeight: 1.6 }}>
                {course.shortDescription}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <SBtn 
                variant={isSaved ? 'white' : 'outline'} 
                style={{ borderRadius: 14, padding: '16px 24px', background: isSaved ? '#fff' : 'rgba(255,255,255,0.1)', color: isSaved ? 'var(--s-primary)' : '#fff', border: '1px solid rgba(255,255,255,0.2)' }} 
                onClick={handleSave}
                disabled={saving}
              >
                {isSaved ? '🔖 Saved' : '🔖 Bookmark Course'}
              </SBtn>
              <SBtn variant="white" style={{ borderRadius: 14, padding: '16px 32px', flexShrink: 0 }} onClick={() => window.print()}>
                <FiDownload style={{ marginRight: 8 }} /> Download Guide
              </SBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--s-border)', position: 'sticky', top: 64, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 32, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '20px 0', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '3px solid var(--s-primary)' : '3px solid transparent',
                color: activeTab === tab ? 'var(--s-primary)' : 'var(--s-text3)',
                fontWeight: 800, cursor: 'pointer', fontSize: 15, transition: '0.2s',
                whiteSpace: 'nowrap', flexShrink: 0
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <SCard style={{ padding: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Program Overview</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--s-text2)' }}>
                  {course.overview || course.futureScope || 'Comprehensive career-focused program with industry-aligned curriculum.'}
                </p>
              </SCard>

              <SCard style={{ padding: 32 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Colleges Offering This Course</span>
                  <span style={{ fontSize: 14, color: 'var(--s-text3)', fontWeight: 700 }}>
                    {colleges.length} {colleges.length === 1 ? 'college' : 'colleges'} found
                  </span>
                </h2>
                {colleges.length === 0 ? (
                  <p style={{ color: 'var(--s-text3)', fontSize: 15, margin: 0 }}>
                    No colleges are currently mapped for this course.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {colleges.map((clg, idx) => (
                      <div key={clg._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: idx === colleges.length - 1 ? 0 : 20,
                        borderBottom: idx === colleges.length - 1 ? 'none' : '1px solid var(--s-border)',
                        flexWrap: 'wrap',
                        gap: 16
                      }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--s-bg)', fontSize: 22, display: 'grid', placeItems: 'center', flexShrink: 0 }}>🏫</div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: 'var(--s-text)' }}>
                              {clg.collegeName}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-primary)', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6 }}>
                                {clg.collegeType || 'Government'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--s-text3)', fontSize: 13, fontWeight: 700 }}>
                                <FiMapPin size={12} /> {clg.district}
                              </div>
                            </div>
                          </div>
                        </div>
                        <SBtn
                          variant="outline"
                          size="sm"
                          style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 700 }}
                          onClick={() => navigate(`/student/colleges/${clg._id}`)}
                        >
                          View College
                        </SBtn>
                      </div>
                    ))}
                  </div>
                )}
              </SCard>

              {((course.skillsRequired?.length > 0) || (course.subjectsCovered?.length > 0)) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {course.skillsRequired?.length > 0 && (
                    <SCard style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiCheckCircle color="var(--s-primary)" /> Key Skills
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {course.skillsRequired.map(s => <SBadge key={s} color="gray">{s}</SBadge>)}
                      </div>
                    </SCard>
                  )}
                  {course.subjectsCovered?.length > 0 && (
                    <SCard style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiBookOpen color="var(--s-primary)" /> Core Subjects
                      </h3>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {course.subjectsCovered.map(s => <li key={s} style={{ fontSize: 14, color: 'var(--s-text2)' }}>• {s}</li>)}
                      </ul>
                    </SCard>
                  )}
                </div>
              )}

              {(course.careerScope || course.futureScope || course.jobRoles?.length > 0) && (
                <SCard style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Career Scope & Opportunities</h2>
                  <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--s-text2)', marginBottom: 24 }}>
                    {course.careerScope || course.futureScope}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
                    {course.salaryRange?.starting && (
                      <div style={{ background: 'var(--s-bg)', padding: 20, borderRadius: 16 }}>
                        <FiDollarSign size={24} color="var(--s-primary)" style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Starting Salary</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>{course.salaryRange.starting}</div>
                      </div>
                    )}
                    {course.salaryRange?.growth && (
                      <div style={{ background: 'var(--s-bg)', padding: 20, borderRadius: 16 }}>
                        <FiTrendingUp size={24} color="#10b981" style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Growth Path</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>{course.salaryRange.growth}</div>
                      </div>
                    )}
                    {course.jobRoles?.length > 0 && (
                      <div style={{ background: 'var(--s-bg)', padding: 20, borderRadius: 16 }}>
                        <FiBriefcase size={24} color="var(--s-primary)" style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Job Roles</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>{course.jobRoles.length} Categories</div>
                      </div>
                    )}
                  </div>
                </SCard>
              )}
            </div>

            {/* Quick Facts Sidebar */}
            <aside>
              <SCard style={{ padding: 24, position: 'sticky', top: 140 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Quick Facts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Duration', value: course.duration },
                    { label: 'Eligibility', value: course.eligibility },
                    { label: 'Level', value: course.level },
                    { label: 'Category', value: course.category },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text)' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <hr style={{ margin: '20px 0', border: 0, borderTop: '1px solid var(--s-border)' }} />
                <SBtn fullWidth onClick={() => alert('Eligibility assessment tool coming soon! Currently, please refer to the criteria listed below.')}>Check My Eligibility</SBtn>
              </SCard>
            </aside>
          </div>
        )}

        {/* ── ADMISSION ── */}
        {activeTab === 'Admission & Path' && (
          <div style={{ maxWidth: 800 }}>
            <SCard style={{ padding: 40 }}>
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>Admission & Roadmap</h2>
              {course.admissionProcess ? (
                <div style={{ borderLeft: '3px solid var(--s-primary)', paddingLeft: 24, marginBottom: 40 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Standard Admission Process</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--s-text2)' }}>{course.admissionProcess}</p>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, marginBottom: 32, border: '1px solid var(--s-border)' }}>
                  <p style={{ margin: 0, color: 'var(--s-text3)', fontSize: 15 }}>Admission details for this program are typically based on merit / entrance exam results. Contact the respective college for the most up-to-date process.</p>
                </div>
              )}
              {course.higherStudies && (
                <>
                  <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Higher Studies Opportunities</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--s-text2)' }}>{course.higherStudies}</p>
                </>
              )}
            </SCard>
          </div>
        )}

        {/* ── OFFERING COLLEGES (Available for ALL types) ── */}
        {activeTab === 'Offering Colleges' && (
          <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
                Colleges Offering {course.courseName}
              </h2>
              <span style={{ fontSize: 14, color: 'var(--s-text3)', fontWeight: 700 }}>
                {colleges.length} colleges found
              </span>
            </div>

            {colleges.length === 0 ? (
              <SEmpty
                icon={<FiBookOpen size={48} />}
                title="No colleges listed yet"
                desc="Our admin team is adding college data for this course. Please check back soon."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {colleges.map(clg => (
                  <SCard key={clg._id} style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--s-bg)', fontSize: 26, display: 'grid', placeItems: 'center', flexShrink: 0 }}>🏫</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 4px', color: 'var(--s-text)', lineHeight: 1.3 }}>{clg.collegeName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--s-text3)', fontSize: 13, fontWeight: 700 }}>
                          <FiMapPin size={12} /> {clg.district}{clg.state ? `, ${clg.state}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {clg.accreditation && <SBadge color="blue">{clg.accreditation}</SBadge>}
                      {clg.stream && <SBadge color="gray">{clg.stream}</SBadge>}
                      {clg.placementPercentage > 0 && (
                        <SBadge color="green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiPercent size={10} /> {clg.placementPercentage}% Placement
                        </SBadge>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
                      <div style={{ fontSize: 13, color: 'var(--s-text2)', fontWeight: 700 }}>
                        {clg.feesPerYear > 0 ? `₹${clg.feesPerYear.toLocaleString()}/yr` : 'Fees vary'}
                        {clg.rank && <span style={{ marginLeft: 12 }}>Rank #{clg.rank}</span>}
                      </div>
                      {clg.website && (
                        <a href={clg.website} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <SBtn variant="outline" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            Website <FiGlobe size={13} />
                          </SBtn>
                        </a>
                      )}
                    </div>
                  </SCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CUTOFF TRENDS (Engineering only) ── */}
        {activeTab === 'Cutoff Trends' && (
          <div style={{ maxWidth: 960 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, background: '#fff7ed', padding: '16px 24px', borderRadius: 16, border: '1px solid #ffedd5' }}>
              <FiInfo size={24} color="#f59e0b" />
              <p style={{ margin: 0, fontSize: 14.5, color: '#9a3412', fontWeight: 600 }}>
                TNEA cutoff data shown is sourced from official year-wise reports (2022–2025). Scores are category-specific.
              </p>
            </div>

            <SCard style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--s-bg)', textAlign: 'left' }}>
                    {['College', 'Branch', 'Year', 'General (OC)', 'OBC / BC', 'SC / ST'].map(h => (
                      <th key={h} style={{ padding: '16px 20px', fontSize: 12, fontWeight: 900, color: 'var(--s-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cutoffs.map((ct, i) => (
                    <tr key={ct._id} style={{ borderBottom: '1px solid var(--s-border)', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: 14 }}>{ct.collegeId?.collegeName || ct.college || '—'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--s-text3)' }}>{ct.courseId?.branchCode || ct.branchCode || '—'}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--s-text2)' }}>{ct.year}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 900, color: 'var(--s-primary)', fontSize: 15 }}>
                        {ct.cutoffData?.find(d => ['OC', 'General'].includes(d.category))?.score ?? ct.oc ?? '—'}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 900, color: '#f59e0b', fontSize: 15 }}>
                        {ct.cutoffData?.find(d => ['BC', 'OBC'].includes(d.category))?.score ?? ct.bc ?? '—'}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 900, color: '#ef4444', fontSize: 15 }}>
                        {ct.cutoffData?.find(d => ['SC', 'ST'].includes(d.category))?.score ?? ct.sc ?? '—'}
                      </td>
                    </tr>
                  ))}
                  {cutoffs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: 60, textAlign: 'center', color: 'var(--s-text3)' }}>
                        <SEmpty title="No cutoff data" desc={`TNEA cutoff data for ${course.courseName} has not been loaded yet.`} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </SCard>
          </div>
        )}

      </main>
    </div>
  )
}
