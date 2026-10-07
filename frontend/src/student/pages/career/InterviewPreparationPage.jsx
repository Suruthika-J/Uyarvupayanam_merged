import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { SCard, SSelect, SBtn, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import {
  FiZap, FiSearch, FiCheckCircle, FiAlertCircle, FiInfo, FiExternalLink,
  FiBookOpen, FiHelpCircle, FiCpu, FiAward, FiArrowRight, FiCheck, FiRefreshCw,
  FiUserCheck, FiTarget, FiMessageSquare, FiList, FiTrendingUp, FiBookmark, FiRepeat, FiX
} from 'react-icons/fi'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'
import { useNavigate } from 'react-router-dom'

export default function InterviewPreparationPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const { studentContext } = useStudentContext()

  // Recommended domain & suggested role calculation
  const recommendedDomain = studentContext?.targetCareer || profile?.targetCareer || profile?.careerInterests?.[0] || 'Full Stack Web & Mobile Development'
  
  // State inputs
  const [companyName, setCompanyName] = useState('Amazon')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [hiringType, setHiringType] = useState('Full-Time')
  
  // Research & Navigation State
  const [researchData, setResearchData] = useState(null)
  const [loadingResearch, setLoadingResearch] = useState(false)
  const [researchError, setResearchError] = useState('')
  const [activeTab, setActiveTab] = useState('intelligence') // intelligence | reported | ai_practice | mock

  // Reported Questions State
  const [selectedYear, setSelectedYear] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [reportedIndex, setReportedIndex] = useState(0)
  const [showReportedHint, setShowReportedHint] = useState(false)

  // AI Practice Session State
  const [practiceConfig, setPracticeConfig] = useState({
    questionCount: 5,
    difficulty: 'Medium',
    category: 'Technical'
  })
  const [practiceQuestions, setPracticeQuestions] = useState([])
  const [loadingPractice, setLoadingPractice] = useState(false)
  const [practiceActive, setPracticeActive] = useState(false)
  const [currentPracticeIdx, setCurrentPracticeIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submittedAnswer, setSubmittedAnswer] = useState(false)
  const [practiceScore, setPracticeScore] = useState(0)
  const [practiceFinished, setPracticeFinished] = useState(false)
  const [syncedPlanner, setSyncedPlanner] = useState(false)
  const [syncingPlanner, setSyncingPlanner] = useState(false)

  // Mock Interview State
  const [mockActive, setMockActive] = useState(false)
  const [mockMessages, setMockMessages] = useState([])
  const [mockInput, setMockInput] = useState('')
  const [loadingMock, setLoadingMock] = useState(false)
  const [mockTurn, setMockTurn] = useState(1)

  // Suggest default role based on domain
  useEffect(() => {
    if (recommendedDomain && (!targetRole || targetRole === 'Software Engineer')) {
      if (recommendedDomain.toLowerCase().includes('data')) {
        setTargetRole('Data Scientist')
      } else if (recommendedDomain.toLowerCase().includes('cloud') || recommendedDomain.toLowerCase().includes('devops')) {
        setTargetRole('Cloud / DevOps Engineer')
      } else if (recommendedDomain.toLowerCase().includes('ai') || recommendedDomain.toLowerCase().includes('machine learning')) {
        setTargetRole('Machine Learning Engineer')
      } else {
        setTargetRole('Software Engineer')
      }
    }
  }, [recommendedDomain])

  // Perform Research
  const handleResearchCompany = async () => {
    if (!companyName.trim()) return
    setLoadingResearch(true)
    setResearchError('')
    setPracticeActive(false)
    setMockActive(false)

    try {
      const res = await axiosInstance.post('/interview-prep/research', {
        companyName,
        role: targetRole,
        hiringType
      })

      if (res.data?.success) {
        setResearchData(res.data)
        setActiveTab('intelligence')
      } else {
        setResearchError(res.data?.message || 'Failed to retrieve company interview intelligence.')
      }
    } catch (err) {
      console.error('Company research failed:', err)
      setResearchError('Could not reach the interview research engine. Please try again.')
    } finally {
      setLoadingResearch(false)
    }
  }

  // Initial research on mount
  useEffect(() => {
    handleResearchCompany()
  }, [])

  // Start AI Practice Session
  const handleStartAiPractice = async () => {
    setLoadingPractice(true)
    setPracticeFinished(false)
    setSyncedPlanner(false)
    setCurrentPracticeIdx(0)
    setSelectedOption(null)
    setSubmittedAnswer(false)
    setPracticeScore(0)

    try {
      const res = await axiosInstance.post('/interview-prep/generate-practice', {
        companyName: researchData?.company || companyName,
        role: targetRole,
        hiringType,
        difficulty: practiceConfig.difficulty,
        category: practiceConfig.category,
        questionCount: practiceConfig.questionCount
      })

      if (res.data?.success && Array.isArray(res.data.questions)) {
        setPracticeQuestions(res.data.questions)
        setPracticeActive(true)
      } else {
        alert('Could not generate practice questions. Try another category.')
      }
    } catch (err) {
      console.error('Error generating practice questions:', err)
      alert('Failed to generate practice questions.')
    } finally {
      setLoadingPractice(false)
    }
  }

  // Submit MCQ Answer
  const handleSubmitOption = () => {
    if (selectedOption === null) return
    setSubmittedAnswer(true)
    const currentQ = practiceQuestions[currentPracticeIdx]
    if (selectedOption === currentQ.correctAnswerIndex) {
      setPracticeScore(prev => prev + 1)
    }
  }

  // Next MCQ Question
  const handleNextPracticeQuestion = () => {
    if (currentPracticeIdx + 1 < practiceQuestions.length) {
      setCurrentPracticeIdx(prev => prev + 1)
      setSelectedOption(null)
      setSubmittedAnswer(false)
    } else {
      setPracticeFinished(true)
    }
  }

  // Sync Weak Areas to Planner
  const handleSyncToPlanner = async () => {
    setSyncingPlanner(true)
    try {
      const weakAreas = practiceQuestions.map(q => q.patternTested || q.category).filter(Boolean)
      const res = await axiosInstance.post('/interview-prep/submit', {
        targetRole,
        score: Math.round((practiceScore / practiceQuestions.length) * 100),
        weakAreas
      })
      if (res.data?.success) {
        setSyncedPlanner(true)
      }
    } catch (err) {
      alert('Failed to sync weak topics to planner.')
    } finally {
      setSyncingPlanner(false)
    }
  }

  // Start AI Mock Interview
  const handleStartMockInterview = async () => {
    setLoadingMock(true)
    setMockActive(true)
    setMockTurn(1)
    try {
      const res = await axiosInstance.post('/interview-prep/mock-interview/start', {
        companyName: researchData?.company || companyName,
        role: targetRole,
        hiringType
      })
      if (res.data?.success) {
        setMockMessages([
          { sender: 'interviewer', text: res.data.question }
        ])
      }
    } catch (err) {
      alert('Failed to start mock interview.')
    } finally {
      setLoadingMock(false)
    }
  }

  // Send Mock Response
  const handleSendMockResponse = async () => {
    if (!mockInput.trim() || loadingMock) return
    const userText = mockInput
    setMockInput('')
    setMockMessages(prev => [...prev, { sender: 'candidate', text: userText }])
    setLoadingMock(true)

    try {
      const res = await axiosInstance.post('/interview-prep/mock-interview/respond', {
        companyName: researchData?.company || companyName,
        role: targetRole,
        userResponse: userText,
        turn: mockTurn
      })

      if (res.data?.success) {
        setMockMessages(prev => [
          ...prev,
          { sender: 'feedback', text: res.data.feedback },
          { sender: 'interviewer', text: res.data.nextQuestion }
        ])
        setMockTurn(res.data.turn)
      }
    } catch (err) {
      console.error('Error sending mock response:', err)
    } finally {
      setLoadingMock(false)
    }
  }

  // Filter Reported Questions
  const rawReportedQuestions = researchData?.reportedQuestions || []
  const filteredReportedQuestions = rawReportedQuestions.filter(q => {
    const matchesYear = selectedYear === 'ALL' || (q.reportedDate && q.reportedDate.includes(selectedYear))
    const matchesCategory = selectedCategory === 'ALL' || q.category === selectedCategory
    return matchesYear && matchesCategory
  })

  const popularCompanies = ['Amazon', 'Microsoft', 'Google', 'TCS', 'Infosys', 'Accenture', 'Zoho', 'Freshworks', 'Wipro', 'Cognizant']

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }} className="s-anim-up">
      {/* ════════════════════════════════════════════════════════
          HERO BANNER & PRIMARY SETUP INPUTS
          ════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', color: '#6d28d9',
          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
        }}>
          <FiTarget size={15} /> 🎯 Company Interview Intelligence
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Company-Based Interview Preparation
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '6px 0 0', lineHeight: 1.5 }}>
          Research official hiring processes, explore candidate-reported questions, and practice with AI questions based on real company patterns.
        </p>
      </div>

      {/* SEARCH BAR & SETUP CARD */}
      <SCard style={{ padding: 22, borderRadius: 20, marginBottom: 28, border: '1px solid var(--s-border)' }}>
        {/* Recommended Domain Callout */}
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px',
          fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16
        }}>
          <span style={{ color: '#475569', fontWeight: 600 }}>
            Recommended Domain: <strong style={{ color: 'var(--s-primary)' }}>{recommendedDomain}</strong>
          </span>
          <span style={{ color: '#64748b', fontSize: 11 }}>
            Suggested Role: <strong>{targetRole}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr auto', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 6 }}>
              Enter Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Amazon, TCS, Zoho..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--s-border)',
                fontSize: 14, fontWeight: 700, outline: 'none', background: '#fff'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 6 }}>
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--s-border)',
                fontSize: 14, fontWeight: 700, outline: 'none', background: '#fff'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 6 }}>
              Hiring Type
            </label>
            <select
              value={hiringType}
              onChange={e => setHiringType(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--s-border)',
                fontSize: 13, fontWeight: 700, outline: 'none', background: '#fff'
              }}
            >
              <option value="Campus">Campus</option>
              <option value="Internship">Internship</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Experienced">Experienced</option>
              <option value="Not Sure">Not Sure</option>
            </select>
          </div>

          <SBtn
            variant="primary"
            onClick={handleResearchCompany}
            disabled={loadingResearch || !companyName.trim()}
            style={{ borderRadius: 12, height: 42, padding: '0 20px', fontWeight: 800 }}
          >
            {loadingResearch ? <FiRefreshCw className="s-spin" size={16} /> : <><FiSearch size={16} style={{ marginRight: 6 }} /> Research Company</>}
          </SBtn>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-text3)' }}>Popular Companies:</span>
          {popularCompanies.map(comp => (
            <button
              key={comp}
              type="button"
              onClick={() => { setCompanyName(comp); handleResearchCompany(); }}
              style={{
                background: companyName.toLowerCase() === comp.toLowerCase() ? '#ede9fe' : '#f1f5f9',
                color: companyName.toLowerCase() === comp.toLowerCase() ? '#6d28d9' : '#334155',
                border: companyName.toLowerCase() === comp.toLowerCase() ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
                padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700, cursor: 'pointer'
              }}
            >
              {comp}
            </button>
          ))}
        </div>
      </SCard>

      {/* ════════════════════════════════════════════════════════
          RESEARCH LOADING / ERROR STATES
          ════════════════════════════════════════════════════════ */}
      {loadingResearch ? (
        <AIGenerating
          label={`Searching public sources for ${companyName} (${targetRole})`}
          sub="Classifying official company guidelines, extracting candidate interview experiences, and normalizing selection rounds..."
        />
      ) : researchError ? (
        <AIFailure
          title="Couldn't research company interview information"
          message={researchError}
          onRetry={handleResearchCompany}
          retryLabel="Retry Research"
        />
      ) : researchData ? (
        <>
          {/* ════════════════════════════════════════════════════════
              COMPANY INTELLIGENCE HEADER CARD & NAVIGATION TABS
              ════════════════════════════════════════════════════════ */}
          <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 20, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    {researchData.company?.toUpperCase()}
                  </h2>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: '#f1f5f9', color: '#475569', fontWeight: 800 }}>
                    {researchData.role} • {researchData.hiringType}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>
                  Research Updated: <strong>October 2026</strong>
                </div>
              </div>

              {/* Research Confidence Badge */}
              <div style={{
                background: researchData.researchConfidence === 'HIGH' ? '#f0fdf4' : researchData.researchConfidence === 'MEDIUM' ? '#fffbeb' : '#fef2f2',
                border: `1px solid ${researchData.researchConfidence === 'HIGH' ? '#bbf7d0' : researchData.researchConfidence === 'MEDIUM' ? '#fef3c7' : '#fecaca'}`,
                padding: '8px 16px', borderRadius: 14, textAlign: 'right'
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                  color: researchData.researchConfidence === 'HIGH' ? '#15803d' : researchData.researchConfidence === 'MEDIUM' ? '#b45309' : '#b91c1c'
                }}>
                  Research Confidence: {researchData.researchConfidence}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, maxWidth: 260 }}>
                  {researchData.confidenceReason || 'Calculated from source evidence and candidate agreement.'}
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, borderBottom: '1px solid var(--s-border)', paddingBottom: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('intelligence')}
                style={{
                  padding: '8px 18px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  background: activeTab === 'intelligence' ? 'var(--s-primary)' : 'transparent',
                  color: activeTab === 'intelligence' ? '#fff' : 'var(--s-text2)'
                }}
              >
                🏢 Interview Intelligence & Rounds
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reported')}
                style={{
                  padding: '8px 18px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  background: activeTab === 'reported' ? 'var(--s-primary)' : 'transparent',
                  color: activeTab === 'reported' ? '#fff' : 'var(--s-text2)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                📌 Reported Questions ({rawReportedQuestions.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai_practice')}
                style={{
                  padding: '8px 18px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  background: activeTab === 'ai_practice' ? 'var(--s-primary)' : 'transparent',
                  color: activeTab === 'ai_practice' ? '#fff' : 'var(--s-text2)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                🤖 AI Practice Session
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mock')}
                style={{
                  padding: '8px 18px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  background: activeTab === 'mock' ? 'var(--s-primary)' : 'transparent',
                  color: activeTab === 'mock' ? '#fff' : 'var(--s-text2)'
                }}
              >
                🎙️ AI Mock Interview
              </button>
            </div>
          </SCard>

          {/* ════════════════════════════════════════════════════════
              TAB 1: INTERVIEW INTELLIGENCE & ROUNDS
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'intelligence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* SOURCE CLASSIFICATION SECTIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Official Sources Card */}
                <SCard style={{ padding: 20, borderRadius: 16, border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#15803d', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCheckCircle size={15} /> Official Company Information
                  </div>
                  {researchData.officialSources?.length > 0 ? (
                    researchData.officialSources.map((src, idx) => (
                      <div key={idx} style={{ marginBottom: 10, background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #dcfce7' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>{src.sourceTitle}</div>
                        <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>{src.website} • {src.date}</div>
                        {src.snippet && <div style={{ fontSize: 11.5, color: '#334155', marginTop: 4 }}>"{src.snippet}"</div>}
                        {src.url && (
                          <a href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            Visit official source <FiExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#15803d' }}>No explicit official career page data extracted for this specific search.</div>
                  )}
                </SCard>

                {/* Candidate Reported Sources Card */}
                <SCard style={{ padding: 20, borderRadius: 16, border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiUserCheck size={15} color="var(--s-primary)" /> Candidate-Reported Experiences
                  </div>
                  {researchData.candidateSources?.length > 0 ? (
                    researchData.candidateSources.map((src, idx) => (
                      <div key={idx} style={{ marginBottom: 10, background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{src.sourceTitle}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Source: {src.website} ({src.date})</div>
                        {src.snippet && <div style={{ fontSize: 11.5, color: '#334155', marginTop: 4 }}>"{src.snippet}"</div>}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#64748b' }}>Limited candidate interview reports available.</div>
                  )}
                </SCard>
              </div>

              {/* REPORTED INTERVIEW PROCESS TIMELINE */}
              <SCard style={{ padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiList size={18} color="var(--s-primary)" /> Reported Selection Process & Rounds
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {researchData.rounds?.map((rnd, idx) => (
                    <div key={idx} style={{
                      display: 'flex', gap: 16, background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid var(--s-border)'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 18, background: 'var(--s-primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0
                      }}>
                        {rnd.roundNumber}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)' }}>{rnd.roundName}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 8,
                            background: rnd.sourceType === 'official' ? '#d1fae5' : '#ede9fe',
                            color: rnd.sourceType === 'official' ? '#047857' : '#6d28d9',
                            textTransform: 'uppercase'
                          }}>
                            {rnd.sourceType === 'official' ? 'Official' : 'Candidate Reported'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--s-text2)', margin: '0 0 6px', lineHeight: 1.5 }}>
                          {rnd.description}
                        </p>
                        {rnd.evidenceText && (
                          <div style={{ fontSize: 11, color: 'var(--s-text3)', fontStyle: 'italic' }}>
                            Evidence: {rnd.evidenceText}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONFLICTING REPORTS / VARIATIONS */}
                {researchData.reportedVariations?.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--s-border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--s-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiRepeat size={14} color="#b45309" /> Reported Process Variations & Batch Differences
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {researchData.reportedVariations.map((v, vIdx) => (
                        <div key={vIdx} style={{ fontSize: 12, background: '#fffbeb', padding: 10, borderRadius: 10, border: '1px solid #fef3c7', color: '#92400e' }}>
                          <strong>{v.variationName}</strong> ({v.reportedCount} reported experiences):
                          <span style={{ marginLeft: 6, fontWeight: 700 }}>
                            {v.rounds?.join(' → ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MANDATORY DISCLAIMER */}
                <div style={{
                  marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 12,
                  fontSize: 12, color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <FiInfo size={16} flexShrink={0} />
                  <span><strong>Important Note:</strong> Interview processes vary by role, location, hiring channel, and recruitment cycle.</span>
                </div>
              </SCard>

              {/* MOST REPORTED TOPICS BREAKDOWN */}
              <SCard style={{ padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiTrendingUp size={18} color="var(--s-primary)" /> Observed Topic Patterns & Weightage
                </h3>

                {researchData.researchConfidence === 'LOW' && (
                  <div style={{ fontSize: 12, color: '#b45309', background: '#fffbeb', padding: 10, borderRadius: 10, marginBottom: 14, fontWeight: 700 }}>
                    ⚠️ Limited evidence — pattern confidence is low.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {researchData.topicPatterns?.map((tp, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginBottom: 4 }}>
                        <span>{tp.topic}</span>
                        <span style={{ color: 'var(--s-primary)' }}>{tp.percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: 10, borderRadius: 5, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ width: `${tp.percentage}%`, height: '100%', background: 'var(--s-primary)', borderRadius: 5, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SCard>

              {/* ACTION CALLOUT */}
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff',
                padding: 24, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900 }}>Ready to start preparation for {researchData.company}?</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                    Practice actual reported questions or generate fresh AI questions based on this company's interview patterns.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <SBtn variant="secondary" onClick={() => setActiveTab('reported')}>
                    Practice Reported Questions
                  </SBtn>
                  <SBtn variant="primary" onClick={() => setActiveTab('ai_practice')}>
                    Generate AI Practice Questions <FiArrowRight style={{ marginLeft: 6 }} />
                  </SBtn>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 2: REPORTED QUESTIONS MODE (PRACTICE REPORTED QUESTIONS)
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'reported' && (
            <div>
              <SCard style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: 'var(--s-text)' }}>
                      Actual Public Candidate-Reported Questions
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                      Showing actual questions reported by candidates in public interview experiences.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 12, fontWeight: 700 }}
                    >
                      <option value="ALL">All Reported Years</option>
                      <option value="2026">2026 Reported</option>
                      <option value="2025">2025 Reported</option>
                      <option value="2024">2024 Reported</option>
                    </select>

                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 12, fontWeight: 700 }}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Technical">Technical</option>
                      <option value="DSA">DSA</option>
                      <option value="Coding">Coding</option>
                      <option value="SQL">SQL</option>
                      <option value="Projects">Projects</option>
                      <option value="System Design">System Design</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                </div>
              </SCard>

              {filteredReportedQuestions.length === 0 ? (
                <SEmpty
                  icon="📌"
                  title="No publicly reported interview questions were found"
                  desc={`No publicly reported interview questions were found for ${researchData.company} + ${targetRole} under the selected filters.`}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredReportedQuestions.map((q, idx) => (
                    <SCard key={idx} style={{ padding: 22, borderRadius: 18, border: '1px solid var(--s-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 10, background: '#ede9fe', color: '#6d28d9', textTransform: 'uppercase' }}>
                          📌 REPORTED QUESTION • {q.category}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--s-text3)', fontWeight: 700 }}>
                          Reported: {q.reportedDate || '2025'}
                        </span>
                      </div>

                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', marginBottom: 12, lineHeight: 1.5 }}>
                        "{q.questionText}"
                      </div>

                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
                        <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                          Source: {q.sourceWebsite || 'Glassdoor / GeeksforGeeks Candidate Experience'}
                        </div>
                        {q.sampleAnswerHint && (
                          <div style={{ color: '#047857', fontWeight: 600, marginTop: 4 }}>
                            💡 <strong>Answer Key Concepts:</strong> {q.sampleAnswerHint}
                          </div>
                        )}
                        {q.sourceUrl && (
                          <a href={q.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--s-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            Source link <FiExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </SCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 3: AI PRACTICE SESSION (GENERATE COMPANY PRACTICE)
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'ai_practice' && (
            <div>
              {!practiceActive ? (
                <SCard style={{ padding: 28, borderRadius: 20, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    Generate Company Practice Questions
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 6, lineHeight: 1.5 }}>
                    Generate brand new multiple-choice practice questions specifically engineered from <strong>{researchData.company}</strong>'s observed interview patterns.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '24px 0', textAlign: 'left' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>Questions</label>
                      <select
                        value={practiceConfig.questionCount}
                        onChange={e => setPracticeConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
                      >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>Difficulty</label>
                      <select
                        value={practiceConfig.difficulty}
                        onChange={e => setPracticeConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>Category Focus</label>
                      <select
                        value={practiceConfig.category}
                        onChange={e => setPracticeConfig(prev => ({ ...prev, category: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Coding">Coding</option>
                        <option value="DSA">DSA</option>
                        <option value="Projects">Projects</option>
                        <option value="Behavioral">Behavioral</option>
                      </select>
                    </div>
                  </div>

                  <SBtn
                    variant="primary"
                    onClick={handleStartAiPractice}
                    disabled={loadingPractice}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 900, fontSize: 14 }}
                  >
                    {loadingPractice ? <FiRefreshCw className="s-spin" size={16} /> : `Generate ${practiceConfig.questionCount} Company Practice Questions`}
                  </SBtn>
                </SCard>
              ) : practiceFinished ? (
                /* PRACTICE RESULTS SUMMARY */
                <SCard style={{ padding: 32, borderRadius: 20, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ fontSize: 42, marginBottom: 10 }}>🎉</div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    {researchData.company} Practice Complete!
                  </h3>
                  <div style={{ fontSize: 14, color: 'var(--s-text3)', marginTop: 4 }}>
                    Score: <strong>{practiceScore} / {practiceQuestions.length}</strong> ({Math.round((practiceScore / practiceQuestions.length) * 100)}%)
                  </div>

                  <div style={{ margin: '24px 0', padding: 16, background: '#f8fafc', borderRadius: 14, textAlign: 'left', border: '1px solid var(--s-border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--s-text)', marginBottom: 8 }}>
                      Topic Pattern Sync
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--s-text2)', margin: 0, lineHeight: 1.5 }}>
                      Automatically feed missed topics directly into your daily study schedule and skill gap analyzer.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={handleSyncToPlanner}
                      disabled={syncingPlanner || syncedPlanner}
                      style={{
                        background: syncedPlanner ? '#047857' : 'var(--s-primary)', color: '#fff', border: 'none',
                        padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      {syncedPlanner ? <><FiCheck size={14} /> Synced to Study Planner</> : syncingPlanner ? 'Syncing...' : 'Sync Weak Areas to Planner'}
                    </button>

                    <SBtn variant="secondary" onClick={() => setPracticeActive(false)}>
                      New Practice Session
                    </SBtn>
                  </div>
                </SCard>
              ) : (
                /* ONE QUESTION AT A TIME MCQ QUIZ VIEW */
                <SCard style={{ padding: 28, borderRadius: 20, maxWidth: 760, margin: '0 auto' }}>
                  {/* MCQ Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--s-primary)' }}>
                        {researchData.company.toUpperCase()} INTERVIEW PRACTICE • Question {currentPracticeIdx + 1} of {practiceQuestions.length}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 12,
                      background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0'
                    }}>
                      🤖 AI-GENERATED PRACTICE
                    </span>
                  </div>

                  {/* Pattern Source Label */}
                  <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginBottom: 16 }}>
                    {practiceQuestions[currentPracticeIdx]?.patternSource || `Based on reported ${practiceConfig.category} interview patterns.`}
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--s-text)', marginBottom: 20, lineHeight: 1.5 }}>
                    {practiceQuestions[currentPracticeIdx]?.question}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {practiceQuestions[currentPracticeIdx]?.options?.map((opt, oIdx) => {
                      const isSelected = selectedOption === oIdx
                      const isCorrect = oIdx === practiceQuestions[currentPracticeIdx].correctAnswerIndex

                      let bg = '#fff'
                      let border = '1.5px solid var(--s-border)'
                      let textColor = 'var(--s-text)'

                      if (submittedAnswer) {
                        if (isCorrect) {
                          bg = '#f0fdf4'
                          border = '2px solid #22c55e'
                          textColor = '#15803d'
                        } else if (isSelected) {
                          bg = '#fef2f2'
                          border = '2px solid #ef4444'
                          textColor = '#b91c1c'
                        }
                      } else if (isSelected) {
                        bg = '#f3e8ff'
                        border = '2px solid #8b5cf6'
                        textColor = '#6d28d9'
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={submittedAnswer}
                          onClick={() => setSelectedOption(oIdx)}
                          style={{
                            padding: '14px 18px', borderRadius: 14, background: bg, border, color: textColor,
                            textAlign: 'left', fontSize: 14, fontWeight: isSelected ? 800 : 600, cursor: submittedAnswer ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: 26, height: 26, borderRadius: 13, background: isSelected ? 'var(--s-primary)' : '#f1f5f9',
                            color: isSelected ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* SUBMIT OR NEXT BUTTON */}
                  {!submittedAnswer ? (
                    <SBtn
                      variant="primary"
                      onClick={handleSubmitOption}
                      disabled={selectedOption === null}
                      style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 900 }}
                    >
                      Submit Answer
                    </SBtn>
                  ) : (
                    <div>
                      {/* Feedback Card */}
                      <div style={{
                        padding: 16, borderRadius: 14, marginBottom: 16,
                        background: selectedOption === practiceQuestions[currentPracticeIdx].correctAnswerIndex ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${selectedOption === practiceQuestions[currentPracticeIdx].correctAnswerIndex ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        <div style={{
                          fontSize: 14, fontWeight: 900,
                          color: selectedOption === practiceQuestions[currentPracticeIdx].correctAnswerIndex ? '#15803d' : '#b91c1c',
                          marginBottom: 4
                        }}>
                          {selectedOption === practiceQuestions[currentPracticeIdx].correctAnswerIndex ? '✓ Correct Answer!' : '✗ Incorrect Answer'}
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                          {practiceQuestions[currentPracticeIdx].explanation}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-primary)', marginTop: 8 }}>
                          Pattern Tested: {practiceQuestions[currentPracticeIdx].patternTested}
                        </div>
                      </div>

                      <SBtn
                        variant="primary"
                        onClick={handleNextPracticeQuestion}
                        style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 900 }}
                      >
                        {currentPracticeIdx + 1 === practiceQuestions.length ? 'View Final Results' : 'Next Question →'}
                      </SBtn>
                    </div>
                  )}
                </SCard>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 4: AI MOCK INTERVIEW SIMULATION MODE
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'mock' && (
            <div>
              {!mockActive ? (
                <SCard style={{ padding: 28, borderRadius: 20, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎙️</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    Start AI Mock Interview for {researchData.company}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 6, lineHeight: 1.5 }}>
                    Engage in a live, turn-by-turn interactive interview simulation with an AI interviewer contextually aware of <strong>{researchData.company}</strong>'s hiring rounds and candidate evaluation bar.
                  </p>

                  <SBtn
                    variant="primary"
                    onClick={handleStartMockInterview}
                    disabled={loadingMock}
                    style={{ marginTop: 20, padding: '12px 28px', borderRadius: 12, fontWeight: 900 }}
                  >
                    {loadingMock ? <FiRefreshCw className="s-spin" size={16} /> : 'Begin Mock Interview'}
                  </SBtn>
                </SCard>
              ) : (
                /* LIVE MOCK INTERVIEW CHAT CONVERSATION */
                <SCard style={{ padding: 24, borderRadius: 20, maxWidth: 800, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--s-border)', paddingBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>
                        {researchData.company} Live AI Mock Interview
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--s-text3)' }}>
                        Role: {targetRole} • Turn {mockTurn}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMockActive(false)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: 12 }}
                    >
                      End Interview
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div style={{ minHeight: 320, maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20, paddingRight: 4 }}>
                    {mockMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          alignSelf: msg.sender === 'candidate' ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          background: msg.sender === 'candidate' ? 'var(--s-primary)' : msg.sender === 'feedback' ? '#f0fdf4' : '#f8fafc',
                          color: msg.sender === 'candidate' ? '#fff' : msg.sender === 'feedback' ? '#15803d' : 'var(--s-text)',
                          border: msg.sender === 'candidate' ? 'none' : msg.sender === 'feedback' ? '1px solid #bbf7d0' : '1px solid var(--s-border)',
                          padding: '12px 16px', borderRadius: 16, fontSize: 13, lineHeight: 1.6
                        }}
                      >
                        {msg.sender === 'feedback' && <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>💡 Interviewer Feedback</div>}
                        {msg.text}
                      </div>
                    ))}
                    {loadingMock && (
                      <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--s-text3)', fontStyle: 'italic' }}>
                        Interviewer is evaluating your response...
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <textarea
                      rows={2}
                      value={mockInput}
                      onChange={e => setMockInput(e.target.value)}
                      placeholder="Type your interview answer here..."
                      style={{
                        flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid var(--s-border)',
                        fontSize: 13, outline: 'none', resize: 'none'
                      }}
                    />
                    <SBtn
                      variant="primary"
                      onClick={handleSendMockResponse}
                      disabled={loadingMock || !mockInput.trim()}
                      style={{ borderRadius: 12, padding: '0 20px', fontWeight: 900 }}
                    >
                      Send Answer
                    </SBtn>
                  </div>
                </SCard>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
