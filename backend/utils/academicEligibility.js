// Academic eligibility helpers.
//
// A school student (userType === "school_student") should only see courses /
// colleges whose programmes they are already academically qualified to pursue.
// We use the student's current class (5 / 8 / 10 / 12) to infer the minimum
// school years completed and hide everything that requires a higher level.
//
// Course `level` values in the DB are messy ("after10th", "After 12th",
// "diploma", "Undergraduate", "Degree", ...) so we classify by substring rules
// instead of an exact allow-list.

const DEFAULT_MIN_CLASS = 12;

// Rules evaluated top-down; first match wins. `min` is the school class a
// student must have *completed* (8 -> completed Class 8) to pursue the course.
const LEVEL_RULES = [
  { keys: /\b(degree|undergraduate)\b/i, min: 12 },
  { keys: /(after\s*12\s*(th)?|class\s*12\b|\b12\b|\b12th\b)/i, min: 12 },
  { keys: /(after\s*10\s*(th)?|class\s*10\b|\b10\b|\b10th\b|10\s*\+?\s*10)/i, min: 10 },
  { keys: /\b(diploma|polytechnic|iti|certificate)\b/i, min: 10 },
  { keys: /\b(sslc|secondary|matric)(\s*(pass|standard|school))?\b/i, min: 10 },
  { keys: /(class\s*8\b|\b8\b|\b8th\b)/i, min: 8 },
  { keys: /(class\s*5\b|\b5\b|\b5th\b)/i, min: 5 },
];

// Minimum completed school class required by a raw course `level` value.
function minClassForLevel(level) {
  const s = String(level || "").trim();
  if (!s) return DEFAULT_MIN_CLASS;
  for (const rule of LEVEL_RULES) {
    if (rule.keys.test(s)) return rule.min;
  }
  return DEFAULT_MIN_CLASS;
}

// Regex source strings that identify course levels a student with `cls`
// completed classes is allowed to view.
const CLASS_ALLOWED_PATTERNS = {
  5: [],
  8: [],
  10: [
    /(after\s*10\s*(th)?|class\s*10\b|\b10\b|\b10th\b)/.source,
    /\b(diploma|polytechnic|iti|certificate)\b/.source,
    /\b(sslc|secondary|matric)(\s*(pass|standard|school))?\b/.source,
    /(class\s*8\b|\b8\b|\b8th\b)/.source,
  ],
  12: null, // everything is allowed
};

// Widening signal: a course whose `eligibility` text explicitly names a
// Class-10 qualification (10th / Standard 10 / SSLC / Secondary / Matric) may
// be shown to Class-10 students even when its `level` label is vague.
// Deliberately avoids "10+2" (which means Class 12 completed) and "12th".
const CLASS_10_ELIGIBILITY_PATTERN = /(10\s*th\b|class\s*10\b|sslc|secondary|matric)\s*(pass|standard|std\b)?/i;

// Parse the authenticated student's school class (5/8/10/12) from the request.
// Returns null when the request has no school-student identity.
function getStudentClass(req) {
  const student = req && req.student;
  if (!student || student.userType !== "school_student") return null;

  const raw = String(
    student.classLevel !== undefined && student.classLevel !== null
      ? student.classLevel
      : student.currentClass || ""
  ).trim();
  const match = raw.match(/(\d+)/);
  if (!match) return null;

  const cls = parseInt(match[1], 10);
  if (cls < 5) return null; // incomplete/unknown profile -> no filtering
  if (cls <= 5) return 5;
  if (cls <= 8) return 8;
  if (cls <= 10) return 10;
  if (cls <= 12) return 12;
  return null; // 13+ -> graduate/unsupported, no filtering
}

// Build a Mongo filter restricting a list query to courses the student may view.
// Returns null when no filtering is required (public, non-school, class 12, ...).
function buildCourseEligibilityFilter(cls) {
  if (!cls) return null;
  const patterns = CLASS_ALLOWED_PATTERNS[cls];
  if (patterns == null) return null; // class 12 -> everything
  if (patterns.length === 0) return { _id: { $in: [] } }; // juniors -> nothing

  const or = [{ level: { $regex: patterns.join("|"), $options: "i" } }];
  if (cls >= 10) {
    // Safety net for any course labelled vaguely in `level` but whose
    // eligibility text explicitly names a Class-10 qualification.
    or.push({ eligibility: { $regex: CLASS_10_ELIGIBILITY_PATTERN } });
  }
  return { $or: or };
}

// Build a Mongo filter restricting colleges to those offering at least one
// course the student is eligible for. Uses the direct `coursesOffered` array
// plus the verified `CollegeCourseMapping` records (which are more complete).
// Returns null when no filtering is required.
async function buildCollegeEligibilityFilter(cls, { Course, CollegeCourseMapping }) {
  if (!cls) return null;
  if (cls <= 8) return { _id: { $in: [] } }; // juniors -> nothing

  const courseFilter = buildCourseEligibilityFilter(cls);
  const eligibleCourses = await Course.find(
    { ...courseFilter, status: "active" },
    { _id: 1 }
  ).lean();
  const eligibleCourseIds = eligibleCourses.map((c) => c._id);

  const mappedCollegeIds = await CollegeCourseMapping.distinct("collegeId", {
    courseId: { $in: eligibleCourseIds },
    isActive: true,
  });

  return {
    $or: [
      { coursesOffered: { $in: eligibleCourseIds } },
      { _id: { $in: mappedCollegeIds } },
    ],
  };
}

module.exports = {
  getStudentClass,
  minClassForLevel,
  buildCourseEligibilityFilter,
  buildCollegeEligibilityFilter,
  CLASS_ALLOWED_PATTERNS,
};