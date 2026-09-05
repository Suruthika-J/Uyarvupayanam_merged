export const CAREER_CLASS_CONFIGS = [
  {
    key: 'class-5',
    level: '5th',
    title: 'Class 5',
    heading: 'Career Guidance for Class 5',
    summary: 'Build awareness, curiosity, and early interests with simple career exploration.',
    description: 'Introduce students to broad career ideas, creativity, foundational skills, and confidence-building activities.',
    badgeColor: 'purple',
    accent: 'var(--s-purple)',
  },
  {
    key: 'class-8',
    level: '8th',
    title: 'Class 8',
    heading: 'Career Guidance for Class 8',
    summary: 'Help students connect school subjects with future career possibilities.',
    description: 'Explore strengths, interests, and emerging pathways before key academic decisions start becoming more important.',
    badgeColor: 'gold',
    accent: 'var(--s-gold)',
  },
  {
    key: 'class-10',
    level: '10th',
    title: 'Class 10',
    heading: 'Career Guidance for Class 10',
    summary: 'Support stream selection, course planning, and next-step academic decisions.',
    description: 'Discover career paths that guide students through stream selection, diploma options, and focused study planning.',
    badgeColor: 'green',
    accent: 'var(--s-primary)',
  },
  {
    key: 'class-12',
    level: '12th',
    title: 'Class 12',
    heading: 'Career Guidance for Class 12',
    summary: 'Prepare students for entrance exams, degree choices, and future opportunities.',
    description: 'Find structured roadmaps for higher studies, professional courses, and career launch planning after 12th.',
    badgeColor: 'blue',
    accent: 'var(--s-blue)',
  },
]

export const CAREER_CLASS_MAP = CAREER_CLASS_CONFIGS.reduce((acc, item) => {
  acc[item.key] = item
  return acc
}, {})

export const INTEREST_OPTIONS = ['All', 'Science', 'Arts', 'Commerce', 'General', 'Technology', 'Vocational']

export function extractCareerResponse(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  return []
}

export function getCareerShortDescription(career) {
  return String(career?.description || '').trim()
}
