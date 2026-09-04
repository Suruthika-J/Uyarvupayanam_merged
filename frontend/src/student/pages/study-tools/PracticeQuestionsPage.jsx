import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SSelect, SBtn, SLoader, SBadge } from '../../components/ui'
import { FiCheckSquare, FiZap, FiHelpCircle, FiCheck, FiX, FiRefreshCw, FiArrowRight, FiAward } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function PracticeQuestionsPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('Data Structures & Algorithms')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Quiz execution state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [currentDifficulty, setCurrentDifficulty] = useState('Easy')
  const [submitted, setSubmitted] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchQuestions = async () => {
    setLoading(true)
    setSubmitted(false)
    setResultData(null)
    setCurrentIndex(0)
    setSelectedAnswers({})
    setCurrentDifficulty('Easy')

    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/practice-questions',
        { subject, difficulty: currentDifficulty, count: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions)
      }
    } catch (err) {
      console.warn('Failed to load practice questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [subject])

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }))

    // Rule-based adaptive difficulty logic:
    const q = questions[currentIndex]
    if (q && optionIdx === q.correctIndex) {
      if (currentDifficulty === 'Easy') setCurrentDifficulty('Medium')
      else if (currentDifficulty === 'Medium') setCurrentDifficulty('Hard')
    }
  }

  const handleSubmitQuiz = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('studentToken')
      const userAnswers = questions.map((q, idx) => {
        const sel = selectedAnswers[q.id || idx]
        return {
          questionId: q.id || idx,
          selectedOption: sel,
          isCorrect: sel === q.correctIndex,
          topic: q.topic || subject
        }
      })

      const res = await axios.post(
        'http://localhost:5000/api/study-tools/assessment/submit',
        { subject, assessmentType: 'Practice Test', userAnswers, totalQuestions: questions.length },
        { headers: { Authorization: `Bearer ${token}` } }
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
            Adaptive difficulty questions (Easy → Medium → Hard). Diagnostic results persist to performance analytics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 16, background: '#dbeafe', color: '#1e40af' }}>
            Difficulty: {currentDifficulty}
          </span>
          <SBtn variant="primary" onClick={fetchQuestions} disabled={loading}>
            <FiRefreshCw size={15} style={{ marginRight: 6 }} /> Reset Test
          </SBtn>
        </div>
      </div>

      {/* SUBJECT SELECTOR */}
      <SCard style={{ padding: 20, borderRadius: 16, marginBottom: 28 }}>
        <SSelect
          label="Select Domain Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          options={[
            { value: 'Data Structures & Algorithms', label: 'Data Structures & Algorithms' },
            { value: 'Database Management Systems', label: 'Database Management Systems' },
            { value: 'Operating Systems', label: 'Operating Systems' },
            { value: 'Machine Learning', label: 'Machine Learning & AI' },
            { value: 'Computer Networks', label: 'Computer Networks' }
          ]}
        />
      </SCard>

      {/* QUIZ QUESTION CARDS */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label="Generating adaptive practice questions..." />
        </div>
      ) : submitted && resultData ? (
        /* QUIZ RESULT CARD */
        <SCard style={{ padding: 32, borderRadius: 24, borderTop: '6px solid var(--s-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)' }}>
                Assessment Completed
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--s-border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text2)' }}>
              Recommended Next Action: <strong>{resultData.recommendedNextAction}</strong>
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <SBtn variant="primary" onClick={() => navigate('/college/academic/planner')}>
                Open Study Planner <FiArrowRight style={{ marginLeft: 6 }} />
              </SBtn>
              <SBtn variant="secondary" onClick={fetchQuestions}>
                Retake Assessment
              </SBtn>
            </div>
          </div>
        </SCard>
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
                  <SBadge color="blue">{currentDifficulty} Level</SBadge>
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
              {submitting ? 'Submitting Result...' : 'Submit Diagnostic Assessment'}
            </SBtn>
          </div>
        </div>
      )}

    </div>
  )
}
