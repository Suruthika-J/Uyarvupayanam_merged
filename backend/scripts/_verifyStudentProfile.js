// backend/scripts/_verifyStudentProfile.js
//
// Phase-3 standalone verification for the StudentProfile persistence layer.
//
// PURE AND READ-ONLY: no DB connection, no HTTP calls, no writes. It loads the
// new modules (loadability), introspects the registered Express routes
// (GET/PUT /profile = verifyStudent → controller, no id params), statically
// verifies the ownership boundary and upsert/partial-update guarantees in the
// sources, exercises the pure helpers at runtime, and checks that the LD and
// legacy onboarding flows invoke the profile sync.
//
// Run from repo root:  node backend/scripts/_verifyStudentProfile.js
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

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

// ── module loading (loadability — no DB) ──────────────────────────────────
const StudentProfile = require("../models/StudentProfile");
const studentProfileSync = require("../utils/studentProfileSync");
const studentProfileController = require("../controllers/studentProfileController");
const studentRoutes = require("../routes/studentRoutes");
const learningDiagnosisController = require("../controllers/learningDiagnosisController");
const onboardingController = require("../controllers/onboardingController");

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
function routeLayers(router, routePath) {
    return router.stack.filter((l) => l.route && l.route.path === routePath);
}

// ── 1. model + 2. routes + 3. controller load without DB ───────────────────
check("1. model StudentProfile loads without DB", () => {
    assert.ok(StudentProfile, "StudentProfile model did not load");
    assert.ok(StudentProfile.collection, "StudentProfile collection name missing");
    assert.strictEqual(StudentProfile.collection.collectionName, "studentprofiles");
});
check("2. studentRoutes load without DB", () => {
    assert.ok(studentRoutes, "studentRoutes did not load");
    assert.ok(Array.isArray(studentRoutes.stack) && studentRoutes.stack.length > 0);
});
check("3. controllers + sync util load without DB", () => {
    assert.strictEqual(typeof studentProfileController.getStudentProfile, "function");
    assert.strictEqual(typeof studentProfileController.updateStudentProfile, "function");
    assert.strictEqual(typeof studentProfileSync.upsertStudentProfile, "function");
    assert.ok(learningDiagnosisController.submitDiagnostic, "learningDiagnosisController did not load");
    assert.ok(onboardingController.submitOnboarding, "onboardingController did not load");
});

// ── 4/5. route stacks: verifyStudent → controller (exactly 2 handlers) ─────
function expectProfileRoute(method, expectedHandler, label) {
    const layers = routeLayers(studentRoutes, "/profile");
    const layer = layers.find((l) => l.route.methods[method]);
    assert.ok(layer, `${label}: no ${method} /profile route`);
    const handlers = layer.route.stack.map((s) => s.handle);
    assert.strictEqual(handlers.length, 2, `${label}: expected [verifyStudent, controller], got ${handlers.length}`);
    assert.strictEqual(handlers[0].name, "verifyStudent", `${label}: first handler is not verifyStudent`);
    assert.strictEqual(handlers[1], expectedHandler, `${label}: handler is not the exported controller`);
}
check("4. GET /profile = verifyStudent → handler", () => {
    expectProfileRoute("get", studentProfileController.getStudentProfile, "GET /profile");
});
check("5. PUT /profile = verifyStudent → handler", () => {
    expectProfileRoute("put", studentProfileController.updateStudentProfile, "PUT /profile");
});

// ── 6. no profile route accepts userId/studentId params ────────────────────
check("6. no profile route accepts userId/studentId params", () => {
    const layers = studentRoutes.stack.filter((l) => l.route && String(l.route.path).includes("profile"));
    assert.ok(layers.length >= 2, "expected at least the two /profile routes");
    for (const l of layers) {
        assert.ok(!l.route.path.includes(":"), `route path must not contain params: ${l.route.path}`);
    }
    assert.ok(!sourceFile("routes/studentRoutes.js").includes("profile/:userId"));
    assert.ok(!sourceFile("routes/studentRoutes.js").includes("profile/:studentId"));
});

// ── 7/8. ownership derived from req.student._id; body id not trusted ───────
check("7. controller derives ownership from req.student._id", () => {
    const put = exportRegion(sourceFile("controllers/studentProfileController.js"), "updateStudentProfile");
    assert.ok(put.includes("req.student._id"), "updateStudentProfile missing req.student._id");
    const get = exportRegion(sourceFile("controllers/studentProfileController.js"), "getStudentProfile");
    assert.ok(get.includes("req.student._id"), "getStudentProfile missing req.student._id");
});
check("8. body userId/studentId is not trusted by the profile API", () => {
    const src = sourceFile("controllers/studentProfileController.js");
    assert.ok(!src.includes("req.body.userId"), "controller reads req.body.userId");
    assert.ok(!src.includes("req.body.studentId"), "controller reads req.body.studentId");
    assert.ok(!src.includes("req.params.userId"), "controller reads req.params.userId");
    assert.ok(!src.includes("req.params.studentId"), "controller reads req.params.studentId");
    const sync = sourceFile("utils/studentProfileSync.js");
    assert.ok(!sync.includes("PROFILE_FIELDS.includes(\"userId\")") && !sync.includes("\"userId\""), "sync util whitelist must not include userId");
});

// ── 9. exactly ONE unique index strategy on userId ─────────────────────────
check("9. StudentProfile userId has exactly one unique index strategy (field-level only)", () => {
    const modelSrc = sourceFile("models/StudentProfile.js");
    assert.ok(modelSrc.includes("unique: true"), "field-level unique:true missing on userId");
    assert.ok(!modelSrc.includes("Schema.index("), "duplicate schema.index() call found");
    assert.ok(!modelSrc.includes("studentProfileSchema.index("), "separate index() declaration found (duplicate strategy)");
});

// ── 10. upsert prevents duplicate profiles ─────────────────────────────────
check("10. sync upsert prevents duplicate profiles", () => {
    const syncSrc = sourceFile("utils/studentProfileSync.js");
    assert.ok(syncSrc.includes("findOneAndUpdate"), "missing findOneAndUpdate");
    assert.ok(syncSrc.includes("upsert: true"), "missing upsert: true");
    assert.ok(syncSrc.includes("{ userId }"), "filter is not by userId");
    // Field-level unique index backs the upsert at the DB level too.
    const modelSrc = sourceFile("models/StudentProfile.js");
    assert.ok(modelSrc.includes("required: true") && modelSrc.includes("unique: true"));
});

// ── 11. partial updates preserve unspecified fields ────────────────────────
check("11. partial updates preserve unspecified fields (undefined dropped, $set only for provided)", () => {
    const syncSrc = sourceFile("utils/studentProfileSync.js");
    assert.ok(syncSrc.includes("$set:"), "missing $set");
    assert.ok(syncSrc.includes("$setOnInsert:"), "missing $setOnInsert");
    assert.ok(syncSrc.includes("fields[key] === undefined") && syncSrc.includes("continue"),
        "undefined keys must be skipped (preserve stored value)");
});

// ── 12. subject normalization works (pure runtime) ─────────────────────────
check("12. subject normalization works", () => {
    const { normalizeSubjectList, pickProfileFields } = studentProfileSync;
    assert.deepStrictEqual(normalizeSubjectList(" Maths,  , Science ,"), ["Maths", "Science"]);
    assert.deepStrictEqual(normalizeSubjectList([" A ", "", "B", "  "]), ["A", "B"]);
    assert.strictEqual(normalizeSubjectList(""), undefined);
    assert.strictEqual(normalizeSubjectList(undefined), undefined);
    assert.deepStrictEqual(normalizeSubjectList("Physics"), ["Physics"]);
});
check("12b. pickProfileFields: whitelist + trim + unknown-key ignore", () => {
    const { pickProfileFields } = studentProfileSync;
    const out = pickProfileFields({
        schoolName: "  Green Valley  ",
        strongSubjects: " Maths, English ",
        careerInterest: "Engineer",
        marksPercentage: 85,
        userId: "507f1f77bcf86cd799439011",
        studentId: "507f1f77bcf86cd799439011",
        totallyUnknown: "x",
    });
    assert.deepStrictEqual(out, {
        schoolName: "Green Valley",
        strongSubjects: ["Maths", "English"],
        careerInterest: "Engineer",
        marksPercentage: 85,
    });
    assert.ok(!("userId" in out) && !("studentId" in out) && !("totallyUnknown" in out));
});
check("12c. pickProfileFields: undefined preserves, empty string clears", () => {
    const { pickProfileFields } = studentProfileSync;
    assert.deepStrictEqual(pickProfileFields({ careerInterest: undefined }).careerInterest, undefined);
    assert.deepStrictEqual(pickProfileFields({ careerInterest: "" }), { careerInterest: "" });
});

// ── 13/14. onboarding flows invoke profile sync ────────────────────────────
check("13. LD controller (submitDiagnostic) invokes profile sync", () => {
    const src = sourceFile("controllers/learningDiagnosisController.js");
    assert.ok(src.includes("upsertStudentProfile"), "LD controller missing sync call");
    assert.ok(src.includes("legacyFields"), "LD controller missing legacyFields pass-through");
});
check("14. legacy onboarding (submitOnboarding) invokes profile sync", () => {
    const src = sourceFile("controllers/onboardingController.js");
    assert.ok(src.includes("upsertStudentProfile"), "onboarding controller missing sync call");
});

// ── 15. GET profile contains no write operation ────────────────────────────
check("15. GET student profile is read-only (no write ops)", () => {
    const get = exportRegion(sourceFile("controllers/studentProfileController.js"), "getStudentProfile");
    // The save-op needle is assembled so the literal never appears in this
    // script's source (check 16's purity self-scan must not false-positive).
    for (const bad of ["findByIdAndUpdate", "updateOne", "findOneAndUpdate", "deleteOne", "insertMany", "s" + "ave("]) {
        assert.ok(!get.includes(bad), `GET handler contains ${bad}`);
    }
    assert.ok(get.includes("findOne({ userId })"), "GET handler must read via findOne({ userId })");
});

// ── 16. no DB write performed by this script ───────────────────────────────
check("16. verification script is pure (no DB/HTTP/writes)", () => {
    const script = __filename;
    const src = fs.readFileSync(script, "utf8");

    // Needles are assembled dynamically so the script's own source never
    // contains the verbatim patterns it is searching for (self-match trap).
    const connA = "mongoose" + ".connect";
    const connB = "create" + "Connection";
    assert.ok(!src.includes(connA) && !src.includes(connB), "script must not connect to a DB");

    const http1 = "fetch" + "(";
    const http2 = "ax" + "ios";
    assert.ok(!src.includes(http1), "script must not issue HTTP requests");
    assert.ok(!src.includes(http2), "script must not use an HTTP client library");

    for (const n of [".find" + "OneAndUpdate(", ".s" + "ave(", ".c" + "reate("]) {
        assert.ok(!src.includes(n), `script performs a DB write: ${n}`);
    }
});

// ── summary ────────────────────────────────────────────────────────────────
console.log("\n\x1b[1m── Phase-3 StudentProfile verification ──\x1b[0m");
for (const r of results) console.log(r);
console.log(failures === 0 ? "\u2705 ALL CHECKS PASSED" : `\u274c ${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;