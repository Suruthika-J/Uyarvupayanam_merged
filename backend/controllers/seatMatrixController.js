const mongoose = require("mongoose");
const College = require("../models/College");
const Course = require("../models/Course");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");
const { parseSeatMatrixPdf } = require("../utils/seatMatrixParser");

const STREAM = "Engineering";
const SOURCE = "TNEA Seat Matrix 2026";
const DEFAULT_LEVEL = "after12th";
const DEFAULT_DURATION = "4 Years";

// The fixed stream catalogue shown on the admin stream-selector page. Empty
// streams (no imported data yet) are still listed so admins know they exist.
const STREAMS = [
  "Engineering",
  "Medical",
  "Arts & Science",
  "Law",
  "Commerce",
  "Management",
  "IT & Computer",
  "Agriculture",
  "Architecture",
  "Design",
  "Hotel Management",
  "ITI",
  "Polytechnic",
  "Media & Journalism",
  "Others",
];

/** "Arts & Science" -> "arts-science", "Media & Journalism" -> "media-journalism". */
function streamSlug(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Accepts a canonical name ("Arts & Science") or its URL slug ("arts-science")
 * and returns the canonical stream name. Falls back to Engineering when the
 * param is missing; unknown values pass through unchanged (future-proof).
 */
function normalizeStream(raw) {
  const value = String(raw || "").trim();
  if (!value) return STREAM;
  const slug = streamSlug(value);
  return STREAMS.find((s) => streamSlug(s) === slug) || value;
}
const DEFAULT_ELIGIBILITY =
  "Passed 10+2 or equivalent examination with Physics, Chemistry and Mathematics from a recognized board.";
const DEFAULT_DESC =
  "Engineering programme listed in the official TNEA 2026 General Academic Seat Matrix with reservation-wise seat details.";

// Words that stay lowercase inside a proper-cased branch name, and acronyms
// that stay UPPERCASE (e.g. "VLSI", "AI", "AR/VR", "IoT", "SS").
const LOWERCASE_WORDS = new Set(["and", "of", "the", "for", "with", "in", "by", "to"]);
const KEEP_TOKEN = new Set(["B.PLAN", "M.TECH.", "B.TECH", "SS"]);
const KEEP_UPPER = new Set(["AI", "ML", "AR", "VR", "SS", "IT", "VLSI", "CSE", "ECE", "EEE", "IOT"]);

function prettyBranchName(raw) {
  if (!raw) return "";
  const words = String(raw).trim().split(/\s+/);
  const out = words.map((w) => {
    const big = w.toUpperCase();
    if (KEEP_TOKEN.has(big) || /^\([A-Z0-9]{1,3}\)$/.test(w)) return w; // "(SS)"
    const inner = w.replace(/^\(/, "").replace(/\)$/, "");
    const closing = w.endsWith(")") ? ")" : "";
    const opening = w.startsWith("(") ? "(" : "";
    const lw = inner.toLowerCase();
    if (LOWERCASE_WORDS.has(lw)) return opening + lw + closing;
    if (inner.toUpperCase() === inner && inner.length > 0) {
      // Title-case each "(" segment so glued parens stay readable
      // (e.g. "ENGINEERING(ARTIFICIAL" -> "Engineering(Artificial",
      // "ENGINEERNG(VLSI" -> "Engineerng(VLSI").
      const parts = inner.split("(").map((seg) =>
        KEEP_UPPER.has(seg) ? seg : seg[0] + seg.slice(1).toLowerCase()
      );
      return opening + parts.join("(") + closing;
    }
    return w;
  });
  return out.join(" ");
}

function makeSlug(courseName) {
  const base = String(courseName || "")
    .toLowerCase()
    .split(" ")
    .join("-")
    .replace(/[^\w-]+/g, "");
  return `${base}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * POST /api/admin/seat-matrix/import
 * Upload a TNEA seat-matrix PDF (field name "pdf"). Idempotent: colleges are
 * matched by collegeCode, courses by branchCode (+ Engineering category), and
 * mappings by (collegeId, courseId). Re-running the same file updates seat
 * counts in place and never duplicates rows.
 */
exports.importSeatMatrix = async (req, res) => {
  const t0 = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Missing file. Upload the TNEA seat-matrix PDF as field "pdf".' });
    }

    const { rows, skipped, stats } = await parseSeatMatrixPdf(req.file.buffer);
    if (!rows.length) {
      return res.status(422).json({ success: false, message: "No rows could be parsed from the uploaded PDF." });
    }

    const batchId = `TNEA-SEAT-MATRIX-${Date.now()}`;
    const fileName = req.file.originalname || "TNEA_Seat_Matrix.pdf";
    const adminId = req.admin ? req.admin._id : null;
    // Optional multipart field; defaults to Engineering for the TNEA dataset.
    const stream = normalizeStream(req.body.stream);

    // Preload existing colleges (keyed by collegeCode) and courses (keyed by
    // branchCode) within the target stream so the upsert is O(rows) without
    // per-row queries.
    const [existingColleges, existingCourses] = await Promise.all([
      College.find({ stream }).select("_id collegeName collegeCode stream streamsOffered").lean(),
      Course.find({ category: stream, status: { $ne: "archived" } }).select("_id courseName branchCode category").lean(),
    ]);

    const collegeByCode = new Map();
    for (const c of existingColleges) {
      const k = String(c.collegeCode || "").trim();
      if (k) collegeByCode.set(k, c);
    }
    const courseByCode = new Map();
    for (const c of existingCourses) {
      const k = String(c.branchCode || "").trim().toUpperCase();
      if (k) courseByCode.set(k, c);
    }

    const newColleges = [];
    const newCourses = [];
    const mappingOps = [];
    let collegesMatched = 0;
    let coursesMatched = 0;

    for (const r of rows) {
      const code = String(r.collegeCode || "").trim();
      let college = code ? collegeByCode.get(code) : null;
      if (!college) {
        college = {
          _id: new mongoose.Types.ObjectId(),
          collegeName: r.collegeName || "Unnamed College",
          collegeCode: code,
          stream,
          streamsOffered: [stream],
          coursesOffered: [],
          district: "",
          state: "Tamil Nadu",
        };
        collegeByCode.set(code, college);
        newColleges.push(college);
      } else {
        collegesMatched++;
      }

      const bc = String(r.branchCode || "").trim().toUpperCase();
      let course = courseByCode.get(bc);
      if (!course) {
        const courseName = prettyBranchName(r.branchName);
        course = {
          _id: new mongoose.Types.ObjectId(),
          courseName,
          branchCode: bc,
          slug: makeSlug(courseName),
          level: DEFAULT_LEVEL,
          category: stream,
          duration: DEFAULT_DURATION,
          eligibility: DEFAULT_ELIGIBILITY,
          shortDescription: DEFAULT_DESC,
          isImported: true,
          source: SOURCE,
          verified: true,
          status: "active",
          isPublished: true,
        };
        courseByCode.set(bc, course);
        newCourses.push(course);
      } else {
        coursesMatched++;
      }

      mappingOps.push({
        updateOne: {
          filter: { collegeId: college._id, courseId: course._id },
          update: {
            $set: {
              seatsOC: r.seats.oc,
              seatsBC: r.seats.bc,
              seatsBCM: r.seats.bcm,
              seatsMBC: r.seats.mbc,
              seatsSC: r.seats.sc,
              seatsSCA: r.seats.sca,
              seatsST: r.seats.st,
              seatsTotal: r.seats.total,
              stream,
              source: SOURCE,
              sourceFileName: fileName,
              importBatchId: batchId,
              isVerified: true,
              isActive: true,
              collegeName: college.collegeName,
              courseName: course.courseName,
            },
            $setOnInsert: {
              collegeId: college._id,
              courseId: course._id,
              createdBy: adminId,
            },
          },
          upsert: true,
        },
      });
    }

    if (newColleges.length) {
      await College.insertMany(newColleges);
    }
    if (newCourses.length) {
      await Course.insertMany(newCourses);
    }

    let mappingsCreated = 0;
    let mappingsUpdated = 0;
    for (let i = 0; i < mappingOps.length; i += 5000) {
      const chunk = mappingOps.slice(i, i + 5000);
      const result = await CollegeCourseMapping.bulkWrite(chunk, { ordered: false });
      mappingsCreated += result.upsertedCount || 0;
      mappingsUpdated += result.modifiedCount || 0;
    }

    const report = {
      rowsParsed: rows.length,
      skippedRows: Array.isArray(skipped) ? skipped.length : 0,
      pages: stats ? stats.pages : 0,
      colleges: { matched: collegesMatched, created: newColleges.length },
      courses: { matched: coursesMatched, created: newCourses.length },
      mappingsCreated,
      mappingsUpdated,
      batchId,
      timeTakenMs: Date.now() - t0,
    };

    res.json({ success: true, message: "Seat matrix imported successfully", report });
  } catch (error) {
    console.error("❌ Seat-matrix import failed:", error);
    res.status(500).json({ success: false, message: "Failed to import seat matrix", error: error.message });
  }
};

/** Read ?search=&page=&limit= and clamp them to safe ranges. */
function readListParams(query) {
  const search = String(query.search || "").trim().toLowerCase().replace(/\s+/g, " ");
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { search, page, limit };
}

/**
 * GET /api/admin/seat-matrix/courses
 * Engineering courses that appear in the seat matrix, each with the number of
 * colleges offering it (collegeCount) built from active mappings.
 */
exports.listCourses = async (req, res) => {
  try {
    const { search, page, limit } = readListParams(req.query);
    const stream = normalizeStream(req.query.stream);

    // Seat-matrix courses are keyed by branch code; require the field to exist.
    const filter = {
      category: stream,
      status: { $ne: "archived" },
      branchCode: { $exists: true, $nin: ["", null] },
    };
    if (search) {
      filter.$or = [
        { courseName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { branchCode: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    }

    const total = await Course.countDocuments(filter);
    let courses = await Course.find(filter)
      .select("_id courseName branchCode duration level")
      .sort({ courseName: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    let collegeCounts = new Map();
    if (courses.length) {
      const courseIds = courses.map((c) => c._id);
      const groups = await CollegeCourseMapping.aggregate([
        { $match: { courseId: { $in: courseIds }, isActive: true } },
        { $group: { _id: "$courseId", collegeIds: { $addToSet: "$collegeId" } } },
      ]);
      collegeCounts = new Map(groups.map((g) => [g._id.toString(), g.collegeIds.length]));
    }

    const data = courses.map((c) => ({
      id: c._id,
      courseName: c.courseName,
      branchCode: c.branchCode || "",
      duration: c.duration || "",
      level: c.level || "",
      collegeCount: collegeCounts.get(c._id.toString()) || 0,
    }));

    res.json({ success: true, count: total, page, limit, totalPages: Math.ceil(total / limit), data });
  } catch (error) {
    console.error("❌ Error listing seat-matrix courses:", error);
    res.status(500).json({ success: false, message: "Failed to load courses" });
  }
};

/**
 * GET /api/admin/seat-matrix/courses/:courseId/colleges
 * Colleges offering the course, each with the full OC/BC/BCM/MBC/SC/SCA/ST
 * seat breakdown from the TNEA seat matrix. Supports ?search=&page=&limit=.
 * Seat fields are ADMIN-ONLY — this router is mounted behind verifyAdmin.
 */
exports.getCourseColleges = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

    const courseFilter = { _id: courseId };
    if (req.query.stream) courseFilter.category = normalizeStream(req.query.stream);
    const course = await Course.findOne(courseFilter)
      .select("_id courseName branchCode duration level")
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found in this stream" });
    }

    const { search, page, limit } = readListParams(req.query);

    const mappings = await CollegeCourseMapping.find({ courseId, isActive: true })
      .select("collegeId seatsOC seatsBC seatsBCM seatsMBC seatsSC seatsSCA seatsST seatsTotal")
      .lean();

    const seatsByCollege = new Map();
    for (const m of mappings) {
      const key = m.collegeId && m.collegeId.toString();
      if (!key) continue;
      seatsByCollege.set(key, {
        oc: m.seatsOC || 0,
        bc: m.seatsBC || 0,
        bcm: m.seatsBCM || 0,
        mbc: m.seatsMBC || 0,
        sc: m.seatsSC || 0,
        sca: m.seatsSCA || 0,
        st: m.seatsST || 0,
        total: m.seatsTotal || 0,
      });
    }

    let colleges = [];
    if (seatsByCollege.size) {
      const collegeIds = [...seatsByCollege.keys()];
      const collegeFilter = { _id: { $in: collegeIds } };
      if (search) {
        collegeFilter.$or = [
          { collegeName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          { collegeCode: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        ];
      }
      colleges = (await College.find(collegeFilter)
        .select("_id collegeName collegeCode district location state")
        .sort({ collegeName: 1 })
        .lean()).map((col) => ({
          id: col._id,
          collegeName: col.collegeName,
          collegeCode: col.collegeCode || "",
          district: col.district || "",
          location: col.location || [col.district, col.state].filter(Boolean).join(", ") || "",
          seats: seatsByCollege.get(col._id.toString()) || null,
        }));
    }

    const count = colleges.length;
    const start = (page - 1) * limit;
    const paged = colleges.slice(start, start + limit);

    res.json({
      success: true,
      course: {
        id: course._id,
        courseName: course.courseName,
        branchCode: course.branchCode || "",
        duration: course.duration || "",
        level: course.level || "",
      },
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: paged,
    });
  } catch (error) {
    console.error("❌ Error loading course colleges:", error);
    res.status(500).json({ success: false, message: "Failed to load course colleges" });
  }
};

/**
 * GET /api/admin/seat-matrix/summary
 * Lightweight stream-scoped counts to power the admin import summary panel.
 * ?stream= defaults to Engineering.
 */
exports.getSummary = async (req, res) => {
  try {
    const stream = normalizeStream(req.query.stream);
    const [courseCount, mappingCount, totalSeats] = await Promise.all([
      Course.countDocuments({
        category: stream,
        status: { $ne: "archived" },
        branchCode: { $exists: true, $nin: ["", null] },
      }),
      CollegeCourseMapping.countDocuments({ stream, isActive: true, isVerified: true }),
      CollegeCourseMapping.aggregate([
        { $match: { stream, isActive: true, isVerified: true } },
        { $group: { _id: null, seatsTotal: { $sum: { $ifNull: ["$seatsTotal", 0] } } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        stream,
        courseCount,
        mappingCount,
        totalSeats: totalSeats.length ? totalSeats[0].seatsTotal : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error loading seat-matrix summary:", error);
    res.status(500).json({ success: false, message: "Failed to load summary" });
  }
};

/**
 * GET /api/admin/seat-matrix/streams-summary
 * Course/college/mapping counts for EVERY known stream (zero-data streams are
 * still returned so the admin stream-selector can show them as "no data").
 */
exports.getStreamsSummary = async (req, res) => {
  try {
    const [courseGroups, collegeGroups, mappingGroups] = await Promise.all([
      Course.aggregate([
        {
          $match: {
            category: { $in: STREAMS },
            status: { $ne: "archived" },
            branchCode: { $exists: true, $nin: ["", null] },
          },
        },
        { $group: { _id: "$category", n: { $sum: 1 } } },
      ]),
      College.aggregate([
        { $match: { stream: { $in: STREAMS } } },
        { $group: { _id: "$stream", n: { $sum: 1 } } },
      ]),
      CollegeCourseMapping.aggregate([
        { $match: { stream: { $in: STREAMS }, isActive: true, isVerified: true } },
        { $group: { _id: "$stream", n: { $sum: 1 } } },
      ]),
    ]);

    const toMap = (groups) => new Map(groups.map((g) => [g._id, g.n]));
    const courseCounts = toMap(courseGroups);
    const collegeCounts = toMap(collegeGroups);
    const mappingCounts = toMap(mappingGroups);

    const data = STREAMS.map((stream) => ({
      stream,
      courseCount: courseCounts.get(stream) || 0,
      collegeCount: collegeCounts.get(stream) || 0,
      mappingCount: mappingCounts.get(stream) || 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Error loading stream summary:", error);
    res.status(500).json({ success: false, message: "Failed to load stream summary" });
  }
};