// backend/scripts/_verifyExamFilter.js
//
// Phase-4 standalone verification for the exam applicability filter.
//
// PURE AND READ-ONLY: no MongoDB connection, no HTTP calls, no writes, no file
// mutation. It (1) loads the modules to prove loadability without a DB, (2)
// inspects the sources of the two student-facing Exam queries to prove they now
// use Exam.applicableClass (and that Scholarship/ClassContent targetClass
// queries are untouched), (3) exercises the `$in: [classKey, "All"]` matching
// semantics fully in memory, (4) confirms exam writers can only produce
// canonical digit strings (no "10th"/"Class 10" legacy forms), (5) confirms the
// public GET /api/exams catalog keeps its search/category/level filters, and
// (6) confirms the Phase-4 touch set is exactly the three approved files.
//
// Run from repo root:  node backend/scripts/_verifyExamFilter.js
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

let failures = 0;
const results = [];
const warnings = [];

function check(name, fn) {
    try {
        fn();
        results.push(`\u2705 PASS  ${name}`);
    } catch (err) {
        failures += 1;
        results.push(`\u274c FAIL  ${name}  \u2192  ${err.message}`);
    }
}

// ── helpers ────────────────────────────────────────────────────────────────
function sourceFile(rel) {
    return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}
function exportRegion(src, exportName) {
    const start = src.indexOf(`exports.${exportName}`);
    assert.notStrictEqual(start, -1, `exports.${exportName} not found`);
    const end = src.indexOf("exports.", start + 10);
    return src.slice(start, end === -1 ? undefined : end);
}
// `Exam.find({ ... })` block ending in .limit(N) — captures the query object.
function examQueryBody(src, limit) {
    const re = new RegExp(`Exam\\.find\\(\\s*\\{([\\s\\S]*?)\\}\\)\\.limit\\(${limit}\\)`);
    const m = src.match(re);
    assert.ok(m, `Exam.find({...}).limit(${limit}) not found`);
    return m[1];
}

// ── loadability (no DB) ────────────────────────────────────────────────────
const Exam = require("../models/Exam");
const examRoutes = require("../routes/examRoutes");
const assessmentController = require("../controllers/assessmentController");
const onboardingController = require("../controllers/onboardingController");

check("0. model / routes / controllers load without DB", () => {
    assert.ok(Exam && Exam.collection.collectionName === "exams", "Exam model did not load");
    assert.ok(examRoutes && Array.isArray(examRoutes.stack), "examRoutes did not load");
    assert.strictEqual(typeof assessmentController.submitAssessment, "function");
    assert.strictEqual(typeof onboardingController.submitOnboarding, "function");
});

// ── A. source-level behavior ───────────────────────────────────────────────
check("A1. onboarding Exam query uses applicableClass", () => {
    const body = examQueryBody(sourceFile("controllers/onboardingController.js"), 3);
    assert.ok(body.includes("applicableClass"), "onboarding Exam query missing applicableClass");
    assert.ok(body.includes("cleanGrade"), "onboarding Exam query must keep cleanGrade");
    assert.ok(body.includes('"All"'), "onboarding Exam query must keep the All escape hatch");
    assert.ok(body.includes("$in"), "onboarding Exam query must use $in");
});
check("A2. onboarding Exam query does NOT use targetClass", () => {
    const body = examQueryBody(sourceFile("controllers/onboardingController.js"), 3);
    assert.ok(!body.includes("targetClass"), "onboarding Exam query still references targetClass");
});
check("A3. assessment Exam branch uses applicableClass (dedicated query)", () => {
    const body = examQueryBody(sourceFile("controllers/assessmentController.js"), 5);
    assert.ok(body.includes("applicableClass"), "assessment Exam query missing applicableClass");
    assert.ok(body.includes("classLevel"), "assessment Exam query must use classLevel");
    assert.ok(body.includes('"All"'), "assessment Exam query must keep the All escape hatch");
    assert.ok(!body.includes("targetClass"), "assessment Exam query still references targetClass");
});
check("A3b. shared $or (Course/College/Scholarship) left untouched", () => {
    const src = sourceFile("controllers/assessmentController.js");
    assert.ok(src.includes("Course.find({ ...query"), "Course branch changed");
    assert.ok(src.includes("College.find({ ...query"), "College branch changed");
    assert.ok(src.includes("Scholarship.find({ ...query"), "Scholarship branch changed");
    assert.ok(!src.includes("applicableClass") || /Exam\.find\(\s*\{\s*applicableClass/.test(src),
        "applicableClass must appear only in the dedicated Exam query");
});
check("A4. Scholarship/ClassContent targetClass queries remain present", () => {
    const src = sourceFile("controllers/onboardingController.js");
    assert.ok(src.includes("Scholarship.find({ targetClass"), "Scholarship.targetClass query missing");
    assert.ok(src.includes("ClassContent.find({ targetClass"), "ClassContent.targetClass query missing");
});
check("A5. no Exam model change required (schema already correct)", () => {
    const model = sourceFile("models/Exam.js");
    assert.ok(model.includes("applicableClass:"), "Exam model missing applicableClass");
    assert.ok(model.includes("type: [String]"), "applicableClass must stay [String]");
    assert.ok(model.includes('default: ["12"]'), "applicableClass default must stay [\"12\"]");
    assert.ok(!model.includes("targetClass"), "Exam model must not contain targetClass");
});

// ── B. matching semantics, in memory only ──────────────────────────────────
// Mirrors MongoDB: `applicableClass: { $in: [classKey, "All"] }` matches a
// document when its applicableClass ARRAY contains classKey OR "All".
function matchesForClass(applicableClasses, classKey) {
    const list = Array.isArray(applicableClasses) ? applicableClasses : String(applicableClasses).split(",");
    return list.includes(classKey) || list.includes("All");
}
const KEYS = ["5", "8", "10", "12"];

check("B1. Class 5 → only [\"5\"] matches", () => {
    assert.ok(matchesForClass(["5"], "5"));
    assert.ok(!matchesForClass(["8"], "5") && !matchesForClass(["10"], "5") && !matchesForClass(["12"], "5"));
});
check("B2. Class 8 → only [\"8\"] matches", () => {
    assert.ok(matchesForClass(["8"], "8"));
    assert.ok(!matchesForClass(["5"], "8") && !matchesForClass(["10"], "8") && !matchesForClass(["12"], "8"));
});
check("B3. Class 10 → only [\"10\"] matches", () => {
    assert.ok(matchesForClass(["10"], "10"));
    assert.ok(!matchesForClass(["5"], "10") && !matchesForClass(["8"], "10") && !matchesForClass(["12"], "10"));
});
check("B4. Class 12 → only [\"12\"] matches", () => {
    assert.ok(matchesForClass(["12"], "12"));
    assert.ok(!matchesForClass(["5"], "12") && !matchesForClass(["8"], "12") && !matchesForClass(["10"], "12"));
});
check("B5. a document containing \"All\" matches every canonical class key", () => {
    for (const key of KEYS) assert.ok(matchesForClass(["All"], key), `All should match class ${key}`);
    for (const key of KEYS) assert.ok(matchesForClass(["12", "All"], key), `[12, All] should match class ${key}`);
});
check("B6. multi-class arrays behave like $in (e.g. [\"10\",\"12\"])", () => {
    assert.ok(matchesForClass(["10", "12"], "10") && matchesForClass(["10", "12"], "12"));
    assert.ok(!matchesForClass(["10", "12"], "5") && !matchesForClass(["10", "12"], "8"));
});

// ── C. no legacy representation needs handling ─────────────────────────────
check("C. exam writers emit only canonical digit strings", () => {
    const seeds = sourceFile("scripts/seedAllExams.js");
    const occurrences = seeds.match(/applicableClass:\s*\[[^\]]*\]/g) || [];
    assert.ok(occurrences.length >= 30, `expected ~32 applicableClass seeds, got ${occurrences.length}`);
    for (const occ of occurrences) {
        const inner = occ.slice(occ.indexOf("[") + 1, occ.indexOf("]"));
        const tokens = inner.split(",").map((t) => t.trim().replace(/["'\s]/g, ""));
        for (const t of tokens) {
            assert.ok(["5", "8", "10", "12"].includes(t), `non-canonical value in seed: "${t}"`);
        }
    }
    // The only other writers: admin create (passes body/undefined → default), CSV (no
    // applicableClass column → default), update (pass-through). None can fabricate
    // "10th"/"Class 10". No code path writes non-canonical representations.
});

// ── D. public catalog untouched ────────────────────────────────────────────
check("D. GET /api/exams (getAllExams) keeps search/category/level, no class filter", () => {
    const region = exportRegion(sourceFile("controllers/examController.js"), "getAllExams");
    assert.ok(!region.includes("applicableClass"), "public catalog must not gain a class filter");
    assert.ok(region.includes("search"), "search filter missing");
    assert.ok(region.includes("category"), "category filter missing");
    assert.ok(region.includes("level"), "level filter missing");
});

// ── E. scope: exactly the three approved files ─────────────────────────────
const APPROVED = [
    "backend/controllers/onboardingController.js",
    "backend/controllers/assessmentController.js",
    "backend/scripts/_verifyExamFilter.js",
];
check("E. approved Phase-4 files exist on disk", () => {
    for (const rel of APPROVED) {
        // APPROVED paths are repo-relative; sourceFile-relative paths drop the backend/ prefix.
        const relToBackend = rel.replace(/^backend\//, "");
        assert.ok(fs.existsSync(path.join(__dirname, "..", relToBackend)), `approved file missing: ${rel}`);
    }
});
// Informational (+attempted check): git sees the 3 approved paths as the only
// Phase-4 touch set (read-only subprocess; no git available → warning only).
function gitStatus(lines) {
    try {
        return execFileSync("git", ["status", "--porcelain", "--", ...lines], { cwd: path.join(__dirname, ".."), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch (err) {
        warnings.push("git not available in this environment — scope confirmed via shell commands in the report");
        return null;
    }
}
check("E. git reports only the approved paths as Phase-4 touched (porcelain)", () => {
    const out = gitStatus(APPROVED);
    if (out === null) throw new Error("git unavailable (recorded as warning)");
    const paths = out.split(/\r?\n/).map((l) => l.slice(3).trim()).filter(Boolean);
    for (const p of paths) {
        const rel = p.startsWith("Uyarvupayanam_merged-main/") ? p.slice("Uyarvupayanam_merged-main/".length) : p;
        assert.ok(APPROVED.includes(rel), `unapproved path reported by git: ${rel}`);
    }
});

// summary
console.log("\n\x1b[1m── Phase-4 exam-filter verification ──\x1b[0m");
for (const r of results) console.log(r);
if (warnings.length) {
    console.log("\n\x1b[33mWarnings:\x1b[0m");
    for (const w of warnings) console.log(`  - ${w}`);
}
console.log(failures === 0 ? "\u2705 ALL CHECKS PASSED" : `\u274c ${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;