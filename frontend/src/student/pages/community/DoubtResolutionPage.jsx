import React, { useState } from 'react'
import { SCard, SInput, SBtn } from '../../components/ui'
import { FiMessageSquare, FiSend, FiCheckCircle, FiClock } from 'react-icons/fi'

export default function DoubtResolutionPage() {
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('Operating Systems')
  const [doubts, setDoubts] = useState([
    {
      id: 'd1',
      subject: 'Data Structures & Algorithms',
      question: 'What is the main advantage of AVL tree balance factor rotation over standard BST insertion?',
      status: 'Answered',
      aiAnswer: 'AVL trees strictly maintain O(log N) height via balance factor rotations, guaranteeing log N time complexity for lookups and insertions.',
      date: 'Today'
    }
  ])

  const handlePostDoubt = () => {
    if (!question.trim()) return
    const newDoubt = {
      id: Date.now().toString(),
      subject,
      question,
      status: 'Open AI Processing',
      aiAnswer: 'AI Advisor is processing your question. Peer mentors have also been notified.',
      date: 'Just now'
    }
    setDoubts([newDoubt, ...doubts])
    setQuestion('')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiMessageSquare size={14} /> Doubt Escalation Gateway
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          My Academic Doubts & Resolution Status
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Submit complex subject questions. AI answers immediately, with options to escalate to peer mentors.
        </p>
      </div>

      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
          Ask a New Academic Doubt
        </h3>

        <SInput
          label="Subject / Topic"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. Computer Networks, Microprocessors"
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {doubts.map((d) => (
          <SCard key={d.id} style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>{d.subject}</span>
              <span style={{ fontSize: 11, background: d.status === 'Answered' ? '#d1fae5' : '#fef3c7', color: d.status === 'Answered' ? '#047857' : '#b45309', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                {d.status}
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', marginBottom: 10 }}>
              {d.question}
            </div>

            {d.aiAnswer && (
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.5 }}>
                💡 <strong>Answer:</strong> {d.aiAnswer}
              </div>
            )}
          </SCard>
        ))}
      </div>
    </div>
  )
}
