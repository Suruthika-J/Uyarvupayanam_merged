import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SInput, SSelect, SAlert, SCard, SDivider } from '../../components/ui'
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiCompass, FiBookOpen, FiBriefcase, FiCheckCircle, FiArrowRight, FiArrowLeft
} from 'react-icons/fi'

const CLASS_LEVELS = ['5th','6th','7th','8th','9th','10th','11th','12th']
const TN_DISTRICTS = [
  'Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Erode',
  'Tirunelveli','Vellore','Thanjavur','Dindigul','Kanchipuram','Namakkal',
  'Dharmapuri','Krishnagiri','Karur','Thoothukudi','Tiruppur',
  'Tiruvannamalai','Cuddalore','Nagapattinam','Others',
]

const USER_TYPE_OPTIONS = [
  {
    id: 'school_student',
    title: 'School Student',
    subtitle: 'Class 5 to Class 12',
    icon: FiCompass,
    color: '#6d28d9',
    bg: '#ede9fe',
    desc: 'Access milestone guidance, stream pre-selection, TNEA cutoff analysis, and gamified skill activities.'
  },
  {
    id: 'college_student',
    title: 'College Student',
    subtitle: 'Degree, Diploma & Cert',
    icon: FiBookOpen,
    color: '#047857',
    bg: '#d1fae5',
    desc: 'Explore degree specializations, industry skill alignment, career options, and counselor advising.'
  },
  {
    id: 'graduate',
    title: 'Graduate',
    subtitle: 'Degree Completed',
    icon: FiBriefcase,
    color: '#1e40af',
    bg: '#dbeafe',
    desc: 'Post-graduate degree discovery, competitive exam prep (GATE, CAT, TNPSC), and career shifts.'
  }
]

export default function SignupPage() {
  const { login, isAuthenticated, student } = useStudentAuth()
  const navigate = useNavigate()

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && student) {
      if (student.onboardingCompleted === false) {
        if (student.userType === 'college_student') navigate('/student/onboarding/college', { replace: true })
        else if (student.userType === 'graduate') navigate('/student/onboarding/graduate', { replace: true })
        else navigate('/student/onboarding', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, navigate, student])

  // Registration Sequence Step: 1 = Select User Type, 2 = Account Details
  const [step, setStep] = useState(1)
  const [selectedUserType, setSelectedUserType] = useState('school_student')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    classLevel: '10th',
    district: 'Coimbatore'
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [regDisabled, setRegDisabled] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const checkReg = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings/public', { timeout: 3000 })
        if (res.data && res.data.studentRegistration === false) {
          setRegDisabled(true)
        }
      } catch (e) {
        console.warn('Could not check registration status, defaulting to open')
      } finally {
        setInitialLoading(false)
      }
    }
    checkReg()
  }, [])

  const validateCredentials = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validateCredentials()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')

    try {
      // Step 3: Call backend registration API passing userType
      await axios.post('http://localhost:5000/api/students/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        userType: selectedUserType,
        classLevel: selectedUserType === 'school_student' ? form.classLevel : selectedUserType,
        district: form.district
      })

      // Auto-login after successful registration
      const loginRes = await axios.post('http://localhost:5000/api/students/login', {
        email: form.email,
        password: form.password
      })

      const token = loginRes.data.token
      const studentData = loginRes.data.student || loginRes.data.user
      
      // Update Auth Context
      login(token, studentData)

      // Step 4: Route user to appropriate onboarding based on userType
      if (selectedUserType === 'college_student') {
        navigate('/student/onboarding/college', { replace: true })
      } else if (selectedUserType === 'graduate') {
        navigate('/student/onboarding/graduate', { replace: true })
      } else {
        navigate('/student/onboarding', { replace: true })
      }

    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
    setApiError('')
  }

  const selectedCategoryObj = USER_TYPE_OPTIONS.find(o => o.id === selectedUserType) || USER_TYPE_OPTIONS[0]

  return (
    <div className="student-root" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(140deg, #f8fafc 0%, #eef2f6 100%)',
      padding: '80px 20px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: 540 }}>

        {/* Logo Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Uyarvu Payanam" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 24, color: 'var(--s-text)' }}>
              Uyarvu <span style={{ color: 'var(--s-primary)' }}>Payanam</span>
            </span>
          </Link>
        </div>

        <SCard style={{ padding: '36px 32px', borderRadius: 24 }} className="s-anim-up">

          {/* STEP 1: SELECT USER TYPE */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: 'var(--s-text)', marginBottom: 6 }}>
                  What type of student are you?
                </h1>
                <p style={{ fontSize: 14, color: 'var(--s-text3)' }}>
                  Select your category to customize your guidance experience.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {USER_TYPE_OPTIONS.map((opt) => {
                  const IconComp = opt.icon
                  const isSelected = selectedUserType === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedUserType(opt.id)}
                      style={{
                        padding: 20,
                        borderRadius: 16,
                        border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--s-border)',
                        background: isSelected ? '#fff' : 'var(--s-surface2)',
                        boxShadow: isSelected ? 'var(--s-shadow-md)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 16,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: opt.bg, color: opt.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComp size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                            {opt.title}
                          </h3>
                          <span style={{ fontSize: 11, fontWeight: 800, color: opt.color, background: opt.bg, padding: '3px 8px', borderRadius: 10 }}>
                            {opt.subtitle}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '6px 0 0', lineHeight: 1.5 }}>
                          {opt.desc}
                        </p>
                      </div>

                      {isSelected && (
                        <FiCheckCircle size={22} style={{ color: opt.color, flexShrink: 0, marginTop: 2 }} />
                      )}
                    </div>
                  )
                })}
              </div>

              <SBtn
                onClick={() => setStep(2)}
                variant="primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 12 }}
              >
                Continue to Account Setup <FiArrowRight style={{ marginLeft: 8 }} />
              </SBtn>

              <SDivider label="or" />
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--s-text3)', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/student/signin" style={{ color: 'var(--s-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
              </p>
            </div>
          )}

          {/* STEP 2: CREATE CREDENTIALS */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <FiArrowLeft size={16} /> Change Student Type
                </button>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 12, background: selectedCategoryObj.bg, color: selectedCategoryObj.color }}>
                  {selectedCategoryObj.title}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 20, color: 'var(--s-text)', marginBottom: 4, textAlign: 'center' }}>
                Create Account Credentials
              </h1>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', textAlign: 'center', marginBottom: 24 }}>
                Enter your details to create your {selectedCategoryObj.title} account.
              </p>

              {apiError && (
                <div style={{ marginBottom: 18 }}>
                  <SAlert type="error" onClose={() => setApiError('')}>{apiError}</SAlert>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SInput label="Full Name" placeholder="Your full name" icon={<FiUser />} value={form.name} onChange={set('name')} error={errors.name} />
                <SInput label="Email Address" type="email" placeholder="you@email.com" icon={<FiMail />} value={form.email} onChange={set('email')} error={errors.email} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="s-grid-2col">
                  <div style={{ position: 'relative' }}>
                    <SInput
                      label="Password" type={showPwd ? 'text' : 'password'}
                      placeholder="Min 6 chars" icon={<FiLock />}
                      value={form.password} onChange={set('password')} error={errors.password}
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)} style={{
                      position: 'absolute', right: 12,
                      top: errors.password ? 30 : '50%',
                      transform: errors.password ? 'none' : 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--s-text3)', padding: 0,
                    }}>
                      {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                  <SInput label="Confirm Password" type={showPwd ? 'text' : 'password'} placeholder="Repeat password" icon={<FiLock />} value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="s-grid-2col">
                  {selectedUserType === 'school_student' ? (
                    <SSelect label="Class Standard" value={form.classLevel} onChange={set('classLevel')}>
                      {CLASS_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </SSelect>
                  ) : (
                    <SInput label="Category" value={selectedCategoryObj.title} disabled />
                  )}

                  <SSelect label="District" value={form.district} onChange={set('district')}>
                    {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </SSelect>
                </div>

                <SBtn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px', borderRadius: 12 }} disabled={loading}>
                  {loading ? 'Creating Account…' : `Create ${selectedCategoryObj.title} Account`}
                </SBtn>
              </form>

              <SDivider label="or" />
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--s-text3)' }}>
                Already have an account?{' '}
                <Link to="/student/signin" style={{ color: 'var(--s-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
              </p>
            </div>
          )}

        </SCard>
      </div>
    </div>
  )
}
