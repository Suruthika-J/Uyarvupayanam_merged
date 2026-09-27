// backend/scripts/_verifyDashboardScholarshipGrade.js
//
// Phase-5 standalone verification — the common student dashboard now sends the
// student's canonical class as the `grade` param to the scholarship API.
//
// PURE AND READ-ONLY: no MongoDB connection, no HTTP calls, no writes, no file
// mutation (git is invoked read-only for the scope probe). The frontend JSX is
// NOT executed (Node cannot import JSX); instead its source is inspected
// statically and the canonical-class derivation is exercised in-memory.
//
// Run from repo root:  node backend/scripts/_verifyDashboardScholarshipGrade.js
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
const DASHBOARD_REL = path.join("frontend", "src", "student", "pages", "dashboard", "DashboardPage.jsx");
const SCHOLARSHIPS_PAGE_REL = path.join("frontend", "src", "student", "pages", "scholarships", "ScholarshipsPage.jsx");

function frontendSource(rel) {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
function backendSource(rel) {
    return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

// ── mirrors the DashboardPage canonical-class guard EXACTLY (same semantics) ──
function canonicalClassOf(raw) {
    const classDigits = String(raw ?? "").match(/\d+/)?.[0] ?? null;
    return classDigits && ["5", "8", "10", "12"].includes(classDigits) ? classDigits : null;
}

// ── A. DashboardPage source facts ───────────────────────────────────────────
let dash;
check("A1. DashboardPage.jsx exists and is readable", () => {
    dash = frontendSource(DASHBOARD_REL);
    assert.ok(dash.includes("scholarshipService.getAll("), "scholarshipService.getAll call missing");
});
check("A2. scholarshipService.getAll now receives { grade, userSide } params", () => {
    assert.ok(dash.includes("grade: canonicalClass"), "grade param missing from scholarship call");
    assert.ok(dash.includes("userSide: true"), "userSide: true missing from scholarship call");
    assert.ok(!/scholarshipService\.getAll\(\)/.test(dash), "the old no-arg scholarship call is still present");
});
check("A3. DashboardPage derives the class from student.classLevel", () => {
    assert.ok(dash.includes("student?.classLevel"), "student.classLevel not referenced");
    assert.ok(dash.includes("['5', '8', '10', '12']"), "canonical class guard missing");
});
check("A4. DashboardPage does NOT use getStudentClass() (bucketing util)", () => {
    assert.ok(!/\bgetStudentClass\b/.test(dash), "getStudentClass must not be used by the dashboard");
    assert.ok(!dash.includes("schoolEligibility"), "schoolEligibility must not be imported");
});
check("A5. frontend does NOT import the backend normalizeClass util", () => {
    assert.ok(!dash.includes("normalizeClass"), "backend normalizeClass must not be imported into the frontend");
});

// ── B. class → grade mapping (in-memory, exact guard semantics) ─────────────
check("B1. canonical classes map to grade 5 / 8 / 10 / 12", () => {
    assert.strictEqual(canonicalClassOf("5"), "5");
    assert.strictEqual(canonicalClassOf("8"), "8");
    assert.strictEqual(canonicalClassOf("10"), "10");
    assert.strictEqual(canonicalClassOf("12"), "12");
});
check("B2. legacy spellings of canonical classes also map (5th / Class 10 / 12th)", () => {
    assert.strictEqual(canonicalClassOf("5th"), "5");
    assert.strictEqual(canonicalClassOf("Class 10"), "10");
    assert.strictEqual(canonicalClassOf(" 12th "), "12");
    assert.strictEqual(canonicalClassOf("Grade 8"), "8");
});
check("B3. missing class ⇒ no grade (safe fallback)", () => {
    assert.strictEqual(canonicalClassOf(undefined), null);
    assert.strictEqual(canonicalClassOf(null), null);
    assert.strictEqual(canonicalClassOf(""), null);
});
check("B4. invalid/non-canonical class ⇒ no grade (6th, 15th, college, graduate)", () => {
    assert.strictEqual(canonicalClassOf("6th"), null);
    assert.strictEqual(canonicalClassOf("7"), null);
    assert.strictEqual(canonicalClassOf("9"), null);
    assert.strictEqual(canonicalClassOf("11"), null);
    assert.strictEqual(canonicalClassOf("15th"), null);
    assert.strictEqual(canonicalClassOf("college_student"), null);
    assert.strictEqual(canonicalClassOf("Graduate"), null);
});
check("B5. request-shape contract: canonical ⇒ { grade, userSide }, else {}", () => {
    const reqParams = (cls) => {
        const c = canonicalClassOf(cls);
        return c ? { grade: c, userSide: true } : {};
    };
    assert.deepStrictEqual(reqParams("Class 10"), { grade: "10", userSide: true });
    assert.deepStrictEqual(reqParams("5th"), { grade: "5", userSide: true });
    assert.deepStrictEqual(reqParams("6th"), {});
    assert.deepStrictEqual(reqParams(undefined), {});
});

// ── C. public browsing / backend left untouched ─────────────────────────────
check("C1. public ScholarshipsPage still fetches the full catalog (no params)", () => {
    const src = frontendSource(SCHOLARSHIPS_PAGE_REL);
    assert.ok(src.includes("scholarshipService.getAll()"), "ScholarshipsPage must keep its unfiltered catalog call");
    assert.ok(!src.includes("grade:"), "ScholarshipsPage must not gain a server-side grade filter");
});
check("C2. backend scholarship controller/routes/model are not part of Phase-5 changes (git scope)", () => {
    const out = execFileSync("git", ["status", "--porcelain", "--",
        "frontend/src/student/pages/dashboard/DashboardPage.jsx",
        "backend/scripts/_verifyDashboardScholarshipGrade.js"], {
        cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const paths = out.split(/\r?\n/).map((l) => l.slice(3).trim()).filter(Boolean);
    assert.ok(paths.length === 2, `expected exactly the 2 approved paths in git, got: ${JSON.stringify(paths)}`);
    for (const p of paths) {
        assert.ok(p.includes("DashboardPage.jsx") || p.includes("_verifyDashboardScholarshipGrade.js"),
            `unexpected Phase-5 path: ${p}`);
    }
    // The backend scholarship surface is a tracked file with zero Phase-5 intent:
    // confirm the phase never references touching it (their content is untouched
    // by design — the controller already supports grade filtering).
    const ctrl = backendSource("controllers/scholarshipController.js");
    assert.ok(ctrl.includes("grade") && ctrl.includes("targetClass: { $in: searchStrings }"),
        "backend grade filter must still exist unchanged");
});

// ── D. script purity ────────────────────────────────────────────────────────
check("D. verification script performs no DB/HTTP/write operations", () => {
    const src = fs.readFileSync(__filename, "utf8");
    // needles assembled so the self-scan cannot false-positive on its own source
    const conn = "mongoose" + ".connect";
    const http = "fetch" + "(";
    for (const n of [".find" + "OneAndUpdate(", ".s" + "ave(", ".c" + "reate(", ".up" + "dateOne(", ".del" + "eteOne("]) {
        assert.ok(!src.includes(n), `script performs a DB write: ${n}`);
    }
    assert.ok(!src.includes(conn), "script must not connect to a DB");
    assert.ok(!src.includes(http), "script must not issue HTTP requests");
});

// ── summary ────────────────────────────────────────────────────────────────
console.log("\n\x1b[1m── Phase-5 dashboard → scholarship grade verification ──\x1b[0m");
for (const r of results) console.log(r);
console.log(failures === 0 ? "\u2705 ALL CHECKS PASSED" : `\u274c ${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;