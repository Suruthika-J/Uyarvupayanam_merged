// backend/scripts/_verifyOwnership.js
//
// Phase-2 standalone verification for the verifyOwnership middleware.
// PURE AND READ-ONLY: no database connection, no data writes — req/res are
// mocked, and module imports only prove loadability.
//
// Run from repo root:  node backend/scripts/_verifyOwnership.js
//
// Coverage:
//   1. verifyOwnership unit matrix (match → next(); mismatch/missing → 403)
//   2. Module loadability of the three secured route files and the affected
//      controllers (imports only, no DB writes)
"use strict";

const assert = require("assert");

const verifyOwnership = require("../middleware/verifyOwnership");

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

// ── mocks (no Express, no Mongoose, no DB) ─────────────────────────────────
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

function runMiddleware(paramName, req) {
  const middleware = verifyOwnership(paramName);
  const res = makeRes();
  let nextCalled = false;
  middleware(req, res, () => {
    nextCalled = true;
  });
  return { res, nextCalled };
}

const OWNER_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439099";

// ── 1. middleware unit matrix ─────────────────────────────────────────────
check("matching :userId → next() called, no response sent", () => {
  const { res, nextCalled } = runMiddleware("userId", {
    params: { userId: OWNER_ID },
    student: { _id: OWNER_ID },
  });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.statusCode, null);
  assert.strictEqual(res.body, null);
});

check("matching :studentId → next() called (LD result route param)", () => {
  const { res, nextCalled } = runMiddleware("studentId", {
    params: { studentId: OWNER_ID },
    student: { _id: OWNER_ID },
  });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.statusCode, null);
});

check("mismatched :userId → 403 generic, next() NOT called", () => {
  const { res, nextCalled } = runMiddleware("userId", {
    params: { userId: OTHER_ID },
    student: { _id: OWNER_ID },
  });
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
  assert.deepStrictEqual(res.body, { success: false, message: "Access denied" });
});

check("mismatched :studentId → 403 generic (no existence leak)", () => {
  const { res, nextCalled } = runMiddleware("studentId", {
    params: { studentId: OWNER_ID },
    student: { _id: OTHER_ID },
  });
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
  assert.deepStrictEqual(res.body, { success: false, message: "Access denied" });
});

check("missing param → 403", () => {
  const { res, nextCalled } = runMiddleware("userId", {
    params: {},
    student: { _id: OWNER_ID },
  });
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
});

check("req.student missing (defensive; verifyStudent would 401 first) → 403", () => {
  const { res, nextCalled } = runMiddleware("userId", {
    params: { userId: OWNER_ID },
  });
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
});

// ── 2. module loadability (imports only; no DB writes) ────────────────────
const LOAD_TARGETS = {
  verifyOwnership: "../middleware/verifyOwnership",
  onboardingRoutes: "../routes/onboardingRoutes",
  notificationRoutes: "../routes/notificationRoutes",
  mentorRequestRoutes: "../routes/mentorRequestRoutes",
  onboardingController: "../controllers/onboardingController",
  onboardingAssessmentController: "../controllers/onboardingAssessmentController",
  learningDiagnosisController: "../controllers/learningDiagnosisController",
  notificationController: "../controllers/notificationController",
  mentorRequestController: "../controllers/mentorRequestController",
};

const loaded = {};
const loadErrors = [];
for (const [name, file] of Object.entries(LOAD_TARGETS)) {
  try {
    loaded[name] = require(file);
  } catch (err) {
    loadErrors.push(`${name} → ${err.message}`);
  }
}

check("no module load errors", () => {
  assert.ok(loadErrors.length === 0, `load errors: ${loadErrors.join(" | ")}`);
});

check("verifyOwnership factory returns middleware", () => {
  assert.strictEqual(typeof verifyOwnership, "function");
  assert.strictEqual(typeof verifyOwnership("userId"), "function");
  assert.strictEqual(typeof verifyOwnership("studentId"), "function");
});

check("affected controllers still export their handlers", () => {
  const c = (name, fn) => assert.strictEqual(typeof loaded[name][fn], "function", `${name}.${fn}`);
  c("onboardingController", "getRecommendations");
  c("onboardingController", "retakeAssessment");
  c("onboardingAssessmentController", "getLatestResponse");
  c("learningDiagnosisController", "getDiagnosticResult");
  c("notificationController", "getUserNotifications");
  c("notificationController", "markAllAsRead");
  c("notificationController", "getNotificationById");
  c("notificationController", "markAsRead");
  c("mentorRequestController", "getUserMentorRequests");
});

// ── summary ────────────────────────────────────────────────────────────────
console.log("\n\x1b[1m── Phase-2 verifyOwnership verification ──\x1b[0m");
for (const r of results) console.log(r);
if (loadErrors.length) {
  console.log("\nLoad errors encountered:");
  for (const e of loadErrors) console.log(`  ${e}`);
}
console.log(
  failures === 0
    ? "\u2705 ALL CHECKS PASSED"
    : `\u274c ${failures} CHECK(S) FAILED`
);
process.exitCode = failures === 0 ? 0 : 1;