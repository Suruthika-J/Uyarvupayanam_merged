import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import graduateService from '../../../services/graduateService'
import { getDynamicStage2Options } from '../../data/graduateSkillsCatalog'
import {
  MAJOR_FIELDS,
  getDegreesForField,
  getDomainsForDegree,
  getSpecializationsForDomain
} from '../../data/academicHierarchyCatalog'
import { SBtn, SCard, SInput, SSelect, SAlert, SLoader } from '../../components/ui'
import {
  FiBriefcase, FiArrowRight, FiArrowLeft, FiCheckCircle, FiUser, FiAward,
  FiBookOpen, FiZap, FiTarget, FiCompass, FiCheck, FiStar, FiClock, FiLayers,
  FiSearch, FiPlus
} from 'react-icons/fi'

const EMPLOYMENT_STATUSES = [
  'Fresher / Not currently working',
  'Actively searching for first job',
  'Currently employed (Seeking better role / career switch)',
  'Completing an Internship',
  'Preparing for competitive exams full-time',
  'Planning higher studies',
  'Career break / Transition period',
  'Other'
]

const CAREER_DIRECTIONS = [
  { id: 'Get a Job', label: 'Get a Job (Corporate / Industry)', desc: 'Enter private or public sector employment directly.' },
  { id: 'Competitive Exams', label: 'Competitive & Government Exams', desc: 'Prepare for GATE, UPSC, SSC, Banking, or State PSC.' },
  { id: 'Higher Studies in India', label: 'Higher Studies in India', desc: 'Pursue M.Tech, MBA, or specialized master degree.' },
  { id: 'Study Abroad', label: 'Study Abroad (MS / MBA)', desc: 'Explore international postgraduate programs (USA, Europe, etc.).' },
  { id: 'Upskilling & Certifications', label: 'Industry Upskilling & Portfolio', desc: 'Build job-ready projects and master industry tools.' },
  { id: 'Entrepreneurship', label: 'Start a Business / Freelancing', desc: 'Launch a venture or work as independent specialist.' },
  { id: 'Not Sure Yet', label: 'Not Sure Yet (Help Me Discover)', desc: 'Receive tailored career match analysis based on your background.' }
]

const EXAM_OPTIONS = [
  { name: 'GATE (Engineering & Tech)', cat: 'Engineering' },
  { name: 'CAT / XAT / CMAT (Management/MBA)', cat: 'Management' },
  { name: 'UPSC Civil Services (IAS / IPS)', cat: 'Government' },
  { name: 'SSC CGL / JE (Central Services)', cat: 'Government' },
  { name: 'IBPS / SBI PO & Clerk (Banking)', cat: 'Banking' },
  { name: 'GRE & IELTS / TOEFL (Abroad Studies)', cat: 'Study Abroad' },
  { name: 'TNPSC / State PSC Exams', cat: 'State Govt' }
]

const HIGHER_DEGREE_OPTIONS = [
  'M.Tech / M.E', 'MBA / PGDM', 'MS Abroad', 'Ph.D. / Research Doctorate',
  'Specialized PG Diploma', 'Not currently interested'
]

export default function GraduateOnboardingPage() {
  const { student, updateStudent } = useStudentAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [completedSummary, setCompletedSummary] = useState(null)

  // Stage 2 Local Search & Custom Input States
  const [skillSearch, setSkillSearch] = useState('')
  const [customSkillText, setCustomSkillText] = useState('')
  const [customToolText, setCustomToolText] = useState('')
  const [customInterestText, setCustomInterestText] = useState('')

  // 6-Stage Form Data
  const [form, setForm] = useState({
    // Stage 1 - Cascading Academic Fields
    field: 'Engineering & Technology',
    degree: 'B.E. / B.Tech (Bachelor of Engineering/Technology)',
    customDegree: '',
    domain: 'Computer Science & Engineering',
    customDomain: '',
    specialization: 'Artificial Intelligence & Machine Learning',
    customSpecialization: '',

    college: '',
    graduationYear: '2025',
    cgpa: '8.0',
    hasBacklogs: false,
    employmentStatus: EMPLOYMENT_STATUSES[0],

    // Stage 2
    technicalSkills: [
      { name: 'Python', proficiency: 'Intermediate' },
      { name: 'SQL', proficiency: 'Beginner' }
    ],
    softSkills: ['Problem Solving', 'Teamwork', 'Communication'],
    tools: ['Git / GitHub', 'Microsoft Excel'],
    interests: ['Software Development', 'Data Analysis & AI'],

    // Stage 3
    primaryCareerDirection: 'Get a Job',
    preferredWorkType: 'Technical',
    preferredEnvironment: 'Hybrid (Office + Remote)',
    careerPriority: 'Growth & Skill Development',

    // Stage 4
    examInterest: 'No',
    selectedExams: [],

    // Stage 5
    higherStudyInterest: 'No',
    preferredHigherDegrees: [],

    // Stage 6
    lookingForOpportunity: 'Full-time job',
    preferredRoles: ['Software Engineer', 'Data Analyst'],
    preferredLocations: ['Chennai', 'Bengaluru', 'Coimbatore'],
    remotePreference: 'Flexible',
    expectedSalary: '4-8 LPA'
  })

  // Load existing profile if available
  useEffect(() => {
    const initProfile = async () => {
      try {
        const res = await graduateService.getProfile()
        if (res.success && res.profile) {
          const p = res.profile
          setForm(prev => ({
            ...prev,
            field: p.field || prev.field,
            degree: p.degree || prev.degree,
            domain: p.domain || prev.domain,
            specialization: p.specialization || prev.specialization,
            college: p.college || prev.college,
            graduationYear: p.graduationYear || prev.graduationYear,
            cgpa: p.cgpa || prev.cgpa,
            employmentStatus: p.employmentStatus || prev.employmentStatus,
            technicalSkills: p.technicalSkills?.length ? p.technicalSkills : prev.technicalSkills,
            softSkills: p.softSkills?.length ? p.softSkills : prev.softSkills,
            tools: p.tools?.length ? p.tools : prev.tools,
            interests: p.interests?.length ? p.interests : prev.interests,
            primaryCareerDirection: p.primaryCareerDirection || prev.primaryCareerDirection,
            preferredWorkType: p.preferredWorkType || prev.preferredWorkType,
            preferredEnvironment: p.preferredEnvironment || prev.preferredEnvironment,
            careerPriority: p.careerPriority || prev.careerPriority,
            examInterest: p.examInterest || prev.examInterest,
            selectedExams: p.selectedExams?.length ? p.selectedExams : prev.selectedExams,
            higherStudyInterest: p.higherStudyInterest || prev.higherStudyInterest,
            preferredHigherDegrees: p.preferredHigherDegrees?.length ? p.preferredHigherDegrees : prev.preferredHigherDegrees,
            lookingForOpportunity: p.lookingForOpportunity || prev.lookingForOpportunity,
            preferredRoles: p.preferredRoles?.length ? p.preferredRoles : prev.preferredRoles,
            preferredLocations: p.preferredLocations?.length ? p.preferredLocations : prev.preferredLocations,
            expectedSalary: p.expectedSalary || prev.expectedSalary
          }))
          if (p.currentStep && p.currentStep > 1) {
            setStep(Math.min(6, p.currentStep))
          }
        }
      } catch (err) {
        console.warn('Using default graduate onboarding state')
      } finally {
        setLoading(false)
      }
    }
    initProfile()
  }, [])

  // ── Stage 1 Cascading Handlers & Options ────────────────────────────────────
  const availableDegrees = useMemo(() => {
    return getDegreesForField(form.field)
  }, [form.field])

  const availableDomains = useMemo(() => {
    return getDomainsForDegree(form.field, form.degree)
  }, [form.field, form.degree])

  const availableSpecializations = useMemo(() => {
    return getSpecializationsForDomain(form.domain)
  }, [form.domain])

  const handleFieldChange = (newField) => {
    setForm(prev => ({
      ...prev,
      field: newField,
      degree: '',
      customDegree: '',
      domain: '',
      customDomain: '',
      specialization: '',
      customSpecialization: ''
    }))
  }

  const handleDegreeChange = (newDegree) => {
    setForm(prev => ({
      ...prev,
      degree: newDegree,
      customDegree: newDegree === 'Other' ? prev.customDegree : '',
      domain: '',
      customDomain: '',
      specialization: '',
      customSpecialization: ''
    }))
  }

  const handleDomainChange = (newDomain) => {
    setForm(prev => ({
      ...prev,
      domain: newDomain,
      customDomain: newDomain === 'Other' ? prev.customDomain : '',
      specialization: '',
      customSpecialization: ''
    }))
  }

  const handleSpecializationChange = (newSpec) => {
    setForm(prev => ({
      ...prev,
      specialization: newSpec,
      customSpecialization: newSpec === 'Other' ? prev.customSpecialization : ''
    }))
  }

  // ── Dynamic Stage 2 Options Computation ─────────────────────────────────────
  const dynamicStage2Options = useMemo(() => {
    const effectiveDegree = form.degree === 'Other' ? form.customDegree : form.degree
    const effectiveDomain = form.domain === 'Other' ? form.customDomain : form.domain
    const effectiveSpecialization = form.specialization === 'Other' ? form.customSpecialization : form.specialization

    return getDynamicStage2Options({
      field: form.field,
      degree: effectiveDegree,
      domain: effectiveDomain,
      specialization: effectiveSpecialization,
      employmentStatus: form.employmentStatus
    })
  }, [form.field, form.degree, form.customDegree, form.domain, form.customDomain, form.specialization, form.customSpecialization, form.employmentStatus])

  const filteredTechSkills = useMemo(() => {
    const search = skillSearch.toLowerCase().trim()
    if (!search) return dynamicStage2Options.technicalSkills
    return dynamicStage2Options.technicalSkills.filter(sk => sk.toLowerCase().includes(search))
  }, [dynamicStage2Options.technicalSkills, skillSearch])

  // Custom Skill/Tool/Interest Handlers
  const handleAddCustomTechSkill = () => {
    const trimmed = customSkillText.trim()
    if (!trimmed) return
    if (!form.technicalSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setForm(prev => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, { name: trimmed, proficiency: 'Intermediate' }]
      }))
    }
    setCustomSkillText('')
  }

  const handleAddCustomTool = () => {
    const trimmed = customToolText.trim()
    if (!trimmed) return
    if (!form.tools.includes(trimmed)) {
      setForm(prev => ({ ...prev, tools: [...prev.tools, trimmed] }))
    }
    setCustomToolText('')
  }

  const handleAddCustomInterest = () => {
    const trimmed = customInterestText.trim()
    if (!trimmed) return
    if (!form.interests.includes(trimmed)) {
      setForm(prev => ({ ...prev, interests: [...prev.interests, trimmed] }))
    }
    setCustomInterestText('')
  }

  // Technical skill selection & proficiency rating
  const toggleTechSkill = (skillName) => {
    setForm(prev => {
      const exists = prev.technicalSkills.find(s => s.name === skillName)
      if (exists) {
        return { ...prev, technicalSkills: prev.technicalSkills.filter(s => s.name !== skillName) }
      } else {
        return { ...prev, technicalSkills: [...prev.technicalSkills, { name: skillName, proficiency: 'Intermediate' }] }
      }
    })
  }

  const setTechProficiency = (skillName, prof) => {
    setForm(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.map(s => s.name === skillName ? { ...s, proficiency: prof } : s)
    }))
  }

  // Array toggles for strings
  const toggleArrayItem = (key, item) => {
    setForm(prev => {
      const arr = prev[key] || []
      const next = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
      return { ...prev, [key]: next }
    })
  }

  const saveCurrentStep = async () => {
    try {
      await graduateService.saveStep({ ...form, currentStep: step })
    } catch (err) {
      console.warn('Save step background error')
    }
  }

  const handleNext = async () => {
    setError('')
    
    // Stage 1 Validation
    if (step === 1) {
      const missing = []
      if (!form.field) missing.push('Major Academic Field')
      if (!form.degree) missing.push('Degree Qualification')
      else if (form.degree === 'Other' && !form.customDegree.trim()) missing.push('Custom Degree Specification')

      if (!form.domain) missing.push('Domain / Branch')
      else if (form.domain === 'Other' && !form.customDomain.trim()) missing.push('Custom Domain Specification')

      if (form.specialization === 'Other' && !form.customSpecialization.trim()) missing.push('Custom Specialization Specification')

      if (!form.college || !form.college.trim()) missing.push('College / Institution Name')
      if (!form.graduationYear) missing.push('Year of Graduation')
      if (!form.employmentStatus) missing.push('Current Employment Status')

      if (missing.length > 0) {
        setError(`Please fill in all required fields: ${missing.join(', ')}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Stage 2 Validation
    if (step === 2) {
      const missing = []
      if (!form.technicalSkills || form.technicalSkills.length === 0) missing.push('Technical Competencies')
      if (!form.tools || form.tools.length === 0) missing.push('Tools & Platforms')
      if (!form.interests || form.interests.length === 0) missing.push('Core Professional Interests')

      if (missing.length > 0) {
        setError(`Please complete Stage 2 selections: ${missing.join(', ')}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Stage 3 Validation
    if (step === 3) {
      const missing = []
      if (!form.primaryCareerDirection) missing.push('Primary Career Direction')
      if (!form.preferredWorkType) missing.push('Preferred Work Type')
      if (!form.preferredEnvironment) missing.push('Preferred Work Environment')
      if (!form.careerPriority) missing.push('Key Career Priority')

      if (missing.length > 0) {
        setError(`Please select your career direction choices: ${missing.join(', ')}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Stage 4 Validation
    if (step === 4) {
      if (!form.examInterest) {
        setError('Please select whether you are interested in competitive exams.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (form.examInterest !== 'No' && (!form.selectedExams || form.selectedExams.length === 0)) {
        setError('Please select at least one exam of interest, or select "Not interested".')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Stage 5 Validation
    if (step === 5) {
      if (!form.higherStudyInterest) {
        setError('Please select whether you are interested in postgraduate degrees.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (form.higherStudyInterest !== 'No' && (!form.preferredHigherDegrees || form.preferredHigherDegrees.length === 0)) {
        setError('Please select at least one preferred degree option, or select "No".')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    await saveCurrentStep()
    if (step < 6) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    setError('')
    if (step > 1) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFinalSubmit = async () => {
    setError('')
    if (step === 6) {
      const missing = []
      if (!form.lookingForOpportunity) missing.push('Looking for Opportunity')
      if (form.lookingForOpportunity !== 'Not currently looking') {
        if (!form.preferredRoles || form.preferredRoles.length === 0) missing.push('Target Job Roles')
        if (!form.preferredLocations || form.preferredLocations.length === 0) missing.push('Preferred Work Locations')
      }
      if (missing.length > 0) {
        setError(`Please complete Stage 6 placement preferences: ${missing.join(', ')}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await graduateService.completeOnboarding(form)
      if (res.success) {
        updateStudent({ onboardingCompleted: true, userType: 'graduate' })
        setCompletedSummary(res.summary || {
          degree: `${form.degree} in ${form.domain}`,
          careerDirection: form.primaryCareerDirection,
          readinessScore: 65,
          topCareer: 'Industry Specialist'
        })
      }
    } catch (err) {
      setError('Failed to finalize onboarding. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <SLoader label="Loading Graduate Onboarding Portal..." />
      </div>
    )
  }

  // Final Summary Screen
  if (completedSummary) {
    return (
      <div className="student-root" style={{ minHeight: '100vh', background: '#f8fafc', padding: '60px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SCard style={{ borderRadius: 24, padding: '40px 36px', border: '2px solid #2563eb', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#dbeafe', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FiCheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>
              Your Graduate Journey Is Ready!
            </h2>
            <p style={{ color: 'var(--s-text3)', fontSize: 15, maxWidth: 540, margin: '0 auto 30px' }}>
              We have customized your career transition roadmap, skill gaps, competitive exam tracking, and placement checklist.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left', marginBottom: 36 }}>
              <div style={{ background: '#f1f5f9', padding: 18, borderRadius: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Completed Education</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{completedSummary.degree}</div>
              </div>
              <div style={{ background: '#f1f5f9', padding: 18, borderRadius: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Career Direction</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{completedSummary.careerDirection}</div>
              </div>
              <div style={{ background: '#f1f5f9', padding: 18, borderRadius: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Career Readiness Score</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', marginTop: 4 }}>{completedSummary.readinessScore}%</div>
              </div>
            </div>

            <SBtn variant="primary" onClick={() => navigate('/graduate/dashboard')} style={{ padding: '14px 42px', borderRadius: 14, fontSize: 16 }}>
              Enter My Graduate Dashboard <FiArrowRight style={{ marginLeft: 8 }} />
            </SBtn>
          </SCard>
        </div>
      </div>
    )
  }

  const progressPercent = Math.round((step / 6) * 100)

  return (
    <div className="student-root" style={{ minHeight: '100vh', background: 'var(--s-bg)', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dbeafe', color: '#1e40af', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', marginBottom: 12 }}>
            <FiBriefcase size={14} /> GRADUATE CAREER TRANSITION PORTAL
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: 900, color: 'var(--s-text)', margin: '4px 0 8px' }}>
            Plan Your Next Strategic Move
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', maxWidth: 620, margin: '0 auto' }}>
            Personalized guidance for career jobs, competitive exams (GATE, CAT, UPSC), higher studies, and upskilling.
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 24px', marginBottom: 24, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, fontWeight: 800 }}>
            <span style={{ color: '#2563eb' }}>STAGE {step} OF 6</span>
            <span style={{ color: 'var(--s-text3)' }}>{progressPercent}% Completed</span>
          </div>
          <div style={{ height: 8, width: '100%', background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: '#2563eb', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {error && <SAlert type="error" message={error} onClose={() => setError('')} style={{ marginBottom: 20 }} />}

        <SCard style={{ borderRadius: 24, padding: 36, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow-md)' }}>

          {/* ── STAGE 1: Degree Completed & Education (Cascading Dropdowns) ── */}
          {step === 1 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                Stage 1: Completed Degree & Education
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24 }}>
                Select your academic discipline to enable tailored degree and domain choices.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                
                {/* 1. Major Academic Field */}
                <SSelect
                  label="Major Academic Field *"
                  value={form.field}
                  onChange={e => handleFieldChange(e.target.value)}
                >
                  <option value="" disabled>Select your academic field</option>
                  {MAJOR_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </SSelect>

                {/* 2. Degree Qualification (Dependent on Field) */}
                <div>
                  <SSelect
                    label="Degree Qualification *"
                    value={form.degree}
                    onChange={e => handleDegreeChange(e.target.value)}
                    disabled={!form.field}
                  >
                    <option value="" disabled>
                      {form.field ? 'Select degree qualification' : 'Select Major Field first'}
                    </option>
                    {availableDegrees.map(d => <option key={d} value={d}>{d}</option>)}
                  </SSelect>
                  {form.degree === 'Other' && (
                    <SInput
                      label="Specify Custom Degree *"
                      placeholder="e.g. B.Tech Cyber Systems"
                      value={form.customDegree}
                      onChange={e => setForm({ ...form, customDegree: e.target.value })}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>

                {/* 3. Domain / Branch (Dependent on Field + Degree) */}
                <div>
                  <SSelect
                    label="Domain / Branch *"
                    value={form.domain}
                    onChange={e => handleDomainChange(e.target.value)}
                    disabled={!form.degree}
                  >
                    <option value="" disabled>
                      {form.degree ? 'Select domain / branch' : 'Select Degree first'}
                    </option>
                    {availableDomains.map(dm => <option key={dm} value={dm}>{dm}</option>)}
                  </SSelect>
                  {form.domain === 'Other' && (
                    <SInput
                      label="Specify Custom Domain / Branch *"
                      placeholder="e.g. Robotics & Industrial Automation"
                      value={form.customDomain}
                      onChange={e => setForm({ ...form, customDomain: e.target.value })}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>

                {/* 4. Specialization / Elective (Dependent on Domain) */}
                <div>
                  <SSelect
                    label="Specialization / Elective (Optional)"
                    value={form.specialization}
                    onChange={e => handleSpecializationChange(e.target.value)}
                    disabled={!form.domain}
                  >
                    <option value="" disabled>
                      {form.domain ? 'Select specialization' : 'Select Domain first'}
                    </option>
                    {availableSpecializations.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </SSelect>
                  {form.specialization === 'Other' && (
                    <SInput
                      label="Specify Custom Specialization"
                      placeholder="e.g. Quantum Computing"
                      value={form.customSpecialization}
                      onChange={e => setForm({ ...form, customSpecialization: e.target.value })}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>

                {/* 5. College / Institution Name */}
                <SInput
                  label="College / Institution Name *"
                  placeholder="e.g. PSG Tech, Anna University, Loyola College"
                  value={form.college}
                  onChange={e => setForm({ ...form, college: e.target.value })}
                  required
                />

                {/* 6. Graduation Year */}
                <SSelect label="Year of Graduation *" value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: e.target.value })}>
                  <option value="2026">2026 (Upcoming Graduate)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="Earlier than 2023">Earlier than 2023</option>
                </SSelect>

                {/* 7. CGPA */}
                <SInput
                  label="Final CGPA / Percentage"
                  placeholder="e.g. 8.2 or 78%"
                  value={form.cgpa}
                  onChange={e => setForm({ ...form, cgpa: e.target.value })}
                />

                {/* 8. Employment Status */}
                <SSelect label="Current Employment Status *" value={form.employmentStatus} onChange={e => setForm({ ...form, employmentStatus: e.target.value })}>
                  {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </SSelect>
              </div>
            </div>
          )}

          {/* ── STAGE 2: Skills & Interests (Dynamic & Personalized) ── */}
          {step === 2 && (
            <div className="s-anim-up">
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: 'var(--s-text)' }}>
                    Stage 2: Skills & Proficiency Self-Assessment
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0 }}>
                    Dynamically recommended based on your Stage 1 profile selections.
                  </p>
                </div>
                <div style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                  Personalized for: {form.field} {form.domain ? `• ${form.domain}` : ''}
                </div>
              </div>

              {/* Technical Skills Section with Search Filter */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <label style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)' }}>
                    Technical Competencies (Click to select & rate)
                  </label>

                  {/* Search Filter Box */}
                  <div style={{ position: 'relative', width: 240 }}>
                    <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '6px 12px 6px 32px', borderRadius: 18, border: '1px solid var(--s-border)',
                        fontSize: 12, outline: 'none', background: '#fff'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {filteredTechSkills.map(sk => {
                    const isSelected = form.technicalSkills.some(s => s.name === sk)
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleTechSkill(sk)}
                        style={{
                          padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                          border: isSelected ? '2px solid #2563eb' : '1px solid var(--s-border)',
                          background: isSelected ? '#2563eb' : '#fff',
                          color: isSelected ? '#fff' : 'var(--s-text2)', fontWeight: 700, fontSize: 13,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {sk}
                      </button>
                    )
                  })}
                </div>

                {/* Custom "Other" Technical Skill Input */}
                <div style={{ display: 'flex', gap: 10, maxWidth: 420, marginBottom: 16 }}>
                  <SInput
                    placeholder="Enter other custom technical skill..."
                    value={customSkillText}
                    onChange={e => setCustomSkillText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTechSkill())}
                    style={{ flex: 1 }}
                  />
                  <SBtn type="button" variant="outline" onClick={handleAddCustomTechSkill} style={{ height: 42 }}>
                    <FiPlus /> Add
                  </SBtn>
                </div>

                {/* Proficiency Rating Chips for Selected Skills */}
                {form.technicalSkills.length > 0 && (
                  <div style={{ background: '#f8fafc', padding: 20, borderRadius: 18, border: '1px solid var(--s-border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 14 }}>
                      Rate Your Level for Selected Skills:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                      {form.technicalSkills.map(sk => (
                        <div key={sk.name} style={{ background: '#fff', padding: '12px 16px', borderRadius: 14, border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--s-text)' }}>{sk.name}</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {[
                              { label: 'Beginner', code: 'B' },
                              { label: 'Intermediate', code: 'I' },
                              { label: 'Advanced', code: 'A' }
                            ].map(lvl => (
                              <button
                                key={lvl.label}
                                type="button"
                                onClick={() => setTechProficiency(sk.name, lvl.label)}
                                title={lvl.label}
                                style={{
                                  padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                                  border: sk.proficiency === lvl.label ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                  background: sk.proficiency === lvl.label ? '#dbeafe' : '#f8fafc',
                                  color: sk.proficiency === lvl.label ? '#1d4ed8' : '#64748b'
                                }}
                              >
                                {lvl.code}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tools & Platforms Section */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontWeight: 800, fontSize: 14, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                  Tools & Platforms (Dynamically Recommended)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {dynamicStage2Options.tools.map(tool => {
                    const isSelected = form.tools.includes(tool)
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleArrayItem('tools', tool)}
                        style={{
                          padding: '8px 16px', borderRadius: 18, cursor: 'pointer',
                          border: isSelected ? '2px solid #047857' : '1px solid var(--s-border)',
                          background: isSelected ? '#d1fae5' : '#fff',
                          color: isSelected ? '#047857' : 'var(--s-text2)', fontWeight: 700, fontSize: 12
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {tool}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Tool Input */}
                <div style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
                  <SInput
                    placeholder="Enter other custom tool..."
                    value={customToolText}
                    onChange={e => setCustomToolText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTool())}
                    style={{ flex: 1 }}
                  />
                  <SBtn type="button" variant="outline" onClick={handleAddCustomTool} style={{ height: 42 }}>
                    <FiPlus /> Add
                  </SBtn>
                </div>
              </div>

              {/* Core Professional Interests Section */}
              <div>
                <label style={{ fontWeight: 800, fontSize: 14, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                  Core Professional Interests (Dynamically Recommended)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {dynamicStage2Options.interests.map(int => {
                    const isSelected = form.interests.includes(int)
                    return (
                      <button
                        key={int}
                        type="button"
                        onClick={() => toggleArrayItem('interests', int)}
                        style={{
                          padding: '8px 16px', borderRadius: 18, cursor: 'pointer',
                          border: isSelected ? '2px solid #6d28d9' : '1px solid var(--s-border)',
                          background: isSelected ? '#ede9fe' : '#fff',
                          color: isSelected ? '#6d28d9' : 'var(--s-text2)', fontWeight: 700, fontSize: 12
                        }}
                      >
                        {isSelected ? '★ ' : '+ '} {int}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Interest Input */}
                <div style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
                  <SInput
                    placeholder="Enter other custom interest..."
                    value={customInterestText}
                    onChange={e => setCustomInterestText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomInterest())}
                    style={{ flex: 1 }}
                  />
                  <SBtn type="button" variant="outline" onClick={handleAddCustomInterest} style={{ height: 42 }}>
                    <FiPlus /> Add
                  </SBtn>
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE 3: Career Direction ── */}
          {step === 3 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                Stage 3: Primary Career Direction
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24 }}>
                What is your main priority following graduation?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 28 }}>
                {CAREER_DIRECTIONS.map(cd => {
                  const isChosen = form.primaryCareerDirection === cd.id
                  return (
                    <div
                      key={cd.id}
                      onClick={() => setForm({ ...form, primaryCareerDirection: cd.id })}
                      style={{
                        padding: 18, borderRadius: 16, cursor: 'pointer',
                        border: isChosen ? '2px solid #2563eb' : '1px solid var(--s-border)',
                        background: isChosen ? '#eff6ff' : '#fff',
                        boxShadow: isChosen ? '0 4px 14px rgba(37,99,235,0.1)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 15, color: isChosen ? '#1d4ed8' : 'var(--s-text)', marginBottom: 4 }}>
                        {cd.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s-text3)', lineHeight: 1.4 }}>
                        {cd.desc}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <SSelect label="Preferred Work Type" value={form.preferredWorkType} onChange={e => setForm({ ...form, preferredWorkType: e.target.value })}>
                  <option value="Technical">Technical / Engineering</option>
                  <option value="Management">Management & Leadership</option>
                  <option value="Research">Research & Scientific</option>
                  <option value="Design">Design & Creative</option>
                  <option value="Government">Government & Civil Services</option>
                  <option value="Entrepreneurship">Entrepreneurship & Startups</option>
                </SSelect>

                <SSelect label="Preferred Work Environment" value={form.preferredEnvironment} onChange={e => setForm({ ...form, preferredEnvironment: e.target.value })}>
                  <option value="Hybrid (Office + Remote)">Hybrid (Office + Remote)</option>
                  <option value="Office / On-site">Office / On-site</option>
                  <option value="100% Remote">100% Remote</option>
                  <option value="Laboratory / R&D Facility">Laboratory / R&D Facility</option>
                  <option value="Field Work & Manufacturing">Field Work & Manufacturing</option>
                </SSelect>

                <SSelect label="Key Career Priority" value={form.careerPriority} onChange={e => setForm({ ...form, careerPriority: e.target.value })}>
                  <option value="Growth & Skill Development">Growth & Skill Development</option>
                  <option value="High Salary & Compensation">High Salary & Compensation</option>
                  <option value="Job Stability & Security">Job Stability & Security</option>
                  <option value="Work-Life Balance">Work-Life Balance</option>
                  <option value="International Mobility">International Mobility</option>
                </SSelect>
              </div>
            </div>
          )}

          {/* ── STAGE 4: Competitive Exams ── */}
          {step === 4 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                Stage 4: Competitive Examinations
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24 }}>
                Are you interested in preparing for competitive exams (GATE, CAT, UPSC, SSC, Banking)?
              </p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {['Yes', 'Maybe', 'No'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, examInterest: opt })}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 14, cursor: 'pointer',
                      border: form.examInterest === opt ? '2px solid #2563eb' : '1px solid var(--s-border)',
                      background: form.examInterest === opt ? '#eff6ff' : '#fff',
                      color: form.examInterest === opt ? '#1d4ed8' : 'var(--s-text)',
                      fontWeight: 800, fontSize: 15
                    }}
                  >
                    {opt === 'Yes' ? '🎯 Yes, I am preparing' : opt === 'Maybe' ? '🤔 Maybe later' : '❌ Not interested'}
                  </button>
                ))}
              </div>

              {form.examInterest !== 'No' ? (
                <div>
                  <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 12, color: 'var(--s-text)' }}>
                    Select Relevant Exams of Interest:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                    {EXAM_OPTIONS.map(ex => {
                      const isChosen = form.selectedExams.some(e => e.examName === ex.name)
                      return (
                        <div
                          key={ex.name}
                          onClick={() => {
                            if (isChosen) {
                              setForm({ ...form, selectedExams: form.selectedExams.filter(e => e.examName !== ex.name) })
                            } else {
                              setForm({ ...form, selectedExams: [...form.selectedExams, { examName: ex.name, category: ex.cat, targetYear: '2026' }] })
                            }
                          }}
                          style={{
                            padding: 14, borderRadius: 14, cursor: 'pointer',
                            border: isChosen ? '2px solid #2563eb' : '1px solid var(--s-border)',
                            background: isChosen ? '#eff6ff' : '#fff',
                            display: 'flex', alignItems: 'center', gap: 10
                          }}
                        >
                          <FiCheck size={16} style={{ color: isChosen ? '#2563eb' : '#cbd5e1' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--s-text)' }}>{ex.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--s-text3)' }}>{ex.cat}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, background: '#f8fafc', borderRadius: 14, textAlign: 'center', color: 'var(--s-text3)', fontSize: 14 }}>
                  No competitive exam tracking needed. We will focus primarily on immediate industry roles and upskilling.
                </div>
              )}
            </div>
          )}

          {/* ── STAGE 5: Higher Studies / Upskilling ── */}
          {step === 5 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                Stage 5: Higher Studies & Upskilling Pathways
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24 }}>
                Explore postgraduate degrees or structured industry upskilling modules.
              </p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 800, fontSize: 13, display: 'block', marginBottom: 10, color: 'var(--s-text)' }}>
                  Interested in Postgraduate Degree (M.Tech, MBA, MS Abroad)?
                </label>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  {['Yes', 'Maybe', 'No'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, higherStudyInterest: opt })}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                        border: form.higherStudyInterest === opt ? '2px solid #047857' : '1px solid var(--s-border)',
                        background: form.higherStudyInterest === opt ? '#d1fae5' : '#fff',
                        color: form.higherStudyInterest === opt ? '#047857' : 'var(--s-text)',
                        fontWeight: 800, fontSize: 14
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {form.higherStudyInterest !== 'No' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {HIGHER_DEGREE_OPTIONS.map(deg => {
                      const isSelected = form.preferredHigherDegrees.includes(deg)
                      return (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => toggleArrayItem('preferredHigherDegrees', deg)}
                          style={{
                            padding: '8px 16px', borderRadius: 16, cursor: 'pointer',
                            border: isSelected ? '2px solid #047857' : '1px solid var(--s-border)',
                            background: isSelected ? '#d1fae5' : '#fff',
                            color: isSelected ? '#047857' : 'var(--s-text2)', fontWeight: 700, fontSize: 13
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '} {deg}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STAGE 6: Professional Placement ── */}
          {step === 6 && (
            <div className="s-anim-up">
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                Stage 6: Professional Placement Readiness
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', marginBottom: 24 }}>
                Configure job search parameters and employability preferences.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
                <SSelect label="Looking for Opportunity *" value={form.lookingForOpportunity} onChange={e => setForm({ ...form, lookingForOpportunity: e.target.value })}>
                  <option value="Full-time job">Full-time job</option>
                  <option value="Internship / Graduate Trainee">Internship / Graduate Trainee</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                  <option value="Freelance opportunities">Freelance opportunities</option>
                  <option value="Not currently looking">Not currently looking</option>
                </SSelect>

                <SInput
                  label="Target Job Roles (Comma separated)"
                  placeholder="e.g. Software Engineer, Data Analyst, Design Engineer"
                  value={form.preferredRoles.join(', ')}
                  onChange={e => setForm({ ...form, preferredRoles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />

                <SInput
                  label="Preferred Work Locations"
                  placeholder="e.g. Chennai, Bengaluru, Coimbatore, Remote"
                  value={form.preferredLocations.join(', ')}
                  onChange={e => setForm({ ...form, preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />

                <SSelect label="Remote Work Flexibility" value={form.remotePreference} onChange={e => setForm({ ...form, remotePreference: e.target.value })}>
                  <option value="Flexible">Flexible (Open to all)</option>
                  <option value="Hybrid">Hybrid preferred</option>
                  <option value="On-site only">On-site only</option>
                  <option value="Remote only">Remote only</option>
                </SSelect>

                <SInput
                  label="Expected Starting Salary Range (Optional)"
                  placeholder="e.g. 4-7 LPA"
                  value={form.expectedSalary}
                  onChange={e => setForm({ ...form, expectedSalary: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ── ACTION NAVIGATION BAR ── */}
          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              style={{
                background: 'none', border: '1px solid var(--s-border)',
                borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 700,
                color: step === 1 ? '#cbd5e1' : 'var(--s-text2)', cursor: step === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <FiArrowLeft size={16} /> Previous
            </button>

            {step < 6 ? (
              <SBtn variant="primary" onClick={handleNext} style={{ padding: '12px 30px', borderRadius: 12 }}>
                Next Stage <FiArrowRight style={{ marginLeft: 6 }} />
              </SBtn>
            ) : (
              <SBtn variant="primary" onClick={handleFinalSubmit} style={{ padding: '12px 36px', borderRadius: 12 }} disabled={submitting}>
                {submitting ? 'Finalizing Profile...' : 'Complete Onboarding & Build Roadmap'} <FiArrowRight style={{ marginLeft: 6 }} />
              </SBtn>
            )}
          </div>

        </SCard>
      </div>
    </div>
  )
}
