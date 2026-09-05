import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SCard, SInput, SSelect, SAlert, SLoader } from '../../components/ui'
import { taxonomyService } from '../../services/taxonomyService'
import onboardingService from '../../../services/onboardingService'
import { COLLEGE_FIELDS_DATA } from '../../config/collegeFieldsData'
import {
  getPersonalizedCareerRecommendations,
  getPersonalizedAcademicFocusOptions,
  COLLEGE_CAREER_CATALOG
} from '../../services/collegeCareerRecommendationEngine'
import {
  FiArrowRight, FiArrowLeft, FiSave, FiCheckCircle,
  FiBookOpen, FiHome, FiCpu, FiHeart, FiFeather, FiShield,
  FiBriefcase, FiGlobe, FiActivity, FiStar, FiAward, FiCheck, FiZap, FiHelpCircle,
  FiUsers, FiSun, FiBook, FiDollarSign, FiRadio, FiAlertCircle, FiTrendingUp, FiTarget, FiRefreshCw
} from 'react-icons/fi'

const ICON_MAP = {
  FiCpu, FiHeart, FiFeather, FiShield, FiBriefcase, FiGlobe, FiActivity,
  FiUsers, FiZap, FiSun, FiBook, FiDollarSign, FiRadio
}

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode',
  'Tirunelveli', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Namakkal',
  'Dharmapuri', 'Krishnagiri', 'Karur', 'Thoothukudi', 'Tiruppur',
  'Tiruvannamalai', 'Cuddalore', 'Nagapattinam', 'Others'
]

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

  // Domain-Aware Assessment State (Step 7)
  const [domainQuestions, setDomainQuestions] = useState([])
  const [domainAnswers, setDomainAnswers] = useState({})
  const [missingDomain, setMissingDomain] = useState(false)
  const [loadingDomainQuestions, setLoadingDomainQuestions] = useState(false)
  const [baselineReport, setBaselineReport] = useState(null)
  const [submittingAssessment, setSubmittingAssessment] = useState(false)
  const [activeStageTab, setActiveStageTab] = useState('ALL')
  const [dismissedCareerIds, setDismissedCareerIds] = useState([])
  const [showExploreModal, setShowExploreModal] = useState(false)

  // Load Fields Taxonomy on Mount
  useEffect(() => {
    const initTaxonomy = async () => {
      try {
        const fields = await taxonomyService.getFields()
        setFieldsList(fields)

        const token = localStorage.getItem('studentToken')
        if (token) {
          const res = await axios.get('http://localhost:5000/api/college-profile/my-profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
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
            if (p.onboardingBaseline) {
              setBaselineReport(p.onboardingBaseline)
            }
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

  // Fetch Domain-Aware Onboarding Questions when Step 7 is reached
  useEffect(() => {
    if (step === 7 && domainQuestions.length === 0 && !baselineReport) {
      fetchDomainQuestions()
    }
  }, [step])

  const fetchDomainQuestions = async () => {
    setLoadingDomainQuestions(true)
    setError('')
    try {
      const res = await onboardingService.getCollegeQuestions()
      if (res.missingDomain) {
        setMissingDomain(true)
      } else if (res.success && Array.isArray(res.questions)) {
        setMissingDomain(false)
        setDomainQuestions(res.questions)
      }
    } catch (err) {
      console.warn('Failed to fetch domain questions:', err)
      setError('Failed to prepare domain questions. Please check connection and retry.')
    } finally {
      setLoadingDomainQuestions(false)
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
        await axios.post(
          'http://localhost:5000/api/college-profile/save',
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
          },
          { headers: { Authorization: `Bearer ${token}` } }
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
    if (step === 1 && !profile.institution.trim()) {
      setError('Please enter your college or institution name')
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

  const handleSubmitDomainAssessment = async () => {
    setSubmittingAssessment(true)
    setError('')
    try {
      const payloadAnswers = domainQuestions.map(q => ({
        questionId: q.id,
        questionText: q.questionText,
        topic: q.topic,
        difficulty: q.difficulty,
        selectedAnswer: domainAnswers[q.id] || '',
        correctAnswer: q.correctAnswer
      }))

      const res = await onboardingService.submitCollegeOnboarding({ answers: payloadAnswers })
      if (res.success && res.baselineResult) {
        setBaselineReport(res.baselineResult)
      } else {
        setError('Assessment submission failed. Please try again.')
      }
    } catch (err) {
      console.error('Submit assessment error:', err)
      setError('Failed to submit domain assessment.')
    } finally {
      setSubmittingAssessment(false)
    }
  }

  const handleRetakeAssessment = async () => {
    try {
      await onboardingService.retakeDomainAssessment()
      setBaselineReport(null)
      setDomainAnswers({})
      setDomainQuestions([])
      fetchDomainQuestions()
    } catch (err) {
      setError('Failed to reset assessment.')
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

          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
                Step 1: Institution & Academic Level
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
                Where are you currently pursuing your college education?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SInput
                  label="College / Institution Name *"
                  placeholder="e.g. PSG College of Technology, Anna University Campus"
                  value={profile.institution}
                  onChange={e => setProfile({ ...profile, institution: e.target.value })}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                  <SSelect
                    label="District Location of College"
                    value={profile.institutionDistrict}
                    onChange={e => setProfile({ ...profile, institutionDistrict: e.target.value })}
                    options={TN_DISTRICTS.map(d => ({ value: d, label: d }))}
                  />

                  <SSelect
                    label="Current Academic Year"
                    value={profile.currentYear}
                    onChange={e => setProfile({ ...profile, currentYear: e.target.value })}
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
            </div>
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
                            onClick={() => setProfile({ ...profile, domain: dom.name })}
                            style={{
                              padding: 16, borderRadius: 14, cursor: 'pointer',
                              border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                              background: isSelected ? 'var(--s-primary-l)' : '#fff',
                              fontWeight: 700, fontSize: 14, color: isSelected ? 'var(--s-primary)' : 'var(--s-text)'
                            }}
                          >
                            {dom.name}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {specsList.length > 0 && (
                  <div>
                    <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                      Specialization / Elective Focus (Optional)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {specsList.map(sp => {
                        const isSelected = profile.specialization === sp.name
                        return (
                          <button
                            key={sp.id || sp.name}
                            type="button"
                            onClick={() => setProfile({ ...profile, specialization: sp.name })}
                            style={{
                              padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                              border: isSelected ? '2px solid #047857' : '1px solid var(--s-border)',
                              background: isSelected ? '#d1fae5' : '#fff',
                              color: isSelected ? '#047857' : 'var(--s-text2)', fontWeight: 700, fontSize: 13
                            }}
                          >
                            {sp.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Personalized Academic Interests & Career Aspirations */}
          {step === 5 && (() => {
            const personalizedFocus = getPersonalizedAcademicFocusOptions(profile)
            const recResult = getPersonalizedCareerRecommendations(profile)

            const recommendedPathways = (recResult.recommendedPathways || [])
              .filter(c => !dismissedCareerIds.includes(c.id))
            const relatedDirections = (recResult.relatedDirections || [])
              .filter(c => !dismissedCareerIds.includes(c.id))
            const careerSwitches = (recResult.careerSwitches || [])
              .filter(c => !dismissedCareerIds.includes(c.id))

            const renderCareerCard = (career, isSwitchCard = false) => {
              const isPrimary = profile.targetCareer === career.title
              const isSelected = profile.careerInterests.includes(career.title) || isPrimary

              return (
                <div
                  key={career.id}
                  style={{
                    padding: 20, borderRadius: 16, background: '#fff',
                    border: isPrimary ? '2.5px solid #047857' : isSelected ? '2px solid #0284c7' : '1px solid var(--s-border)',
                    boxShadow: isPrimary ? '0 6px 20px rgba(4, 120, 87, 0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                          {career.title}
                        </h4>
                        <span style={{
                          fontSize: 11, fontWeight: 800,
                          background: isSwitchCard ? '#fff7ed' : '#ecfdf5',
                          color: isSwitchCard ? '#c2410c' : '#047857',
                          padding: '3px 10px', borderRadius: 12,
                          border: isSwitchCard ? '1px solid #ffedd5' : '1px solid #a7f3d0'
                        }}>
                          {career.matchScore > 0 ? `${career.matchScore}% Match` : 'Cross-Domain Explorer'}
                        </span>
                        {isPrimary && (
                          <span style={{ fontSize: 11, fontWeight: 800, background: '#047857', color: '#fff', padding: '3px 10px', borderRadius: 12 }}>
                            🎯 Primary Target Role
                          </span>
                        )}
                        {isSwitchCard && (
                          <span style={{ fontSize: 11, fontWeight: 800, background: '#ea580c', color: '#fff', padding: '3px 10px', borderRadius: 12 }}>
                            🔀 Career Switch Path
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>
                        {career.category} • {career.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            targetCareer: career.title,
                            careerInterests: Array.from(new Set([...prev.careerInterests, career.title]))
                          }))
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                          background: isPrimary ? '#047857' : '#f1f5f9',
                          color: isPrimary ? '#fff' : '#334155',
                          border: isPrimary ? 'none' : '1px solid #cbd5e1'
                        }}
                      >
                        {isPrimary ? '✓ Primary Target' : 'Set as Primary'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleArrayItem('careerInterests', career.title)}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          background: isSelected ? '#e0f2fe' : '#fff',
                          color: isSelected ? '#0284c7' : '#64748b',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        {isSelected ? '✓ In Pathway List' : '+ Add to Pathway'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDismissedCareerIds(prev => [...prev, career.id])}
                        title="Not interested in this career"
                        style={{ padding: '6px 10px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Transparent Match Reason */}
                  <div style={{ fontSize: 12, color: isSwitchCard ? '#9a3412' : '#0369a1', background: isSwitchCard ? '#fff7ed' : '#f0f9ff', padding: '10px 14px', borderRadius: 10, marginTop: 10, lineHeight: 1.4 }}>
                    💡 <strong>Why this matches you:</strong> {career.matchExplanation}
                  </div>

                  {/* Matched Strengths */}
                  {career.matchedStrengths?.length > 0 && (
                    <div style={{ fontSize: 11, color: '#047857', marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>✓ Your Profile Strengths:</strong>
                      {career.matchedStrengths.map((str, idx) => (
                        <span key={idx} style={{ background: '#d1fae5', padding: '2px 8px', borderRadius: 6, color: '#065f46', fontWeight: 600 }}>
                          {str}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills to Develop */}
                  {career.skillGapsToDevelop?.length > 0 && (
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>△ Target Skills to Develop:</strong>
                      {career.skillGapsToDevelop.map((sk, idx) => (
                        <span key={idx} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: '#334155', fontWeight: 600 }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div className="s-anim-up">
                {/* Profile Guidance Context Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  borderRadius: 18, padding: '20px 24px', color: '#fff', marginBottom: 28,
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.2)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, marginBottom: 4 }}>
                    🎯 PROFILE-DRIVEN RECOMMENDATIONS ENGINE
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 6px', color: '#fff' }}>
                    Step 5: Tailored Focus & Career Pathways
                  </h3>
                  <p style={{ fontSize: 13, color: '#e0f2fe', margin: 0, lineHeight: 1.5 }}>
                    Generated for your academic profile: <strong>{profile.degreeProgramme || 'Degree'}</strong>
                    {profile.domain && ` • ${profile.domain}`}
                    {profile.specialization && ` → ${profile.specialization}`} ({profile.currentYear || '1st Year'})
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* 1. Personalized Academic Focus Options */}
                  <div>
                    <label style={{ fontWeight: 800, fontSize: 14, display: 'block', marginBottom: 6, color: 'var(--s-text)' }}>
                      Personalized Academic Focus (Select your priorities)
                    </label>
                    <p style={{ fontSize: 12, color: 'var(--s-text3)', marginBottom: 14 }}>
                      Choose academic focus areas matching your branch and year goals.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                      {personalizedFocus.map(opt => {
                        const isSelected = profile.academicInterests.includes(opt.title)
                        return (
                          <div
                            key={opt.id}
                            onClick={() => toggleArrayItem('academicInterests', opt.title)}
                            style={{
                              padding: 16, borderRadius: 14, cursor: 'pointer',
                              border: isSelected ? '2px solid #0284c7' : '1px solid var(--s-border)',
                              background: isSelected ? '#f0f9ff' : '#fff',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 8 }}>
                                {opt.category}
                              </span>
                              <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: isSelected ? '#0284c7' : '#f1f5f9',
                                color: isSelected ? '#fff' : '#cbd5e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <FiCheck size={14} />
                              </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', marginBottom: 4 }}>
                              {opt.title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--s-text3)', lineHeight: 1.4 }}>
                              {opt.desc}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 2. Directly Recommended Career Pathways */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <label style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)', margin: 0 }}>
                          🎯 Recommended Career Pathways (Direct Academic Fit)
                        </label>
                        <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                          Careers directly supported by your major degree ({profile.degreeProgramme || 'Degree'}).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowExploreModal(true)}
                        style={{
                          background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                          padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <FiGlobe size={14} /> Explore All Careers
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
                      {recommendedPathways.length > 0 ? (
                        recommendedPathways.map(c => renderCareerCard(c, false))
                      ) : (
                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, fontSize: 13, color: '#64748b' }}>
                          No direct pathways match this specific sub-specialization. Check related directions below.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Related Career Directions */}
                  {relatedDirections.length > 0 && (
                    <div>
                      <div style={{ marginBottom: 6 }}>
                        <label style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)', margin: 0 }}>
                          🔄 Related Career Directions (Interdisciplinary / Adjacent)
                        </label>
                        <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                          Adjacent pathways bridging your academic background with interdisciplinary skills.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
                        {relatedDirections.map(c => renderCareerCard(c, false))}
                      </div>
                    </div>
                  )}

                  {/* 4. Explore Career Switches */}
                  {careerSwitches.length > 0 && (
                    <div>
                      <div style={{ marginBottom: 6 }}>
                        <label style={{ fontWeight: 800, fontSize: 14, color: '#c2410c', margin: 0 }}>
                          🔀 Explore Career Switches (Optional Cross-Domain Pathways)
                        </label>
                        <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                          Careers requiring a significant domain transition and prerequisite learning.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
                        {careerSwitches.map(c => renderCareerCard(c, true))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )
          })()}

          {/* STEP 6: Skills */}
          {step === 6 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
                Step 6: Skills & Technical Competencies
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
                Select tools and technologies you currently practice or wish to build.
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
                        padding: '10px 18px', borderRadius: 20, cursor: 'pointer',
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

          {/* STEP 7: Domain-Aware Onboarding Assessment & Baseline Telemetry */}
          {step === 7 && (
            <div className="s-anim-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)', letterSpacing: '0.06em' }}>
                    🎯 Domain-Aware Academic Diagnostic Engine
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, margin: '4px 0 0', color: 'var(--s-text)' }}>
                    Step 7: Knowledge Baseline Assessment
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, background: 'var(--s-primary-l)', color: 'var(--s-primary)', padding: '6px 12px', borderRadius: 20, fontWeight: 800 }}>
                    {profile.domain || 'Domain Unselected'}
                  </span>
                  {profile.specialization && (
                    <span style={{ fontSize: 12, background: '#d1fae5', color: '#047857', padding: '6px 12px', borderRadius: 20, fontWeight: 800 }}>
                      {profile.specialization}
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Domain Handling (Section 22) */}
              {missingDomain ? (
                <div style={{ background: '#fffba6', border: '1.5px solid #f59e0b', borderRadius: 20, padding: 30, textAlign: 'center' }}>
                  <FiAlertCircle size={44} style={{ color: '#d97706', marginBottom: 12 }} />
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: '#92400e', margin: '0 0 8px' }}>
                    Academic Profile Incomplete
                  </h4>
                  <p style={{ fontSize: 14, color: '#78350f', maxWidth: 500, margin: '0 auto 20px' }}>
                    Please complete your academic profile so we can personalize your onboarding assessment.
                  </p>
                  <SBtn variant="primary" onClick={() => setStep(2)}>
                    Complete Field & Domain Selection
                  </SBtn>
                </div>
              ) : baselineReport ? (
                /* ── BASELINE SUMMARY REPORT CARD ── */
                <div style={{ background: '#f8fafc', border: '2px solid #047857', borderRadius: 24, padding: 30 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCheckCircle size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 18, fontWeight: 900, color: '#065f46', margin: 0 }}>
                        Initial Academic Knowledge Baseline
                      </h4>
                      <div style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                        Assessment Complete • {profile.domain}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #a7f3d0', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#064e3b', margin: 0, lineHeight: 1.6 }}>
                      {baselineReport.currentBaseline}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24 }}>
                    {/* Strengths */}
                    <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#047857', marginBottom: 12 }}>
                        <FiTrendingUp size={16} /> Areas Showing Strength
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {baselineReport.strengths?.map((s, idx) => (
                          <span key={idx} style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Areas to Strengthen */}
                    <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#b45309', marginBottom: 12 }}>
                        <FiTarget size={16} /> Areas to Strengthen
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {baselineReport.areasToStrengthen?.map((a, idx) => (
                          <span key={idx} style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                            🎯 {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Starting Topics */}
                  <div style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 18, marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#6d28d9', marginBottom: 12 }}>
                      🚀 Recommended Starting Topics
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {baselineReport.recommendedStartingTopics?.map((t, idx) => (
                        <span key={idx} style={{ background: '#ede9fe', color: '#5b21b6', padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 700 }}>
                          • {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button
                      type="button"
                      onClick={handleRetakeAssessment}
                      style={{
                        background: 'none', border: '1px solid var(--s-border)',
                        borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                        color: 'var(--s-text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <FiRefreshCw size={14} /> Retake Domain Quiz
                    </button>
                  </div>
                </div>
              ) : loadingDomainQuestions ? (
                <div style={{ padding: 50, textAlign: 'center' }}>
                  <SLoader label="Preparing questions based on your academic profile..." />
                </div>
              ) : domainQuestions.length > 0 ? (
                /* ── 3-STAGE QUESTION ASSESSMENT WORKFLOW ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                  {/* Stage Progress Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 14, borderRadius: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>Stage 1 — Foundation</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>Very Easy (Basic Concepts)</div>
                    </div>
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: 14, borderRadius: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Stage 2 — Conceptual</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Easy (Application & Logic)</div>
                    </div>
                    <div style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', padding: 14, borderRadius: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>Stage 3 — Moderate</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6' }}>Analytical Reasoning</div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, fontSize: 13, color: 'var(--s-text2)' }}>
                    📝 Answer these diagnostic questions tailored specifically to your branch (<strong>{profile.domain}</strong>). The progression tests your baseline conceptual knowledge.
                  </div>

                  {domainQuestions.map((q, qIdx) => {
                    const selectedOpt = domainAnswers[q.id]
                    const diffBadge = {
                      VERY_EASY: { label: 'Very Easy (Foundation)', bg: '#dbeafe', text: '#1e40af' },
                      EASY: { label: 'Easy (Conceptual)', bg: '#fef3c7', text: '#b45309' },
                      MODERATE: { label: 'Moderate (Analytical)', bg: '#f3e8ff', text: '#6d28d9' }
                    }[q.difficulty] || { label: q.difficulty, bg: '#f1f5f9', text: '#475569' }

                    return (
                      <div key={q.id || qIdx} style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 18, padding: 22 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-primary)' }}>
                            Question {qIdx + 1} of {domainQuestions.length} • {q.topic || 'Core Fundamentals'}
                          </span>
                          <span style={{ fontSize: 11, background: diffBadge.bg, color: diffBadge.text, padding: '4px 10px', borderRadius: 10, fontWeight: 800 }}>
                            {diffBadge.label}
                          </span>
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', marginBottom: 16, lineHeight: 1.5 }}>
                          {q.questionText}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                          {q.options?.map((opt, oIdx) => {
                            const isChosen = selectedOpt === opt
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => setDomainAnswers({ ...domainAnswers, [q.id]: opt })}
                                style={{
                                  padding: 14, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                  border: isChosen ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                                  background: isChosen ? 'var(--s-primary-l)' : '#fff',
                                  color: isChosen ? 'var(--s-primary)' : 'var(--s-text)',
                                  fontSize: 13, fontWeight: 600, transition: 'all 0.15s ease'
                                }}
                              >
                                <strong style={{ marginRight: 6 }}>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <SBtn
                      variant="primary"
                      onClick={handleSubmitDomainAssessment}
                      disabled={submittingAssessment || Object.keys(domainAnswers).length < domainQuestions.length}
                      style={{ padding: '14px 36px', borderRadius: 14, fontSize: 15 }}
                    >
                      {submittingAssessment ? 'Calculating Knowledge Baseline...' : 'Submit Diagnostic Assessment & Calculate Baseline'}
                    </SBtn>
                    {Object.keys(domainAnswers).length < domainQuestions.length && (
                      <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 8 }}>
                        Please answer all {domainQuestions.length} questions to complete baseline evaluation.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
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

      {/* ── EXPLORE ALL CAREERS MODAL ────────────────────────────────────── */}
      {showExploreModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 700, borderRadius: 24, padding: 28, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Explore All College Careers & Pathways
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  Search or select any career pathway from our comprehensive catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExploreModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr', gap: 12, paddingRight: 6 }}>
              {COLLEGE_CAREER_CATALOG.map(career => {
                const isPrimary = profile.targetCareer === career.title
                const isSelected = profile.careerInterests.includes(career.title)

                return (
                  <div key={career.id} style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{career.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{career.category} • {career.description}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            targetCareer: career.title,
                            careerInterests: Array.from(new Set([...prev.careerInterests, career.title]))
                          }))
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                          background: isPrimary ? '#047857' : '#0284c7', color: '#fff', border: 'none'
                        }}
                      >
                        {isPrimary ? '✓ Primary Target' : 'Select Target'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
