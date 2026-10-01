import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { SCard, SSelect, SBtn, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import { FiCheckSquare, FiZap, FiHelpCircle, FiChevronDown, FiChevronUp, FiRefreshCw, FiArrowRight, FiCheck, FiFolder, FiTarget } from 'react-icons/fi'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'
import { useNavigate } from 'react-router-dom'

export default function InterviewPreparationPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const { studentContext } = useStudentContext()
  const [interviewType, setInterviewType] = useState('Technical')
  const defaultRole = studentContext?.targetCareer || profile?.targetCareer || profile?.careerInterests?.[0] || 'Software Developer'
  const [targetRole, setTargetRole] = useState(defaultRole)
  const [exploreAll, setExploreAll] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openAnswer, setOpenAnswer] = useState({})
  
  // Submission & Weak Area Sync state
  const [synced, setSynced] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Sync defaultRole if studentContext loads
  useEffect(() => {
    if (studentContext?.targetCareer && !targetRole) {
      setTargetRole(studentContext.targetCareer)
    }
  }, [studentContext?.targetCareer])

  const recommendedRoles = [
    studentContext?.targetCareer,
    ...(studentContext?.careerInterests || []),
    'Software Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Cloud / DevOps Engineer'
  ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)

  const allSystemRoles = [
    'Software Developer', 'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
    'AI Engineer', 'DevOps Engineer', 'Cybersecurity Analyst', 'Cloud Solutions Architect',
    'Robotics Engineer', 'Mechanical Design Engineer', 'Embedded Systems Engineer', 'VLSI Design Engineer',
    'Civil Structural Engineer', 'Biomedical Engineer', 'Product Manager'
  ]

  const activeRoles = exploreAll ? allSystemRoles : recommendedRoles

  const fetchQuestions = async () => {
    setLoading(true)
    setSynced(false)
    setError('')
    try {
      const res = await axiosInstance.post(
        '/study-tools/interview-prep',
        { interviewType, targetRole }
      )
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions)
        if (res.data.questions.length === 0) {
          setError('No questions could be generated for this combination. Try another role or round.')
        }
      } else {
        setError('The AI couldn’t generate questions for this combination.')
      }
    } catch (err) {
      console.warn('Failed to fetch interview prep questions')
      setError('We couldn’t reach the interview generator. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (targetRole) {
      fetchQuestions()
    }
  }, [interviewType, targetRole])

  const toggleAnswer = (qId) => {
    setOpenAnswer(prev => ({ ...prev, [qId]: !prev[qId] }))
  }

  const handleSyncWeakAreasToPlanner = async () => {
    setSubmitting(true)
    try {
      const weakAreas = questions.map(q => q.category).filter(Boolean)
      
      const res = await axiosInstance.post(
        '/study-tools/interview-prep/submit',
        { targetRole, score: 85, weakAreas }
      )
      if (res.data?.success) {
        setSynced(true)
      }
    } catch (err) {
      alert('Failed to sync weak areas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="s-anim-up">
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> Target Career Placement Simulator
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Target Career Interview Preparation
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Practice role-specific technical, behavioral, and project defense questions aligned to <strong>{targetRole}</strong>.
          </p>
        </div>

        <SBtn variant="primary" onClick={fetchQuestions} disabled={loading} style={{ borderRadius: 12 }}>
          <FiRefreshCw size={15} style={{ marginRight: 6 }} /> New Question Set
        </SBtn>
      </div>

      {/* ROLE & CATEGORY SELECTORS */}
      <SCard style={{ padding: 20, borderRadius: 16, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>
                {exploreAll ? 'All Industry Roles' : 'Recommended for You'}
              </span>
              <button
                type="button"
                onClick={() => setExploreAll(!exploreAll)}
                style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {exploreAll ? 'Show Recommended Only' : 'Explore All Roles'}
              </button>
            </div>
            <SSelect
              label="Target Placement Role"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              options={activeRoles.map(r => ({ value: r, label: r }))}
            />
          </div>

          <div style={{ paddingTop: 22 }}>
            <SSelect
              label="Interview Round Category"
              value={interviewType}
              onChange={e => setInterviewType(e.target.value)}
              options={[
                { value: 'Technical', label: 'Technical & Domain Questions' },
                { value: 'HR & Cultural', label: 'HR & Behavioral Questions' },
                { value: 'System Design', label: 'System Design & Architecture' }
              ]}
            />
          </div>
        </div>
      </SCard>

      {/* QUESTIONS RENDER */}
      {loading ? (
        <AIGenerating
          label={`Generating interview questions for ${targetRole}`}
          sub="Crafting role-specific technical, behavioral, and system design questions..."
        />
      ) : error ? (
        <AIFailure
          title="Couldn’t generate interview questions"
          message={error}
          onRetry={fetchQuestions}
          retryLabel="Retry Generation"
        />
      ) : questions.length === 0 ? (
        <SEmpty
          icon="🎤"
          title="No questions generated yet"
          desc="Pick a target role and interview round, then generate a fresh set of practice questions."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {questions.map((q, idx) => {
            const isOpen = openAnswer[q.id || idx]
            return (
              <SCard key={q.id || idx} style={{ padding: 24, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>
                      Question {idx + 1} • {q.category}
                    </span>
                    {q.category === 'Project Defense' && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: '#d1fae5', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        🚀 Profile Project Defense
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAnswer(q.id || idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                  >
                    {isOpen ? 'Hide Sample Answer ▲' : 'Reveal Sample Answer ▼'}
                  </button>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', marginBottom: 14 }}>
                  {q.question}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', marginBottom: 6 }}>
                      Key Concepts to Touch Upon:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {q.idealAnswerKeyPoints?.map((kp, kIdx) => (
                        <span key={kIdx} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#d1fae5', color: '#047857', fontWeight: 700 }}>
                          • {kp}
                        </span>
                      ))}
                    </div>
                    {q.sampleGoodAnswer && (
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.6 }}>
                        💡 <strong>Sample High-Score Answer:</strong> "{q.sampleGoodAnswer}"
                      </div>
                    )}
                  </div>
                )}
              </SCard>
            )
          })}

          {/* ACTION FOOTER */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>
                Feed Weak Areas to Study Planner & Skill Gap Engine
              </div>
              <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 2 }}>
                Automatically add flagged interview weak topics directly into your daily study schedule.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleSyncWeakAreasToPlanner}
                disabled={submitting || synced}
                style={{
                  background: synced ? '#047857' : 'var(--s-primary)', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {synced ? <><FiCheck size={14} /> Weak Topics Synced!</> : submitting ? 'Syncing...' : 'Sync Weak Areas to Planner'}
              </button>

              <SBtn variant="secondary" onClick={() => navigate('/college/academic/planner')}>
                Open Study Planner <FiArrowRight style={{ marginLeft: 4 }} />
              </SBtn>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
