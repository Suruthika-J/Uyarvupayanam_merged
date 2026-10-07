import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { SCard, SSelect, SBtn, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import { FiCheckSquare, FiZap, FiHelpCircle, FiCheck, FiX, FiRefreshCw, FiArrowRight, FiAward, FiBookOpen } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'

export default function PracticeQuestionsPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const { studentContext } = useStudentContext()
  const [subject, setSubject] = useState('')
  const [exploreAll, setExploreAll] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      'Microprocessors & Microcontrollers',
      'Renewable Energy & Smart Grids',
      'Analog & Digital Electronics',
      'Electric Vehicle (EV) Technology & Drives',
      'Transmission & Distribution Systems',
      'Energy Management & Power Quality'
    ]
  } else if (/robot|robotics|mechatronics|automation/.test(profileDomainText) || (studentContext?.targetCareer && /robot/i.test(studentContext.targetCareer))) {
    domainFallbackSubjects = [
      'Robot Operating System (ROS 2)',
      'Robotics Kinematics & Dynamics',
      'Microcontrollers & Embedded C',
      'Control Systems & PID Tuning',
      'Computer Vision & OpenCV',
      'Sensors & Actuators in Automation',
      'Programmable Logic Controllers (PLC) & SCADA',
      'SLAM & Autonomous Navigation',
      'Hydraulics & Pneumatics Systems'
    ]
  } else if (/ece|electronics|communication|telecom|vlsi/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Electronic Devices & Circuits (EDC)',
      'Digital Logic & Circuit Design',
      'Signals and Systems',
      'Digital Signal Processing (DSP)',
      'VLSI Design & Semiconductor Tech',
      'Microprocessors & Microcontrollers (8085 / 8086 / ARM)',
      'Communication Systems & Wireless Tech',
      'Electromagnetic Fields & Transmission Lines',
      'Antenna & Wave Propagation',
      'Embedded Systems & Real-Time OS (RTOS)',
      'RF & Microwave Engineering',
      'Analog Integrated Circuits (LIC / Op-Amps)',
      'Optical Communication & Fiber Tech'
    ]
  } else if (/mechanical|mech|thermal|automobile|aerospace/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Engineering Thermodynamics & Heat Transfer',
      'Fluid Mechanics & Hydraulic Machinery',
      'Strength of Materials & Mechanics of Solids',
      'Kinematics & Dynamics of Machinery (DOM)',
      'Manufacturing Technology & Metallurgy',
      'Engineering Materials & Metallurgy',
      'CAD / CAM / CAE & Finite Element Analysis (FEA)',
      'Mechatronics, Robotics & Automation',
      'Internal Combustion Engines & Automobile Engineering',
      'Industrial Engineering & Operations Research',
      'Refrigeration & Air Conditioning (RAC)'
    ]
  } else if (/civil|structural|construction|geotechnical/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Structural Analysis & Solid Mechanics',
      'Soil Mechanics & Foundation Engineering',
      'Fluid Mechanics & Hydraulics',
      'Concrete Technology & RCC Design',
      'Surveying & Geomatics Engineering',
      'Design of Steel Structures',
      'Environmental Engineering & Water Treatment',
      'Transportation & Highway Engineering',
      'Construction Project Management & Building Code',
      'Hydrology & Water Resources Engineering'
    ]
  } else if (/ai|data science|machine learning|artificial intelligence/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Data Structures & Algorithms',
      'Artificial Intelligence & Knowledge Representation',
      'Machine Learning & Statistical Modeling',
      'Deep Learning & Neural Networks',
      'Natural Language Processing (NLP)',
      'Computer Vision & Image Processing',
      'Big Data Analytics & Data Engineering',
      'Database Management Systems (DBMS)',
      'Python Programming & Data Science Libraries',
      'Generative AI & Prompt Engineering',
      'Reinforcement Learning & Autonomous Agents'
    ]
  } else if (/it\b|information technology/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Web Architecture & Cloud Microservices',
      'Operating Systems & System Administration',
      'Computer Networks & Information Security',
      'Object Oriented Programming (Java / Python)',
      'Enterprise Software & DevOps',
      'Information Systems & IT Management',
      'Big Data Analytics & Data Engineering',
      'Cyber Security & Cryptography',
      'Mobile Computing & Wireless Tech'
    ]
  } else if (/bio|biotech|biomedical|chemical/.test(profileDomainText)) {
    domainFallbackSubjects = [
      'Biochemistry & Cell Biology',
      'Molecular Biology & Genetic Engineering',
      'Bioprocess Engineering & Fermentation Tech',
      'Heat & Mass Transfer Operations',
      'Chemical Reaction Engineering & Thermodynamics',
      'Immunology & Medical Instrumentation',
      'Bioinformatics & Computational Biology',
      'Process Dynamics & Control'
    ]
  } else {
    // Computer Science & Engineering (CSE) / Software Engineering
    domainFallbackSubjects = [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Operating Systems',
      'Computer Networks & Security',
      'Object Oriented Programming (C++ / Java / Python)',
      'Web Technologies & Cloud Computing',
      'Software Engineering & Agile Architecture',
      'Design & Analysis of Algorithms (DAA)',
      'Computer Organization & Architecture',
      'Theory of Computation & Automata',
      'Compiler Design',
      'Artificial Intelligence & Machine Learning',
      'Cyber Security & Cryptography',
      'Cloud Computing & DevOps',
      'Distributed Systems & Parallel Computing',
      'Mobile Application Development',
      'Data Mining & Data Warehousing',
      'Microprocessors & Assembly Language'
    ]
  }

  const studentSubjects = (studentContext?.subjects || profile?.subjects || []).filter(Boolean)
  // Merge enrolled student subjects with complete department core subjects so no subjects are missing
  const recommendedSubjects = Array.from(new Set([...studentSubjects, ...domainFallbackSubjects]))
  
  const allSystemSubjects = Array.from(new Set([
    'Data Structures & Algorithms', 'Database Management Systems (DBMS)', 'Operating Systems', 'Computer Networks & Security',
    'Object Oriented Programming (C++ / Java / Python)', 'Web Technologies & Cloud Computing', 'Software Engineering & Agile Architecture',
    'Design & Analysis of Algorithms (DAA)', 'Computer Organization & Architecture', 'Theory of Computation & Automata',
    'Compiler Design', 'Artificial Intelligence & Machine Learning', 'Cyber Security & Cryptography', 'Cloud Computing & DevOps',
    'Distributed Systems & Parallel Computing', 'Mobile Application Development', 'Data Mining & Data Warehousing',
    'Artificial Intelligence & Knowledge Representation', 'Machine Learning & Statistical Modeling', 'Deep Learning & Neural Networks',
    'Natural Language Processing (NLP)', 'Computer Vision & Image Processing', 'Big Data Analytics & Data Engineering',
    'Circuit Theory & Network Analysis', 'Electrical Machines (Transformers & Motors)', 'Power Systems & High Voltage Engineering',
    'Control Systems Engineering', 'Power Electronics & Motor Drives', 'Microprocessors & Microcontrollers',
    'Robot Operating System (ROS 2)', 'Robotics Kinematics & Dynamics', 'OpenCV & Computer Vision',
    'Electronic Devices & Circuits (EDC)', 'Digital Signal Processing (DSP)', 'VLSI Design & Semiconductor Tech',
    'Engineering Thermodynamics & Heat Transfer', 'Fluid Mechanics & Hydraulic Machinery', 'Strength of Materials & Mechanics of Solids',
    'Kinematics & Dynamics of Machinery (DOM)', 'Manufacturing Technology & Metallurgy', 'CAD / CAM / CAE & FEA',
    'Structural Analysis & Solid Mechanics', 'Soil Mechanics & Foundation Engineering', 'Concrete Technology & RCC Design',
    'Biochemistry & Cell Biology', 'Molecular Biology & Genetic Engineering', 'Bioprocess Engineering'
  ]))

  const activeSubjectList = exploreAll ? allSystemSubjects : recommendedSubjects

  useEffect(() => {
    if (recommendedSubjects.length > 0) {
      if (!subject || !activeSubjectList.includes(subject)) {
        setSubject(recommendedSubjects[0])
      }
    }
  }, [profileDomainText, exploreAll])

  // Quiz execution state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [currentDifficulty, setCurrentDifficulty] = useState('Easy')
  const [submitted, setSubmitted] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchQuestions = async (targetDiff = null) => {
    setLoading(true)
    setError('')
    setSubmitted(false)
    setResultData(null)
    setCurrentIndex(0)
    setSelectedAnswers({})

    const diffToUse = targetDiff || currentDifficulty || 'Easy'
    setCurrentDifficulty(diffToUse)

    try {
      const res = await axiosInstance.post(
        '/study-tools/practice-questions',
        {
          subject,
          difficulty: diffToUse,
          count: 5,
          timestamp: Date.now()
        }
      )
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions)
        if (res.data.questions.length === 0) {
          setError('No questions could be generated for this subject right now.')
        }
      } else {
        setError('The question engine couldn’t prepare a test for this subject.')
      }
    } catch (err) {
      console.warn('Failed to load practice questions')
      setError('We couldn’t reach the question engine. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions('Easy')
  }, [subject])

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }))
  }

  const handleSubmitQuiz = async () => {
    setSubmitting(true)
    try {
      const userAnswers = questions.map((q, idx) => {
        const sel = selectedAnswers[q.id || idx]
        return {
          questionId: q.id || idx,
          selectedOption: sel,
          isCorrect: sel === q.correctIndex,
          topic: q.topic || subject
        }
      })

      const res = await axiosInstance.post(
        '/study-tools/assessment/submit',
        { subject, assessmentType: `${currentDifficulty} Practice Test`, userAnswers, totalQuestions: questions.length }
      )

      if (res.data?.success) {
        setResultData(res.data.result)
        setSubmitted(true)
      }
    } catch (err) {
      alert('Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const getNextDifficulty = (current, scorePct = 100) => {
    if (scorePct < 60) return current
    if (current === 'Easy') return 'Medium'
    if (current === 'Medium') return 'Hard'
    if (current === 'Hard') return 'Advanced'
    return 'Hard'
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER BANNER */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> Adaptive Diagnostic Assessment
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Subject & Skill Practice Quiz
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Adaptive difficulty questions (Easy → Medium → Hard → Advanced). Diagnostic results persist to performance analytics.
          </p>
        </div>

        {/* DIFFICULTY SWITCHER PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Difficulty:</span>
          {['Easy', 'Medium', 'Hard', 'Advanced'].map(diff => (
            <button
              key={diff}
              type="button"
              onClick={() => fetchQuestions(diff)}
              style={{
                padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                border: currentDifficulty === diff ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                background: currentDifficulty === diff ? 'var(--s-primary)' : '#f8fafc',
                color: currentDifficulty === diff ? '#fff' : 'var(--s-text2)',
                transition: 'all 0.15s ease'
              }}
            >
              {diff}
            </button>
          ))}
          <SBtn variant="secondary" onClick={() => fetchQuestions(currentDifficulty)} disabled={loading} style={{ padding: '6px 12px', fontSize: 12 }}>
            <FiRefreshCw size={14} style={{ marginRight: 4 }} /> New Test
          </SBtn>
        </div>
      </div>

      {/* SUBJECT SELECTOR */}
      <SCard style={{ padding: 20, borderRadius: 16, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text3)' }}>
            {exploreAll ? 'Exploring All University Subjects' : `Enrolled & Recommended Subjects (${studentContext?.course || profile?.domain || 'Engineering'})`}
          </span>
          <button
            type="button"
            onClick={() => setExploreAll(!exploreAll)}
            style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {exploreAll ? 'Show Enrolled Only' : 'Explore All Subjects'}
          </button>
        </div>
        <SSelect
          label="Select Domain Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          options={activeSubjectList.map(s => ({ value: s, label: s }))}
        />
      </SCard>

      {/* QUIZ QUESTION CARDS */}
      {loading ? (
        <AIGenerating
          label={`Generating ${currentDifficulty} level practice questions for ${subject}`}
          sub="Crafting a personalized diagnostic test with adaptive difficulty escalation..."
        />
      ) : error ? (
        <AIFailure
          title="Couldn’t generate practice questions"
          message={error}
          onRetry={() => fetchQuestions(currentDifficulty)}
          retryLabel="Retry Generation"
        />
      ) : submitted && resultData ? (
        /* QUIZ RESULT CARD */
        <SCard style={{ padding: 32, borderRadius: 24, borderTop: '6px solid var(--s-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)' }}>
                {currentDifficulty} Level Assessment Completed
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '2px 0 0' }}>
                Diagnostic Performance Score
              </h2>
            </div>
            <SBadge color={resultData.scorePercentage >= 75 ? 'green' : 'orange'}>
              {resultData.performanceLevel} ({resultData.scorePercentage}%)
            </SBadge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#d1fae5', padding: 16, borderRadius: 14, color: '#047857', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase' }}>Correct Answers</div>
              <div style={{ fontSize: 24 }}>✓ {resultData.correctCount} / {resultData.totalQuestions}</div>
            </div>

            <div style={{ background: '#fee2e2', padding: 16, borderRadius: 14, color: '#991b1b', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase' }}>Incorrect Answers</div>
              <div style={{ fontSize: 24 }}>✗ {resultData.incorrectCount}</div>
            </div>

            <div style={{ background: '#ede9fe', padding: 16, borderRadius: 14, color: '#6d28d9', fontWeight: 800 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase' }}>XP Awarded</div>
              <div style={{ fontSize: 24 }}>+50 XP</div>
            </div>
          </div>

          {/* Strong vs Weak Topics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="s-grid-1col">
            <div style={{ background: '#f0fdf4', padding: 18, borderRadius: 16, borderLeft: '4px solid #047857' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#047857', marginBottom: 8 }}>Strong Topics Demonstrated</div>
              {resultData.strongTopics?.map((st, idx) => (
                <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#064e3b', margin: '4px 0' }}>✓ {st}</div>
              ))}
            </div>

            <div style={{ background: '#fffbeb', padding: 18, borderRadius: 16, borderLeft: '4px solid #b45309' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#b45309', marginBottom: 8 }}>Weak Topics Flagged for Review</div>
              {resultData.weakTopics?.map((wt, idx) => (
                <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#78350f', margin: '4px 0' }}>△ {wt}</div>
              ))}
            </div>
          </div>

          {/* ACTION FOOTER WITH CONTINUOUS PROGRESSION */}
          {(() => {
            const scorePct = resultData.scorePercentage || 0
            const nextDiff = getNextDifficulty(currentDifficulty, scorePct)
            const isAdvance = nextDiff !== currentDifficulty

            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--s-border)', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text2)', display: 'block' }}>
                    Recommended Next Action: <strong>{isAdvance ? `Proceed to ${nextDiff} Level Assessment` : `Practice Fresh ${currentDifficulty} Questions`}</strong>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--s-text3)' }}>
                    {isAdvance ? `Great job! Step up to ${nextDiff} difficulty level for ${subject}.` : `Score under 60% — retry ${currentDifficulty} level to master core concepts.`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <SBtn
                    variant="primary"
                    onClick={() => fetchQuestions(nextDiff)}
                    style={{ background: isAdvance ? '#047857' : 'var(--s-primary)', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800 }}
                  >
                    <FiZap style={{ marginRight: 6 }} />
                    {isAdvance ? `Proceed to ${nextDiff} Level Test (5 Fresh Qs) →` : `Generate Fresh ${currentDifficulty} Test (5 Qs) →`}
                  </SBtn>
                  <SBtn variant="secondary" onClick={() => fetchQuestions(currentDifficulty)} style={{ borderRadius: 12, fontSize: 13 }}>
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
      ) : questions.length === 0 ? (
        <SEmpty
          icon="📝"
          title="No questions generated yet"
          desc="Pick a subject and select a difficulty level to generate a fresh set of adaptive practice questions."
        />
      ) : (
        /* ACTIVE QUESTION LIST */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {questions.map((q, qIdx) => {
            const qId = q.id || qIdx
            const selectedOpt = selectedAnswers[qId]

            return (
              <SCard key={qId} style={{ padding: 26, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>
                    Question {qIdx + 1} of {questions.length} • {q.topic || subject}
                  </span>
                  <SBadge color={currentDifficulty === 'Easy' ? 'green' : currentDifficulty === 'Medium' ? 'orange' : 'purple'}>
                    {currentDifficulty} Level
                  </SBadge>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {q.question}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {q.options?.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(qId, oIdx)}
                        style={{
                          padding: '12px 18px', borderRadius: 14,
                          background: isSelected ? '#dbeafe' : '#f8fafc',
                          border: isSelected ? '2px solid #1e40af' : '1px solid var(--s-border)',
                          color: isSelected ? '#1e40af' : 'var(--s-text)',
                          fontWeight: isSelected ? 800 : 600, fontSize: 14,
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    )
                  })}
                </div>
              </SCard>
            )
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <SBtn
              variant="primary"
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(selectedAnswers).length === 0}
              style={{ padding: '12px 30px', borderRadius: 14, fontSize: 15 }}
            >
              {submitting ? 'Submitting Result...' : `Submit ${currentDifficulty} Level Assessment`}
            </SBtn>
          </div>
        </div>
      )}

    </div>
  )
}
