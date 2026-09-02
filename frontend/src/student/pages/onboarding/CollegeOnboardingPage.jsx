import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SCard, SInput, SSelect, SAlert, SLoader } from '../../components/ui'
import { taxonomyService } from '../../services/taxonomyService'
import { COLLEGE_FIELDS_DATA } from '../../config/collegeFieldsData'
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

  // Grok Assessment State (Step 7)
  const [grokQuestions, setGrokQuestions] = useState([])
  const [grokAnswers, setGrokAnswers] = useState({})
  const [loadingGrok, setLoadingGrok] = useState(false)
  const [grokSource, setGrokSource] = useState('')

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

  // Fetch Grok AI Assessment Questions when Step 7 is reached
  useEffect(() => {
    if (step === 7 && grokQuestions.length === 0) {
      fetchGrokQuestions()
    }
  }, [step])

  const fetchGrokQuestions = async () => {
    setLoadingGrok(true)
    try {
      const res = await axios.post('http://localhost:5000/api/assessment/generate-grok-questions', {
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

          {/* STEP 5: Interests & Goals */}
          {step === 5 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>
                Step 5: Academic Interests & Career Aspirations
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 28 }}>
                Select what drives your academic journey.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                    Academic Focus Options (Select all that apply)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                    {ACADEMIC_INTEREST_OPTIONS.map(opt => {
                      const isSelected = profile.academicInterests.includes(opt)
                      return (
                        <div
                          key={opt}
                          onClick={() => toggleArrayItem('academicInterests', opt)}
                          style={{
                            padding: 14, borderRadius: 12, cursor: 'pointer',
                            border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                            background: isSelected ? 'var(--s-primary-l)' : '#fff',
                            fontSize: 13, fontWeight: 700, color: 'var(--s-text)',
                            display: 'flex', alignItems: 'center', gap: 10
                          }}
                        >
                          <FiCheck size={16} style={{ opacity: isSelected ? 1 : 0.2 }} />
                          <span>{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                    Target Career Pathways
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                    {CAREER_INTEREST_OPTIONS.map(opt => {
                      const isSelected = profile.careerInterests.includes(opt)
                      return (
                        <div
                          key={opt}
                          onClick={() => toggleArrayItem('careerInterests', opt)}
                          style={{
                            padding: 14, borderRadius: 12, cursor: 'pointer',
                            border: isSelected ? '2px solid #b45309' : '1px solid var(--s-border)',
                            background: isSelected ? '#fef3c7' : '#fff',
                            fontSize: 13, fontWeight: 700, color: 'var(--s-text)',
                            display: 'flex', alignItems: 'center', gap: 10
                          }}
                        >
                          <FiStar size={16} style={{ color: isSelected ? '#b45309' : '#cbd5e1' }} />
                          <span>{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* STEP 7: xAI Grok Dynamic Onboarding Assessment Questions */}
          {step === 7 && (
            <div className="s-anim-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#6d28d9', letterSpacing: '0.06em' }}>
                    ⚡ Powered by xAI Grok API
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', color: 'var(--s-text)' }}>
                    Step 7: AI Aptitude & Branch Diagnostic Quiz
                  </h3>
                </div>
                <span style={{ fontSize: 11, background: '#ede9fe', color: '#6d28d9', padding: '6px 12px', borderRadius: 20, fontWeight: 800 }}>
                  {profile.degreeProgramme} • {profile.domain}
                </span>
              </div>

              {loadingGrok ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <SLoader label="Generating dynamic diagnostic questions using xAI Grok API..." />
                </div>
              ) : grokQuestions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, fontSize: 13, color: 'var(--s-text2)' }}>
                    📝 Answer these 5 randomized Easy-to-Medium diagnostic questions generated specifically for your selected degree (<strong>{profile.degreeProgramme}</strong>) and domain branch (<strong>{profile.domain}</strong>).
                  </div>

                  {grokQuestions.map((q, qIdx) => {
                    const selectedOpt = grokAnswers[q.id]
                    return (
                      <div key={q.id || qIdx} style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>
                            Question {qIdx + 1} of {grokQuestions.length} • {q.topic || 'Concept Check'}
                          </span>
                          <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                            Easy - Medium
                          </span>
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', marginBottom: 14 }}>
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

                        {selectedOpt !== undefined && q.explanation && (
                          <div style={{ marginTop: 12, padding: 10, background: '#eff6ff', borderRadius: 10, fontSize: 12, color: '#1e40af' }}>
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
    </div>
  )
}
