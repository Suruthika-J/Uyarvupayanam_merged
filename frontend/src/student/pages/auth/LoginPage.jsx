import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SInput, SAlert, SCard, SDivider } from '../../components/ui'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'

const API_BASE = 'http://localhost:5000/api'

export default function LoginPage() {
  const { login, isAuthenticated, student }  = useStudentAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  let from       = location.state?.from?.pathname || '/student/dashboard'
  if (from === '/signin' || from === '/signup') from = '/student/dashboard'

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/student/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)                              e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email    = 'Invalid email address'
    if (!form.password)                           e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      const res = await axios.post(`${API_BASE}/students/login`, form)
      localStorage.setItem('studentToken', res.data.token)
      login(res.data.token, res.data.student)
      navigate('/student/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
    setApiError('')
  }

  return (
    <div className="student-root" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(140deg,#f7f6f3 0%,#eaf3ee 100%)',
      padding: '80px 20px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/student/home" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo.png"
              alt="Uyarvu Payanam"
              style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 12 }}
            />
            <span style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: 'var(--s-text)' }}>
              Uyarvu <span style={{ color: 'var(--s-primary)' }}>Payanam</span>
            </span>
          </Link>
        </div>

        <SCard style={{ padding: '36px 32px' }} className="s-anim-up">
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: 'var(--s-text)', marginBottom: 6, textAlign: 'center' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', textAlign: 'center', marginBottom: 28 }}>
            Sign in to continue your career journey
          </p>

          {apiError && (
            <div style={{ marginBottom: 18 }}>
              <SAlert type="error" onClose={() => setApiError('')}>{apiError}</SAlert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SInput
              label="Email Address" type="email" placeholder="you@email.com"
              icon={<FiMail />} value={form.email}
              onChange={set('email')} error={errors.email}
              id="login-email"
            />
            <div style={{ position: 'relative' }}>
              <SInput
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                icon={<FiLock />} value={form.password}
                onChange={set('password')} error={errors.password}
                id="login-password"
              />
              <button type="button" onClick={() => setShowPwd(s => !s)} style={{
                position: 'absolute', right: 12,
                top: errors.password ? 30 : '50%',
                transform: errors.password ? 'none' : 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--s-text3)', padding: 0,
              }}>
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginTop: -10 }}>
              <Link
                to="/student/forgot-password"
                style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--s-primary)',
                  textDecoration: 'none', fontFamily: 'var(--s-font-display)',
                  transition: 'opacity 0.2s',
                }}
                id="forgot-password-link"
              >
                Forgot Password?
              </Link>
            </div>

            <SBtn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading} id="login-submit">
              {loading ? 'Signing In…' : 'Sign In'}
            </SBtn>
          </form>

          <SDivider label="or" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--s-text3)' }}>
            Don't have an account?{' '}
            <Link to="/student/signup" style={{ color: 'var(--s-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </SCard>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/student/home" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 600, color: 'var(--s-text3)',
            textDecoration: 'none', fontFamily: 'var(--s-font-display)',
          }}>
            <FiArrowLeft size={15} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
