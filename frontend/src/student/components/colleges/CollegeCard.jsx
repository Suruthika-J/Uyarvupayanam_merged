import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiExternalLink, FiBookOpen } from 'react-icons/fi'
import { SBtn } from '../ui'
import { groupCoursesByDegree } from '../../../utils/courseNormalizer'
import CourseChipGroup from './CourseChipGroup'

const CHIP_LIMIT = 6

/**
 * One college card in the student "Colleges & Courses" directory.
 * Receives an already-deduplicated, needsReview-filtered list of courses that
 * only contain `canonicalName` — never raw admin strings.
 */
export default function CollegeCard({ college, courses = [], highlightedNames = new Set() }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const groups = groupCoursesByDegree(courses)
  const total = courses.length
  const locationText = [college.district, college.location].filter(Boolean).join(', ') || college.state || 'Tamil Nadu'

  return (
    <div className="ccc-card">
      <div className="ccc-card-top">
        <div className="ccc-card-icon"><FiBookOpen /></div>
        <div className="ccc-card-title-wrap">
          <h3 className="ccc-card-title">{college.collegeName}</h3>
          <div className="ccc-card-location">
            <FiMapPin className="ccc-loc-icon" />
            {locationText}
          </div>
        </div>
        <span className="ccc-card-count-badge">{total === 0 ? 'No courses' : `${total} ${total === 1 ? 'course' : 'courses'}`}</span>
      </div>

      <div className="ccc-card-body">
        <div className="ccc-courses-label">Courses Available</div>
        {total === 0 ? (
          <div className="ccc-no-courses">No official courses have been mapped for this college yet.</div>
        ) : (
          <>
            <CourseChipGroup groups={groups} highlightNames={highlightedNames} limit={CHIP_LIMIT} expanded={expanded} />
            {total > CHIP_LIMIT && (
              <button className="ccc-more-toggle" onClick={() => setExpanded(s => !s)}>
                {expanded ? 'Show less' : `+${total - CHIP_LIMIT} more`}
              </button>
            )}
          </>
        )}
      </div>

      <div className="ccc-card-footer">
        <SBtn variant="outline" size="sm" onClick={() => navigate(`/student/colleges/${college._id}`)} style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          View College Details <FiExternalLink size={13} />
        </SBtn>
      </div>
    </div>
  )
}