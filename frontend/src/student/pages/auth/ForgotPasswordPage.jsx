import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import { SBtn, SInput, SAlert, SCard } from '../../components/ui'
import OtpInput from '../../components/ui/OtpInput'
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiShield, FiEye, FiEyeOff } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  // step: 'email' → 'otp' → 'password' → 'done'
  const [step,      setStep]     = useState('email')
  const [email,     setEmail]    = useState('')
  const [otp,       setOtp]      = useState('')
  const [token,     setToken]    = useState('')
  const [form,      setForm]     = useState({ password: '', confirmPassword: '' })
  const [errors,    setErrors]   = useState({})
  const [loading,   setLoading]  = useState(false)
  const [apiError,  setApiError] = useState('')
  const [showPwd,   setShowPwd]  = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [cooldown,  setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const validEmail = (value) => /\S+@\S+\.\S+/.test(value)

  /* Step 1 — request reset code */
  const requestCode = async (ev) => {
    ev.preventDefault()
    if (!email) { setErrors({ email: 'Email is required' }); return }
    if (!validEmail(email)) { setErrors({ email: 'Enter a valid email' }); return }
    setLoading(true)
    setApiError('')
    setErrors({})
    try {
      await axiosInstance.post('/auth/forgot-password', { email })
      setStep('otp')
      setOtp('')
      setCooldown(30)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  /* Step 2 — verify code → receive single-use reset token */
  const verifyCode = async (ev) => {
    ev.preventDefault()
    if (otp.length !== 6) { setErrors({ otp: 'Enter the 6-digit code' }); return }
    setLoading(true)
    setApiError('')
    setErrors({})
    try {
      const res = await axiosInstance.post('/auth/forgot-password/verify', { email, otp })
      setToken(res.data.token)
      setStep('password')
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Try again or request a new code.'
      setApiError(msg)
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  /* Step 3 — set new password */
  const resetPassword = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!form.password) {
      e.password = 'Password is required'
    } else if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters'
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'Include at least one uppercase letter'
    } else if (!/[0-9]/.test(form.password)) {
      e.password = 'Include at least one number'
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setApiError('')
    setErrors({})
    try {
      await axiosInstance.post('/auth/reset-password', { token, password: form.password, email })
      setStep('done')
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Please request a new code.'
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

  // Password strength indicator (same rules as the legacy reset page)
  const getPasswordStrength = () => {
    const pwd = form.password
    if (!pwd) return { level: 0, label: '', color: 'transparent' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++
    if (score <= 2) return { level: score, label: 'Weak', color: '#ef4444' }
    if (score <= 3) return { level: score, label: 'Fair', color: '#f59e0b' }
    if (score <= 4) return { level: score, label: 'Good', color: '#22c55e' }
    return { level: score, label: 'Strong', color: '#047857' }
  }
  const strength = getPasswordStrength()

  return (
    <div className="student-root" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(140deg,#f7f6f3 0%,#eaf3ee 100%)',
      padding: '80px 20px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/home" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
          {step === 'done' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--s-green-l)', color: 'var(--s-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 32,
              }}>
                <FiCheckCircle size={32} />
              </div>
              <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: 'var(--s-text)', marginBottom: 10 }}>
                Password Reset Successful
              </h1>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.7, marginBottom: 28 }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <SBtn
                variant="primary"
                onClick={() => navigate('/student/signin')}
                style={{ width: '100%', justifyContent: 'center' }}
                id="goto-signin"
              >
                Go to Sign In
              </SBtn>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
                {['email', 'otp', 'password'].map((s, i) => (
                  <span key={s} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: step === s ? 'var(--s-primary)' : (['otp', 'password'].indexOf(step) > i ? 'var(--s-primary)' : 'var(--s-border)'),
                  }} />
                ))}
              </div>

              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'var(--s-primary-l)', color: 'var(--s-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                {step === 'email' ? <FiMail size={26} /> : step === 'otp' ? <FiShield size={26} /> : <FiLock size={26} />}
              </div>

              <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: 'var(--s-text)', marginBottom: 6, textAlign: 'center' }}>
                {step === 'email' ? 'Forgot Password?' : step === 'otp' ? 'Enter the Code' : 'Set a New Password'}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                {step === 'email' ? 'Enter your registered email and we\'ll send you a verification code.' :
                 step === 'otp' ? `We emailed a 6-digit code to ${email}. It expires in 10 minutes.` :
                 'Create a strong new password for your account.'}
              </p>

              {apiError && (
                <div style={{ marginBottom: 18 }}>
                  <SAlert type="error" onClose={() => setApiError('')}>{apiError}</SAlert>
                </div>
              )}

              {step === 'email' && (
                <form onSubmit={requestCode} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <SInput
                    label="Email Address" type="email" placeholder="you@email.com"
                    icon={<FiMail />} value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); setApiError('') }}
                    error={errors.email} id="forgot-email"
                  />
                  <SBtn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading} id="forgot-submit">
                    {loading ? 'Sending Code…' : 'Send Verification Code'}
                  </SBtn>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={verifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <OtpInput length={6} value={otp} onChange={(v) => { setOtp(v); setErrors(er => ({ ...er, otp: '' })) }} disabled={loading} id="reset-otp" />
                    {errors.otp && <span style={{ fontSize: 12, color: '#dc2626', textAlign: 'center' }}>{errors.otp}</span>}
                  </div>
                  <SBtn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || otp.length !== 6} id="verify-reset-otp">
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </SBtn>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={() => { setStep('email'); setOtp(''); setApiError('') }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)',
                      fontSize: 12.5, fontWeight: 600, padding: 0,
                    }}>
                      Use a different email
                    </button>
                    <button type="button" onClick={requestCode} disabled={cooldown > 0 || loading} style={{
                      background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                      color: cooldown > 0 ? 'var(--s-text3)' : 'var(--s-primary)',
                      fontSize: 12.5, fontWeight: 700, padding: 0,
                    }}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ position: 'relative' }}>
                    <SInput
                      label="New Password" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters"
                      icon={<FiLock />} value={form.password} onChange={set('password')}
                      error={errors.password} id="reset-password"
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)} style={{
                      position: 'absolute', right: 12, top: errors.password ? 30 : '50%',
                      transform: errors.password ? 'none' : 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)', padding: 0,
                    }}>
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>

                  {form.password && (
                    <div style={{ marginTop: -10 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 99,
                            background: i <= strength.level ? strength.color : 'var(--s-border)',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: strength.color, fontFamily: 'var(--s-font-display)' }}>
                        {strength.label}
                      </span>
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>
                    <SInput
                      label="Confirm Password" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your new password"
                      icon={<FiLock />} value={form.confirmPassword} onChange={set('confirmPassword')}
                      error={errors.confirmPassword} id="reset-confirm-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} style={{
                      position: 'absolute', right: 12, top: errors.confirmPassword ? 30 : '50%',
                      transform: errors.confirmPassword ? 'none' : 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)', padding: 0,
                    }}>
                      {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>

                  <SBtn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading} id="reset-submit">
                    {loading ? 'Resetting Password…' : 'Reset Password'}
                  </SBtn>
                </form>
              )}
            </>
          )}
        </SCard>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/student/signin" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 600, color: 'var(--s-text3)',
            textDecoration: 'none', fontFamily: 'var(--s-font-display)',
          }}>
            <FiArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}