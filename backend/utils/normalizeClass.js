"use strict";

// ────────────────────────────────────────────────────────────────────────────
// backend/utils/normalizeClass.js
//
// Single shared school-class normalizer for the Uyarvu Payanam codebase.
// Canonical output keys: "5" | "8" | "10" | "12".
//
// Accepts every spelling observed in the codebase:
//   5, "5", "5th", "Class 5", "class5", "CLASS 5", "5th grade", "class-5", …
// (and the 8 / 10 / 12 equivalents).
//
// Returns null for anything outside the exact school classes, including:
//   "6th"/"7th"/"9th"/"11th"/"15th", "college_student", "graduate",
//   "Undergraduate", "All", empty/undefined, and multi-digit runs such as
//   "5-12" (→ "512", not a key).
//
// READ-TIME ONLY. This util is never used to mutate stored data; it exists so
// every reader (dashboard, exam/scholarship filters, notifications, LD and
// legacy assessment, college-side service) can compare classLevel values
// consistently regardless of how they were written.
//
// IMPORTANT: this is an EXACT-key normalizer. Do NOT confuse it with
// frontend/src/student/utils/schoolEligibility.js#getStudentClass(), which
// BUCKETS class levels (min completed class, e.g. "6th" → 5) for academic
// eligibility rules — that util keeps its own, different semantics.
// ────────────────────────────────────────────────────────────────────────────

const CLASS_KEYS = ["5", "8", "10", "12"];

// "5" | "8" | "10" | "12" | null
function normalizeClass(value) {
    if (value === null || value === undefined || value === "") return null;
    const digits = String(value).replace(/[^\d]/g, "");
    return CLASS_KEYS.includes(digits) ? digits : null;
}

// "Class 5" | "Class 8" | "Class 10" | "Class 12" | null
// The canonical grade label expected by the LD pipeline and the legacy
// assessment (GeneratedAssessment.grade, LearningRecommendation.grade,
// AssessmentSummary.grade, …).
function normalizeClassLabel(value) {
    const cls = normalizeClass(value);
    return cls ? `Class ${cls}` : null;
}

// Numeric key with an explicit fallback for callers where null is not the
// desired outcome (e.g. the college-side academic recommendation service
// preserves its historical "10" default for missing/unknown grades).
function normalizeClassOr(value, fallback) {
    const cls = normalizeClass(value);
    return cls !== null ? cls : (fallback !== undefined ? fallback : null);
}

module.exports = { normalizeClass, normalizeClassLabel, normalizeClassOr };