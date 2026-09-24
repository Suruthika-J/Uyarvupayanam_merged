const mongoose = require("mongoose");
const Course = require("../models/Course");
const College = require("../models/College");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");
const {
  INSIGHT_CATEGORIES,
  categoryToInsightKey,
  findInsightCategory,
} = require("../config/collegesInsightCategories");
const cache = require("../services/collegesInsightCache");

/**
 * A mapping becomes public only when the admin has confirmed it — either
 * explicitly verified, or imported from a trusted source (Excel/TNEA cutoff
 * sync/bulk paste). Suggestions the mapping engine has only proposed never
 * create a CollegeCourseMapping row, so they can never reach this filter.
 */
const CONFIRMED_SOURCES = new Set(["Import", "Manual Verification", "Cutoff Sync"]);
const isConfirmedMapping = (m) =>
  !!m &&
  m.isActive !== false &&
  (m.isVerified === true || CONFIRMED_SOURCES.has(m.source));

/** Student-facing status label for a mapping (matches admin mapping engine). */
const mappingStatus = (m) =>
  m.isVerified === true ? "Verified"
  : m.source === "Manual Verification" ? "Manual"
  : "Imported";

// Draft/archived courses never surface on the student page.
const PUBLIC_COURSE_FILTER = { status: { $ne: "archived" }, isPublished: { $ne: false } };

const MAPPING_PROJECTION = "collegeId courseId source isVerified isActive";

/** Load public courses + active confirmed mappings and bucket by insight key. */
async function loadConfirmedMappingBuckets() {
  const [courses, mappings] = await Promise.all([
    Course.find(PUBLIC_COURSE_FILTER).select("_id category").lean(),
    CollegeCourseMapping.find({ isActive: true }).select(MAPPING_PROJECTION).lean(),
  ]);

  const courseKeyByCourseId = new Map();
  const coursesByKey = new Map(); // insight key -> Set of published course ids
  const collegesByKey = new Map(); // insight key -> Set of confirmed college ids
  const publishedCourseIds = new Set();

  for (const c of courses) {
    const id = c._id.toString();
    publishedCourseIds.add(id);
    const key = categoryToInsightKey(c.category);
    courseKeyByCourseId.set(id, key);
    if (!coursesByKey.has(key)) coursesByKey.set(key, new Set());
    coursesByKey.get(key).add(id);
  }

  for (const m of mappings) {
    if (!m.courseId || !m.collegeId || !isConfirmedMapping(m)) continue;
    const cid = m.courseId.toString();
    if (!publishedCourseIds.has(cid)) continue; // mapped to an unpublished/archived course
    const key = courseKeyByCourseId.get(cid);
    if (!key) continue;
    if (!collegesByKey.has(key)) collegesByKey.set(key, new Set());
    collegesByKey.get(key).add(m.collegeId.toString());
  }

  return { coursesByKey, collegesByKey };
}

/**
 * GET /api/colleges-insight
 * @access Public
 * One live-count row per insight category (courseCount = distinct published
 * Course rows in the category; collegeCount = distinct College rows with at
 * least one confirmed active mapping to a course in that category).
 */
exports.getInsightSummary = async (req, res) => {
  try {
    const cacheKey = "summary";
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { coursesByKey, collegesByKey } = await loadConfirmedMappingBuckets();

    const data = INSIGHT_CATEGORIES.map(({ key, label }) => ({
      category: key,
      label,
      courseCount: (coursesByKey.get(key) || new Set()).size,
      collegeCount: (collegesByKey.get(key) || new Set()).size,
    }));

    const payload = { success: true, data };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    console.error("❌ Error in colleges-insight summary:", error);
    res.status(500).json({ success: false, message: "Failed to load colleges insight" });
  }
};

/**
 * GET /api/colleges-insight/:category/courses
 * @access Public
 * Courses in a category, each with a live "colleges offering this" count.
 */
exports.getCategoryCourses = async (req, res) => {
  try {
    const { category } = req.params;
    const insight = findInsightCategory(category);
    if (!insight) {
      return res.status(404).json({ success: false, message: `Unknown insight category: ${category}` });
    }

    const cacheKey = `courses:${category}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const courses = await Course.find({ ...PUBLIC_COURSE_FILTER, category: { $in: insight.raw } })
      .select("_id courseName shortDescription duration")
      .sort({ courseName: 1 })
      .lean();

    const mappings = await CollegeCourseMapping.find({ isActive: true })
      .select("courseId collegeId source isVerified")
      .lean();

    const collegeIdsByCourse = new Map();
    for (const m of mappings) {
      if (!isConfirmedMapping(m) || !m.courseId || !m.collegeId) continue;
      const cid = m.courseId.toString();
      if (!collegeIdsByCourse.has(cid)) collegeIdsByCourse.set(cid, new Set());
      collegeIdsByCourse.get(cid).add(m.collegeId.toString());
    }

    const data = courses.map((c) => ({
      id: c._id,
      name: c.courseName,
      description: c.shortDescription || "",
      duration: c.duration || "",
      collegeCount: (collegeIdsByCourse.get(c._id.toString()) || new Set()).size,
    }));

    const payload = { success: true, category: insight.key, label: insight.label, data };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    console.error("❌ Error in colleges-insight courses:", error);
    res.status(500).json({ success: false, message: "Failed to load category courses" });
  }
};

/**
 * GET /api/colleges-insight/:category/courses/:courseId/colleges
 * @access Public
 * Colleges that offer a specific course, with the mapping status label
 * (Verified / Imported / Manual) that matches the admin mapping engine.
 */
exports.getCourseColleges = async (req, res) => {
  try {
    const { category, courseId } = req.params;
    const insight = findInsightCategory(category);
    if (!insight) {
      return res.status(404).json({ success: false, message: `Unknown insight category: ${category}` });
    }
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

    const cacheKey = `colleges:${category}:${courseId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const course = await Course.findOne({
      _id: courseId,
      ...PUBLIC_COURSE_FILTER,
      category: { $in: insight.raw },
    })
      .select("_id courseName")
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found in this category" });
    }

    const mappings = await CollegeCourseMapping.find({ courseId, isActive: true })
      .select("collegeId source isVerified collegeType")
      .lean();

    const confirmed = mappings.filter(isConfirmedMapping);
    const collegeIds = [...new Set(confirmed.map((m) => m.collegeId).filter(Boolean))];

    const colleges = collegeIds.length
      ? await College.find({ _id: { $in: collegeIds } }).select("collegeName location district state type collegeType").lean()
      : [];

    const collegeById = new Map(colleges.map((c) => [c._id.toString(), c]));

    const data = confirmed
      .map((m) => {
        const col = collegeById.get(m.collegeId && m.collegeId.toString());
        if (!col) return null;
        const location =
          col.location ||
          [col.district, col.state].filter(Boolean).join(", ") ||
          "";
        return {
          id: col._id,
          name: col.collegeName,
          location,
          type: m.collegeType || col.collegeType || col.type || "Not specified",
          status: mappingStatus(m),
        };
      })
      .filter(Boolean)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    const payload = {
      success: true,
      category: insight.key,
      course: { id: course._id, name: course.courseName },
      count: data.length,
      data,
    };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    console.error("❌ Error in colleges-insight colleges:", error);
    res.status(500).json({ success: false, message: "Failed to load course colleges" });
  }
};