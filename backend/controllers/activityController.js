// backend/controllers/activityController.js
//
// Recent Activity feature — per-student activity feed.
//
//   GET  /api/students/recent-activities   → latest N activities (default 5)
//   GET  /api/students/activities          → paginated, filterable history
//   POST /api/students/activities          → client fire-and-forget tracking
//
// All endpoints are protected by verifyStudent; the student identity always
// comes from req.student._id (never from the body/query).

const StudentActivity = require("../models/StudentActivity");

const DEFAULT_RECENT_LIMIT = 5;
const MAX_LIMIT = 50;

// Events keyed by an entity id are deduped per (studentId, type, entityId):
// re-performing the action bumps the existing event to the top instead of
// adding a row. This covers views plus repeatable milestones (revisiting a
// result page, replaying a quiz/module) so the feed never spams duplicates.
const DEDUPE_TYPES = new Set([
  "course_viewed",
  "college_viewed",
  "scholarship_viewed",
  "exam_viewed",
  "career_explored",
  "recommendation_viewed",
  "career_assessment_completed",
  "quiz_completed",
  "module_completed",
]);

// ── Reusable record helper (used by other controllers + routes) ──────────
async function recordStudentActivity({ studentId, type, title, description = "", metadata = {} }) {
  if (!studentId || !type || !title) return null;
  const entityId = metadata?.entityId;

  if (DEDUPE_TYPES.has(type) && entityId) {
    const existing = await StudentActivity.findOne({ studentId, type, "metadata.entityId": entityId })
      .sort({ createdAt: -1 })
      .lean();
    if (existing) {
      await StudentActivity.updateOne(
        { _id: existing._id },
        { $set: { title, description, metadata, createdAt: new Date() } }
      );
      return existing._id;
    }
  }

  const doc = await StudentActivity.create({ studentId, type, title, description, metadata });
  return doc._id;
}

// ── GET /api/students/recent-activities ──────────────────────────────────
async function getRecentActivities(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_RECENT_LIMIT, MAX_LIMIT);
    const activities = await StudentActivity.find({ studentId: req.student._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load recent activities", error: error.message });
  }
}

// ── GET /api/students/activities ─────────────────────────────────────────
async function getActivities(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, MAX_LIMIT);

    const filter = { studentId: req.student._id };

    // ?type=course_viewed  OR  ?type=a,b  OR  ?type[]=a&type[]=b
    if (req.query.type) {
      const raw = Array.isArray(req.query.type) ? req.query.type.join(",") : String(req.query.type);
      const types = raw.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length === 1) filter.type = types[0];
      else if (types.length > 1) filter.type = { $in: types };
    }

    const total = await StudentActivity.countDocuments(filter);
    const activities = await StudentActivity.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load activities", error: error.message });
  }
}

// ── POST /api/students/activities ────────────────────────────────────────
// Client fire-and-forget tracking. Always resolves so tracking can never
// break the page that fired it.
async function recordActivity(req, res) {
  try {
    const { type, title, description, metadata } = req.body || {};

    if (!type || !title) {
      return res.status(400).json({ success: false, message: "type and title are required" });
    }

    await recordStudentActivity({
      studentId: req.student._id,
      type,
      title,
      description,
      metadata,
    });

    res.status(201).json({ success: true });
  } catch {
    res.status(201).json({ success: true });
  }
}

// ── Save-event helper (used by savedItemController) ───────────────────────
// Resolves the display name for a newly saved item and records a *_saved
// event. Fire-and-forget — never throws into the save request path.
async function recordSavedActivity({ studentId, savedItem }) {
  try {
    if (!studentId || !savedItem) return;
    const contentType = savedItem.contentType;
    const content = savedItem.contentId || {};

    const TYPE_MAP = {
      College: "college_saved",
      Scholarship: "scholarship_saved",
      CollegeScholarship: "scholarship_saved",
      Course: "course_saved",
      Exam: "exam_saved",
      CareerPath: "career_path_saved",
      ClassContent: "module_saved",
    };
    const type = TYPE_MAP[contentType];
    if (!type) return;

    const name =
      content.collegeName ||
      content.scholarshipName ||
      content.courseName ||
      content.title ||
      content.name ||
      savedItem.title ||
      "";

    const LABELS = {
      college_saved: "Saved a College",
      scholarship_saved: "Saved a Scholarship",
      course_saved: "Saved a Course",
      exam_saved: "Saved an Exam",
      career_path_saved: "Saved a Career Path",
      module_saved: "Saved a Module",
    };

    await recordStudentActivity({
      studentId,
      type,
      title: LABELS[type] || "Saved an Item",
      description: name,
      metadata: {
        entityId: String(savedItem.contentId?._id || savedItem.contentId || ""),
        contentType,
        link: savedItem.link || "",
      },
    });
  } catch {
    // tracking must never break the save flow
  }
}

module.exports = { recordStudentActivity, recordSavedActivity, getRecentActivities, getActivities, recordActivity };