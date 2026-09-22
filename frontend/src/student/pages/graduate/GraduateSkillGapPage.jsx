import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  FiZap, FiCheckCircle, FiAlertTriangle, FiTarget,
  FiArrowRight, FiLayers, FiTrendingUp, FiTool, FiBookOpen, FiHelpCircle
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedCareers,
  generatePersonalizedSkillGap,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduateSkillGapPage() {
  const [searchParams] = useSearchParams()
  const urlTarget = searchParams.get('target')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [targetRole, setTargetRole] = useState(urlTarget || '')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) {
        setProfile(res.profile)
      }
    } catch (err) {
      console.error('Failed to load profile for skill gap:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const careers = generatePersonalizedCareers(profile)
  const defaultTarget = urlTarget || targetRole || careers[0]?.title || 'Software Specialist'

  const skillGap = generatePersonalizedSkillGap(profile, defaultTarget)
  const currentTarget = defaultTarget

  const handleTargetChange = (newTarget) => {
    setTargetRole(newTarget)
  }

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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiZap size={16} /> PROFILE-GROUNDED SKILL GAP BENCHMARKING
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Skill Gap for {currentTarget}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
            Tailored against your <strong>{academic.degree} in {academic.domain}</strong> background and verified candidate competencies.
          </p>
        </div>

        {/* Match Percentage Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Pathway Match</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: skillGap.matchScore >= 75 ? '#10b981' : '#38bdf8' }}>
              {skillGap.matchScore}%
            </div>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(#2563eb ${skillGap.matchScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
              Fit
            </div>
          </div>
        </div>
      </div>

      {/* Target Selector */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '16px 20px',
        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
          Select Target Pathway:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {careers.slice(0, 6).map((c) => {
            const isSelected = currentTarget.toLowerCase() === c.title.toLowerCase()
            return (
              <button
                key={c.title}
                onClick={() => handleTargetChange(c.title)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none',
                  background: isSelected ? '#2563eb' : '#f1f5f9',
                  color: isSelected ? '#fff' : '#475569',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {c.title} ({c.matchScore}%)
              </button>
            )
          })}
        </div>
      </div>

      {/* Why Target Matches Box */}
      <div style={{ background: '#eff6ff', padding: 16, borderRadius: 14, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 12 }}>
        <FiHelpCircle size={22} color="#1d4ed8" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1e40af', textTransform: 'uppercase' }}>
            Why am I seeing this pathway gap?
          </div>
          <div style={{ fontSize: 13.5, color: '#1e3a8a' }}>
            {skillGap.whyTargetMatches}
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>

        {/* Left Column: Skills You Possess */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCheckCircle size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Verified Candidate Strengths</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>From your profile evidence</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#ecfdf5', color: '#065f46', padding: '3px 10px', borderRadius: 20 }}>
              {skillGap.strongSkills.length} Core Strengths
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skillGap.strongSkills.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                No advanced skills logged yet.
                <div style={{ marginTop: 8 }}>
                  <Link to="/graduate/profile" style={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>
                    + Update Skills in Profile
                  </Link>
                </div>
              </div>
            ) : (
              skillGap.strongSkills.map((sk, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiCheckCircle size={15} color="#10b981" />
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{sk}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#ecfdf5', color: '#059669' }}>
                    Advanced
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Missing Critical Skills */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Missing Critical Skills to Learn</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Required for hiring qualification</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#fef2f2', color: '#991b1b', padding: '3px 10px', borderRadius: 20 }}>
              {skillGap.missingCriticalSkills.length} High Priority
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skillGap.missingCriticalSkills.map((sk, idx) => (
              <div key={idx} style={{
                padding: '12px 14px', borderRadius: 10, background: '#fffbeb',
                border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>
                  • {sk}
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 12, background: '#fef3c7', color: '#78350f', textTransform: 'uppercase' }}>
                  Target Gap
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recommended Learning Modules with Course Images */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24,
        border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiBookOpen size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Actionable Learning Modules for {currentTarget}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              Every skill gap leads directly to structured practice and project evidence with relevant course visual graphics.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
          {skillGap.learningModules.map((mod) => (
            <div key={mod.id} style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Course Visual */}
                <div style={{ marginBottom: 12 }}>
                  <GraduateCourseImage course={{ title: mod.resourceTitle, skill: mod.skill }} height={150} borderRadius={10} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 6 }}>
                    Module #{mod.step}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{mod.estimatedWeeks} Weeks</span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{mod.resourceTitle}</h4>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>{mod.whyRequired}</p>
              </div>

              <Link
                to={`/graduate/upskilling?skill=${encodeURIComponent(mod.skill)}`}
                style={{
                  textAlign: 'center', background: '#2563eb', color: '#fff',
                  textDecoration: 'none', padding: '10px 14px', borderRadius: 8,
                  fontWeight: 700, fontSize: 13, display: 'block'
                }}
              >
                {mod.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
