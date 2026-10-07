import React, { useState, useEffect } from 'react'
import { SCard, SInput, SBtn, SSelect, SBadge, SLoader } from '../../components/ui'
import {
  FiMessageSquare, FiSend, FiCheckCircle, FiClock,
  FiUser, FiArrowRight, FiX, FiCheck, FiUsers, FiHelpCircle
} from 'react-icons/fi'
import axiosInstance from '../../../config/axios'
import { useCollegeProfile } from '../../context/CollegeProfileContext'

const LOCAL_STORAGE_KEY = 'college_student_doubts_history'

export default function DoubtResolutionPage() {
  const { profile } = useCollegeProfile()
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState(profile?.domain || 'Core Engineering')
  const [doubts, setDoubts] = useState([])
  const [answering, setAnswering] = useState(false)

  // Mentor Escalation states
  const [mentors, setMentors] = useState([])
  const [mentorRequests, setMentorRequests] = useState([])
  const [selectedDoubt, setSelectedDoubt] = useState(null)
  const [selectedMentor, setSelectedMentor] = useState('')
  const [escalating, setEscalating] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [activeTab, setActiveTab] = useState('doubts') // 'doubts' | 'escalations'

  // Load saved doubts and mentor data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        let parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          // Drop the old fabricated sample doubt (id `d1`, date "Sample") that an
          // earlier build seeded — only doubts the student actually asked (and
          // their real AI answers) are ever shown or stored from now on.
          parsed = parsed.filter((d) => !(d && d.id === 'd1' && d.date === 'Sample'))
        }
        setDoubts(parsed)
      }
      // Fresh visit: start with an empty list — no fabricated sample doubts.
    } catch (e) {
      console.warn('Could not parse local doubts')
    }

    const fetchMentorData = async () => {
      try {
        const [mRes, rRes] = await Promise.allSettled([
          axiosInstance.get('/study-tools/mentors'),
          axiosInstance.get('/study-tools/mentors/student-requests')
        ])

        if (mRes.status === 'fulfilled' && mRes.value.data?.success && Array.isArray(mRes.value.data.mentors)) {
          setMentors(mRes.value.data.mentors)
          if (mRes.value.data.mentors[0]) {
            setSelectedMentor(mRes.value.data.mentors[0].name)
          } else {
            setSelectedMentor('General Mentor Pool')
          }
        } else {
          // No mentors configured yet — never show fabricated mentor profiles.
          setMentors([])
          setSelectedMentor('General Mentor Pool')
        }

        if (rRes.status === 'fulfilled' && rRes.value.data?.success && Array.isArray(rRes.value.data.requests)) {
          setMentorRequests(rRes.value.data.requests)
        }
      } catch (err) {
        console.warn('Failed to load mentor data')
      }
    }

    fetchMentorData()
  }, [])

  const saveDoubts = (newList) => {
    setDoubts(newList)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList))
    } catch (e) {
      console.warn('Failed to save doubts')
    }
  }

  // Submit Doubt -> Get Real AI Solution
  const handlePostDoubt = async () => {
    if (!question.trim() || answering) return
    const currentQ = question.trim()
    const currentSub = subject.trim() || 'Core Academic Subject'
    const newId = Date.now().toString()

    const pendingItem = {
      id: newId,
      subject: currentSub,
      question: currentQ,
      status: 'AI Generating Answer...',
      aiAnswer: null,
      date: 'Just now'
    }

    const updated = [pendingItem, ...doubts]
    saveDoubts(updated)
    setQuestion('')
    setAnswering(true)

    try {
      const res = await axiosInstance.post('/study-tools/chat', {
        message: `Please provide a clear, step-by-step academic explanation and solution for this question in ${currentSub}:\n\n"${currentQ}"`
      })

      const replyText = res.data?.reply || 'Could not generate an AI answer at this moment. You can escalate this question to a peer mentor below.'

      const finished = updated.map(item =>
        item.id === newId
          ? { ...item, status: 'AI Answered', aiAnswer: replyText }
          : item
      )
      saveDoubts(finished)
    } catch (err) {
      const fallbackList = updated.map(item =>
        item.id === newId
          ? { ...item, status: 'Needs Mentor Help', aiAnswer: 'AI resolution temporarily unavailable. Click below to escalate to a mentor.' }
          : item
      )
      saveDoubts(fallbackList)
    } finally {
      setAnswering(false)
    }
  }

  // Escalate to Real Mentor in MongoDB
  const handleEscalateToMentor = async () => {
    if (!selectedDoubt || escalating) return
    setEscalating(true)
    try {
      const res = await axiosInstance.post(
        '/study-tools/mentors/doubt-request',
        {
          subject: selectedDoubt.subject,
          question: selectedDoubt.question,
          mentorId: selectedMentor || 'Senior Peer Mentor',
          message: `Escalated question: ${selectedDoubt.question}`
        }
      )

      if (res.data?.success) {
        setEscalated(true)
        // Refresh requests list
        const rRes = await axiosInstance.get('/study-tools/mentors/student-requests')
        if (rRes.data?.success && Array.isArray(rRes.data.requests)) {
          setMentorRequests(rRes.data.requests)
        }

        setTimeout(() => {
          setEscalated(false)
          setSelectedDoubt(null)
        }, 1500)
      }
    } catch (err) {
      alert('Failed to escalate request to peer mentor.')
    } finally {
      setEscalating(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }} className="s-anim-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiMessageSquare size={14} /> AI-Powered Doubt Clearing & Mentor Escalation
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          My Academic Doubts & Resolution Gateway
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Ask academic questions for instant AI-tailored solutions. Escalate to verified campus peer mentors anytime.
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab('doubts')}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: activeTab === 'doubts' ? 'var(--s-primary)' : 'var(--s-card)',
            color: activeTab === 'doubts' ? '#fff' : 'var(--s-text)',
            fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: 'var(--s-shadow-sm)'
          }}
        >
          Ask & View Doubts ({doubts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('escalations')}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: activeTab === 'escalations' ? 'var(--s-primary)' : 'var(--s-card)',
            color: activeTab === 'escalations' ? '#fff' : 'var(--s-text)',
            fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: 'var(--s-shadow-sm)'
          }}
        >
          Mentor Escalations ({mentorRequests.length})
        </button>
      </div>

      {activeTab === 'doubts' ? (
        <>
          {/* ASK QUESTION CARD */}
          <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
              Ask an Academic Question
            </h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                Subject / Core Area
              </label>
              <SInput
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems, Power Electronics, Thermodynamics, Data Structures"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                Your Academic Question / Problem Statement *
              </label>
              <textarea
                rows={4}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Type your exact doubt, code snippet question, or engineering problem..."
                style={{
                  width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--s-border)',
                  fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical'
                }}
              />
            </div>

            <SBtn variant="primary" onClick={handlePostDoubt} disabled={!question.trim() || answering} style={{ borderRadius: 12 }}>
              {answering ? (
                <>AI is Generating Explanation...</>
              ) : (
                <><FiSend size={15} style={{ marginRight: 6 }} /> Get Instant AI Explanation</>
              )}
            </SBtn>
          </SCard>

          {/* DOUBTS FEED */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {doubts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: 20, border: '1px dashed var(--s-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginBottom: 6 }}>
                  No doubts yet
                </div>
                <div style={{ fontSize: 12, color: 'var(--s-text3)', lineHeight: 1.6 }}>
                  Ask your first academic question above — the AI answer and any mentor escalation will appear here.
                </div>
              </div>
            )}
            {doubts.map((d) => (
              <SCard key={d.id} style={{ padding: 24, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-primary)' }}>
                    📚 {d.subject}
                  </span>
                  <SBadge color={d.status === 'AI Answered' ? 'green' : d.status === 'Needs Mentor Help' ? 'orange' : 'purple'}>
                    {d.status}
                  </SBadge>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', marginBottom: 12, lineHeight: 1.4 }}>
                  {d.question}
                </div>

                {d.aiAnswer ? (
                  <div style={{
                    background: '#f8fafc', border: '1px solid var(--s-border)',
                    padding: 16, borderRadius: 14, fontSize: 13, color: 'var(--s-text)',
                    lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap'
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#047857', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCheckCircle size={14} /> Verified Academic Solution
                    </div>
                    {d.aiAnswer}
                  </div>
                ) : (
                  <div style={{ padding: 16, textAlign: 'center' }}>
                    <SLoader />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--s-border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--s-text3)' }}>{d.date}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDoubt(d)}
                    style={{
                      background: '#047857', color: '#fff', border: 'none',
                      padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    Escalate to Peer Mentor <FiArrowRight size={13} />
                  </button>
                </div>
              </SCard>
            ))}
          </div>
        </>
      ) : (
        /* MENTOR ESCALATIONS VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mentorRequests.length > 0 ? (
            mentorRequests.map((r, idx) => (
              <SCard key={r._id || idx} style={{ padding: 22, borderRadius: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-primary)' }}>
                    {r.subject || 'Academic Query'}
                  </div>
                  <SBadge color={r.status === 'accepted' ? 'green' : r.status === 'completed' ? 'blue' : 'orange'}>
                    {r.status || 'Pending'}
                  </SBadge>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text)', marginBottom: 6 }}>
                  "{r.question || r.message}"
                </div>
                <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>
                  Assigned Mentor: <strong>{r.mentorId || 'Senior Domain Mentor'}</strong>
                </div>
              </SCard>
            ))
          ) : (
            <SCard style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>No Mentor Escalations Yet</h3>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: 0 }}>
                When you need personalized 1-on-1 human guidance on any doubt, click "Escalate to Peer Mentor" on any question.
              </p>
            </SCard>
          )}
        </div>
      )}

      {/* ESCALATION MODAL */}
      {selectedDoubt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 520, borderRadius: 22, padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                Escalate Question to Peer Mentor
              </h3>
              <button type="button" onClick={() => setSelectedDoubt(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <FiX size={16} />
              </button>
            </div>

            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, marginBottom: 18, fontSize: 13, color: 'var(--s-text)', border: '1px solid var(--s-border)' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Selected Doubt:</span>
              <p style={{ margin: '4px 0 0', fontWeight: 700 }}>"{selectedDoubt.question}"</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                Select Available Campus Mentor
              </label>
              <SSelect
                value={selectedMentor}
                onChange={e => setSelectedMentor(e.target.value)}
                options={
                  mentors.length > 0
                    ? mentors.map(m => ({
                        value: m.name,
                        label: `${m.name} (${(m.expertise || []).slice(0, 2).join(', ')}) — Rating: ${m.rating || '4.9'}⭐`
                      }))
                    : [
                        { value: 'General Mentor Pool', label: 'General Mentor Pool — routed to an available mentor on submit' }
                      ]
                }
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <SBtn variant="secondary" onClick={() => setSelectedDoubt(null)} type="button">
                Cancel
              </SBtn>
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
