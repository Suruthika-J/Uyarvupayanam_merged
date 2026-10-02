import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axiosInstance from '../../../config/axios'
import { TN_DISTRICTS_ORDERED, TN_COLLEGES_BY_DISTRICT } from '../../data/tnCollegesByDistrict'
import { COLLEGE_FIELDS_DATA } from '../../config/collegeFieldsData'
import {
  FiBookOpen, FiArrowRight, FiArrowLeft, FiCheck, FiCheckCircle,
  FiAlertCircle, FiX, FiLayers, FiMapPin, FiCalendar, FiCompass,
  FiShield, FiSave, FiAward, FiSearch, FiRefreshCw
} from 'react-icons/fi'

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

export default function UpdateCurrentStudyModal({ isOpen, onClose, initialData = {}, onSuccess }) {
  const { student, updateStudent, refreshStudent } = useStudentAuth()
  const navigate = useNavigate()

  const isExistingCollegeStudent = student?.userType === 'college_student'
  const currentClassDisplay = student?.classLevel ? `Class ${student.classLevel}` : '12th Standard'

  // Wizard Step:
  // 1: Stage Selection (if school student) or directly to College Form (if college student)
  // 2: College & Course Information
  // 3: Review & Confirmation
  const [step, setStep] = useState(isExistingCollegeStudent ? 2 : 1)

  // Target stage
  const [targetStage, setTargetStage] = useState('college_student')

  // College form state
  const [district, setDistrict] = useState(initialData.district || student?.district || 'Chennai')
  const [collegeSearch, setCollegeSearch] = useState('')
  const [selectedCollege, setSelectedCollege] = useState(initialData.college || null) // { id, name }
  const [collegesList, setCollegesList] = useState([])
  const [loadingColleges, setLoadingColleges] = useState(false)

  // Courses state
  const [coursesList, setCoursesList] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(initialData.course || '')
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const [allowManualCourse, setAllowManualCourse] = useState(false)

  // Academic Year & Specialisation
  const [academicYear, setAcademicYear] = useState(initialData.academicYear || '1st Year')
  const [specialization, setSpecialization] = useState(initialData.specialization || '')
  const [availableSpecs, setAvailableSpecs] = useState([])

  // Submission / Loading
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      setSuccessMsg('')
      setStep(isExistingCollegeStudent ? 2 : 1)
      if (initialData.district || student?.district) {
        setDistrict(initialData.district || student?.district)
      }
      if (initialData.college) {
        setSelectedCollege({ name: initialData.college })
      }
      if (initialData.course) {
        setSelectedCourse(initialData.course)
      }
      if (initialData.academicYear) {
        setAcademicYear(initialData.academicYear)
      }
      if (initialData.specialization) {
        setSpecialization(initialData.specialization)
      }
    }
  }, [isOpen, isExistingCollegeStudent])

  // Fetch colleges when district changes
  useEffect(() => {
    if (!district) return
    setLoadingColleges(true)
    axiosInstance.get(`/colleges/by-district/${encodeURIComponent(district)}`)
      .then(res => {
        if (res.data?.success) {
          const list = res.data.data || []
          setCollegesList(list)
        }
      })
      .catch(err => {
        console.warn('Failed to fetch colleges for district', err)
        // Fallback to static data
        const staticNames = TN_COLLEGES_BY_DISTRICT[district] || []
        setCollegesList(staticNames.map(name => ({ _id: name, collegeName: name, district })))
      })
      .finally(() => setLoadingColleges(false))
  }, [district])

  // Fetch offered courses when college is selected
  useEffect(() => {
    if (!selectedCollege) {
      setCoursesList([])
      return
    }

    setLoadingCourses(true)
    const collegeId = selectedCollege._id || selectedCollege.id

    if (collegeId && collegeId.length === 24) {
      axiosInstance.get(`/colleges/${collegeId}/offered-courses`)
        .then(res => {
          if (res.data?.success) {
            const list = res.data.courses || res.data.verifiedCourses || []
            setCoursesList(list)
            if (list.length === 0) {
              setAllowManualCourse(true)
            } else {
              setAllowManualCourse(false)
            }
          }
        })
        .catch(() => {
          setAllowManualCourse(true)
        })
        .finally(() => setLoadingCourses(false))
    } else {
      // If college without ObjectId or fallback
      setAllowManualCourse(true)
      setLoadingCourses(false)
    }
  }, [selectedCollege])

  // Update dynamic specializations when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setAvailableSpecs([])
      return
    }

    const lower = selectedCourse.toLowerCase()
    let foundSpecs = []

    // Look for domain match in COLLEGE_FIELDS_DATA
    for (const field of COLLEGE_FIELDS_DATA) {
      for (const dom of (field.domains || [])) {
        const domLower = dom.name.toLowerCase()
        if (lower.includes(domLower.split(' ')[0]) || domLower.includes(lower.split(' ')[0])) {
          foundSpecs = dom.specs || []
          break
        }
      }
      if (foundSpecs.length > 0) break
    }

    // Default CSE / Engineering fallback specs if relevant
    if (foundSpecs.length === 0 && (lower.includes('computer') || lower.includes('cse') || lower.includes('software') || lower.includes('it'))) {
      foundSpecs = [
        'Artificial Intelligence & Machine Learning',
        'Data Science & Big Data Analytics',
        'Cyber Security & Ethical Hacking',
        'Cloud Computing & DevOps',
        'Full Stack Web & Mobile Development',
        'Algorithms & System Programming'
      ]
    } else if (foundSpecs.length === 0 && (lower.includes('electronics') || lower.includes('ece') || lower.includes('eee'))) {
      foundSpecs = [
        'VLSI & Embedded Systems',
        'IoT & Smart Sensor Networks',
        'Robotics & Automation',
        'Power Electronics & Electric Vehicles'
      ]
    }

    setAvailableSpecs(foundSpecs)
  }, [selectedCourse])

  if (!isOpen) return null

  // College filter
  const filteredColleges = collegesList.filter(c =>
    (c.collegeName || '').toLowerCase().includes(collegeSearch.toLowerCase())
  )

  // Course filter
  const filteredCourses = coursesList.filter(c =>
    (c.courseName || '').toLowerCase().includes(courseSearch.toLowerCase())
  )

  // Action: Save as Draft
  const handleSaveDraft = async () => {
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.patch('/student/current-study', {
        targetStage: 'college_student',
        institution: selectedCollege?.collegeName || selectedCollege?.name || '',
        institutionDistrict: district,
        degreeProgramme: selectedCourse,
        currentYear: academicYear,
        specialization,
        saveAsDraft: true
      })
      if (refreshStudent) await refreshStudent()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft.')
    } finally {
      setSubmitting(false)
    }
  }

  // Action: Confirm & Transition
  const handleConfirmTransition = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await axiosInstance.patch('/student/current-study', {
        targetStage: 'college_student',
        institution: selectedCollege?.collegeName || selectedCollege?.name || '',
        institutionDistrict: district,
        degreeProgramme: selectedCourse,
        currentYear: academicYear,
        specialization,
        saveAsDraft: false
      })

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Academic stage successfully updated to College Student!')
        if (refreshStudent) {
          await refreshStudent(res.data.student)
        } else if (updateStudent) {
          updateStudent(res.data.student)
        }
        if (onSuccess) {
          onSuccess(res.data.student)
        }

        setTimeout(() => {
          onClose()
          if (!isExistingCollegeStudent) {
            navigate('/college/dashboard')
          }
        }, 1200)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete transition. Please check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 720,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 's-anim-scale 0.2s ease-out'
      }}>

        {/* Modal Header */}
        <div style={{
          padding: '20px 26px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#e0f2fe', color: '#0369a1',
              padding: '3px 10px', borderRadius: 12,
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em'
            }}>
              <FiCompass size={13} /> Academic Stage Progression
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 19, fontWeight: 800, color: '#0f172a' }}>
              {isExistingCollegeStudent ? 'Update College Academic Study' : 'Update Your Current Study'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: 6, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px' }}>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#b91c1c', padding: '12px 16px', borderRadius: 10,
              fontSize: 13, marginBottom: 18
            }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              color: '#047857', padding: '14px 18px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, marginBottom: 18
            }}>
              <FiCheckCircle size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* ════════════ STEP 1: Select Stage ════════════ */}
          {step === 1 && !isExistingCollegeStudent && (
            <div>
              <p style={{ fontSize: 14, color: '#475569', marginTop: 0, marginBottom: 20 }}>
                Have you recently moved to a new academic stage? Select your current education level to unlock appropriate academic advisors, study tools, and placement roadmaps.
              </p>

              {/* Current vs Target Stage Preview Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Study</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {currentClassDisplay}
                  </div>
                  <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600, marginTop: 2 }}>School Student</div>
                </div>

                <FiArrowRight size={22} color="#94a3b8" />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Target New Stage</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#047857', marginTop: 2 }}>
                    College Student
                  </div>
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Undergraduate / Engineering</div>
                </div>
              </div>

              {/* Stage Selection Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div
                  onClick={() => setTargetStage('college_student')}
                  style={{
                    border: targetStage === 'college_student' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: targetStage === 'college_student' ? '#eff6ff' : '#fff',
                    borderRadius: 14,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: '#dbeafe', color: '#1d4ed8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18
                    }}>
                      🎓
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>College Student</div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                        Joined an undergraduate college, engineering, arts, science, or medical degree program.
                      </div>
                    </div>
                  </div>
                  {targetStage === 'college_student' && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCheck size={14} />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    background: '#fafafa',
                    borderRadius: 14,
                    padding: '16px 18px',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'not-allowed'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: '#f1f5f9', color: '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18
                    }}>
                      💼
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#475569' }}>Graduate / Job Seeker</div>
                      <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                        Completed college graduation (accessible after college stage).
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Preservation Reassurance Notice */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}>
                <FiShield size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.5 }}>
                  <strong>Your Academic History is Preserved:</strong> Transitioning does not create a new account or delete past data. Your 12th-standard assessment history, AHP & Fuzzy results, and saved resources remain safely stored in your learning profile.
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 2: College & Course Information ════════════ */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  Select College & Enrolled Course
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Filter institutions by Tamil Nadu district, pick your college, and select your enrolled course.
                </p>
              </div>

              {/* District Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  1. College District
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={district}
                    onChange={e => {
                      setDistrict(e.target.value)
                      setSelectedCollege(null)
                      setSelectedCourse('')
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 14,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  >
                    {TN_DISTRICTS_ORDERED.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* College Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  2. Select Institution / College in {district}
                </label>

                {/* College Search input */}
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <FiSearch size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 13 }} />
                  <input
                    type="text"
                    placeholder="Search college by name..."
                    value={collegeSearch}
                    onChange={e => setCollegeSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {loadingColleges ? (
                  <div style={{ padding: 14, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                    Loading colleges in {district}...
                  </div>
                ) : (
                  <div style={{
                    maxHeight: 180,
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    background: '#fff'
                  }}>
                    {filteredColleges.length === 0 ? (
                      <div style={{ padding: 14, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                        No colleges found matching "{collegeSearch}". You can pick another district or clear search.
                      </div>
                    ) : (
                      filteredColleges.map((col, idx) => {
                        const isSel = selectedCollege?.collegeName === col.collegeName || selectedCollege?.name === col.collegeName
                        return (
                          <div
                            key={col._id || idx}
                            onClick={() => {
                              setSelectedCollege(col)
                              setSelectedCourse('')
                            }}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              background: isSel ? '#eff6ff' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: isSel ? 800 : 600, color: isSel ? '#1d4ed8' : '#1e293b' }}>
                                {col.collegeName}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                                {col.type || col.stream || 'Affiliated College'} {col.location ? `• ${col.location}` : ''}
                              </div>
                            </div>
                            {isSel && <FiCheck color="#2563eb" size={16} />}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
                {selectedCollege && (
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, marginTop: 5 }}>
                    ✓ Selected: {selectedCollege.collegeName || selectedCollege.name}
                  </div>
                )}
              </div>

              {/* Course Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  3. Enrolled Course / Degree
                </label>

                {!selectedCollege ? (
                  <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1', fontSize: 13, color: '#64748b' }}>
                    Select a college above to view offered courses.
                  </div>
                ) : loadingCourses ? (
                  <div style={{ padding: 12, fontSize: 13, color: '#64748b' }}>
                    Fetching courses offered by {selectedCollege.collegeName || selectedCollege.name}...
                  </div>
                ) : coursesList.length > 0 && !allowManualCourse ? (
                  <div>
                    {coursesList.length > 6 && (
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <FiSearch size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={courseSearch}
                          onChange={e => setCourseSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 32px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 12.5,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                    <div style={{
                      maxHeight: 160,
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      background: '#fff'
                    }}>
                      {filteredCourses.map((c, i) => {
                        const name = c.courseName || c
                        const isSel = selectedCourse === name
                        return (
                          <div
                            key={c._id || i}
                            onClick={() => setSelectedCourse(name)}
                            style={{
                              padding: '9px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              background: isSel ? '#eff6ff' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: isSel ? 800 : 500, color: isSel ? '#1d4ed8' : '#1e293b' }}>
                              {name}
                            </span>
                            {c.category && (
                              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', background: '#f1f5f9', borderRadius: 6, color: '#475569' }}>
                                {c.category}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => setAllowManualCourse(true)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Course not listed? Enter manually
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. B.E. Computer Science and Engineering"
                      value={selectedCourse}
                      onChange={e => setSelectedCourse(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                    {coursesList.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => setAllowManualCourse(false)}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Pick from college course list
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Academic Year Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  4. Current Academic Year
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                  {ACADEMIC_YEARS.map(yr => {
                    const isSel = academicYear === yr
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setAcademicYear(yr)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: isSel ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isSel ? '#eff6ff' : '#fff',
                          color: isSel ? '#1d4ed8' : '#334155',
                          fontWeight: isSel ? 800 : 600,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        {yr}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Specialisation (If Applicable) */}
              {availableSpecs.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    5. Specialisation / Domain (Optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {availableSpecs.map(sp => {
                      const isSel = specialization === sp
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => setSpecialization(isSel ? '' : sp)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: isSel ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            background: isSel ? '#dbeafe' : '#f8fafc',
                            color: isSel ? '#1e40af' : '#475569',
                            fontSize: 12,
                            fontWeight: isSel ? 700 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          {sp} {isSel ? '✓' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════ STEP 3: Review & Confirmation ════════════ */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  Review Your Updated Study Details
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Please verify your college information. Once confirmed, your portal will activate full college features.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                overflow: 'hidden',
                marginBottom: 20
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Previous Academic Stage</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{currentClassDisplay} (Preserved)</span>
                </div>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>New Academic Stage</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>🎓 College Student</span>
                </div>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>College</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>
                    {selectedCollege?.collegeName || selectedCollege?.name}
                  </span>
                </div>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>District</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{district}</span>
                </div>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Course / Degree</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>
                    {selectedCourse}
                  </span>
                </div>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Academic Year</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{academicYear}</span>
                </div>
                {specialization && (
                  <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Specialisation</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#2563eb' }}>{specialization}</span>
                  </div>
                )}
              </div>

              {/* Safety notice */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <FiShield size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, color: '#1e40af' }}>
                  You are about to update your active stage. All your historical assessments, quiz scores, and saved bookmarks remain safe and connected to your account.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '16px 26px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={submitting}
                style={{
                  background: 'none', border: '1px solid #cbd5e1',
                  borderRadius: 10, padding: '9px 16px',
                  fontSize: 13, fontWeight: 700, color: '#475569',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <FiArrowLeft size={14} /> Back
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {step === 2 && !isExistingCollegeStudent && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={submitting}
                style={{
                  background: 'none', border: '1px solid #cbd5e1',
                  borderRadius: 10, padding: '9px 16px',
                  fontSize: 13, fontWeight: 700, color: '#64748b',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <FiSave size={14} /> Save Draft
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: '#2563eb', border: 'none',
                  borderRadius: 10, padding: '10px 22px',
                  fontSize: 13.5, fontWeight: 700, color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                Continue <FiArrowRight size={15} />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  if (!selectedCollege) {
                    setError('Please select a college/institution.')
                    return
                  }
                  if (!selectedCourse.trim()) {
                    setError('Please select or enter your course.')
                    return
                  }
                  setError('')
                  setStep(3)
                }}
                style={{
                  background: '#2563eb', border: 'none',
                  borderRadius: 10, padding: '10px 22px',
                  fontSize: 13.5, fontWeight: 700, color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                Review & Confirm <FiArrowRight size={15} />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleConfirmTransition}
                disabled={submitting}
                style={{
                  background: '#16a34a', border: 'none',
                  borderRadius: 10, padding: '11px 24px',
                  fontSize: 13.5, fontWeight: 800, color: '#fff',
                  cursor: submitting ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                }}
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="s-spin" size={15} /> Updating Stage...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} /> Confirm & Continue to Dashboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
