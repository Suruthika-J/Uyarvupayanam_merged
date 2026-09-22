import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import FocusCameraDetector from '../../components/common/FocusCameraDetector'
import {
  FiClock, FiPlay, FiPause, FiCheckCircle, FiAlertTriangle,
  FiEye, FiActivity, FiBookOpen, FiRotateCcw, FiAward, FiArrowLeft, FiSliders
} from 'react-icons/fi'

export default function FocusLearningPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()

  // Session Config
  const userSubjects = profile?.subjects?.length ? profile.subjects : ['Digital Electronics', 'Data Structures', 'Operating Systems', 'Case Analysis', 'Clinical Pharmacology']
  const [selectedSubject, setSelectedSubject] = useState(userSubjects[0])
  const [topicName, setTopicName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(25)

  // Active Session State
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Telemetry & Metrics
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [inactiveSeconds, setInactiveSeconds] = useState(0)
  const [awayEvents, setAwayEvents] = useState(0)
  const [distractionEvents, setDistractionEvents] = useState(0)
  const [notes, setNotes] = useState('')

  // UI Interventions
  const [toastMessage, setToastMessage] = useState(null)
  const [showInterventionModal, setShowInterventionModal] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const tabLeaveTimeRef = useRef(null)

  // ── 1. Tab & Window Activity Listener ──────────────────────────────────────
  useEffect(() => {
    if (!sessionActive || sessionPaused || sessionCompleted) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabLeaveTimeRef.current = Date.now()
        setTabSwitchCount(prev => {
          const updated = prev + 1
          if (updated === 3) triggerToast('Stay focused! You switched away from your study tab.')
          if (updated === 6) setShowInterventionModal(true)
          return updated
        })
      } else {
        if (tabLeaveTimeRef.current) {
          const duration = Math.round((Date.now() - tabLeaveTimeRef.current) / 1000)
          setInactiveSeconds(prev => prev + duration)
          tabLeaveTimeRef.current = null
        }
      }
    }

    const handleWindowBlur = () => {
      if (!document.hidden) {
        setTabSwitchCount(prev => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [sessionActive, sessionPaused, sessionCompleted])

  // ── 2. Timer Loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive || sessionPaused || sessionCompleted) return

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          finishSession()
          return 0
        }
        return prev - 1
      })
      setElapsedSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionActive, sessionPaused, sessionCompleted])

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const startSession = () => {
    if (!selectedSubject) return
    setSecondsRemaining(durationMinutes * 60)
    setElapsedSeconds(0)
    setTabSwitchCount(0)
    setInactiveSeconds(0)
    setAwayEvents(0)
    setDistractionEvents(0)
    setSessionActive(true)
    setSessionPaused(false)
    setSessionCompleted(false)
  }

  const pauseSession = () => setSessionPaused(prev => !prev)

  const finishSession = () => {
    setSessionActive(false)
    setSessionCompleted(true)
  }

  const resetSession = () => {
    setSessionActive(false)
    setSessionPaused(false)
    setSessionCompleted(false)
    setSecondsRemaining(durationMinutes * 60)
    setElapsedSeconds(0)
  }

  // ── 3. Calculate Focus Score ───────────────────────────────────────────────
  const calculateFocusScore = () => {
    const totalMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    const focusRatio = (elapsedSeconds - inactiveSeconds) / Math.max(1, elapsedSeconds)
    let score = Math.round(focusRatio * 100)

    // Deduct penalties
    score -= tabSwitchCount * 4
    score -= awayEvents * 6
    score -= distractionEvents * 2

    return Math.max(15, Math.min(100, score))
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const score = calculateFocusScore()

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: 'var(--s-font-body)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/college/dashboard')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 6 }}
          >
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            🎯 Focus Learning Session
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Deep work study session with real-time distraction feedback & focus scoring.
          </p>
        </div>

        {sessionActive && (
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '8px 16px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #a7f3d0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
            Focus Session Active
          </div>
        )}
      </div>

      {/* Toast Intervention */}
      {toastMessage && (
        <div style={{
          background: '#fffbebfb', color: '#b45309', border: '1px solid #fde68a',
          padding: '12px 20px', borderRadius: 12, marginBottom: 20,
          fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <FiAlertTriangle size={18} />
          {toastMessage}
        </div>
      )}

      {/* ── STATE 1: SETUP SCREEN ────────────────────────────────────────── */}
      {!sessionActive && !sessionCompleted && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid var(--s-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
            Configure Your Focus Session
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                Select Subject / Module *
              </label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1',
                  fontSize: 14, background: '#f8fafc', fontWeight: 600, color: '#0f172a'
                }}
              >
                {userSubjects.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                Specific Topic / Chapter (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Binary Search Trees / Constitutional Law"
                value={topicName}
                onChange={e => setTopicName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1',
                  fontSize: 14, background: '#f8fafc', fontWeight: 600, color: '#0f172a'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
              Choose Target Duration
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[15, 25, 45, 60].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => { setDurationMinutes(mins); setSecondsRemaining(mins * 60) }}
                  style={{
                    padding: '12px 24px', borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    background: durationMinutes === mins ? '#0284c7' : '#f1f5f9',
                    color: durationMinutes === mins ? '#fff' : '#475569',
                    border: durationMinutes === mins ? 'none' : '1px solid #e2e8f0',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={startSession}
            style={{
              width: '100%', padding: '16px', borderRadius: 14, background: '#0284c7', color: '#fff',
              fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <FiPlay size={20} /> Begin Focus Session ({durationMinutes} mins)
          </button>
        </div>
      )}

      {/* ── STATE 2: ACTIVE SESSION SCREEN ───────────────────────────────── */}
      {sessionActive && (
        <div>
          {/* Camera Detector Bar (Explicitly user controlled) */}
          <FocusCameraDetector
            active={sessionActive && !sessionPaused}
            onDistractionDetected={() => setDistractionEvents(prev => prev + 1)}
            onAwayDetected={() => setAwayEvents(prev => prev + 1)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Main Timer Display */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--s-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {selectedSubject} {topicName && `• ${topicName}`}
              </div>

              {/* Big Digital Clock */}
              <div style={{ fontSize: 72, fontWeight: 900, fontFamily: 'monospace', color: '#0f172a', margin: '20px 0' }}>
                {formatTime(secondsRemaining)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
                <button
                  type="button"
                  onClick={pauseSession}
                  style={{
                    padding: '12px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    background: sessionPaused ? '#10b981' : '#f59e0b', color: '#fff', border: 'none',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  {sessionPaused ? <><FiPlay size={16} /> Resume</> : <><FiPause size={16} /> Pause</>}
                </button>
                <button
                  type="button"
                  onClick={finishSession}
                  style={{
                    padding: '12px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    background: '#047857', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  <FiCheckCircle size={16} /> Complete & Save
                </button>
              </div>

              {/* Quick Notes Input */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8 }}>
                  SESSION SCRATCHPAD / QUICK NOTES
                </label>
                <textarea
                  rows={3}
                  placeholder="Jot down key points or formulas during your focus session..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'var(--s-font-body)' }}
                />
              </div>
            </div>

            {/* Live Session Telemetry Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid var(--s-border)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiActivity color="#0284c7" /> Live Focus Telemetry
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Calculated Focus Score</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: score > 80 ? '#059669' : score > 60 ? '#d97706' : '#dc2626' }}>
                      {score} / 100
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Tab / Window Switches</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: tabSwitchCount > 2 ? '#dc2626' : '#0f172a' }}>
                      {tabSwitchCount} times
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Inactive / Tab Away Time</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {inactiveSeconds} sec
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Camera Distractions</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {distractionEvents + awayEvents} events
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: 4 }}>💡 Focus Tip</strong>
                Keeping your browser on this study tab uninterrupted yields maximum focus score and improves retention!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE 3: SESSION COMPLETED ANALYTICS SUMMARY ────────────────── */}
      {sessionCompleted && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--s-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FiAward size={32} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Focus Session Complete!
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Great job on completing your dedicated study block for <strong>{selectedSubject}</strong>.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, textDecoration: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>FOCUS SCORE</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0284c7', marginTop: 4 }}>{score} / 100</div>
            </div>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, textDecoration: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>TOTAL TIME</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{Math.round(elapsedSeconds / 60)} min</div>
            </div>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, textDecoration: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>TAB SWITCHES</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: tabSwitchCount > 3 ? '#dc2626' : '#059669', marginTop: 4 }}>{tabSwitchCount}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, textDecoration: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>AWAY EVENTS</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{awayEvents}</div>
            </div>
          </div>

          {notes && (
            <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 14, marginBottom: 32 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#334155', margin: '0 0 8px' }}>Saved Session Notes</h4>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>{notes}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={resetSession}
              style={{
                padding: '14px 28px', borderRadius: 12, background: '#0284c7', color: '#fff',
                fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <FiRotateCcw size={16} /> Start Another Session
            </button>
            <button
              type="button"
              onClick={() => navigate('/college/academic/planner')}
              style={{
                padding: '14px 28px', borderRadius: 12, background: '#f1f5f9', color: '#334155',
                fontWeight: 800, fontSize: 14, border: '1px solid #cbd5e1', cursor: 'pointer'
              }}
            >
              Update Study Planner
            </button>
          </div>
        </div>
      )}

      {/* ── Progressive Distraction Intervention Modal ─────────────────────── */}
      {showInterventionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 440, borderRadius: 20, padding: 28, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fffbe6', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FiAlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              Need a quick reset?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
              You've switched away several times during this session. Would you like to take a 5-minute break or adjust your session duration?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => { setShowInterventionModal(false); pauseSession() }}
                style={{ padding: '12px', borderRadius: 10, background: '#0284c7', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
              >
                Take a 5-Minute Break
              </button>
              <button
                type="button"
                onClick={() => setShowInterventionModal(false)}
                style={{ padding: '12px', borderRadius: 10, background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Continue Focus Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
