import React, { useState, useEffect } from 'react'
import {
  FiAward, FiGlobe, FiBook, FiCheckCircle, FiDollarSign,
  FiCalendar, FiArrowRight, FiFileText, FiCompass, FiShield, FiHelpCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedHigherStudies,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduateHigherStudiesPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for higher studies:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const higherStudies = generatePersonalizedHigherStudies(profile)

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
        background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c7d2fe', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiAward size={16} /> PROFILE-DRIVEN HIGHER STUDIES ENGINE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Postgraduate Opportunities for {academic.degree} in {academic.domain}
          </h1>
          <p style={{ margin: 0, color: '#e0e7ff', fontSize: 14, lineHeight: 1.5 }}>
            Personalized Master's, MS Abroad, and research options aligned with your academic background.
          </p>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {higherStudies.programmes.map((prog, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 12 }}>
                <GraduateCourseImage course={prog.title} height={160} borderRadius={12} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#e0e7ff', color: '#3730a3' }}>
                {prog.duration} Program
              </span>
              <h3 style={{ margin: '8px 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                🎓 {prog.title}
              </h3>

              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 10 }}>
                Entrance Exams: <strong style={{ color: '#2563eb' }}>{prog.entranceExams}</strong>
              </div>

              <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12 }}>
                Top Institutions: <strong>{prog.institutes}</strong>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, fontSize: 12, color: '#334155', borderLeft: '3px solid #059669' }}>
                <FiHelpCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                <strong>Why Recommended:</strong> {prog.whyRecommended}
              </div>
            </div>

            <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/graduate/exams" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                View Exam Requirements →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
