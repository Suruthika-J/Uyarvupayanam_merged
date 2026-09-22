import React from 'react'

const DEFAULT_LIMIT = 6

/**
 * Renders confirmed (non-needsReview) courses grouped under degree-family
 * sub-headings, e.g.:
 *
 *   Engineering (B.E. / B.Tech.)
 *     [B.E. Mechanical Engineering] [B.E. Civil Engineering]
 *   Science (B.Sc.)
 *     [B.Sc. Microbiology]
 *
 * Only ever shows `canonicalName` — raw / all-caps / un-prefixed course strings
 * never reach this component (parents filter `needsReview` before rendering).
 */
export default function CourseChipGroup({ groups = [], highlightNames = new Set(), limit = DEFAULT_LIMIT, expanded = false }) {
  if (!groups || groups.length === 0) return null

  let budget = expanded ? Infinity : Math.max(limit, 1)
  const visible = []
  for (const group of groups) {
    const count = Math.min(group.courses.length, budget)
    if (count <= 0) break
    visible.push({ ...group, courses: group.courses.slice(0, count) })
    budget -= count
  }

  return (
    <div className="ccc-groups">
      {visible.map(group => (
        <div key={group.degreeFamily} className="ccc-group">
          <div className="ccc-group-label">{group.label}</div>
          <div className="ccc-chips">
            {group.courses.map(course => {
              const isHighlighted = highlightNames.has(String(course.canonicalName || '').toLowerCase())
              return (
                <span key={course.id || course._id} className={`ccc-chip${isHighlighted ? ' ccc-chip-active' : ''}`}>
                  {course.canonicalName}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}