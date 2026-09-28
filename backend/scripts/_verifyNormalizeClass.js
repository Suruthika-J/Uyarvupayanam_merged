// backend/scripts/_verifyNormalizeClass.js
//
// Phase-1 standalone verification for the shared school-class normalizer.
// PURE AND READ-ONLY: no database connection, no schema/data mutations, no
// assessments, no test users, no recommendation records.
//
// Run from repo root:  node backend/scripts/_verifyNormalizeClass.js
//
// Coverage:
//   1. normalizeClass / normalizeClassLabel / normalizeClassOr unit matrices
//   2. Parity of onboardingAssessmentController.normalizeGrade against the OLD
//      inline implementation (oracle reconstructed from the pre-change code at
//      onboardingAssessmentController.js:19-24)
//   3. Module loadability of onboardingAssessmentController and
//      academicRecommendationService, plus the academic service's "10"-default
//      contract exercised through the shared util
"use strict";

const assert = require("assert");

let failures = 0;
const results = [];

function check(name, fn) {
  try {
    fn();
    results.push(`\u2705 PASS  ${name}`);
  } catch (err) {
    failures += 1;
    results.push(`\u274c FAIL  ${name}  \u2192  ${err.message}`);
  }
}

// ── imports (load only; must not connect to or write to any database) ───────
// require() calls are isolated so a load error is reported as a distinct, named
// failure instead of killing the whole run.
let normalize = null;
let onboardingAssessmentController = null;
let academicRecommendationService = null;
let loadErrors = [];

try {
  normalize = require("../utils/normalizeClass");
} catch (err) {
  loadErrors.push(`utils/normalizeClass → ${err.message}`);
}
try {
  onboardingAssessmentController = require("../controllers/onboardingAssessmentController");
} catch (err) {
  loadErrors.push(`controllers/onboardingAssessmentController → ${err.message}`);
}
try {
  academicRecommendationService = require("../services/academicRecommendationService");
} catch (err) {
  loadErrors.push(`services/academicRecommendationService → ${err.message}`);
}

// ── 0. loadability ───────────────────────────────────────────────────────────
check("no module load errors", () => {
  assert.ok(loadErrors.length === 0, `load errors: ${loadErrors.join(" | ")}`);
});

// ── 1. shared util unit matrix ───────────────────────────────────────────────
check("normalizeClass module exposes the three functions", () => {
  assert.ok(normalize, "module not loaded");
  assert.strictEqual(typeof normalize.normalizeClass, "function");
  assert.strictEqual(typeof normalize.normalizeClassLabel, "function");
  assert.strictEqual(typeof normalize.normalizeClassOr, "function");
});

const ACCEPT = [
  ["5", [5, "5", "5th", "Class 5", "class5", "CLASS 5", "5th grade", " Grade 5 ", "5th standard", "class-5"]],
  ["8", [8, "8", "8th", "Class 8", "class8", "8th grade"]],
  ["10", [10, "10", "10th", "Class 10", "class10", "10th grade", "class-10"]],
  ["12", [12, "12", "12th", "Class 12", "class12", "12th grade"]],
];

for (const [expected, inputs] of ACCEPT) {
  check(`normalizeClass → "${expected}" for every accepted spelling`, () => {
    for (const v of inputs) {
      assert.strictEqual(normalize.normalizeClass(v), expected, `input ${JSON.stringify(v)}`);
      assert.strictEqual(normalize.normalizeClassLabel(v), `Class ${expected}`, `label ${JSON.stringify(v)}`);
    }
  });
}

const REJECT = [
  null, undefined, "", " ", "abc",
  "1", "2", "3", "4", "13", "0", 0, "05", "5.5",
  "6th", "6", "Class 6", "7th", "9th", "11th", "15th",
  "college_student", "graduate", "Undergraduate", "All", "5-12",
];

check("normalizeClass → null for every non-school value", () => {
  for (const v of REJECT) {
    assert.strictEqual(normalize.normalizeClass(v), null, `input ${JSON.stringify(v)}`);
    assert.strictEqual(normalize.normalizeClassLabel(v), null, `label ${JSON.stringify(v)}`);
  }
});

check("normalizeClassOr preserves the academic-service '10' default contract", () => {
  assert.strictEqual(normalize.normalizeClassOr("Class 10", "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr("10", "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr("10th", "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr(10, "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr("Class 8", "10"), "8");
  assert.strictEqual(normalize.normalizeClassOr("8", "10"), "8");
  assert.strictEqual(normalize.normalizeClassOr("Class 12", "10"), "12");
  assert.strictEqual(normalize.normalizeClassOr(null, "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr(undefined, "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr("college_student", "10"), "10");
  assert.strictEqual(normalize.normalizeClassOr("", "10"), "10");
});

// ── 2. parity of the exported onboardingAssessmentController.normalizeGrade ──
// Oracle: the previous inline implementation, reconstructed verbatim from
// onboardingAssessmentController.js:19-24 before this phase's change.
function legacyNormalizeGrade(value) {
  if (!value) return null;
  const digits = String(value).replace(/[^\d]/g, "");
  const map = { 5: "Class 5", 8: "Class 8", 10: "Class 10", 12: "Class 12" };
  return map[digits] || null;
}

const PARITY_SAMPLE = [
  5, "5", "5th", "Class 5", "class5", "CLASS 5", " 5 ", "5th grade",
  8, "8", "8th", "Class 8", "class8",
  10, "10", "10th", "Class 10", "class10", "class-10",
  12, "12", "12th", "Class 12", "class12",
  null, undefined, "", 0, "0", "05", "5.5",
  "college_student", "graduate", "Undergraduate", "All",
  "6th", "7th", "9th", "11th", "15th", "abc", "5-12", "Class 6",
];

check("normalizeGrade is still exported and callable", () => {
  assert.ok(onboardingAssessmentController, "module did not load");
  assert.strictEqual(typeof onboardingAssessmentController.normalizeGrade, "function");
});

check("normalizeGrade parity vs legacy inline implementation (full sample)", () => {
  for (const v of PARITY_SAMPLE) {
    const got = onboardingAssessmentController.normalizeGrade(v);
    const expected = legacyNormalizeGrade(v);
    assert.strictEqual(got, expected, `input ${JSON.stringify(v)}`);
  }
});

// ── 3. academicRecommendationService loadability + contract ─────────────────
check("academicRecommendationService loads with exports intact", () => {
  assert.ok(academicRecommendationService, "module did not load");
  assert.strictEqual(typeof academicRecommendationService.buildAcademicRecommendations, "function");
});

// Known, accepted divergence (documented in the Phase-1 plan): the OLD academic
// helper took the FIRST digit run ("5-12" → "5"); the shared normalizer treats
// "512" as not-a-school-class and falls back to the "10" default. No classLevel
// value uses such a format (verified write paths: signup "5th".."12th", LD
// "Class X", college/graduate userType strings). Logged, never a failure.
const legacyFirstDigit = (g) => {
  const m = String(g).match(/\d+/);
  return m ? m[0] : "10";
};
console.log(
  `\u2139\ufe0f  INFO  "5-12": shared util → "${normalize.normalizeClassOr("5-12", "10")}" ` +
    `(legacy first-digit → "${legacyFirstDigit("5-12")}"). Accepted documented edge — ` +
    `no classLevel value uses that format in any write path.`
);

// ── summary ─────────────────────────────────────────────────────────────────
console.log("\n\x1b[1m── Phase-1 normalizeClass verification ──\x1b[0m");
for (const r of results) console.log(r);
if (loadErrors.length) {
  console.log("\nLoad errors encountered (module did not load):");
  for (const e of loadErrors) console.log(`  ${e}`);
}
console.log(
  failures === 0
    ? "\u2705 ALL CHECKS PASSED"
    : `\u274c ${failures} CHECK(S) FAILED`
);
process.exitCode = failures === 0 ? 0 : 1;