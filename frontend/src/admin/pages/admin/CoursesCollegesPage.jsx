import React from 'react'
import StreamCoursesHub from './StreamCoursesHub'

/**
 * Level-2 route: /admin/courses-colleges/:stream
 * Same Class-10-themed tabbed hub — the URL normally selects the active tab
 * via useParams inside StreamCoursesHub. Keeping this file as its own entry
 * point means deep links and the AdminLayout breadcrumb keep working.
 */
export default function CoursesCollegesPage() {
  return <StreamCoursesHub />
}