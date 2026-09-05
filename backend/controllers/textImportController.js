const College = require("../models/College");
const Course = require("../models/Course");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");

// ── Abbreviation Map ──────────────────────────────────────────
const ABBREVIATION_MAP = {
  cse: "Computer Science and Engineering",
  ece: "Electronics and Communication Engineering",
  eee: "Electrical and Electronics Engineering",
  eie: "Electronics and Instrumentation Engineering",
  it: "Information Technology",
  me: "Mechanical Engineering",
  ce: "Civil Engineering",
  ae: "Aeronautical Engineering",
  bme: "Bio Medical Engineering",
  bt: "Biotechnology",
  che: "Chemical Engineering",
  aids: "Artificial Intelligence and Data Science",
  aiml: "Artificial Intelligence and Machine Learning",
  csbs: "Computer Science and Business Systems",
  iot: "Internet of Things",
  csd: "Computer Science and Design",
  cy: "Cyber Security",
  ag: "Agricultural Engineering",
  au: "Automobile Engineering",
  ft: "Food Technology",
  tt: "Textile Technology",
  pt: "Petrochemical Technology",
  mr: "Marine Engineering",
  mt: "Mechatronics Engineering",
  pe: "Production Engineering",
  ra: "Robotics and Automation",
  mfg: "Manufacturing Engineering",
};

// ── Helper: Normalize a course name ───────────────────────────
function normalizeCourse(raw) {
  let name = raw.trim();

  // Expand abbreviations found after B.E / B.Tech prefix
  const prefixMatch = name.match(/^(B\.?E\.?|B\.?Tech\.?)\s+(.+)$/i);
  if (prefixMatch) {
    const prefix = prefixMatch[1].replace(/\./g, "").toUpperCase() === "BE" ? "B.E" : "B.Tech";
    let core = prefixMatch[2].trim();

    // Check if core is a known abbreviation
    const coreLower = core.toLowerCase().replace(/[.\s]/g, "");
    if (ABBREVIATION_MAP[coreLower]) {
      core = ABBREVIATION_MAP[coreLower];
    }

    // Title-case the core
    core = core
      .split(" ")
      .map((w) => {
        const lower = w.toLowerCase();
        if (["and", "in", "of", "the", "for"].includes(lower)) return lower;
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");

    name = `${prefix} ${core}`;
  }

  // Final cleanup
  name = name.replace(/\s{2,}/g, " ").trim();
  return name;
}

// ── Helper: Check if course name is B.E / B.Tech ─────────────
function isBEorBTech(courseName) {
  return /\b(B\.?E\.?|B\.?Tech\.?)\b/i.test(courseName);
}

// ── Helper: Parse raw text into structured data ──────────────
function parseRawText(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const results = [];
  let currentCollege = null;
  let currentCourses = [];

  for (const line of lines) {
    // A course line starts with *, -, •, or a number followed by dot/paren
    const courseMatch = line.match(
      /^[\*\-\•\◦\▪]\s*(.+)$|^\d+[\.\)]\s*(.+)$/
    );

    if (courseMatch) {
      const courseName = (courseMatch[1] || courseMatch[2]).trim();
      if (courseName) currentCourses.push(courseName);
    } else {
      // Not a bullet — treat as a new college name
      // But first, save the previous college+courses
      if (currentCollege && currentCourses.length > 0) {
        results.push({
          college: currentCollege,
          courses: [...currentCourses],
        });
      }
      currentCollege = line;
      currentCourses = [];
    }
  }

  // Push the last group
  if (currentCollege && currentCourses.length > 0) {
    results.push({
      college: currentCollege,
      courses: [...currentCourses],
    });
  }

  return results;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @desc    Parse raw text → filter B.E/B.Tech → preview
// @route   POST /api/college-courses/text-parse
// @access  Admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.parseTextPreview = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: "No text provided" });
    }

    const parsed = parseRawText(rawText);

    // Filter + Normalize
    const output = parsed.map((entry) => {
      const filtered = entry.courses
        .filter((c) => isBEorBTech(c))
        .map((c) => normalizeCourse(c));

      // Remove duplicates
      const unique = [...new Set(filtered)];

      return {
        college: entry.college.trim(),
        courses: unique,
        removedCount: entry.courses.length - unique.length,
      };
    });

    // Remove entries with zero valid courses
    const valid = output.filter((e) => e.courses.length > 0);
    const totalCourses = valid.reduce((s, e) => s + e.courses.length, 0);
    const totalRemoved = output.reduce((s, e) => s + e.removedCount, 0);

    res.json({
      success: true,
      preview: valid,
      stats: {
        collegesFound: valid.length,
        totalValidCourses: totalCourses,
        totalRemoved,
      },
    });
  } catch (error) {
    console.error("Text parse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @desc    Confirm text import → create/match colleges, courses, mappings
// @route   POST /api/college-courses/text-import
// @access  Admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.confirmTextImport = async (req, res) => {
  try {
    const { data } = req.body; // Array of { college, courses[] }
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided" });
    }

    const stats = {
      collegesProcessed: 0,
      collegesCreated: 0,
      coursesCreated: 0,
      mappingsCreated: 0,
      duplicatesSkipped: 0,
    };

    // Warm caches
    const allColleges = await College.find({}).lean();
    const allCourses = await Course.find({}).lean();

    const collegeMap = new Map();
    allColleges.forEach((c) => {
      collegeMap.set(c.collegeName.toLowerCase().trim(), c._id);
      if (c.collegeCode) collegeMap.set(c.collegeCode.toLowerCase().trim(), c._id);
    });

    const courseMap = new Map();
    allCourses.forEach((c) => {
      courseMap.set(c.courseName.toLowerCase().trim(), c._id);
    });

    const batchId = `TEXT-${Date.now()}`;

    for (const entry of data) {
      const collegeNameClean = entry.college.trim();
      const collegeKey = collegeNameClean.toLowerCase();

      // ── Resolve / Create College ─────────────────────
      let collegeId = collegeMap.get(collegeKey);
      if (!collegeId) {
        const newCollege = await College.create({
          collegeName: collegeNameClean,
          stream: "Engineering",
          state: "Tamil Nadu",
        });
        collegeId = newCollege._id;
        collegeMap.set(collegeKey, collegeId);
        stats.collegesCreated++;
      }
      stats.collegesProcessed++;

      // ── Resolve / Create Courses + Mappings ──────────
      const courseIds = [];

      for (const courseName of entry.courses) {
        const courseKey = courseName.toLowerCase().trim();
        let courseId = courseMap.get(courseKey);

        if (!courseId) {
          try {
            const newCourse = await Course.create({
              courseName,
              level: "Degree",
              category: "Engineering",
              duration: "4 Years",
              eligibility: "12th Pass with PCM",
              shortDescription: `${courseName} – undergraduate engineering programme.`,
            });
            courseId = newCourse._id;
            courseMap.set(courseKey, courseId);
            stats.coursesCreated++;
          } catch (err) {
            if (err.code === 11000) {
              const existing = await Course.findOne({ courseName });
              if (existing) courseId = existing._id;
            } else {
              console.error("Course create error:", err.message);
              continue;
            }
          }
        }

        if (courseId) courseIds.push(courseId);

        // ── Create Mapping ─────────────────────────────
        try {
          await CollegeCourseMapping.findOneAndUpdate(
            { collegeId, courseId },
            {
              source: "Text Import",
              importBatchId: batchId,
              sourceFileName: "Admin Text Paste",
              isActive: true,
            },
            { upsert: true, new: true }
          );
          stats.mappingsCreated++;
        } catch (err) {
          if (err.code === 11000) stats.duplicatesSkipped++;
        }
      }

      // Sync to College.coursesOffered (addToSet style)
      if (courseIds.length > 0) {
        await College.findByIdAndUpdate(collegeId, {
          $addToSet: { coursesOffered: { $each: courseIds } },
        });
      }
    }

    res.json({
      success: true,
      message: `Import complete! ${stats.collegesProcessed} colleges, ${stats.mappingsCreated} mappings created.`,
      stats,
    });
  } catch (error) {
    console.error("Text import error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @desc    Search colleges by course or courses by college (B.E/B.Tech only)
// @route   GET /api/college-courses/text-search
// @access  Public
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.textSearch = async (req, res) => {
  try {
    const { q, type } = req.query; // type = "college" | "course"
    if (!q) return res.json({ success: true, data: [] });

    const regex = new RegExp(q, "i");

    if (type === "course") {
      // Find colleges offering this course
      const courses = await Course.find({
        courseName: regex,
        courseName: { $regex: /B\.?E\.?|B\.?Tech\.?/i },
      }).lean();

      const courseIds = courses.map((c) => c._id);
      const mappings = await CollegeCourseMapping.find({
        courseId: { $in: courseIds },
        isActive: true,
      })
        .populate("collegeId", "collegeName collegeCode district stream")
        .lean();

      const colleges = mappings
        .filter((m) => m.collegeId)
        .map((m) => m.collegeId);

      return res.json({ success: true, data: colleges, matchedCourses: courses });
    }

    // Default: type === "college" — find B.E/B.Tech courses for a college
    const colleges = await College.find({ collegeName: regex }).lean();
    if (colleges.length === 0) return res.json({ success: true, data: [] });

    const collegeIds = colleges.map((c) => c._id);
    const mappings = await CollegeCourseMapping.find({
      collegeId: { $in: collegeIds },
      isActive: true,
    })
      .populate("courseId", "courseName branchCode category duration")
      .lean();

    // Filter B.E/B.Tech only
    const beTechCourses = mappings
      .filter((m) => m.courseId && isBEorBTech(m.courseId.courseName))
      .map((m) => m.courseId);

    const result = colleges.map((col) => ({
      college: col.collegeName,
      collegeCode: col.collegeCode,
      courses: beTechCourses
        .filter((c) => {
          const mapping = mappings.find(
            (m) =>
              m.collegeId?._id?.toString() === col._id.toString() ||
              m.collegeId?.toString() === col._id.toString()
          );
          return !!mapping;
        })
        .map((c) => c.courseName),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Text search error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
