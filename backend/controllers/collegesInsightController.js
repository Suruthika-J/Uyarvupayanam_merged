const mongoose = require("mongoose");
const Course = require("../models/Course");
const College = require("../models/College");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");
const {
  INSIGHT_CATEGORIES,
  categoryToInsightKey,
  findInsightCategory,
  isValidInsightCategory,
} = require("../config/collegesInsightCategories");
const cache = require("../services/collegesInsightCache");

/**
 * A mapping becomes public only when the admin has confirmed it — either
 * explicitly verified, or imported from a trusted source (Excel/TNEA cutoff
 * sync/bulk paste). Suggestions the mapping engine has only proposed never
 * create a CollegeCourseMapping row, so they can never reach this filter.
 *
 * The system has historically written several aliases for the same trusted
 * sources ("Import", "CSV Import", "Excel Import", "Sync", "Manual
 * Verification", "Cutoff Sync"), so matching is case/whitespace-insensitive.
 */
const CONFIRMED_SOURCES = ["Import", "Manual Verification", "Cutoff Sync", "Sync", "CSV Import", "Excel Import"];
const normSource = (s = "") => String(s).trim().toLowerCase().replace(/\s+/g, " ");
const CONFIRMED_SOURCES_NORM = new Set(CONFIRMED_SOURCES.map(normSource));
const isConfirmedMapping = (m) =>
  !!m &&
  m.isActive !== false &&
  (m.isVerified === true || CONFIRMED_SOURCES_NORM.has(normSource(m.source)));

/** Student-facing status label for a mapping (matches admin mapping engine). */
const mappingStatus = (m) =>
  m.isVerified === true ? "Verified"
  : m.source === "Manual Verification" ? "Manual"
  : "Imported";

// Draft/archived courses never surface on the student page.
const PUBLIC_COURSE_FILTER = { status: { $ne: "archived" }, isPublished: { $ne: false } };

const MAPPING_PROJECTION = "collegeId courseId source isVerified isActive";

// When a college (or course) is reachable through several confirmed mappings,
// the *best* status wins: Verified > Manual > Imported.
const STATUS_RANK = { Verified: 3, Manual: 2, Imported: 1 };
const bestStatus = (rank, status) => {
  const nextRank = STATUS_RANK[status] || 1;
  return nextRank >= rank ? { rank: nextRank, status } : { rank, status };
};

/**
 * All published courses whose insight category key matches — the SAME fold
 * function the summary uses (categoryToInsightKey). This is the single
 * source of truth for stream membership, so the drill-down lists can never
 * drift from the summary counts (e.g. when an admin tags a course with a
 * keyword variant such as "B.Tech" instead of the exact raw value).
 */
async function loadPublishedCoursesForInsight(insight) {
  return (
    await Course.find(PUBLIC_COURSE_FILTER)
      .select("_id courseName shortDescription duration category level eligibility")
      .lean()
  ).filter((c) => categoryToInsightKey(c.category) === insight.key);
}

/** Normalize a string for search matching (lowercase, collapse whitespace). */
const normField = (s = "") => String(s).toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Colleges in one insight category, computed over confirmed mappings only:
 * distinct colleges with at least one confirmed active mapping to a published
 * course in the category. Also tracks per-college (a) the count of distinct
 * published courses mapped in the category (courseCount) and (b) the best
 * mapping status. Search + pagination are applied per request on this base.
 */
async function loadCategoryCollegesBase(category) {
  const insight = findInsightCategory(category);
  const courses = await loadPublishedCoursesForInsight(insight);
  const courseIds = new Set(courses.map((c) => c._id.toString()));

  const mappings = await CollegeCourseMapping.find({ isActive: true, courseId: { $in: [...courseIds] } })
    .select("collegeId courseId source isVerified collegeType")
    .lean();

  const byCollege = new Map(); // collegeId -> { courses:Set, rank, status, collegeType }
  for (const m of mappings) {
    if (!isConfirmedMapping(m)) continue;
    const cid = m.collegeId && m.collegeId.toString();
    if (!cid) continue;
    if (!byCollege.has(cid)) {
      byCollege.set(cid, { courses: new Set(), rank: 0, status: "Imported", collegeType: "" });
    }
    const rec = byCollege.get(cid);
    const mappedCourseId = m.courseId && m.courseId.toString();
    if (mappedCourseId) rec.courses.add(mappedCourseId);
    const { rank, status } = bestStatus(rec.rank, mappingStatus(m));
    rec.rank = rank;
    rec.status = status;
    if (!rec.collegeType) rec.collegeType = m.collegeType || "";
  }

  if (!byCollege.size) return { colleges: [] };

  const collegeDocs = await College.find({ _id: { $in: [...byCollege.keys()] } })
    .select("collegeName location district state type collegeType")
    .lean();

  const colleges = collegeDocs
    .map((col) => {
      const rec = byCollege.get(col._id.toString());
      return {
        id: col._id,
        name: col.collegeName,
        district: col.district || "",
        location: col.location || [col.district, col.state].filter(Boolean).join(", ") || "",
        type: rec.collegeType || col.collegeType || col.type || "Not specified",
        status: rec.status || "Imported",
        courseCount: rec.courses.size,
      };
    })
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  return { colleges };
}

/** Read ?search=&page=&limit= and clamp them to safe ranges. */
function readListParams(query) {
  const search = String(query.search || "").trim().toLowerCase().replace(/\s+/g, " ");
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { search, page, limit };
}

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

    const courses = (await loadPublishedCoursesForInsight(insight)).sort((a, b) =>
      String(a.courseName).localeCompare(String(b.courseName))
    );

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
      category: c.category || "",
      level: c.level || "",
      description: c.shortDescription || "",
      duration: c.duration || "",
      eligibility: c.eligibility || "",
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
    let payload = cache.get(cacheKey);

    if (!payload) {
      const course = (await loadPublishedCoursesForInsight(insight)).find(
        (c) => c._id.toString() === String(courseId)
      );
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
            district: col.district || "",
            location,
            type: m.collegeType || col.collegeType || col.type || "Not specified",
            status: mappingStatus(m),
          };
        })
        .filter(Boolean)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));

      payload = {
        success: true,
        category: insight.key,
        course: {
          id: course._id,
          name: course.courseName,
          category: course.category || "",
          level: course.level || "",
          duration: course.duration || "",
          description: course.shortDescription || "",
          eligibility: course.eligibility || "",
        },
        count: data.length,
        data,
      };
      cache.set(cacheKey, payload);
    }

    // Optional server-side search/pagination — only when the caller asks for
    // it, so legacy consumers keep receiving the full list.
    const hasListParams =
      Object.prototype.hasOwnProperty.call(req.query, "search") ||
      Object.prototype.hasOwnProperty.call(req.query, "district") ||
      Object.prototype.hasOwnProperty.call(req.query, "page") ||
      Object.prototype.hasOwnProperty.call(req.query, "limit");
    if (!hasListParams) return res.json(payload);

    const { search, page, limit } = readListParams(req.query);
    const district = String(req.query.district || "").trim().toLowerCase();
    let list = payload.data;
    if (search) {
      list = list.filter(
        (c) =>
          normField(c.name).includes(search) ||
          normField(c.location).includes(search)
      );
    }
    if (district) {
      list = list.filter((c) => normField(c.district) === district);
    }
    const start = (page - 1) * limit;
    res.json({
      ...payload,
      count: list.length,
      data: list.slice(start, start + limit),
      totalPages: Math.ceil(list.length / limit),
      page,
      limit,
    });
  } catch (error) {
    console.error("❌ Error in colleges-insight colleges:", error);
    res.status(500).json({ success: false, message: "Failed to load course colleges" });
  }
};

/**
 * GET /api/colleges-insight/:category/colleges
 * @access Public
 * All colleges in a category (distinct colleges with at least one confirmed
 * active mapping to a published course in the category), with per-college
 * courseCount + best status. Supports ?search=&page=&limit=.
 */
exports.getCategoryColleges = async (req, res) => {
  try {
    const { category } = req.params;
    const insight = findInsightCategory(category);
    if (!insight) {
      return res.status(404).json({ success: false, message: `Unknown insight category: ${category}` });
    }

    const cacheKey = `streamColleges:${category}`;
    let base = cache.get(cacheKey);
    if (!base) {
      base = await loadCategoryCollegesBase(category);
      cache.set(cacheKey, base);
    }

    const { search, page, limit } = readListParams(req.query);
    const district = String(req.query.district || "").trim().toLowerCase();
    let list = base.colleges;
    if (search) {
      list = list.filter(
        (c) =>
          normField(c.name).includes(search) ||
          normField(c.location).includes(search)
      );
    }
    if (district) {
      list = list.filter((c) => normField(c.district) === district);
    }
    const start = (page - 1) * limit;

    res.json({
      success: true,
      category: insight.key,
      label: insight.label,
      count: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit),
      data: list.slice(start, start + limit),
    });
  } catch (error) {
    console.error("❌ Error in colleges-insight category colleges:", error);
    res.status(500).json({ success: false, message: "Failed to load category colleges" });
  }
};

/**
 * GET /api/colleges-insight/colleges/:collegeId/courses
 * @access Public
 * Every published course a confirmed-mapped college offers (across ALL
 * streams — a college may be multi-stream), grouped by insight category.
 */
exports.getCollegeCourses = async (req, res) => {
  try {
    const { collegeId } = req.params;
    if (!mongoose.isValidObjectId(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid college id" });
    }

    const cacheKey = `collegeCourses:${collegeId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const college = await College.findById(collegeId)
      .select(
        "collegeName collegeCode stream category location district state type collegeType streamsOffered website universityAffiliation hostel feesPerYear placementPercentage rank accreditation"
      )
      .lean();
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    const mappings = await CollegeCourseMapping.find({ collegeId, isActive: true })
      .select("courseId source isVerified")
      .lean();

    const byCourse = new Map(); // courseId -> best status
    for (const m of mappings) {
      if (!isConfirmedMapping(m) || !m.courseId) continue;
      const cid = m.courseId.toString();
      const prev = byCourse.get(cid);
      const { rank, status } = bestStatus(prev ? prev.rank : 0, mappingStatus(m));
      byCourse.set(cid, { rank, status });
    }

    const ids = [...byCourse.keys()];
    const courses = ids.length
      ? await Course.find({ _id: { $in: ids }, ...PUBLIC_COURSE_FILTER })
          .select("_id courseName category duration")
          .lean()
      : [];

    const groupsMap = new Map(); // insight key -> courses[]
    for (const c of courses) {
      const key = categoryToInsightKey(c.category);
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key).push({
        id: c._id,
        name: c.courseName,
        duration: c.duration || "",
        category: c.category || "",
        status: (byCourse.get(c._id.toString()) || {}).status || "Imported",
      });
    }

    const groups = INSIGHT_CATEGORIES.map(({ key, label }) => {
      if (!groupsMap.has(key)) return null;
      const groupCourses = groupsMap.get(key).sort((a, b) => a.name.localeCompare(b.name));
      return {
        key,
        label: label.replace(/\s+Insight$/i, ""),
        courses: groupCourses,
      };
    }).filter(Boolean);

    // Optional ?category=<insightKey> scoping — returns only that stream's
    // group (e.g. college-courses for a single stream) without breaking
    // consumers that expect the full grouped payload.
    const onlyKey = String(req.query.category || "").trim();
    const visibleGroups = isValidInsightCategory(onlyKey)
      ? groups.filter((g) => g.key === onlyKey)
      : groups;

    const payload = {
      success: true,
      college: {
        id: college._id,
        name: college.collegeName,
        code: college.collegeCode || "",
        stream: college.stream || "",
        category: college.category || "",
        district: college.district || "",
        location: college.location || [college.district, college.state].filter(Boolean).join(", ") || "",
        type: college.collegeType || college.type || "Not specified",
        website: college.website || "",
        universityAffiliation: college.universityAffiliation || "",
        hostel: college.hostel || "",
        feesPerYear: college.feesPerYear || 0,
        placementPercentage: typeof college.placementPercentage === "number" ? college.placementPercentage : 0,
        rank: college.rank || "",
        accreditation: college.accreditation || "",
        streamsOffered: Array.isArray(college.streamsOffered) ? college.streamsOffered : [],
      },
      groups: visibleGroups,
      totalCourses: visibleGroups.reduce((n, g) => n + g.courses.length, 0),
    };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    console.error("❌ Error in colleges-insight college courses:", error);
    res.status(500).json({ success: false, message: "Failed to load college courses" });
  }
};