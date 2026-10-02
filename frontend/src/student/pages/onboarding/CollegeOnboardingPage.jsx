import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axiosInstance from '../../../config/axios'
import { SBtn, SCard, SInput, SSelect, SAlert, SLoader } from '../../components/ui'
import { taxonomyService } from '../../services/taxonomyService'
import { COLLEGE_FIELDS_DATA } from '../../config/collegeFieldsData'
import { TN_COLLEGES_BY_DISTRICT, TN_DISTRICTS_ORDERED } from '../../data/tnCollegesByDistrict'
import {
  FiArrowRight, FiArrowLeft, FiSave, FiCheckCircle,
  FiBookOpen, FiHome, FiCpu, FiHeart, FiFeather, FiShield,
  FiBriefcase, FiGlobe, FiActivity, FiStar, FiAward, FiCheck, FiZap, FiHelpCircle,
  FiUsers, FiSun, FiBook, FiDollarSign, FiRadio
} from 'react-icons/fi'

const ICON_MAP = {
  FiCpu, FiHeart, FiFeather, FiShield, FiBriefcase, FiGlobe, FiActivity,
  FiUsers, FiZap, FiSun, FiBook, FiDollarSign, FiRadio
}

const TN_DISTRICTS = TN_DISTRICTS_ORDERED

const SKILLS_OPTIONS = [
  // Engineering & Technology
  'Python / Data Science', 'Java / Spring Boot', 'Full Stack Web (React / Node)',
  'AI & Machine Learning', 'Cyber Security / Ethical Hacking', 'Cloud Computing & DevOps',
  'CAD / 3D Modeling (AutoCAD/SolidWorks)', 'Embedded Systems & IoT',
  // Design & Media
  'UI/UX Experience Design (Figma)', 'Graphic Design & Branding', 'Video Production & Editing',
  // Management & Commerce
  'Financial Modeling & Excel', 'Digital Marketing & Analytics', 'Business Analytics (Power BI/Tableau)',
  'Tally & GST Accounting', 'Investment & Wealth Management',
  // Medical & Health
  'Clinical Research & Pharmacovigilance', 'Medical Coding & Billing',
  // Law & Humanities
  'Legal Drafting & Research', 'Public Policy Analysis', 'Counselling & Active Listening',
  // Agriculture & Sciences
  'Precision Agriculture & GIS', 'Research Methodology & Lab Skills', 'Data Analysis with Python/R',
  // Soft Skills
  'Problem Solving & Logic', 'Project Management & Leadership', 'Public Speaking & Communication'
]

const ACADEMIC_INTEREST_OPTIONS = [
  'Applied Industry Projects', 'Academic Research & Publications',
  'Competitive Entrance Exams (GATE / CAT / GRE)', 'Hackathons & Coding Competitions',
  'Internship Readiness & Placement Prep', 'Higher Education / M.Tech / MBA Prep'
]

const CAREER_INTEREST_OPTIONS = [
  // Technology
  'Software Engineering / Product Development', 'AI & Machine Learning Scientist',
  'Data Engineer / Analyst', 'Cybersecurity Analyst', 'Cloud Architect / DevOps Engineer',
  // Core Engineering
  'Core Engineering & R&D', 'Automotive / EV Engineer', 'Robotics & Embedded Systems',
  // Business & Finance
  'Management & Strategy Consulting', 'Investment Banking / Finance', 'Chartered Accountant (CA)',
  'Digital Marketing & Growth', 'Entrepreneurship & Startup Founder',
  // Healthcare & Sciences
  'Healthcare & Medical Specialist', 'Clinical Research Scientist', 'Pharmaceutical Professional',
  'Environmental Scientist / Researcher',
  // Law & Public Services
  'Government Sector & Civil Services', 'Lawyer / Legal Consultant', 'Judicial Services',
  // Education & Social
  'Teacher / Academic Professional', 'Social Worker / Policy Analyst', 'Psychologist / Counsellor',
  // Media & Creative
  'Journalist / Content Creator', 'UX/UI Designer', 'Film & Media Producer',
  // Agriculture
  'Agricultural Scientist / Agronomist', 'Food Technology & Processing'
]

// ── Step 1 sub-component with district-first + backend API filtered college picker ───
function Step1InstitutionBlock({ profile, setProfile }) {
  const [collegeSearch, setCollegeSearch] = React.useState('')
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [dbColleges, setDbColleges] = React.useState([]) // colleges from backend
  const [loadingColleges, setLoadingColleges] = React.useState(false)
  const [collegeError, setCollegeError] = React.useState('')
  const [selectedDbCollege, setSelectedDbCollege] = React.useState(null)
  const [manualCollegeName, setManualCollegeName] = React.useState(profile.institution || '')
  const searchInputRef = React.useRef(null)
  const dropdownRef = React.useRef(null)

  // Synchronize initial selection once colleges are loaded
  React.useEffect(() => {
    if (profile.institution) {
      const match = dbColleges.find(c => c.collegeName === profile.institution)
      if (match) {
        setSelectedDbCollege(match.collegeName)
        setManualCollegeName('')
      } else {
        setSelectedDbCollege(null)
        setManualCollegeName(profile.institution)
      }
    } else {
      setSelectedDbCollege(null)
      setManualCollegeName('')
    }
  }, [dbColleges])

  // Load colleges from backend when district changes
  React.useEffect(() => {
    if (!profile.institutionDistrict) {
      setDbColleges([])
      setCollegeError('')
      return
    }
    setLoadingColleges(true)
    setCollegeError('')
    axiosInstance
      .get(`/colleges/by-district/${encodeURIComponent(profile.institutionDistrict)}`)
      .then(res => {
        if (res.data?.success) {
          setDbColleges(res.data.data || [])
          if ((res.data.data || []).length === 0) {
            setCollegeError(res.data.message || `No colleges found in ${profile.institutionDistrict}.`)
          }
        }
      })
      .catch(() => {
        setCollegeError('Unable to load colleges. Please try again.')
        // Fall back to static list from local data
        const staticList = TN_COLLEGES_BY_DISTRICT[profile.institutionDistrict] || []
        setDbColleges(staticList.map(name => ({ collegeName: name, _id: name })))
      })
      .finally(() => setLoadingColleges(false))
  }, [profile.institutionDistrict])

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filter colleges by search term (district-scoped)
  const filtered = collegeSearch.trim()
    ? dbColleges.filter(c => c.collegeName.toLowerCase().includes(collegeSearch.toLowerCase()))
    : dbColleges

  const selectCollege = (college) => {
    const name = college.collegeName || college
    setSelectedDbCollege(name)
    setManualCollegeName('')
    setProfile(prev => ({ ...prev, institution: name }))
    setCollegeSearch('')
    setDropdownOpen(false)
    if (searchInputRef.current) searchInputRef.current.blur()
  }

  const clearSelectedCollege = () => {
    setSelectedDbCollege(null)
    setProfile(prev => ({ ...prev, institution: '' }))
    setCollegeSearch('')
    setDropdownOpen(false)
  }

  const handleManualChange = (val) => {
    setSelectedDbCollege(null)
    setManualCollegeName(val)
    setProfile(prev => ({ ...prev, institution: val }))
  }

  const changeDistrict = (newDistrict) => {
    setSelectedDbCollege(null)
    setManualCollegeName('')
    setProfile(prev => ({ ...prev, institutionDistrict: newDistrict, institution: '' }))
    setCollegeSearch('')
    setDropdownOpen(false)
    setDbColleges([])
    setCollegeError('')
  }

  return (
    <div className="s-anim-up">
      <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
        Step 1: Institution & Academic Level
      </h3>
      <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
        Where are you currently pursuing your college education?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* 1. DISTRICT FIRST */}
        <SSelect
          label="District Location of College *"
          value={profile.institutionDistrict}
          onChange={e => changeDistrict(e.target.value)}
          options={[
            { value: '', label: '— Select District —' },
            ...TN_DISTRICTS_ORDERED.map(d => ({ value: d, label: d }))
          ]}
        />

        {/* 2. COLLEGE PICKER (only when district is selected) */}
        {profile.institutionDistrict ? (
          <div>
            <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 8, color: 'var(--s-text)' }}>
              College / Institution Name *
              {!loadingColleges && dbColleges.length > 0 && (
                <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--s-text3)', marginLeft: 8 }}>
                  ({dbColleges.length} institutions in {profile.institutionDistrict})
                </span>
              )}
            </label>

            {/* ── SELECTED STATE: shows compact chip when college selected from list ── */}
            {selectedDbCollege ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: 12,
                fontSize: 14, fontWeight: 700,
                color: '#166534',
              }}>
                <span style={{ fontSize: 18 }}>🎓</span>
                <span style={{ flex: 1 }}>{selectedDbCollege}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, background: '#dcfce7',
                  color: '#166534', padding: '2px 8px', borderRadius: 10,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  Selected from list
                </span>
                <button
                  type="button"
                  onClick={clearSelectedCollege}
                  title="Remove selection"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', fontSize: 18, lineHeight: 1,
                    padding: '2px 4px', borderRadius: 6,
                    transition: 'color 0.1s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  ×
                </button>
              </div>
            ) : (
              /* ── SEARCH STATE: shows dropdown when no college selected ── */
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                {/* Search bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  border: '1px solid var(--s-border)',
                  borderRadius: dropdownOpen && filtered.length > 0 ? '12px 12px 0 0' : 12,
                  background: '#fff',
                  boxShadow: dropdownOpen ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s ease'
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={loadingColleges ? 'Loading colleges...' : `Search colleges in ${profile.institutionDistrict}...`}
                    value={collegeSearch}
                    disabled={loadingColleges}
                    onChange={e => {
                      setCollegeSearch(e.target.value)
                      if (!dropdownOpen) setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    style={{
                      border: 'none', outline: 'none', background: 'none',
                      fontSize: 13, flex: 1, color: 'var(--s-text)',
                      fontFamily: 'inherit',
                      cursor: loadingColleges ? 'wait' : 'text'
                    }}
                  />
                  {collegeSearch && (
                    <button
                      type="button"
                      onClick={() => { setCollegeSearch(''); searchInputRef.current?.focus() }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)', fontSize: 16, lineHeight: 1 }}
                    >✕</button>
                  )}
                  {!loadingColleges && (
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)', fontSize: 12, lineHeight: 1, padding: '0 2px' }}
                    >
                      {dropdownOpen ? '▲' : '▼'}
                    </button>
                  )}
                  {loadingColleges && (
                    <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>Loading…</span>
                  )}
                </div>

                {/* Dropdown list */}
                {dropdownOpen && !loadingColleges && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, zIndex: 100,
                    background: '#fff',
                    border: '1px solid var(--s-border)', borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: 280, overflowY: 'auto',
                    overscrollBehavior: 'contain'
                  }}>
                    {collegeError && dbColleges.length === 0 ? (
                      <div style={{ padding: '14px 16px', fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>
                        ⚠️ {collegeError}
                      </div>
                    ) : filtered.length === 0 ? (
                      <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--s-text3)', textAlign: 'center' }}>
                        No colleges match your search. Use manual entry below.
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: '6px 14px 4px', fontSize: 11, color: 'var(--s-text3)', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {filtered.length} college{filtered.length !== 1 ? 's' : ''} found
                        </div>
                        {filtered.map((college, idx) => {
                          const name = college.collegeName || college
                          const type = college.type || college.stream || ''
                          return (
                            <button
                              key={college._id || name || idx}
                              type="button"
                              onClick={() => selectCollege(college)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '9px 16px', border: 'none',
                                background: 'transparent',
                                color: 'var(--s-text)',
                                fontSize: 13, fontWeight: 500,
                                cursor: 'pointer',
                                borderLeft: '3px solid transparent',
                                transition: 'background 0.1s',
                                borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#f0fdf4'
                                e.currentTarget.style.borderLeftColor = 'var(--s-primary)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.borderLeftColor = 'transparent'
                              }}
                            >
                              <span style={{ display: 'block', fontWeight: 600 }}>{name}</span>
                              {type && (
                                <span style={{ fontSize: 11, color: 'var(--s-text3)', marginTop: 2, display: 'block' }}>
                                  {type}{college.location ? ` · ${college.location}` : ''}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── MANUAL ENTRY ── */}
            <div style={{ marginTop: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                opacity: selectedDbCollege ? 0.4 : 1,
                transition: 'opacity 0.2s ease'
              }}>
                <div style={{ height: 1, flex: 1, background: 'var(--s-border)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-text3)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  or type manually
                </span>
                <div style={{ height: 1, flex: 1, background: 'var(--s-border)' }} />
              </div>
              <p style={{ fontSize: 12, color: selectedDbCollege ? '#94a3b8' : 'var(--s-text3)', margin: '0 0 6px' }}>
                {selectedDbCollege
                  ? '✓ College selected from list above. Click × to type manually.'
                  : "Can't find your college in the list? Type it manually:"}
              </p>
              <input
                type="text"
                placeholder={selectedDbCollege ? 'Disabled – college already selected from list' : 'Type your college name...'}
                value={selectedDbCollege ? '' : manualCollegeName}
                disabled={!!selectedDbCollege}
                onChange={e => handleManualChange(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: selectedDbCollege ? '1px dashed #cbd5e1' : manualCollegeName ? '1.5px solid var(--s-primary, #047857)' : '1px dashed var(--s-border)',
                  fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  background: selectedDbCollege ? '#f8fafc' : '#fff',
                  color: selectedDbCollege ? '#94a3b8' : 'var(--s-text)',
                  cursor: selectedDbCollege ? 'not-allowed' : 'text',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              />
              {manualCollegeName && !selectedDbCollege && (
                <div style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 12, color: '#166534', fontWeight: 600, background: '#f0fdf4',
                  padding: '6px 12px', borderRadius: 8, border: '1px solid #bbf7d0'
                }}>
                  <span>✓ Using manual college: <strong>{manualCollegeName}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleManualChange('')}
                    style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
                    title="Clear manual entry"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Show prompt when no district selected yet */
          <div style={{
            padding: '16px 20px', background: '#eff6ff',
            border: '1px solid #bfdbfe', borderRadius: 12,
            fontSize: 13, color: '#1d4ed8', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 20 }}>📍</span>
            Select your district above to see all colleges in your area.
          </div>
        )}

        {/* 3. ACADEMIC YEAR */}
        <SSelect
          label="Current Academic Year"
          value={profile.currentYear}
          onChange={e => setProfile(prev => ({ ...prev, currentYear: e.target.value }))}
          options={[
            { value: '1st Year', label: '1st Year (Freshman)' },
            { value: '2nd Year', label: '2nd Year (Sophomore)' },
            { value: '3rd Year', label: '3rd Year (Junior)' },
            { value: '4th Year', label: '4th Year (Senior)' },
            { value: 'Postgraduate / Master', label: 'Postgraduate / Master Degree' }
          ]}
        />
      </div>
    </div>
  )
}


export default function CollegeOnboardingPage() {
  const { student, updateStudent } = useStudentAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlStep = parseInt(searchParams.get('step'), 10)
  const [step, setStep] = useState(urlStep >= 1 && urlStep <= 6 ? urlStep : 1)

  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10)
    if (s >= 1 && s <= 6) {
      setStep(s)
    }
  }, [searchParams])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Dynamic Taxonomy State
  const [fieldsList, setFieldsList] = useState([])
  const [degreesList, setDegreesList] = useState([])
  const [domainsList, setDomainsList] = useState([])
  const [specsList, setSpecsList] = useState([])
  const [certsList, setCertsList] = useState([])

  const [loadingDegrees, setLoadingDegrees] = useState(false)
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [loadingSpecs, setLoadingSpecs] = useState(false)

  // Profile Form State
  const [profile, setProfile] = useState({
    institution: '',
    institutionDistrict: '',
    currentYear: '',
    studyMode: 'Regular Full-Time',
    fieldId: '',
    degreeProgramme: '',
    domain: '',
    specialization: '',
    certifications: [],
    academicInterests: [],
    careerInterests: [],
    skills: [],
    strengths: []
  })

  // Step 6: MongoDB Discovery Assessment State
  const [discoveryQuestions, setDiscoveryQuestions] = useState([])
  const [discoveryAnswers, setDiscoveryAnswers] = useState({})
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [evaluatingAssessment, setEvaluatingAssessment] = useState(false)
  const [discoveryResult, setDiscoveryResult] = useState(null)
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showCelebrationScreen, setShowCelebrationScreen] = useState(false)
  const [calcSteps, setCalcSteps] = useState({ step1: false, step2: false, step3: false, step4: false })
  const [unansweredHighlight, setUnansweredHighlight] = useState(null) // questionId of highlighted unanswered Q
  const questionRefs = React.useRef({}) // refs keyed by questionId for scroll-to navigation

  // Step 5 Flip-Flap Cards & AHP Priorities State
  const [flippedCards, setFlippedCards] = useState({})
  const [ahpPriorities, setAhpPriorities] = useState({})

  // Step 5 Pairwise AHP Career Discovery State (Deterministically Driven by Step 4)
  const [ahpCandidates, setAhpCandidates] = useState([])
  const [ahpPairs, setAhpPairs] = useState([])
  const [ahpPairIndex, setAhpPairIndex] = useState(0)
  const [ahpComparisonsMap, setAhpComparisonsMap] = useState({})
  const [selectedDomainInPair, setSelectedDomainInPair] = useState(null)
  const [selectedIntensity, setSelectedIntensity] = useState(3)
  const [ahpDiscoveryResult, setAhpDiscoveryResult] = useState(null)
  const [loadingAhpDiscovery, setLoadingAhpDiscovery] = useState(false)
  const [calculatingAhpDiscovery, setCalculatingAhpDiscovery] = useState(false)

  // Load candidate domains for Step 5 & Step 6
  useEffect(() => {
    if (step === 5 || step === 6) {
      if ((ahpCandidates.length < 2 || ahpPairs.length === 0) && !ahpDiscoveryResult) {
        loadAhpDiscoveryData()
      }
    }
  }, [step, profile.domain, profile.specialization])

  const loadAhpDiscoveryData = async (forceFresh = false) => {
    setLoadingAhpDiscovery(true)
    try {
      // Check if saved AHP result exists on backend first (404 expected for new students)
      if (!forceFresh) {
        try {
          const savedRes = await axiosInstance.get('/onboarding/ahp/result')
          if (savedRes.data?.success && savedRes.data.ahpProfile) {
            const saved = savedRes.data.ahpProfile
            const savedBranch = saved.branchId || ''
            const savedSpecs = Array.isArray(saved.selectedSpecializations) ? saved.selectedSpecializations.join(', ') : ''
            const currentSpecs = profile.specialization || ''

            // Only use saved result if branch & selected specializations match current profile and candidates >= 2
            if (savedBranch === profile.domain && savedSpecs === currentSpecs && (saved.candidateDomains || []).length >= 2) {
              setAhpCandidates(saved.candidateDomains || [])
              setAhpDiscoveryResult(saved)
              setLoadingAhpDiscovery(false)
              return
            }
          }
        } catch (err) {
          // Ignored: 404 is normal if the student has not completed Step 5 yet
        }
      }

      // Reset old result if selections changed
      setAhpDiscoveryResult(null)

      // Otherwise fetch candidate domains based on Step 4 branch & specializations
      const branchId = profile.domain || 'cse'
      const specializations = profile.specialization || ''
      const res = await axiosInstance.get(`/onboarding/ahp/domains?branchId=${encodeURIComponent(branchId)}&specializations=${encodeURIComponent(specializations)}`)
      
      if (res.data?.success && Array.isArray(res.data.candidateDomains)) {
        const candidates = res.data.candidateDomains
        setAhpCandidates(candidates)

        // Generate all unique pairwise combinations: N * (N - 1) / 2
        const pairs = []
        for (let i = 0; i < candidates.length; i++) {
          for (let j = i + 1; j < candidates.length; j++) {
            pairs.push({
              pairKey: `${candidates[i].id}_vs_${candidates[j].id}`,
              domainA: candidates[i],
              domainB: candidates[j]
            })
          }
        }
        setAhpPairs(pairs)

        // Restore saved comparisons from localStorage if available and matching specializations
        const localSaved = localStorage.getItem('ahp_pairwise_progress')
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved)
            if (parsed.comparisonsMap && parsed.branchId === branchId && parsed.specializations === specializations) {
              setAhpComparisonsMap(parsed.comparisonsMap)
              setAhpPairIndex(Math.min(parsed.pairIndex || 0, pairs.length - 1))
            } else {
              localStorage.removeItem('ahp_pairwise_progress')
              setAhpComparisonsMap({})
              setAhpPairIndex(0)
            }
          } catch (e) {
            localStorage.removeItem('ahp_pairwise_progress')
            setAhpComparisonsMap({})
            setAhpPairIndex(0)
          }
        } else {
          setAhpComparisonsMap({})
          setAhpPairIndex(0)
        }
      }
    } catch (err) {
      console.warn('Failed to load AHP discovery candidates', err)
    } finally {
      setLoadingAhpDiscovery(false)
    }
  }

  const handleSelectPairwiseDomain = (selectedDomain) => {
    setSelectedDomainInPair(selectedDomain)
    setSelectedIntensity(3) // Default to Slight Preference (3)
  }

  const handleConfirmPairwiseSelection = async () => {
    if (!selectedDomainInPair) return

    const currentPair = ahpPairs[ahpPairIndex]
    if (!currentPair) return

    const updatedMap = {
      ...ahpComparisonsMap,
      [currentPair.pairKey]: {
        domainA: currentPair.domainA.id,
        domainB: currentPair.domainB.id,
        selectedDomain: selectedDomainInPair.id,
        intensity: Number(selectedIntensity) || 3
      }
    }

    setAhpComparisonsMap(updatedMap)
    setSelectedDomainInPair(null)

    // Save progress locally
    localStorage.setItem('ahp_pairwise_progress', JSON.stringify({
      branchId: profile.domain || 'cse',
      specializations: profile.specialization || '',
      comparisonsMap: updatedMap,
      pairIndex: ahpPairIndex + 1
    }))

    // If more pairs remain, move to next pair
    if (ahpPairIndex + 1 < ahpPairs.length) {
      setAhpPairIndex(prev => prev + 1)
    } else {
      // All comparisons completed! Compute AHP matrix & save to backend
      await finishAhpDiscovery(updatedMap)
    }
  }

  const finishAhpDiscovery = async (finalMap = ahpComparisonsMap) => {
    setCalculatingAhpDiscovery(true)
    setError('')
    try {
      const comparisonsList = Object.values(finalMap)
      const payload = {
        branchId: profile.domain || 'cse',
        selectedSpecializations: profile.specialization ? profile.specialization.split(',').map(s => s.trim()) : [],
        candidateDomains: ahpCandidates,
        pairwiseComparisons: comparisonsList
      }

      const res = await axiosInstance.post('/onboarding/ahp/save', payload)
      if (res.data?.success && res.data.ahpProfile) {
        setAhpDiscoveryResult(res.data.ahpProfile)
        setProfile(prev => ({
          ...prev,
          careerInterests: res.data.ahpProfile.candidateDomainsForStep6?.map(d => d.name) || []
        }))
        localStorage.removeItem('ahp_pairwise_progress')
      }
    } catch (err) {
      setError('Failed to compute AHP matrix result. Please try again.')
    } finally {
      setCalculatingAhpDiscovery(false)
    }
  }

  const handleReviseAhpComparisons = async () => {
    setAhpDiscoveryResult(null)
    setAhpPairIndex(0)
    setAhpComparisonsMap({})
    localStorage.removeItem('ahp_pairwise_progress')
    try {
      await axiosInstance.post('/onboarding/ahp/revise')
    } catch (e) {}
    loadAhpDiscoveryData()
  }

  // Load Fields Taxonomy on Mount
  useEffect(() => {
    const initTaxonomy = async () => {
      try {
        const fields = await taxonomyService.getFields()
        setFieldsList(fields)

        const token = localStorage.getItem('studentToken')
        if (token) {
          const res = await axiosInstance.get('/college-profile/my-profile')
          if (res.data?.success && res.data.profile) {
            const p = res.data.profile
            setProfile(prev => ({
              ...prev,
              institution: p.institution || prev.institution,
              institutionDistrict: p.institutionDistrict || prev.institutionDistrict,
              currentYear: p.currentYear || prev.currentYear,
              studyMode: p.studyMode || prev.studyMode,
              fieldId: p.field || prev.fieldId,
              degreeProgramme: p.degreeProgramme || prev.degreeProgramme,
              domain: p.domain || prev.domain,
              specialization: p.specialization || prev.specialization,
              certifications: p.certifications || prev.certifications,
              academicInterests: p.academicInterests?.length ? p.academicInterests : prev.academicInterests,
              careerInterests: p.careerInterests?.length ? p.careerInterests : prev.careerInterests,
              skills: p.skills?.length ? p.skills : prev.skills
            }))
            const qStep = parseInt(searchParams.get('step'), 10)
            if (qStep >= 1 && qStep <= 6) {
              setStep(qStep)
            } else if (p.currentStep && p.currentStep > 1) {
              setStep(Math.min(6, p.currentStep))
            }
          }
        }
      } catch (err) {
        console.warn('Using default profile state')
      } finally {
        setLoading(false)
      }
    }
    initTaxonomy()
  }, [])

  // Load Degrees, Domains, Certifications when fieldId changes
  useEffect(() => {
    const loadFieldChildren = async () => {
      setLoadingDegrees(true)
      setLoadingDomains(true)
      try {
        const degrees = await taxonomyService.getDegrees(profile.fieldId)
        const domains = await taxonomyService.getDomains(profile.fieldId)
        const certs = await taxonomyService.getCertifications(profile.fieldId)

        setDegreesList(degrees)
        setDomainsList(domains)
        setCertsList(certs)

        const validDeg = degrees.find(d => d.name === profile.degreeProgramme) ? profile.degreeProgramme : (degrees[0]?.name || '')
        const validDom = domains.find(d => d.name === profile.domain) ? profile.domain : (domains[0]?.name || '')

        setProfile(prev => ({
          ...prev,
          degreeProgramme: validDeg,
          domain: validDom
        }))
      } catch (err) {
        console.warn('Failed to load field children taxonomy')
      } finally {
        setLoadingDegrees(false)
        setLoadingDomains(false)
      }
    }
    loadFieldChildren()
  }, [profile.fieldId])

  // Load Specializations when domain changes
  useEffect(() => {
    const loadSpecializations = async () => {
      if (!profile.domain) return
      setLoadingSpecs(true)
      try {
        const specs = await taxonomyService.getSpecializations(profile.fieldId, profile.domain)
        setSpecsList(specs)
        const validSpec = specs.find(s => s.name === profile.specialization) ? profile.specialization : (specs[0]?.name || '')
        setProfile(prev => ({ ...prev, specialization: validSpec }))
      } catch (err) {
        console.warn('Failed to load specializations taxonomy')
      } finally {
        setLoadingSpecs(false)
      }
    }
    loadSpecializations()
  }, [profile.fieldId, profile.domain])

  // Fetch MongoDB Career Discovery Questions when Step 6 is reached
  useEffect(() => {
    if (step === 6) {
      fetchDiscoveryQuestions()
    }
  }, [step])

  const fetchDiscoveryQuestions = async () => {
    setLoadingQuestions(true)
    try {
      console.log("[STEP 6] RAW AHP CANDIDATES:", ahpCandidates)
      const candidateList = ahpDiscoveryResult?.candidateDomainsForStep6 || ahpDiscoveryResult?.candidateDomains || ahpCandidates || []
      console.log("[STEP 6] CANDIDATE DOMAIN OBJECTS:", candidateList)

      let extractedIds = candidateList.map(d => typeof d === 'string' ? d : (d.id || d.domainId || d.name)).filter(Boolean)

      const DOMAIN_ALIAS_MAP = {
        'full_stack': 'full_stack',
        'Full Stack & Software Engineering': 'full_stack',
        'Full Stack Web & Mobile Development': 'full_stack',
        'software_engineering': 'software_engineering',
        'Software Engineering & Architecture': 'software_engineering',
        'ai_ml': 'ai_ml',
        'AI & Machine Learning': 'ai_ml',
        'Artificial Intelligence & Machine Learning': 'ai_ml',
        'data_science': 'data_science',
        'Data Science & Big Data Analytics': 'data_science',
        'cyber_security': 'cyber_security',
        'Cyber Security & Ethical Hacking': 'cyber_security',
        'cloud_devops': 'cloud_devops',
        'Cloud Computing & DevOps': 'cloud_devops',
        'algorithms_systems': 'algorithms_systems',
        'Algorithms & System Programming': 'algorithms_systems',

        // 17 B.E. ECE Domains
        'vlsi_chip_design': 'vlsi_chip_design',
        'VLSI & Chip Design': 'vlsi_chip_design',
        'vlsi_design': 'vlsi_chip_design',
        'VLSI & Semiconductor Chip Design': 'vlsi_chip_design',
        'embedded_systems': 'embedded_systems',
        'Embedded Systems': 'embedded_systems',
        'Embedded Systems & Microcontrollers': 'embedded_systems',
        'embedded_iot': 'embedded_systems',
        'Embedded Systems & IoT': 'embedded_systems',
        'iot': 'iot',
        'IoT': 'iot',
        'IoT & Smart Sensor Systems': 'iot',
        'communication_telecom': 'communication_telecom',
        'Communication / Telecom': 'communication_telecom',
        'Communication/Telecom': 'communication_telecom',
        'Wireless Communication & 5G/6G Networks': 'communication_telecom',
        'rf_microwave': 'rf_microwave',
        'RF & Microwave': 'rf_microwave',
        'RF & Microwave Engineering': 'rf_microwave',
        'signal_processing': 'signal_processing',
        'Signal Processing': 'signal_processing',
        'Signal Processing & Image Analysis': 'signal_processing',
        'image_processing_cv': 'image_processing_cv',
        'Image Processing / Computer Vision': 'image_processing_cv',
        'Image Processing/Computer Vision': 'image_processing_cv',
        'automation_control': 'automation_control',
        'Automation & Control': 'automation_control',
        'robotics': 'robotics',
        'Robotics': 'robotics',
        'robotics_automation': 'robotics',
        'Robotics & Automation Engineering': 'robotics',
        'hardware_pcb_design': 'hardware_pcb_design',
        'Hardware / PCB Design': 'hardware_pcb_design',
        'Hardware/PCB Design': 'hardware_pcb_design',
        'automotive_electronics': 'automotive_electronics',
        'Automotive Electronics': 'automotive_electronics',
        'power_electronics': 'power_electronics',
        'Power Electronics': 'power_electronics',
        'medical_electronics': 'medical_electronics',
        'Medical Electronics': 'medical_electronics',
        'satellite_aerospace_avionics': 'satellite_aerospace_avionics',
        'Satellite / Aerospace / Avionics': 'satellite_aerospace_avionics',
        'Satellite/Aerospace/Avionics': 'satellite_aerospace_avionics',
        'semiconductor_testing': 'semiconductor_testing',
        'Semiconductor Testing': 'semiconductor_testing',
        'aiml_ece': 'aiml_ece',
        'AI / ML for ECE': 'aiml_ece',
        'AI/ML for ECE': 'aiml_ece',
        'software_it': 'software_it',
        'Software / IT': 'software_it',
        'Software/IT': 'software_it',

        'ev_powertrain': 'ev_powertrain',
        'Electric Vehicle & Power Systems': 'ev_powertrain',
        'cad_structural': 'cad_structural',
        'CAD Modeling & Structural Engineering': 'cad_structural'
      };

      let candidateIds = extractedIds.map(id => DOMAIN_ALIAS_MAP[id] || id).filter(Boolean)

      if (candidateIds.length === 0) {
        const isEceBranch = profile.domain && /ece|electronics|communication/i.test(profile.domain);
        candidateIds = isEceBranch 
          ? ['vlsi_chip_design', 'embedded_systems', 'iot'] 
          : ['software_engineering', 'ai_ml', 'cloud_devops'];
      }

      console.log("[STEP 6] CANDIDATE DOMAIN IDS:", candidateIds)

      const branchParam = profile.domain || 'CSE'
      const requestUrl = `/onboarding/discovery/questions?branch=${encodeURIComponent(branchParam)}&domains=${encodeURIComponent(candidateIds.join(','))}`
      console.log("[STEP 6] FINAL REQUEST URL:", requestUrl)

      const res = await axiosInstance.get(requestUrl)
      console.log("[STEP 6] RAW API RESPONSE:", res.data)
      console.log("[STEP 6] RESPONSE TYPE:", typeof res.data)
      console.log("[STEP 6] RESPONSE:", JSON.stringify(res.data, null, 2))

      const retrievedQuestions = res.data?.questions || res.data?.data?.questions || []
      setDiscoveryQuestions(retrievedQuestions)
      if (Array.isArray(res.data?.domains) && res.data.domains.length > 0) {
        setAhpCandidates(res.data.domains)
      }

      console.log("[STEP 6] Questions loaded:", retrievedQuestions.length)
      console.log("[STEP 6] Question source: MongoDB")
    } catch (err) {
      console.warn('Failed to fetch discovery questions from MongoDB', err)
      setDiscoveryQuestions([])
    } finally {
      setLoadingQuestions(false)
      setQuestionStartTime(Date.now())
    }
  }

  const handleSelectAnswer = async (qKey, optId) => {
    const isChanged = !!discoveryAnswers[qKey]
    const responseTime = Math.round((Date.now() - questionStartTime) / 1000)

    setDiscoveryAnswers(prev => ({ ...prev, [qKey]: optId }))
    setQuestionStartTime(Date.now())

    try {
      await axiosInstance.post('/onboarding/discovery/answer', {
        questionId: qKey,
        selectedOption: optId,
        responseTime,
        answerChanged: isChanged
      })
    } catch (err) {
      console.warn('Answer recording failed', err)
    }
  }

  const handleEvaluateDiscovery = async () => {
    // ── FRONTEND VALIDATION: find first unanswered question ──────────────────
    const allQuestionsShown = discoveryQuestions // evaluate all questions regardless of filter
    const firstUnanswered = allQuestionsShown.find(q => {
      const qKey = q.questionId || q._id
      return !discoveryAnswers[qKey]
    })

    if (firstUnanswered) {
      const qKey = firstUnanswered.questionId || firstUnanswered._id
      // highlight this question
      setUnansweredHighlight(qKey)
      // reset difficulty filter to show all so the question is visible
      setDifficultyFilter('All')
      // scroll to the question
      setTimeout(() => {
        const el = questionRefs.current[qKey]
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // try to focus first option button
          const firstOpt = el.querySelector('button[data-opt]')
          if (firstOpt) firstOpt.focus()
        }
      }, 100)
      setError(`Please answer Question ${allQuestionsShown.indexOf(firstUnanswered) + 1} before submitting.`)
      return
    }

    const formattedAnswers = Object.entries(discoveryAnswers).map(([qKey, optId]) => ({
      questionId: qKey,
      selectedOption: optId,
      optionId: optId
    }))

    if (formattedAnswers.length === 0) {
      setError('Please select an option for at least one question to run evaluation.')
      return
    }

    setEvaluatingAssessment(true)
    setError('')
    setUnansweredHighlight(null)
    setCalcSteps({ step1: false, step2: false, step3: false, step4: false })

    try {
      setCalcSteps(s => ({ ...s, step1: true }))
      await new Promise(r => setTimeout(r, 200))
      setCalcSteps(s => ({ ...s, step2: true }))
      await new Promise(r => setTimeout(r, 200))

      // Send all required question IDs for backend validation
      const requiredQuestionIds = discoveryQuestions.map(q => q.questionId || q._id).filter(Boolean)

      const res = await axiosInstance.post('/onboarding/discovery/evaluate', {
        answers: formattedAnswers,
        ahpPriorityWeights: ahpDiscoveryResult?.priorityWeights || ahpDiscoveryResult?.priorityVector || {},
        requiredQuestionIds
      })

      setCalcSteps(s => ({ ...s, step3: true }))
      await new Promise(r => setTimeout(r, 200))
      setCalcSteps(s => ({ ...s, step4: true }))
      await new Promise(r => setTimeout(r, 200))

      if (res.data?.success && res.data.evaluation) {
        setDiscoveryResult(res.data.evaluation)
        setShowCelebrationScreen(true)
        if (res.data.evaluation.recommendedDomain) {
          setProfile(prev => ({ ...prev, domain: res.data.evaluation.recommendedDomain.domainName }))
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (res.data?.code === 'INCOMPLETE_ASSESSMENT') {
        // backend says some questions unanswered
        const firstUnansweredId = res.data.unansweredQuestionIds?.[0]
        if (firstUnansweredId) {
          setUnansweredHighlight(firstUnansweredId)
          setDifficultyFilter('All')
          setTimeout(() => {
            const el = questionRefs.current[firstUnansweredId]
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
        }
        setError(`Please answer all questions before submitting. ${res.data.unansweredQuestionIds?.length || 0} question(s) remain.`)
      }
    } catch (err) {
      // Handle 422 INCOMPLETE_ASSESSMENT from backend
      if (err.response?.status === 422 && err.response.data?.code === 'INCOMPLETE_ASSESSMENT') {
        const firstUnansweredId = err.response.data.unansweredQuestionIds?.[0]
        if (firstUnansweredId) {
          setUnansweredHighlight(firstUnansweredId)
          setDifficultyFilter('All')
          setTimeout(() => {
            const el = questionRefs.current[firstUnansweredId]
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
          setError(`Please answer all questions. ${err.response.data.unansweredQuestionIds.length} unanswered.`)
        }
      } else {
        setError('Evaluation failed. Please try again.')
      }
    } finally {
      setEvaluatingAssessment(false)
    }
  }

  const currentFieldName = fieldsList.find(f => f.fieldId === profile.fieldId)?.fieldName || 'Engineering & Technology'
  const progressPercent = Math.round((step / 6) * 100)

  const handleFieldSelect = (selectedFieldId) => {
    if (selectedFieldId === profile.fieldId) return
    setProfile(prev => ({
      ...prev,
      fieldId: selectedFieldId,
      degreeProgramme: '',
      domain: '',
      specialization: '',
      certifications: []
    }))
  }

  const toggleArrayItem = (key, item) => {
    setProfile(prev => {
      const arr = prev[key] || []
      const exists = arr.includes(item)
      const next = exists ? arr.filter(i => i !== item) : [...arr, item]
      return { ...prev, [key]: next }
    })
  }

  const saveProgressToBackend = async (isFinal = false) => {
    try {
      const token = localStorage.getItem('studentToken')
      if (token) {
        await axiosInstance.post(
          '/college-profile/save',
          {
            institution: profile.institution,
            institutionDistrict: profile.institutionDistrict,
            currentYear: profile.currentYear,
            studyMode: profile.studyMode,
            field: profile.fieldId,
            degreeProgramme: profile.degreeProgramme,
            domain: profile.domain,
            specialization: profile.specialization,
            certifications: profile.certifications,
            academicInterests: profile.academicInterests,
            careerInterests: profile.careerInterests,
            skills: profile.skills,
            strengths: profile.strengths,
            currentStep: step,
            isFinalStep: isFinal
          }
        )
      }
    } catch (err) {
      console.warn('Save progress to backend failed')
    }
  }

  const handleSaveAndLater = async () => {
    setSubmitting(true)
    await saveProgressToBackend(false)
    updateStudent({ onboardingCompleted: false, collegeProfileSaved: true })
    setSubmitting(false)
    navigate('/student/dashboard')
  }

  const handleNextStep = async () => {
    setError('')
    if (step === 1 && !profile.institutionDistrict) {
      setError('Please select your district first')
      return
    }
    if (step === 1 && !profile.institution.trim()) {
      setError('Please enter or select your college / institution name')
      return
    }

    await saveProgressToBackend(false)

    if (step < 6) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    setError('')
    if (step > 1) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCompleteWizard = async () => {
    setSubmitting(true)
    try {
      await saveProgressToBackend(true)
      updateStudent({ onboardingCompleted: true, userType: 'college_student', collegeProfileSaved: true })
      navigate('/student/dashboard')
    } catch (err) {
      setError('Failed to finalize onboarding. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <SLoader label="Loading Academic Profile Setup..." />
      </div>
    )
  }

  return (
    <div className="student-root" style={{ background: 'var(--s-bg)', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <FiBookOpen size={14} /> College Student Academic Telemetry
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: 'var(--s-text)', margin: '4px 0' }}>
            Build Your College Academic Profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', maxWidth: 640, margin: '0 auto' }}>
            Personalized academic degree, domain branch, and xAI Grok skill assessment.
          </p>
        </div>

        {/* Progress Bar Header */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 24px', marginBottom: 28, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, fontWeight: 800 }}>
            <span style={{ color: 'var(--s-primary)' }}>STEP {step} OF 6</span>
            <span style={{ color: 'var(--s-text3)' }}>{progressPercent}% Completed</span>
          </div>
          <div style={{ height: 8, width: '100%', background: 'var(--s-surface2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--s-primary)', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {error && <SAlert type="error" message={error} onClose={() => setError('')} style={{ marginBottom: 20 }} />}

        <SCard style={{ borderRadius: 24, padding: 36, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow-md)' }}>

          {/* STEP 1: Institution & Academic Level */}
          {step === 1 && (
            <Step1InstitutionBlock
              profile={profile}
              setProfile={setProfile}
            />
          )}

          {/* STEP 2: Major Field */}
          {step === 2 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
                Step 2: Select Major Academic Field
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
                Choose the primary domain area of your degree or diploma programme.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
                {COLLEGE_FIELDS_DATA.map(f => {
                  const isSelected = profile.fieldId === f.id
                  const IconComp = ICON_MAP[f.icon] || FiBookOpen
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleFieldSelect(f.id)}
                      style={{
                        padding: 22, borderRadius: 18, cursor: 'pointer',
                        border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                        background: isSelected ? 'var(--s-primary-l)' : '#fff',
                        boxShadow: isSelected ? 'var(--s-shadow-md)' : 'none',
                        transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: isSelected ? 'var(--s-primary)' : '#f1f5f9',
                        color: isSelected ? '#fff' : 'var(--s-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 12, transition: 'all 0.2s ease'
                      }}>
                        <IconComp size={24} />
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--s-text)', marginBottom: 4 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--s-text3)', lineHeight: 1.5 }}>{f.description}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Degree Programme */}
          {step === 3 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
                Step 3: Degree Programme ({currentFieldName})
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
                Select your formal degree qualification.
              </p>

              {loadingDegrees ? (
                <SLoader label="Fetching degree programmes..." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  {degreesList.map(deg => {
                    const isSelected = profile.degreeProgramme === deg.name
                    return (
                      <div
                        key={deg.id || deg.name}
                        onClick={() => setProfile({ ...profile, degreeProgramme: deg.name })}
                        style={{
                          padding: 16, borderRadius: 14, cursor: 'pointer',
                          border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                          background: isSelected ? 'var(--s-primary-l)' : '#fff',
                          fontWeight: 700, fontSize: 14, color: isSelected ? 'var(--s-primary)' : 'var(--s-text)'
                        }}
                      >
                        {deg.name}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Domain Branch & Specialization */}
          {step === 4 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
                Step 4: Domain Branch & Specialization
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
                Specify your academic branch and sub-specialization focus area.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                    Core Domain Branch *
                  </label>
                  {loadingDomains ? (
                    <SLoader label="Loading domain branches..." />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      {domainsList.map(dom => {
                        const isSelected = profile.domain === dom.name
                        return (
                          <div
                            key={dom.id || dom.name}
                            onClick={() => {
                              setProfile(prev => ({
                                ...prev,
                                domain: dom.name,
                                specialization: '' // reset specializations when domain branch changes
                              }))
                            }}
                            style={{
                              padding: 16, borderRadius: 14, cursor: 'pointer',
                              border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                              background: isSelected ? 'var(--s-primary-l)' : '#fff',
                              fontWeight: 700, fontSize: 14, color: isSelected ? 'var(--s-primary)' : 'var(--s-text)',
                              boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected ? '✓ ' : ''}{dom.name}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {loadingSpecs ? (
                  <SLoader label="Loading relevant specializations..." />
                ) : specsList.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <label style={{ fontWeight: 800, fontSize: 13, color: 'var(--s-text)' }}>
                        Specialization / Elective Focus (Multi-select enabled)
                      </label>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '3px 10px', borderRadius: 12 }}>
                        Click to select multiple focus areas
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {specsList.map(sp => {
                        const selectedList = profile.specialization
                          ? profile.specialization.split(',').map(s => s.trim()).filter(Boolean)
                          : []
                        const isSelected = selectedList.includes(sp.name)

                        const toggleSpec = () => {
                          const nextList = isSelected
                            ? selectedList.filter(s => s !== sp.name)
                            : [...selectedList, sp.name]
                          setProfile(prev => ({
                            ...prev,
                            specialization: nextList.join(', ')
                          }))
                        }

                        return (
                          <button
                            key={sp.id || sp.name}
                            type="button"
                            onClick={toggleSpec}
                            style={{
                              padding: '9px 18px', borderRadius: 22, cursor: 'pointer',
                              border: isSelected ? '2px solid #047857' : '1px solid var(--s-border)',
                              background: isSelected ? '#d1fae5' : '#fff',
                              color: isSelected ? '#047857' : 'var(--s-text2)',
                              fontWeight: isSelected ? 800 : 600,
                              fontSize: 13,
                              boxShadow: isSelected ? '0 2px 6px rgba(4, 120, 87, 0.12)' : 'none',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex', alignItems: 'center', gap: 6
                            }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{sp.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: AHP CAREER INTEREST DISCOVERY */}
          {step === 5 && (() => {
            if (loadingAhpDiscovery) {
              return <SLoader label="Loading candidate career pathways for AHP Discovery..." />
            }

            // 1. RESULT DISPLAY SCREEN (If AHP discovery completed)
            if (ahpDiscoveryResult) {
              const { rankedDomains, consistencyRatio, consistencyStatus, isConsistent, candidateDomainsForStep6 } = ahpDiscoveryResult

              return (
                <div className="s-anim-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#047857', background: '#d1fae5', padding: '4px 12px', borderRadius: 20 }}>
                        📊 Step 5 Complete: AHP Career Profile Analyzed
                      </span>
                      <h3 style={{ fontSize: 22, fontWeight: 900, margin: '6px 0 0', color: 'var(--s-text)' }}>
                        CAREER INTEREST PROFILE
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 14, background: isConsistent ? '#f0fdf4' : '#fffbeb', color: isConsistent ? '#047857' : '#b45309', border: `1px solid ${isConsistent ? '#86efac' : '#fcd34d'}` }}>
                        CR = {consistencyRatio} ({consistencyStatus})
                      </span>
                      <button
                        type="button"
                        onClick={handleReviseAhpComparisons}
                        style={{ background: 'none', border: '1px solid var(--s-border)', borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: 'var(--s-text2)' }}
                      >
                        🔄 Revise Choices
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24, lineHeight: 1.6 }}>
                    Your pairwise career preferences have been evaluated using the <strong>Analytic Hierarchy Process (AHP)</strong>. Below are your strongest relative interest signals. These top candidate domains will now be evaluated for your actual suitability in <strong>Step 6 (Fuzzy Assessment)</strong>.
                  </p>

                  {/* INCONSISTENCY ALERT IF CR > 0.10 */}
                  {!isConsistent && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 16, padding: 18, marginBottom: 24, color: '#92400e', fontSize: 13, lineHeight: 1.6 }}>
                      ⚠️ <strong>Preference Inconsistency Detected (CR = {consistencyRatio} &gt; 0.10):</strong> Your comparisons show slight intransitive preferences. You can continue, or click "Revise Choices" above to refine your answers for higher mathematical consistency.
                    </div>
                  )}

                  {/* AHP PRIORITY DISTRIBUTION BARS */}
                  <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 20, padding: 24, marginBottom: 28, boxShadow: 'var(--s-shadow)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--s-text3)', marginBottom: 20 }}>
                      Your Strongest Career-Interest Signals (AHP Priority Vector)
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {rankedDomains?.map((item, idx) => {
                        const IconComp = ICON_MAP[item.icon] || FiBriefcase
                        const isTopThree = idx < 3
                        return (
                          <div key={item.id || idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: 10,
                                  background: isTopThree ? '#d1fae5' : '#f1f5f9',
                                  color: isTopThree ? '#047857' : 'var(--s-text3)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  <IconComp size={16} />
                                </div>
                                <div>
                                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)' }}>
                                    {item.name}
                                  </span>
                                  <span style={{ fontSize: 11, color: 'var(--s-text3)', marginLeft: 8 }}>
                                    ({item.category})
                                  </span>
                                </div>
                              </div>

                              <div style={{ fontWeight: 900, fontSize: 15, color: isTopThree ? '#047857' : 'var(--s-text2)' }}>
                                {item.scorePercent}% Interest Signal
                              </div>
                            </div>

                            <div style={{ height: 10, width: '100%', background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${item.scorePercent}%`,
                                background: isTopThree ? 'linear-gradient(90deg, #10b981 0%, #047857 100%)' : '#cbd5e1',
                                borderRadius: 6,
                                transition: 'width 0.6s ease'
                              }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* STEP 6 HANDOFF CANDIDATES CARD */}
                  <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '2px solid #86efac', borderRadius: 20, padding: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em', marginBottom: 6 }}>
                      ➡️ Candidate Domains Passed to Step 6 (Adaptive Skill Discovery)
                    </div>
                    <div style={{ fontSize: 14, color: '#065f46', marginBottom: 16, lineHeight: 1.5 }}>
                      The top 2–3 candidate interest domains below will dictate the domain-specific scenario questions presented in Step 6:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {candidateDomainsForStep6?.map((cand, idx) => (
                        <div key={cand.id || idx} style={{ background: '#fff', border: '1px solid #a7f3d0', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ background: '#d1fae5', color: '#047857', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: '#065f46' }}>{cand.name}</div>
                            <div style={{ fontSize: 11, color: '#047857' }}>AHP Weight: {cand.scorePercent}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            // 2. PAIRWISE COMPARISON INTERACTION SCREEN
            const currentPair = ahpPairs[ahpPairIndex]
            const totalPairs = ahpPairs.length
            const currentPairNum = ahpPairIndex + 1
            const pairProgressPercent = totalPairs > 0 ? Math.round((ahpPairIndex / totalPairs) * 100) : 0
            const currentXp = ahpPairIndex * 10

            if (!currentPair) {
              return (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ fontSize: 14, color: 'var(--s-text2)', marginBottom: 16 }}>
                    No candidate comparisons loaded for this branch selection yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadAhpDiscoveryData(true)}
                    style={{
                      background: 'var(--s-primary)', color: '#fff', border: 'none',
                      borderRadius: 12, padding: '10px 24px', fontSize: 13, fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Retry Loading Career Pathways
                  </button>
                </div>
              )
            }

            const domainA = currentPair.domainA
            const domainB = currentPair.domainB
            const IconA = ICON_MAP[domainA.icon] || FiCpu
            const IconB = ICON_MAP[domainB.icon] || FiGlobe

            return (
              <div className="s-anim-up">
                {/* CAREER DISCOVERY GAMIFIED MISSION HEADER */}
                <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 20, padding: 22, marginBottom: 28, boxShadow: 'var(--s-shadow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⚡ CAREER DISCOVERY MISSION</span>
                        <span style={{ background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 10, fontSize: 10 }}>+10 XP / Comparison</span>
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, margin: '4px 0 0', color: 'var(--s-text)' }}>
                        AHP Career Interest Discovery
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: '#f8fafc', border: '1px solid var(--s-border)', padding: '6px 14px', borderRadius: 12, fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>
                        Comparison <strong>{currentPairNum}</strong> of <strong>{totalPairs}</strong>
                      </div>
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '6px 14px', borderRadius: 12, fontSize: 13, fontWeight: 800, color: '#047857' }}>
                        ⭐ {currentXp} XP
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: 8, width: '100%', background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${pairProgressPercent}%`, background: 'var(--s-primary)', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>
                    <span>Your career-interest profile is taking shape...</span>
                    <span>{pairProgressPercent}% Completed</span>
                  </div>
                </div>

                {/* PAIRWISE COMPARISON VS CONTAINER */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                    Which path would you rather explore?
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>
                    Choose the path that interests you more. No math required!
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 28 }}>
                  {/* OPTION A CARD */}
                  <div
                    onClick={() => handleSelectPairwiseDomain(domainA)}
                    style={{
                      background: selectedDomainInPair?.id === domainA.id ? '#f0fdf4' : '#fff',
                      border: selectedDomainInPair?.id === domainA.id ? '2px solid #047857' : '1px solid var(--s-border)',
                      borderRadius: 20, padding: 24, cursor: 'pointer',
                      boxShadow: selectedDomainInPair?.id === domainA.id ? '0 6px 20px rgba(4, 120, 87, 0.18)' : 'var(--s-shadow)',
                      transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', height: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: selectedDomainInPair?.id === domainA.id ? '#047857' : '#f1f5f9', color: selectedDomainInPair?.id === domainA.id ? '#fff' : 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconA size={24} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '3px 10px', borderRadius: 12 }}>
                          {domainA.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', marginBottom: 8, lineHeight: 1.3 }}>
                        {domainA.name}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                        "{domainA.description}"
                      </p>
                    </div>

                    <button
                      type="button"
                      style={{
                        marginTop: 20, width: '100%', padding: '11px', borderRadius: 12, border: 'none',
                        background: selectedDomainInPair?.id === domainA.id ? '#047857' : '#f1f5f9',
                        color: selectedDomainInPair?.id === domainA.id ? '#fff' : 'var(--s-text)',
                        fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      {selectedDomainInPair?.id === domainA.id ? '✓ Selected' : 'Choose This Path'}
                    </button>
                  </div>

                  {/* VS BADGE */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)' }}>
                      VS
                    </div>
                  </div>

                  {/* OPTION B CARD */}
                  <div
                    onClick={() => handleSelectPairwiseDomain(domainB)}
                    style={{
                      background: selectedDomainInPair?.id === domainB.id ? '#f0fdf4' : '#fff',
                      border: selectedDomainInPair?.id === domainB.id ? '2px solid #047857' : '1px solid var(--s-border)',
                      borderRadius: 20, padding: 24, cursor: 'pointer',
                      boxShadow: selectedDomainInPair?.id === domainB.id ? '0 6px 20px rgba(4, 120, 87, 0.18)' : 'var(--s-shadow)',
                      transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', height: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: selectedDomainInPair?.id === domainB.id ? '#047857' : '#f1f5f9', color: selectedDomainInPair?.id === domainB.id ? '#fff' : 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconB size={24} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '3px 10px', borderRadius: 12 }}>
                          {domainB.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', marginBottom: 8, lineHeight: 1.3 }}>
                        {domainB.name}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                        "{domainB.description}"
                      </p>
                    </div>

                    <button
                      type="button"
                      style={{
                        marginTop: 20, width: '100%', padding: '11px', borderRadius: 12, border: 'none',
                        background: selectedDomainInPair?.id === domainB.id ? '#047857' : '#f1f5f9',
                        color: selectedDomainInPair?.id === domainB.id ? '#fff' : 'var(--s-text)',
                        fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      {selectedDomainInPair?.id === domainB.id ? '✓ Selected' : 'Choose This Path'}
                    </button>
                  </div>
                </div>

                {/* OPTIONAL PREFERENCE INTENSITY SELECTOR (Appears after domain choice) */}
                {selectedDomainInPair && (
                  <div className="s-anim-up" style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 20, padding: 22, marginBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#065f46', marginBottom: 12 }}>
                      You selected <strong>{selectedDomainInPair.name}</strong>. How much more interested are you in this path?
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                      {[
                        { val: 1, label: '1 — Equal Preference' },
                        { val: 3, label: '3 — Slight Preference' },
                        { val: 5, label: '5 — Strong Preference' },
                        { val: 7, label: '7 — Very Strong' },
                        { val: 9, label: '9 — Extreme Preference' }
                      ].map(opt => {
                        const isChosen = selectedIntensity === opt.val
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setSelectedIntensity(opt.val)}
                            style={{
                              padding: '10px 12px', borderRadius: 12, border: isChosen ? '2px solid #047857' : '1px solid #a7f3d0',
                              background: isChosen ? '#047857' : '#fff',
                              color: isChosen ? '#fff' : '#065f46',
                              fontWeight: isChosen ? 800 : 600, fontSize: 12, cursor: 'pointer',
                              textAlign: 'center', transition: 'all 0.12s ease'
                            }}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        type="button"
                        onClick={handleConfirmPairwiseSelection}
                        disabled={calculatingAhpDiscovery}
                        style={{
                          background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                          color: '#fff', border: 'none', borderRadius: 12,
                          padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)'
                        }}
                      >
                        {calculatingAhpDiscovery ? 'Computing Matrix...' : 'Confirm Preference (+10 XP) →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* PREVIOUS PAIR BACK BUTTON */}
                {ahpPairIndex > 0 && !selectedDomainInPair && (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setAhpPairIndex(prev => prev - 1)}
                      style={{ background: 'none', border: 'none', color: 'var(--s-text3)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ← Back to Previous Comparison
                    </button>
                  </div>
                )}
              </div>
            )
          })()}

          {/* STEP 6: MongoDB Career Domain Discovery Assessment */}
          {step === 6 && (
            <div className="s-anim-up">
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #a7f3d0', borderRadius: 20, padding: 24, marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#047857', background: '#d1fae5', padding: '4px 12px', borderRadius: 20 }}>
                      🎯 PERSONALIZED CAREER DISCOVERY
                    </span>
                    <h3 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 0', color: '#064e3b' }}>
                      Step 6: Career Domain Discovery Assessment
                    </h3>
                  </div>
                  <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                    {discoveryQuestions.length || 15} Personalized Discovery Questions
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#065f46', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Your questions are selected from the career domains identified by your AHP career-interest profile.
                </p>

                {/* YOUR AHP CANDIDATE DOMAINS BADGES */}
                <div style={{ background: '#fff', border: '1px solid #a7f3d0', borderRadius: 16, padding: 18, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em', marginBottom: 10 }}>
                    YOUR AHP CANDIDATE DOMAINS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    {(() => {
                      const displayList = ahpDiscoveryResult?.candidateDomainsForStep6 || ahpDiscoveryResult?.candidateDomains || (ahpCandidates.length > 0 ? ahpCandidates : null) || [
                        { id: 'software_engineering', name: 'Software Engineering & Architecture' },
                        { id: 'ai_ml', name: 'Artificial Intelligence & Machine Learning' },
                        { id: 'cloud_devops', name: 'Cloud Computing & DevOps' }
                      ]
                      return displayList.map((cd, idx) => (
                        <span key={cd.id || idx} style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13, fontWeight: 800, padding: '8px 16px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {cd.name || cd.id}
                        </span>
                      ))
                    })()}
                  </div>

                  {/* DIFFICULTY PROGRESS BREAKDOWN HEADER */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, fontSize: 12, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                    {[
                      { key: 'easy', label: '🟢 Easy', color: '#059669', target: 5 },
                      { key: 'medium', label: '🟡 Medium', color: '#d97706', target: 5 },
                      { key: 'hard', label: '🔴 Hard', color: '#dc2626', target: 5 }
                    ].map(diffObj => {
                      const diffQs = discoveryQuestions.filter(q => (q.difficulty || 'medium').toLowerCase() === diffObj.key)
                      const diffAns = diffQs.filter(q => discoveryAnswers[q.questionId || q._id]).length
                      const totalDiff = diffQs.length || diffObj.target
                      const pct = Math.round((diffAns / totalDiff) * 100)

                      return (
                        <div key={diffObj.key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: diffObj.color, marginBottom: 4 }}>
                            <span>{diffObj.label}</span>
                            <span>{diffAns} / {totalDiff}</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: diffObj.color, borderRadius: 3, transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                      )
                    })}

                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46' }}>Overall Progress</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#047857' }}>
                        {Object.keys(discoveryAnswers).length} / {discoveryQuestions.length || 15} completed
                      </div>
                    </div>
                  </div>
                </div>

                {/* PART 14: CAREER DISCOVERY COMPLETE CELEBRATION RESULT SCREEN */}
                {discoveryResult && (discoveryResult.recommendedDomain || discoveryResult.topDomain) && (() => {
                  const rec = discoveryResult.recommendedDomain || discoveryResult.topDomain
                  const scoreVal = rec.score ? (rec.score > 1 ? rec.score : Math.round(rec.score * 100)) : (rec.compatibilityScorePercent || 74.9)
                  const domainTitle = rec.domainName || rec.name || 'AI & Machine Learning'
                  const icon = rec.icon || '🧠'

                  return (
                    <div className="s-anim-up" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#fff', borderRadius: 24, padding: 32, marginBottom: 28, boxShadow: '0 10px 30px rgba(4, 120, 87, 0.3)', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#a7f3d0', fontSize: 13, fontWeight: 800, padding: '6px 16px', borderRadius: 20, marginBottom: 12 }}>
                        🎯 CAREER DISCOVERY COMPLETE
                      </div>
                      <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px', color: '#fff' }}>
                        Your Academic DNA has been analyzed.
                      </h2>
                      <p style={{ fontSize: 13, color: '#d1fae5', margin: '0 0 24px' }}>
                        AHP Preference &amp; Fuzzy Diagnostic Engine Alignment
                      </p>

                      {/* ANIMATED CALCULATION STEPS */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                        <span style={{ background: 'rgba(255,255,255,0.12)', color: '#34d399', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 16 }}>
                          AHP Career Interest ✓
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.12)', color: '#34d399', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 16 }}>
                          Diagnostic Responses ✓
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.12)', color: '#34d399', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 16 }}>
                          Fuzzy Analysis ✓
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.12)', color: '#34d399', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 16 }}>
                          Domain Matching ✓
                        </span>
                      </div>

                      {/* PRIMARY RECOMMENDED DOMAIN CARD */}
                      <div style={{ background: '#fff', color: '#064e3b', borderRadius: 20, padding: 28, maxWidth: 540, margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.08em', marginBottom: 8 }}>
                          YOUR PRIMARY DOMAIN
                        </div>
                        <div style={{ fontSize: 40, margin: '8px 0' }}>{icon}</div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 10px', color: '#065f46' }}>
                          {domainTitle}
                        </h3>
                        <div style={{ display: 'inline-block', background: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7', padding: '6px 20px', borderRadius: 20, fontSize: 18, fontWeight: 900 }}>
                          {scoreVal}% MATCH
                        </div>

                        {/* WHY THIS DOMAIN EXPLAINABILITY */}
                        <div style={{ marginTop: 24, textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 10 }}>
                            Why this domain?
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#047857', fontWeight: 700 }}>
                            <div>✓ Strong career preference</div>
                            <div>✓ Strong diagnostic alignment</div>
                            <div>✓ Problem-solving mastery</div>
                            <div>✓ Multi-difficulty consistency</div>
                          </div>
                        </div>
                      </div>

                      {/* CAREER DOMAIN SUITABILITY BREAKDOWN */}
                      {(() => {
                        const breakdownItems = discoveryResult.rankings || discoveryResult.finalScores || discoveryResult.fuzzyScores || []
                        if (breakdownItems.length === 0) return null

                        return (
                          <div style={{ maxWidth: 600, margin: '0 auto 28px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 20, textAlign: 'left', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#a7f3d0', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              📊 Evaluated Candidate Domains Fuzzy Breakdown
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                              {breakdownItems.map(item => {
                                const dName = item.domainName || item.name || item.domainId
                                const rawScore = item.score !== undefined ? item.score : (item.fuzzyScore || 0.5)
                                const dScore = rawScore > 1 ? Math.round(rawScore) : Number((rawScore * 100).toFixed(1))

                                return (
                                  <div key={item.domainId || dName} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 4 }}>
                                      <span>{dName}</span>
                                      <span>{dScore}%</span>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                                      <div style={{ width: `${Math.min(100, Math.max(0, dScore))}%`, height: '100%', background: '#34d399', borderRadius: 3, transition: 'width 0.5s ease' }} />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}

                      {/* EXPLORE MY DASHBOARD BUTTON */}
                      <button
                        type="button"
                        onClick={async () => {
                          await saveProgressToBackend(true)
                          updateStudent({ onboardingCompleted: true, userType: 'college_student', collegeProfileSaved: true })
                          navigate('/college/dashboard')
                        }}
                        style={{
                          background: '#34d399', color: '#064e3b', border: 'none',
                          borderRadius: 16, padding: '16px 42px', fontSize: 16, fontWeight: 900,
                          cursor: 'pointer', boxShadow: '0 6px 20px rgba(52, 211, 153, 0.4)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Explore My Dashboard →
                      </button>
                    </div>
                  )
                })()}

                {/* 15 MONGODB DISCOVERY QUESTIONS */}
                {loadingQuestions ? (
                  <SLoader label="Loading career discovery questions from MongoDB database..." />
                ) : discoveryQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* DIFFICULTY FILTER TABS */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['All', 'easy', 'medium', 'hard'].map(diff => {
                        const count = diff === 'All' ? discoveryQuestions.length : discoveryQuestions.filter(q => (q.difficulty || 'medium').toLowerCase() === diff).length
                        const isActive = (difficultyFilter || 'All').toLowerCase() === diff
                        let activeBg = '#047857'
                        if (diff === 'easy') activeBg = '#059669'
                        else if (diff === 'medium') activeBg = '#d97706'
                        else if (diff === 'hard') activeBg = '#dc2626'

                        return (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficultyFilter(diff === 'All' ? 'All' : diff)}
                            style={{
                              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                              border: isActive ? `2px solid ${activeBg}` : '1px solid #cbd5e1',
                              background: isActive ? activeBg : '#f8fafc',
                              color: isActive ? '#fff' : '#334155',
                              fontSize: 12, fontWeight: 800, transition: 'all 0.15s ease'
                            }}
                          >
                            {diff === 'All' && `📋 All (${count})`}
                            {diff === 'easy' && `🟢 Easy (${count})`}
                            {diff === 'medium' && `🟡 Medium (${count})`}
                            {diff === 'hard' && `🔴 Hard (${count})`}
                          </button>
                        )
                      })}
                    </div>

                    {/* PROGRESS BAR: answered / total */}
                    {(() => {
                      const totalQ = discoveryQuestions.length
                      const answeredQ = Object.keys(discoveryAnswers).length
                      const progressPct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0
                      const allDone = answeredQ >= totalQ
                      return (
                        <div style={{
                          background: allDone ? '#f0fdf4' : '#fff',
                          border: `1px solid ${allDone ? '#86efac' : '#e2e8f0'}`,
                          borderRadius: 12, padding: '12px 16px', marginBottom: 4,
                          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: allDone ? '#047857' : 'var(--s-text)' }}>
                                {allDone ? '✅ All questions answered!' : `📝 ${answeredQ} of ${totalQ} questions answered`}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? '#047857' : 'var(--s-text3)' }}>
                                {progressPct}%
                              </span>
                            </div>
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', width: `${progressPct}%`,
                                background: allDone
                                  ? 'linear-gradient(90deg, #10b981, #047857)'
                                  : 'linear-gradient(90deg, #94a3b8, #64748b)',
                                borderRadius: 4, transition: 'width 0.4s ease'
                              }} />
                            </div>
                          </div>
                          {!allDone && (
                            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
                              {totalQ - answeredQ} remaining
                            </span>
                          )}
                        </div>
                      )
                    })()}

                    {discoveryQuestions
                      .filter(q => difficultyFilter === 'All' || (q.difficulty || 'medium').toLowerCase() === difficultyFilter.toLowerCase())
                      .map((q, qIdx) => {
                        const qKey = q.questionId || q._id
                        const selectedOptId = discoveryAnswers[qKey]
                        const isUnansweredHighlighted = unansweredHighlight === qKey
                        const diff = (q.difficulty || 'medium').toLowerCase()
                        let badgeStyle = { bg: '#d1fae5', color: '#047857', label: '🟢 EASY (+10 XP)' }
                        if (diff === 'medium') badgeStyle = { bg: '#fef3c7', color: '#b45309', label: '🟡 MEDIUM (+20 XP)' }
                        else if (diff === 'hard') badgeStyle = { bg: '#fee2e2', color: '#b91c1c', label: '🔴 HARD (+30 XP)' }

                        const skillName = (Array.isArray(q.skillDimensions) && q.skillDimensions[0])
                          ? q.skillDimensions[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : (q.dimension || 'Pattern Recognition')

                        return (
                          <div
                            key={qKey}
                            ref={el => { if (el) questionRefs.current[qKey] = el }}
                            style={{
                              background: isUnansweredHighlighted ? '#fff1f2' : '#fff',
                              border: isUnansweredHighlighted ? '2px solid #f87171' : '1px solid #cbd5e1',
                              borderRadius: 16, padding: 20,
                              transition: 'border-color 0.2s ease, background 0.2s ease'
                            }}
                          >
                            {isUnansweredHighlighted && (
                              <div style={{
                                background: '#fee2e2', color: '#b91c1c',
                                borderRadius: 8, padding: '6px 12px',
                                fontSize: 12, fontWeight: 800, marginBottom: 10,
                                display: 'flex', alignItems: 'center', gap: 6
                              }}>
                                ⚠️ Please answer this question before submitting
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: isUnansweredHighlighted ? '#b91c1c' : '#047857' }}>
                                  Question {discoveryQuestions.findIndex(dq => (dq.questionId || dq._id) === qKey) + 1} of {discoveryQuestions.length}
                                </span>
                                <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 10px', borderRadius: 12, fontWeight: 800 }}>
                                  🧠 {q.domainName || q.domainId}
                                </span>
                                <span style={{ fontSize: 11, background: badgeStyle.bg, color: badgeStyle.color, padding: '2px 8px', borderRadius: 8, fontWeight: 800 }}>
                                  Difficulty: {badgeStyle.label}
                                </span>
                              </div>
                              <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: 8, fontWeight: 700 }}>
                                Skill Dimension: {skillName}
                              </span>
                            </div>

                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', marginBottom: 14, lineHeight: 1.5 }}>
                              {q.questionText}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                              {q.options?.map((opt, optIdx) => {
                                const optId = opt.id || opt.optionId || String.fromCharCode(65 + optIdx)
                                const isSelected = selectedOptId === optId

                                return (
                                  <button
                                    key={optId}
                                    type="button"
                                    data-opt="true"
                                    onClick={() => {
                                      handleSelectAnswer(qKey, optId)
                                      // Clear unanswered highlight when student answers
                                      if (unansweredHighlight === qKey) setUnansweredHighlight(null)
                                    }}
                                    style={{
                                      padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                      border: isSelected ? '2px solid #047857' : (isUnansweredHighlighted ? '1px solid #fca5a5' : '1px solid #e2e8f0'),
                                      background: isSelected ? '#d1fae5' : (isUnansweredHighlighted ? '#fff5f5' : '#f8fafc'),
                                      color: isSelected ? '#047857' : 'var(--s-text)', fontSize: 13, fontWeight: isSelected ? 700 : 500,
                                      lineHeight: 1.4, transition: 'all 0.12s ease', display: 'flex', gap: 10, alignItems: 'flex-start'
                                    }}
                                  >
                                    <span style={{ background: isSelected ? '#047857' : '#e2e8f0', color: isSelected ? '#fff' : '#475569', width: 22, height: 22, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                                      {optId}
                                    </span>
                                    <span>{opt.text}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}

                    {(() => {
                      const totalQ = discoveryQuestions.length
                      const answeredQ = Object.keys(discoveryAnswers).length
                      const allDone = answeredQ >= totalQ && totalQ > 0
                      return (
                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                          {!allDone && (
                            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 600 }}>
                              📋 Answer all {totalQ} questions to unlock submission ({totalQ - answeredQ} remaining)
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleEvaluateDiscovery}
                            disabled={evaluatingAssessment}
                            style={{
                              background: allDone
                                ? 'linear-gradient(135deg, #047857 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                              color: '#fff', border: 'none', borderRadius: 14,
                              padding: '14px 36px', fontSize: 15, fontWeight: 800,
                              cursor: evaluatingAssessment ? 'wait' : 'pointer',
                              boxShadow: allDone ? '0 4px 12px rgba(4, 120, 87, 0.25)' : 'none',
                              transition: 'all 0.3s ease',
                              opacity: evaluatingAssessment ? 0.7 : 1,
                            }}
                          >
                            {evaluatingAssessment
                              ? '🔄 Calculating Domain Suitability...'
                              : allDone
                                ? '⚡ Submit Assessment & Calculate Career Recommendation'
                                : `📝 Answer All Questions (${answeredQ}/${totalQ}) to Submit`}
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#991b1b', margin: '0 0 8px' }}>
                      Unable to load your career discovery questions.
                    </h4>
                    <p style={{ fontSize: 13, color: '#9f1239', marginBottom: 16 }}>
                      Candidate domains: {((ahpDiscoveryResult?.candidateDomainsForStep6 || ahpCandidates || []).map(d => d.name || d.id)).join(', ') || 'ai_ml, data_science, software_engineering'} | API status: Ready | Questions received: 0
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchDiscoveryQuestions()}
                      style={{
                        background: '#e11d48', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 800,
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)'
                      }}
                    >
                      🔄 Retry Loading Questions
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACTION NAVIGATION BAR ── */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={step === 1}
              style={{
                background: 'none', border: '1px solid var(--s-border)',
                borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700,
                color: step === 1 ? '#cbd5e1' : 'var(--s-text2)', cursor: step === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <FiArrowLeft size={16} /> Back
            </button>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={handleSaveAndLater}
                disabled={submitting}
                style={{
                  background: 'none', border: '1px solid var(--s-border)',
                  borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700,
                  color: 'var(--s-text2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <FiSave size={16} /> Save & Continue Later
              </button>

              {step < 6 ? (
                <SBtn variant="primary" onClick={handleNextStep} style={{ padding: '12px 28px', borderRadius: 12 }}>
                  Next Step <FiArrowRight style={{ marginLeft: 6 }} />
                </SBtn>
              ) : (
                <SBtn variant="primary" onClick={handleCompleteWizard} style={{ padding: '12px 28px', borderRadius: 12 }} disabled={submitting}>
                  {submitting ? 'Completing Profile...' : 'Complete Profile & Enter Dashboard'} <FiArrowRight style={{ marginLeft: 6 }} />
                </SBtn>
              )}
            </div>
          </div>
        </SCard>
      </div>
    </div>
  )
}
