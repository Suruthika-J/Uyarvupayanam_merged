import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import { SBtn, SInput, SAlert, SCard } from '../../components/ui'
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate  = useNavigate()

  const [form, setForm]         = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
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
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')

    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        password: form.password,
      })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.'
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

  // Password strength indicator
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
          {success ? (
            /* ── Success State ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--s-green-l)', color: 'var(--s-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 32,
              }}>
                <FiCheckCircle size={32} />
              </div>
              <h1 style={{
                fontFamily: 'var(--s-font-display)', fontWeight: 800,
                fontSize: 22, color: 'var(--s-text)', marginBottom: 10,
              }}>
                Password Reset Successfully!
              </h1>
              <p style={{
                fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.7, marginBottom: 28,
              }}>
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
            /* ── Reset Form ── */
            <>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'var(--s-primary-l)', color: 'var(--s-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiShield size={26} />
              </div>
              <h1 style={{
                fontFamily: 'var(--s-font-display)', fontWeight: 800,
                fontSize: 22, color: 'var(--s-text)', marginBottom: 6, textAlign: 'center',
              }}>
                Reset Password
              </h1>
              <p style={{
                fontSize: 14, color: 'var(--s-text3)', textAlign: 'center',
                marginBottom: 28, lineHeight: 1.6,
              }}>
                Create a strong new password for your account.
              </p>

              {apiError && (
                <div style={{ marginBottom: 18 }}>
                  <SAlert type="error" onClose={() => setApiError('')}>{apiError}</SAlert>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* New Password */}
                <div style={{ position: 'relative' }}>
                  <SInput
                    label="New Password"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    icon={<FiLock />}
                    value={form.password}
                    onChange={set('password')}
                    error={errors.password}
                    id="reset-password"
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

                {/* Password Strength Indicator */}
                {form.password && (
                  <div style={{ marginTop: -10 }}>
                    <div style={{
                      display: 'flex', gap: 4, marginBottom: 4,
                    }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 99,
                          background: i <= strength.level ? strength.color : 'var(--s-border)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: strength.color,
                      fontFamily: 'var(--s-font-display)',
                    }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                {/* Confirm Password */}
                <div style={{ position: 'relative' }}>
                  <SInput
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    icon={<FiLock />}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    error={errors.confirmPassword}
                    id="reset-confirm-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} style={{
                    position: 'absolute', right: 12,
                    top: errors.confirmPassword ? 30 : '50%',
                    transform: errors.confirmPassword ? 'none' : 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--s-text3)', padding: 0,
                  }}>
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                <SBtn
                  type="submit"
                  variant="primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  disabled={loading}
                  id="reset-submit"
                >
                  {loading ? 'Resetting Password…' : 'Reset Password'}
                </SBtn>
              </form>
            </>
          )}
        </SCard>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/signin" style={{
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
