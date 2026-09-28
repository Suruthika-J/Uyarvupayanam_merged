import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TAB_ICONS } from './class5Theme'
import { STabs } from '../../ui'

// Class 5 section tabs — rendered by the shared STabs pill primitive
// (same tab language as the Class 8/10/12 class pages). Active tab is
// green; inactive tabs are neutral with a tinted icon. Tabs navigate to
// their world page under /student/class5.
const CLASS5_TABS = [
  { path: '/student/class5/adhikaram', label: 'Kural Worlds', tab: 'adhikaram' },
  { path: '/student/class5/maths', label: 'Math Adventure', tab: 'maths' },
  { path: '/student/class5/social', label: 'World Explorer', tab: 'social' },
  { path: '/student/class5/science', label: 'Science World', tab: 'science' },
  { path: '/student/class5/english', label: 'English Adventure', tab: 'english' },
  { path: '/student/class5/scholarships', label: 'Scholarships', tab: 'scholarships' },
]

export default function TabNav({ active = 'adhikaram' }) {
  const navigate = useNavigate()

  return (
    <STabs
      tabs={CLASS5_TABS.map((t) => {
        const TabIcon = TAB_ICONS[t.tab]
        return {
          id: t.tab,
          label: t.label,
          icon: <TabIcon size={16} strokeWidth={2.4} aria-hidden="true" />,
          iconColor: 'var(--s-primary)',
        }
      })}
      active={active}
      onChange={(id) => navigate(`/student/class5/${id}`)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        border: '1px solid #e8f0eb',
      }}
    />
  )
}