export const COURSE_CATEGORIES = [
  { key: 'engineering',     title: 'Engineering',           accent: '#6366f1', icon: 'FiSettings' },
  { key: 'arts-science',    title: 'Arts & Science',        accent: '#14b8a6', icon: 'FiDroplet' },
  { key: 'medical',         title: 'Medical',               accent: '#ef4444', icon: 'FiPlusCircle' },
  { key: 'polytechnic',     title: 'Polytechnic',           accent: '#3b82f6', icon: 'FiTool' },
  { key: 'iti',             title: 'ITI',                   accent: '#f97316', icon: 'FiWrench' },
  { key: 'science',         title: 'Science',               accent: '#06b6d4', icon: 'FiAperture' },
  { key: 'commerce',        title: 'Commerce',              accent: '#10b981', icon: 'FiBriefcase' },
  { key: 'arts',            title: 'Arts',                  accent: '#8b5cf6', icon: 'FiFeather' },
  { key: 'law',             title: 'Law',                   accent: '#f59e0b', icon: 'FiBook' },
  { key: 'agriculture',     title: 'Agriculture',           accent: '#84cc16', icon: 'FiSun' },
  { key: 'design',          title: 'Design',                accent: '#d946ef', icon: 'FiPencil' },
  { key: 'media',           title: 'Media & Journalism',    accent: '#eab308', icon: 'FiCamera' },
  { key: 'it',              title: 'IT & Computer',         accent: '#0ea5e9', icon: 'FiCpu' },
  { key: 'architecture',    title: 'Architecture',          accent: '#a855f7', icon: 'FiGitBranch' },
  { key: 'hotel',           title: 'Hotel Management',      accent: '#f43f5e', icon: 'FiHome' },
  { key: 'management',      title: 'Management',            accent: '#ec4899', icon: 'FiUsers' },
]

export const CATEGORY_COLORS = COURSE_CATEGORIES.reduce((acc, c) => {
  acc[c.title] = c.accent
  return acc
}, {})
export const CATEGORY_DEFAULT_COLOR = '#64748b'

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_DEFAULT_COLOR
}

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

const LEVEL_LABELS = {
  'after10th': 'After 10th',
  'after12th': 'After 12th',
  'diploma': 'Diploma',
  'undergraduate': 'Undergraduate',
}

export function getCourseLevelLabel(course) {
  const raw = String(course?.level || '').trim().toLowerCase()
  return LEVEL_LABELS[raw] || raw || 'All Levels'
}
