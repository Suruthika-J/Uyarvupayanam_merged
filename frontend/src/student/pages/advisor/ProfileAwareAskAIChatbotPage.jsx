import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { SBtn, SCard, SInput, SLoader } from '../../components/ui'
import { FiMessageSquare, FiSend, FiUser, FiZap, FiBookOpen } from 'react-icons/fi'

export default function ProfileAwareAskAIChatbotPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Uyarvu AI Academic Advisor. I am tuned to your specific degree, domain, and skills. What academic or career question can I assist you with today?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const updated = [...messages, { sender: 'user', text: userMsg }]
    setMessages(updated)
    setLoading(true)

    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/chat',
        { message: userMsg, chatHistory: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && res.data.reply) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am experiencing a temporary connection issue. Please feel free to ask again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
            <FiZap size={13} /> Intelligent Domain Telemetry
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '4px 0 0' }}>
            Profile-Aware AI Academic Advisor
          </h2>
        </div>
      </div>

      {/* Chat Messages Card */}
      <SCard style={{ flex: 1, padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 8 }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user'
            return (
              <div
                key={idx}
                style={{
                  display: 'flex', gap: 12, justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#047857', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
                    AI
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '78%', padding: '14px 18px', borderRadius: 16,
                    background: isUser ? 'var(--s-primary)' : '#f1f5f9',
                    color: isUser ? '#fff' : 'var(--s-text)',
                    fontSize: 14, lineHeight: 1.6, fontWeight: 500,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text}
                </div>

                {isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    You
                  </div>
                )}
              </div>
            )
          })}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}>
              <SLoader /> Thinking and crafting profile-customized academic guidance...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--s-border)', display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your degree, domain skills, or target careers..."
            style={{
              flex: 1, padding: '12px 18px', borderRadius: 12, border: '1px solid var(--s-border)',
              fontSize: 14, outline: 'none'
            }}
          />
          <SBtn variant="primary" onClick={handleSend} disabled={loading} style={{ borderRadius: 12, padding: '12px 24px' }}>
            <FiSend size={16} />
          </SBtn>
        </div>
      </SCard>

    </div>
  )
}
