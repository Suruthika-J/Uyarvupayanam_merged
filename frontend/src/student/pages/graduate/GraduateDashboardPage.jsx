import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import graduateService from '../../../services/graduateService'
import { SBtn, SCard, SLoader, SAlert } from '../../components/ui'
import {
  FiBriefcase, FiZap, FiTarget, FiBook, FiAward, FiCheckSquare,
  FiArrowRight, FiTrendingUp, FiCheck, FiClock, FiStar, FiFileText,
  FiBarChart2, FiMessageSquare, FiAlertCircle, FiChevronRight
} from 'react-icons/fi'
import {
  calculateProfileCompletionScore,
  getEffectiveAcademicHierarchy,
  generatePersonalizedCareers,
  generatePersonalizedSkillGap,
  generatePersonalizedExamsGuide,
  generatePersonalizedHigherStudies
} from '../../services/graduatePersonalizationEngine'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduateDashboardPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState({})

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await graduateService.getDashboard()
        if (res.success) {
          setData(res)
        } else {
          setError('Failed to load dashboard data.')
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err)
        setError('Error connecting to graduate portal services.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const toggleTask = (idx) => {
    setTasksCompleted(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <SLoader label="Personalizing your Graduate Dashboard..." />
      </div>
    )
  }

  const profile = data?.profile || {}
  const completion = calculateProfileCompletionScore(profile)
  const academic = getEffectiveAcademicHierarchy(profile)
  const personalizedCareers = generatePersonalizedCareers(profile)
  const topCareer = personalizedCareers[0]
  const skillGap = generatePersonalizedSkillGap(profile, topCareer?.title)
  const examsGuide = generatePersonalizedExamsGuide(profile)
  const higherStudies = generatePersonalizedHigherStudies(profile)
  const readinessScore = data?.careerReadinessScore || Math.min(95, Math.max(45, completion.percentage + 10))

  const isProfileIncomplete = !profile.degree || !profile.domain

  return (
    <div className="s-anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── 1. WELCOME BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 24, padding: '32px 36px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 20, boxShadow: '0 10px 25px rgba(15,23,42,0.15)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
            <FiBriefcase size={13} /> GRADUATE CAREER PERSONALIZATION ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 900, margin: '0 0 8px', color: '#fff' }}>
            Welcome back, {student?.name || 'Graduate'}!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, maxWidth: 580 }}>
            {academic.fullHierarchyText} • Focused on <strong>{profile.primaryCareerDirection || 'Professional Placement'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/graduate/ai-advisor">
            <SBtn variant="primary" style={{ padding: '12px 24px', borderRadius: 12, background: '#2563eb', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiMessageSquare /> Ask AI Advisor
            </SBtn>
          </Link>
          <Link to="/graduate/profile">
            <button style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
              Update Profile ({completion.percentage}% Complete)
            </button>
          </Link>
        </div>
      </div>

      {error && <SAlert type="error">{error}</SAlert>}

      {/* Missing profile warning banner */}
      {isProfileIncomplete && (
        <div style={{
          background: '#fffbe3', border: '1px solid #fde047', borderRadius: 16, padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FiAlertCircle size={24} color="#d97706" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#92400e' }}>
                Complete your Graduate Onboarding
              </div>
              <div style={{ fontSize: 13, color: '#b45309' }}>
                Provide your major field, degree, domain, and skills to unlock precise profile-driven career recommendations.
              </div>
            </div>
          </div>
          <Link to="/graduate/onboarding">
            <SBtn variant="primary" style={{ background: '#d97706', padding: '8px 18px', fontSize: 13 }}>
              Complete Profile →
            </SBtn>
          </Link>
        </div>
      )}

      {/* ── 2. METRICS ROW: READINESS SCORE & TOP CAREER MATCH ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* Career Readiness Score Card */}
        <SCard style={{ borderRadius: 20, padding: 26, border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>
              Career Readiness Index
            </span>
            <span style={{ fontSize: 12, background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 20, fontWeight: 800 }}>
              Profile Evidence
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: `conic-gradient(#2563eb ${readinessScore * 3.6}deg, #e2e8f0 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: '#0f172a' }}>
                {readinessScore}%
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--s-text)', marginBottom: 4 }}>
                {readinessScore >= 75 ? 'Strong Placement Candidate' : readinessScore >= 55 ? 'Developing Candidate' : 'Foundation Building'}
              </div>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0, lineHeight: 1.4 }}>
                Calculated from your {academic.domain} qualification and logged skills.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--s-text2)' }}>
              Skills Logged: <strong>{(profile.technicalSkills || []).length} items</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--s-text2)' }}>
              Profile Score: <strong>{completion.percentage}% complete</strong>
            </div>
          </div>
        </SCard>

        {/* Primary Career Goal Card with Course Image */}
        <SCard style={{ borderRadius: 20, padding: 26, border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: 14 }}>
              <GraduateCourseImage course={topCareer} height={140} borderRadius={12} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>
                #1 Personalized Match
              </span>
              {topCareer && (
                <span style={{ fontSize: 12, background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: 20, fontWeight: 800 }}>
                  {topCareer.matchScore}% Match
                </span>
              )}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 6px' }}>
              {topCareer?.title || 'Software & Technology Specialist'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 12, lineHeight: 1.5 }}>
              {topCareer?.description || 'Aligns with your academic domain and professional preferences.'}
            </p>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, fontSize: 12, color: '#334155', marginBottom: 14, borderLeft: '3px solid #2563eb' }}>
              <strong>Why it matches:</strong> {topCareer?.whyItMatches}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--s-text3)' }}>
              Outlook: <strong style={{ color: '#047857' }}>{topCareer?.growthOutlook || 'High Demand'}</strong>
            </span>
            <Link to="/graduate/careers" style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Explore All Matches ({personalizedCareers.length}) <FiArrowRight size={14} />
            </Link>
          </div>
        </SCard>
      </div>

      {/* ── 3. SKILL GAP SUMMARY CHIPS ── */}
      <SCard style={{ borderRadius: 20, padding: 26, border: '1px solid var(--s-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: 'var(--s-text)' }}>
              ⚡ Personalized Skill Gap Benchmarking
            </h3>
            <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>
              Tailored skill requirements for your target <strong>{topCareer?.title}</strong> role.
            </p>
          </div>
          <Link to="/graduate/skill-gap" style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Detailed Gap Analysis <FiArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {/* Matching Skills */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 10 }}>
              ✓ Verified Candidate Strengths
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skillGap.strongSkills.length > 0 ? (
                skillGap.strongSkills.map((s, idx) => (
                  <span key={idx} style={{ background: '#dcfce7', color: '#14532d', padding: '4px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                    {s}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12, color: '#15803d' }}>Academic baseline established</span>
              )}
            </div>
          </div>

          {/* Missing Critical Skills */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e', marginBottom: 10 }}>
              🎯 Recommended Skills to Acquire
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skillGap.missingCriticalSkills.length > 0 ? (
                skillGap.missingCriticalSkills.map((s, idx) => (
                  <span key={idx} style={{ background: '#fef3c7', color: '#78350f', padding: '4px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                    • {s}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12, color: '#b45309' }}>Target skills aligned</span>
              )}
            </div>
          </div>
        </div>
      </SCard>

      {/* ── 4. CONDITIONAL MODULES: EXAMS & HIGHER STUDIES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Competitive Exams */}
        <SCard style={{ borderRadius: 20, padding: 24, border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBook style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--s-text)' }}>Competitive Exam Track</span>
            </div>
            <Link to="/graduate/exams" style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textDecoration: 'none' }}>
              View Exam Guide →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {examsGuide.recommendedExams.slice(0, 2).map((ex, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--s-text)' }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{ex.conductingBody}</div>
                </div>
                <a href={ex.officialUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>
                  Official Site ↗
                </a>
              </div>
            ))}
          </div>
        </SCard>

        {/* Higher Studies Module */}
        <SCard style={{ borderRadius: 20, padding: 24, border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAward style={{ color: '#047857' }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--s-text)' }}>Higher Studies Pathways</span>
            </div>
            <Link to="/graduate/higher-studies" style={{ fontSize: 12, fontWeight: 800, color: '#047857', textDecoration: 'none' }}>
              Explore Pathways →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {higherStudies.programmes.slice(0, 2).map((prog, idx) => (
              <div key={idx} style={{ background: '#f0fdf4', padding: 12, borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#166534' }}>🎓 {prog.title}</div>
                <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>{prog.whyRecommended}</div>
              </div>
            ))}
          </div>
        </SCard>
      </div>

      {/* ── 5. ACTION PLAN ── */}
      <SCard style={{ borderRadius: 20, padding: 26, border: '1px solid var(--s-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--s-text)' }}>
            📋 Priority Action Roadmap for {academic.domain}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--s-text3)' }}>Stay on track toward {topCareer?.title}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { task: `Complete initial learning module for ${skillGap.missingCriticalSkills[0] || 'core tool'}`, category: 'Skill Building' },
            { task: `Build Capstone Project 1 for ${topCareer?.title || 'portfolio'}`, category: 'Portfolio' },
            { task: `Review ${academic.domain} technical interview questions`, category: 'Interview Prep' },
            { task: `Update resume with metrics for ${topCareer?.title}`, category: 'Placement' }
          ].map((item, idx) => {
            const isDone = tasksCompleted[idx]
            return (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                style={{
                  background: isDone ? '#f0fdf4' : '#fff',
                  border: isDone ? '1px solid #86efac' : '1px solid var(--s-border)',
                  padding: 16, borderRadius: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: isDone ? '2px solid #16a34a' : '2px solid #cbd5e1',
                    background: isDone ? '#16a34a' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                  }}>
                    {isDone && <FiCheck size={14} />}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isDone ? '#15803d' : 'var(--s-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {item.task}
                  </span>
                </div>
                <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {item.category}
                </span>
              </div>
            )
          })}
        </div>
      </SCard>

    </div>
  )
}
