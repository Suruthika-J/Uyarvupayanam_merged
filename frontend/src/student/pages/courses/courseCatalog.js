export const COURSE_CATEGORIES = [
  { key: 'engineering', title: 'Engineering',   accent: '#1e40af', icon: 'FiSettings' },
  { key: 'medical',     title: 'Medical',       accent: '#dc2626', icon: 'FiPlusCircle' },
  { key: 'law',         title: 'Law',           accent: '#b45309', icon: 'FiFeather' },
  { key: 'arts',        title: 'Arts',          accent: '#6d28d9', icon: 'FiDroplet' },
  { key: 'commerce',    title: 'Commerce',      accent: '#047857', icon: 'FiBriefcase' },
]

export const COURSE_LEVEL_CONFIGS = [
  {
    key: 'after-10th',
    title: 'After 10th',
    heading: 'Professional Paths After 10th',
    level: '10',
    targetLevel: 'After 10th',
    badgeColor: 'blue',
    accent: '#0f4c75',
    summary: 'Discover foundational programs, polytechnic routes, and skill-based certifications available following 10th standard.',
    description: 'Explore structured academic and vocational pathways to build a strong professional foundation early.',
  },
  {
    key: 'after-12th',
    title: 'After 12th',
    heading: 'Degree Programs After 12th',
    level: '12',
    targetLevel: 'After 12th',
    badgeColor: 'green',
    accent: '#0f4c75',
    summary: 'Comprehensive listing of undergraduate degrees and professional courses across all major academic streams.',
    description: 'Compare high-impact undergraduate programs across diverse fields to shape your professional future.',
  },
  {
    key: 'diploma',
    title: 'Diploma',
    heading: 'Specialized Diploma Programs',
    level: 'Diploma',
    targetLevel: 'After 10th',
    badgeColor: 'orange',
    accent: '#0f4c75',
    summary: 'Technical and specialized diploma options designed for direct career entry and advanced skill acquisition.',
    description: 'Focused programs that provide practical expertise and industry-ready credentials for rapid career growth.',
  },
]

export const COURSE_LEVEL_MAP = COURSE_LEVEL_CONFIGS.reduce((acc, item) => {
  acc[item.key] = item
  return acc
}, {})

export function extractCoursesResponse(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  return []
}

export function getCourseDisplayName(course) {
  return course.courseName || course.title || 'Untitled Course'
}

export function matchesCourseLevel(course, level) {
  return String(course?.level || '').trim().toLowerCase() === String(level || '').trim().toLowerCase()
}
