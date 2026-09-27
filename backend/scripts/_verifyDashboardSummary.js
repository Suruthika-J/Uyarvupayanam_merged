// backend/scripts/_verifyDashboardSummary.js
//
// Phase-6A standalone verification for GET /api/student/dashboard-summary.
//
// PURE / READ-ONLY:
//   - No MongoDB connection, no HTTP requests, no DB writes, no file writes.
//   - git is invoked read-only (grep + status) for scope/ownership probes.
//   - The controller and the student router ARE loaded as CommonJS modules
//     (module definition does not open a database connection), and pure
//     helpers such as normalizeClass run in-memory with fixture inputs.
//
// Run from the nested repo root:
//   node backend/scripts/_verifyDashboardSummary.js
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

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

const ROOT = path.join(__dirname, "..", ".."); // .../Uyarvupayanam_merged-main (frontend lives here)
const CONTROLLER_REL = path.join("backend", "controllers", "dashboardSummaryController.js");
const ROUTES_REL = path.join("backend", "routes", "studentRoutes.js");
const SCRIPT_REL = path.join("backend", "scripts", "_verifyDashboardSummary.js");
const DASHBOARD_PAGE_REL = path.join("frontend", "src", "student", "pages", "dashboard", "DashboardPage.jsx");

const readFile = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// ── A. Route wiring ─────────────────────────────────────────────────────────
let routesSrc;
let controllerSrc;
check("1. Route exists (GET /dashboard-summary in studentRoutes.js)", () => {
    routesSrc = readFile(ROUTES_REL);
    assert.ok(routesSrc.includes('router.get("/dashboard-summary"'), "route registration missing");
});
check("2. verifyStudent middleware is attached to the route", () => {
    assert.ok(
        routesSrc.includes('router.get("/dashboard-summary", verifyStudent, dashboardSummaryController.getDashboardSummary)'),
        "verifyStudent not present on the registration line"
    );
    // Live router introspection (module load does NOT connect to MongoDB).
    const routes = require("../routes/studentRoutes");
    const layer = routes.stack.find((l) => l.route && l.route.path === "/dashboard-summary");
    assert.ok(layer, "route layer not registered on the router");
    assert.strictEqual(layer.route.stack.length, 2, "expected exactly verifyStudent + handler");
});

// ── B. Controller ownership / no client-supplied identifiers ───────────────
check("3. Controller derives the student from req.student (authenticated token)", () => {
    controllerSrc = readFile(CONTROLLER_REL);
    assert.ok(
        controllerSrc.includes("req.student?._id") || controllerSrc.includes("req.student._id"),
        "req.student id derivation missing"
    );
    const controller = require("../controllers/dashboardSummaryController");
    assert.strictEqual(typeof controller.getDashboardSummary, "function", "getDashboardSummary not exported");
});
check("4. No user identifier is read from the query string", () => {
    for (const n of ["req.query" + ".userId", "req.query" + ".studentId"]) {
        assert.ok(!controllerSrc.includes(n), `controller reads ${n}`);
    }
});
check("5. No user identifier is read from the request body", () => {
    for (const n of ["req.body" + ".userId", "req.body" + ".studentId"]) {
        assert.ok(!controllerSrc.includes(n), `controller reads ${n}`);
    }
});

// ── C. Class handling ──────────────────────────────────────────────────────
check("6. normalizeClass is imported and reused (not duplicated)", () => {
    assert.ok(controllerSrc.includes('require("../utils/normalizeClass")'), "normalizeClass not imported");
    assert.ok(controllerSrc.includes("normalizeClass(req.student.classLevel)"), "normalizeClass not applied to classLevel");
});
check("7. Canonical class mapping is 5 | 8 | 10 | 12 | null", () => {
    const { normalizeClass } = require("../utils/normalizeClass");
    assert.strictEqual(normalizeClass("5"), "5");
    assert.strictEqual(normalizeClass("8"), "8");
    assert.strictEqual(normalizeClass("10"), "10");
    assert.strictEqual(normalizeClass("12"), "12");
    assert.strictEqual(normalizeClass("5th"), "5");
    assert.strictEqual(normalizeClass("Class 10"), "10");
    assert.strictEqual(normalizeClass("12th"), "12");
    assert.strictEqual(normalizeClass(undefined), null);
    assert.strictEqual(normalizeClass(""), null);
    assert.strictEqual(normalizeClass("college_student"), null);
    assert.strictEqual(normalizeClass("6th"), null);
    assert.strictEqual(normalizeClass("15th"), null);
});

// ── D. Recommendation source ───────────────────────────────────────────────
check("8. Recommendation uses the legacy Recommendation source only", () => {
    assert.ok(controllerSrc.includes('require("../models/Recommendation")'), "Recommendation model not used");
    assert.ok(controllerSrc.includes("Recommendation.findOne({ userId: uid })"), "legacy find not present");
    assert.ok(controllerSrc.includes("fetchedClass5Content."), "populated fetchedClass5Content missing");
});
check("9. No LearningRecommendation / LD integration in this phase", () => {
    const needle = "Learning" + "Recommendation";
    assert.ok(!controllerSrc.includes(needle), "LD must not be consumed by dashboard-summary in Phase 6A");
    assert.ok(!controllerSrc.includes("ld" + "nbsOrchestrator"), "orchestrator must not be invoked");
    assert.ok(!controllerSrc.includes("learning" + "DiagnosisController"), "LD controller must not be invoked");
});

// ── E. Exam / scholarship contracts ────────────────────────────────────────
check("10. Exams apply the Phase-4 applicability contract", () => {
    assert.ok(controllerSrc.includes("applicableClass"), "applicableClass filter missing");
    assert.ok(controllerSrc.includes("$in: [canonicalClass, \"All\"]"), "canonical + All $in contract missing");
    assert.ok(controllerSrc.includes("Exam.find(examFilter)"), "exam query missing");
});
check("11. Scholarships reuse the existing grade/userSide matching behavior", () => {
    assert.ok(controllerSrc.includes("scholarshipController.getAllScholarships"), "public scholarship handler not reused");
    assert.ok(controllerSrc.includes('userSide: "true"'), "userSide gate missing");
    // The digit-extract regex must NOT be duplicated in the new controller.
    const dupRegex = "\\b${clean" + "Grade}(th)?\\b";
    assert.ok(!controllerSrc.includes(dupRegex), "scholarship matching regex duplicated");
});

// ── F. Class 5 / profile scope ─────────────────────────────────────────────
check("12. Class-5 gamification is not aggregated or modified", () => {
    const needle = "class" + "5";
    assert.ok(!controllerSrc.includes(needle), "controller must not reference Class-5 gamification");
    const routes = require("../routes/studentRoutes");
    assert.ok(!routes.stack.some((l) => l.route && String(l.route.path).includes("class5")), "no class-5 path on student router here");
});
check("13. StudentProfile is scoped by the authenticated user only", () => {
    assert.ok(controllerSrc.includes("StudentProfile.findOne({ userId: uid })"), "profile query not scoped to req.student");
});

// ── G. Sensitive data exclusion ────────────────────────────────────────────
check("14. Response excludes password / reset tokens / internal fields", () => {
    for (const n of ["pass" + "word", "reset" + "PasswordToken", "isVerified", "resetPassword" + "Expires"]) {
        assert.ok(!controllerSrc.includes(n), `controller exposes ${n}`);
    }
    // The picked student view is limited to dashboard fields only.
    for (const field of ["name: doc.name", "district: doc.district", "onboardingCompleted: doc.onboardingCompleted", "recommendationGenerated: doc.recommendationGenerated"]) {
        assert.ok(controllerSrc.includes(field), `student view missing ${field}`);
    }
});

// ── H. Frontend untouched / scope ──────────────────────────────────────────
check("15. No frontend file references the summary endpoint (6B not applied)", () => {
    const dash = readFile(DASHBOARD_PAGE_REL);
    const needle = "dashboard" + "-summary";
    assert.ok(!dash.includes(needle), "DashboardPage must not call dashboard-summary yet");
    // git grep exits 1 when there are no matches (which is exactly what we
    // want here) — execFileSync would treat that as a child failure.
    const grepSafe = (args) => {
        try {
            return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        } catch (err) {
            return String(err.stdout || "").trim();
        }
    };
    // The brand-new school path must not appear anywhere in the frontend.
    // (Pre-existing college pages legitimately reference the college
    //  /study-tools/dashboard-summary endpoint — that is unrelated.)
    const schoolPath = "/student/" + "dashboard-summary";
    const frontHits = grepSafe(["grep", "-n", schoolPath, "--", "frontend"]);
    assert.strictEqual(frontHits, "", `frontend references the school summary path:\n${frontHits}`);
    // Tracked-tree hits for /student/dashboard-summary are limited to the route file.
    const tierHits = grepSafe(["grep", "-n", schoolPath]);
    for (const line of tierHits.split(/\r?\n/).filter(Boolean)) {
        const file = line.slice(0, line.indexOf(":"));
        assert.strictEqual(file, "backend/routes/studentRoutes.js", `unexpected reference: ${file}`);
    }
});
check("17. Scope is exactly the three approved files", () => {
    const out = execFileSync("git", ["status", "--porcelain", "--",
        "backend/controllers/dashboardSummaryController.js",
        "backend/routes/studentRoutes.js",
        "backend/scripts/_verifyDashboardSummary.js"], {
        cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const paths = out.split(/\r?\n/).map((l) => l.slice(3).trim()).filter(Boolean);
    assert.strictEqual(paths.length, 3, `expected exactly 3 approved paths in git, got: ${JSON.stringify(paths)}`);
    for (const p of paths) {
        assert.ok(
            p.includes("dashboardSummaryController.js") ||
            p.includes("studentRoutes.js") ||
            p.includes("_verifyDashboardSummary.js"),
            `unexpected Phase-6A path: ${p}`
        );
    }
});

// ── I. Verification-script purity ──────────────────────────────────────────
check("16. Verification performs no DB/HTTP/write operations", () => {
    const src = fs.readFileSync(__filename, "utf8");
    const mongo = "mongo" + "ose.connect";
    const http = "fetch" + "(";
    assert.ok(!src.includes(mongo), "script must not connect to a DB");
    assert.ok(!src.includes(http), "script must not issue HTTP requests");
    for (const n of [".s" + "ave(", ".c" + "reate(", ".find" + "OneAndUpdate(", ".up" + "dateOne(", ".del" + "eteOne(", ".del" + "eteMany(", ".insert" + "Many("]) {
        assert.ok(!src.includes(n), `script performs a DB write: ${n}`);
    }
});

// ── summary ────────────────────────────────────────────────────────────────
console.log("\n\x1b[1m── Phase-6A dashboard-summary verification ──\x1b[0m");
for (const r of results) console.log(r);
console.log(failures === 0 ? "\u2705 ALL CHECKS PASSED" : `\u274c ${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;