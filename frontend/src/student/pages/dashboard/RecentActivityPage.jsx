// frontend/src/student/pages/dashboard/RecentActivityPage.jsx
//
// Full per-student activity history at /student/recent-activity.
// Filter tabs + "Load More" pagination, with loading / empty / error states.
// Reuses the shared ActivityTimeline component used by the dashboard card.

import React, { useCallback, useEffect, useState } from 'react'
import {
  FiActivity,
  FiBookOpen,
  FiAward,
  FiFileText,
  FiCompass,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi'
import activityService from '../../services/activityService'
import { ActivityTimeline } from '../../components/activity/ActivityTimeline'
import { SLoader } from '../../components/ui'
import s from './RecentActivityPage.module.css'

// Tab → activity types. `null` means "no filter" (All).
const TABS = [
  { id: 'All', label: 'All', icon: FiActivity, types: null },
  {
    id: 'Courses',
    label: 'Courses',
    icon: FiBookOpen,
    types: ['course_viewed', 'course_saved', 'course_completed'],
  },
  {
    id: 'Colleges',
    label: 'Colleges',
    icon: FiCompass,
    types: ['college_viewed', 'college_saved'],
  },
  {
    id: 'Scholarships',
    label: 'Scholarships',
    icon: FiAward,
    types: ['scholarship_viewed', 'scholarship_saved'],
  },
  {
    id: 'Exams',
    label: 'Exams',
    icon: FiFileText,
    types: ['exam_viewed', 'quiz_completed'],
  },
  {
    id: 'Career',
    label: 'Career',
    icon: FiCompass,
    types: [
      'career_explored',
      'career_assessment_completed',
      'recommendation_viewed',
      'module_completed',
    ],
  },
]

const PAGE_SIZE = 10

export default function RecentActivityPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchPage = useCallback(
    async (tab, pageNum, append) => {
      const tabConfig = TABS.find((t) => t.id === tab) || TABS[0]
      const params = { page: pageNum, limit: PAGE_SIZE }
      if (tabConfig.types && tabConfig.types.length) params.type = tabConfig.types.join(',')

      if (append) setLoadingMore(true)
      else {
        setLoading(true)
        setError(false)
      }

      try {
        const { items, pagination } = await activityService.getActivities(params)
        setActivities((prev) => (append ? [...prev, ...items] : items))
        setHasMore(Boolean(pagination?.hasMore))
        setPage(pageNum)
      } catch {
        if (!append) {
          setError(true)
          setActivities([])
        }
      } finally {
        if (append) setLoadingMore(false)
        else setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchPage(activeTab, 1, false)
  }, [activeTab, fetchPage])

  const handleTab = (id) => {
    if (id === activeTab) return
    setActiveTab(id)
  }

  const handleLoadMore = () => {
    if (loadingMore) return
    fetchPage(activeTab, page + 1, true)
  }

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div>
          <h1 className={s.title}>Recent Activity</h1>
          <p className={s.subtitle}>
            Your latest actions across courses, colleges, scholarships, exams and careers.
          </p>
        </div>
      </header>

      <div className={s.tabBar} role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${s.tab} ${activeTab === tab.id ? s.tabActive : ''}`}
              onClick={() => handleTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className={s.card}>
        {loading ? (
          <div className={s.loadingWrap}>
            <SLoader />
          </div>
        ) : error ? (
          <div className={s.state}>
            <div className={`${s.stateIcon} ${s.stateIconError}`}>
              <FiAlertCircle size={26} />
            </div>
            <p className={s.stateTitle}>Couldn’t load your activity</p>
            <p className={s.stateDesc}>Please try again in a moment.</p>
            <button className={s.retryBtn} onClick={() => fetchPage(activeTab, 1, false)}>
              <FiRefreshCw size={14} /> Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className={s.state}>
            <div className={s.stateIcon}>
              <FiActivity size={26} />
            </div>
            <p className={s.stateTitle}>No recent activity yet.</p>
            <p className={s.stateDesc}>
              Start exploring courses, colleges, scholarships and careers to see your activity here.
            </p>
          </div>
        ) : (
          <>
            <ActivityTimeline activities={activities} />
            {hasMore && (
              <div className={s.loadMoreWrap}>
                <button className={s.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}