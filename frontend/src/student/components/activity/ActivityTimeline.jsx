// frontend/src/student/components/activity/ActivityTimeline.jsx
//
// Shared vertical-timeline renderer for the Recent Activity feature. Used by
// both the dashboard card (latest 5) and the full Recent Activity page.

import React from 'react'
import { Link } from 'react-router-dom'
import s from './ActivityTimeline.module.css'

// type → emoji + soft tint, matching the rest of the student area's palette.
export const ACTIVITY_META = {
  course_viewed: { icon: '🎓', color: '#059669', bg: '#ecfdf5' },
  course_saved: { icon: '🎓', color: '#059669', bg: '#ecfdf5' },
  course_completed: { icon: '🎓', color: '#059669', bg: '#ecfdf5' },
  college_viewed: { icon: '🏫', color: '#2563eb', bg: '#eff6ff' },
  college_saved: { icon: '🏫', color: '#2563eb', bg: '#eff6ff' },
  scholarship_viewed: { icon: '📜', color: '#7c3aed', bg: '#f5f3ff' },
  scholarship_saved: { icon: '📜', color: '#7c3aed', bg: '#f5f3ff' },
  exam_viewed: { icon: '📝', color: '#d97706', bg: '#fffbeb' },
  career_assessment_completed: { icon: '🎯', color: '#db2777', bg: '#fdf2f8' },
  career_explored: { icon: '🧭', color: '#0891b2', bg: '#ecfeff' },
  quiz_completed: { icon: '✅', color: '#ea580c', bg: '#fff7ed' },
  module_completed: { icon: '📖', color: '#0d9488', bg: '#f0fdfa' },
  recommendation_viewed: { icon: '💡', color: '#4f46e5', bg: '#eef2ff' },
}

const DEFAULT_META = { icon: '⭐', color: '#64748b', bg: '#f1f5f9' }

export function getActivityMeta(type) {
  return ACTIVITY_META[type] || DEFAULT_META
}

// "Today · 10:30 AM" / "Yesterday · 04:15 PM" / "2 days ago · 11:20 AM"
export function formatActivityTime(value) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''

  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000)

  let day
  if (dayDiff <= 0) day = 'Today'
  else if (dayDiff === 1) day = 'Yesterday'
  else if (dayDiff < 7) day = `${dayDiff} days ago`
  else day = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

  const time = d
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase()

  return `${day} · ${time}`
}

export function ActivityItem({ activity }) {
  const meta = getActivityMeta(activity.type)
  const link = activity.metadata?.link
  const time = formatActivityTime(activity.createdAt)

  const body = (
    <>
      <div className={s.iconWrap} style={{ background: meta.bg, color: meta.color }}>
        <span aria-hidden="true">{meta.icon}</span>
      </div>
      <div className={s.body}>
        <div className={s.top}>
          <span className={s.title}>{activity.title}</span>
          {time && <span className={s.time}>{time}</span>}
        </div>
        {activity.description && <div className={s.desc}>{activity.description}</div>}
      </div>
    </>
  )

  if (link) {
    return (
      <Link to={link} className={`${s.item} ${s.clickable}`}>
        {body}
      </Link>
    )
  }

  return <div className={s.item}>{body}</div>
}

export function ActivityTimeline({ activities = [], empty }) {
  if (!activities.length) return empty || null
  return (
    <div className={s.timeline}>
      {activities.map((a) => (
        <ActivityItem key={a._id} activity={a} />
      ))}
    </div>
  )
}