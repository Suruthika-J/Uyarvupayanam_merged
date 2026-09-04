import React, { useState } from 'react'
import { SCard, SInput, SBtn, SSelect } from '../../components/ui'
import { FiMessageSquare, FiSend, FiCheckCircle, FiClock, FiUser, FiArrowRight, FiX } from 'react-icons/fi'
import axios from 'axios'

export default function DoubtResolutionPage() {
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('Operating Systems')
  const [doubts, setDoubts] = useState([
    {
      id: 'd1',
      subject: 'Data Structures & Algorithms',
      question: 'What is the main advantage of AVL tree balance factor rotation over standard BST insertion?',
      status: 'AI Answered',
      aiAnswer: 'AVL trees strictly maintain O(log N) height via balance factor rotations, guaranteeing log N time complexity for lookups and insertions.',
      date: 'Today'
    }
  ])

  // Escalation Modal state
  const [selectedDoubt, setSelectedDoubt] = useState(null)
  const [escalating, setEscalating] = useState(false)
  const [mentorName, setMentorName] = useState('Arun Kumar (PSG Tech)')
  const [escalated, setEscalated] = useState(false)

  const handlePostDoubt = () => {
    if (!question.trim()) return
    const newDoubt = {
      id: Date.now().toString(),
      subject,
      question,
      status: 'AI Processing',
      aiAnswer: `For ${subject}: Consider reviewing core theoretical principles. In multi-threaded systems, process synchronization prevents race conditions using mutex locks and semaphores.`,
      date: 'Just now'
    }
    setDoubts([newDoubt, ...doubts])
    setQuestion('')
  }

  const handleEscalateToMentor = async () => {
    if (!selectedDoubt) return
    setEscalating(true)
    try {
      const token = localStorage.getItem('studentToken')
      await axios.post(
        'http://localhost:5000/api/study-tools/mentors/doubt-request',
        {
          subject: selectedDoubt.subject,
          question: selectedDoubt.question,
          mentorId: mentorName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEscalated(true)
      setTimeout(() => {
        setEscalated(false)
        setSelectedDoubt(null)
      }, 1500)
    } catch (err) {
      alert('Failed to escalate request to peer mentor.')
    } finally {
      setEscalating(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="s-anim-up">
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiMessageSquare size={14} /> Doubt Escalation Gateway
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          My Academic Doubts & Resolution Gateway
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Submit subject questions for instant AI guidance. If you still need help, escalate directly to verified peer mentors.
        </p>
      </div>

      {/* POST NEW DOUBT CARD */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
          Ask a New Academic Question
        </h3>

        <SInput
          label="Subject / Topic"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. Operating Systems, Data Structures, Machine Learning"
          style={{ marginBottom: 14 }}
        />

        <textarea
          rows={4}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your exact academic question or problem statement..."
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--s-border)',
            fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 16
          }}
        />

        <SBtn variant="primary" onClick={handlePostDoubt} disabled={!question.trim()} style={{ borderRadius: 12 }}>
          <FiSend size={15} style={{ marginRight: 6 }} /> Submit Doubt
        </SBtn>
      </SCard>

      {/* DOUBTS FEED WITH ESCALATION BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {doubts.map((d) => (
          <SCard key={d.id} style={{ padding: 22, borderRadius: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>{d.subject}</span>
              <span style={{ fontSize: 11, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                {d.status}
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', marginBottom: 10 }}>
              {d.question}
            </div>

            {d.aiAnswer && (
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 14, fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.5, marginBottom: 14 }}>
                💡 <strong>AI Guidance:</strong> {d.aiAnswer}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
              <button
                type="button"
                onClick={() => setSelectedDoubt(d)}
                style={{
                  background: '#047857', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                Still Need Help? Escalate to Peer Mentor <FiArrowRight size={12} />
              </button>
            </div>
          </SCard>
        ))}
      </div>

      {/* ESCALATION MODAL */}
      {selectedDoubt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 20, padding: 26, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                Escalate Doubt to Verified Mentor
              </h3>
              <button type="button" onClick={() => setSelectedDoubt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 16 }}>
              Question: "<strong>{selectedDoubt.question}</strong>"
            </p>

            <SSelect
              label="Select Peer Mentor in Domain"
              value={mentorName}
              onChange={e => setMentorName(e.target.value)}
              options={[
                { value: 'Arun Kumar (PSG Tech)', label: 'Arun Kumar — Computer Science (Rating 4.9⭐)' },
                { value: 'Priya Sundaram (Anna Univ)', label: 'Priya Sundaram — Data Science (Rating 4.8⭐)' },
                { value: 'Karthik Raja (CIT)', label: 'Karthik Raja — Full Stack Dev (Rating 4.95⭐)' }
              ]}
              style={{ marginBottom: 20 }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <SBtn variant="secondary" onClick={() => setSelectedDoubt(null)}>Cancel</SBtn>
              <SBtn variant="primary" onClick={handleEscalateToMentor} disabled={escalating}>
                {escalated ? '✓ Request Submitted!' : escalating ? 'Submitting...' : 'Send Mentor Request'}
              </SBtn>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
