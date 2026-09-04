import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import { FiUser, FiStar, FiMessageSquare, FiCheckCircle, FiSend, FiX, FiCheck } from 'react-icons/fi'

export default function PeerMentorshipPage() {
  const [mentors, setMentors] = useState([])
  const [studentRequests, setStudentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Chat & Feedback state
  const [activeChatRequest, setActiveChatRequest] = useState(null)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'mentor', text: 'Hello! I saw your doubt request regarding Data Structures & DBMS. How can I guide you today?' }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [ratingModalReq, setRatingModalReq] = useState(null)
  const [rating, setRating] = useState(5)

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const mRes = await axios.get('http://localhost:5000/api/study-tools/mentors', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (mRes.data?.success && Array.isArray(mRes.data.mentors)) {
        setMentors(mRes.data.mentors)
      }

      const rRes = await axios.get('http://localhost:5000/api/study-tools/mentors/student-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (rRes.data?.success && Array.isArray(rRes.data.requests)) {
        setStudentRequests(rRes.data.requests)
      }
    } catch (err) {
      console.warn('Failed to fetch mentorship data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleConnect = async (mentorObj) => {
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/mentors/doubt-request',
        {
          mentorId: mentorObj.name,
          subject: mentorObj.expertise?.[0] || 'Core Domain',
          question: '1-on-1 Academic & Career Guidance Request'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success) {
        fetchData()
      }
    } catch (err) {
      alert('Failed to send mentor request.')
    }
  }

  const handleActionRequest = async (requestId, action, feedbackRating) => {
    try {
      const token = localStorage.getItem('studentToken')
      await axios.post(
        'http://localhost:5000/api/study-tools/mentors/request-action',
        { requestId, action, feedbackRating },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRatingModalReq(null)
      fetchData()
    } catch (err) {
      alert('Failed to update request action.')
    }
  }

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return
    setChatMessages(prev => [
      ...prev,
      { sender: 'student', text: inputMsg },
      { sender: 'mentor', text: `Thanks for the input. I recommend practicing this concept with sample problems and reviewing the study planner checklist.` }
    ])
    setInputMsg('')
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Matching top domain peer mentors & loading active requests...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER BANNER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiUser size={14} /> Peer & Senior Academic Support
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          College Peer Mentorship & Live Chat
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Connect with verified senior college mentors in your degree domain for study guidance, live chat, and placement advice.
        </p>
      </div>

      {/* ACTIVE MENTOR REQUESTS TRACKER */}
      {studentRequests.length > 0 && (
        <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
            My Active Guidance & Doubt Requests ({studentRequests.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {studentRequests.map((req) => {
              const isPending = req.status === 'Pending'
              const isAccepted = req.status === 'Accepted'
              const isCompleted = req.status === 'Completed'

              return (
                <div key={req._id} style={{
                  padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>{req.assignedMentor || 'Assigned Mentor'}</span>
                      <SBadge color={isAccepted ? 'green' : isCompleted ? 'blue' : 'orange'}>
                        {req.status}
                      </SBadge>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>
                      Subject: <strong>{req.interest}</strong> — "{req.message}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleActionRequest(req._id, 'accept')}
                        style={{ background: '#047857', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Simulate Mentor Accept
                      </button>
                    )}

                    {isAccepted && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveChatRequest(req)}
                          style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <FiMessageSquare size={13} /> Open Live Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => setRatingModalReq(req)}
                          style={{ background: '#047857', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                        >
                          Mark Resolved
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <span style={{ fontSize: 12, color: '#047857', fontWeight: 800 }}>
                        ✓ Resolved ({req.adminNotes || '5 Stars'})
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </SCard>
      )}

      {/* VERIFIED MENTORS CARDS GRID */}
      <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', marginBottom: 16 }}>
        Verified Senior Domain Mentors
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {mentors.map((m) => (
          <SCard key={m.id} style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 34 }}>{m.avatar}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>{m.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--s-primary)', fontWeight: 700 }}>{m.degree}</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--s-text3)', marginBottom: 12 }}>
              🏫 {m.college}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {m.expertise?.map((exp, idx) => (
                <span key={idx} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#f1f5f9', color: 'var(--s-text2)', fontWeight: 700 }}>
                  • {exp}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#b45309' }}>
                ⭐ {m.rating} Rating
              </span>

              <SBtn
                variant="primary"
                onClick={() => handleConnect(m)}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12 }}
              >
                Connect with Mentor
              </SBtn>
            </div>
          </SCard>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* LIVE CHAT MODAL                                             */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeChatRequest && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 600, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', height: 500, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--s-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                  Live Chat with {activeChatRequest.assignedMentor}
                </h3>
                <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>● Online & Connected</span>
              </div>
              <button type="button" onClick={() => setActiveChatRequest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={22} />
              </button>
            </div>

            {/* MESSAGES BODY */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 6 }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'student' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
                    background: msg.sender === 'student' ? 'var(--s-primary)' : '#f1f5f9',
                    color: msg.sender === 'student' ? '#fff' : 'var(--s-text)',
                    fontSize: 13, fontWeight: 600, lineHeight: 1.5
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* INPUT FOOTER */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
              <input
                type="text"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message to mentor..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--s-border)', outline: 'none', fontSize: 13 }}
              />
              <SBtn variant="primary" onClick={handleSendMessage} style={{ borderRadius: 12 }}>
                <FiSend size={15} />
              </SBtn>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* RATING & FEEDBACK MODAL                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {ratingModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 450, borderRadius: 20, padding: 26, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>
              Mark Request Resolved & Rate Mentor
            </h3>
            <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 16 }}>
              How was your 1-on-1 mentorship session with <strong>{ratingModalReq.assignedMentor}</strong>?
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none', border: 'none', fontSize: 28, cursor: 'pointer',
                    color: star <= rating ? '#b45309' : '#cbd5e1'
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <SBtn variant="secondary" onClick={() => setRatingModalReq(null)}>Cancel</SBtn>
              <SBtn variant="primary" onClick={() => handleActionRequest(ratingModalReq._id, 'complete', rating)}>
                Submit Rating & Complete
              </SBtn>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
