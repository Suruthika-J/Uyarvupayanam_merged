import React, { useState, useEffect } from 'react'
import {
  FiFileText, FiDownload, FiCheckCircle, FiAlertCircle,
  FiPrinter, FiPlus, FiTrash2, FiAward, FiZap
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedCareers,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'

export default function GraduateResumePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [resumeData, setResumeData] = useState({
    targetTitle: '',
    summary: '',
    skills: []
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for resume:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const careers = generatePersonalizedCareers(profile)
  const topCareer = careers[0]

  const userSkills = (profile.technicalSkills || []).map(s => s.name || s)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #047857 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a7f3d0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiFileText size={16} /> PROFILE-TAILORED ATS RESUME OPTIMIZER
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Resume Target: {topCareer?.title || 'Graduate Specialist'}
          </h1>
          <p style={{ margin: 0, color: '#ecfdf5', fontSize: 14 }}>
            Configured for <strong>{academic.fullHierarchyText}</strong> graduates applying to entry-level and corporate positions.
          </p>
        </div>
      </div>

      {/* Resume Card Preview */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          📄 Tailored Resume Summary & Key Competencies
        </h3>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: 14, borderRadius: 10, borderLeft: '3px solid #047857' }}>
          Proactive <strong>{academic.fullHierarchyText}</strong> graduate specializing in <strong>{topCareer?.title}</strong>. Experienced in {userSkills.slice(0, 4).join(', ') || 'core technical domain practices'}. Proven capability in building portfolio projects and applying analytical problem solving.
        </p>

        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
            Recommended Technical Skills to Highlight:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {topCareer?.requiredSkills.map((sk, idx) => (
              <span key={idx} style={{ background: userSkills.includes(sk) ? '#dcfce7' : '#fef3c7', color: userSkills.includes(sk) ? '#14532d' : '#78350f', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                {userSkills.includes(sk) ? `✓ ${sk}` : `• ${sk} (Recommended)`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
