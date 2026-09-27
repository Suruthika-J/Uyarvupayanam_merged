"use strict";

// ────────────────────────────────────────────────────────────────────────────
// backend/utils/studentProfileSync.js
//
// Phase 3 — StudentProfile persistence helper.
//
// Durable home for the Step-1 onboarding / school profile fields. The LD and
// legacy onboarding flows pass their (flow-trusted) studentId/userId + fields
// here; the helper upserts ONE StudentProfile per student (field-level unique
// index on userId + findOneAndUpdate upsert ⇒ no duplicate profiles, even under
// repeated onboarding).
//
// DATA OWNERSHIP:
//   This helper is INTERNAL to the existing onboarding persistence flows only.
//   It is NOT exposed through any public profile API. The public profile API
//   (GET/PUT /api/student/profile) derives ownership EXCLUSIVELY from
//   req.student._id and never accepts a client-chosen owner id.
//
// SECURITY NOTE (follow-up item, NOT fixed by Phase 3):
//   POST /api/onboarding/submit and POST /api/onboarding/ld/submit accept
//   userId/studentId in the request body and carry no auth middleware. That
//   pre-existing trust model is unchanged here — the sync helper simply
//   receives whatever id the existing flow already trusts. The onboarding
//   authorization question is tracked separately; Phase 3 does not claim to
//   fix it.
// ────────────────────────────────────────────────────────────────────────────

const StudentProfile = require("../models/StudentProfile");

// Whitelist of profile fields this helper may persist. Anything outside this
// list (including userId/studentId from a client body) is ignored.
const PROFILE_FIELDS = [
    "schoolName", "board", "classLevel", "stream", "marksPercentage",
    "strongSubjects", "weakSubjects", "preferredStream", "preferredCourseCategory",
    "careerInterest", "entranceExamPlan", "learningStyle",
    "goalAfter10th", "goalAfter12th", "phone",
];

// Pure: " Maths,  , Science ," → ["Maths", "Science"] (trimmed, empties dropped).
// Arrays pass through trimmed. Empty/null/undefined → undefined (nothing to store).
function normalizeSubjectList(value) {
    if (value === undefined || value === null || value === "") return undefined;
    const list = Array.isArray(value) ? value : String(value).split(",");
    const out = list
        .map((item) => String(item).trim())
        .filter(Boolean);
    return out.length ? out : undefined;
}

// Pure: keep only whitelisted fields that are actually present, applying
// subject normalization and string trimming. Keys whose value is `undefined`
// are dropped from the result so a caller can $set exactly what arrived
// (undefined ⇒ leave the stored value unchanged; "" ⇒ clear to empty/null).
function pickProfileFields(fields = {}) {
    const out = {};
    for (const key of PROFILE_FIELDS) {
        if (fields[key] === undefined) continue;
        const value = fields[key];
        if (key === "strongSubjects" || key === "weakSubjects") {
            const list = normalizeSubjectList(value);
            if (list !== undefined) out[key] = list;
            continue;
        }
        if (typeof value === "string") {
            out[key] = value.trim();
            continue;
        }
        out[key] = value;
    }
    return out;
}

// Upsert one profile per student.
//   userId     — the identity the EXISTING onboarding flow trusts (its own
//                studentId/userId from the submitted request).
//   classLevel — default for the profile's classLevel when `fields` does not
//                carry one (stored raw; canonicalized at read-time).
// Returns the resulting document (lean) or null when no userId is given.
async function upsertStudentProfile({ userId, classLevel, fields = {} }) {
    if (!userId) return null;
    const set = pickProfileFields(fields);
    if (classLevel && set.classLevel === undefined) set.classLevel = String(classLevel);

    const now = new Date();
    return StudentProfile.findOneAndUpdate(
        { userId },
        {
            $set: { ...set, lastUpdatedAt: now },
            $setOnInsert: { onboardedAt: now },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
}

module.exports = { PROFILE_FIELDS, normalizeSubjectList, pickProfileFields, upsertStudentProfile };