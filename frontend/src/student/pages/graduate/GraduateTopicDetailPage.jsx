import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiBookOpen, FiClock, FiCheckCircle, FiAlertCircle, FiArrowLeft,
  FiAward, FiHelpCircle, FiFileText, FiRefreshCw, FiCheck, FiInfo
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

export default function GraduateTopicDetailPage() {
  const { examId, topicId } = useParams()
  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState(null)
  const [topic, setTopic] = useState(null)
  const [section, setSection] = useState(null)

  // Interactive Practice State
  const [questionsAttempted, setQuestionsAttempted] = useState(10)
  const [correctAnswers, setCorrectAnswers] = useState(8)
  const [submitting, setSubmitting] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    fetchTopicDetails()
  }, [examId, topicId])

  const fetchTopicDetails = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getExamById(examId)
      if (res.success && res.exam) {
        setExam(res.exam)
        
        // Find matching topic in exam stages
        let foundTopic = null
        let foundSection = null

        if (res.exam.stages) {
          for (const st of res.exam.stages) {
            if (st.sections) {
              for (const sec of st.sections) {
                if (sec.syllabusTopics) {
                  const match = sec.syllabusTopics.find(t => t.topicId === topicId || t.normalizedKey === topicId)
                  if (match) {
                    foundTopic = match
                    foundSection = sec
                    break
                  }
                }
              }
            }
          }
        }

        if (foundTopic) {
          setTopic(foundTopic)
          setSection(foundSection)
        } else {
          // Fallback template topic if missing
          setTopic({
            topicId,
            name: String(topicId).replace(/_/g, ' ').toUpperCase(),
            estimatedHours: 4,
            difficulty: 'Medium',
            syllabusWeight: 80,
            historicalFrequency: 85,
            recentFrequency: 85,
            prerequisites: ['Basic Fundamental Knowledge'],
            conceptsToLearn: ['Core Concept & Definitions', 'Standard Problem Patterns', 'Speed Shortcuts & Tricks'],
            revisionChecklist: ['Formula Sheet Review', 'Past 3 Years Questions']
          })
        }
      }
    } catch (err) {
      console.error('Failed to load topic details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPractice = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setSavedSuccess(false)
      const res = await graduateService.recordTopicProgress(examId, topic?.topicId || topicId, {
        questionsAttempted: Number(questionsAttempted),
        correctAnswers: Number(correctAnswers),
        topicName: topic?.name || topicId,
        sectionId: section?.sectionId || ''
      })
      if (res.success) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to record topic practice:', err)
    } finally {
      setSubmitting(false)
    }
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
      {/* Top Breadcrumb */}
      <div>
        <Link
          to={`/graduate/roadmap/${examId}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, textDecoration: 'none', fontSize: 13.5 }}
        >
          <FiArrowLeft size={16} /> Back to {exam?.shortName || examId.toUpperCase()} Roadmap
        </Link>
      </div>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#38bdf8', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <FiBookOpen size={16} /> {section?.name || 'Exam Topic Breakdown'} • {exam?.shortName || 'EXAM'}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '8px 0 10px', color: '#fff' }}>
          {topic?.name || topicId}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
            Estimated Study Time: <strong style={{ color: '#38bdf8' }}>{topic?.estimatedHours || 4} Hours</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
            Difficulty Level: <strong style={{ color: '#f59e0b' }}>{topic?.difficulty || 'Medium'}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
            Historical Weightage: <strong style={{ color: '#10b981' }}>{topic?.syllabusWeight || 80}% Weightage</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Left Column: Learning Checklist & Prerequisites */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Prerequisites */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCheckCircle style={{ color: '#2563eb' }} /> Prerequisites
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topic?.prerequisites?.map((pre, i) => (
                <li key={i}>{pre}</li>
              )) || <li>Basic fundamental subject knowledge</li>}
            </ul>
          </div>

          {/* Concepts to Learn */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBookOpen style={{ color: '#10b981' }} /> Key Concepts to Master
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topic?.conceptsToLearn?.map((concept, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', fontSize: 13.5, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                    {i + 1}
                  </div>
                  {concept}
                </div>
              )) || <div style={{ fontSize: 13, color: '#64748b' }}>Standard concepts syllabus topic</div>}
            </div>
          </div>

          {/* Revision Checklist */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiRefreshCw style={{ color: '#f59e0b' }} /> Revision & Formula Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topic?.revisionChecklist?.map((chk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#475569' }}>
                  <FiCheck style={{ color: '#10b981' }} /> {chk}
                </div>
              )) || <div style={{ fontSize: 13, color: '#64748b' }}>Formula and shortcuts review</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Practice Logger & Adaptive Calibration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              🎯 Topic Practice Logger
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748b' }}>
              Record practice question scores to update your adaptive study plan and topic mastery status.
            </p>

            <form onSubmit={handleRecordPractice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Questions Attempted
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={questionsAttempted}
                  onChange={(e) => setQuestionsAttempted(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Correct Answers
                </label>
                <input
                  type="number"
                  min="0"
                  max={questionsAttempted}
                  value={correctAnswers}
                  onChange={(e) => setCorrectAnswers(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              {questionsAttempted > 0 && (
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, fontSize: 13, color: '#334155' }}>
                  Calculated Accuracy: <strong style={{ color: '#2563eb' }}>{Math.round((correctAnswers / questionsAttempted) * 100)}%</strong>
                </div>
              )}

              {savedSuccess && (
                <div style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                  ✓ Progress recorded! Adaptive study plan updated.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {submitting ? 'Recording...' : 'Save & Update Adaptive Plan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
