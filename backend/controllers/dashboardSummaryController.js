// backend/controllers/dashboardSummaryController.js
//
// Phase 6A — GET /api/student/dashboard-summary
//
// Consolidated, READ-ONLY summary of the school-student dashboard data
// (Classes 5/8/10/12). This is an ADDITIVE endpoint: DashboardPage and every
// existing public/student API keep working exactly as before; this endpoint
// simply assembles the same data the dashboard renders today into a single
// response so a later phase (6B) can consume one call instead of ten.
//
// OWNERSHIP
//   The authenticated student is derived EXCLUSIVELY from req.student._id
//   (populated by verifyStudent from the signed token). No client-supplied
//   user identifier is ever read from the query string or request body — an
//   arbitrary user can therefore never be targeted. User data itself comes
//   from the verified token document.
//
// CLASS HANDLING
//   Canonical class uses backend/utils/normalizeClass.js (exact keys 5|8|10|12).
//   This is deliberately NOT the frontend getStudentClass() bucketing util.
//
// RECOMMENDATIONS
//   Legacy Recommendation source only — mirrors
//   onboardingController.getRecommendations (same find + populate). The
//   diagnosis store is intentionally NOT merged here; the LD-first →
//   legacy-fallback adapter belongs to Phase 7.
//
// FAILURE ISOLATION
//   Every optional section is read independently (Promise.allSettled). A
//   single failing section degrades to its empty/null fallback while the
//   response still returns success:true. Only an unresolvable authenticated
//   student (already prevented by verifyStudent) would be fatal.
//
// NOTE ON COUNT SEMANTICS (stats)
//   - courses:   deduplicated course-catalog count (reuses getAllCourses).
//   - exams:     count of exams matching the Phase-4 applicability filter
//                (applicableClass $in [canonical, "All"]) when canonicalClass
//                exists, otherwise the full catalog count (today's behavior).
//   - scholarships: count of scholarships matching the Phase-5 grade + userSide
//                filter when canonicalClass exists, otherwise the full catalog
//                count (today's behavior). Reuses getAllScholarships.
//   - colleges:  full college-catalog count (reuses getAllColleges).
"use strict";

const Exam = require("../models/Exam");
const CareerPath = require("../models/CareerPath");
const Notification = require("../models/Notification");
const Recommendation = require("../models/Recommendation");
const StudentProfile = require("../models/StudentProfile");
const SavedItem = require("../models/SavedItem");
const MentorRequest = require("../models/MentorRequest");

const { normalizeClass } = require("../utils/normalizeClass");
const courseController = require("./courseController");
const collegeController = require("./collegeController");
const scholarshipController = require("./scholarshipController");

// Display limits — mirror the exact slices DashboardPage renders today
// (notifications 3 / careers 6 / exams 4 / scholarships 3).
const NOTIF_DISPLAY_LIMIT = 3;
const CAREER_DISPLAY_LIMIT = 6;
const EXAM_DISPLAY_LIMIT = 4;
const SCHOLARSHIP_DISPLAY_LIMIT = 3;

// StudentProfile fields actually relevant to dashboard/personalization views.
// Deliberately excludes phone and lifecycle/timing metadata; the full
// document is never returned.
const PROFILE_FIELDS = [
    "schoolName",
    "board",
    "stream",
    "classLevel",
    "marksPercentage",
    "strongSubjects",
    "weakSubjects",
    "preferredStream",
    "preferredCourseCategory",
    "careerInterest",
    "entranceExamPlan",
    "learningStyle",
    "goalAfter10th",
    "goalAfter12th",
];

// Minimal response stub so existing public-list controllers can be REUSED
// (never duplicated) for their exact count/matching semantics — course
// dedupe, college projection, scholarship grade/userSide matching.
function makeStubRes() {
    const stub = { statusCode: 200, payload: null };
    stub.status = (code) => {
        stub.statusCode = code;
        return stub;
    };
    stub.json = (body) => {
        stub.payload = body;
        return stub;
    };
    return stub;
}

async function runPublicList(handler, query) {
    const stub = makeStubRes();
    await handler({ query }, stub);
    if (stub.statusCode >= 400 || !stub.payload || stub.payload.success === false) {
        throw new Error(stub.payload?.message || `dashboard-summary: list failed (${stub.statusCode})`);
    }
    return stub.payload;
}

// Only the fields the dashboard surfaces — no secrets or internal fields.
function pickStudentView(doc) {
    if (!doc) return null;
    return {
        name: doc.name,
        classLevel: doc.classLevel,
        district: doc.district,
        userType: doc.userType,
        onboardingCompleted: doc.onboardingCompleted,
        recommendationGenerated: doc.recommendationGenerated,
    };
}

// Only the dashboard-required profile fields (never the full document).
function pickProfile(doc) {
    if (!doc) return null;
    const out = {};
    for (const key of PROFILE_FIELDS) {
        if (doc[key] !== undefined) out[key] = doc[key];
    }
    return out;
}

// GET /api/student/dashboard-summary
exports.getDashboardSummary = async (req, res) => {
    const uid = req.student?._id;
    if (!uid) {
        // verifyStudent guarantees req.student; absence here is a hard auth gap.
        return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const canonicalClass = normalizeClass(req.student.classLevel);

    // Mirror notificationController.getUserNotifications filter exactly:
    // class-matched broadcasts OR notifications targeted directly at the user.
    const classLevel = req.student.classLevel;
    const levelFilter = classLevel
        ? { $in: ["All", classLevel] }
        : { $in: ["All"] };
    const notifFilter = {
        $or: [
            { isBroadcast: true, targetLevel: levelFilter },
            { userId: uid, isBroadcast: false },
        ],
    };

    // Phase-4 applicability contract (assessmentController-exact semantics).
    const examFilter = canonicalClass
        ? { applicableClass: { $in: [canonicalClass, "All"] } }
        : {};

    // Phase-5 scholarship contract — reuse getAllScholarships wholesale
    // (digit extraction, spelling variants, userSide status gate).
    const scholarshipQuery = canonicalClass
        ? { grade: canonicalClass, userSide: "true" }
        : {};

    // Independent reads: one failing section never sinks the dashboard.
    const [
        profileR,
        notifR,
        recR,
        examR,
        scholR,
        careerR,
        savedR,
        mentorR,
        courseCountR,
        collegeCountR,
    ] = await Promise.allSettled([
        StudentProfile.findOne({ userId: uid }).lean(),
        Notification.find(notifFilter)
            .sort({ createdAt: -1 })
            .limit(NOTIF_DISPLAY_LIMIT)
            .lean()
            .then(async (items) => ({
                items,
                unreadCount: await Notification.countDocuments({ ...notifFilter, isRead: false }),
            })),
        Recommendation.findOne({ userId: uid })
            .sort({ createdAt: -1 })
            .populate("fetchedClass5Content.skills")
            .populate("fetchedClass5Content.exams")
            .populate("fetchedClass5Content.scholarships")
            .populate("fetchedClass5Content.careers")
            .populate("fetchedClass5Content.habits")
            .populate("fetchedClass5Content.fun")
            .lean(),
        Exam.find(examFilter)
            .sort({ createdAt: -1 })
            .limit(EXAM_DISPLAY_LIMIT)
            .lean()
            .then(async (list) => ({
                list,
                count: await Exam.countDocuments(examFilter),
            })),
        runPublicList(scholarshipController.getAllScholarships, scholarshipQuery),
        CareerPath.find({ status: "published" })
            .populate("relatedScholarships")
            .sort({ createdAt: -1 })
            .limit(CAREER_DISPLAY_LIMIT)
            .lean(),
        SavedItem.find({ userId: uid })
            .populate("contentId")
            .sort({ createdAt: -1 })
            .lean(),
        MentorRequest.find({ userId: uid })
            .sort({ createdAt: -1 })
            .lean(),
        runPublicList(courseController.getAllCourses, {}),
        runPublicList(collegeController.getAllColleges, {}),
    ]);

    const settled = (label, r, fallback) => {
        if (r.status === "fulfilled") return r.value;
        console.error(`[dashboard-summary] ${label} section failed:`, r.reason?.message || r.reason);
        return fallback;
    };

    const profile = settled("profile", profileR, null);
    const notifs = settled("notifications", notifR, { items: [], unreadCount: 0 });
    const recommendation = settled("recommendation", recR, null) || null;
    const exams = settled("exams", examR, { list: [], count: 0 });
    const scholPayload = settled("scholarships", scholR, { data: [], count: 0 });
    const scholarships = Array.isArray(scholPayload?.data) ? scholPayload.data : [];
    const careers = settled("careers", careerR, []);
    const savedItems = settled("savedItems", savedR, []);
    const mentorRequests = settled("mentorRequests", mentorR, []);
    const coursePayload = settled("courses", courseCountR, { data: [], count: 0 });
    const collegePayload = settled("colleges", collegeCountR, { data: [], count: 0 });

    res.json({
        success: true,
        student: pickStudentView(req.student),
        canonicalClass, // "5" | "8" | "10" | "12" | null
        profile: pickProfile(profile),
        stats: {
            courses: typeof coursePayload?.count === "number"
                ? coursePayload.count
                : (Array.isArray(coursePayload?.data) ? coursePayload.data.length : 0),
            exams: exams.count || 0,
            scholarships: scholarships.length,
            colleges: typeof collegePayload?.count === "number"
                ? collegePayload.count
                : (Array.isArray(collegePayload?.data) ? collegePayload.data.length : 0),
        },
        sections: {
            notifications: {
                items: notifs.items || [],
                unreadCount: notifs.unreadCount || 0,
            },
            recommendation,
            exams: exams.list || [],
            scholarships: scholarships.slice(0, SCHOLARSHIP_DISPLAY_LIMIT),
            careers: careers.slice(0, CAREER_DISPLAY_LIMIT),
            savedItems,
            mentorRequests,
        },
    });
};