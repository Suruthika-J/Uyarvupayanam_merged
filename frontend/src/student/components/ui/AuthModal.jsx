import React, { useState } from 'react'
import { SBtn, SInput } from '../ui'
import { FiX, FiMail, FiLock, FiUser, FiInfo } from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'

export default function AuthModal({ isOpen, onClose, onLoginSuccess, message }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useStudentAuth()

  if (!isOpen) return null

  const handleToggle = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let res;
      if (isLogin) {
        res = await login(formData.email, formData.password)
      } else {
        res = await signup(formData.name, formData.email, formData.password)
      }

      if (res.success) {
        onLoginSuccess && onLoginSuccess()
        onClose()
      } else {
        setError(res.message || 'Authentication failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, padding: 20
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: 420,
        borderRadius: 24, padding: 32, position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fadeUp 0.3s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <FiX size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ 
            width: 56, height: 56, background: 'var(--s-primary-l)', color: 'var(--s-primary)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
          }}>
            <FiUser size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>
            {isLogin ? 'Welcome Back!' : 'Join the Adventure'}
          </h2>
          {message && (
            <div style={{ fontSize: 14, color: 'var(--s-primary)', background: 'var(--s-primary-l)', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <FiInfo size={14} /> {message}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <SInput 
              label="Full Name" 
              placeholder="Enter your name" 
              icon={<FiUser />}
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <SInput 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com" 
            icon={<FiMail />}
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <SInput 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            icon={<FiLock />}
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />

          {error && <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>{error}</div>}

          <SBtn type="submit" disabled={loading} style={{ height: 50, marginTop: 8 }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </SBtn>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={handleToggle}
            style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontWeight: 700, marginLeft: 6, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  )
}
