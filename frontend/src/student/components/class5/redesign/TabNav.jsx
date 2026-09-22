import React from 'react'
import { NavLink } from 'react-router-dom'
import { C5 } from './class5Theme'

export default function TabNav({ active = 'discover-me' }) {
  const CLASS5_TABS = [
    { path: '/student/class5/discover-me', label: 'Discover Me', emoji: '🧭', tab: 'discover-me' },
    { path: '/student/class5/skill-quests', label: 'Skill Quests', emoji: '🎯', tab: 'skill-quests' },
    { path: '/student/class5/squad', label: 'Squad', emoji: '👫', tab: 'squad' },
    { path: '/student/class5/real-world', label: 'Real World', emoji: '🌍', tab: 'real-world' },
    { path: '/student/class5/trophy-room', label: 'Trophy Room', emoji: '🏆', tab: 'trophy-room' },
    { path: '/student/class5/scholarships', label: 'Scholarships', emoji: '🎓', tab: 'scholarships' },
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
            <span style={{ fontSize: 16 }} aria-hidden="true">{t.emoji}</span>
            {t.label}
          </NavLink>
        )
      })}
    </nav>
  )
}