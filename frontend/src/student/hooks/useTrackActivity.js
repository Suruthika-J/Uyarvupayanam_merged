// frontend/src/student/hooks/useTrackActivity.js
//
// Records a single activity once per (type + entityId) for the lifetime of
// the component. Safe as a fire-and-forget side effect on detail pages.

import { useEffect, useRef } from 'react'
import activityService from '../services/activityService'

export default function useTrackActivity({ type, entityId, title, description, link, metadata }) {
  const doneRef = useRef(false)

  useEffect(() => {
    if (!type || !entityId || doneRef.current) return
    doneRef.current = true
    activityService.record({
      type,
      title,
      description,
      metadata: { entityId, link, ...(metadata || {}) },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, entityId])
}