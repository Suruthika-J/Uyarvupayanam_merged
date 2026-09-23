import React from 'react'
import { NavLink } from 'react-router-dom'
import { C5, TAB_ICONS } from './class5Theme'

export default function TabNav({ active = 'adhikaram' }) {
  const CLASS5_TABS = [
    { path: '/student/class5/adhikaram', label: 'Kural Worlds', tab: 'adhikaram' },
    { path: '/student/class5/maths', label: 'Math Adventure', tab: 'maths' },
    { path: '/student/class5/social', label: 'World Explorer', tab: 'social' },
    { path: '/student/class5/science', label: 'Science World', tab: 'science' },
    { path: '/student/class5/english', label: 'English Adventure', tab: 'english' },
    { path: '/student/class5/scholarships', label: 'Scholarships', tab: 'scholarships' },
  ]

  return (
    <nav
      aria-label="Class 5 sections"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        background: C5.soft,
        border: `1px solid ${C5.line}`,
        borderRadius: 99,
        padding: 6,
        marginBottom: 28,
        width: '100%',
      }}
    >
      {CLASS5_TABS.map((t) => {
        const selected = t.tab === active
        const TabIcon = TAB_ICONS[t.tab]
        return (
          <NavLink
            key={t.tab}
            to={t.path}
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 16px',
              borderRadius: 99,
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: 'var(--s-font-display)',
              color: selected ? '#fff' : C5.muted,
              background: selected ? C5.navy : 'transparent',
              boxShadow: selected ? '0 6px 14px -6px rgba(15,76,117,0.55)' : 'none',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {TabIcon && <TabIcon size={16} strokeWidth={2.4} aria-hidden="true" />}
            {t.label}
          </NavLink>
        )
      })}
    </nav>
  )
}