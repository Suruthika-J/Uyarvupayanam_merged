import React from 'react'
import { SCard } from '../../components/ui'
import { FiBarChart2, FiTrendingUp, FiCheckCircle, FiAward, FiZap } from 'react-icons/fi'

export default function PerformanceAnalyticsPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiBarChart2 size={14} /> Telemetry Analytics
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Academic Performance Analytics
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Real-time metrics on subject diagnostic assessments, study consistency, and skill growth.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid #047857' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Overall Assessment Score</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#047857', marginTop: 4 }}>84%</div>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginTop: 4 }}>✓ Strong Performance Level</div>
        </SCard>

        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid var(--s-primary)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Study Task Completion</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--s-primary)', marginTop: 4 }}>92%</div>
          <div style={{ fontSize: 12, color: 'var(--s-primary)', fontWeight: 700, marginTop: 4 }}>⚡ High Learning Consistency</div>
        </SCard>

        <SCard style={{ padding: 20, borderRadius: 16, borderLeft: '4px solid #b45309' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Acquired Domain Skills</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#b45309', marginTop: 4 }}>6 / 8</div>
          <div style={{ fontSize: 12, color: '#b45309', fontWeight: 700, marginTop: 4 }}>🎯 2 Skills in Progress</div>
        </SCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>Strong Subject Areas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Data Structures & Algorithms (90%)', 'Object Oriented Programming (88%)', 'SQL & Database Design (85%)'].map((s, i) => (
              <div key={i} style={{ padding: 12, background: '#d1fae5', borderRadius: 12, color: '#047857', fontWeight: 700, fontSize: 13 }}>
                ✓ {s}
              </div>
            ))}
          </div>
        </SCard>

        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>Target Improvement Areas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['System Architecture & Scalability', 'Advanced Machine Learning Theory', 'Cloud DevOps & CI/CD'].map((s, i) => (
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
