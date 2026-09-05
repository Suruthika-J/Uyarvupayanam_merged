import React, { useState, useEffect } from 'react'
import { FiX, FiSend, FiCheckCircle, FiUser, FiMail, FiPhone, FiInfo, FiMessageSquare } from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { mentorRequestService } from '../../services'
import { SBtn, SLoader } from '../ui'

export default function MentorRequestModal({ isOpen, onClose, initialInterest = '' }) {
  const { student, isAuthenticated } = useStudentAuth()
  
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    classLevel: '',
    interest: '',
    message: '',
    preferredContact: 'Phone'
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill from student profile
  useEffect(() => {
    if (isOpen) {
      setFormData({
        studentName: student?.name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        classLevel: student?.classLevel ? `${student.classLevel}th` : '',
        interest: initialInterest || '',
        message: '',
        preferredContact: 'Phone'
      })
      setSuccess(false)
      setError('')
    }
  }, [isOpen, student, initialInterest])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        userId: student?._id || null
      }
      await mentorRequestService.create(payload)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="s-modal-overlay s-anim-fade" onClick={onClose}>
      <div 
        className="s-modal-content s-anim-down" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 500, width: '95%' }}
      >
        <div className="s-modal-header">
          <h3 className="s-modal-title">🤝 Talk to a Mentor</h3>
          <button className="s-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {success ? (
          <div className="s-modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FiCheckCircle size={64} color="var(--s-success)" style={{ marginBottom: 20 }} />
            <h2 style={{ marginBottom: 12, color: 'var(--s-text1)' }}>Request Submitted!</h2>
            <p style={{ color: 'var(--s-text3)', lineHeight: 1.6, marginBottom: 24 }}>
              Your guidance request has been submitted successfully. Our mentor/admin will contact you soon.
            </p>
            <SBtn variant="primary" style={{ width: '100%' }} onClick={onClose}>
              Got it
            </SBtn>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="s-modal-body">
            <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 20 }}>
              Need help choosing a path or understanding eligibility? Our mentors are here to guide you.
            </p>

            {error && (
              <div style={{ 
                padding: 12, background: '#fef2f2', color: '#dc2626', 
                borderRadius: 8, fontSize: 13, marginBottom: 16,
                border: '1px solid #fee2e2'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="s-input-group">
                <label className="s-label"><FiUser size={13} /> Name *</label>
                <input 
                  type="text" className="s-input" required 
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              <div className="s-input-group">
                <label className="s-label"><FiMail size={13} /> Email *</label>
                <input 
                  type="email" className="s-input" required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div className="s-input-group">
                <label className="s-label"><FiPhone size={13} /> Phone *</label>
                <input 
                  type="tel" className="s-input" required 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="Mobile number"
                />
              </div>
              <div className="s-input-group">
                <label className="s-label"><FiInfo size={13} /> Class Level *</label>
                <select 
                  className="s-input" required
                  value={formData.classLevel}
                  onChange={e => setFormData({...formData, classLevel: e.target.value})}
                >
                  <option value="">Select Class</option>
                  <option value="5th">5th Standard</option>
                  <option value="8th">8th Standard</option>
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard</option>
                  <option value="Graduate">College/Graduate</option>
                </select>
              </div>
            </div>

            <div className="s-input-group" style={{ marginTop: 12 }}>
              <label className="s-label">Interested Stream / Career *</label>
              <input 
                type="text" className="s-input" required 
                value={formData.interest}
                onChange={e => setFormData({...formData, interest: e.target.value})}
                placeholder="e.g. Engineering, Arts, Medical..."
              />
            </div>

            <div className="s-input-group" style={{ marginTop: 12 }}>
              <label className="s-label"><FiMessageSquare size={13} /> Guidance Message *</label>
              <textarea 
                className="s-input" required rows={3} 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Describe what help you need..."
                style={{ resize: 'none' }}
              />
            </div>

            <div className="s-input-group" style={{ marginTop: 12 }}>
              <label className="s-label">Preferred Contact Method</label>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                {['Phone', 'Email', 'WhatsApp'].map(method => (
                  <label key={method} style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, 
                    fontSize: 13, cursor: 'pointer', color: 'var(--s-text2)'
                  }}>
                    <input 
                      type="radio" name="preferredContact" 
                      checked={formData.preferredContact === method}
                      onChange={() => setFormData({...formData, preferredContact: method})}
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <SBtn 
                type="submit" variant="primary" style={{ width: '100%', height: 44 }}
                disabled={loading}
              >
                {loading ? <div className="s-btn-spinner" /> : <><FiSend /> Submit Request</>}
              </SBtn>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
