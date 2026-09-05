import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SSelect, SBtn, SLoader, SBadge } from '../../components/ui'
import {
  FiZap, FiCheck, FiX, FiRefreshCw, FiAward,
  FiBookOpen, FiActivity, FiShield, FiCode, FiTerminal,
  FiArrowRight, FiCheckSquare, FiAlertCircle
} from 'react-icons/fi'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import { getCollegePracticeConfig, fetchDomainPracticeSession } from '../../services/collegePracticeEngine'

export default function CollegePracticePage() {
  const { profile } = useCollegeProfile()
  const practiceConfig = getCollegePracticeConfig(profile || {})

  const [selectedSubject, setSelectedSubject] = useState(practiceConfig.defaultSubject || practiceConfig.subjects[0])
  const [selectedActivityType, setSelectedActivityType] = useState('All Activity Types')
  const [difficulty, setDifficulty] = useState('Medium')
  
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Session execution state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [userCode, setUserCode] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [submitted, setSubmitted] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Optional interdisciplinary skill exploration state
  const [showInterdisciplinary, setShowInterdisciplinary] = useState(false)

  // Reset subject when practiceConfig changes
  useEffect(() => {
    if (practiceConfig?.subjects?.length > 0) {
      setSelectedSubject(practiceConfig.defaultSubject || practiceConfig.subjects[0])
    }
  }, [practiceConfig?.domainKey])

  const loadPracticeSession = async () => {
    setLoading(true)
    setSubmitted(false)
    setResultData(null)
    setCurrentIndex(0)
    setSelectedAnswers({})
    try {
      const data = await fetchDomainPracticeSession({
        subject: selectedSubject,
        difficulty,
        count: 5,
        practiceType: selectedActivityType !== 'All Activity Types' ? selectedActivityType : undefined
      })
      setQuestions(data.questions || [])
    } catch (err) {
      console.warn('Failed to load domain practice session:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPracticeSession()
  }, [selectedSubject, difficulty])

  const currentItem = questions[currentIndex]

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }))

    // Adaptive difficulty progression logic
    if (currentItem && optionIdx === currentItem.correctIndex) {
      if (difficulty === 'Easy') setDifficulty('Medium')
      else if (difficulty === 'Medium') setDifficulty('Hard')
    }
  }

  const handleSubmitSession = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('studentToken')
      const userAnswers = questions.map((q, idx) => {
        const sel = selectedAnswers[q.id || idx]
        return {
          questionId: q.id || idx,
          selectedOption: sel,
          isCorrect: sel === q.correctIndex,
          topic: q.topic || selectedSubject
        }
      })

      const res = await axios.post(
        'http://localhost:5000/api/study-tools/assessment/submit',
        {
          subject: selectedSubject,
          assessmentType: `${practiceConfig.navLabel} Session`,
          userAnswers,
          totalQuestions: questions.length
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data?.success) {
        setResultData(res.data.result)
        setSubmitted(true)
      }
    } catch (err) {
      alert('Failed to record practice session results')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">
      {/* HEADER BANNER */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiActivity size={14} /> Domain-Grounded Practice Engine
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            {practiceConfig.practiceTitle}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            {profile?.degreeProgramme || 'Undergraduate'} — {profile?.domain || 'Academic Discipline'} {profile?.specialization ? `(${profile.specialization})` : ''} | {profile?.currentYear || 'Current Year'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 16, background: '#ede9fe', color: '#6d28d9' }}>
            Level: {difficulty}
          </span>
          <SBtn variant="primary" onClick={loadPracticeSession} disabled={loading}>
            <FiRefreshCw size={15} style={{ marginRight: 6 }} /> New Practice Session
          </SBtn>
        </div>
      </div>

      {/* MEDICAL SAFETY DISCLAIMER */}
      {practiceConfig.isMedical && (
        <div style={{ padding: '12px 18px', borderRadius: 14, background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <FiShield size={18} style={{ flexShrink: 0, color: '#b45309' }} />
          <div>
            <strong>Educational Practice Notice:</strong> {practiceConfig.disclaimer}
          </div>
        </div>
      )}

      {/* DOMAIN PRACTICE CONTROLS */}
      <SCard style={{ padding: 20, borderRadius: 18, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 16 }} className="s-grid-1col">
        <SSelect
          label="Academic Practice Subject"
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          options={practiceConfig.subjects.map(s => ({ value: s, label: s }))}
        />
        <SSelect
          label="Practice Activity Format"
          value={selectedActivityType}
          onChange={e => setSelectedActivityType(e.target.value)}
          options={[
            { value: 'All Activity Types', label: 'All Activity Formats' },
            ...practiceConfig.activityTypes.map(t => ({ value: t, label: t }))
          ]}
        />
        <SSelect
          label="Difficulty"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          options={[
            { value: 'Easy', label: 'Easy' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Hard', label: 'Hard' }
          ]}
        />
      </SCard>

      {/* PRACTICE SESSION CONTENT AREA */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label={`assembling ${practiceConfig.navLabel} exercises...`} />
        </div>
      ) : submitted && resultData ? (
        /* PRACTICE SESSION RESULTS CARD */
        <SCard style={{ padding: 32, borderRadius: 24, borderTop: '6px solid var(--s-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-primary)' }}>
                Session Completed
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '2px 0 0' }}>
                Practice Performance Breakdown
              </h2>
            </div>
            <SBadge color={resultData.score >= 70 ? 'green' : 'orange'}>
              {resultData.score >= 70 ? 'Proficient' : 'Needs Reinforcement'}
            </SBadge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-primary)' }}>{resultData.score}%</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>Overall Accuracy</div>
            </div>
            <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#047857' }}>{resultData.correctCount} / {resultData.totalQuestions}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>Correct Items</div>
            </div>
            <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#6d28d9', marginTop: 4 }}>{selectedSubject}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>Target Subject</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <SBtn variant="secondary" onClick={loadPracticeSession}>
              Practice Again
            </SBtn>
          </div>
        </SCard>
      ) : questions.length > 0 ? (
        /* ACTIVE QUESTION / CASE CARDS */
        <div>
          {/* Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text2)' }}>
              Item {currentIndex + 1} of {questions.length} — <span style={{ color: 'var(--s-primary)' }}>{selectedSubject}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: 28, height: 8, borderRadius: 4, cursor: 'pointer',
                    background: idx === currentIndex ? 'var(--s-primary)' : selectedAnswers[idx] !== undefined ? '#34d399' : '#cbd5e1',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {currentItem && (
            <SCard style={{ padding: 32, borderRadius: 22, border: '1px solid var(--s-border)', marginBottom: 24 }}>
              {/* Question / Case Header */}
              <div style={{ marginBottom: 20 }}>
                {currentItem.clinicalPresentation && (
                  <div style={{ padding: 14, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
                    <strong>Clinical Case Presentation:</strong> {currentItem.clinicalPresentation}
                  </div>
                )}
                {currentItem.caseFacts && (
                  <div style={{ padding: 14, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
                    <strong>Case Facts & Statute Context:</strong> {currentItem.caseFacts}
                  </div>
                )}

                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--s-text)', lineHeight: 1.5, margin: 0 }}>
                  {currentItem.question}
                </h3>
              </div>

              {/* Options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {currentItem.options?.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentItem.id || currentIndex] === oIdx
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(currentItem.id || currentIndex, oIdx)}
                      style={{
                        padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                        border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                        background: isSelected ? 'rgba(2, 132, 199, 0.06)' : '#fff',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', border: isSelected ? '2px solid var(--s-primary)' : '1px solid #cbd5e1',
                        background: isSelected ? 'var(--s-primary)' : '#fff', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800
                      }}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--s-text)', fontWeight: isSelected ? 700 : 500 }}>
                        {opt}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Explanation (if answered) */}
              {selectedAnswers[currentItem.id || currentIndex] !== undefined && currentItem.explanation && (
                <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', borderLeft: '4px solid var(--s-primary)', fontSize: 13, lineHeight: 1.6, color: 'var(--s-text2)', marginBottom: 20 }}>
                  <strong>Educational Rationale:</strong> {currentItem.explanation}
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SBtn variant="secondary" onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0}>
                  Previous Item
                </SBtn>

                {currentIndex < questions.length - 1 ? (
                  <SBtn variant="primary" onClick={() => setCurrentIndex(prev => prev + 1)}>
                    Next Item <FiArrowRight size={15} style={{ marginLeft: 6 }} />
                  </SBtn>
                ) : (
                  <SBtn variant="primary" onClick={handleSubmitSession} disabled={submitting}>
                    {submitting ? 'Submitting Session...' : 'Complete & View Evaluation'}
                  </SBtn>
                )}
              </div>
            </SCard>
          )}
        </div>
      ) : (
        /* EMPTY STATE FOR DOMAIN PRACTICE */
        <SCard style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
          <FiAlertCircle size={40} color="var(--s-text3)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 8px' }}>
            Preparing Practice Content for {selectedSubject}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', maxWidth: 500, margin: '0 auto 20px' }}>
            Your personalized domain practice session is being loaded. Click below to refresh questions.
          </p>
          <SBtn variant="primary" onClick={loadPracticeSession}>
            Load Session
          </SBtn>
        </SCard>
      )}

      {/* OPTIONAL INTERDISCIPLINARY EXPLORATION */}
      <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--s-border)' }}>
        <button
          type="button"
          onClick={() => setShowInterdisciplinary(prev => !prev)}
          style={{ background: 'none', border: 'none', color: 'var(--s-text3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FiBookOpen size={15} /> {showInterdisciplinary ? 'Hide Interdisciplinary Learning Options' : 'Explore Optional Interdisciplinary Skills (Data, Analysis, Tech)'}
        </button>

        {showInterdisciplinary && (
          <div style={{ marginTop: 14, padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginBottom: 6 }}>
              Interdisciplinary & Optional Skill Practice
            </div>
            <div style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, marginBottom: 12 }}>
              If you wish to practice interdisciplinary skills (such as Data Analytics for Healthcare, Legal Tech, or Python for Research) as an optional extra capability, select below:
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Data Analysis for Research', 'Python Basics for Data', 'Technical Writing & Documentation', 'Biostatistics & Research Methods'].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubject(item)}
                  style={{ padding: '6px 14px', borderRadius: 12, background: '#fff', border: '1px solid var(--s-border)', fontSize: 12, fontWeight: 700, color: 'var(--s-text)', cursor: 'pointer' }}
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
