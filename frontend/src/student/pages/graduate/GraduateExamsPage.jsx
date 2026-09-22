import React, { useState, useEffect } from 'react'
import {
  FiBook, FiAward, FiCalendar, FiClock, FiCheckSquare,
  FiExternalLink, FiSearch, FiLayers, FiShield, FiBriefcase, FiHelpCircle, FiZap
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedExamsGuide,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'
import GraduateExamImage from '../../components/common/GraduateExamImage'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduateExamsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for exams:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const examsGuide = generatePersonalizedExamsGuide(profile)

  const filteredExams = examsGuide.recommendedExams.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.category.toLowerCase().includes(search.toLowerCase()) ||
    ex.purpose.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiBook size={16} /> PROFILE-DRIVEN COMPETITIVE EXAMS ENGINE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Competitive Exam Pathways for {academic.degree} in {academic.domain}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
            Official exam portals, conducting bodies, and exam-specific preparation courses tailored for your profile.
          </p>
        </div>

        {/* Search */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiSearch color="#94a3b8" />
          <input
            type="text"
            placeholder="Search GATE, CAT, UPSC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 13.5, width: 180 }}
          />
        </div>
      </div>

      {/* Recommended Exams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {filteredExams.map((ex, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Exam Specific Visual */}
              <div style={{ marginBottom: 14 }}>
                <GraduateExamImage exam={ex} height={160} borderRadius={12} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: ex.isSelected ? '#d1fae5' : '#eff6ff', color: ex.isSelected ? '#047857' : '#2563eb' }}>
                  {ex.isSelected ? '✓ Selected in Profile' : ex.category}
                </span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{ex.frequency}</span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{ex.name}</h3>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 10 }}>
                Conducting Body: <strong style={{ color: '#0f172a' }}>{ex.conductingBody}</strong>
              </div>

              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                {ex.purpose}
              </p>

              {/* Recommendation Reason */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, fontSize: 12, color: '#334155', marginBottom: 14, borderLeft: '3px solid #2563eb' }}>
                <div style={{ fontWeight: 800, fontSize: 11, color: '#1e40af', textTransform: 'uppercase', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiHelpCircle size={12} /> Why this exam is recommended for you:
                </div>
                {ex.recommendationReason}
              </div>

              {/* Exam-Specific Preparation Courses */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiZap size={12} /> Exam Preparation Courses:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ex.prepCourseMetas?.map((prep, pIdx) => (
                    <div key={pIdx} style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <GraduateCourseImage course={{ title: prep.title }} height={80} borderRadius={6} showBadge={false} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginTop: 6, lineHeight: 1.3 }}>
                        {prep.title}
                      </div>
                      <Link to={prep.actionUrl} style={{ fontSize: 10.5, fontWeight: 800, color: '#2563eb', marginTop: 4, textDecoration: 'none' }}>
                        Start Course →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Link */}
            <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={ex.officialUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
              >
                View Official Exam Site ↗
              </a>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Verified Authority</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
