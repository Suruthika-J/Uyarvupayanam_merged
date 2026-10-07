import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCard, SBadge } from '../../../components/UI'
import { graduateExamService } from '../../../../services/graduateExamService'

/**
 * GraduateExamsHome — module landing page. Two directions:
 *   State Government  → states → organizations → exams
 *   Central Government → organizations → exams
 */
export default function GraduateExamsHome() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ state: null, central: null })

  useEffect(() => {
    let alive = true
    Promise.all([
      graduateExamService.getOrganizations({ governmentType: 'State' }),
      graduateExamService.getOrganizations({ governmentType: 'Central' }),
    ])
      .then(([stateRes, centralRes]) => {
        if (!alive) return
        setCounts({
          state: stateRes.count ?? stateRes.data?.length ?? 0,
          central: centralRes.count ?? centralRes.data?.length ?? 0,
        })
      })
      .catch(() => {
        if (alive) setCounts({ state: 0, central: 0 })
      })
    return () => { alive = false }
  }, [])

  const tiles = [
    {
      key: 'state',
      icon: '🏛️',
      title: 'State Government',
      sub: 'State-level recruitment commissions & boards',
      desc: 'Drill into a state, its recruitment organisations (e.g. TNPSC) and every managed examination record.',
      count: counts.state,
      countLabel: 'Organizations',
      onClick: () => navigate('/admin/graduate-exams/state'),
      color: '#2563eb',
    },
    {
      key: 'central',
      icon: '🏢',
      title: 'Central Government',
      sub: 'Union-level recruitment organisations',
      desc: 'Organizations such as UPSC, SSC, IBPS/SBI and Railway Recruitment Boards and their examination records.',
      count: counts.central,
      countLabel: 'Organizations',
      onClick: () => navigate('/admin/graduate-exams/central'),
      color: '#7c3aed',
    },
  ]

  return (
    <div>
      <h2 style={{ fontFamily: 'Nunito', fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: '0 0 6px' }}>
        Graduate Exams
      </h2>
      <p style={{ margin: '0 0 24px', color: 'var(--text3)', fontSize: 14, fontWeight: 600 }}>
        Manage graduate-level government recruitment examinations — the database that powers the student
        Government Career pages. Volatile details (dates, vacancies, status, application links) are only
        shown once you add them from the latest official notification.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {tiles.map((t) => (
          <SCard key={t.key} hover style={{ padding: 28, cursor: 'pointer' }} >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 34 }}>{t.icon}</div>
              {typeof t.count === 'number' && (
                <SBadge color={t.key === 'state' ? 'blue' : 'purple'}>
                  {t.count} {t.countLabel}
                </SBadge>
              )}
            </div>
            <h3 style={{ margin: '0 0 4px', fontFamily: 'Nunito', fontSize: 20, fontWeight: 900, color: t.color }}>
              {t.title}
            </h3>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.sub}
            </p>
            <p style={{ margin: '0 0 22px', fontSize: 14, lineHeight: 1.6, color: 'var(--text2)' }}>{t.desc}</p>
            <button
              onClick={t.onClick}
              style={{
                width: '100%', background: t.color, color: '#fff', border: 'none', borderRadius: 12,
                padding: '13px 0', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14,
                cursor: 'pointer', transition: 'filter 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.94)' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
            >
              Open {t.title} →
            </button>
          </SCard>
        ))}
      </div>
    </div>
  )
}