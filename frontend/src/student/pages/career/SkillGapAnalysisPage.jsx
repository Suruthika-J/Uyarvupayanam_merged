import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCard, SSelect, SBtn, SBadge, AIGenerating, AIFailure } from '../../components/ui'
import {
  FiZap, FiCheckCircle, FiAlertCircle, FiPlusCircle,
  FiArrowRight, FiUser, FiTarget, FiTrendingUp, FiLayers, FiCompass,
  FiBookOpen, FiExternalLink, FiCheck, FiX, FiClock
} from 'react-icons/fi'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'
import axiosInstance from '../../../config/axios'

export default function SkillGapAnalysisPage() {
  const navigate = useNavigate()
  const { profile, setTargetCareer: updateGlobalTargetCareer, refetch } = useCollegeProfile()
  const { studentContext } = useStudentContext()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [readinessScore, setReadinessScore] = useState(0)
  const [skills, setSkills] = useState({ strong: [], developing: [], missing: [] })
  const [recommendedCareers, setRecommendedCareers] = useState([])
  const [allCareers, setAllCareers] = useState([])
  const [exploreAll, setExploreAll] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Skill Learning & Progress Tracking modal states
  const [selectedSkillModal, setSelectedSkillModal] = useState(null)
  const [acquiringSkill, setAcquiringSkill] = useState(false)
  const [acquisitionSuccess, setAcquisitionSuccess] = useState('')

  const fetchSkillGap = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get('/college-advisor/skill-gap')
      if (res.data?.success) {
        setTargetRole(res.data.targetCareer || studentContext?.targetCareer || 'Software Engineer')
        setReadinessScore(res.data.readinessScore || 0)
        setSkills(res.data.skills || { strong: [], developing: [], missing: [] })
        setRecommendedCareers(res.data.recommendedCareers || [])
        setAllCareers(res.data.allCareers || [])
      } else {
        setError('The skill-gap engine couldn’t evaluate your profile for this career.')
      }
    } catch (err) {
      console.warn('Failed to load live skill gap analysis:', err)
      setError('We couldn’t reach the skill-gap engine. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkillGap()
  }, [])

  const handleTargetRoleChange = async (newRole) => {
    if (!newRole) return
    setTargetRole(newRole)
    setUpdating(true)
    try {
      await updateGlobalTargetCareer(newRole)
      await fetchSkillGap()
    } catch (err) {
      console.warn('Failed to update target career:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleAcquireSkill = async (skillObj) => {
    if (!skillObj) return
    setAcquiringSkill(true)
    try {
      const res = await axiosInstance.post('/college-advisor/skill/acquire', {
        skillName: skillObj.name,
        careerTitle: targetRole
      })
      if (res.data?.success) {
        setAcquisitionSuccess(`✓ "${skillObj.name}" marked as acquired! Your technical competencies in Resume Builder, Learning Roadmap, and Study Planner have been updated.`)
        setSelectedSkillModal(null)
        if (refetch) refetch()
        await fetchSkillGap()
      }
    } catch (err) {
      alert('Failed to mark skill as acquired.')
    } finally {
      setAcquiringSkill(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 20 }}>
        <AIGenerating
          label="Evaluating your skill gap"
          sub="Comparing your acquired competencies against the required skills for your target career..."
        />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 20 }}>
        <AIFailure
          title="Couldn’t run your skill-gap analysis"
          message={error}
          onRetry={fetchSkillGap}
          retryLabel="Retry Analysis"
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER BAR */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> AI Skill Telemetry Gap Engine
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Target Career Skill Gap Analysis
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Compare your acquired competencies against required career skills (Core, Advanced, Optional).
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>
              {exploreAll ? 'Browsing All Careers' : 'Personalized Recommendations'}
            </span>
            <button
              type="button"
              onClick={() => setExploreAll(!exploreAll)}
              style={{
                background: 'none', border: 'none', color: 'var(--s-primary)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              {exploreAll ? 'Show Recommended Only' : 'Explore All Careers'}
            </button>
          </div>
          <SSelect
            label="Target Role Selection"
            value={targetRole}
            onChange={e => handleTargetRoleChange(e.target.value)}
            disabled={updating}
            options={
              (exploreAll ? allCareers : (recommendedCareers.length > 0 ? recommendedCareers : allCareers)).map(c => ({
                value: typeof c === 'string' ? c : c.careerName,
                label: typeof c === 'string' ? c : c.careerName
              }))
            }
          />
        </div>
      </div>

      {/* SUCCESS ALERT BANNER */}
      {acquisitionSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#065f46',
          fontWeight: 700,
          fontSize: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCheckCircle size={20} color="#059669" />
            <span>{acquisitionSuccess}</span>
          </div>
          <button
            onClick={() => setAcquisitionSuccess('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontSize: 20, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* PROFILE & READINESS SCORE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: 20, marginBottom: 28,
        boxShadow: '0 8px 24px rgba(4,120,87,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase' }}>
            Target Career Objective
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTarget /> {targetRole}
          </div>
          <div style={{ fontSize: 13, color: '#d1fae5', marginTop: 4 }}>
            Student Profile: <strong>{profile?.degreeProgramme || 'Degree Student'}</strong> ({profile?.domain || profile?.field || 'General'})
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px 24px', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#a7f3d0' }}>Target Readiness Score</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginTop: 2 }}>{readinessScore}%</div>
          <div style={{ fontSize: 11, color: '#d1fae5', fontWeight: 700 }}>Career Competency Match</div>
        </div>
      </div>

      {/* 3-COLUMN SKILL MATRIX */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginBottom: 28 }} className="s-grid-1col">

        {/* 1. STRONG SKILLS (ACQUIRED) */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #047857' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#047857' }}>
              <FiCheckCircle size={18} /> Strong Skills (Acquired)
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 10 }}>
              {skills.strong.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skills.strong.length > 0 ? skills.strong.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#d1fae5', color: '#047857', fontWeight: 700, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ {s.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>{s.type}</span>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: 'var(--s-text3)', padding: 10 }}>
                No core skills matched yet. Complete learning modules to build skills.
              </div>
            )}
          </div>
        </SCard>

        {/* 2. DEVELOPING SKILLS */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #b45309' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#b45309' }}>
              <FiAlertCircle size={18} /> Developing Skills
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 10 }}>
              {skills.developing.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {skills.developing.length > 0 ? skills.developing.map((s, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 14, background: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: 13, border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>⚡ {s.name}</span>
                  <span style={{ fontSize: 11, background: '#fde68a', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{s.type}</span>
                </div>
                {s.learningResource && (
                  <div style={{ fontSize: 12, color: '#78350f', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiBookOpen size={13} /> {s.learningResource.course} ({s.learningResource.provider})
                  </div>
                )}
                <button
                  onClick={() => setSelectedSkillModal(s)}
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#b45309',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <FiBookOpen size={13} /> Learn & Acquire
                </button>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: 'var(--s-text3)', padding: 10 }}>
                No developing skills flagged.
              </div>
            )}
          </div>
        </SCard>

        {/* 3. MISSING SKILLS */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #6d28d9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#6d28d9' }}>
              <FiPlusCircle size={18} /> Missing Skills (To Learn)
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 10 }}>
              {skills.missing.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {skills.missing.length > 0 ? skills.missing.map((s, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 14, background: '#ede9fe', color: '#5b21b6', fontWeight: 600, fontSize: 13, border: '1px solid #ddd6fe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>+ {s.name}</span>
                  <span style={{ fontSize: 11, background: '#ddd6fe', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{s.type}</span>
                </div>
                {s.learningResource && (
                  <div style={{ fontSize: 12, color: '#4c1d95', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiBookOpen size={13} /> {s.learningResource.course} ({s.learningResource.provider})
                  </div>
                )}
                <button
                  onClick={() => setSelectedSkillModal(s)}
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#6d28d9',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <FiBookOpen size={13} /> Learn & Acquire
                </button>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: '#047857', fontWeight: 700, padding: 10 }}>
                ✓ No skill gaps! All required skills acquired.
              </div>
            )}
          </div>
        </SCard>

      </div>

      {/* FOOTER CTA TO ROADMAP */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
            Bridge your skill gap with a structured Learning Roadmap
          </div>
          <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 2 }}>
            Access curated courses, certifications, hands-on projects, and interview preparation for {targetRole}.
          </div>
        </div>

        <SBtn variant="primary" onClick={() => navigate('/college/academic/roadmap')} style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14 }}>
          Proceed to Learning Roadmap <FiArrowRight style={{ marginLeft: 6 }} />
        </SBtn>
      </div>

      {/* RESOURCE & LEARNING TRACKING MODAL */}
      {selectedSkillModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            maxWidth: 580,
            width: '100%',
            padding: '28px 32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={() => setSelectedSkillModal(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'var(--s-bg2, #f3f4f6)',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <FiX size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#ede9fe',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiBookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#6d28d9' }}>
                  Skill Mastery & Resource Hub
                </div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--s-text, #111827)' }}>
                  {selectedSkillModal.name}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--s-text2, #4b5563)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Master this {selectedSkillModal.type || 'core'} competency to fulfill the requirements for <strong>{targetRole}</strong>. Once completed, your profile, resume, and study analytics will automatically sync.
            </p>

            {/* Recommended Learning Resource Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: 18,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                Curated Course / Material
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                {selectedSkillModal.learningResource?.course || `${selectedSkillModal.name} Mastery Course`}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <span>🏢 <strong>Provider:</strong> {selectedSkillModal.learningResource?.provider || 'NPTEL / Coursera'}</span>
                <span>⏱ <strong>Duration:</strong> {selectedSkillModal.learningResource?.duration || '4-6 Weeks'}</span>
              </div>

              {selectedSkillModal.learningResource?.url && (
                <a
                  href={selectedSkillModal.learningResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#2563eb',
                    textDecoration: 'none'
                  }}
                >
                  Open Course / Documentation Portal <FiExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => handleAcquireSkill(selectedSkillModal)}
                disabled={acquiringSkill}
                style={{
                  padding: '13px 20px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: acquiringSkill ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(5,150,105,0.25)'
                }}
              >
                <FiCheck size={16} />
                {acquiringSkill ? 'Updating Profile & Resume...' : '✓ Mark as Acquired (Sync to Profile & Resume)'}
              </button>

              <button
                onClick={() => {
                  const skillName = selectedSkillModal.name;
                  setSelectedSkillModal(null);
                  navigate(`/college/academic/planner?subject=${encodeURIComponent(skillName)}`);
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 14,
                  border: '1px solid var(--s-border, #e5e7eb)',
                  background: '#fff',
                  color: 'var(--s-text, #374151)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <FiClock size={15} /> Add to Weekly Study Planner Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
