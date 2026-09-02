import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SSelect, SBtn, SLoader } from '../../components/ui'
import { FiHelpCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi'

export default function PracticeQuestionsPage() {
  const [subject, setSubject] = useState('Data Structures & Algorithms')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/practice-questions',
        { subject, difficulty, count: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions)
      }
    } catch (err) {
      console.warn('Failed to fetch practice questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [subject, difficulty])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiHelpCircle size={14} /> Domain Concept Diagnostics
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Smart Domain Practice Questions
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Strengthen weak academic topics with domain-tailored multiple choice diagnostic questions.
          </p>
        </div>

        <SBtn variant="primary" onClick={fetchQuestions} disabled={loading} style={{ borderRadius: 12 }}>
          <FiRefreshCw size={15} style={{ marginRight: 6 }} /> New Question Set
        </SBtn>
      </div>

      {/* Selectors */}
      <SCard style={{ padding: 20, borderRadius: 16, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SInput
            label="Subject Name"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Data Structures, Operating Systems"
          />
          <SSelect
            label="Difficulty Level"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            options={[
              { value: 'Easy', label: 'Easy Level Fundamentals' },
              { value: 'Medium', label: 'Medium Level Standard' },
              { value: 'Hard', label: 'Hard Level Advanced' }
            ]}
          />
        </div>
      </SCard>

      {/* Questions */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label="Generating practice questions for your domain..." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {questions.map((q, qIdx) => {
            const chosen = answers[q.id || qIdx]
            return (
              <SCard key={q.id || qIdx} style={{ padding: 24, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>
                    Question {qIdx + 1} • {q.topic || 'Concept Check'}
                  </span>
                  <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                    {difficulty}
                  </span>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', marginBottom: 14 }}>
                  {q.question}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {q.options?.map((opt, oIdx) => {
                    const isChosen = chosen === oIdx
                    const isCorrect = oIdx === q.correctIndex
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id || qIdx]: oIdx })}
                        style={{
                          padding: 12, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                          border: isChosen ? (isCorrect ? '2px solid #047857' : '2px solid #dc2626') : '1px solid var(--s-border)',
                          background: isChosen ? (isCorrect ? '#d1fae5' : '#fee2e2') : '#fff',
                          color: 'var(--s-text)', fontSize: 13, fontWeight: 600
                        }}
                      >
                        <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                      </button>
                    )
                  })}
                </div>

                {chosen !== undefined && q.explanation && (
                  <div style={{ marginTop: 12, padding: 10, background: '#eff6ff', borderRadius: 10, fontSize: 12, color: '#1e40af' }}>
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </SCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
