import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import styles from './LoginPage.module.css'
import uyarvuLogo from '../../uyarvu-logo.png'

/* ── floating study icons in background ── */
const ICONS = ['📚','✏️','🎓','📐','🔬','🖊️','📖','🏫','📝','🔭','🧮','📏']

export default function LoginPage() {
  const navigate   = useNavigate()
  const { login }  = useAuth()
  const { theme, toggle } = useTheme()

  const [step, setStep]         = useState(1) // 1=creds, 2=2fa, 3=success
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret]     = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [otp, setOtp]           = useState(['','','','','',''])
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [timer, setTimer]       = useState(300)
  const timerRef                = useRef(null)
  const otpRefs                 = useRef([])

  // floating icons positions (stable)
  const floatingIcons = ICONS.map((ic,i) => ({
  ic,
  top: `${8 + (i * 7.5) % 85}%`,
  left: `${5 + (i * 8.3) % 90}%`,
  delay: `${(i * 0.7) % 4}s`,
  dur: `${3 + (i % 3)}s`,
  size: 14 + (i % 3) * 4
}))

  /* timer */
  useEffect(() => {
    if (step === 2) {
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [step])

  const fmtTimer = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  /* ── Step 1 submit ── */
  const handleStep1 = async () => {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (password.length < 8)  e.password = 'Password must be at least 8 characters'
    if (secret.length < 4)    e.secret   = 'Secret key is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    
    const result = await login(email, password)
    setLoading(false)
    
    if (result.success) {
      setStep(2)
      setTimer(300)
    } else {
      setErrors({ email: result.message || 'Invalid credentials' })
    }
  }

  /* ── OTP handlers ── */
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx+1]?.focus()
    if (next.every(d => d !== '') && !next.includes('')) {
      setTimeout(() => handleStep2(next.join('')), 200)
    }
  }
  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus()
  }
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      setTimeout(() => handleStep2(pasted), 200)
    }
    e.preventDefault()
  }

  /* ── Step 2 submit ── */
  const handleStep2 = (code) => {
    const c = code || otp.join('')
    if (c.length !== 6) { setErrors({ otp: 'Enter all 6 digits' }); return }
    setErrors({})
    setLoading(true)
    clearInterval(timerRef.current)
    setTimeout(() => { setLoading(false); setStep(3); setTimeout(() => navigate('/admin'), 2500) }, 1200)
  }

  const resetOtp = () => {
    setOtp(['','','','','','']); setTimer(300)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimer(t => t > 0 ? t-1 : 0), 1000)
    otpRefs.current[0]?.focus()
  }

  return (
    <div className={styles.page}>
      {/* Theme toggle */}
      <button className={styles.themeToggle} onClick={toggle} title="Toggle dark mode">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Floating study icons */}
      <div className={styles.floatingBg} aria-hidden>
        {floatingIcons.map((f, i) => (
          <span key={i} className={styles.floatIcon}
            style={{ top: f.top, left: f.left, fontSize: f.size,
              animationDelay: f.delay, animationDuration: f.dur }}>
            {f.ic}
          </span>
        ))}
      </div>

      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandWrap}>
          <img src={uyarvuLogo} alt="Uyarvu Payanam Logo" className={styles.brandLogoImg} />
          <h1 className={styles.brandName}>UYARVU PAYANAM</h1>
          <p className={styles.brandTag}>Career Guidance System</p>
        </div>
        
        <div className={styles.illustrationBox}>
          <p className={styles.introMessage}>
            Empowering students from 5th to 12th standard with career guidance, courses, scholarships, colleges, and exam support.
          </p>
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📚</span>
              <span>Course Management</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🏫</span>
              <span>College Database</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📝</span>
              <span>Exam Tracker</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🎓</span>
              <span>Scholarships</span>
            </div>
          </div>
        </div>
        <div className={styles.statsRow}>
          {[['2,847','Students'], ['64','Courses'], ['28','Exams'], ['15','Scholarships']].map(([v,l]) => (
            <div key={l} className={styles.statPill}>
              <span className={styles.statVal}>{v}</span>
              <span className={styles.statLbl}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel / card */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>

          {/* Step indicator */}
          <div className={styles.stepBar}>
            {['Credentials','2FA Code','Access'].map((lbl, i) => (
              <React.Fragment key={lbl}>
                <div className={styles.stepItem}>
                  <div className={`${styles.stepNum} ${step > i+1 ? styles.done : step === i+1 ? styles.active : ''}`}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span className={`${styles.stepLbl} ${step === i+1 ? styles.activeLbl : ''}`}>{lbl}</span>
                </div>
                {i < 2 && <div className={styles.stepLine}>
                  <div className={styles.stepLineFill} style={{ width: step > i+1 ? '100%' : '0%' }} />
                </div>}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1: Credentials ── */}
          {step === 1 && (
            <div className={styles.formSection} key="step1">
              <div className={styles.formHeader}>
                <div className={styles.formIcon}>👋</div>
                <div>
                  <h2 className={styles.formTitle}>Welcome Back</h2>
                  <p className={styles.formSub}>Sign in to your admin account</p>
                </div>
              </div>

              <Field label="Email Address" icon="✉️" error={errors.email}>
                <input type="email" className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                  placeholder="admin@careermap.in" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStep1()} />
              </Field>

              <Field label="Password" icon="🔑" error={errors.password}>
                <div className={styles.inputWrap}>
                  <input type={showPw ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                    placeholder="Min. 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStep1()} />
                  <button className={styles.eyeBtn} onClick={() => setShowPw(s => !s)} type="button">
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </Field>

              <Field label="Secret Key" icon="🛡️" error={errors.secret}>
                <div className={styles.inputWrap}>
                  <input type="password" className={`${styles.input} ${errors.secret ? styles.inputErr : ''}`}
                    placeholder="Your admin secret key" value={secret}
                    onChange={e => setSecret(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStep1()} />
                  <span className={styles.requiredBadge}>Required</span>
                </div>
              </Field>

              <button className={`${styles.primaryBtn} ${loading ? styles.btnLoading : ''}`}
                onClick={handleStep1} disabled={loading}>
                {loading ? <span className={styles.spinner}/> : <>Continue to 2FA <span>→</span></>}
              </button>

              <div className={styles.secNote}>
                <span>🔒</span>
                <span>Restricted to authorized administrators. All access attempts are logged.</span>
              </div>
            </div>
          )}

          {/* ── STEP 2: 2FA OTP ── */}
          {step === 2 && (
            <div className={styles.formSection} key="step2">
              <button className={styles.backBtn} onClick={() => { clearInterval(timerRef.current); setStep(1) }}>
                ← Back
              </button>

              <div className={styles.formHeader}>
                <div className={styles.formIcon}>📱</div>
                <div>
                  <h2 className={styles.formTitle}>2FA Verification</h2>
                  <p className={styles.formSub}>Enter code from your authenticator app</p>
                </div>
              </div>

              <div className={styles.timerBadge} style={{ color: timer < 60 ? 'var(--accent2)' : 'var(--primary)' }}>
                ⏱ Code expires in <strong>{fmtTimer(timer)}</strong>
              </div>

              <label className={styles.fieldLabel}>6-Digit OTP Code</label>
              <div className={styles.otpRow} onPaste={handleOtpPaste}>
                {otp.map((d, idx) => (
                  <input key={idx} ref={el => otpRefs.current[idx] = el}
                    className={`${styles.otpBox} ${d ? styles.otpFilled : ''} ${errors.otp ? styles.otpErr : ''}`}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKey(idx, e)} />
                ))}
              </div>
              {errors.otp && <p className={styles.errMsg}>⚠ {errors.otp}</p>}

              <p className={styles.resendRow}>
                Didn't receive a code? <button className={styles.linkBtn} onClick={resetOtp}>Resend</button>
              </p>

              <button className={`${styles.primaryBtn} ${loading ? styles.btnLoading : ''}`}
                onClick={() => handleStep2()} disabled={loading}>
                {loading ? <span className={styles.spinner}/> : <>Verify & Login <span>✓</span></>}
              </button>

              <div className={styles.divider}><span>or</span></div>

              <button className={styles.outlineBtn}>Use Backup Code</button>

              <div className={styles.secNote}>
                <span>📱</span>
                <span>Open Google Authenticator or any TOTP app and enter the 6-digit code for UYARVU PAYANAM Admin.</span>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className={styles.successSection} key="step3">
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>Access Granted!</h2>
              <p className={styles.successSub}>Identity verified. Redirecting to dashboard…</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
              <p className={styles.progressLabel}>Redirecting in 2.5s</p>
            </div>
          )}

        </div>

        <p className={styles.footer}>
          © 2025 UYARVU PAYANAM · Career Guidance System · Secure Admin Portal
        </p>
      </div>
    </div>
  )
}

/* ── Field wrapper component ── */
function Field({ label, icon, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 7 }}>
        <span>{icon}</span>{label}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: 'var(--accent2)', marginTop: 5, display:'flex', alignItems:'center', gap:4 }}>
        ⚠ {error}
      </p>}
    </div>
  )
}