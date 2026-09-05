import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { SBtn, SInput, SAlert, SCard } from '../../components/ui'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

const API_BASE = 'http://localhost:5000/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [emailError, setEmailError] = useState('')

  const [resetToken, setResetToken] = useState(null)
  const [resetUrl, setResetUrl]     = useState(null)

  const validate = () => {
    if (!email) { setEmailError('Email is required'); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Enter a valid email'); return false }
    setEmailError('')
    return true
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email })
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken)
      }
      if (res.data?.resetUrl) {
        setResetUrl(res.data.resetUrl)
      }
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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
                Password Reset Link Ready
              </h1>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.7, marginBottom: 20 }}>
                A password reset request for <strong style={{ color: 'var(--s-text)' }}>{email}</strong> has been processed.
              </p>

              {resetToken ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 18, borderRadius: 14, marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#047857', marginBottom: 12 }}>
                    Click the button below to proceed to the Reset Password page:
                  </div>
                  <Link
                    to={`/student/reset-password/${resetToken}`}
                    style={{
                      display: 'inline-block', width: '100%', padding: '12px 20px',
                      background: '#047857', color: '#fff', borderRadius: 10,
                      fontWeight: 800, fontSize: 14, textDecoration: 'none'
                    }}
                  >
                    Reset Password Now →
                  </Link>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 20 }}>
                  Please check your email inbox and spam folder for the password reset instructions.
                </p>
              )}

              <SBtn
                variant="outline"
                onClick={() => { setSuccess(false); setEmail(''); setResetToken(null); setResetUrl(null) }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Try Another Email
              </SBtn>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'var(--s-primary-l)', color: 'var(--s-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiMail size={26} />
              </div>
              <h1 style={{
                fontFamily: 'var(--s-font-display)', fontWeight: 800,
                fontSize: 22, color: 'var(--s-text)', marginBottom: 6, textAlign: 'center',
              }}>
                Forgot Password?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
                No worries! Enter your registered email and we'll send you a reset link.
              </p>

              {error && (
                <div style={{ marginBottom: 18 }}>
                  <SAlert type="error" onClose={() => setError('')}>{error}</SAlert>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <SInput
                  label="Email Address"
                  type="email"
                  placeholder="you@email.com"
                  icon={<FiMail />}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); setError('') }}
                  error={emailError}
                  id="forgot-email"
                />
                <SBtn
                  type="submit"
                  variant="primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={loading}
                  id="forgot-submit"
                >
                  {loading ? 'Sending Reset Link…' : 'Send Reset Link'}
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
