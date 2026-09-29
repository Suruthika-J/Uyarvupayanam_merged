import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

// ── Step 1 sub-component with district-first + filtered college picker ────────
function Step1InstitutionBlock({ profile, setProfile }) {
  const [collegeSearch, setCollegeSearch] = React.useState('')
  const districtColleges = TN_COLLEGES_BY_DISTRICT[profile.institutionDistrict] || []
  const filtered = districtColleges.filter(c =>
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  )
  const isCustom = profile.institution && !districtColleges.includes(profile.institution)

  const selectCollege = (college) => {
    setProfile(prev => ({ ...prev, institution: college }))
    setCollegeSearch('')
  }

  const changeDistrict = (newDistrict) => {
    setProfile(prev => ({ ...prev, institutionDistrict: newDistrict, institution: '' }))
    setCollegeSearch('')
  }

  return (
    <div className="s-anim-up">
      <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
        Step 1: Institution &amp; Academic Level
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
              <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--s-text3)', marginLeft: 8 }}>
                ({districtColleges.length} colleges in {profile.institutionDistrict})
              </span>
            </label>

            {/* Search + list box */}
            <div style={{
              border: '1px solid var(--s-border)', borderRadius: 12,
              overflow: 'hidden', background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              {/* Search bar inside the box */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                borderBottom: '1px solid var(--s-border)',
                background: '#f8fafc',
              }}>
                <span style={{ fontSize: 16 }}>🔍</span>
                <input
                  type="text"
                  placeholder={`Search in ${profile.institutionDistrict} colleges...`}
                  value={collegeSearch}
                  onChange={e => setCollegeSearch(e.target.value)}
                  style={{
                    border: 'none', outline: 'none', background: 'none',
                    fontSize: 13, flex: 1, color: 'var(--s-text)',
                    fontFamily: 'inherit'
                  }}
                />
                {collegeSearch && (
                  <button
                    type="button"
                    onClick={() => setCollegeSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)', fontSize: 16, lineHeight: 1 }}
                  >✕</button>
                )}
              </div>

              {/* Scrollable college list */}
              <div style={{ maxHeight: 260, overflowY: 'auto', padding: '4px 0' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '16px 14px', fontSize: 13, color: 'var(--s-text3)', textAlign: 'center' }}>
                    No colleges found. Type your college name in the manual field below.
                  </div>
                ) : (
                  filtered.map(college => {
                    const isSelected = profile.institution === college
                    return (
                      <button
                        key={college}
                        type="button"
                        onClick={() => selectCollege(college)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '9px 16px', border: 'none',
                          background: isSelected ? 'var(--s-primary-l)' : 'transparent',
                          color: isSelected ? 'var(--s-primary)' : 'var(--s-text)',
                          fontSize: 13, fontWeight: isSelected ? 800 : 500,
                          cursor: 'pointer',
                          borderLeft: isSelected ? '3px solid var(--s-primary)' : '3px solid transparent',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f5f9' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                      >
                        {isSelected && '✓ '}{college}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Selected college display */}
            {profile.institution && (
              <div style={{
                marginTop: 10, padding: '10px 14px',
                background: isCustom ? '#fffbeb' : '#f0fdf4',
                border: `1px solid ${isCustom ? '#fcd34d' : '#86efac'}`,
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                color: isCustom ? '#b45309' : '#166534',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>{isCustom ? '✏️ Custom:' : '🎓'}</span>
                <span style={{ flex: 1 }}>{profile.institution}</span>
                <button
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, institution: '' }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8', lineHeight: 1 }}
                >✕</button>
              </div>
            )}

            {/* Manual type option */}
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '0 0 6px' }}>
                Can't find your college in the list? Type it manually:
              </p>
              <input
                type="text"
                placeholder="Type your college name..."
                value={isCustom ? profile.institution : ''}
                onChange={e => setProfile(prev => ({ ...prev, institution: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: '1px dashed var(--s-border)', fontSize: 13,
                  outline: 'none', fontFamily: 'inherit',
                  background: '#f8fafc', color: 'var(--s-text)',
                  boxSizing: 'border-box',
                }}
              />
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
            Select your district above to see colleges in your area.
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

  const [step, setStep] = useState(1)
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
    institutionDistrict: 'Coimbatore',
    currentYear: '1st Year',
    studyMode: 'Regular Full-Time',
    fieldId: 'engineering',
    degreeProgramme: 'B.E. / B.Tech Computer Science',
    domain: 'Computer Science & Engineering',
    specialization: 'Artificial Intelligence & Data Science',
    certifications: [],
    academicInterests: ['Applied Industry Projects', 'Internship Readiness & Placement Prep'],
    careerInterests: ['Software Engineering / Product Development', 'AI & Machine Learning Scientist'],
    skills: ['Python / Data Science', 'Problem Solving & Logic'],
    strengths: ['Analytical Thinking', 'Team Collaboration']
  })

  // Grok Assessment State (Step 7)
  const [grokQuestions, setGrokQuestions] = useState([])
  const [grokAnswers, setGrokAnswers] = useState({})
  const [loadingGrok, setLoadingGrok] = useState(false)
  const [grokSource, setGrokSource] = useState('')

  // AHP + Fuzzy Logic 15 Default Questions State
  const [ahpQuestions, setAhpQuestions] = useState([])
  const [ahpAnswers, setAhpAnswers] = useState({})
  const [loadingAhp, setLoadingAhp] = useState(false)
  const [evaluatingAhp, setEvaluatingAhp] = useState(false)
  const [ahpResult, setAhpResult] = useState(null)
  const [difficultyFilter, setDifficultyFilter] = useState('All')

  // Step 6: CSE Skill MCQ Assessment State
  const [cseMcqQuestions, setCseMcqQuestions] = useState([])
  const [cseMcqAnswers, setCseMcqAnswers] = useState({})
  const [loadingCseMcq, setLoadingCseMcq] = useState(false)
  const [evaluatingCseMcq, setEvaluatingCseMcq] = useState(false)
  const [cseSkillResult, setCseSkillResult] = useState(null)
  const [cseDomainFilter, setCseDomainFilter] = useState('All')
  const [cseDifficultyFilter, setCseDifficultyFilter] = useState('All')
  const [showManualSkillsToggle, setShowManualSkillsToggle] = useState(false)

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

  // Load candidate domains for Step 5 Pairwise AHP Discovery when step === 5
  useEffect(() => {
    if (step === 5) {
      loadAhpDiscoveryData()
    }
  }, [step, profile.domain, profile.specialization])

  const loadAhpDiscoveryData = async () => {
    setLoadingAhpDiscovery(true)
    try {
      // Check if saved AHP result exists on backend first (404 expected for new students)
      try {
        const savedRes = await axiosInstance.get('/onboarding/ahp/result')
        if (savedRes.data?.success && savedRes.data.ahpProfile) {
          const saved = savedRes.data.ahpProfile
          const savedBranch = saved.branchId || ''
          const savedSpecs = Array.isArray(saved.selectedSpecializations) ? saved.selectedSpecializations.join(', ') : ''
          const currentSpecs = profile.specialization || ''

          // Only use saved result if branch & selected specializations match current profile
          if (savedBranch === profile.domain && savedSpecs === currentSpecs) {
            setAhpCandidates(saved.candidateDomains || [])
            setAhpDiscoveryResult(saved)
            setLoadingAhpDiscovery(false)
            return
          }
        }
      } catch (err) {
        // Ignored: 404 is normal if the student has not completed Step 5 yet
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
            if (p.currentStep && p.currentStep > 1) {
              setStep(Math.min(7, p.currentStep))
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

  // Fetch CSE Skill MCQ Questions when Step 6 is reached
  useEffect(() => {
    if (step === 6) {
      if (cseMcqQuestions.length === 0) fetchCseMcqQuestions()
    }
  }, [step])

  const fetchCseMcqQuestions = async () => {
    setLoadingCseMcq(true)
    try {
      const res = await axiosInstance.get('/cse-skills/questions')
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setCseMcqQuestions(res.data.questions)
      }
    } catch (err) {
      console.warn('Failed to fetch CSE Skill MCQ questions')
    } finally {
      setLoadingCseMcq(false)
    }
  }

  const handleEvaluateCseMcq = async () => {
    const formattedAnswers = Object.entries(cseMcqAnswers).map(([qNum, optId]) => ({
      questionNumber: Number(qNum),
      optionId: optId
    }))
    if (formattedAnswers.length === 0) {
      setError('Please select an answer for at least one MCQ question.')
      return
    }

    setEvaluatingCseMcq(true)
    setError('')
    try {
      const res = await axiosInstance.post('/cse-skills/evaluate', { answers: formattedAnswers })
      if (res.data?.success && res.data.evaluation) {
        setCseSkillResult(res.data.evaluation)
        // Automatically add verified skills to student profile
        if (res.data.evaluation.verifiedSkills && res.data.evaluation.verifiedSkills.length > 0) {
          setProfile(prev => {
            const merged = Array.from(new Set([...prev.skills, ...res.data.evaluation.verifiedSkills]))
            return { ...prev, skills: merged }
          })
        }
      }
    } catch (err) {
      setError('CSE Skill evaluation failed. Please try again.')
    } finally {
      setEvaluatingCseMcq(false)
    }
  }

  // Fetch AHP + Fuzzy 15 Default Questions when Step 7 is reached
  useEffect(() => {
    if (step === 7) {
      if (grokQuestions.length === 0) fetchGrokQuestions()
      if (ahpQuestions.length === 0) fetchAhpQuestions()
    }
  }, [step])

  const fetchAhpQuestions = async () => {
    setLoadingAhp(true)
    try {
      const res = await axiosInstance.get('/ahp-fuzzy/questions')
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setAhpQuestions(res.data.questions)
      }
    } catch (err) {
      console.warn('Failed to fetch AHP Fuzzy questions')
    } finally {
      setLoadingAhp(false)
    }
  }

  const handleEvaluateAhpFuzzy = async () => {
    const formattedAnswers = Object.entries(ahpAnswers).map(([qNum, optId]) => ({
      questionNumber: Number(qNum),
      optionId: optId
    }))
    if (formattedAnswers.length === 0) {
      setError('Please select an option for at least one question to run AHP + Fuzzy evaluation.')
      return
    }

    setEvaluatingAhp(true)
    setError('')
    try {
      const res = await axiosInstance.post('/ahp-fuzzy/evaluate', { answers: formattedAnswers })
      if (res.data?.success && res.data.evaluation) {
        setAhpResult(res.data.evaluation)
      }
    } catch (err) {
      setError('Evaluation failed. Please try again.')
    } finally {
      setEvaluatingAhp(false)
    }
  }

  const fetchGrokQuestions = async () => {
    setLoadingGrok(true)
    try {
      const res = await axiosInstance.post('/assessment/generate-grok-questions', {
        degreeProgramme: profile.degreeProgramme,
        domain: profile.domain,
        userType: 'college_student'
      })
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setGrokQuestions(res.data.questions)
        setGrokSource(res.data.source || 'xAI Grok API')
      }
    } catch (err) {
      console.warn('Failed to fetch Grok questions')
    } finally {
      setLoadingGrok(false)
    }
  }

  const currentFieldName = fieldsList.find(f => f.fieldId === profile.fieldId)?.fieldName || 'Engineering & Technology'
  const progressPercent = Math.round((step / 7) * 100)

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

    if (step < 7) {
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
            <span style={{ color: 'var(--s-primary)' }}>STEP {step} OF 7</span>
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
                      AHP Relative Priority Distribution ("Strongest Interest Signals")
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
                                {item.scorePercent}%
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
                      ➡️ Candidate Domains Passed to Step 6 (Fuzzy Assessment)
                    </div>
                    <div style={{ fontSize: 14, color: '#065f46', marginBottom: 16, lineHeight: 1.5 }}>
                      The top 2–3 domains below will dictate the domain-specific scenario questions presented in Step 6:
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
                    onClick={loadAhpDiscoveryData}
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

          {/* STEP 6: Skills & Technical Competencies (CSE MCQ Assessment) */}
          {step === 6 && (
            <div className="s-anim-up">
              <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', border: '1px solid #bfdbfe', borderRadius: 20, padding: 24, marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1d4ed8', background: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                      ⚡ Technical MCQ Assessment • All CSE & Computing Domains
                    </span>
                    <h3 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 0', color: '#1e3a8a' }}>
                      Step 6: Technical Skills & Competencies MCQ Test
                    </h3>
                  </div>
                  <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700 }}>
                    18 Default Questions across CSE Fields
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#1e40af', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Complete the standard MCQ technical test below covering key Computer Science domains (Full-Stack Web, AI & ML, Data Science, Cybersecurity, Cloud & DevOps, and Algorithms). Answering MCQs evaluates your technical proficiency and automatically verifies skills on your career profile.
                </p>

                {/* EVALUATION RESULTS CARD */}
                {cseSkillResult && (
                  <div style={{ background: '#fff', border: '2px solid #3b82f6', borderRadius: 18, padding: 22, marginBottom: 24, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🎯 Technical Skill Diagnostic Score
                      </span>
                      <span style={{ fontSize: 12, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 12, fontWeight: 800 }}>
                        {cseSkillResult.totalCorrectCount} / {cseSkillResult.totalQuestions} Correct ({cseSkillResult.overallAccuracyPercent}%)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>Strongest Technical Domain:</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#1e3a8a', margin: '2px 0 4px' }}>
                          {cseSkillResult.topDomain}
                        </div>
                        <div style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                          ✓ {cseSkillResult.verifiedSkills.length} Technical Skills Verified & Saved to Profile
                        </div>
                      </div>

                      {/* VERIFIED SKILLS BADGES */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 2 }}>
                        {cseSkillResult.verifiedSkills.map(sk => (
                          <span key={sk} style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#047857', fontSize: 12, fontWeight: 800, padding: '6px 12px', borderRadius: 16 }}>
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CSE DOMAIN PERFORMANCE BREAKDOWN */}
                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 14, marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📊 Domain Performance Breakdown
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {cseSkillResult.domainBreakdown.map(db => (
                          <div key={db.domainName} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>{db.domainName}</span>
                              <span style={{ fontSize: 12, fontWeight: 900, color: '#1d4ed8' }}>{db.scorePercent}%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${db.scorePercent}%`, height: '100%', background: db.scorePercent >= 60 ? '#10b981' : db.scorePercent >= 30 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.3s ease' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 18 DEFAULT MCQ QUESTIONS LIST */}
                {loadingCseMcq ? (
                  <SLoader label="Loading 18 standard CSE MCQ technical questions..." />
                ) : cseMcqQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* DOMAIN & DIFFICULTY FILTER TABS */}
                    <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 16, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        {/* DOMAIN FILTER TABS */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {['All', 'Full-Stack Web & Software', 'Artificial Intelligence & ML', 'Data Science & Analytics', 'Cybersecurity & DevSecOps', 'Cloud Computing & DevOps', 'Algorithms & Data Structures'].map(dom => {
                            const count = dom === 'All' ? cseMcqQuestions.length : cseMcqQuestions.filter(q => q.domain === dom).length
                            const isActive = cseDomainFilter === dom
                            const shortLabel = dom === 'All' ? '📋 All (18)' : dom === 'Full-Stack Web & Software' ? '🌐 Web' : dom === 'Artificial Intelligence & ML' ? '🧠 AI/ML' : dom === 'Data Science & Analytics' ? '📊 Data' : dom === 'Cybersecurity & DevSecOps' ? '🛡️ Cyber' : dom === 'Cloud Computing & DevOps' ? '☁️ Cloud' : '⚡ Algorithms'

                            return (
                              <button
                                key={dom}
                                type="button"
                                onClick={() => setCseDomainFilter(dom)}
                                style={{
                                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                                  border: isActive ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                                  background: isActive ? '#1d4ed8' : '#f8fafc',
                                  color: isActive ? '#fff' : '#334155',
                                  fontSize: 12, fontWeight: 800, transition: 'all 0.15s ease'
                                }}
                              >
                                {shortLabel} ({count})
                              </button>
                            )
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={handleEvaluateCseMcq}
                          disabled={evaluatingCseMcq}
                          style={{
                            background: '#1d4ed8', color: '#fff', border: 'none',
                            borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 800,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(29, 78, 216, 0.25)'
                          }}
                        >
                          {evaluatingCseMcq ? 'Evaluating Answers...' : '⚡ Submit & Evaluate MCQ Test'}
                        </button>
                      </div>

                      {/* DIFFICULTY FILTER TABS & ANSWER COUNTER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Difficulty:</span>
                          {['All', 'Easy', 'Medium', 'Hard'].map(diff => {
                            const isActive = cseDifficultyFilter === diff
                            let activeBg = '#1d4ed8'
                            if (diff === 'Easy') activeBg = '#059669'
                            else if (diff === 'Medium') activeBg = '#d97706'
                            else if (diff === 'Hard') activeBg = '#dc2626'

                            return (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => setCseDifficultyFilter(diff)}
                                style={{
                                  padding: '4px 12px', borderRadius: 14, cursor: 'pointer',
                                  border: isActive ? `2px solid ${activeBg}` : '1px solid #cbd5e1',
                                  background: isActive ? activeBg : '#f8fafc',
                                  color: isActive ? '#fff' : '#475569',
                                  fontSize: 11, fontWeight: 800
                                }}
                              >
                                {diff === 'Easy' && '🟢 '}
                                {diff === 'Medium' && '🟡 '}
                                {diff === 'Hard' && '🔴 '}
                                {diff}
                              </button>
                            )
                          })}
                        </div>

                        <span style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>
                          Answer Progress: {Object.keys(cseMcqAnswers).length} of {cseMcqQuestions.length} Answered
                        </span>
                      </div>
                    </div>

                    {/* MCQ QUESTIONS LIST */}
                    {cseMcqQuestions
                      .filter(q => cseDomainFilter === 'All' || q.domain === cseDomainFilter)
                      .filter(q => cseDifficultyFilter === 'All' || q.difficulty === cseDifficultyFilter)
                      .map((q, qIdx) => {
                        const selectedOptId = cseMcqAnswers[q.questionNumber]
                        const diff = q.difficulty || 'Medium'
                        let badgeStyle = { bg: '#d1fae5', color: '#047857', label: '🟢 EASY' }
                        if (diff === 'Medium') badgeStyle = { bg: '#fef3c7', color: '#b45309', label: '🟡 MEDIUM' }
                        else if (diff === 'Hard') badgeStyle = { bg: '#fee2e2', color: '#b91c1c', label: '🔴 HARD' }

                        return (
                          <div key={q.questionNumber || qIdx} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 16, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8' }}>
                                  Question {q.questionNumber} of 18 • {q.domain}
                                </span>
                                <span style={{ fontSize: 11, background: badgeStyle.bg, color: badgeStyle.color, padding: '2px 8px', borderRadius: 8, fontWeight: 800 }}>
                                  {badgeStyle.label}
                                </span>
                              </div>
                              <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 10px', borderRadius: 8, fontWeight: 700 }}>
                                Target Skill: {q.skillTag}
                              </span>
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', marginBottom: 14, lineHeight: 1.5 }}>
                              {q.questionText}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                              {q.options?.map((opt, optIdx) => {
                                const isSelected = selectedOptId === opt.optionId
                                const optionLetter = String.fromCharCode(65 + optIdx) // A, B, C, D

                                return (
                                  <button
                                    key={opt.optionId}
                                    type="button"
                                    onClick={() => setCseMcqAnswers({ ...cseMcqAnswers, [q.questionNumber]: opt.optionId })}
                                    style={{
                                      padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                      border: isSelected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                                      background: isSelected ? '#eff6ff' : '#f8fafc',
                                      color: isSelected ? '#1d4ed8' : 'var(--s-text)', fontSize: 13, fontWeight: isSelected ? 700 : 500,
                                      lineHeight: 1.4, transition: 'all 0.12s ease', display: 'flex', gap: 10, alignItems: 'flex-start'
                                    }}
                                  >
                                    <span style={{ background: isSelected ? '#1d4ed8' : '#e2e8f0', color: isSelected ? '#fff' : '#475569', width: 22, height: 22, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                                      {optionLetter}
                                    </span>
                                    <span>{opt.text}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}

                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={handleEvaluateCseMcq}
                        disabled={evaluatingCseMcq}
                        style={{
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                          color: '#fff', border: 'none', borderRadius: 14,
                          padding: '14px 36px', fontSize: 15, fontWeight: 800,
                          cursor: 'pointer', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)'
                        }}
                      >
                        {evaluatingCseMcq ? 'Evaluating CSE Technical Skills...' : '⚡ Evaluate Technical Skills & Verify Profile Badges'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* MANUAL SKILLS TAG CUSTOMIZER TOGGLE */}
              <div style={{ borderTop: '1px dashed var(--s-border)', paddingTop: 20, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowManualSkillsToggle(!showManualSkillsToggle)}
                  style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {showManualSkillsToggle ? '▲ Hide Manual Skill Selection' : '▼ Plus manually customize or select additional skill tags'}
                </button>

                {showManualSkillsToggle && (
                  <div style={{ marginTop: 16, background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 20 }}>
                    <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 14 }}>
                      Select additional tools or technologies you practice to include them in your profile:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {SKILLS_OPTIONS.map(sk => {
                        const isSelected = profile.skills.includes(sk)
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleArrayItem('skills', sk)}
                            style={{
                              padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                              border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                              background: isSelected ? 'var(--s-primary)' : '#fff',
                              color: isSelected ? '#fff' : 'var(--s-text2)', fontWeight: 700, fontSize: 13
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '} {sk}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Standard Default Diagnostic Test across All Domains (Easy, Medium, Hard) */}
          {step === 7 && (
            <div className="s-anim-up">
              {/* AHP + FUZZY LOGIC DOMAIN PRIORITY DIAGNOSTIC */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #a7f3d0', borderRadius: 20, padding: 24, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#047857', background: '#d1fae5', padding: '4px 12px', borderRadius: 20 }}>
                      📊 Standard Default Assessment • 🧠 Fuzzy Logic Domain Finder
                    </span>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 0', color: '#064e3b' }}>
                      Step 7: Universal Engineering Domain Assessment Test
                    </h3>
                  </div>
                  <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                    15 Standard Default Questions (Easy, Medium, Hard)
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#065f46', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Every student takes the same standardized test across all engineering domains (CSE, IT, AI & DS, ECE, EEE, Mechanical, Civil, Chemical, Mechatronics). Questions are categorized into <strong>Easy (1x)</strong>, <strong>Medium (1.5x)</strong>, and <strong>Hard (2x)</strong> difficulties. Our <strong>Mamdani Fuzzy Logic Inference Engine</strong> defuzzifies your answers to suggest your optimal domain.
                </p>

                {/* AHP + FUZZY EVALUATION RESULTS CARD */}
                {ahpResult && ahpResult.topDomain && (
                  <div style={{ background: '#fff', border: '2px solid #10b981', borderRadius: 18, padding: 22, marginBottom: 24, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🏆 Recommended Engineering Domain (Fuzzy Logic Analysis)
                      </span>
                      {ahpResult.isTieCondition && (
                        <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 12, fontWeight: 700 }}>
                          🔀 Fuzzy Logic Tie-Breaker Applied
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>Optimal Domain Match:</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#065f46', margin: '2px 0 6px' }}>
                          {ahpResult.topDomain.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--s-text2)' }}>
                          Category: <strong>{ahpResult.topDomain.category}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '10px 16px', borderRadius: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#166534', fontWeight: 700 }}>Domain Priority</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#047857' }}>{ahpResult.topDomain.ahpScorePercent}%</div>
                        </div>
                        <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', padding: '10px 16px', borderRadius: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 700 }}>Fuzzy Match</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#1d4ed8' }}>{ahpResult.topDomain.fuzzyMatchScore}%</div>
                        </div>
                        <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', padding: '10px 16px', borderRadius: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 700 }}>Combined Match</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#7e22ce' }}>{ahpResult.topDomain.combinedScorePercent}%</div>
                        </div>
                      </div>
                    </div>

                    {ahpResult.isTieCondition && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#92400e', marginBottom: 14, lineHeight: 1.5 }}>
                        💡 <strong>Tie-Breaker Explanation:</strong> {ahpResult.tieBreakReason}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            domain: ahpResult.topDomain.name
                          }))
                        }}
                        style={{
                          background: '#047857', color: '#fff', border: 'none',
                          borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 800,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                      >
                        ✓ Apply Suggested Domain ({ahpResult.topDomain.name}) to My Profile
                      </button>
                      <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                        {profile.domain === ahpResult.topDomain.name ? '✓ Currently Selected in Profile' : ''}
                      </span>
                    </div>

                    {/* DOMAIN RANKINGS LIST */}
                    {ahpResult.rankings && ahpResult.rankings.length > 0 && (
                      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#065f46', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📊 Full Domain Suitability Rankings (Across All Engineering Fields)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                          {ahpResult.rankings.slice(0, 6).map((rk, idx) => (
                            <div key={rk.id} style={{ background: idx === 0 ? '#ecfdf5' : '#f8fafc', border: idx === 0 ? '1px solid #6ee7b7' : '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: 11, fontWeight: 800, color: idx === 0 ? '#047857' : '#64748b' }}>#{idx + 1}</span>{' '}
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text)' }}>{rk.name}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 900, color: idx === 0 ? '#047857' : '#334155' }}>{rk.combinedScorePercent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 15 DEFAULT QUESTIONS WITH EASY, MEDIUM, HARD FILTERS */}
                {loadingAhp ? (
                  <SLoader label="Loading standard default diagnostic questions from database..." />
                ) : ahpQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* DIFFICULTY FILTER TABS & PROGRESS BAR */}
                    <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 16, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['All', 'Easy', 'Medium', 'Hard'].map(diff => {
                            const count = diff === 'All' ? ahpQuestions.length : ahpQuestions.filter(q => (q.difficulty || 'Medium') === diff).length
                            const isActive = difficultyFilter === diff
                            let activeBg = '#047857'
                            if (diff === 'Easy') activeBg = '#059669'
                            else if (diff === 'Medium') activeBg = '#d97706'
                            else if (diff === 'Hard') activeBg = '#dc2626'

                            return (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => setDifficultyFilter(diff)}
                                style={{
                                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                                  border: isActive ? `2px solid ${activeBg}` : '1px solid #cbd5e1',
                                  background: isActive ? activeBg : '#f8fafc',
                                  color: isActive ? '#fff' : '#334155',
                                  fontSize: 12, fontWeight: 800, transition: 'all 0.15s ease'
                                }}
                              >
                                {diff === 'All' && '📋 '}
                                {diff === 'Easy' && '🟢 '}
                                {diff === 'Medium' && '🟡 '}
                                {diff === 'Hard' && '🔴 '}
                                {diff} ({count})
                              </button>
                            )
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={handleEvaluateAhpFuzzy}
                          disabled={evaluatingAhp}
                          style={{
                            background: '#047857', color: '#fff', border: 'none',
                            borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 800,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(4, 120, 87, 0.2)'
                          }}
                        >
                          {evaluatingAhp ? 'Evaluating Answers...' : '⚡ Calculate Matching Domain'}
                        </button>
                      </div>

                      {/* DIFFICULTY ANSWERED PROGRESS STATS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, fontSize: 12 }}>
                        {['Easy', 'Medium', 'Hard'].map(diff => {
                          const diffQs = ahpQuestions.filter(q => (q.difficulty || 'Medium') === diff)
                          const diffAns = diffQs.filter(q => ahpAnswers[q.questionNumber]).length
                          const totalDiff = diffQs.length
                          const pct = totalDiff > 0 ? Math.round((diffAns / totalDiff) * 100) : 0
                          let color = '#059669'
                          if (diff === 'Medium') color = '#d97706'
                          if (diff === 'Hard') color = '#dc2626'

                          return (
                            <div key={diff} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: color, marginBottom: 4 }}>
                                <span>{diff === 'Easy' ? '🟢 Easy' : diff === 'Medium' ? '🟡 Medium' : '🔴 Hard'}</span>
                                <span>{diffAns}/{totalDiff}</span>
                              </div>
                              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* QUESTIONS DISPLAY */}
                    {ahpQuestions
                      .filter(q => difficultyFilter === 'All' || (q.difficulty || 'Medium') === difficultyFilter)
                      .map((q, qIdx) => {
                        const selectedOptId = ahpAnswers[q.questionNumber]
                        const diff = q.difficulty || 'Medium'
                        let badgeStyle = { bg: '#d1fae5', color: '#047857', label: '🟢 EASY (1.0x)' }
                        if (diff === 'Medium') badgeStyle = { bg: '#fef3c7', color: '#b45309', label: '🟡 MEDIUM (1.5x)' }
                        else if (diff === 'Hard') badgeStyle = { bg: '#fee2e2', color: '#b91c1c', label: '🔴 HARD (2.0x)' }

                        return (
                          <div key={q.questionNumber || qIdx} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 16, padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>
                                  Question {q.questionNumber} of 15 • {q.category}
                                </span>
                                <span style={{ fontSize: 11, background: badgeStyle.bg, color: badgeStyle.color, padding: '2px 8px', borderRadius: 8, fontWeight: 800 }}>
                                  {badgeStyle.label}
                                </span>
                              </div>
                              <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                                Dimension: {q.dimension}
                              </span>
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', marginBottom: 14, lineHeight: 1.5 }}>
                              {q.questionText}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                              {q.options?.map((opt) => {
                                const isSelected = selectedOptId === opt.optionId
                                return (
                                  <button
                                    key={opt.optionId}
                                    type="button"
                                    onClick={() => setAhpAnswers({ ...ahpAnswers, [q.questionNumber]: opt.optionId })}
                                    style={{
                                      padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                      border: isSelected ? '2px solid #047857' : '1px solid #e2e8f0',
                                      background: isSelected ? '#d1fae5' : '#f8fafc',
                                      color: isSelected ? '#047857' : 'var(--s-text)', fontSize: 13, fontWeight: isSelected ? 700 : 500,
                                      lineHeight: 1.4, transition: 'all 0.12s ease'
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{opt.text}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}

                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={handleEvaluateAhpFuzzy}
                        disabled={evaluatingAhp}
                        style={{
                          background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                          color: '#fff', border: 'none', borderRadius: 14,
                          padding: '14px 36px', fontSize: 15, fontWeight: 800,
                          cursor: 'pointer', boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
                        }}
                      >
                        {evaluatingAhp ? 'Running Fuzzy Inference Engine...' : '⚡ Run AHP + Fuzzy Logic Domain Recommendation'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* SECONDARY GROK DIAGNOSTIC QUIZ */}
              <div style={{ borderTop: '2px dashed var(--s-border)', paddingTop: 28, marginTop: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#6d28d9', letterSpacing: '0.06em' }}>
                      ⚡ Powered by xAI Grok API
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0', color: 'var(--s-text)' }}>
                      Selected Domain Skill Diagnostic Quiz ({profile.domain})
                    </h3>
                  </div>
                </div>

                {loadingGrok ? (
                  <div style={{ padding: 30, textAlign: 'center' }}>
                    <SLoader label="Generating dynamic diagnostic questions using xAI Grok API..." />
                  </div>
                ) : grokQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {grokQuestions.map((q, qIdx) => {
                      const selectedOpt = grokAnswers[q.id]
                      return (
                        <div key={q.id || qIdx} style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>
                              Diagnostic Question {qIdx + 1} of {grokQuestions.length} • {q.topic || 'Concept Check'}
                            </span>
                          </div>

                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', marginBottom: 12 }}>
                            {q.question}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                            {q.options?.map((opt, oIdx) => {
                              const isChosen = selectedOpt === oIdx
                              const isCorrect = oIdx === q.correctIndex
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => setGrokAnswers({ ...grokAnswers, [q.id]: oIdx })}
                                  style={{
                                    padding: 12, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                    border: isChosen ? (isCorrect ? '2px solid #047857' : '2px solid #dc2626') : '1px solid var(--s-border)',
                                    background: isChosen ? (isCorrect ? '#d1fae5' : '#fee2e2') : '#fff',
                                    color: 'var(--s-text)', fontSize: 13, fontWeight: 600
                                  }}
                                >
                                  <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
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

              {step < 7 ? (
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
