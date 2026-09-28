// backend/scripts/_verifyResultEndpoints.js
//
// Phase-2.5 standalone verification for the two result endpoints:
//   GET /api/onboarding/result/:studentId  → getOnboardingResult
//   GET /api/assessment/result/:userId     → getLatestResult
//
// PURE AND READ-ONLY: no DB connection, no HTTP calls, no writes. It inspects
// the registered Express route stacks (static), exercises the ownership guard
// middleware that is actually wired into the routes (mocked req/res), checks
// the controller sources for the ID-derivation and no-mutation guarantees, and
// confirms module loadability.
//
// Run from repo root:  node backend/scripts/_verifyResultEndpoints.js
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
const onboardingRoutes = require("../routes/onboardingRoutes");
const assessmentRoutes = require("../routes/assessmentRoutes");
const onboardingAssessmentController = require("../controllers/onboardingAssessmentController");
const assessmentController = require("../controllers/assessmentController");

// ── helpers ────────────────────────────────────────────────────────────────
// Extracts the flat list of handler functions registered for one route path.
function routeHandlers(router, routePath) {
  const layer = router.stack.find((l) => l.route && l.route.path === routePath);
  if (!layer) return null;
  return layer.route.stack.map((s) => s.handle);
}

function controllerSource(controllerFile, exportName) {
  const src = fs.readFileSync(path.join(__dirname, "..", "controllers", controllerFile), "utf8");
  const start = src.indexOf(`exports.${exportName}`);
  const end = src.indexOf("exports.", start + 10);
  return src.slice(start, end === -1 ? undefined : end);
}

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

// Ownership guard accepts (req, res, next) — drive it with mocks.
function expectOwnershipGuard403(guard) {
  assert.strictEqual(guard.length, 3, "guard should be (req, res, next)");
  const res = makeRes();
  let nextCalled = false;
  guard(
    { params: { studentId: "507f1f77bcf86cd799439099" }, student: { _id: "507f1f77bcf86cd799439011" } },
    res,
    () => {
      nextCalled = true;
    }
  );
  assert.strictEqual(res.statusCode, 403, "mismatched ID must be 403");
  assert.deepStrictEqual(res.body, { success: false, message: "Access denied" });
  assert.strictEqual(nextCalled, false, "next() must not be called on mismatch");
}

// ── TARGET 1: GET /api/onboarding/result/:studentId ─────────────────────────
check("loadability: modules loaded", () => {
  assert.ok(onboardingRoutes, "onboardingRoutes did not load");
  assert.ok(assessmentRoutes, "assessmentRoutes did not load");
  assert.ok(onboardingAssessmentController, "onboardingAssessmentController did not load");
  assert.ok(assessmentController, "assessmentController did not load");
});

check("onboarding /result/:studentId is registered with exactly 3 handlers", () => {
  const handlers = routeHandlers(onboardingRoutes, "/result/:studentId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(handlers.length, 3, `expected [verifyStudent, ownership, controller], got ${handlers.length}`);
});

check("onboarding /result/:studentId chain: verifyStudent runs first", () => {
  const handlers = routeHandlers(onboardingRoutes, "/result/:studentId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(handlers[0].name, "verifyStudent");
});

check("onboarding /result/:studentId chain: ownership guard runs second and 403s on mismatch", () => {
  const handlers = routeHandlers(onboardingRoutes, "/result/:studentId");
  assert.ok(handlers, "route layer not found");
  expectOwnershipGuard403(handlers[1]);
});

check("onboarding /result/:studentId chain: controller is getOnboardingResult", () => {
  const handlers = routeHandlers(onboardingRoutes, "/result/:studentId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(
    handlers[2],
    onboardingAssessmentController.getOnboardingResult,
    "route handler is not the exported getOnboardingResult"
  );
});

check("getOnboardingResult derives the ID from req.student._id (no param trust)", () => {
  const fn = controllerSource("onboardingAssessmentController.js", "getOnboardingResult");
  assert.ok(fn.includes("req.student._id"), "missing req.student._id derivation");
  assert.ok(!fn.includes("req.params"), "still trusts req.params");
});

check("getOnboardingResult no longer mutates User records (read-only)", () => {
  const fn = controllerSource("onboardingAssessmentController.js", "getOnboardingResult");
  assert.ok(
    !fn.includes("findByIdAndUpdate") && !fn.includes("updateOne") && !fn.includes("save("),
    "GET handler still contains a mutation call"
  );
});

// ── TARGET 2: GET /api/assessment/result/:userId ───────────────────────────
check("assessment /result/:userId is registered with exactly 3 handlers", () => {
  const handlers = routeHandlers(assessmentRoutes, "/result/:userId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(handlers.length, 3, `expected [verifyStudent, ownership, controller], got ${handlers.length}`);
});

check("assessment /result/:userId chain: verifyStudent runs first", () => {
  const handlers = routeHandlers(assessmentRoutes, "/result/:userId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(handlers[0].name, "verifyStudent");
});

check("assessment /result/:userId chain: ownership guard runs second and 403s on mismatch", () => {
  const handlers = routeHandlers(assessmentRoutes, "/result/:userId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(handlers[1].length, 3, "guard should be (req, res, next)");
  const res = makeRes();
  let nextCalled = false;
  handlers[1](
    { params: { userId: "507f1f77bcf86cd799439099" }, student: { _id: "507f1f77bcf86cd799439011" } },
    res,
    () => {
      nextCalled = true;
    }
  );
  assert.strictEqual(res.statusCode, 403, "mismatched ID must be 403");
  assert.deepStrictEqual(res.body, { success: false, message: "Access denied" });
  assert.strictEqual(nextCalled, false);
});

check("assessment /result/:userId chain: controller is getLatestResult", () => {
  const handlers = routeHandlers(assessmentRoutes, "/result/:userId");
  assert.ok(handlers, "route layer not found");
  assert.strictEqual(
    handlers[2],
    assessmentController.getLatestResult,
    "route handler is not the exported getLatestResult"
  );
});

check("getLatestResult queries with req.student._id (no param trust)", () => {
  const fn = controllerSource("assessmentController.js", "getLatestResult");
  assert.ok(fn.includes("req.student._id"), "missing req.student._id derivation");
  assert.ok(!fn.includes("req.params"), "still trusts req.params");
});

// ── exports intact ─────────────────────────────────────────────────────────
check("affected controller exports remain intact", () => {
  assert.strictEqual(typeof onboardingAssessmentController.getOnboardingResult, "function");
  assert.strictEqual(typeof onboardingAssessmentController.getLatestResponse, "function");
  assert.strictEqual(typeof onboardingAssessmentController.generateAssessment, "function");
  assert.strictEqual(typeof assessmentController.getLatestResult, "function");
  assert.strictEqual(typeof assessmentController.getQuestionsByLevel, "function");
  assert.strictEqual(typeof assessmentController.submitAssessment, "function");
});

// ── summary ────────────────────────────────────────────────────────────────
console.log("\n\x1b[1m── Phase-2.5 result-endpoint verification ──\x1b[0m");
for (const r of results) console.log(r);
console.log(
  failures === 0
    ? "\u2705 ALL CHECKS PASSED"
    : `\u274c ${failures} CHECK(S) FAILED`
);
process.exitCode = failures === 0 ? 0 : 1;