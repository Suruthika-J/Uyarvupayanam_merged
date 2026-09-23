import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TabNav from '../../components/class5/redesign/TabNav'
import { C5 } from '../../components/class5/redesign/class5Theme'

// Layout for the Class 5 career-discovery tabs.
// Active tab is derived from the current route path.
export default function Class5Dashboard() {
  const { pathname } = useLocation()
  const segment = pathname.split('/').filter(Boolean).pop() || 'adhikaram'
  const active = {
    adhikaram: 'adhikaram',
    maths: 'maths',
    social: 'social',
    science: 'science',
    'trophy-room': 'trophy-room',
    scholarships: 'scholarships',
  }[segment] ||
    (/^\d+$/.test(segment) ? 'adhikaram' : undefined) ||
    (pathname.includes('/maths/') ? 'maths' : undefined) ||
    (pathname.includes('/social/') ? 'social' : undefined) ||
    (pathname.includes('/science/') ? 'science' : undefined)

  return (
    <div className="student-root" style={{ background: '#fbfdff', minHeight: '100vh', paddingBottom: 100 }}>
      <section
        style={{
          padding: '34px 24px 0',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #eaf3fb 0%, #fbfdff 100%)',
          borderBottom: '1px solid #eef3f8',
          marginBottom: 30,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C5.navy,
              background: '#fff',
              border: '1px solid #dbe7f1',
              borderRadius: 99,
              padding: '6px 14px',
              marginBottom: 12,
            }}
          >
            Uyarvu Payanam · Class 5
          </span>
          <h1
            style={{
              fontFamily: 'var(--s-font-display)',
              fontWeight: 900,
              fontSize: 'clamp(28px, 4vw, 40px)',
              margin: '0 0 8px',
              color: C5.ink,
              letterSpacing: '-0.02em',
            }}
          >
            Explore, play and <span style={{ color: C5.navy }}>grow</span> your strengths
          </h1>
          <p style={{ fontSize: 15.5, color: C5.muted, maxWidth: 620, margin: '0 auto 0', lineHeight: 1.6 }}>
            Jump into Kural Worlds, Math, Social and Science adventures. Every step you take is your own journey — there's no
            first or last, only your curiosity.
          </p>
          <div style={{ padding: '26px 0 0' }}>
            <TabNav active={active} />
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <Outlet />
      </main>
    </div>
  )
}