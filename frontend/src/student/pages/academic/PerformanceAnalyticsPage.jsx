import React, { useState, useEffect } from 'react'
import { SCard, SBadge, SLoader } from '../../components/ui'
import { FiBarChart2, FiTrendingUp, FiCheckCircle, FiAward, FiZap, FiUser, FiCalendar } from 'react-icons/fi'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import axios from 'axios'

export default function PerformanceAnalyticsPage() {
  const { profile } = useCollegeProfile()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('studentToken')
        const res = await axios.get('http://localhost:5000/api/study-tools/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success) {
          setAnalytics(res.data.analytics)
        }
      } catch (err) {
        console.warn('Failed to load telemetry analytics data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const cgpa = profile?.cgpa || analytics?.cgpa || '8.4'
  const skills = profile?.skills || []
  const subjects = profile?.subjects || []
  const assessmentScore = analytics?.assessmentScore || profile?.grokAssessmentScore || 82
  const degree = profile?.degreeProgramme || 'Your Degree'
  const domain = profile?.domain || profile?.field || 'Your Domain'

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Computing historical performance telemetry & skill growth curves...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiBarChart2 size={14} /> Telemetry Analytics Engine
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          College Performance Analytics
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Unified dashboard integrating CGPA trends, assessment attempts over time, study completion rate, and target career readiness.
        </p>
      </div>

      {/* Profile Context Banner */}
      <div style={{ padding: '14px 18px', borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
        <FiUser size={16} />
        <span>Performance telemetry for <strong>{degree}</strong> — {domain} ({profile?.currentSemester || 'Current Semester'})</span>
      </div>

      {/* METRIC CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 28 }}>
        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid #047857' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Academic CGPA</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#047857', marginTop: 4 }}>{cgpa}</div>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginTop: 4 }}>
            ✓ Consistent Academic Standing
          </div>
        </SCard>

        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid var(--s-primary)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Diagnostic Score</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--s-primary)', marginTop: 4 }}>
            {assessmentScore}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--s-primary)', fontWeight: 700, marginTop: 4 }}>
            ⚡ AI Diagnostic Benchmark
          </div>
        </SCard>

        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Study Task Completion</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#7c3aed', marginTop: 4 }}>
            {analytics?.studyCompletionRate || 85}%
          </div>
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700, marginTop: 4 }}>
            📅 Planner Consistency
          </div>
        </SCard>

        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid #b45309' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Target Career Readiness</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#b45309', marginTop: 4 }}>
            {analytics?.careerReadiness || 88}%
          </div>
          <div style={{ fontSize: 12, color: '#b45309', fontWeight: 700, marginTop: 4 }}>
            🎯 Career Placement Match
          </div>
        </SCard>
      </div>

      {/* HISTORICAL ASSESSMENT SCORE TABLE */}
      <SCard style={{ padding: 26, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiCalendar color="var(--s-primary)" /> Assessment Attempt History (Never Overwritten)
        </h3>

        {analytics?.historicalScores?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--s-border)' }}>
                  <th style={{ padding: 12, fontSize: 13, color: 'var(--s-text3)' }}>Attempt Date</th>
                  <th style={{ padding: 12, fontSize: 13, color: 'var(--s-text3)' }}>Assessment Score</th>
                  <th style={{ padding: 12, fontSize: 13, color: 'var(--s-text3)' }}>Performance Level</th>
                </tr>
              </thead>
              <tbody>
                {analytics.historicalScores.map((h, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--s-border)' }}>
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: 'var(--s-text)' }}>{h.date}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 900, color: 'var(--s-primary)' }}>{h.percentage}%</td>
                    <td style={{ padding: 12 }}>
                      <SBadge color={h.percentage >= 80 ? 'green' : 'blue'}>{h.level}</SBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--s-text3)', textAlign: 'center', padding: 20 }}>
            Take practice assessments to track your score progress history over time.
          </div>
        )}
      </SCard>

      {/* SKILLS VS WEAK SUBJECTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
            Acquired Skill Growth
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(skills.length > 0 ? skills : ['Python', 'Data Structures & Algorithms', 'SQL', 'React']).map((s, i) => (
              <div key={i} style={{ padding: 12, background: '#d1fae5', borderRadius: 12, color: '#047857', fontWeight: 700, fontSize: 13 }}>
                ✓ {s}
              </div>
            ))}
          </div>
        </SCard>

        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
            Flagged Focus Areas (Study Planner Sync)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(subjects.length > 0 ? subjects : ['Database Management Systems', 'System Architecture']).map((s, i) => (
              <div key={i} style={{ padding: 12, background: '#fef3c7', borderRadius: 12, color: '#b45309', fontWeight: 700, fontSize: 13 }}>
                ⚡ {s}
              </div>
            ))}
          </div>
        </SCard>
      </div>

    </div>
  )
}
