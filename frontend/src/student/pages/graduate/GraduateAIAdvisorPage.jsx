import React, { useState, useRef, useEffect } from 'react'
import {
  FiMessageSquare, FiSend, FiUser, FiZap,
  FiCopy, FiCheck, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

const SUGGESTED_PROMPTS = [
  'How do I switch from Mechanical/Civil to Data Analytics in 4 months?',
  'GATE vs immediate IT job: How should I decide as a fresher?',
  'How to explain a 6-month career preparation gap on my resume?',
  'What are the best tuition-free Master’s options in Germany?',
  'Suggest 2 unique full-stack capstone projects that impress recruiters.'
]

export default function GraduateAIAdvisorPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your dedicated **AI Graduate Career Advisor**. 

I have full context of your college graduation, technical skills, and career direction. Whether you are aiming to:
• Pivot to high-paying tech/data roles from another degree
• Decide between GATE, CAT, UPSC, or private sector jobs
• Evaluate M.Tech in India vs MS Abroad
• Polish your resume and crack off-campus interviews

Ask me any specific career question below or pick a suggestion to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim() || loading) return

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

      const res = await graduateService.chatAdvisor({
        message: text.trim(),
        history
      })

      const botMsg = {
        sender: 'assistant',
        text: res.reply || res.message || "I've analyzed your question. Focus on building practical projects with quantified metrics, and apply directly to early-stage hiring managers.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error('Failed to get advisor reply:', err)
      const errorMsg = {
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. However, for graduate career questions, our recommended pathway is to follow the 12-week roadmap and build verified portfolio projects.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 600 }}>
      {/* Header */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px 16px 0 0',
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
          }}>
            <FiZap size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
              AI Graduate Career Advisor
            </h2>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
              Profile-Aware & Always Online
            </div>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          style={{
            background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '6px 12px', fontSize: 12, color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
          }}
        >
          <FiRefreshCw size={12} /> Clear Chat
        </button>
      </div>

      {/* Chat Messages Body */}
      <div style={{
        flex: 1, background: '#f8fafc', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0',
        padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18
      }}>
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user'
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '82%' }}>
                {!isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#2563eb', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0
                  }}>
                    AI
                  </div>
                )}

                <div style={{
                  background: isUser ? '#2563eb' : '#fff',
                  color: isUser ? '#fff' : '#1e293b',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '14px 18px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  fontSize: 14, lineHeight: 1.6, position: 'relative',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}

                  {!isUser && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                      <button
                        onClick={() => handleCopy(m.text, idx)}
                        style={{
                          background: 'none', border: 'none', color: '#94a3b8',
                          cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, padding: 0
                        }}
                      >
                        {copiedIdx === idx ? <FiCheck size={12} color="#10b981" /> : <FiCopy size={12} />}
                        {copiedIdx === idx ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4, marginInline: 40 }}>
                {m.timestamp}
              </span>
            </div>
          )
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
              AI
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px 18px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', animation: 'bounce 1s infinite alternate' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', animation: 'bounce 1s infinite alternate 0.2s' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', animation: 'bounce 1s infinite alternate 0.4s' }} />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div style={{
        background: '#fff', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0',
        padding: '10px 18px', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid #f1f5f9'
      }}>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            style={{
              padding: '6px 12px', borderRadius: 20, border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#334155', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s'
            }}
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0 0 16px 16px',
        padding: '14px 20px', display: 'flex', gap: 10, alignItems: 'center'
      }}>
        <textarea
          rows={1}
          placeholder="Ask anything about your degree transition, exams, job offers, or resume..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1px solid #cbd5e1', fontSize: 14, resize: 'none',
            outline: 'none', fontFamily: 'inherit'
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#94a3b8' : '#2563eb',
            color: '#fff', border: 'none', borderRadius: 10,
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', flexShrink: 0
          }}
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  )
}
