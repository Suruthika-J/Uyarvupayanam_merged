// Frontend mirror of the backend academic-eligibility rules
// (see backend/utils/academicEligibility.js).
// Used to (a) show the "scoped to your level" hint banner on course/college
// browsers and (b) act as a client-side safety net.

export const SCHOOL_CLASSES = [5, 8, 10, 12]

const LEVEL_RULES = [
  { keys: /\b(degree|undergraduate)\b/i, min: 12 },
  { keys: /(after\s*12\s*(th)?|class\s*12\b|\b12\b|\b12th\b)/i, min: 12 },
  { keys: /(after\s*10\s*(th)?|class\s*10\b|\b10\b|\b10th\b)/i, min: 10 },
  { keys: /\b(diploma|polytechnic|iti|certificate)\b/i, min: 10 },
  { keys: /(class\s*8\b|\b8\b|\b8th\b)/i, min: 8 },
  { keys: /(class\s*5\b|\b5\b|\b5th\b)/i, min: 5 },
]
const DEFAULT_MIN_CLASS = 12

// Completed school class (5/8/10/12) for a school student, else null.
export function getStudentClass(student) {
  if (!student || student.userType !== 'school_student') return null
  const raw = String(student.classLevel ?? student.currentClass ?? '').trim()
  const match = raw.match(/(\d+)/)
  const cls = match ? parseInt(match[1], 10) : null
  if (!cls || cls < 5) return null
  if (cls <= 5) return 5
  if (cls <= 8) return 8
  if (cls <= 10) return 10
  if (cls <= 12) return 12
  return null
}

export function minClassForLevel(level) {
  const s = String(level || '').trim()
  if (!s) return DEFAULT_MIN_CLASS
  for (const rule of LEVEL_RULES) if (rule.keys.test(s)) return rule.min
  return DEFAULT_MIN_CLASS
}

// True when a course may be shown to a student with `cls` completed classes.
export function isCourseAllowedForClass(course, cls) {
  if (!cls) return true
  if (cls <= 8) return false
  return minClassForLevel(course.level || course.targetLevel) <= cls
}

// Client-side safety net: returns only courses the student may view.
export function scopeCoursesForStudent(courses, student) {
  const cls = getStudentClass(student)
  if (!cls) return courses
  if (cls <= 8) return []
  if (cls >= 12) return courses
  return courses.filter((course) => isCourseAllowedForClass(course, cls))
}

export function isJuniorSchoolClass(cls) {
  return cls === 5 || cls === 8
}

// Banner copy shown when the list is scoped to the student's level.
export function eligibilityBanner(student) {
  const cls = getStudentClass(student)
  if (!cls) return null
  if (cls >= 12) {
    return {
      title: 'Showing programmes you can pursue after Class 12',
      desc: 'Degree, diploma and certificate options that are open to you once you complete Class 12.',
    }
  }
  if (cls === 10) {
    return {
      title: 'Showing programmes you can pursue after Class 10',
      desc: 'Undergraduate degree programmes that require Class 12 stay hidden until you are eligible for them.',
    }
  }
  return {
    title: 'Higher-education programmes unlock after Class 10',
    desc: 'Your college-level options (diplomas, certificates, degrees) open up as you move up through school. Keep building strong fundamentals for now.',
  }
}