import React, { useState, useEffect, useRef } from 'react'
import axiosInstance from '../../../config/axios'
import { SCard, SSelect, SBtn, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import { FiZap, FiCheck, FiX, FiRefreshCw, FiArrowRight, FiAward, FiClock, FiBookOpen } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'

// Subject to topic mapping presets
const TOPICS_BY_SUBJECT = {
  'Database Management Systems (DBMS)': ['Database Normalization', 'Transactions & Concurrency', 'SQL & Indexing', 'ER Model', 'Storage & WAL Recovery'],
  'SQL & Database Queries': ['SELECT & Filtering', 'JOIN Operations', 'GROUP BY & Aggregates', 'Subqueries & CTEs', 'DDL & DML Commands'],
  'Java Programming': ['Classes & OOP', 'Exception Handling', 'Collections Framework', 'Multithreading & Concurrency', 'JVM Memory Management'],
  'Python Programming': ['Data Structures & Lists', 'Decorators & Generators', 'OOP & Modules', 'NumPy & Data Science', 'File I/O & Exceptions'],
  'C++ Programming': ['Pointers & Memory Management', 'OOP & Polymorphism', 'STL Containers', 'Templates & Generic Code', 'RAII & Exception Handling'],
  'Object-Oriented Programming (OOPS)': ['Encapsulation & Abstraction', 'Inheritance & Polymorphism', 'Design Patterns', 'Interfaces & Abstract Classes', 'SOLID Principles'],
  'Operating Systems': ['CPU Scheduling', 'Virtual Memory & Paging', 'Deadlocks & Synchronization', 'Process Management & Threads', 'Disk Scheduling'],
  'Computer Networks & Security': ['OSI & TCP/IP Model', 'Routing Algorithms', 'Transport Layer & Congestion', 'IP Addressing & Subnetting', 'Network Security'],
  'Data Structures & Algorithms': ['Arrays & Hash Tables', 'Linked Lists, Stacks & Queues', 'Binary Trees & BST', 'Graph Algorithms', 'Dynamic Programming & Sorting']
}

export default function PracticeQuestionsPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const { studentContext } = useStudentContext()

  const [subject, setSubject] = useState('Database Management Systems (DBMS)')
  const [topic, setTopic] = useState('')
  const [exploreAll, setExploreAll] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState('Medium')

  // Practice Session State
  const [session, setSession] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Single Question Interactive State
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [answerResult, setAnswerResult] = useState(null)

  // Completion State
  const [resultsData, setResultsData] = useState(null)
  const [loadingResults, setLoadingResults] = useState(false)

  // Timer reference
  const timerRef = useRef(null)

  // Build authentic domain-specific subject choices
  const profileDomainText = `${studentContext?.domain || profile?.domain || ''} ${studentContext?.specialisation || profile?.specialization || ''} ${studentContext?.degree || profile?.degreeProgramme || ''} ${profile?.field || ''}`.toLowerCase()

  let domainFallbackSubjects = []
  if (/eee|electrical|power|voltage|energy/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Circuit Theory & Network Analysis',
      'Electrical Machines (Transformers & Motors)',
      'Power Systems & High Voltage Engineering',
      'Control Systems Engineering',
      'Power Electronics & Motor Drives',
      'Microprocessors & Microcontrollers'
    ]
  } else if (/robot|robotics|mechatronics|automation/.test(profileDomainText) || (studentContext?.targetCareer && /robot/i.test(studentContext.targetCareer))) {
    domainFallbackSubjects = [
      'Robot Operating System (ROS 2)',
      'Robotics Kinematics & Dynamics',
      'Microcontrollers & Embedded C',
      'Control Systems & PID Tuning',
      'Computer Vision & OpenCV'
    ]
  } else if (/ece|electronics|communication|telecom|vlsi/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Electronic Devices & Circuits (EDC)',
      'Digital Logic & Circuit Design',
      'Signals and Systems',
      'Digital Signal Processing (DSP)',
      'VLSI Design & Semiconductor Tech'
    ]
  } else if (/mechanical|mech|thermal|automobile/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Engineering Thermodynamics & Heat Transfer',
      'Fluid Mechanics & Hydraulic Machinery',
      'Strength of Materials & Mechanics of Solids',
      'Kinematics & Dynamics of Machinery (DOM)'
    ]
  } else {
    domainFallbackSubjects = [
      'Database Management Systems (DBMS)',
      'SQL & Database Queries',
      'Data Structures & Algorithms',
      'Operating Systems',
      'Computer Networks & Security',
      'Java Programming',
      'Python Programming',
      'C++ Programming',
      'Object-Oriented Programming (OOPS)'
    ]
  }

  const studentSubjects = (studentContext?.subjects || profile?.subjects || []).filter(Boolean)
  const recommendedSubjects = Array.from(new Set([...studentSubjects, ...domainFallbackSubjects]))
  const allSystemSubjects = Array.from(new Set([
    'Database Management Systems (DBMS)',
    'SQL & Database Queries',
    'Data Structures & Algorithms',
    'Operating Systems',
    'Computer Networks & Security',
    'Java Programming',
    'Python Programming',
    'C++ Programming',
    'Object-Oriented Programming (OOPS)',
    ...domainFallbackSubjects
  ]))

  const activeSubjectList = exploreAll ? allSystemSubjects : recommendedSubjects

  useEffect(() => {
    if (recommendedSubjects.length > 0 && (!subject || !activeSubjectList.includes(subject))) {
      setSubject(recommendedSubjects[0])
    }
  }, [profileDomainText, exploreAll])

  // Reset topic selection when subject changes
  useEffect(() => {
    setTopic('')
  }, [subject])

  // Timer Countdown Effect for single question
  useEffect(() => {
    if (!session || session.status === 'COMPLETED' || isAnswerLocked || loading) return

    setSecondsLeft(30)
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [currentIndex, session?.sessionId, isAnswerLocked, loading])

  // Handle automatic timeout when timer reaches 0
  const handleTimeOut = async () => {
    if (isAnswerLocked || !session) return
    setIsAnswerLocked(true)
    setSelectedOption(null)

    const currentQ = session.questions[currentIndex]
    if (!currentQ) return

    try {
      setSubmittingAnswer(true)
      const res = await axiosInstance.post(`/practice/session/${session.sessionId}/answer`, {
        questionId: currentQ.questionId,
        selectedOption: null,
        answerTimeMs: 30000
      })
      if (res.data?.success) {
        setAnswerResult({
          correct: false,
          score: 0,
          speedBonus: 0,
          correctOption: res.data.correctOption,
          explanation: res.data.explanation,
          isTimeout: true
        })

        if (res.data.isComplete) {
          fetchFinalResults(session.sessionId)
        }
      }
    } catch (err) {
      console.warn('Timeout submit error:', err)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  // Start a fresh LLM Practice Session (POST /api/practice/session)
  const startPracticeSession = async (targetDiff = null, overrideSubject = null) => {
    setLoading(true)
    setError('')
    setSession(null)
    setResultsData(null)
    setCurrentIndex(0)
    setIsAnswerLocked(false)
    setSelectedOption(null)
    setAnswerResult(null)

    const diffToUse = targetDiff || currentDifficulty || 'Medium'
    setCurrentDifficulty(diffToUse)
    const subToUse = overrideSubject || subject

    try {
      const res = await axiosInstance.post('/practice/session', {
        subjectId: subToUse,
        subjectName: subToUse,
        topic: topic || null,
        difficulty: diffToUse.toUpperCase(),
        questionCount: 5
      })

      if (res.data?.success && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
        setSession(res.data)
      } else {
        setError('The LLM question engine could not generate questions for this setup. Please try again.')
      }
    } catch (err) {
      console.warn('Failed to start practice session:', err)
      setError('We could not connect to the question engine. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Option Click (Lock answers and submit to backend)
  const handleOptionClick = async (optionId) => {
    if (isAnswerLocked || submittingAnswer || !session) return

    clearInterval(timerRef.current)
    setIsAnswerLocked(true)
    setSelectedOption(optionId)
    setSubmittingAnswer(true)

    const currentQ = session.questions[currentIndex]
    const answerTimeMs = (30 - secondsLeft) * 1000

    try {
      const res = await axiosInstance.post(`/practice/session/${session.sessionId}/answer`, {
        questionId: currentQ.questionId,
        selectedOption: optionId,
        answerTimeMs
      })

      if (res.data?.success) {
        setAnswerResult({
          correct: res.data.correct,
          score: res.data.score,
          speedBonus: res.data.speedBonus,
          correctOption: res.data.correctOption,
          explanation: res.data.explanation
        })

        if (res.data.isComplete) {
          fetchFinalResults(session.sessionId)
        }
      }
    } catch (err) {
      console.warn('Failed to submit answer:', err)
      alert('Network issue submitting answer. Please try again.')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  // Advance to Next Question
  const handleNextQuestion = () => {
    if (!session) return

    if (currentIndex + 1 < session.questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setIsAnswerLocked(false)
      setSelectedOption(null)
      setAnswerResult(null)
      setSecondsLeft(30)
    } else {
      fetchFinalResults(session.sessionId)
    }
  }

  // Fetch Session Final Results
  const fetchFinalResults = async (sessionId) => {
    setLoadingResults(true)
    try {
      const res = await axiosInstance.get(`/practice/session/${sessionId}/results`)
      if (res.data?.success) {
        setResultsData(res.data)
      }
    } catch (err) {
      console.warn('Failed to load session results:', err)
    } finally {
      setLoadingResults(false)
    }
  }

  const currentQuestion = session?.questions?.[currentIndex]
  const availableTopics = TOPICS_BY_SUBJECT[subject] || []

  // Difficulty badge styling
  const diffBadgeColor = (diff) => {
    const d = (diff || currentDifficulty).toLowerCase()
    if (d === 'easy') return 'green'
    if (d === 'medium') return 'blue'
    if (d === 'hard') return 'orange'
    return 'purple'
  }

  const getNextDifficulty = (current, accuracy = 100) => {
    if (accuracy < 60) return current
    if (current === 'Easy') return 'Medium'
    if (current === 'Medium') return 'Hard'
    if (current === 'Hard') return 'Advanced'
    return 'Hard'
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER BAR & DIFFICULTY PILLS */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> Adaptive LLM Practice Session
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Practice Questions
          </h1>
        </div>

        {/* DIFFICULTY SELECTOR PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Difficulty:</span>
          {['Easy', 'Medium', 'Hard', 'Advanced'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => startPracticeSession(diff)}
              style={{
                padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                border: currentDifficulty === diff ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                background: currentDifficulty === diff ? 'var(--s-primary)' : '#f8fafc',
                color: currentDifficulty === diff ? '#fff' : 'var(--s-text2)',
                transition: 'all 0.15s ease'
              }}
            >
              {diff === 'Easy' ? '🟢 ' : diff === 'Medium' ? '🔵 ' : diff === 'Hard' ? '🟠 ' : '🔴 '}{diff}
            </button>
          ))}
          <SBtn
            variant="secondary"
            onClick={() => startPracticeSession(currentDifficulty)}
            disabled={loading}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <FiRefreshCw size={14} style={{ marginRight: 4 }} /> New Test
          </SBtn>
        </div>
      </div>

      {/* SETUP & SETUP SELECTOR CARD */}
      {!session && !loading && !error && (
        <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>Configure Practice Session</h2>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                Select a subject, optional topic focus, and difficulty level to generate 5 fresh LLM questions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExploreAll(!exploreAll)}
              style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {exploreAll ? 'Show Recommended Only' : 'Explore All Subjects'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: availableTopics.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <SSelect
                label="Select Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                options={activeSubjectList.map((s) => ({ value: s, label: s }))}
              />
            </div>

            {availableTopics.length > 0 && (
              <div>
                <SSelect
                  label="Select Subtopic (Optional)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  options={[
                    { value: '', label: 'All Important Topics (LLM Distributed)' },
                    ...availableTopics.map((t) => ({ value: t, label: t }))
                  ]}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SBtn
              variant="primary"
              onClick={() => startPracticeSession(currentDifficulty)}
              style={{ padding: '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 800 }}
            >
              <FiZap style={{ marginRight: 6 }} /> Start Practice Session (5 Questions)
            </SBtn>
          </div>
        </SCard>
      )}

      {/* LOADING STATE */}
      {loading && (
        <AIGenerating
          label={`Generating ${currentDifficulty.toUpperCase()} practice questions for ${subject}`}
          sub="Querying configured LLM to craft structured, unseen diagnostic questions..."
        />
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <AIFailure
          title="Could not generate practice session"
          message={error}
          onRetry={() => startPracticeSession(currentDifficulty)}
          retryLabel="Retry Generation"
        />
      )}

      {/* COMPLETION SCREEN STATE (Section 22) */}
      {resultsData && (
        <SCard style={{ padding: 32, borderRadius: 24, borderTop: '6px solid var(--s-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)', letterSpacing: '0.05em' }}>
                🎉 Practice Session Completed
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: '4px 0 0' }}>
                Performance Results
              </h2>
            </div>
            <SBadge color={resultsData.accuracyPercentage >= 75 ? 'green' : 'orange'}>
              {resultsData.accuracyPercentage}% Accuracy
            </SBadge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div style={{ background: '#ede9fe', padding: 16, borderRadius: 16, color: '#6d28d9', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.8 }}>Total Score</div>
              <div style={{ fontSize: 24, marginTop: 4 }}>{resultsData.score} <span style={{ fontSize: 14, opacity: 0.7 }}>/ {resultsData.maxPossibleScore}</span></div>
            </div>

            <div style={{ background: '#d1fae5', padding: 16, borderRadius: 16, color: '#047857', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.8 }}>Correct</div>
              <div style={{ fontSize: 24, marginTop: 4 }}>✓ {resultsData.correctCount} / {resultsData.totalQuestions}</div>
            </div>

            <div style={{ background: '#fee2e2', padding: 16, borderRadius: 16, color: '#991b1b', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.8 }}>Incorrect</div>
              <div style={{ fontSize: 24, marginTop: 4 }}>✗ {resultsData.wrongCount}</div>
            </div>

            <div style={{ background: '#fef3c7', padding: 16, borderRadius: 16, color: '#b45309', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.8 }}>Avg Speed</div>
              <div style={{ fontSize: 24, marginTop: 4 }}>⚡ {resultsData.avgResponseTimeSeconds}s</div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginBottom: 8 }}>Session Telemetry</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--s-text2)' }}>
              <div>• <strong>Subject:</strong> {resultsData.subjectName}</div>
              <div>• <strong>Difficulty:</strong> {resultsData.difficulty}</div>
              <div>• <strong>Fastest Answer:</strong> {resultsData.fastestResponseTimeSeconds} seconds</div>
              <div>• <strong>Skipped:</strong> {resultsData.skippedCount}</div>
              {resultsData.topicsPracticed?.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>• <strong>Topics Practiced:</strong> {resultsData.topicsPracticed.join(', ')}</div>
              )}
            </div>
          </div>

          {/* NEXT STEP ACTION FOOTER */}
          {(() => {
            const nextDiff = getNextDifficulty(currentDifficulty, resultsData.accuracyPercentage)
            const isAdvance = nextDiff !== currentDifficulty

            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--s-border)', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text2)', display: 'block' }}>
                    Recommended Next Step: <strong>{isAdvance ? `Proceed to ${nextDiff} Difficulty` : `Practice Fresh ${currentDifficulty} Questions`}</strong>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--s-text3)' }}>
                    {isAdvance ? `Great job! Step up to ${nextDiff} level questions.` : `Score under 60% — repeat ${currentDifficulty} level to build confidence.`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <SBtn
                    variant="primary"
                    onClick={() => startPracticeSession(nextDiff)}
                    style={{ background: isAdvance ? '#047857' : 'var(--s-primary)', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800 }}
                  >
                    <FiZap style={{ marginRight: 6 }} />
                    {isAdvance ? `Proceed to ${nextDiff} Level (5 Fresh Qs) →` : `Generate Fresh ${currentDifficulty} Session →`}
                  </SBtn>
                  <SBtn variant="secondary" onClick={() => startPracticeSession(currentDifficulty)} style={{ borderRadius: 12, fontSize: 13 }}>
                    <FiRefreshCw style={{ marginRight: 6 }} /> Repeat {currentDifficulty} Level
                  </SBtn>
                  <SBtn variant="secondary" onClick={() => navigate('/college/academic/planner')} style={{ borderRadius: 12, fontSize: 13 }}>
                    Open Study Planner <FiArrowRight style={{ marginLeft: 6 }} />
                  </SBtn>
                </div>
              </div>
            )
          })()}
        </SCard>
      )}

      {/* SINGLE QUESTION PRACTICE SESSION UI (Section 11, 12, 13, 14, 16) */}
      {session && !resultsData && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* PROGRESS BAR & TIMER HEADER */}
          <SCard style={{ padding: 20, borderRadius: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--s-primary)' }}>
                  Question {currentIndex + 1} of {session.questions.length}
                </span>
                <SBadge color={diffBadgeColor(session.difficulty)}>
                  {session.difficulty} LEVEL
                </SBadge>
                {currentQuestion.topic && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>
                    • {currentQuestion.topic}
                  </span>
                )}
              </div>

              {/* TIMER COUNTDOWN (Section 14) */}
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: secondsLeft <= 5 ? '#fee2e2' : '#f1f5f9',
                  color: secondsLeft <= 5 ? '#dc2626' : 'var(--s-text)',
                  padding: '6px 14px', borderRadius: 16, fontSize: 13, fontWeight: 900,
                  transition: 'all 0.2s ease'
                }}
              >
                <FiClock size={14} />
                ⏱ 00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </div>
            </div>

            {/* PROGRESS BAR (Section 16) */}
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((currentIndex + 1) / session.questions.length) * 100}%`,
                  height: '100%',
                  background: 'var(--s-primary)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </SCard>

          {/* SINGLE QUESTION CARD */}
          <SCard style={{ padding: 28, borderRadius: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 20px', lineHeight: 1.5 }}>
              {currentQuestion.questionText}
            </h2>

            {/* 4 OPTIONS (Section 13 - Answer locking) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {currentQuestion.options?.map((opt) => {
                const isSelected = selectedOption === opt.id
                const isCorrectOpt = answerResult && opt.id === answerResult.correctOption
                const isWrongSelected = answerResult && !answerResult.correct && isSelected

                let bg = '#f8fafc'
                let border = '1px solid var(--s-border)'
                let textColor = 'var(--s-text)'

                if (answerResult) {
                  if (isCorrectOpt) {
                    bg = '#d1fae5'
                    border = '2px solid #059669'
                    textColor = '#047857'
                  } else if (isWrongSelected) {
                    bg = '#fee2e2'
                    border = '2px solid #dc2626'
                    textColor = '#991b1b'
                  }
                } else if (isSelected) {
                  bg = '#dbeafe'
                  border = '2px solid #1e40af'
                  textColor = '#1e40af'
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    style={{
                      padding: '14px 20px', borderRadius: 16,
                      background: bg, border, color: textColor,
                      fontWeight: isSelected || isCorrectOpt ? 800 : 600, fontSize: 15,
                      cursor: isAnswerLocked ? 'not-allowed' : 'pointer',
                      opacity: isAnswerLocked && !isSelected && !isCorrectOpt ? 0.6 : 1,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ marginRight: 8, fontSize: 16 }}>{opt.id}.</strong> {opt.text}
                    </div>

                    {answerResult && isCorrectOpt && <FiCheck color="#059669" size={20} />}
                    {answerResult && isWrongSelected && <FiX color="#dc2626" size={20} />}
                  </div>
                )
              })}
            </div>

            {/* IMMEDIATE FEEDBACK & EXPLANATION CARD (Section 11) */}
            {answerResult && (
              <div
                style={{
                  padding: 20, borderRadius: 16, marginBottom: 20,
                  background: answerResult.correct ? '#f0fdf4' : '#fef2f2',
                  borderLeft: `5px solid ${answerResult.correct ? '#059669' : '#dc2626'}`,
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 900, color: answerResult.correct ? '#047857' : '#991b1b', marginBottom: 8 }}>
                  {answerResult.correct ? (
                    <>
                      <FiCheck size={20} /> Correct! (+{answerResult.score} pts {answerResult.speedBonus > 0 ? `including +${answerResult.speedBonus} speed bonus` : ''})
                    </>
                  ) : answerResult.isTimeout ? (
                    <>
                      <FiClock size={20} /> Time Expired! Option {answerResult.correctOption} was correct.
                    </>
                  ) : (
                    <>
                      <FiX size={20} /> Incorrect. Option {answerResult.correctOption} was correct.
                    </>
                  )}
                </div>

                <div style={{ fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.5 }}>
                  <strong>Explanation:</strong> {answerResult.explanation}
                </div>
              </div>
            )}

            {/* NEXT QUESTION BUTTON (Section 12) */}
            {isAnswerLocked && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <SBtn
                  variant="primary"
                  onClick={handleNextQuestion}
                  style={{ padding: '12px 28px', borderRadius: 14, fontSize: 15, fontWeight: 800 }}
                >
                  {currentIndex + 1 < session.questions.length ? (
                    <>
                      NEXT QUESTION <FiArrowRight style={{ marginLeft: 8 }} />
                    </>
                  ) : (
                    <>
                      FINISH PRACTICE SESSION <FiAward style={{ marginLeft: 8 }} />
                    </>
                  )}
                </SBtn>
              </div>
            )}
          </SCard>
        </div>
      )}

    </div>
  )
}
