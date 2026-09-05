import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import { calculatePeerCompatibility } from '../../services/collegeFeatureEligibilityEngine'
import {
  FiUser, FiStar, FiMessageSquare, FiCheckCircle, FiSend, FiX, FiCheck,
  FiZap, FiUsers, FiHelpCircle, FiRepeat, FiBookOpen, FiShield, FiPlusCircle
} from 'react-icons/fi'

export default function PeerMentorshipPage() {
  const { profile } = useCollegeProfile()
  const [mentors, setMentors] = useState([])
  const [studentRequests, setStudentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Peer Filter Category: 'all' | 'learnTogether' | 'askForHelp' | 'youCanHelp' | 'skillExchange'
  const [activeCategory, setActiveCategory] = useState('all')

  // Peer Request Modal state
  const [requestPeerModal, setRequestPeerModal] = useState(null)
  const [requestReason, setRequestReason] = useState('Learn Together')
  const [requestNote, setRequestNote] = useState('')

  // Chat & Feedback state
  const [activeChatRequest, setActiveChatRequest] = useState(null)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'mentor', text: 'Hello! I saw your peer learning request. How can we collaborate on our study goals today?' }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [ratingModalReq, setRatingModalReq] = useState(null)
  const [rating, setRating] = useState(5)

  // Demo Peer Pool (Domain-aware peers generated for college student network)
  const [peersPool, setPeersPool] = useState([])

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

  // Build dynamic intelligent peer recommendations based on user profile
  useEffect(() => {
    if (!profile) return

    const myDomain = profile?.domain || 'Computer Science'
    const myYear = profile?.currentYear || '3rd Year'

    const samplePeers = [
      {
        id: 'peer-1',
        name: 'Siddharth R.',
        field: profile.field || 'Engineering',
        degree: profile.degreeProgramme || 'B.Tech',
        domain: myDomain,
        currentYear: myYear,
        skills: ['Python', 'Data Structures', 'DBMS'],
        strengths: ['Data Structures', 'Algorithms'],
        onboardingBaseline: { areasToStrengthen: ['SQL', 'Web Development'] },
        avatar: '👨‍💻'
      },
      {
        id: 'peer-2',
        name: 'Ananya V.',
        field: profile.field || 'Engineering',
        degree: profile.degreeProgramme || 'B.Tech',
        domain: myDomain,
        currentYear: myYear,
        skills: ['SQL', 'React', 'Node.js'],
        strengths: ['SQL', 'Database Management Systems'],
        onboardingBaseline: { areasToStrengthen: ['Python', 'Machine Learning'] },
        avatar: '👩‍💻'
      },
      {
        id: 'peer-3',
        name: 'Vikram K.',
        field: profile.field || 'Engineering',
        degree: profile.degreeProgramme || 'B.Tech',
        domain: myDomain,
        currentYear: myYear,
        skills: ['Java', 'Operating Systems', 'System Design'],
        strengths: ['Operating Systems', 'Java'],
        onboardingBaseline: { areasToStrengthen: ['Data Structures'] },
        avatar: '👨‍🎓'
      },
      {
        id: 'peer-4',
        name: 'Priya M.',
        field: profile.field || 'Engineering',
        degree: profile.degreeProgramme || 'B.Tech',
        domain: myDomain,
        currentYear: myYear,
        skills: ['Python', 'SQL', 'Machine Learning'],
        strengths: ['Machine Learning', 'Python'],
        onboardingBaseline: { areasToStrengthen: ['Operating Systems'] },
        avatar: '👩‍🔬'
      }
    ]

    // Compute compatibility for each peer
    const scoredPeers = samplePeers.map(peer => {
      const match = calculatePeerCompatibility(profile, peer)
      return { ...peer, match }
    })

    setPeersPool(scoredPeers)
  }, [profile])

  const handleSendPeerRequest = async () => {
    if (!requestPeerModal) return
    try {
      const token = localStorage.getItem('studentToken')
      await axios.post(
        'http://localhost:5000/api/study-tools/mentors/doubt-request',
        {
          mentorId: requestPeerModal.name,
          subject: `${requestReason} — ${requestPeerModal.match.categoryLabel}`,
          question: requestNote || `Hi ${requestPeerModal.name}, I would love to connect for ${requestReason}.`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRequestPeerModal(null)
      setRequestNote('')
      fetchData()
    } catch (err) {
      alert('Failed to send peer request.')
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
      { sender: 'mentor', text: `That sounds great! Let's schedule a study block together to solve problem sets.` }
    ])
    setInputMsg('')
  }

  const filteredPeers = peersPool.filter(p => {
    if (activeCategory === 'all') return true
    return p.match.category === activeCategory
  })

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Matching top domain peers & loading active network requests...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }} className="s-anim-up">
      {/* HEADER BANNER */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiUsers size={14} /> Intelligent Peer Learning Network
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            College Peer Matching & Study Partnerships
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Domain-aware peer matching based on academic similarity, skill complementarity, and mutual goals.
          </p>
        </div>

        {/* Privacy Badge */}
        <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiShield color="#0284c7" size={16} />
          <strong>Privacy Protected:</strong> Phone numbers & emails are never exposed.
        </div>
      </div>

      {/* ── ACTIVE PEER REQUESTS TRACKER ───────────────────────────────────── */}
      {studentRequests.length > 0 && (
        <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
            My Active Peer Connections & Requests ({studentRequests.length})
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
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>{req.assignedMentor || 'Peer Connection'}</span>
                      <SBadge color={isAccepted ? 'green' : isCompleted ? 'blue' : 'orange'}>
                        {req.status}
                      </SBadge>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>
                      Reason: <strong>{req.interest}</strong> — "{req.message}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleActionRequest(req._id, 'accept')}
                        style={{ background: '#047857', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Simulate Peer Accept
                      </button>
                    )}

                    {isAccepted && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveChatRequest(req)}
                          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <FiMessageSquare size={14} /> Open Peer Chat
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
                        ✓ Completed Session
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </SCard>
      )}

      {/* ── PEER MATCH CATEGORY FILTER TABS ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { id: 'all', label: 'All Intelligent Recommendations', icon: FiUsers },
          { id: 'skillExchange', label: '⚡ Mutual Skill Exchange', icon: FiRepeat },
          { id: 'learnTogether', label: '🤝 Learn Together', icon: FiBookOpen },
          { id: 'askForHelp', label: '🆘 Ask for Help', icon: FiHelpCircle },
          { id: 'youCanHelp', label: '🎓 You Can Help', icon: FiZap }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveCategory(id)}
            style={{
              padding: '10px 18px', borderRadius: 14, fontWeight: 800, fontSize: 13, cursor: 'pointer',
              background: activeCategory === id ? '#0284c7' : '#fff',
              color: activeCategory === id ? '#fff' : '#475569',
              border: activeCategory === id ? 'none' : '1px solid #cbd5e1',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── RECOMMENDED PEER CARDS GRID ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40 }}>
        {filteredPeers.map((peer) => {
          const m = peer.match
          const isSkillExchange = m.category === 'skillExchange'

          return (
            <SCard key={peer.id} style={{
              padding: 24, borderRadius: 20, position: 'relative',
              border: isSkillExchange ? '2px solid #3b82f6' : '1px solid var(--s-border)',
              boxShadow: isSkillExchange ? '0 8px 24px rgba(59, 130, 246, 0.12)' : 'none'
            }}>
              {/* Category Badge & Compatibility % */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 10,
                  background: isSkillExchange ? '#eff6ff' : '#f1f5f9',
                  color: isSkillExchange ? '#2563eb' : '#475569'
                }}>
                  {m.categoryLabel}
                </span>

                <span style={{ fontSize: 14, fontWeight: 900, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: 12 }}>
                  {m.matchScore}% Match
                </span>
              </div>

              {/* Peer Info (Privacy Safe: Display Name Only) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 34 }}>{peer.avatar}</div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    {peer.name}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--s-primary)', fontWeight: 700 }}>
                    {peer.degree} • {peer.domain} ({peer.currentYear})
                  </div>
                </div>
              </div>

              {/* Transparent Compatibility Explanation */}
              <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 14, lineHeight: 1.4 }}>
                💡 <strong>Why matched:</strong> {m.explanation}
              </div>

              {/* Skills Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {peer.skills.map((sk, idx) => (
                  <span key={idx} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#e2e8f0', color: '#334155', fontWeight: 700 }}>
                    {sk}
                  </span>
                ))}
              </div>

              {/* Connect Button */}
              <button
                type="button"
                onClick={() => setRequestPeerModal(peer)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, background: '#0284c7', color: '#fff',
                  fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <FiPlusCircle size={16} /> Send Peer Connection Request
              </button>
            </SCard>
          )
        })}
      </div>

      {/* ── PEER REQUEST MODAL ──────────────────────────────────────────────── */}
      {requestPeerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 480, borderRadius: 20, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Peer Request to {requestPeerModal.name}
              </h3>
              <button type="button" onClick={() => setRequestPeerModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Select Connection Reason
              </label>
              <select
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 700 }}
              >
                <option value="Learn Together">Learn Together (Shared Subjects)</option>
                <option value="Need Help">Need Help in Topic</option>
                <option value="Mutual Skill Exchange">Mutual Skill Exchange</option>
                <option value="Coding Practice">Coding & DSA Practice</option>
                <option value="Exam Preparation">Exam & Placement Prep</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Optional Introductory Note
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Hi! I saw you're strong in Data Structures. Would love to practice together for placements."
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <SBtn variant="secondary" onClick={() => setRequestPeerModal(null)}>Cancel</SBtn>
              <SBtn variant="primary" onClick={handleSendPeerRequest}>Send Request</SBtn>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE CHAT MODAL ─────────────────────────────────────────────────── */}
      {activeChatRequest && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 600, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', height: 520, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--s-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                  Peer Chat with {activeChatRequest.assignedMentor}
                </h3>
                <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>● Online & Active Peer Session</span>
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
                    background: msg.sender === 'student' ? '#0284c7' : '#f1f5f9',
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
                placeholder="Type your message to peer..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--s-border)', outline: 'none', fontSize: 13 }}
              />
              <SBtn variant="primary" onClick={handleSendMessage} style={{ borderRadius: 12 }}>
                <FiSend size={15} />
              </SBtn>
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 450, borderRadius: 20, padding: 26 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>
              Mark Session Completed
            </h3>
            <p style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 16 }}>
              How was your peer session with <strong>{ratingModalReq.assignedMentor}</strong>?
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
                Complete Session
              </SBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
