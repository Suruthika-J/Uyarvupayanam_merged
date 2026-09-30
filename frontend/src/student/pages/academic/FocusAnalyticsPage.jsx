import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCollegeTheme } from '../../context/CollegeThemeContext'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts'
import {
  FiArrowLeft, FiClock, FiZap, FiTarget, FiTrendingUp, FiAward, FiActivity, FiPlay
} from 'react-icons/fi'

const API = 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('studentToken')

export default function FocusAnalyticsPage() {
  const { theme } = useCollegeTheme()
  const [loading, setLoading]   = useState(true)
  const [today,   setToday]     = useState(null)
  const [weekly,  setWeekly]    = useState(null)
  const [stats,   setStats]     = useState(null)
  const [history, setHistory]   = useState([])

  useEffect(() => {
    const h = { headers: { Authorization: `Bearer ${getToken()}` } }
    Promise.all([
      axios.get(`${API}/focus/today`,   h).then(r => r.data.today).catch(() => null),
      axios.get(`${API}/focus/weekly`,  h).then(r => r.data.weekly).catch(() => null),
      axios.get(`${API}/focus/stats`,   h).then(r => r.data.stats).catch(() => null),
      axios.get(`${API}/focus/history`, h).then(r => r.data.sessions || []).catch(() => []),
    ]).then(([t, w, s, hs]) => {
      setToday(t); setWeekly(w); setStats(s); setHistory(hs)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#64748b' }}>
      Loading analytics...
    </div>
  )

  const hasData = history.length > 0

  const distractionLabel = {
    TAB_SWITCH:        'Tab Switching',
    INACTIVITY:        'Inactivity',
    FACE_NOT_DETECTED: 'Camera Away',
    MOTION_DETECTED:   'Motion Detected',
    SPEECH_DETECTED:   'Speech Activity',
    WINDOW_BLUR:       'Window Blur',
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60, fontFamily: 'var(--s-font-body, Inter, sans-serif)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <Link to="/college/academic/focus" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', marginBottom: 6 }}>
            <FiArrowLeft size={16} /> Back to Focus Mode
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>Focus Analytics</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Your study patterns, distraction insights, and progress over time.</p>
        </div>
        <Link to="/college/academic/focus"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0284c7', color: '#fff', padding: '12px 22px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
          <FiPlay size={16} /> Start Session
        </Link>
      </div>

      {!hasData ? (
        <div style={{ background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No Focus Sessions Yet</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Complete your first session to see analytics here.</p>
          <Link to="/college/academic/focus"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0284c7', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
            <FiPlay size={18} /> Start Your First Session
          </Link>
        </div>
      ) : (
        <>
          {/* ── Overall Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Hours',     value: `${stats?.totalHours || 0}h`,   icon: <FiClock size={20} />,     color: '#0284c7' },
              { label: 'Total Sessions',  value: stats?.totalSessions || 0,       icon: <FiZap size={20} />,       color: '#7c3aed' },
              { label: 'Avg Score',       value: `${stats?.avgScore || 0}`,       icon: <FiTarget size={20} />,    color: '#059669' },
              { label: 'Focus Streak',    value: `${stats?.streak || 0} days`,    icon: <FiAward size={20} />,     color: '#ea580c' },
              { label: 'Today (min)',     value: today?.totalFocusMinutes || 0,   icon: <FiActivity size={20} />,  color: '#0891b2' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ color, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Weekly Chart ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>Focus Minutes — This Week</h3>
              {weekly?.byDay?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weekly.byDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <YAxis fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <Tooltip formatter={(v) => [`${v} min`, 'Focus Time']} />
                    <Bar dataKey="focusMinutes" fill="#0284c7" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No data yet</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Top subjects */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Top Subjects</h3>
                {weekly?.topSubjects?.length ? weekly.topSubjects.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{s.subject}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0284c7' }}>{s.minutes} min</span>
                  </div>
                )) : <div style={{ color: '#94a3b8', fontSize: 13 }}>No sessions yet</div>}
              </div>

              {/* Most common distraction */}
              {weekly?.mostCommonDistraction && (
                <div style={{ borderRadius: 16, padding: 20, border: '1px solid #fde68a', background: '#fffbeb' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#92400e', letterSpacing: '0.08em', marginBottom: 6 }}>MOST COMMON DISTRACTION</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#b45309' }}>
                    {distractionLabel[weekly.mostCommonDistraction] || weekly.mostCommonDistraction}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Weekly insights ── */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', borderRadius: 20, padding: 28, marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 18px', color: '#f8fafc' }}>📈 Weekly Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                weekly?.totalMinutes  && `You focused for ${weekly.totalMinutes} minutes this week.`,
                weekly?.longestSessionMinutes > 0 && `Longest session: ${weekly.longestSessionMinutes} minutes.`,
                weekly?.totalSessions && `${weekly.totalSessions} sessions completed.`,
                weekly?.avgScore > 0  && `Average focus score: ${weekly.avgScore} / 100.`,
                weekly?.mostCommonDistraction && `Most common distraction: ${distractionLabel[weekly.mostCommonDistraction] || weekly.mostCommonDistraction}.`,
                stats?.streak > 0     && `🔥 Focus streak: ${stats.streak} day${stats.streak !== 1 ? 's' : ''}.`,
              ].filter(Boolean).map((insight, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* ── Session History ── */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>Recent Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.slice(0, 10).map(s => {
                const sc = s.focusScore; const color = sc > 80 ? '#059669' : sc > 60 ? '#d97706' : '#dc2626'
                return (
                  <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>{sc}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.subject}{s.topic ? ` — ${s.topic}` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                        {Math.round((s.actualDuration || 0) / 60)} min •
                        {new Date(s.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: s.status === 'completed' ? '#059669' : '#94a3b8' }}>
                        {s.status === 'completed' ? '✓ Completed' : 'Abandoned'}
                      </div>
                      {s.distractionCount > 0 && (
                        <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{s.distractionCount} distractions</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
