import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import graduateService from '../../../services/graduateService'
import { SBtn, SCard, SInput, SSelect, SAlert } from '../../components/ui'
import { FiBriefcase, FiArrowRight, FiUser, FiCheckSquare, FiBookOpen, FiGlobe, FiTarget, FiCheck } from 'react-icons/fi'

const DEGREE_OPTIONS = [
  { label: 'B.E.', id: 'be' },
  { label: 'B.Tech', id: 'btech' },
  { label: 'B.Sc', id: 'bsc' },
  { label: 'BCA', id: 'bca' },
  { label: 'B.Com', id: 'bcom' },
  { label: 'BBA', id: 'bba' },
  { label: 'BA', id: 'ba' },
  { label: 'Other', id: 'other' }
]

const SPECIALIZATIONS_MAP = {
  be: [
    { label: 'Computer Science', id: 'cse' },
    { label: 'Information Technology', id: 'it' },
    { label: 'Electronics & Communication', id: 'ece' },
    { label: 'Electrical & Electronics', id: 'eee' },
    { label: 'Electrical Engineering', id: 'ee' },
    { label: 'Mechanical Engineering', id: 'mech' },
    { label: 'Civil Engineering', id: 'civil' },
    { label: 'Artificial Intelligence', id: 'ai' },
    { label: 'Data Science', id: 'ds' },
    { label: 'Cyber Security', id: 'cyber' },
    { label: 'Other', id: 'other' }
  ],
  btech: [
    { label: 'Computer Science', id: 'cse' },
    { label: 'Information Technology', id: 'it' },
    { label: 'Electronics & Communication', id: 'ece' },
    { label: 'Electrical & Electronics', id: 'eee' },
    { label: 'Electrical Engineering', id: 'ee' },
    { label: 'Mechanical Engineering', id: 'mech' },
    { label: 'Civil Engineering', id: 'civil' },
    { label: 'Artificial Intelligence', id: 'ai' },
    { label: 'Data Science', id: 'ds' },
    { label: 'Cyber Security', id: 'cyber' },
    { label: 'Other', id: 'other' }
  ],
  bsc: [
    { label: 'Computer Science', id: 'cs' },
    { label: 'Information Technology', id: 'it' },
    { label: 'Physics', id: 'physics' },
    { label: 'Chemistry', id: 'chemistry' },
    { label: 'Mathematics', id: 'maths' },
    { label: 'Biotechnology', id: 'biotech' },
    { label: 'Microbiology', id: 'micro' },
    { label: 'Other', id: 'other' }
  ],
  bca: [
    { label: 'Computer Applications', id: 'ca' },
    { label: 'Software Development', id: 'software' },
    { label: 'Web Technologies', id: 'web' },
    { label: 'Data Analytics', id: 'analytics' },
    { label: 'Other', id: 'other' }
  ],
  bcom: [
    { label: 'General', id: 'general' },
    { label: 'Accounting & Finance', id: 'af' },
    { label: 'Banking & Insurance', id: 'bi' },
    { label: 'Computer Applications', id: 'bcom_ca' },
    { label: 'Other', id: 'other' }
  ],
  bba: [
    { label: 'General Management', id: 'gen' },
    { label: 'Marketing', id: 'mkt' },
    { label: 'Human Resources', id: 'hr' },
    { label: 'Finance', id: 'fin' },
    { label: 'International Business', id: 'ib' },
    { label: 'Other', id: 'other' }
  ],
  ba: [
    { label: 'English Literature', id: 'eng' },
    { label: 'Economics', id: 'eco' },
    { label: 'Tamil', id: 'tamil' },
    { label: 'History', id: 'hist' },
    { label: 'Political Science', id: 'pol' },
    { label: 'Psychology', id: 'psych' },
    { label: 'Other', id: 'other' }
  ],
  other: [
    { label: 'General / Multi-disciplinary', id: 'gen' },
    { label: 'Other', id: 'other' }
  ]
}

const CAREER_INTEREST_OPTIONS = [
  'Higher Studies',
  'Government Exams',
  'PSU / Government Jobs',
  'Private Jobs',
  'Research',
  'Entrepreneurship',
  'Teaching / Academia',
  'International Studies',
  'Other'
]

const DOMAIN_OPTIONS = [
  'Software Engineering',
  'AI / ML',
  'Data Science',
  'Cyber Security',
  'Cloud / DevOps',
  'Core Engineering',
  'Electronics',
  'Management',
  'Research',
  'Finance',
  'Government Administration',
  'Other'
]

export default function GraduateOnboardingPage() {
  const { student, updateStudent } = useStudentAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: student?.name || '',
    degree: 'B.E.',
    degreeId: 'be',
    specialization: 'Computer Science',
    specializationId: 'cse',
    collegeName: '',
    universityName: 'Anna University',
    graduationYear: '2026',
    graduationStatus: 'Completed',
    cgpa: '8.3',
    percentage: '83%',
    state: 'Tamil Nadu',
    location: 'Chennai'
  })

  const [selectedInterests, setSelectedInterests] = useState(['Higher Studies', 'Government Exams', 'Private Jobs'])
  const [selectedDomains, setSelectedDomains] = useState(['Software Engineering', 'AI / ML'])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Dynamic specialization list based on degreeId
  const currentSpecializations = SPECIALIZATIONS_MAP[formData.degreeId] || SPECIALIZATIONS_MAP.other

  const handleDegreeChange = (e) => {
    const degLabel = e.target.value
    const found = DEGREE_OPTIONS.find(d => d.label === degLabel) || { label: degLabel, id: 'other' }
    const specs = SPECIALIZATIONS_MAP[found.id] || SPECIALIZATIONS_MAP.other

    setFormData({
      ...formData,
      degree: found.label,
      degreeId: found.id,
      specialization: specs[0]?.label || 'General',
      specializationId: specs[0]?.id || 'gen'
    })
    setError('')
  }

  const handleSpecChange = (e) => {
    const specLabel = e.target.value
    const found = currentSpecializations.find(s => s.label === specLabel) || { label: specLabel, id: 'other' }
    setFormData({
      ...formData,
      specialization: found.label,
      specializationId: found.id
    })
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length === 1) return // keep at least 1
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const toggleDomain = (domain) => {
    if (selectedDomains.includes(domain)) {
      if (selectedDomains.length === 1) return
      setSelectedDomains(selectedDomains.filter(d => d !== domain))
    } else {
      setSelectedDomains([...selectedDomains, domain])
    }
  }

  React.useEffect(() => {
    if (student?.name && (!formData.name || formData.name === '')) {
      setFormData(prev => ({ ...prev, name: student.name }))
    }
  }, [student])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = {
        ...formData,
        name: formData.name || student?.name || 'Graduate Student',
        careerInterests: selectedInterests,
        preferredDomains: selectedDomains
      }

      const res = await graduateService.completeOnboarding(payload)

      if (res?.success) {
        updateStudent({
          userType: 'graduate',
          onboardingCompleted: true,
          graduateDetails: payload
        })
        navigate('/graduate/dashboard')
      } else {
        setError(res?.message || 'Failed to save graduate onboarding profile.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save graduate profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="student-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dbeafe', color: '#1d4ed8', padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 800, marginBottom: 12 }}>
            <FiBriefcase size={16} /> 🎓 GRADUATE CAREER ONBOARDING
          </div>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'var(--s-text)', margin: '0 0 8px' }}>
            Setup Your Post-Graduation Career Ecosystem
          </h1>
          <p style={{ color: 'var(--s-text3)', fontSize: 14.5, maxWidth: 620, margin: '0 auto' }}>
            What can you do after graduation? Build your personalized portal for Higher Studies, Government Exams, PSUs, Private Jobs & Peer Mentorship.
          </p>
        </div>

        <SCard style={{ padding: '36px 32px', borderRadius: 24, boxShadow: '0 12px 36px rgba(0,0,0,0.06)' }} className="s-anim-up">
          {error && <SAlert type="error" style={{ marginBottom: 20 }}>{error}</SAlert>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* SECTION 1: PERSONAL & ACADEMIC INFO */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                <FiUser size={18} color="#2563eb" /> Personal & Academic Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="s-grid-2col">
                <SInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required icon={<FiUser />} />
                
                <SSelect label="Degree Completed / Pursuing" name="degree" value={formData.degree} onChange={handleDegreeChange}>
                  {DEGREE_OPTIONS.map(d => (
                    <option key={d.id} value={d.label}>{d.label}</option>
                  ))}
                </SSelect>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }} className="s-grid-2col">
                <SSelect label="Specialization (Dynamic)" name="specialization" value={formData.specialization} onChange={handleSpecChange}>
                  {currentSpecializations.map(s => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </SSelect>

                <SInput label="College / Institute Name" name="collegeName" value={formData.collegeName} onChange={handleInputChange} placeholder="e.g. PSG Tech / College of Engineering Guindy" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 16 }} className="s-grid-3col">
                <SInput label="University Name" name="universityName" value={formData.universityName} onChange={handleInputChange} placeholder="e.g. Anna University" />
                
                <SSelect label="Graduation Year" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange}>
                  <option value="2027">2027</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="Earlier">Earlier than 2023</option>
                </SSelect>

                <SSelect label="Graduation Status" name="graduationStatus" value={formData.graduationStatus} onChange={handleInputChange}>
                  <option value="Completed">Completed Degree</option>
                  <option value="Final Year">Final Year Student</option>
                  <option value="Pursuing">Pursuing Undergraduate</option>
                </SSelect>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginTop: 16 }} className="s-grid-2col">
                <SInput label="CGPA" name="cgpa" value={formData.cgpa} onChange={handleInputChange} placeholder="8.3" />
                <SInput label="Percentage (%)" name="percentage" value={formData.percentage} onChange={handleInputChange} placeholder="83%" />
                <SInput label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="Tamil Nadu" />
                <SInput label="Current Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Chennai" />
              </div>
            </div>

            {/* SECTION 2: CAREER INTERESTS */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                <FiTarget size={18} color="#2563eb" /> What do you want to pursue after graduation?
              </div>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 12 }}>
                Select all career pathways that interest you (Multiple selection allowed):
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {CAREER_INTEREST_OPTIONS.map(opt => {
                  const isSelected = selectedInterests.includes(opt)
                  return (
                    <div
                      key={opt}
                      onClick={() => toggleInterest(opt)}
                      style={{
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: isSelected ? '#eff6ff' : '#fff',
                        color: isSelected ? '#1e40af' : '#334155',
                        fontSize: 13, fontWeight: isSelected ? 800 : 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{opt}</span>
                      {isSelected && <FiCheck color="#2563eb" size={16} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SECTION 3: PREFERRED CAREER DOMAINS */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                <FiGlobe size={18} color="#2563eb" /> Preferred Career Domains
              </div>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 12 }}>
                Select domain areas you wish to specialize in:
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DOMAIN_OPTIONS.map(dom => {
                  const isSelected = selectedDomains.includes(dom)
                  return (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => toggleDomain(dom)}
                      style={{
                        padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                        border: 'none',
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#fff' : '#475569',
                        fontSize: 12.5, fontWeight: isSelected ? 800 : 600,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{dom}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SUBMIT */}
            <div style={{ marginTop: 16, textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <SBtn type="submit" variant="primary" style={{ padding: '14px 40px', borderRadius: 14, fontSize: 14 }} disabled={submitting}>
                {submitting ? 'Saving Graduate Profile...' : 'Complete Onboarding & Enter Portal'} <FiArrowRight style={{ marginLeft: 8 }} />
              </SBtn>
            </div>

          </form>
        </SCard>
      </div>
    </div>
  )
}
