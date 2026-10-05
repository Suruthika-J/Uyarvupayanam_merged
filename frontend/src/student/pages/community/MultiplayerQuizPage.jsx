import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { useCollegeTheme } from '../../context/CollegeThemeContext'
import axios from 'axios'
import { io as socketIo } from 'socket.io-client'
import {
  FiZap, FiClock, FiCheckCircle, FiXCircle, FiAward, FiMessageSquare,
  FiArrowLeft, FiPlay, FiCheck, FiX, FiRefreshCw, FiBookOpen, FiSend,
  FiSliders, FiUser, FiHelpCircle, FiChevronRight, FiShield
} from 'react-icons/fi'
import { SCard, SBtn, SBadge, SLoader } from '../../components/ui'

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const SOCKET_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')
const getToken = () => localStorage.getItem('studentToken')

export default function MultiplayerQuizPage() {
  const { sessionId } = useParams()
  const { student } = useStudentAuth()
  const { theme } = useCollegeTheme()
  const navigate = useNavigate()
  const myId = student?._id || student?.id

  // ── Session State ──
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [evalResult, setEvalResult] = useState(null) // { correctOption, explanation } after question round

  // ── Timer State ──
  const [countdownNum, setCountdownNum] = useState(null)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1500)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(45)

  // ── Final Results & Review ──
  const [resultsData, setResultsData] = useState(null)
  const [reviewData, setReviewData] = useState(null)
  const [showReview, setShowReview] = useState(false)

  // ── In-Quiz Side Chat ──
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const socketRef = useRef(null)
  const chatEndRef = useRef(null)
  const headers = { Authorization: `Bearer ${getToken()}` }

  // ── State for Synchronized Next Question Button ──
  const [nextQuestionReady, setNextQuestionReady] = useState(false)
  const [partnerNextQuestionReady, setPartnerNextQuestionReady] = useState(false)

  // ── Fetch Session State ──
  const fetchSession = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/multiplayer-quiz/${sessionId}`, { headers })
      if (res.data?.success) {
        setSession(res.data.session)
        console.log(`[QUIZ UI] Rendering topic: ${res.data.session.topicLabel || res.data.session.topic}`)
        setCurrentQuestion(res.data.currentQuestion)
        setHasAnswered(res.data.hasAnsweredCurrent || false)

        if (res.data.currentQuestionResult) {
          console.log('[QUIZ CLIENT] Loaded question result from session')
          setEvalResult(res.data.currentQuestionResult)
        }

        const readyUsers = res.data.session.nextQuestionReadyUsers || []
        const isMeReady = readyUsers.some(id => id.toString() === myId?.toString())
        const isOppReady = readyUsers.some(id => id.toString() !== myId?.toString())
        setNextQuestionReady(isMeReady)
        setPartnerNextQuestionReady(isOppReady)

        if (res.data.session.status === 'COMPLETED') {
          fetchResults()
        }
      } else {
        setError('Quiz session not found or unauthorized.')
      }
    } catch (err) {
      console.error('Fetch session error:', err)
      setError('Failed to load multiplayer quiz session.')
    } finally {
      setLoading(false)
    }
  }, [sessionId, myId])

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API}/multiplayer-quiz/${sessionId}/results`, { headers })
      if (res.data?.success) {
        setResultsData(res.data)
      }
    } catch (err) {
      console.error('Fetch results error:', err)
    }
  }

  const fetchReview = async () => {
    try {
      const res = await axios.get(`${API}/multiplayer-quiz/${sessionId}/review`, { headers })
      if (res.data?.success) {
        setReviewData(res.data)
        setShowReview(true)
      }
    } catch (err) {
      console.error('Fetch review error:', err)
    }
  }

  // ── Socket.IO Real-Time Connection ──
  useEffect(() => {
    if (!myId || !sessionId) return

    fetchSession()

    const socket = socketIo(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    const joinQuizRoom = () => {
      console.log(`[QUIZ CLIENT] Joining quiz room for user ${myId} in session ${sessionId}`)
      socket.emit('join_student', myId)
      socket.emit('quiz:join', { sessionId, userId: myId })
    }

    if (socket.connected) {
      joinQuizRoom()
    }
    socket.on('connect', joinQuizRoom)

    // Socket Event Handlers
    socket.on('quiz:player-joined', () => {
      fetchSession()
    })

    socket.on('quiz:player-ready', ({ participants }) => {
      setSession(prev => prev ? { ...prev, participants } : prev)
    })

    socket.on('quiz:countdown', ({ seconds }) => {
      setSession(prev => prev ? { ...prev, status: 'COUNTDOWN' } : prev)
      setCountdownNum(seconds || 3)
      let c = seconds || 3
      const timer = setInterval(() => {
        c -= 1;
        if (c > 0) {
          setCountdownNum(c)
        } else {
          clearInterval(timer)
          setCountdownNum('START!')
          setTimeout(() => setCountdownNum(null), 1000)
        }
      }, 1000)
    })

    socket.on('quiz:started', ({ question, questionNumber }) => {
      console.log('[QUIZ CLIENT] Received quiz:started', question)
      console.log(`[QUIZ CLIENT] Rendering Question ${questionNumber || 1}`)
      setSession(prev => prev ? { ...prev, status: 'LIVE', currentQuestionIndex: 0 } : prev)
      setCurrentQuestion(question)
      setHasAnswered(false)
      setSelectedOption(null)
      setEvalResult(null)
      setNextQuestionReady(false)
      setPartnerNextQuestionReady(false)
      setQuestionTimeLeft(45)
    })

    socket.on('quiz:player-progress', ({ userId: pUserId, score, status, answeredCount }) => {
      setSession(prev => {
        if (!prev) return prev
        const updated = prev.participants.map(p =>
          p.userId.toString() === pUserId.toString()
            ? { ...p, score, status, answeredCount }
            : p
        )
        return { ...prev, participants: updated }
      })
    })

    socket.on('quiz:question-result', (resData) => {
      console.log('[QUIZ CLIENT] Received question-result', resData)
      console.log('[QUIZ CLIENT] Showing result')
      console.log('[QUIZ CLIENT] Next Question button displayed')
      setEvalResult(resData)
      if (resData.participants) {
        setSession(prev => prev ? { ...prev, participants: resData.participants } : prev)
      }
      const readyUsers = resData.nextQuestionReadyUsers || []
      setNextQuestionReady(readyUsers.some(id => id.toString() === myId?.toString()))
      setPartnerNextQuestionReady(readyUsers.some(id => id.toString() !== myId?.toString()))
    })

    socket.on('quiz:next-question-ready-update', ({ userId: rUserId, readyUsers }) => {
      console.log(`[QUIZ CLIENT] Received quiz:next-question-ready-update from user ${rUserId}`)
      if (readyUsers) {
        setNextQuestionReady(readyUsers.some(id => id.toString() === myId?.toString()))
        setPartnerNextQuestionReady(readyUsers.some(id => id.toString() !== myId?.toString()))
      } else if (rUserId?.toString() === myId?.toString()) {
        setNextQuestionReady(true)
      } else {
        setPartnerNextQuestionReady(true)
      }
    })

    socket.on('quiz:next-question', (payload) => {
      console.log('[QUIZ CLIENT] Received next-question', payload)
      const qNum = payload.questionNumber || ((payload.currentQuestionIndex ?? 0) + 1)
      console.log(`[QUIZ CLIENT] Rendering Q${qNum}`)
      setSession(prev => prev ? {
        ...prev,
        status: 'LIVE',
        currentQuestionIndex: qNum - 1,
        participants: payload.participants || prev.participants
      } : prev)
      setCurrentQuestion(payload.question)
      setHasAnswered(false)
      setSelectedOption(null)
      setEvalResult(null)
      setNextQuestionReady(false)
      setPartnerNextQuestionReady(false)
      setQuestionTimeLeft(45)
    })

    socket.on('quiz:completed', (resData) => {
      console.log('[QUIZ CLIENT] Received quiz:completed', resData)
      setSession(prev => prev ? { ...prev, status: 'COMPLETED' } : prev)
      fetchResults()
    })

    socket.on('quiz:ended', ({ message }) => {
      console.log('[QUIZ CLIENT] Received quiz:ended event', message)
      alert(message || 'The quiz session was ended by a participant.')
      navigate('/college/peer-chat')
    })

    socket.on('quiz:chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg])
    })

    return () => {
      socket.emit('quiz:leave', { sessionId, userId: myId })
      socket.disconnect()
    }
  }, [sessionId, myId, fetchSession])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, showChat])

  // Timers countdown & Question timeout handler
  useEffect(() => {
    if (session?.status !== 'LIVE') return
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => Math.max(0, prev - 1))
      setQuestionTimeLeft(prev => {
        const nextVal = Math.max(0, prev - 1)
        if (nextVal === 0 && prev > 0) {
          console.log('[QUIZ CLIENT] Question timer reached 0! Triggering question timeout check...')
          if (socketRef.current) {
            socketRef.current.emit('quiz:timeout', { sessionId })
          }
          axios.post(`${API}/multiplayer-quiz/${sessionId}/timeout`, {}, { headers }).catch(() => {})
        }
        return nextVal
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [session?.status, sessionId])

  // ── Actions ──
  const handleSetReady = async () => {
    try {
      const res = await axios.post(`${API}/multiplayer-quiz/${sessionId}/ready`, {}, { headers })
      if (res.data?.success) {
        setSession(res.data.session)
      }
    } catch (err) {
      console.error('Set ready error:', err)
    }
  }

  const handleSelectAnswer = async (optId) => {
    if (hasAnswered || (session?.status !== 'LIVE' && session?.status !== 'WAITING_FOR_NEXT') || !currentQuestion) return
    setSelectedOption(optId)
    setHasAnswered(true)

    try {
      await axios.post(`${API}/multiplayer-quiz/${sessionId}/answer`, {
        questionId: currentQuestion.questionId,
        questionIndex: session.currentQuestionIndex,
        selectedOption: optId,
        responseTime: (45 - questionTimeLeft) * 1000
      }, { headers })
    } catch (err) {
      console.error('Submit answer error:', err)
    }
  }

  const handleNextQuestionReady = async () => {
    if (nextQuestionReady) return
    console.log('[QUIZ CLIENT] Sending next-question-ready')
    setNextQuestionReady(true)

    if (socketRef.current) {
      socketRef.current.emit('quiz:next-question-ready', {
        sessionId,
        userId: myId,
        questionId: currentQuestion?.questionId
      })
    }

    try {
      await axios.post(`${API}/multiplayer-quiz/${sessionId}/next-ready`, {
        questionId: currentQuestion?.questionId
      }, { headers })
    } catch (err) {
      console.error('Next question ready error:', err)
    }
  }

  const handleSendChat = () => {
    if (!chatInput.trim() || !socketRef.current) return
    socketRef.current.emit('quiz:chat', {
      sessionId,
      userId: myId,
      senderName: student?.name || 'Student',
      message: chatInput.trim()
    })
    setChatInput('')
  }

  const handleEndQuiz = async () => {
    if (!window.confirm('Are you sure you want to end this quiz session for both players?')) return
    try {
      await axios.post(`${API}/multiplayer-quiz/${sessionId}/end`, {}, { headers })
      navigate('/college/peer-chat')
    } catch (err) {
      console.error('End quiz error:', err)
      alert('Failed to end quiz session.')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Connecting to synchronized multiplayer quiz room...
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div style={{ maxWidth: 540, margin: '60px auto', textAlign: 'center' }}>
        <SCard style={{ padding: 36, borderRadius: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>Quiz Session Unavailable</h2>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>{error || 'Could not load quiz session.'}</p>
          <SBtn variant="primary" onClick={() => navigate('/college/peer-chat')}>Return to Peer Chat</SBtn>
        </SCard>
      </div>
    )
  }

  const me = session.participants?.find(p => p.userId.toString() === myId?.toString())
  const opponent = session.participants?.find(p => p.userId.toString() !== myId?.toString())

  // Format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // ── RENDER WAITING ROOM ──
  if (session.status === 'WAITING' || session.status === 'READY' || countdownNum !== null) {
    const isMeReady = me?.status === 'READY'
    const isOpponentReady = opponent?.status === 'READY'

    return (
      <div style={{ maxWidth: 680, margin: '40px auto', textAlign: 'center' }} className="s-anim-up">
        {/* COUNTDOWN OVERLAY */}
        {countdownNum !== null && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', color: '#fff', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: '#38bdf8', animation: 'pop 0.5s ease' }}>
              {countdownNum}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#93c5fd', marginTop: 16 }}>
              Synchronizing Start with {opponent?.name || 'Study Partner'}...
            </div>
          </div>
        )}

        <SCard style={{ padding: 40, borderRadius: 28, border: '2px solid #818cf8', boxShadow: '0 12px 36px rgba(99,102,241,0.12)' }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎯</div>
          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 14px', borderRadius: 14, fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>
            Multiplayer Study Quiz
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: '12px 0 6px' }}>
            {session.topic === session.subtopic ? session.topic : `${session.topic} — ${session.subtopic}`}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 28px' }}>
            {session.totalQuestions} Questions • {Math.round(session.durationSeconds / 60)} Minutes • SeedMaster Question Bank
          </p>

          {/* PARTICIPANTS CARD GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ background: isMeReady ? '#ecfdf5' : '#f8fafc', border: isMeReady ? '2px solid #059669' : '1px solid #cbd5e1', padding: 20, borderRadius: 20, transition: 'all 0.3s' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>👩</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>You ({me?.name || 'Student'})</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: isMeReady ? '#059669' : '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {isMeReady ? <><FiCheckCircle size={15} /> Ready</> : '● Tap Ready to start'}
              </div>
            </div>

            <div style={{ background: isOpponentReady ? '#ecfdf5' : '#f8fafc', border: isOpponentReady ? '2px solid #059669' : '1px solid #cbd5e1', padding: 20, borderRadius: 20, transition: 'all 0.3s' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>👨</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>{opponent?.name || 'Study Partner'}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: isOpponentReady ? '#059669' : '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {isOpponentReady ? <><FiCheckCircle size={15} /> Ready</> : '⏳ Waiting for partner...'}
              </div>
            </div>
          </div>

          {!isMeReady ? (
            <SBtn variant="primary" onClick={handleSetReady} style={{ width: '100%', padding: '14px 28px', borderRadius: 16, fontSize: 16, fontWeight: 900 }}>
              <FiCheck size={18} style={{ marginRight: 8 }} /> Click to Set Ready
            </SBtn>
          ) : (
            <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '14px 20px', borderRadius: 16, fontSize: 14, fontWeight: 800 }}>
              ✓ You are ready! Waiting for {opponent?.name || 'partner'} to click ready...
            </div>
          )}
          <button type="button" onClick={handleEndQuiz} style={{ width: '100%', marginTop: 14, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🛑 End Quiz Session
          </button>
        </SCard>
      </div>
    )
  }

  // ── RENDER REVIEW MODE ──
  if (showReview && reviewData) {
    return (
      <div style={{ maxWidth: 860, margin: '20px auto' }} className="s-anim-up">
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setShowReview(false)} style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiArrowLeft size={16} /> Back to Game Summary
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
            📖 Quiz Answer Review — {reviewData.topic}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviewData.reviewItems?.map(item => (
            <SCard key={item.questionIndex} style={{ padding: 22, borderRadius: 18, borderLeft: item.isCorrect ? '4px solid #059669' : '4px solid #dc2626' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: item.isCorrect ? '#059669' : '#dc2626' }}>
                  {item.isCorrect ? '✓ CORRECT' : '✕ INCORRECT'} • Question {item.questionIndex}
                </span>
                <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 700 }}>Your Answer: {item.userAnswer}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 12 }}>
                {item.questionText}
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, color: '#334155', marginBottom: 10 }}>
                💡 <strong>Correct Answer ({item.correctAnswer}):</strong> {item.options?.find(o => o.id === item.correctAnswer)?.text || item.correctAnswer}
              </div>

              <div style={{ fontSize: 12, color: 'var(--s-text2)', fontStyle: 'italic', lineHeight: 1.4 }}>
                Explanation: {item.explanation}
              </div>
            </SCard>
          ))}
        </div>
      </div>
    )
  }

  // ── RENDER COMPLETED RESULTS SCREEN ──
  if (session.status === 'COMPLETED' && resultsData) {
    const isWinner = resultsData.results?.[0]?.userId?.toString() === myId?.toString()
    const myResult = resultsData.results?.find(r => r.userId?.toString() === myId?.toString())
    const oppResult = resultsData.results?.find(r => r.userId?.toString() !== myId?.toString())

    return (
      <div style={{ maxWidth: 840, margin: '30px auto' }} className="s-anim-up">
        <SCard style={{ padding: 40, borderRadius: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>🎉</div>
          <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 14px', borderRadius: 14, fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>
            Multiplayer Quiz Complete
          </span>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-text)', margin: '10px 0 6px' }}>
            {session.topic} — {session.subtopic}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 32px' }}>
            🏆 Top Score Achieved! Both students successfully completed the study session.
          </p>

          {/* VS SCORE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
            {/* MY CARD */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', padding: 24, borderRadius: 22, boxShadow: '0 8px 24px rgba(15,23,42,0.15)', textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 4 }}>
                👩 You ({myResult?.name})
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{myResult?.score || 0} <span style={{ fontSize: 14, color: '#93c5fd' }}>XP Points</span></div>
              <div style={{ marginTop: 12, fontSize: 13, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Correct Answers: <strong>{myResult?.correctCount || 0} / {session.totalQuestions}</strong></div>
                <div>Accuracy Rate: <strong>{myResult?.accuracyPercent || 0}%</strong></div>
              </div>
            </div>

            {/* OPPONENT CARD */}
            <div style={{ background: '#f8fafc', color: 'var(--s-text)', padding: 24, borderRadius: 22, border: '1px solid #cbd5e1', textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                👨 {oppResult?.name || 'Study Partner'}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--s-text)' }}>{oppResult?.score || 0} <span style={{ fontSize: 14, color: '#64748b' }}>XP Points</span></div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--s-text2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Correct Answers: <strong>{oppResult?.correctCount || 0} / {session.totalQuestions}</strong></div>
                <div>Accuracy Rate: <strong>{oppResult?.accuracyPercent || 0}%</strong></div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <SBtn variant="primary" onClick={fetchReview} style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14 }}>
              <FiBookOpen size={16} style={{ marginRight: 6 }} /> Review Answers
            </SBtn>
            <Link to="/college/study-tools/practice" style={{ textDecoration: 'none' }}>
              <button type="button" style={{ background: '#ede9fe', color: '#6d28d9', border: 'none', padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiZap size={16} /> Practice Weak Areas
              </button>
            </Link>
            <button type="button" onClick={() => navigate('/college/peer-chat')} style={{ background: 'var(--s-surface2)', border: '1px solid var(--s-border)', color: 'var(--s-text)', padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Back to Peer Chat
            </button>
          </div>
        </SCard>
      </div>
    )
  }

  // ── RENDER LIVE GAMEPLAY UI ──
  const oppAnswered = opponent?.status === 'ANSWERED'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 20 }} className="s-anim-up">
      {/* MAIN GAME CONTAINER */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* TOP BAR */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', padding: '18px 24px', borderRadius: 22, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎯 MULTIPLAYER QUIZ • QUESTION {session.currentQuestionIndex + 1} OF {session.totalQuestions}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 900, margin: '2px 0 0', color: '#fff' }}>
              {session.topic === session.subtopic ? session.topic : `${session.topic} — ${session.subtopic}`}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 14, fontSize: 13, fontWeight: 800 }}>
              <FiClock color="#38bdf8" size={16} /> ⏱ {formatTime(sessionTimeLeft)}
            </div>
            <button type="button" onClick={() => setShowChat(v => !v)} style={{ background: '#4338ca', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              💬 Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
            </button>
            <button type="button" onClick={handleEndQuiz} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              🛑 End Quiz
            </button>
          </div>
        </div>

        {/* QUESTION CARD */}
        {currentQuestion && (
          <SCard style={{ padding: 32, borderRadius: 24, marginBottom: 20 }}>
            {/* TIMER BAR FOR QUESTION */}
            <div style={{ background: '#f1f5f9', height: 6, borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ width: `${(questionTimeLeft / 45) * 100}%`, height: '100%', background: questionTimeLeft < 10 ? '#ef4444' : 'var(--s-primary)', transition: 'width 1s linear' }} />
            </div>

            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', marginBottom: 24, lineHeight: 1.5 }}>
              Q{session.currentQuestionIndex + 1}. {currentQuestion.questionText}
            </div>

            {/* OPTIONS GRID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {currentQuestion.options?.map((opt) => {
                const isSelected = selectedOption === opt.id
                const isCorrectOpt = evalResult?.correctOption === opt.id
                const isWrongOpt = evalResult && isSelected && !isCorrectOpt

                let bg = '#fff'
                let border = '1px solid var(--s-border)'
                let textCol = 'var(--s-text)'

                if (evalResult) {
                  if (isCorrectOpt) {
                    bg = '#d1fae5'; border = '2px solid #059669'; textCol = '#047857'
                  } else if (isWrongOpt) {
                    bg = '#fee2e2'; border = '2px solid #dc2626'; textCol = '#b91c1c'
                  }
                } else if (isSelected) {
                  bg = '#eff6ff'; border = '2px solid var(--s-primary)'; textCol = 'var(--s-primary)'
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleSelectAnswer(opt.id)}
                    style={{
                      padding: '16px 20px', borderRadius: 16, textAlign: 'left',
                      background: bg, border, color: textCol,
                      fontSize: 15, fontWeight: 800, cursor: hasAnswered ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <span><strong>{opt.id}.</strong> {opt.text}</span>
                    {evalResult && isCorrectOpt && <FiCheckCircle color="#059669" size={20} />}
                    {evalResult && isWrongOpt && <FiXCircle color="#dc2626" size={20} />}
                  </button>
                )
              })}
            </div>

            {/* STATUS / RESULT PANEL */}
            {evalResult ? (
              <div style={{ background: '#f8fafc', padding: 22, borderRadius: 20, border: '2px solid #6366f1', marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#4338ca', background: '#e0e7ff', padding: '4px 14px', borderRadius: 12, textTransform: 'uppercase' }}>
                    🎯 Q{session.currentQuestionIndex + 1} COMPLETE
                  </span>
                  {partnerNextQuestionReady && !nextQuestionReady && (
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 14px', borderRadius: 12 }}>
                      ✓ {opponent?.name || 'Partner'} is ready for next question!
                    </span>
                  )}
                </div>

                {/* ANSWERS & SCORES COMPARISON GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div style={{ background: '#fff', padding: 14, borderRadius: 14, border: evalResult.results?.find(r => r.userId?.toString() === myId?.toString())?.isCorrect ? '2px solid #059669' : '2px solid #cbd5e1' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800 }}>Your Answer: <strong>{evalResult.results?.find(r => r.userId?.toString() === myId?.toString())?.selectedOption || selectedOption || 'N/A'}</strong></div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: evalResult.results?.find(r => r.userId?.toString() === myId?.toString())?.isCorrect ? '#059669' : '#dc2626', marginTop: 4 }}>
                      {evalResult.results?.find(r => r.userId?.toString() === myId?.toString())?.isCorrect ? `✓ Correct (+${evalResult.results?.find(r => r.userId?.toString() === myId?.toString())?.pointsEarned || 100} XP)` : '✕ Incorrect (+0 XP)'}
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: 14, borderRadius: 14, border: evalResult.results?.find(r => r.userId?.toString() !== myId?.toString())?.isCorrect ? '2px solid #059669' : '2px solid #cbd5e1' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800 }}>{opponent?.name || 'Partner'} Answer: <strong>{evalResult.results?.find(r => r.userId?.toString() !== myId?.toString())?.selectedOption || 'N/A'}</strong></div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: evalResult.results?.find(r => r.userId?.toString() !== myId?.toString())?.isCorrect ? '#059669' : '#dc2626', marginTop: 4 }}>
                      {evalResult.results?.find(r => r.userId?.toString() !== myId?.toString())?.isCorrect ? `✓ Correct (+${evalResult.results?.find(r => r.userId?.toString() !== myId?.toString())?.pointsEarned || 100} XP)` : '✕ Incorrect (+0 XP)'}
                    </div>
                  </div>
                </div>

                {/* CORRECT OPTION & EXPLANATION */}
                <div style={{ background: '#ecfdf5', color: '#047857', padding: 14, borderRadius: 14, fontSize: 13, fontWeight: 800, marginBottom: 20 }}>
                  <div>✓ Correct Answer: <strong>{evalResult.correctOption}</strong> — {currentQuestion?.options?.find(o => o.id === evalResult.correctOption)?.text || ''}</div>
                  {evalResult.explanation && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginTop: 6, fontStyle: 'italic' }}>
                      💡 {evalResult.explanation}
                    </div>
                  )}
                </div>

                {/* NEXT QUESTION BUTTON CONTROL */}
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  {nextQuestionReady ? (
                    <div style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd', padding: '14px 24px', borderRadius: 16, fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <FiCheckCircle size={18} color="#2563eb" />
                      ✓ Ready for next question — Waiting for {opponent?.name || 'partner'}...
                    </div>
                  ) : (
                    <SBtn
                      variant="primary"
                      onClick={handleNextQuestionReady}
                      style={{ padding: '14px 36px', borderRadius: 16, fontSize: 16, fontWeight: 900, cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}
                    >
                      {session.currentQuestionIndex + 1 >= session.totalQuestions ? 'VIEW FINAL RESULTS →' : 'NEXT QUESTION →'}
                    </SBtn>
                  )}
                </div>
              </div>
            ) : hasAnswered ? (
              <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: 14, borderRadius: 14, fontSize: 13, fontWeight: 800, textAlign: 'center' }}>
                ✓ You answered ({selectedOption})! Waiting for {opponent?.name || 'study partner'}...
              </div>
            ) : null}
          </SCard>
        )}

        {/* BOTTOM PROGRESS TRACKER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SCard style={{ padding: 16, borderRadius: 18, background: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>👩 You</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-primary)', margin: '2px 0 4px' }}>
              Score: {me?.score || 0} XP
            </div>
            <div style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 700 }}>
              Progress: {me?.answeredCount || 0} / {session.totalQuestions} Questions
            </div>
          </SCard>

          <SCard style={{ padding: 16, borderRadius: 18, background: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>👨 {opponent?.name || 'Opponent'}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '2px 0 4px' }}>
              Score: {opponent?.score || 0} XP
            </div>
            <div style={{ fontSize: 12, color: oppAnswered ? '#059669' : '#64748b', fontWeight: 700 }}>
              Status: {oppAnswered ? '✓ Answered' : '🟢 Answering...'}
            </div>
          </SCard>
        </div>
      </div>

      {/* SIDE STUDY CHAT PANEL */}
      {showChat && (
        <div style={{ width: 280, background: '#fff', borderRadius: 22, border: '1px solid var(--s-border)', padding: 16, display: 'flex', flexDirection: 'column', flexShrink: 0, height: 500 }} className="s-anim-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--s-text)' }}>💬 In-Quiz Chat</span>
            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FiX size={16} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ background: m.userId === myId ? '#eff6ff' : '#f8fafc', padding: '6px 10px', borderRadius: 10, fontSize: 12 }}>
                <strong style={{ color: 'var(--s-primary)' }}>{m.senderName}: </strong>
                <span>{m.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Chat..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendChat() }}
              style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 12 }}
            />
            <button onClick={handleSendChat} style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
