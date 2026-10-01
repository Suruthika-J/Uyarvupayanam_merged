/**
 * IntelligentFocusPage.jsx
 *
 * Intelligent Focus Mode for College Students.
 *
 * WHAT IT MONITORS (separately and transparently):
 *  A. Browser Activity — Page Visibility API + window blur/focus
 *  B. Input Inactivity — mouse, keyboard, touch events
 *  C. Camera (opt-in) — via existing FocusCameraDetector (canvas luminance + frame-diff)
 *     NOTE: No ML model exists in this project. Camera uses pixel-diff heuristics only.
 *     Limitations are clearly shown in the UI.
 *  D. Audio (opt-in) — Web Audio API VAD (volume threshold only, no recording)
 *
 * PRIVACY:
 *  - Camera and audio are opt-in only, permission requested on click.
 *  - No video or audio is stored or transmitted. Only derived events.
 *  - All analysis is local in the browser.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import { useCollegeTheme } from '../../context/CollegeThemeContext'
import FocusCameraDetector from '../../components/common/FocusCameraDetector'
import axios from 'axios'
import {
  FiClock, FiPlay, FiPause, FiCheckCircle, FiAlertTriangle,
  FiEye, FiActivity, FiBookOpen, FiRotateCcw, FiAward, FiArrowLeft,
  FiMic, FiMicOff, FiInfo, FiUsers, FiTarget, FiZap, FiTrendingUp,
  FiChevronRight, FiMessageSquare, FiBarChart2
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// ── Scoring configuration (explainable, configurable) ─────────────────────
const DEFAULT_SCORING = {
  tabSwitchPenalty:  4,   // per tab switch
  inactivityPenalty: 3,   // per 30s of inactivity beyond 60s
  cameraAwayPenalty: 6,   // per camera away event
  motionPenalty:     2    // per motion/distraction event from camera
}

const FOCUS_CATEGORIES = [
  { value: 'subject',        label: '📚 Subject Study' },
  { value: 'skill',          label: '⚡ Skill Building' },
  { value: 'assignment',     label: '📝 Assignment' },
  { value: 'interview_prep', label: '💼 Interview Prep' },
  { value: 'placement_prep', label: '🎯 Placement Prep' },
  { value: 'course',         label: '🎓 Online Course' },
  { value: 'general',        label: '📖 General Study' },
]

const DURATIONS = [15, 25, 45, 60]

// ── Focus Status Engine ────────────────────────────────────────────────────
function computeStatus(tabSwitchCount, inactiveSeconds, awayEvents, distractionEvents, sessionActive, sessionPaused) {
  if (!sessionActive) return 'IDLE'
  if (sessionPaused)  return 'PAUSED'
  const totalSignals = tabSwitchCount + awayEvents + distractionEvents
  const longInactive = inactiveSeconds > 120
  if (longInactive || totalSignals > 5) return 'DISTRACTED'
  if (inactiveSeconds > 45 || totalSignals > 2) return 'POSSIBLE_DISTRACTION'
  return 'FOCUSED'
}

const STATUS_CONFIG = {
  FOCUSED:               { color: '#059669', bg: '#ecfdf5', icon: '🟢', label: 'Focused',              tip: 'Great work! Keep it up.' },
  POSSIBLE_DISTRACTION:  { color: '#d97706', bg: '#fffbeb', icon: '🟡', label: 'Possible Distraction', tip: "You seem to be away. Let's refocus." },
  DISTRACTED:            { color: '#dc2626', bg: '#fef2f2', icon: '🔴', label: 'Distracted',           tip: "Let's get back to your study goal." },
  PAUSED:                { color: '#6366f1', bg: '#eef2ff', icon: '⏸',  label: 'Paused',               tip: 'Session is paused.' },
  IDLE:                  { color: '#64748b', bg: '#f8fafc', icon: '⚪', label: 'Idle',                  tip: '' },
}

function computeFocusScore({ elapsedSeconds, inactiveSeconds, tabSwitchCount, awayEvents, distractionEvents, cfg }) {
  if (elapsedSeconds < 5) return 100
  const focusSecs  = Math.max(0, elapsedSeconds - inactiveSeconds)
  const focusRatio = focusSecs / Math.max(1, elapsedSeconds)
  const rawScore   = Math.round(focusRatio * 100)
  const inactPenalty = inactiveSeconds > 60
    ? Math.floor((inactiveSeconds - 60) / 30) * cfg.inactivityPenalty : 0
  const finalScore = Math.max(10, Math.min(100, rawScore
    - tabSwitchCount * cfg.tabSwitchPenalty
    - inactPenalty
    - awayEvents    * cfg.cameraAwayPenalty
    - distractionEvents * cfg.motionPenalty
  ))
  return { finalScore, rawScore, focusRatio: parseFloat(focusRatio.toFixed(2)), inactPenalty }
}

const fmt = secs => {
  const m = Math.floor(secs / 60), s = secs % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

export default function IntelligentFocusPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const { theme } = useCollegeTheme()

  const userSubjects = profile?.subjects?.length
    ? profile.subjects
    : ['Data Structures', 'Operating Systems', 'DBMS', 'OOP', 'Computer Networks']

  // ── Setup state ──────────────────────────────────────────────────────────
  const [subject,   setSubject]  = useState(userSubjects[0] || '')
  const [topic,     setTopic]    = useState('')
  const [goal,      setGoal]     = useState('')
  const [category,  setCategory] = useState('subject')
  const [duration,  setDuration] = useState(25)
  const [customDur, setCustomDur]= useState('')
  const [monSettings, setMonSettings] = useState({
    browserActivity: true, cameraEnabled: false, audioEnabled: false
  })

  // ── Session lifecycle ────────────────────────────────────────────────────
  const [sessionId,       setSessionId]       = useState(null)
  const [sessionActive,   setSessionActive]   = useState(false)
  const [sessionPaused,   setSessionPaused]   = useState(false)
  const [sessionCompleted,setSessionCompleted]= useState(false)

  // ── Timer ─────────────────────────────────────────────────────────────────
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60)
  const [elapsedSeconds,   setElapsedSeconds]   = useState(0)

  // ── Distraction telemetry ──────────────────────────────────────────────
  const [tabSwitchCount,   setTabSwitchCount]   = useState(0)
  const [inactiveSeconds,  setInactiveSeconds]  = useState(0)
  const [awayEvents,       setAwayEvents]       = useState(0)
  const [distractionEvents,setDistractionEvents]= useState(0)
  const [speechEvents,     setSpeechEvents]     = useState(0)
  const [eventLog,         setEventLog]         = useState([]) // for backend batch send

  // ── Audio monitoring ────────────────────────────────────────────────────
  const [audioActive,    setAudioActive]    = useState(false)
  const [audioPermState, setAudioPermState] = useState('prompt') // prompt|granted|denied
  const audioContextRef  = useRef(null)
  const analyserRef      = useRef(null)
  const audioIntervalRef = useRef(null)
  const speechTimerRef   = useRef(null)

  // ── Other refs ───────────────────────────────────────────────────────────
  const tabLeaveTimeRef   = useRef(null)
  const lastActivityRef   = useRef(Date.now())
  const inactivityTimerRef= useRef(null)
  const toastTimerRef     = useRef(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [notes,    setNotes]    = useState('')
  const [showInterventionModal, setShowInterventionModal] = useState(false)

  const effectiveDuration = customDur ? parseInt(customDur) || 25 : duration

  const logEvent = useCallback((type, reason = '', duration = 0, confidence = undefined) => {
    const e = { type, reason, timestamp: new Date().toISOString(), duration, confidence }
    setEventLog(prev => [...prev, e])
  }, [])

  const triggerToast = useCallback((msg) => {
    setToastMsg(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 4500)
  }, [])

  // ── A. Browser Activity Monitoring ────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive || sessionPaused || sessionCompleted || !monSettings.browserActivity) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabLeaveTimeRef.current = Date.now()
        setTabSwitchCount(prev => {
          const n = prev + 1
          logEvent('TAB_SWITCH', 'User navigated away from tab')
          if (n === 3) triggerToast("You've switched tabs 3 times. Stay focused!")
          if (n >= 6)  setShowInterventionModal(true)
          return n
        })
      } else {
        if (tabLeaveTimeRef.current) {
          const away = Math.round((Date.now() - tabLeaveTimeRef.current) / 1000)
          setInactiveSeconds(p => p + away)
          logEvent('FOCUS_RETURN', `Returned after ${away}s`, away)
          if (away > 30) triggerToast(`You were away for ${away} seconds. Welcome back!`)
          tabLeaveTimeRef.current = null
        }
      }
    }

    const handleBlur = () => {
      if (!document.hidden) {
        setTabSwitchCount(p => p + 1)
        logEvent('WINDOW_BLUR', 'Browser window lost focus')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [sessionActive, sessionPaused, sessionCompleted, monSettings.browserActivity, logEvent, triggerToast])

  // ── B. Input Inactivity Monitoring ────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive || sessionPaused || sessionCompleted) return

    const INACTIVITY_THRESHOLD = 45 // seconds before flagging

    const handleActivity = () => { lastActivityRef.current = Date.now() }
    document.addEventListener('mousemove', handleActivity, { passive: true })
    document.addEventListener('keydown',   handleActivity, { passive: true })
    document.addEventListener('touchstart',handleActivity, { passive: true })
    document.addEventListener('scroll',    handleActivity, { passive: true })

    inactivityTimerRef.current = setInterval(() => {
      const inactiveSecs = Math.round((Date.now() - lastActivityRef.current) / 1000)
      if (inactiveSecs > INACTIVITY_THRESHOLD) {
        setInactiveSeconds(p => p + 1)
        if (inactiveSecs === INACTIVITY_THRESHOLD + 1) {
          logEvent('INACTIVITY', `No input detected for ${inactiveSecs}s`, inactiveSecs)
          triggerToast('No activity detected. Are you still studying?')
        }
      }
    }, 1000)

    return () => {
      clearInterval(inactivityTimerRef.current)
      document.removeEventListener('mousemove', handleActivity)
      document.removeEventListener('keydown',   handleActivity)
      document.removeEventListener('touchstart',handleActivity)
      document.removeEventListener('scroll',    handleActivity)
    }
  }, [sessionActive, sessionPaused, sessionCompleted, logEvent, triggerToast])

  // ── C. Audio VAD (Volume Activity Detection — opt-in) ─────────────────────
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const ctx      = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      audioContextRef.current = ctx
      analyserRef.current     = analyser
      setAudioActive(true)
      setAudioPermState('granted')
      const data = new Uint8Array(analyser.frequencyBinCount)
      let speechStartTime = null

      audioIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(data)
        const vol = data.reduce((a, b) => a + b, 0) / data.length
        if (vol > 25) {
          if (!speechStartTime) speechStartTime = Date.now()
        } else {
          if (speechStartTime) {
            const dur = Math.round((Date.now() - speechStartTime) / 1000)
            speechStartTime = null
            if (dur > 2) { // Only flag speech lasting > 2 seconds
              setSpeechEvents(p => p + 1)
              logEvent('SPEECH_DETECTED', 'Audio activity detected (volume threshold)', dur)
            }
          }
        }
      }, 500)
    } catch {
      setAudioPermState('denied')
    }
  }

  const stopAudioMonitoring = () => {
    clearInterval(audioIntervalRef.current)
    audioContextRef.current?.close()
    audioContextRef.current = null
    analyserRef.current     = null
    setAudioActive(false)
  }

  useEffect(() => {
    if (!sessionActive || sessionPaused) return
    if (monSettings.audioEnabled && audioPermState === 'granted' && !audioActive) startAudioMonitoring()
    if (!monSettings.audioEnabled && audioActive) stopAudioMonitoring()
  }, [sessionActive, sessionPaused, monSettings.audioEnabled])

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive || sessionPaused || sessionCompleted) return
    const timer = setInterval(() => {
      setSecondsRemaining(p => {
        if (p <= 1) { clearInterval(timer); handleSessionComplete(); return 0 }
        return p - 1
      })
      setElapsedSeconds(p => p + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionActive, sessionPaused, sessionCompleted])

  // ── Session API calls ─────────────────────────────────────────────────────
  const getToken = () => localStorage.getItem('studentToken')

  const apiStartSession = async () => {
    try {
      const res = await axios.post(`${API}/focus/start`, {
        subject, topic, goal, category,
        plannedDuration: effectiveDuration,
        monitoringSettings: monSettings,
        scoringConfig: DEFAULT_SCORING
      }, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.data?.success) return res.data.session._id
    } catch (e) { console.warn('Failed to start session in backend:', e.message) }
    return null
  }

  const apiCompleteSession = async (id, metrics) => {
    try {
      // Batch send events
      if (eventLog.length > 0) {
        await axios.post(`${API}/focus/${id}/events`,
          { events: eventLog },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        ).catch(() => {})
      }
      const res = await axios.post(`${API}/focus/${id}/complete`, {
        ...metrics, notes
      }, { headers: { Authorization: `Bearer ${getToken()}` } })
      return res.data
    } catch (e) { console.warn('Failed to complete session:', e.message) }
    return null
  }

  const apiEndSession = async (id) => {
    try {
      await axios.post(`${API}/focus/${id}/end`,
        { actualDuration: elapsedSeconds },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
    } catch {}
  }

  // ── Session control ────────────────────────────────────────────────────────
  const startSession = async () => {
    const id = await apiStartSession()
    setSessionId(id)
    setSecondsRemaining(effectiveDuration * 60)
    setElapsedSeconds(0); setTabSwitchCount(0); setInactiveSeconds(0)
    setAwayEvents(0); setDistractionEvents(0); setSpeechEvents(0)
    setEventLog([]); setNotes('')
    lastActivityRef.current = Date.now()
    setSessionActive(true); setSessionPaused(false); setSessionCompleted(false)
    if (monSettings.audioEnabled) startAudioMonitoring()
  }

  const togglePause = () => {
    setSessionPaused(p => {
      const pausing = !p
      if (pausing) logEvent('SESSION_PAUSED', 'User paused session')
      else         logEvent('SESSION_RESUMED', 'User resumed session')
      return pausing
    })
  }

  const handleSessionComplete = async () => {
    setSessionActive(false); setSessionCompleted(true)
    stopAudioMonitoring()
    if (sessionId) {
      await apiCompleteSession(sessionId, {
        actualDuration: elapsedSeconds,
        tabSwitchCount, inactiveSeconds, awayEvents, distractionEvents
      })
    }
  }

  const endSessionEarly = async () => {
    setSessionActive(false); setSessionCompleted(true)
    stopAudioMonitoring()
    if (sessionId) {
      await apiEndSession(sessionId)
    }
  }

  const resetSession = () => {
    setSessionActive(false); setSessionPaused(false); setSessionCompleted(false)
    setSecondsRemaining(effectiveDuration * 60)
    setElapsedSeconds(0); setEventLog([])
    stopAudioMonitoring()
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const { finalScore, focusRatio } = computeFocusScore({
    elapsedSeconds, inactiveSeconds, tabSwitchCount, awayEvents, distractionEvents, cfg: DEFAULT_SCORING
  })

  const focusStatus = computeStatus(tabSwitchCount, inactiveSeconds, awayEvents, distractionEvents, sessionActive, sessionPaused)
  const statusCfg   = STATUS_CONFIG[focusStatus]
  const progressPct = effectiveDuration > 0
    ? Math.min(100, ((effectiveDuration * 60 - secondsRemaining) / (effectiveDuration * 60)) * 100) : 0

  const scoreColor  = finalScore > 80 ? '#059669' : finalScore > 60 ? '#d97706' : '#dc2626'

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--s-font-body, Inter, sans-serif)', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <button type="button" onClick={() => navigate('/college/dashboard')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Intelligent Focus Mode
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', maxWidth: 520 }}>
            Combines browser activity, optional camera & audio signals for meaningful focus analytics.
            Camera uses pixel-change detection — <em>no ML model required</em>.
          </p>
        </div>
        {sessionActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ background: statusCfg.bg, color: statusCfg.color, padding: '8px 16px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${statusCfg.color}33` }}>
              <span>{statusCfg.icon}</span> {statusCfg.label}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '12px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiAlertTriangle size={18} /> {toastMsg}
        </div>
      )}

      {/* ── STATE 1: SETUP ─────────────────────────────────────────────── */}
      {!sessionActive && !sessionCompleted && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Left: Session config */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: 24 }}>Configure Your Focus Session</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Subject / Module *</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle}>
                  {userSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                  {FOCUS_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Specific Topic (optional)</label>
              <input type="text" placeholder="e.g. Binary Trees, OS Scheduling Algorithms"
                value={topic} onChange={e => setTopic(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Your Goal for This Session</label>
              <input type="text" placeholder='e.g. "Complete DBMS Unit 3 — 15 MCQs practice"'
                value={goal} onChange={e => setGoal(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Duration</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {DURATIONS.map(d => (
                  <button key={d} type="button" onClick={() => { setDuration(d); setCustomDur(''); setSecondsRemaining(d * 60) }}
                    style={{ padding: '10px 20px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', border: duration === d && !customDur ? 'none' : '1px solid #e2e8f0', background: duration === d && !customDur ? '#0284c7' : '#f1f5f9', color: duration === d && !customDur ? '#fff' : '#475569', transition: 'all 0.15s' }}>
                    {d} min
                  </button>
                ))}
                <input type="number" min="5" max="180" placeholder="Custom"
                  value={customDur} onChange={e => { setCustomDur(e.target.value); setDuration(0) }}
                  style={{ width: 90, padding: '10px 12px', borderRadius: 12, border: `1px solid ${customDur ? '#0284c7' : '#e2e8f0'}`, fontSize: 14, fontWeight: 700, outline: 'none' }} />
              </div>
            </div>

            <button type="button" onClick={startSession}
              style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 14px rgba(2,132,199,0.35)' }}>
              <FiPlay size={20} /> Begin Focus Session ({effectiveDuration} min)
            </button>
          </div>

          {/* Right: Monitoring settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0f172a', borderRadius: 20, padding: 24, color: '#fff' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px', color: '#f8fafc' }}>
                🛡️ Focus Monitoring
              </h3>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18, lineHeight: 1.5 }}>
                Choose what signals to use. Camera and audio are <strong>always opt-in</strong>.
              </p>
              {[
                { key: 'browserActivity', label: 'Browser Activity', desc: 'Tab switches, window blur', always: true },
                { key: 'cameraEnabled',   label: 'Camera Detection', desc: 'Pixel-change analysis (no face ID)', always: false },
                { key: 'audioEnabled',    label: 'Audio VAD',        desc: 'Volume activity only — not recorded', always: false },
              ].map(opt => (
                <div key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: opt.always ? '#94a3b8' : '#f1f5f9' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
                    {opt.always && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Always active</div>}
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24, flexShrink: 0, marginTop: 2 }}>
                    <input type="checkbox" checked={monSettings[opt.key]} disabled={opt.always}
                      onChange={e => setMonSettings(p => ({ ...p, [opt.key]: e.target.checked }))}
                      style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: opt.always ? 'default' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: monSettings[opt.key] ? '#10b981' : '#334155', borderRadius: 12, transition: '0.2s' }}>
                      <span style={{ position: 'absolute', content: '', height: 18, width: 18, left: monSettings[opt.key] ? 21 : 3, bottom: 3, background: '#fff', borderRadius: '50%', transition: '0.2s' }} />
                    </span>
                  </label>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: 12, background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 700, marginBottom: 4 }}>ℹ️ Privacy Guarantee</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                  No video or audio is stored or transmitted. Camera uses pixel-change detection only — no face recognition or ML model.
                </div>
              </div>
            </div>

            {/* Scoring explanation */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiInfo size={14} color="#6366f1" /> Score Formula
              </h4>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                <strong>100</strong> (base)<br />
                − <strong>{DEFAULT_SCORING.tabSwitchPenalty}</strong> per tab switch<br />
                − <strong>{DEFAULT_SCORING.inactivityPenalty}</strong> per 30s inactivity (after 60s)<br />
                − <strong>{DEFAULT_SCORING.cameraAwayPenalty}</strong> per camera-away event<br />
                − <strong>{DEFAULT_SCORING.motionPenalty}</strong> per motion signal
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE 2: ACTIVE SESSION ────────────────────────────────────── */}
      {sessionActive && (
        <div>
          {/* Camera detector */}
          {monSettings.cameraEnabled && (
            <FocusCameraDetector
              active={sessionActive && !sessionPaused}
              onDistractionDetected={() => { setDistractionEvents(p => p + 1); logEvent('MOTION_DETECTED', 'Significant frame movement', 0, 0.7) }}
              onAwayDetected={() => { setAwayEvents(p => p + 1); logEvent('FACE_NOT_DETECTED', 'Very low luminance — possible absence', 0, 0.6) }}
            />
          )}

          {/* Audio indicator */}
          {monSettings.audioEnabled && (
            <div style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '10px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              {audioActive ? <FiMic size={16} color="#10b981" /> : <FiMicOff size={16} color="#64748b" />}
              <span style={{ fontWeight: 700, color: audioActive ? '#10b981' : '#64748b' }}>
                {audioActive ? 'Audio monitoring active' : `Microphone ${audioPermState === 'denied' ? 'denied' : 'inactive'}`}
              </span>
              {!audioActive && audioPermState !== 'denied' && (
                <button type="button" onClick={startAudioMonitoring}
                  style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Enable Microphone
                </button>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>
                Detects voice activity only — no recording
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#0284c7,#0ea5e9)', borderRadius: 3, transition: 'width 1s linear' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Main timer */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {category.toUpperCase().replace('_',' ')} • {subject}
              </div>
              {goal && <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 8 }}>🎯 {goal}</div>}

              {/* Clock */}
              <div style={{ fontSize: 80, fontWeight: 900, fontFamily: 'monospace', color: secondsRemaining < 120 ? '#dc2626' : '#0f172a', margin: '20px 0', lineHeight: 1 }}>
                {fmt(secondsRemaining)}
              </div>

              {/* Status badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 20, background: statusCfg.bg, color: statusCfg.color, fontWeight: 800, fontSize: 13, border: `1px solid ${statusCfg.color}40`, marginBottom: 24 }}>
                {statusCfg.icon} {statusCfg.label} — {statusCfg.tip}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 24 }}>
                <button type="button" onClick={togglePause}
                  style={{ padding: '12px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', background: sessionPaused ? '#10b981' : '#f59e0b', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sessionPaused ? <><FiPlay size={16} /> Resume</> : <><FiPause size={16} /> Pause</>}
                </button>
                <button type="button" onClick={handleSessionComplete}
                  style={{ padding: '12px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', background: '#047857', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCheckCircle size={16} /> Complete & Save
                </button>
                <button type="button" onClick={endSessionEarly}
                  style={{ padding: '12px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                  End Early
                </button>
              </div>

              {/* Notes */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>SESSION SCRATCHPAD</label>
                <textarea rows={3} placeholder="Jot down key points, formulas, or questions..."
                  value={notes} onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Telemetry sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Score card */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>FOCUS SCORE</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{finalScore}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>out of 100</div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${finalScore}%`, background: scoreColor, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>

              {/* Live telemetry */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiActivity size={14} color="#0284c7" /> Live Signals
                </h3>
                {[
                  { label: 'Time Elapsed',     value: `${fmt(elapsedSeconds)}` },
                  { label: 'Tab Switches',      value: `${tabSwitchCount}×`,         warn: tabSwitchCount > 2 },
                  { label: 'Inactive Time',     value: `${inactiveSeconds}s`,         warn: inactiveSeconds > 60 },
                  { label: 'Camera Events',     value: `${awayEvents + distractionEvents}`,warn: awayEvents > 2 },
                  { label: 'Speech Events',     value: `${speechEvents}`,             warn: speechEvents > 3 },
                ].map(({ label, value, warn }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: warn ? '#dc2626' : '#0f172a' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Focus tip */}
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 16, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534' }}>
                <strong>💡 Tip:</strong> Closing other tabs and silencing notifications gives the highest focus scores.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE 3: COMPLETED ─────────────────────────────────────────── */}
      {sessionCompleted && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FiAward size={32} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>Focus Session Complete!</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
              You studied <strong>{subject}</strong>{topic ? ` — ${topic}` : ''} for <strong>{Math.round(elapsedSeconds / 60)} minutes</strong>.
            </p>
          </div>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'FOCUS SCORE',   value: `${finalScore}`,         color: scoreColor   },
              { label: 'TOTAL TIME',    value: `${Math.round(elapsedSeconds/60)} min`, color: '#0f172a' },
              { label: 'TAB SWITCHES',  value: `${tabSwitchCount}`,      color: tabSwitchCount > 3 ? '#dc2626' : '#059669' },
              { label: 'AWAY EVENTS',   value: `${awayEvents}`,          color: '#0f172a'    },
              { label: 'FOCUS RATIO',   value: `${Math.round(focusRatio * 100)}%`, color: '#0284c7' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#f8fafc', padding: 20, borderRadius: 16, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Score breakdown explanation */}
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: 20, marginBottom: 28, border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>📊 Score Breakdown</h4>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 2 }}>
              <strong>Base (focus ratio):</strong> {Math.round(focusRatio * 100)} / 100<br />
              <strong>Tab switch penalty:</strong> −{tabSwitchCount} × {DEFAULT_SCORING.tabSwitchPenalty} = −{tabSwitchCount * DEFAULT_SCORING.tabSwitchPenalty}<br />
              <strong>Away events penalty:</strong> −{awayEvents} × {DEFAULT_SCORING.cameraAwayPenalty} = −{awayEvents * DEFAULT_SCORING.cameraAwayPenalty}<br />
              <strong>Camera motion:</strong> −{distractionEvents} × {DEFAULT_SCORING.motionPenalty} = −{distractionEvents * DEFAULT_SCORING.motionPenalty}<br />
              <strong style={{ color: scoreColor }}>Final Score: {finalScore} / 100</strong>
            </div>
          </div>

          {notes && (
            <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 14, marginBottom: 28 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#334155', margin: '0 0 8px' }}>Your Session Notes</h4>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>{notes}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={resetSession}
              style={{ padding: '14px 28px', borderRadius: 12, background: '#0284c7', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiRotateCcw size={16} /> New Session
            </button>
            <Link to="/college/peer-chat"
              style={{ padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <FiUsers size={16} /> Study With a Peer
            </Link>
            <Link to="/college/focus/analytics"
              style={{ padding: '14px 28px', borderRadius: 12, background: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <FiBarChart2 size={16} /> View Analytics
            </Link>
            <button type="button" onClick={() => navigate('/college/academic/planner')}
              style={{ padding: '14px 24px', borderRadius: 12, background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              Update Planner
            </button>
          </div>
        </div>
      )}

      {/* Intervention Modal */}
      {showInterventionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 440, borderRadius: 20, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fffbe6', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FiAlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Need a reset?</h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
              You've switched away several times. Would you like to pause or adjust your session?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={() => { setShowInterventionModal(false); setSessionPaused(true) }}
                style={{ padding: 12, borderRadius: 10, background: '#0284c7', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                Take a Break (Pause)
              </button>
              <button type="button" onClick={() => setShowInterventionModal(false)}
                style={{ padding: 12, borderRadius: 10, background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                Continue Focus Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }
const inputStyle  = { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14, background: '#f8fafc', fontWeight: 600, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }
