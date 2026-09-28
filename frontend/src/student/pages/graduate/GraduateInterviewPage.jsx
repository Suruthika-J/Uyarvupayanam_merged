import React, { useState, useEffect } from 'react'
import {
  FiBarChart2, FiCheckCircle, FiChevronDown, FiChevronUp,
  FiClock, FiPlay, FiPause, FiRotateCcw, FiLayers, FiAlertCircle, FiHelpCircle
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedPlacement,
  generatePersonalizedCareers,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'

export default function GraduateInterviewPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [openId, setOpenId] = useState('q1')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for interview prep:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const careers = generatePersonalizedCareers(profile)
  const topCareer = careers[0]
  const placementInfo = generatePersonalizedPlacement(profile, topCareer?.title)

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
        background: 'linear-gradient(135deg, #0f172a 0%, #431407 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fed7aa', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiBarChart2 size={16} /> PROFILE-DRIVEN INTERVIEW PREPARATION
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Role Questions for {placementInfo.targetRole}
          </h1>
          <p style={{ margin: 0, color: '#ffedd5', fontSize: 14 }}>
            Tailored technical, tool, and domain questions for <strong>{academic.fullHierarchyText}</strong> candidates.
          </p>
        </div>
      </div>

      {/* Questions Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {placementInfo.interviewQuestions.map((q) => {
          const isOpen = openId === q.id
          return (
            <div key={q.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div
                onClick={() => setOpenId(isOpen ? null : q.id)}
                style={{ padding: 18, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isOpen ? '#f8fafc' : '#fff' }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#c2410c', background: '#ffedd5', padding: '2px 8px', borderRadius: 6, marginRight: 8 }}>
                    {q.category}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{q.question}</span>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </div>

              {isOpen && (
                <div style={{ padding: 18, paddingTop: 0, borderTop: '1px solid #f1f5f9', marginTop: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: '#0369a1', textTransform: 'uppercase', marginBottom: 4 }}>
                    Sample Structured Answer:
                  </div>
                  <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, background: '#f0f9ff', padding: 14, borderRadius: 10 }}>
                    {q.sampleAnswer}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
