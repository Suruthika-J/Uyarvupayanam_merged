import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import { SBtn, SCard, SLoader, SBadge, StreamingText } from '../../components/ui'
import { FiMessageSquare, FiSend, FiUser, FiZap, FiBookOpen, FiTarget, FiCompass } from 'react-icons/fi'
import { useStudentContext } from '../../context/CollegeProfileContext'

export default function ProfileAwareAskAIChatbotPage() {
  const { studentContext } = useStudentContext()
  const studentName = studentContext?.name || 'Student'
  const degree = studentContext?.degree || 'College Degree'
  const semester = studentContext?.semester || ''
  const targetCareer = studentContext?.targetCareer || 'Software Engineer'
  const skills = studentContext?.skills || []
  const subjects = studentContext?.subjects || []

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${studentName}! I am your Uyarvu AI Academic Advisor, personalized for your **${degree}** coursework (${semester || 'Current Semester'}) and your target career as a **${targetCareer}**.\n\nI have access to your active subjects${subjects.length > 0 ? ` (${subjects.slice(0, 3).join(', ')})` : ''}, acquired skills, and target career skill gaps. What academic, interview, or study plan query can I help you with today?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (customText) => {
    const textToSend = (typeof customText === 'string' ? customText : input).trim()
    if (!textToSend || loading) return
    setInput('')

    const updated = [...messages, { sender: 'user', text: textToSend }]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await axiosInstance.post(
        '/study-tools/chat',
        { message: textToSend, chatHistory: updated }
      )
      if (res.data?.success && res.data.reply) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: res.data.reply,
          intent: res.data.intent,
          memorySources: (res.data.memorySources || []).filter(s => s && s.id)
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am experiencing a temporary connection issue. Please feel free to ask again.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    `What should I learn next to become a ${targetCareer}?`,
    subjects.length > 0 ? `How should I prepare for ${subjects[0]}?` : `How should I prepare for semester exams?`,
    `How do I balance semester coursework with placement prep?`,
    `What portfolio projects will impress recruiters for ${targetCareer}?`
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header with Student Context Telemetry Banner */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
            <FiZap size={13} /> Profile-Grounded AI Advisor
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/college/memories" style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 12, background: '#ede9fe', color: '#6d28d9', textDecoration: 'none' }}>
              🗂 My Memories
            </Link>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: '#e0f2fe', color: '#0369a1' }}>
              🎓 {degree}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: '#dcfce7', color: '#15803d' }}>
              🎯 Target: {targetCareer}
            </span>
            {semester && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: '#fef3c7', color: '#b45309' }}>
                📅 {semester}
              </span>
            )}
          </div>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
          AI Academic Advisor
        </h2>
        <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '2px 0 0' }}>
          Continuously attuned to your course, target career, and active skill gaps. Never generic.
        </p>
      </div>

      {/* Chat Messages Card */}
      <SCard style={{ flex: 1, padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 6 }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user'
            const srcs = !isUser && Array.isArray(m.memorySources) ? m.memorySources.filter(s => s && s.id) : []
            return (
              <React.Fragment key={idx}>
              <div
                style={{
                  display: 'flex', gap: 10, justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#047857', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                    AI
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%', padding: '12px 16px', borderRadius: 16,
                    background: isUser ? 'var(--s-primary)' : '#f8fafc',
                    color: isUser ? '#fff' : 'var(--s-text)',
                    border: isUser ? 'none' : '1px solid var(--s-border)',
                    fontSize: 13.5, lineHeight: 1.6, fontWeight: 500,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.intent && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 6, background: '#e2e8f0', color: '#475569' }}>
                        Intent: {m.intent}
                      </span>
                    </div>
                  )}
                  {isUser ? m.text : (
                    <StreamingText text={m.text} as="div" style={{ whiteSpace: 'pre-wrap' }} />
                  )}
                </div>

                {isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    You
                  </div>
                )}
              </div>
              {srcs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: '2px 0 6px 44px', padding: '9px 12px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6d28d9' }}>
                    🧠 From your saved memories
                  </div>
                  {srcs.map(s => (
                    <Link
                      key={s.id}
                      to={`/college/memories?open=${s.id}`}
                      style={{ fontSize: 12.5, color: '#4c1d95', fontWeight: 600, textDecoration: 'none', lineHeight: 1.45 }}
                    >
                      {s.title || s.type}: “{(s.excerpt || '').slice(0, 110)}{(s.excerpt || '').length > 110 ? '…' : ''}”
                    </Link>
                  ))}
                </div>
              )}
              </React.Fragment>
            )
          })}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13, padding: '8px 12px' }}>
              <SLoader /> Synthesizing profile-grounded advice for {targetCareer}...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 0 6px', borderTop: '1px solid var(--s-border)' }}>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp)}
              disabled={loading}
              style={{
                whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 16,
                background: '#f1f5f9', border: '1px solid var(--s-border)',
                fontSize: 12, fontWeight: 600, color: 'var(--s-text)',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9' }}
            >
              💡 {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ paddingTop: 8, display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Ask anything about ${subjects[0] || 'your subjects'}, skill gaps for ${targetCareer}, or exams...`}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--s-border)',
              fontSize: 13.5, outline: 'none'
            }}
          />
          <SBtn variant="primary" onClick={() => handleSend()} disabled={loading || !input.trim()} style={{ borderRadius: 12, padding: '12px 20px' }}>
            <FiSend size={15} />
          </SBtn>
        </div>
      </SCard>

    </div>
  )
}

