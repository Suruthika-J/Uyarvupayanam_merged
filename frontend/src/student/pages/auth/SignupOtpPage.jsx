import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axiosInstance from '../../../config/axios'
import { SBtn, SAlert, SCard } from '../../components/ui'
import OtpInput from '../../components/ui/OtpInput'
import { FiArrowLeft, FiCheckCircle, FiRefreshCw, FiLogOut } from 'react-icons/fi'

// Pending sign-up email carried from the Signup form (router state + sessionStorage
// so a refresh doesn't lose which email needs verifying).
const PENDING_EMAIL_KEY = 'pendingSignupEmail'
const RESEND_COOLDOWN_S = 30

// "p****@gmail.com" style mask — first letter + stars + domain.
const maskEmail = (email) => {
  const at = email.indexOf('@')
  if (at <= 1) return email
  return `${email.slice(0, 1)}****${email.slice(at)}`
}

// Verified sign-ups go to onboarding (never straight to the dashboard).
const onboardingDest = (s) =>
  s?.userType === 'college_student' ? '/student/onboarding/college'
  : s?.userType === 'graduate' ? '/student/onboarding/graduate'
  : '/student/onboarding'

export default function SignupOtpPage() {
  const { login, isAuthenticated, student } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const email = (location.state?.email || sessionStorage.getItem(PENDING_EMAIL_KEY) || '').trim().toLowerCase()

  const [otp,       setOtp]       = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [notice,    setNotice]    = useState('')
  const [cooldown,  setCooldown]  = useState(RESEND_COOLDOWN_S)

  // No email context (deep link / wiped state) → back to sign-up.
  useEffect(() => {
    if (!email) navigate('/student/signup', { replace: true })
  }, [email, navigate])

  // Already authenticated (verified elsewhere) → straight to onboarding.
  useEffect(() => {
    if (isAuthenticated && student && email) {
      navigate(onboardingDest(student), { replace: true })
    }
  }, [isAuthenticated, navigate, student, email])

  // Resend cooldown timer.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const verifyOtp = async (ev) => {
    ev.preventDefault()
    if (otp.length !== 6) { setApiError('Please enter the 6-digit code'); return }
    setLoading(true)
    setApiError('')
    setNotice('')
    try {
      const res = await axiosInstance.post('/students/verify-otp', { email, otp })
      sessionStorage.removeItem(PENDING_EMAIL_KEY)
      login(res.data.token, res.data.student)
      // Redirect to the correct onboarding screen (not the dashboard).
      navigate(onboardingDest(res.data.student), { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.'
      setApiError(msg)
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setResending(true)
    setApiError('')
    setNotice('')
    try {
      await axiosInstance.post('/students/resend-otp', { email })
      setOtp('')
      setCooldown(RESEND_COOLDOWN_S)
      setNotice('A new code was sent to your email.')
    } catch (err) {
      const msg = err.response?.data?.message || "We couldn't send the OTP right now. Please try again."
      setApiError(msg)
    } finally {
      setResending(false)
    }
  }

  const changeEmail = () => {
    sessionStorage.removeItem(PENDING_EMAIL_KEY)
    navigate('/student/signup', { replace: true })
  }

  return (
    <div className="student-root" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(140deg, #f8fafc 0%, #eef2f6 100%)',
      padding: '80px 20px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Uyarvu Payanam" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 24, color: 'var(--s-text)' }}>
              Uyarvu <span style={{ color: 'var(--s-primary)' }}>Payanam</span>
            </span>
          </Link>
        </div>

        <SCard style={{ padding: '36px 32px', borderRadius: 24 }} className="s-anim-up">
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--s-primary-l)', color: 'var(--s-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <FiCheckCircle size={26} />
          </div>

          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 21, color: 'var(--s-text)', marginBottom: 6, textAlign: 'center' }}>
            Verify your email
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
            We sent a 6-digit verification code to{' '}
            <strong style={{ color: 'var(--s-text)' }}>{maskEmail(email)}</strong>.
            Your account is active only after the code is verified.
          </p>

          {notice && (
            <div style={{ marginBottom: 18 }}>
              <SAlert type="success" onClose={() => setNotice('')}>{notice}</SAlert>
            </div>
          )}
          {apiError && (
            <div style={{ marginBottom: 18 }}>
              <SAlert type="error" onClose={() => setApiError('')}>{apiError}</SAlert>
            </div>
          )}

          <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <OtpInput length={6} value={otp} onChange={(v) => setOtp(v)} disabled={loading} id="signup-verify-otp" />

            <SBtn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || otp.length !== 6} id="signup-verify-submit">
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </SBtn>
          </form>

          {/* Resend with cooldown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--s-border)' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--s-text3)' }}>
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={resendOtp}
              disabled={cooldown > 0 || resending}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'none', border: 'none', cursor: cooldown > 0 || resending ? 'not-allowed' : 'pointer',
                color: cooldown > 0 ? 'var(--s-text3)' : 'var(--s-primary)',
                fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--s-font-display)', padding: 0,
              }}
              id="signup-resend-otp"
            >
              <FiRefreshCw size={14} />
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : resending ? 'Sending…' : 'Resend OTP'}
            </button>

            <button
              type="button"
              onClick={changeEmail}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--s-text3)', fontSize: 13, fontWeight: 600, padding: 0,
              }}
              id="signup-change-email"
            >
              <FiLogOut size={13} /> Use a different email
            </button>
          </div>
        </SCard>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/student/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 600, color: 'var(--s-text3)',
            textDecoration: 'none', fontFamily: 'var(--s-font-display)',
          }}>
            <FiArrowLeft size={15} /> Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}