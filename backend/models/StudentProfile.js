const mongoose = require("mongoose");

// Collection: student_profiles
// Phase 3 — dedicated one-to-one persistence layer for the school student
// (Classes 5/8/10/12). Durable home for the Step-1 onboarding / school profile
// fields that previously had no proper storage (schoolName, strongSubjects,
// weakSubjects, learningStyle were dropped entirely; the rest lived only in
// the legacy Recommendation document).
//
// USERID UNIQUENESS: exactly ONE unique-index strategy — the field-level
// `unique: true` on userId below. There is deliberately NO separate
// `schema.index({ userId: 1 }, { unique: true })` call (no duplicate indexes).
// All onboarding/profile fields except userId are optional.
//
// classLevel is stored RAW (e.g. "10th", "Class 12"); canonical interpretation
// ("5"|"8"|"10"|"12") happens at READ-TIME via backend/utils/normalizeClass.js.
const studentProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // ── School / academic (Step-1 onboarding) ────────────────────────────
        schoolName: { type: String, trim: true },
        board: { type: String, trim: true },
        classLevel: { type: String, trim: true },
        stream: { type: String, trim: true },
        marksPercentage: { type: Number },
        strongSubjects: [{ type: String, trim: true }],
        weakSubjects: [{ type: String, trim: true }],

        // ── Preferences / goals ──────────────────────────────────────────────
        preferredStream: { type: String, trim: true },
        preferredCourseCategory: { type: String, trim: true },
        careerInterest: { type: String, trim: true },
        entranceExamPlan: { type: String, trim: true },
        learningStyle: { type: String, trim: true },
        goalAfter10th: { type: String, trim: true },
        goalAfter12th: { type: String, trim: true },

        // ── Profile-page extras (User schema is intentionally NOT extended) ──
        phone: { type: String, trim: true },

        // ── Lifecycle ────────────────────────────────────────────────────────
        onboardedAt: { type: Date },
        lastUpdatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);