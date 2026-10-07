// frontend/src/student/services/activityService.js
//
// Thin client for the per-student Recent Activity API.
//   GET  /api/students/recent-activities
//   GET  /api/students/activities
//   POST /api/students/activities
//
// studentApi attaches the studentToken and baseURL ends in /api.

import studentApi from './studentApi'

const activityService = {
  // Latest N activities — used by the dashboard card.
  getRecent: (limit = 5) =>
    studentApi
      .get('/students/recent-activities', { params: { limit } })
      .then((res) => res.data?.data || []),

  // Paginated / filterable history — used by the Recent Activity page.
  // `type` may be a string or an array of types.
  getActivities: ({ type, page = 1, limit = 10 } = {}) =>
    studentApi
      .get('/students/activities', { params: { type, page, limit } })
      .then((res) => ({
        items: res.data?.data || [],
        pagination: res.data?.pagination || { page, limit, total: 0, hasMore: false },
      })),

  // Fire-and-forget tracking. Never throws, never blocks a page, and is a
  // no-op for logged-out visitors (studentApi would otherwise 401-redirect).
  record: (payload) => {
    try {
      if (typeof window === 'undefined' || !localStorage.getItem('studentToken')) return
      studentApi.post('/students/activities', payload).catch(() => {})
    } catch {
      /* tracking must never break the caller */
    }
  },
}

export default activityService