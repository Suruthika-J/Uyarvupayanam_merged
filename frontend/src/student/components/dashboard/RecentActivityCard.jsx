// frontend/src/student/components/dashboard/RecentActivityCard.jsx
//
// Right-rail "Recent Activity" card shown on the school student dashboard.
// Shows the latest 5 activities with a "View All →" link to the full page.
// Self-contained: fetches its own data and handles loading / empty / error.

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiActivity } from 'react-icons/fi'
import activityService from '../../services/activityService'
import { ActivityTimeline } from '../activity/ActivityTimeline'
import s from './RecentActivityCard.module.css'

function Skeleton() {
  return (
    <div className={s.skeletonList} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={s.skeletonRow}>
          <div className={s.skeletonIcon} />
          <div className={s.skeletonBody}>
            <div className={s.skeletonLine} />
            <div className={`${s.skeletonLine} ${s.skeletonLineSm}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecentActivityCard() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await activityService.getRecent(5)
        if (alive) setActivities(Array.isArray(data) ? data : [])
      } catch {
        if (alive) setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className={s.card}>
      <div className={s.header}>
        <h3 className={s.title}>Recent Activity</h3>
        <Link to="/student/recent-activity" className={s.viewAll}>
          View All <FiArrowRight size={13} />
        </Link>
      </div>

      <div className={s.body}>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className={s.state}>
            <div className={s.stateIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
              <FiActivity size={22} />
            </div>
            <p className={s.stateTitle}>Couldn’t load your activity</p>
            <p className={s.stateDesc}>Please try again in a moment.</p>
          </div>
        ) : activities.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>
              <FiActivity size={22} />
            </div>
            <div className={s.emptyTitle}>No recent activity yet.</div>
            <div className={s.emptyDesc}>
              Start exploring courses, colleges, scholarships and careers to see your activity here.
            </div>
          </div>
        ) : (
          <ActivityTimeline activities={activities} />
        )}
      </div>
    </div>
  )
}