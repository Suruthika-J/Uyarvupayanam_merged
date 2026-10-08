import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader } from '../../components/ui'
import { FiSend, FiUser, FiArrowLeft, FiMessageSquare } from 'react-icons/fi'

export default function GraduatePeerChatPage() {
  const { relationshipId } = useParams()
  const { student } = useStudentAuth()

  const [relationship, setRelationship] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const fetchChatData = async () => {
    try {
      const res = await graduateService.getRelationshipMessages(relationshipId)
      if (res?.success) {
        setRelationship(res.relationship)
        setMessages(res.messages || [])
      }
    } catch (err) {
      console.warn('Fetch relationship chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChatData()
    const interval = setInterval(fetchChatData, 5000) // Poll every 5s for new messages
    return () => clearInterval(interval)
  }, [relationshipId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return
    const text = inputMsg.trim()
    setInputMsg('')
    setSending(true)

    try {
      const res = await graduateService.sendRelationshipMessage(relationshipId, text)
      if (res?.success && res.message) {
        setMessages(prev => [...prev, res.message])
      }
    } catch (err) {
      alert('Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Loading 1-on-1 mentorship chat thread...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }} className="s-anim-up">

      {/* HEADER BAR */}
      <SCard style={{ padding: '16px 24px', borderRadius: 20, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/graduate/peer-mentor" style={{ color: 'var(--s-text2)' }}>
            <FiArrowLeft size={20} />
          </Link>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
            {relationship?.studentName?.[0] || 'S'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
              {relationship?.studentName || 'Student Mentee'}
            </div>
            <div style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
              Topic: {relationship?.interest || 'Career & Technical Guidance'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--s-text3)', background: '#f1f5f9', padding: '6px 14px', borderRadius: 12, fontWeight: 700 }}>
          1-on-1 Mentorship Thread
        </div>
      </SCard>

      {/* MESSAGES CONTAINER */}
      <SCard style={{ flex: 1, padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 6 }}>
          
          {/* Initial Topic Header */}
          <div style={{ padding: 14, borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af', marginBottom: 10 }}>
            <strong>Mentorship Topic:</strong> {relationship?.interest}<br />
            <strong>Student Inquiry:</strong> "{relationship?.message}"
          </div>

          {messages.map((msg, idx) => {
            const isMe = String(msg.senderId) === String(student?._id || student?.id)
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%', padding: '12px 16px', borderRadius: 18,
                  background: isMe ? 'var(--s-primary)' : '#f1f5f9',
                  color: isMe ? '#fff' : 'var(--s-text)',
                  fontSize: 13.5, fontWeight: 500, lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {msg.content}
                <div style={{ fontSize: 10, opacity: 0.75, textAlign: 'right', marginTop: 4 }}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
          <input
            type="text"
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message to student mentee..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: '1px solid var(--s-border)', outline: 'none', fontSize: 13.5 }}
          />
          <SBtn variant="primary" onClick={handleSendMessage} disabled={sending} style={{ padding: '0 24px', borderRadius: 14 }}>
            <FiSend size={16} />
          </SBtn>
        </div>
      </SCard>

    </div>
  )
}
