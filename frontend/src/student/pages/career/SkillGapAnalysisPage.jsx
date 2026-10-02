import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCard, SSelect, SBtn, SBadge, AIGenerating, AIFailure } from '../../components/ui'
import {
  FiZap, FiCheckCircle, FiAlertCircle, FiPlusCircle,
  FiArrowRight, FiUser, FiTarget, FiTrendingUp, FiLayers, FiCompass,
  FiBookOpen, FiExternalLink, FiCheck, FiX, FiClock,
  FiAward, FiRotateCcw, FiHelpCircle
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

  // Skill Learning & Assessment Modal states
  const [selectedSkillModal, setSelectedSkillModal] = useState(null)
  const [modalTab, setModalTab] = useState('overview') // 'overview' | 'assessment' | 'result'
  const [assessmentQuestions, setAssessmentQuestions] = useState([])
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [userAnswers, setUserAnswers] = useState({}) // { [qId]: optionIndex }
  const [evaluating, setEvaluating] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [acquisitionSuccess, setAcquisitionSuccess] = useState('')

  const fetchSkillGap = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get('/college-advisor/skill-gap')
      if (res.data?.success) {
        setTargetRole(res.data.targetCareer || profile?.domain || 'Artificial Intelligence & Machine Learning')
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

  const handleOpenSkillModal = (skillObj) => {
    setSelectedSkillModal(skillObj)
    setModalTab('overview')
    setAssessmentQuestions([])
    setUserAnswers({})
    setAssessmentResult(null)
  }

  const handleStartAssessment = async (skillObj) => {
    setModalTab('assessment')
    setAssessmentLoading(true)
    setUserAnswers({})
    setAssessmentResult(null)
    try {
      const res = await axiosInstance.get('/college-advisor/skill/assessment', {
        params: { skillName: skillObj.name, careerTitle: targetRole }
      })
      if (res.data?.success) {
        setAssessmentQuestions(res.data.questions || [])
      } else {
        alert('Failed to load assessment questions.')
        setModalTab('overview')
      }
    } catch (err) {
      console.error('Error fetching skill assessment:', err)
      alert('Failed to load assessment. Please try again.')
      setModalTab('overview')
    } finally {
      setAssessmentLoading(false)
    }
  }

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }))
  }

  const handleSubmitAssessment = async () => {
    if (!selectedSkillModal) return
    const answeredCount = Object.keys(userAnswers).length
    if (answeredCount < assessmentQuestions.length) {
      if (!window.confirm(`You have answered ${answeredCount} of ${assessmentQuestions.length} questions. Unanswered questions will be evaluated as incorrect. Do you want to submit?`)) {
        return
      }
    }

    setEvaluating(true)
    try {
      const res = await axiosInstance.post('/college-advisor/skill/verify', {
        skillName: selectedSkillModal.name,
        careerTitle: targetRole,
        answers: userAnswers
      })
      if (res.data?.success) {
        setAssessmentResult(res.data)
        setModalTab('result')
        if (res.data.passed) {
          setAcquisitionSuccess(`✓ "${selectedSkillModal.name}" certified with ${res.data.scorePercentage}%! Updated in your Profile, Resume Builder, and Roadmap.`)
          if (refetch) refetch()
          await fetchSkillGap()
        }
      } else {
        alert(res.data?.message || 'Assessment verification failed.')
      }
    } catch (err) {
      console.error('Error evaluating assessment:', err)
      alert('Failed to submit assessment.')
    } finally {
      setEvaluating(false)
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
                  onClick={() => handleOpenSkillModal(s)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#b45309',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(180,83,9,0.2)'
                  }}
                >
                  <FiAward size={14} /> Learn & Verify Competency
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
                  onClick={() => handleOpenSkillModal(s)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#6d28d9',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(109,40,217,0.2)'
                  }}
                >
                  <FiAward size={14} /> Learn & Verify Competency
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

      {/* RESOURCE & 5-QUESTION TECHNICAL VERIFICATION MODAL */}
      {selectedSkillModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            maxWidth: 680,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--s-border, #e5e7eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: modalTab === 'assessment' ? '#eef2ff' : (modalTab === 'result' ? (assessmentResult?.passed ? '#ecfdf5' : '#fef3c7') : '#ede9fe'),
                  color: modalTab === 'assessment' ? '#4f46e5' : (modalTab === 'result' ? (assessmentResult?.passed ? '#059669' : '#b45309') : '#6d28d9'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {modalTab === 'result' ? (
                    assessmentResult?.passed ? <FiCheckCircle size={22} /> : <FiAlertCircle size={22} />
                  ) : (
                    <FiAward size={22} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#6d28d9' }}>
                    {modalTab === 'overview' && 'Skill Resource Hub & Assessment'}
                    {modalTab === 'assessment' && 'Skill Verification Quiz (5 Questions)'}
                    {modalTab === 'result' && 'Assessment Evaluation & Certification'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--s-text, #111827)' }}>
                    {selectedSkillModal.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedSkillModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

              {/* ── TAB 1: OVERVIEW & LEARNING RESOURCE ── */}
              {modalTab === 'overview' && (
                <div>
                  <p style={{ fontSize: 14, color: 'var(--s-text2, #4b5563)', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                    Master this {selectedSkillModal.type || 'core'} competency to fulfill the requirements for <strong>{targetRole}</strong> ({profile?.degreeProgramme || 'Degree Student'}).
                  </p>

                  {/* Resource Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 20
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                      Curated Course / Material
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                      {selectedSkillModal.learningResource?.course || `${selectedSkillModal.name} Mastery Guide`}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                      <span>🏢 <strong>Provider:</strong> {selectedSkillModal.learningResource?.provider || 'NPTEL / Coursera'}</span>
                      <span>⏱ <strong>Duration:</strong> {selectedSkillModal.learningResource?.duration || '3-4 Weeks'}</span>
                    </div>
                    {selectedSkillModal.learningResource?.overview && (
                      <p style={{ fontSize: 13, color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                        {selectedSkillModal.learningResource.overview}
                      </p>
                    )}
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

                  {/* Verification Requirement Alert Box */}
                  <div style={{
                    background: '#eef2ff',
                    border: '1.5px solid #c7d2fe',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}>
                    <FiAward size={24} color="#4f46e5" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#312e81', marginBottom: 4 }}>
                        5-Question Domain Verification Assessment
                      </div>
                      <div style={{ fontSize: 12, color: '#4338ca', lineHeight: 1.5 }}>
                        To certify this skill as completed, you must score at least <strong>60% (3 out of 5 correct)</strong> on technical questions tailored to your discipline (<strong>{profile?.degreeProgramme || 'B.E.'}</strong>). Upon passing, your Profile, Resume Builder, and Roadmap will automatically update!
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                      onClick={() => handleStartAssessment(selectedSkillModal)}
                      style={{
                        padding: '14px 20px',
                        borderRadius: 14,
                        border: 'none',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
                      }}
                    >
                      <FiAward size={16} /> Take Skill Verification Quiz (5 Questions)
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
              )}

              {/* ── TAB 2: 5-QUESTION ASSESSMENT ── */}
              {modalTab === 'assessment' && (
                <div>
                  {assessmentLoading ? (
                    <AIGenerating
                      label="Loading 5 Domain Questions..."
                      sub={`Generating authentic questions for ${selectedSkillModal.name} in ${profile?.degreeProgramme || 'Engineering'}...`}
                    />
                  ) : (
                    <div>
                      <div style={{
                        background: '#f8fafc',
                        padding: '12px 16px',
                        borderRadius: 12,
                        marginBottom: 20,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                          Answer all 5 questions • Passing Score: 60%
                        </span>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 800,
                          background: Object.keys(userAnswers).length === assessmentQuestions.length ? '#d1fae5' : '#e0e7ff',
                          color: Object.keys(userAnswers).length === assessmentQuestions.length ? '#065f46' : '#3730a3',
                          padding: '3px 10px',
                          borderRadius: 10
                        }}>
                          {Object.keys(userAnswers).length} / {assessmentQuestions.length} Answered
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
                        {assessmentQuestions.map((q, qIdx) => (
                          <div key={q.id || qIdx} style={{
                            background: '#fff',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: 16,
                            padding: '16px 18px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
                                Question {qIdx + 1} • {q.topic || selectedSkillModal.name}
                              </span>
                            </div>

                            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                              {q.question}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {q.options.map((opt, optIdx) => {
                                const isSelected = userAnswers[q.id] === optIdx;
                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => handleSelectOption(q.id, optIdx)}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: 10,
                                      border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                      background: isSelected ? '#eef2ff' : '#f8fafc',
                                      color: isSelected ? '#312e81' : '#334155',
                                      fontWeight: isSelected ? 800 : 500,
                                      fontSize: 13,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 10,
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <span style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: '50%',
                                      border: isSelected ? '2px solid #4f46e5' : '1.5px solid #cbd5e1',
                                      background: isSelected ? '#4f46e5' : '#fff',
                                      color: isSelected ? '#fff' : '#64748b',
                                      fontSize: 11,
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Submit / Cancel Buttons */}
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          onClick={handleSubmitAssessment}
                          disabled={evaluating}
                          style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: 14,
                            border: 'none',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: evaluating ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            boxShadow: '0 4px 14px rgba(5,150,105,0.25)'
                          }}
                        >
                          <FiCheck size={16} />
                          {evaluating ? 'Evaluating Answers...' : 'Submit Assessment for Verification'}
                        </button>

                        <button
                          onClick={() => setModalTab('overview')}
                          disabled={evaluating}
                          style={{
                            padding: '12px 18px',
                            borderRadius: 14,
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#64748b',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          Back to Course
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: EVALUATION RESULTS & REVIEW ── */}
              {modalTab === 'result' && assessmentResult && (
                <div>
                  {/* Result Banner */}
                  <div style={{
                    background: assessmentResult.passed
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      : 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
                    color: '#fff',
                    borderRadius: 18,
                    padding: '20px 24px',
                    marginBottom: 20,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      {assessmentResult.passed ? <FiCheckCircle size={28} /> : <FiAlertCircle size={28} />}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>
                          {assessmentResult.passed ? 'Skill Certification Granted' : 'Verification Incomplete'}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900 }}>
                          {assessmentResult.scorePercentage}% Scored ({assessmentResult.correctCount} / {assessmentResult.totalQuestions} Correct)
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.95, lineHeight: 1.45 }}>
                      {assessmentResult.message}
                    </div>
                  </div>

                  {/* Question Review List */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
                      Assessment Question Breakdown:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {assessmentResult.review?.map((rev, rIdx) => (
                        <div key={rev.id || rIdx} style={{
                          background: rev.isCorrect ? '#f0fdf4' : '#fef2f2',
                          border: rev.isCorrect ? '1.5px solid #bbf7d0' : '1.5px solid #fecaca',
                          borderRadius: 14,
                          padding: '14px 16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: rev.isCorrect ? '#166534' : '#991b1b' }}>
                              Question {rIdx + 1}
                            </span>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              background: rev.isCorrect ? '#dcfce7' : '#fee2e2',
                              color: rev.isCorrect ? '#15803d' : '#b91c1c',
                              padding: '2px 8px',
                              borderRadius: 8
                            }}>
                              {rev.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.4 }}>
                            {rev.question}
                          </div>

                          <div style={{ fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: '#64748b' }}>Your Answer: </span>
                            <strong style={{ color: rev.isCorrect ? '#166534' : '#dc2626' }}>
                              {rev.userSelectedText}
                            </strong>
                          </div>

                          {!rev.isCorrect && (
                            <div style={{ fontSize: 12, marginBottom: 6 }}>
                              <span style={{ color: '#64748b' }}>Correct Answer: </span>
                              <strong style={{ color: '#166534' }}>{rev.correctText}</strong>
                            </div>
                          )}

                          <div style={{ fontSize: 11, color: '#475569', background: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: 8, marginTop: 6, lineHeight: 1.4 }}>
                            💡 <strong>Rationale:</strong> {rev.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {assessmentResult.passed ? (
                      <>
                        <button
                          onClick={() => setSelectedSkillModal(null)}
                          style={{
                            padding: '14px 20px',
                            borderRadius: 14,
                            border: 'none',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                          }}
                        >
                          <FiCheck size={16} /> Return to Skill Gap Analysis
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSkillModal(null);
                            navigate('/college/career/resume');
                          }}
                          style={{
                            padding: '12px 20px',
                            borderRadius: 14,
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          📄 View Verified Skill in Resume Builder
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartAssessment(selectedSkillModal)}
                          style={{
                            padding: '14px 20px',
                            borderRadius: 14,
                            border: 'none',
                            background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                          }}
                        >
                          <FiRotateCcw size={16} /> Re-take Verification Quiz
                        </button>
                        <button
                          onClick={() => setModalTab('overview')}
                          style={{
                            padding: '12px 20px',
                            borderRadius: 14,
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          📚 Review Course Material First
                        </button>
                      </>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
