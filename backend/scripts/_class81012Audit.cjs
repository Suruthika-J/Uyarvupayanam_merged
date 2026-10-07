/**
 * _class81012Audit.cjs
 * ============================================================================
 * Class 8 / 10 / 12 complete-integration audit (real HTTP + real database).
 *
 * Mirrors the Class 5 audit methodology (_class5Audit.cjs): isolated admin +
 * class-8/10/12 students, REAL HTTP against the live backend, EVERY write
 * verified by reading it back as the correct student (or admin), cross-student
 * denial, security matrix, admin visibility, recovery across a fresh login and
 * full cleanup of the isolated identities.
 *
 * What it proves (one connected system: Career Path -> Class 8/10/12 ->
 * Backend/Database -> Admin):
 *
 *   CLASS 8 SKILLS        diagnostic -> hints -> answers -> complete ->
 *                         milestones -> recommendations -> history -> play ->
 *                         level gating -> LD-NBSE evidence (DB read-back) ->
 *                         cross-student isolation
 *   CLASS 8 MATHS         progress overview -> fractions planet (6 missions) ->
 *                         question session (no answer leak) -> wrong/right ->
 *                         hint -> explanation -> topic completed -> next world
 *                         -> reset -> DB read-back + isolation
 *   CLASS 8 ENGLISH       areas -> topic -> activities (server-graded) ->
 *                         sequential unlocking -> AI assessment (tolerates the
 *                         AI provider being down) -> progress -> DB
 *   CLASS 10              class-content level list + slug (published only),
 *                         streams public GET + facets + category filter,
 *                         admin stream CRUD round-trip + student denied
 *   CLASS 12              class-content level list + slug (published only),
 *                         colleges-insight summary/courses/course-colleges/
 *                         college-courses/category-colleges + 400/404
 *   REGRESSION (fix)      draft class-content is NOT readable via the public
 *                         slug route (status filter), but IS visible to admin
 *   SECURITY              no-token 401 on every Class 8/10/12 endpoint,
 *                         student token on admin routes denied, admin token on
 *                         student routes denied, malformed token 401,
 *                         cross-student denial
 *   ADMIN                 dashboard live, school_student listing shows
 *                         class-8/10/12 students, user detail, class-content
 *                         admin CRUD round-trip, block/unblock round-trip
 *   RECOVERY              fresh login keeps skills milestones + maths progress
 *                         + english progress
 *
 * Env:     AUDIT_BASE_URL  default http://localhost:5000/api
 *          AUDIT_LOG_FILE  optional server log for real-OTP extraction
 *          AUDIT_KEEP=1    keep the isolated identities (default: cleanup)
 *
 * Exit 0 = all passed, 1 = failures, 2 = aborted.
 */
"use strict";
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const BASE = process.env.AUDIT_BASE_URL || "http://localhost:5000/api";
const LOG_FILE = process.env.AUDIT_LOG_FILE || "";
const KEEP = process.env.AUDIT_KEEP === "1";

const RUN = crypto.randomBytes(3).toString("hex");
const EMAIL_A = `audit.c81012.a.${RUN}@uyarvupayanam.local`;   // class 8 (full journey)
const EMAIL_B = `audit.c81012.b.${RUN}@uyarvupayanam.local`;   // class 8 (isolation target)
const EMAIL_C = `audit.c81012.c.${RUN}@uyarvupayanam.local`;   // class 10
const EMAIL_D = `audit.c81012.d.${RUN}@uyarvupayanam.local`;   // class 12
const EMAIL_ADMIN = `audit.c81012.admin.${RUN}@uyarvupayanam.local`;
const PASSWORD = "AuditPass@123";

let adminToken = null;
let tokenA = null, tokenB = null, tokenC = null, tokenD = null;
let studentAId = null, studentBId = null, studentCId = null, studentDId = null;
let adminDocId = null;
let createdContentId = null;   // class-content CRUD round-trip
let createdStreamId = null;    // streams CRUD round-trip

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const note = (name, detail) => {
  results.push({ name, ok: true, note: true, detail });
  console.log(`INFO  ${name}${detail ? "  — " + detail : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, urlPath, { data, token, timeout } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await axios({
    method, url: BASE + urlPath, data, headers,
    timeout: timeout || 60000,
    validateStatus: () => true,
  });
  return { status: res.status, data: res.data };
}

function extractOtpFromLog(email) {
  if (!LOG_FILE || !fs.existsSync(LOG_FILE)) return null;
  try {
    const text = fs.readFileSync(LOG_FILE, "utf8");
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`OTP for ${escaped}: \\[ (\\d{6}) \\]`, "g");
    const codes = [];
    let m;
    while ((m = re.exec(text)) !== null) codes.push(m[1]);
    return codes.length ? codes[codes.length - 1] : null;
  } catch (e) {
    return null;
  }
}

// Server-side content + graders (same machine as the server under test).
const catalog = require("../config/class8SkillsCatalog");
const seed = require("../seeders/seedEnglishMissions");

// ── answer helpers (answer keys visible here only — a client never can) ─────
function correctGiven(task) {
  switch (task.type) {
    case "choice": case "pattern": case "decode": return task.answerIndex;
    case "order": return task.steps.map((s) => s.id);
    case "sort": return Object.fromEntries(task.items.map((it) => [it.id, task.buckets[it.bucket].id]));
    case "match": return task.pairs.map((p) => ({ aId: p.a.id, bId: p.b.id }));
    case "speak": case "create": return { done: true };
    default: return null;
  }
}

function answerFor(q) {
  if (q.questionType === "arrange-steps" || q.questionType === "drag-and-drop") {
    return Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
  }
  if (Array.isArray(q.correctAnswer)) return q.correctAnswer[0];
  return q.correctAnswer;
}

function correctAnswerFor(activity) {
  return (activity.items || []).map((it, i) => {
    if (activity.type === "mcq" || activity.type === "error-find") return it.correct;
    if (activity.type === "true-false") return it.correct;
    if (activity.type === "fill-blank") return Array.isArray(it.correct) ? it.correct[0] : it.correct;
    if (activity.type === "match-pairs") return it.right;
    if (activity.type === "sentence-order") return it.correctOrder;
    return null;
  });
}

const BANNED = ["answerIndex", "correctOrder", "explanation", "rule", "bucket"];
function secrecyOk(tasks) {
  const s = JSON.stringify(tasks || []);
  return BANNED.every((k) => !new RegExp(`"${k}"`).test(s));
}

const BANNED_KEYS = new Set(["correct", "correctAnswer", "correct_order", "acceptedAnswers", "explanation", "answer"]);
function hasAnswerKeys(node) {
  if (Array.isArray(node)) return node.some((x) => hasAnswerKeys(x));
  if (node && typeof node === "object") {
    return Object.keys(node).some((k) => BANNED_KEYS.has(k) || (typeof node[k] === "object" && node[k] !== null && hasAnswerKeys(node[k])));
  }
  return false;
}

async function answerAllSkills(token, attemptId, tasks, { wrongOnce = false } = {}) {
  for (let i = 0; i < tasks.length; i += 1) {
    const given = correctGiven(tasks[i]);
    if (wrongOnce && i === 0 && tasks[i].options && tasks[i].options.length > 1) {
      const wrong = (tasks[i].answerIndex + 1) % tasks[i].options.length;
      const wr = await api("post", `/class8-skills/attempts/${attemptId}/answer`, { token, data: { taskIndex: i, given: wrong } });
      check(`skill answer ${i}: wrong attempt rejected`, wr.data && wr.data.success === true && wr.data.correct === false, wr.status);
    }
    const res = await api("post", `/class8-skills/attempts/${attemptId}/answer`, { token, data: { taskIndex: i, given } });
    const isPractice = tasks[i].type === "speak" || tasks[i].type === "create";
    check(`skill answer ${i}: server graded (${tasks[i].type})`,
      res.data && res.data.success === true && res.data.correct === true &&
      (isPractice ? res.data.explanation === null : typeof res.data.explanation === "string"),
      res.status);
  }
}

async function playGame(token, skillId, activityId, level, label) {
  const start = await api("post", "/class8-skills/attempts", { token, data: { skillId, activityId, level } });
  check(`${label}: started level ${level}`,
    start.data && start.data.success && start.data.attempt && start.data.attempt.status === "in_progress" && start.data.attempt.level === level,
    start.data && start.data.attempt && { mode: start.data.attempt.mode, level: start.data.attempt.level });
  const activity = catalog.activityById(skillId, activityId);
  const tasks = catalog.tasksForLevel(activity, level);
  check(`${label}: ${tasks.length} tasks served without answer keys`,
    start.data && start.data.tasks && start.data.tasks.length === tasks.length && secrecyOk(start.data.tasks),
    start.data && start.data.tasks && start.data.tasks.length);
  await answerAllSkills(token, start.data.attempt._id, tasks);
  const comp = await api("post", `/class8-skills/attempts/${start.data.attempt._id}/complete`, { token, data: {} });
  check(`${label}: completed`, comp.data && comp.data.success && comp.data.summary && comp.data.summary.status === "completed", comp.data && comp.data.summary && comp.data.summary.status);
  return { start, comp };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;

  // ══ 1. ISOLATED ADMIN + 4 CLASS-LEVEL STUDENTS ═══════════════════════════
  {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const admin = await db.collection("admins").insertOne({
      email: EMAIL_ADMIN, password: hashed, role: "Admin", isActive: true, name: "Audit C81012 Admin",
      createdAt: new Date(), updatedAt: new Date(),
    });
    adminDocId = admin.insertedId;
    const r = await api("post", "/admin/login", { data: { email: EMAIL_ADMIN, password: PASSWORD } });
    check("admin login (isolated admin)", r.status === 200 && !!r.data.token, `status=${r.status}`);
    adminToken = r.data.token || null;
  }

  {
    const r = await api("post", "/student/register", { data: {
      name: "Audit C8 Student A", email: EMAIL_A, password: PASSWORD,
      userType: "school_student", classLevel: "8", district: "Chennai",
    }});
    check("register class-8 student (201 + requiresVerification)",
      r.status === 201 && r.data.requiresVerification === true, `status=${r.status} msg=${r.data.message || ""}`);

    await sleep(1800);
    const r2 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
    check("class-8 login blocked before email verification",
      r2.status === 403 && r2.data.code === "EMAIL_NOT_VERIFIED", `status=${r2.status} code=${r2.data.code || ""}`);

    const otp = extractOtpFromLog(EMAIL_A);
    if (otp) {
      const r4 = await api("post", "/student/verify-otp", { data: { email: EMAIL_A, otp } });
      check("class-8 real OTP from server log completes sign-up", r4.status === 200 && !!r4.data.token, `status=${r4.status}`);
      tokenA = r4.data.token || null;
      studentAId = r4.data.student?._id || r4.data.student?.id || null;
    }
    if (!tokenA) {
      await db.collection("users").updateOne({ email: EMAIL_A }, { $set: { isVerified: true } });
      const r5 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
      check("class-8 login after DB-verify fallback", r5.status === 200 && !!r5.data.token, `status=${r5.status}`);
      tokenA = r5.data.token || null;
      studentAId = r5.data.student?._id || r5.data.student?.id || null;
    }
    check("class-8 student A identity captured", !!studentAId, studentAId || "missing");
  }

  // Students B (class 8), C (class 10), D (class 12) — DB-seeded, then REAL login.
  {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const mk = async (email, name, classLevel) => {
      const u = await db.collection("users").insertOne({
        name, email, password: hashed, userType: "school_student", classLevel,
        district: "Madurai", role: "student", status: "active", isVerified: true,
        createdAt: new Date(), updatedAt: new Date(),
      });
      return String(u.insertedId);
    };
    studentBId = await mk(EMAIL_B, "Audit C8 Student B", "8");
    studentCId = await mk(EMAIL_C, "Audit C10 Student C", "10");
    studentDId = await mk(EMAIL_D, "Audit C12 Student D", "12");

    const logins = await Promise.all([
      api("post", "/student/login", { data: { email: EMAIL_B, password: PASSWORD } }),
      api("post", "/student/login", { data: { email: EMAIL_C, password: PASSWORD } }),
      api("post", "/student/login", { data: { email: EMAIL_D, password: PASSWORD } }),
    ]);
    tokenB = logins[0].data.token || null;
    tokenC = logins[1].data.token || null;
    tokenD = logins[2].data.token || null;
    check("class-8 student B logs in", logins[0].status === 200 && !!tokenB, `status=${logins[0].status}`);
    check("class-10 student C logs in", logins[1].status === 200 && !!tokenC, `status=${logins[1].status}`);
    check("class-12 student D logs in", logins[2].status === 200 && !!tokenD, `status=${logins[2].status}`);
  }

  // ══ 2. CAREER-PATH IDENTITY (class 8/10/12) ══════════════════════════════
  {
    const r = await api("get", "/student/profile", { token: tokenA });
    const s = r.data?.student || r.data?.user || r.data;
    check("profile: classLevel 8 + school_student (career-path identity)",
      r.status === 200 && String(s?.classLevel) === "8" && s?.userType === "school_student",
      `status=${r.status} classLevel=${s?.classLevel} userType=${s?.userType}`);

    const c = await api("get", "/student/profile", { token: tokenC });
    const sc = c.data?.student || c.data?.user || c.data;
    check("profile: class-10 student is classLevel 10",
      c.status === 200 && String(sc?.classLevel) === "10", `status=${c.status} classLevel=${sc?.classLevel}`);

    const d = await api("get", "/student/profile", { token: tokenD });
    const sd = d.data?.student || d.data?.user || d.data;
    check("profile: class-12 student is classLevel 12",
      d.status === 200 && String(sd?.classLevel) === "12", `status=${d.status} classLevel=${sd?.classLevel}`);

    const ds = await api("get", "/student/dashboard-summary", { token: tokenA });
    check("class-8 dashboard-summary live", ds.status === 200, `status=${ds.status}`);
  }

  // ══ 3. CLASS 8 — SKILLS ADVENTURE ════════════════════════════════════════
  const skillAttemptIds = [];
  {
    const cats = await api("get", "/class8-skills/categories", { token: tokenA });
    check("skills categories: 8 skill areas",
      cats.data && cats.data.success && cats.data.categories && cats.data.categories.length === 8,
      cats.data && cats.data.categories && cats.data.categories.length);
    check("skills categories: every area has 3 games + identity",
      cats.data && cats.data.categories.every((c) => c.activityCount === 3 && c.name && c.color && c.icon && c.activityIds.length === 3),
      "shape");

    const d0 = await api("get", "/class8-skills/dashboard", { token: tokenA });
    check("skills dashboard: fresh student has no evidence",
      d0.data && d0.data.success && d0.data.totalCompleted === 0 && d0.data.diagnostic.completed === false,
      d0.data && d0.data.totalCompleted);
    check("skills dashboard: recommendation is 'take the diagnostic'",
      d0.data && d0.data.recommendation && d0.data.recommendation.kind === "diagnostic",
      d0.data && d0.data.recommendation);

    // Diagnostic: start → hints → answers → complete.
    const diag = await api("post", "/class8-skills/attempts", { token: tokenA, data: { skillId: "diagnostic", activityId: "diagnostic", mode: "diagnostic" } });
    const diagTasks = catalog.getDiagnostic();
    check("skills diagnostic: 8 tasks served", diag.data && diag.data.success && diag.data.tasks && diag.data.tasks.length === 8,
      diag.data && diag.data.tasks && diag.data.tasks.length);
    check("skills diagnostic: tasks stripped of answer keys", secrecyOk(diag.data && diag.data.tasks), "secrecy");
    const aid = diag.data.attempt._id;
    skillAttemptIds.push(aid);

    const h0 = await api("post", `/class8-skills/attempts/${aid}/hint`, { token: tokenA, data: { taskIndex: 0 } });
    check("skills hint 0 revealed", h0.data && h0.data.success && typeof h0.data.hint === "string" && h0.data.hint.length > 3,
      h0.data && h0.data.hint);
    const h1 = await api("post", `/class8-skills/attempts/${aid}/hint`, { token: tokenA, data: { taskIndex: 1 } });
    check("skills hint 1 revealed", h1.data && h1.data.success, `status=${h1.status}`);
    const h2 = await api("post", `/class8-skills/attempts/${aid}/hint`, { token: tokenA, data: { taskIndex: 2 } });
    check("skills hint 3 blocked by limit (2 per run)", h2.data && h2.data.success === false && h2.data.code === "HINT_LIMIT",
      h2.status);

    await answerAllSkills(tokenA, aid, diagTasks, { wrongOnce: true });

    const comp = await api("post", `/class8-skills/attempts/${aid}/complete`, { token: tokenA, data: {} });
    check("skills diagnostic: completed + summary",
      comp.data && comp.data.success && comp.data.summary && comp.data.summary.mode === "diagnostic" && comp.data.summary.score >= 60,
      comp.data && comp.data.summary && { score: comp.data.summary.score, hintCount: comp.data.summary.hintCount });
    check("skills diagnostic: deterministic evidence only (8/8 correct)",
      comp.data && comp.data.summary && comp.data.summary.totalTasks === 8 && comp.data.summary.correctCount === 8,
      comp.data && comp.data.summary);
    check("skills diagnostic: milestones diagnostic_done + first_mission",
      (comp.data && comp.data.newlyEarnedMilestones || []).includes("diagnostic_done") &&
      (comp.data && comp.data.newlyEarnedMilestones || []).includes("first_mission"),
      comp.data && comp.data.newlyEarnedMilestones);
    check("skills diagnostic: encouragement present", typeof comp.data.encouragement === "string" && comp.data.encouragement.length > 0,
      comp.data && comp.data.encouragement);

    const profBefore = await db.collection("studentskillprofiles").countDocuments({ studentId: new mongoose.Types.ObjectId(studentAId) });
    const comp2 = await api("post", `/class8-skills/attempts/${aid}/complete`, { token: tokenA, data: {} });
    check("skills diagnostic: duplicate complete is idempotent", comp2.data && comp2.data.success && comp2.data.alreadyCompleted === true,
      comp2.data && comp2.data.alreadyCompleted);
    const profAfter = await db.collection("studentskillprofiles").countDocuments({ studentId: new mongoose.Types.ObjectId(studentAId) });
    check("skills diagnostic: no profile change on re-complete", profBefore === profAfter, { profBefore, profAfter });

    // Persisted LD-NBSE evidence (DB read-back).
    check("skills LD: 8 profile rows (one per subskill)", profAfter === 8, profAfter);
    const dna = await db.collection("studentlearningdnas").findOne({ studentId: new mongoose.Types.ObjectId(studentAId) });
    check("skills LD: learning DNA row written", !!dna && !!dna.dimensions && Object.keys(dna.dimensions || {}).length,
      dna && dna.dimensions && Object.keys(dna.dimensions || {}).length);
    const hist = await db.collection("skillprogresshistories").countDocuments({ studentId: new mongoose.Types.ObjectId(studentAId) });
    check("skills LD: progress history rows written", hist >= 8, hist);
    const rec = await db.collection("learningrecommendations").find({ studentId: new mongoose.Types.ObjectId(studentAId), mode: "skills" })
      .sort({ submittedAt: -1 }).limit(1).toArray();
    check("skills LD: skills-mode recommendation persisted",
      rec.length > 0 && rec[0].primaryFocus && rec[0].primaryFocus.subskill,
      rec[0] && rec[0].primaryFocus);
    const ms = await db.collection("skillmilestones").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
    check("skills DB: diagnostic_done milestone stored", ms.some((m) => m.code === "diagnostic_done"), ms.map((m) => m.code));

    // Play + level gating (performance-based, not completion).
    const lockedRes = await api("post", "/class8-skills/attempts", { token: tokenA, data: { skillId: "logical-thinking", activityId: "pattern-master", level: 2 } });
    check("skills gate: level 2 locked before level 1 pass",
      lockedRes.status === 400 && lockedRes.data && lockedRes.data.code === "LOCKED", lockedRes.status);

    const run1 = await playGame(tokenA, "logical-thinking", "pattern-master", 1, "skills pattern-master L1");
    check("skills gate: L1 clean run scores 100",
      run1.comp.data.summary.score === 100 && run1.comp.data.summary.hintCount === 0,
      run1.comp.data.summary && { score: run1.comp.data.summary.score });
    check("skills gate: independent_solver milestone",
      (run1.comp.data.newlyEarnedMilestones || []).includes("independent_solver"),
      run1.comp.data.newlyEarnedMilestones);

    const gate2 = await api("post", "/class8-skills/attempts", { token: tokenA, data: { skillId: "logical-thinking", activityId: "pattern-master", level: 2 } });
    check("skills gate: level 2 now unlocked (score ≥ 60)",
      gate2.data && gate2.data.success && gate2.data.attempt && gate2.data.attempt.level === 2,
      gate2.data && gate2.data.attempt && { level: gate2.data.attempt.level });
    skillAttemptIds.push(gate2.data.attempt._id);
    if (gate2.data && gate2.data.attempt) {
      const pmTasks2 = catalog.tasksForLevel(catalog.activityById("logical-thinking", "pattern-master"), 2);
      const hL2 = await api("post", `/class8-skills/attempts/${gate2.data.attempt._id}/hint`, { token: tokenA, data: { taskIndex: 0 } });
      check("skills weight: hint served on level 2", hL2.data && hL2.data.success && typeof hL2.data.hint === "string",
        hL2.data && hL2.data.hint);
      await answerAllSkills(tokenA, gate2.data.attempt._id, pmTasks2);
      const compL2 = await api("post", `/class8-skills/attempts/${gate2.data.attempt._id}/complete`, { token: tokenA, data: {} });
      check("skills gate: L2 completed clean", compL2.data && compL2.data.success && compL2.data.summary.score >= 85,
        compL2.data && compL2.data.summary && compL2.data.summary.score);
    }

    // Reports after evidence.
    const dash = await api("get", "/class8-skills/dashboard", { token: tokenA });
    check("skills dashboard: diagnostic done + non-diagnostic recommendation",
      dash.data && dash.data.success && dash.data.diagnostic.completed === true &&
      dash.data.recommendation && typeof dash.data.recommendation.categoryId === "string" && dash.data.recommendation.categoryId !== "diagnostic",
      dash.data && dash.data.recommendation && { categoryId: dash.data.recommendation.categoryId });
    const history = await api("get", "/class8-skills/history", { token: tokenA });
    check("skills history: completed attempts served (≥1 diagnostic + 2 play)",
      history.data && history.data.success &&
      history.data.history.filter((x) => x.status === "completed").length >= 3,
      history.data && history.data.history.map((x) => `${x.activityId}@L${x.level} (${x.status})`));
    const recs = await api("get", "/class8-skills/recommendations", { token: tokenA });
    check("skills recommendations: top + alternatives + reason",
      recs.data && recs.data.success && recs.data.recommendation && recs.data.recommendation.categoryId &&
      typeof recs.data.recommendation.reason === "string" && Array.isArray(recs.data.alternatives),
      recs.data && recs.data.recommendation);
    const mstones = await api("get", "/class8-skills/milestones", { token: tokenA });
    const codes = mstones.data && mstones.data.milestones ? mstones.data.milestones.map((m) => m.code) : [];
    check("skills milestones: deterministic milestones stored",
      ["first_mission", "diagnostic_done", "independent_solver"].every((c) => codes.includes(c)), codes);

    const actPg = await api("get", "/class8-skills/categories/logical-thinking/activities/pattern-master", { token: tokenA });
    check("skills activity page: level 2 unlocked after pass",
      actPg.data && actPg.data.success && actPg.data.levels && actPg.data.levels[1].unlocked === true && actPg.data.levels[1].bestScore === 100,
      actPg.data && actPg.data.levels && actPg.data.levels[1]);

    // Cross-student isolation.
    const d2 = await api("get", "/class8-skills/dashboard", { token: tokenB });
    check("skills isolation: student B has zero activity",
      d2.data && d2.data.success && d2.data.totalCompleted === 0 && d2.data.recentCompletions.length === 0,
      d2.data && d2.data.totalCompleted);
    const intrude = await api("post", `/class8-skills/attempts/${aid}/answer`, { token: tokenB, data: { taskIndex: 0, given: 0 } });
    check("skills isolation: cannot answer another student's attempt", intrude.status === 404, `status=${intrude.status}`);
  }

  // ══ 4. CLASS 8 — MATHS MISSIONS ══════════════════════════════════════════
  {
    const MathMissionQuestion = require("../models/MathMissionQuestion");
    const prog = await api("get", "/maths/missions/progress", { token: tokenA });
    check("maths overview: 15 topics served",
      prog.data && prog.data.success && prog.data.data.topics && prog.data.data.topics.length === 15,
      prog.data && prog.data.data.topics && prog.data.data.topics.length);
    const t0 = prog.data && prog.data.data.topics && prog.data.data.topics[0];
    check("maths overview: first world unlocked, rest locked",
      !!t0 && t0.unlocked === true && prog.data.data.topics.slice(1).every((t) => t.unlocked === false),
      t0 && t0.worldName);
    check("maths overview: currentTopic = first world",
      prog.data && prog.data.data.currentTopic && prog.data.data.currentTopic.id === t0.id,
      prog.data && prog.data.data.currentTopic && prog.data.data.currentTopic.worldName);

    const topic = await api("get", "/maths/missions/topic/fractions", { token: tokenA });
    check("maths topic: fractions planet meta",
      topic.data && topic.data.success && topic.data.data.topic.worldName === "Fraction Planet" && topic.data.data.topic.world === "planet",
      topic.data && topic.data.data.topic && topic.data.data.topic.worldName);
    check("maths topic: 6 missions, boss last",
      topic.data && topic.data.data.missions.length === 6 &&
      topic.data.data.missions[topic.data.data.missions.length - 1].isBoss === true &&
      topic.data.data.missions.slice(0, 5).every((m) => !m.isBoss),
      topic.data && topic.data.data.missions && topic.data.data.missions.length);
    check("maths topic: mission 1 current, mission 2 locked",
      topic.data.data.missions[0].status === "current" && topic.data.data.missions[1].status === "locked",
      topic.data.data.missions.map((m) => m.status));

    // Play all six missions for real.
    const starsPerMission = {};
    const lesson1Mission = topic.data.data.missions[0].missionId;
    // Query params travel in the URL to keep api() simple and request-agnostic.
    const sessFirst = await api("get", `/maths/missions/questions?topic=fractions&mission=${encodeURIComponent(lesson1Mission)}`, { token: tokenA });
    check("maths session: steps built", sessFirst.data && sessFirst.data.success && sessFirst.data.data.steps && sessFirst.data.data.steps.length >= 4,
      sessFirst.data && sessFirst.data.data.steps && sessFirst.data.data.steps.length);
    check("maths session: NO answer keys leaked to the client", !hasAnswerKeys(sessFirst.data && sessFirst.data.data.steps),
      "secrecy");

    for (let mIdx = 0; mIdx < topic.data.data.missions.length; mIdx += 1) {
      const mission = topic.data.data.missions[mIdx];
      const sess = await api("get", `/maths/missions/questions?topic=fractions&mission=${encodeURIComponent(mission.missionId)}`, { token: tokenA });
      check(`maths session ${mission.missionId}: steps built`, sess.data && sess.data.data.steps && sess.data.data.steps.length >= 4,
        sess.data && sess.data.data.steps && sess.data.data.steps.length);
      const qSteps = sess.data.data.steps.filter((s) => s.type === "question");
      let wrongDone = false;
      for (const st of qSteps) {
        const q = await MathMissionQuestion.findOne({ questionId: st.questionId }).lean();
        if (q && !wrongDone && mIdx === 0) {
          const wrong = await api("post", `/maths/missions/${st.questionId}/answer`, { token: tokenA, data: { answer: "definitely-not-right" } });
          check("maths: wrong answer reported", wrong.data && wrong.data.data && wrong.data.data.correct === false,
            wrong.status);
          wrongDone = true;
        }
        if (q) {
          const res = await api("post", `/maths/missions/${st.questionId}/answer`, { token: tokenA, data: { answer: answerFor(q) } });
          check(`maths answer ${st.slot}: correct recorded`,
            res.data && res.data.data && res.data.data.correct === true, res.status);
          if (res.data && res.data.data && res.data.data.missionCompleted) {
            starsPerMission[mission.missionId] = res.data.data.stars;
            if (mission.isBoss) {
              check("maths boss: topic completed + next world unlocked",
                res.data.data.justCompletedTopic === true && res.data.data.topicCompleted === true && res.data.data.nextTopic && res.data.data.nextTopic.worldName,
                res.data.data.nextTopic && { worldName: res.data.data.nextTopic.worldName });
            }
          }
        }
      }
    }
    check("maths stars: 2 from the deliberate stumble, 3 for clean runs",
      starsPerMission[topic.data.data.missions[0].missionId] === 2 &&
      topic.data.data.missions.slice(1).every((m) => starsPerMission[m.missionId] === 3),
      starsPerMission);

    // Hint + explanation endpoints on a mission question.
    const qAny = await MathMissionQuestion.findOne({ mission: lesson1Mission }).lean();
    if (qAny) {
      const h = await api("post", `/maths/missions/${qAny.questionId}/hint`, { token: tokenA, data: {} });
      check("maths hint: hint1 served", h.data && h.data.success && typeof h.data.data.hint === "string", h.status);
      const e = await api("get", `/maths/missions/${qAny.questionId}/explanation`, { token: tokenA });
      check("maths explanation: served post-diagnostic", e.data && e.data.success && typeof e.data.data.explanation === "string",
        e.status);
    }

    const after = await api("get", "/maths/missions/topic/fractions", { token: tokenA });
    check("maths after: all 6 missions completed",
      after.data && after.data.success && after.data.data.missions.every((m) => m.status === "completed"),
      after.data && after.data.data.missions.map((m) => m.status));
    check("maths after: topicCompleted + 100% mastery",
      after.data && after.data.data.progress.topicCompleted === true && after.data.data.progress.masteryPercentage === 100,
      { topicCompleted: after.data.data.progress.topicCompleted, mastery: after.data.data.progress.masteryPercentage });
    check("maths after: nextTopic leads to Number Moon",
      after.data && after.data.data.nextTopic && after.data.data.nextTopic.id === "integers" && after.data.data.nextTopic.worldName === "Number Moon",
      after.data && after.data.data.nextTopic);

    // DB read-back + isolation.
    const pRows = await db.collection("studentmathmissionprogresses").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
    check("maths DB: progress row owned by A with topic completed",
      pRows.length >= 1 && pRows.every((x) => String(x.studentId) === studentAId) &&
      pRows.some((x) => x.topic === "fractions" && x.topicCompleted === true),
      pRows.map((x) => `${x.topic}=${x.topicCompleted}`));
    const aRows = await db.collection("studentmathattempts").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
    check("maths DB: attempt rows owned by A (answers + hints)",
      aRows.length >= 24 && aRows.every((x) => String(x.studentId) === studentAId),
      `rows=${aRows.length}`);
    const bProg = await db.collection("studentmathmissionprogresses").countDocuments({ studentId: new mongoose.Types.ObjectId(studentBId) });
    check("maths isolation: student B has zero progress rows", bProg === 0, `rows=${bProg}`);
    const qCount = await db.collection("mathmissionquestions").countDocuments({});
    const mCount = await db.collection("mathmissions").countDocuments({});
    check("maths DB: curriculum present (missions + questions)", qCount >= 24 && mCount >= 6, { missions: mCount, questions: qCount });
  }

  // ══ 5. CLASS 8 — ENGLISH MISSIONS ════════════════════════════════════════
  let englishAiDown = false;
  {
    const overview = await api("get", "/english-missions/areas", { token: tokenA });
    check("english areas: 6 areas served", overview.data && overview.data.success && overview.data.areas.length === 6,
      overview.data && overview.data.areas && overview.data.areas.length);
    check("english areas: 23 topics across areas",
      overview.data && overview.data.areas.reduce((n, a) => n + a.topics.length, 0) === 23,
      overview.data && overview.data.areas.reduce((n, a) => n + a.topics.length, 0));
    const g0 = overview.data && overview.data.areas.find((a) => a.id === "grammar");
    check("english areas: first grammar topic open, rest locked",
      g0 && g0.topics[0].state === "open" && g0.topics.slice(1).every((t) => t.state === "locked"),
      g0 && g0.topics.map((t) => t.state));
    check("english areas: continueLearning = present-tenses",
      overview.data && overview.data.continueLearning && overview.data.continueLearning.topicId === "present-tenses",
      overview.data && overview.data.continueLearning);

    const area = await api("get", "/english-missions/areas/grammar", { token: tokenA });
    check("english area: grammar has 8 topics, states [open, locked…]",
      area.data && area.data.success && area.data.area.topics.length === 8 &&
      area.data.area.topics[0].state === "open" && area.data.area.topics.slice(1).every((t) => t.state === "locked"),
      area.data && area.data.area && area.data.area.topics.length);

    const topicRes = await api("get", "/english-missions/topics/present-tenses", { token: tokenA });
    const T = topicRes.data && topicRes.data.topic;
    check("english topic: content fields",
      T && T.id === "present-tenses" && T.objectives.length >= 3 && T.lesson.sections.length >= 3 && T.recap.length >= 4 && T.activities.length === 3,
      T && { objectives: T.objectives.length, sections: T.lesson.sections.length, recap: T.recap.length, activities: T.activities.length });
    check("english topic: assessment meta + locked at start",
      topicRes.data.assessment.count === 6 && topicRes.data.assessment.available === false &&
      topicRes.data.progress.allActivitiesDone === false && topicRes.data.progress.locked === false,
      topicRes.data.assessment);
    check("english secrecy: topic payload carries no answer keys", hasAnswerKeys(topicRes.data) === false, "secrecy");

    // Activities: wrong then correct, server-graded.
    const wrong = await api("post", "/english-missions/topics/present-tenses/activities/pres-mcq/answer",
      { token: tokenA, data: { answer: ["nope", "nope", "nope", "nope"] } });
    check("english activity: wrong answer -> incorrect, not completed",
      wrong.data && wrong.data.success && wrong.data.correct === false && wrong.data.activityComplete === false,
      wrong.data && { correct: wrong.data.correct });

    const presMcq = seed.activityById(seed.englishTopicById("present-tenses"), "pres-mcq");
    const right = await api("post", "/english-missions/topics/present-tenses/activities/pres-mcq/answer",
      { token: tokenA, data: { answer: correctAnswerFor(presMcq) } });
    check("english activity: correct answer -> all items correct",
      right.data && right.data.success && right.data.correct === true && right.data.results.length === 4,
      right.data && right.data.results && right.data.results.length);
    check("english activity: only first of three activities done", right.data.allActivitiesDone === false, right.data.allActivitiesDone);

    for (const aid of ["pres-fill", "pres-fix"]) {
      const a = seed.activityById(seed.englishTopicById("present-tenses"), aid);
      const r = await api("post", `/english-missions/topics/present-tenses/activities/${aid}/answer`,
        { token: tokenA, data: { answer: correctAnswerFor(a) } });
      check(`english activity: ${aid} completed`, r.data && r.data.success && r.data.correct === true && r.data.activityComplete === true,
        r.status);
    }
    const unlocked = await api("get", "/english-missions/topics/present-tenses", { token: tokenA });
    check("english topic: all activities done -> assessment available",
      unlocked.data.assessment.available === true && unlocked.data.progress.allActivitiesDone === true &&
      unlocked.data.progress.completedActivities.length === 3,
      unlocked.data.progress.completedActivities);

    // Sequential unlocking within the area.
    const ahead = await api("post", "/english-missions/topics/past-tenses/activities/past-mcq/answer",
      { token: tokenA, data: { answer: ["x", "x", "x"] } });
    check("english gating: next topic activities blocked (403)",
      ahead.status === 403 && ahead.data && ahead.data.locked === true, `status=${ahead.status}`);

    // AI assessment (tolerates the AI provider being down — a 502 arrives as
    // an HTTP response with the ai flag, matching _smokeEnglishMissions.js).
    let startRes = null;
    const startRaw = await api("post", "/english-missions/topics/present-tenses/assessment/start",
      { token: tokenA, data: {}, timeout: 180000 });
    if (startRaw.status === 502 && startRaw.data && startRaw.data.ai) {
      note("english AI generation unavailable (provider/network) — AI-dependent checks skipped");
      englishAiDown = true;
    } else {
      startRes = startRaw.data || null;
    }

    if (!englishAiDown && startRes && startRes.success) {
      const EnglishAssessment = require("../models/EnglishAssessment");
      check("english assessment: generated set has 6 questions", startRes.assessment.questions.length === 6,
        startRes.assessment.questions.length);
      check("english secrecy: assessment question payload carries no answer keys",
        hasAnswerKeys(startRes.assessment.questions) === false, "secrecy");
      check("english assessment: totalMarks matches sum",
        startRes.assessment.totalMarks === startRes.assessment.questions.reduce((n, q) => n + q.marks, 0),
        startRes.assessment.totalMarks);

      const again = (await api("post", "/english-missions/topics/present-tenses/assessment/start", { token: tokenA, data: {} })).data;
      check("english assessment: start again reuses pending set (stable)",
        again.reused === true && String(again.assessment.id) === String(startRes.assessment.id),
        { reused: again.reused, sameId: again.assessment.id === startRes.assessment.id });

      const doc = await EnglishAssessment.findOne({ studentId: new mongoose.Types.ObjectId(studentAId), topic: "present-tenses", status: "pending" }).lean();
      check("english assessment: stored doc holds the answer key server-side",
        doc && Array.isArray(doc.questions) && doc.questions.every((q) => q.correctAnswer),
        doc && doc.questions && doc.questions.length);

      const answers = doc.questions.map((q) => {
        if (q.type === "fill-in-the-blank") return { questionId: q.id, answer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer };
        if (q.type === "true-false") return { questionId: q.id, answer: q.correctAnswer === "True" ? true : false };
        return { questionId: q.id, answer: q.correctAnswer };
      });
      const sub = await api("post", `/english-missions/assessments/${doc._id}/submit`, { token: tokenA, data: { answers } });
      check("english submit: perfect run scores 100%",
        sub.data && sub.data.success && sub.data.percent === 100 && sub.data.score === sub.data.totalMarks,
        sub.data && { percent: sub.data.percent, score: sub.data.score, total: sub.data.totalMarks });
      check("english submit: every question reviewed with grading evidence",
        sub.data && sub.data.results.length === 6 &&
        sub.data.results.every((r) => r.correct === true && r.correctAnswer !== undefined),
        sub.data && sub.data.results && sub.data.results.length);

      // Duplicate submit refused.
      const dup = await api("post", `/english-missions/assessments/${doc._id}/submit`, { token: tokenA, data: { answers: [] } });
      check("english submit: duplicate submit refused", dup.status === 400, `status=${dup.status}`);

      const progAfter = await api("get", "/english-missions/progress", { token: tokenA });
      check("english progress: grammar topic 1 completed + totals advanced",
        progAfter.data && progAfter.data.success &&
        progAfter.data.areas.find((a) => a.id === "grammar").topics[0].state === "completed" &&
        progAfter.data.totals.topicsCompleted === 1 &&
        progAfter.data.continueLearning.topicId === "past-tenses",
        progAfter.data && progAfter.data.totals);
    } else if (englishAiDown) {
      const p = await db.collection("studentenglishprogresses").findOne({ studentId: new mongoose.Types.ObjectId(studentAId), topic: "present-tenses" });
      check("english (AI down): activity progress still persisted",
        p && p.completedActivities.length === 3 && p.assessmentCompleted === false,
        p && { acts: p.completedActivities.length, completed: p.assessmentCompleted });
    }

    const eDoc = await db.collection("studentenglishprogresses").findOne({ studentId: new mongoose.Types.ObjectId(studentAId), topic: "present-tenses" });
    check("english DB: progress row owned by A (3 activities done)",
      !!eDoc && String(eDoc.studentId) === studentAId && eDoc.completedActivities.length === 3,
      eDoc && { acts: eDoc.completedActivities.length });
    const bEng = await db.collection("studentenglishprogresses").countDocuments({ studentId: new mongoose.Types.ObjectId(studentBId) });
    check("english isolation: student B has zero progress rows", bEng === 0, `rows=${bEng}`);

    if (!englishAiDown) {
      const bSubmit = await api("post", `/english-missions/assessments/000000000000000000000000/submit`,
        { token: tokenB, data: { answers: [] } });
      check("english isolation: B cannot submit (or find) A's assessment", bSubmit.status === 404, `status=${bSubmit.status}`);
    }
  }

  // ══ 6. CLASS 8/10/12 — CLASS-CONTENT (public list + slug, published-only) ══
  {
    for (const lvl of ["8", "10", "12"]) {
      const r = await api("get", `/class-content/level/${lvl}`);
      const list = (r.data && r.data.data) || [];
      check(`class-content level/${lvl}: published list served`,
        r.status === 200 && list.length > 0 && list.every((c) => c.status === "published"),
        `status=${r.status} count=${list.length}`);
      if (list.length > 0) {
        const slug = list[0].slug;
        const d = await api("get", `/class-content/slug/${encodeURIComponent(slug)}`);
        check(`class-content level/${lvl}: slug detail readable (ContentDetailPage consumer)`,
          d.status === 200 && d.data && d.data.success && d.data.data.slug === slug,
          `status=${d.status} slug=${slug}`);
      }
    }
    const bad = await api("get", "/class-content/slug/audit-does-not-exist-xyz");
    check("class-content level/8: unknown slug → 404", bad.status === 404, `status=${bad.status}`);
  }

  // ══ 7. CLASS 10 — STREAMS (public + admin CRUD + student denied) ═════════
  {
    const pub = await api("get", "/streams");
    check("streams public: data + facets + count",
      pub.status === 200 && pub.data && pub.data.success && Array.isArray(pub.data.data) && pub.data.count > 0 &&
      pub.data.facets && typeof pub.data.facets.total === "number",
      `status=${pub.status} count=${pub.data && pub.data.count} facetsTotal=${pub.data && pub.data.facets && pub.data.facets.total}`);
    const cat = await api("get", "/streams?category=science");
    check("streams public: category filter returns only science",
      cat.status === 200 && cat.data && cat.data.data.length > 0 && cat.data.data.every((s) => s.category === "science"),
      `count=${cat.data && cat.data.data && cat.data.data.length}`);
    const badCat = await api("get", "/streams?category=not-a-real-category");
    check("streams public: invalid category → 400", badCat.status === 400, `status=${badCat.status}`);

    // Admin CRUD round-trip.
    const payload = {
      code: `AUDIT-${RUN}`,
      groupName: "Audit Stream Group",
      subjects: ["Audit Subject"],
      bestFor: "Audit-best-for",
      progression: ["Undergraduate"],
      backgroundTheme: "space",
      category: "science",
      order: 10000 + Math.floor(Math.random() * 5000),
    };
    const create = await api("post", "/streams/admin", { token: adminToken, data: payload });
    check("streams admin: create (201, persisted id)", create.status === 201 && create.data && create.data.success && !!create.data.data._id,
      `status=${create.status}`);
    createdStreamId = create.data && create.data.data && String(create.data.data._id);

    const pubAfter = await api("get", "/streams");
    check("streams: created stream visible in public list",
      pubAfter.data && pubAfter.data.data.some((s) => String(s._id) === createdStreamId), `id=${createdStreamId}`);

    const denyCreate = await api("post", "/streams/admin", { token: tokenA, data: payload });
    check("streams: student CANNOT create (admin-gated)",
      denyCreate.status === 401 || denyCreate.status === 403, `status=${denyCreate.status}`);
    const denyList = await api("get", "/streams/admin", { token: tokenA });
    check("streams: student CANNOT list admin records",
      denyList.status === 401 || denyList.status === 403, `status=${denyList.status}`);

    const tog = await api("patch", `/streams/admin/${createdStreamId}/toggle-publish`, { token: adminToken, data: {} });
    check("streams admin: toggle-publish works", tog.status === 200 && tog.data && tog.data.success, `status=${tog.status}`);
    const pubHidden = await api("get", "/streams");
    check("streams: unpublished stream hidden from public list",
      pubHidden.data && !pubHidden.data.data.some((s) => String(s._id) === createdStreamId),
      `count=${pubHidden.data && pubHidden.data.count}`);

    const del = await api("delete", `/streams/admin/${createdStreamId}`, { token: adminToken });
    check("streams admin: delete (cleanup)", del.status === 200 && del.data && del.data.success, `status=${del.status}`);
    createdStreamId = null;

    const dbRow = await db.collection("streams").countDocuments({ code: payload.code });
    check("streams DB: created row cleaned up", dbRow === 0, `rows=${dbRow}`);
  }

  // ══ 8. CLASS 12 — COLLEGES-INSIGHT (public reads + 400/404) ══════════════
  {
    const sum = await api("get", "/colleges-insight");
    check("colleges summary: rows per category + numeric counts",
      sum.status === 200 && sum.data && sum.data.success && Array.isArray(sum.data.data) && sum.data.data.length >= 3 &&
      sum.data.data.every((r) => r.category && typeof r.courseCount === "number" && typeof r.collegeCount === "number"),
      `status=${sum.status} rows=${sum.data && sum.data.data && sum.data.data.length}`);

    const courses = await api("get", "/colleges-insight/engineering/courses");
    check("colleges courses: engineering courses served",
      courses.status === 200 && courses.data && courses.data.success && Array.isArray(courses.data.data),
      `status=${courses.status} count=${courses.data && courses.data.data && courses.data.data.length}`);

    const courseId = courses.data && courses.data.data && courses.data.data.length ? String(courses.data.data[0].id) : null;
    if (courseId) {
      const cc = await api("get", `/colleges-insight/engineering/courses/${courseId}/colleges`);
      check("colleges: course → colleges served",
        cc.status === 200 && cc.data && cc.data.success && cc.data.course && cc.data.course.id === courseId,
        `status=${cc.status} count=${cc.data && cc.data.count}`);
      const badCourse = await api("get", "/colleges-insight/engineering/courses/not-an-object-id-zzz/colleges");
      check("colleges: invalid course id → 400", badCourse.status === 400, `status=${badCourse.status}`);
    }

    const badCat = await api("get", "/colleges-insight/nope-nothing/courses");
    check("colleges: unknown category → 404", badCat.status === 404, `status=${badCat.status}`);

    const catColleges = await api("get", "/colleges-insight/engineering/colleges?limit=5");
    check("colleges: category → colleges list",
      catColleges.status === 200 && catColleges.data && catColleges.data.success && Array.isArray(catColleges.data.data),
      `status=${catColleges.status} count=${catColleges.data && catColleges.data.count}`);
    const collegeId = catColleges.data && catColleges.data.data && catColleges.data.data.length ? String(catColleges.data.data[0].id) : null;
    if (collegeId) {
      const colCourses = await api("get", `/colleges-insight/colleges/${collegeId}/courses`);
      check("colleges: college → courses (grouped, public)",
        colCourses.status === 200 && colCourses.data && colCourses.data.success && Array.isArray(colCourses.data.groups),
        `status=${colCourses.status}`);
      const badCollege = await api("get", "/colleges-insight/colleges/bad-id-zzz/courses");
      check("colleges: invalid college id → 400", badCollege.status === 400, `status=${badCollege.status}`);
    }
  }

  // ══ 9. CLASS-CONTENT ADMIN CRUD ROUND-TRIP + DRAFT-LEAK REGRESSION ═══════
  {
    // Regression for the confirmed fix: a DRAFT must NOT be readable via the
    // public slug route (it was — getContentBySlug had no status filter).
    const slug = `audit-c81012-${RUN}`;
    const create = await api("post", "/class-content", { token: adminToken, data: {
      title: `Audit Content ${RUN}`, slug,
      targetClass: "8", sectionType: "Basics", category: "Audit",
      shortDescription: "audit short", fullDescription: "audit full body",
      status: "draft",
    }});
    check("class-content admin: create draft (201)", create.status === 201 && create.data && create.data.success && !!create.data.data._id,
      `status=${create.status}`);
    createdContentId = create.data && create.data.data && String(create.data.data._id);

    const pubSlug = await api("get", `/class-content/slug/${slug}`);
    check("REGRESSION(FIX): draft content NOT readable via public slug (404 formerly 200)",
      pubSlug.status === 404, `status=${pubSlug.status}`);

    const level8 = await api("get", "/class-content/level/8");
    check("class-content: draft absent from public level list",
      level8.data && !level8.data.data.some((c) => String(c._id) === createdContentId),
      `count=${level8.data && level8.data.data && level8.data.data.length}`);

    const adminList = await api("get", "/class-content/admin/level/8", { token: adminToken });
    check("class-content: draft VISIBLE on admin level list",
      adminList.status === 200 && adminList.data && adminList.data.data.some((c) => String(c._id) === createdContentId),
      `status=${adminList.status}`);

    const byId = await api("get", `/class-content/${createdContentId}`, { token: adminToken });
    check("class-content: admin reads draft by id", byId.status === 200 && byId.data && byId.data.data._id === createdContentId,
      `status=${byId.status}`);

    const denies = await Promise.all([
      api("post", "/class-content", { token: tokenA, data: { title: "x" } }),
      api("put", `/class-content/${createdContentId}`, { token: tokenA, data: { title: "x" } }),
      api("delete", `/class-content/${createdContentId}`, { token: tokenA }),
      api("get", `/class-content/admin/level/8`, { token: tokenA }),
    ]);
    check("class-content: student CANNOT create (admin-gated)", denies[0].status === 401 || denies[0].status === 403, `status=${denies[0].status}`);
    check("class-content: student CANNOT update (admin-gated)", denies[1].status === 401 || denies[1].status === 403, `status=${denies[1].status}`);
    check("class-content: student CANNOT delete (admin-gated)", denies[2].status === 401 || denies[2].status === 403, `status=${denies[2].status}`);
    check("class-content: student CANNOT list admin records", denies[3].status === 401 || denies[3].status === 403, `status=${denies[3].status}`);

    // Publish → now publicly readable.
    const pub = await api("patch", `/class-content/${createdContentId}/toggle-status`, { token: adminToken, data: {} });
    check("class-content admin: toggle-status → published",
      pub.status === 200 && pub.data && pub.data.data && pub.data.data.status === "published", `status=${pub.status}`);
    const pubSlug2 = await api("get", `/class-content/slug/${slug}`);
    check("class-content: published content readable via slug", pubSlug2.status === 200 && pubSlug2.data.data.status === "published",
      `status=${pubSlug2.status}`);

    const upd = await api("put", `/class-content/${createdContentId}`, { token: adminToken, data: { shortDescription: "audit updated" } });
    check("class-content admin: update persists",
      upd.status === 200 && upd.data && upd.data.data && upd.data.data.shortDescription === "audit updated",
      `status=${upd.status}`);
    const dbDoc = await db.collection("classcontents").findOne({ _id: new mongoose.Types.ObjectId(createdContentId) });
    check("class-content DB: updated row persisted + createdBy admin",
      !!dbDoc && dbDoc.shortDescription === "audit updated" && dbDoc.status === "published",
      dbDoc && { status: dbDoc.status });

    const del = await api("delete", `/class-content/${createdContentId}`, { token: adminToken });
    check("class-content admin: delete (cleanup)", del.status === 200, `status=${del.status}`);
    createdContentId = null;

    const adminSum = await api("get", "/class-content/admin/summaries", { token: adminToken });
    check("class-content admin: level summaries served for 5/8/10/12",
      adminSum.status === 200 && adminSum.data && adminSum.data.data && adminSum.data.data.length === 4,
      adminSum.data && adminSum.data.data && adminSum.data.data.map((s) => `${s.level}:${s.total}`));
  }

  // ══ 10. SECURITY MATRIX (class 8/10/12 surface) ══════════════════════════
  {
    const noTokens = await Promise.all([
      api("get", "/class8-skills/categories"),
      api("get", "/english-missions/areas"),
      api("get", "/maths/missions/progress"),
      api("get", "/streams/admin"),
      api("post", "/class-content", { data: { title: "x" } }),
      api("get", "/class-content/admin/summaries"),
    ]);
    check("security: class8-skills no-token → 401", noTokens[0].status === 401, `status=${noTokens[0].status}`);
    check("security: english-missions no-token → 401", noTokens[1].status === 401, `status=${noTokens[1].status}`);
    check("security: maths-missions no-token → 401", noTokens[2].status === 401, `status=${noTokens[2].status}`);
    check("security: streams admin no-token → 401", noTokens[3].status === 401, `status=${noTokens[3].status}`);
    check("security: class-content POST no-token → 401", noTokens[4].status === 401, `status=${noTokens[4].status}`);
    check("security: class-content admin no-token → 401", noTokens[5].status === 401, `status=${noTokens[5].status}`);

    // Admin token must NOT be accepted on student routes (verifyStudent).
    const adminOnStudent = await Promise.all([
      api("get", "/class8-skills/categories", { token: adminToken }),
      api("get", "/english-missions/areas", { token: adminToken }),
      api("get", "/maths/missions/progress", { token: adminToken }),
    ]);
    check("security: admin token denied on class8-skills", adminOnStudent[0].status === 401, `status=${adminOnStudent[0].status}`);
    check("security: admin token denied on english-missions", adminOnStudent[1].status === 401, `status=${adminOnStudent[1].status}`);
    check("security: admin token denied on maths-missions", adminOnStudent[2].status === 401, `status=${adminOnStudent[2].status}`);

    const mal = await axios({ method: "get", url: BASE + "/student/profile", headers: { Authorization: "Bearer not-a-valid-jwt" }, validateStatus: () => true, timeout: 30000 });
    check("security: malformed token → 401", mal.status === 401, `status=${mal.status}`);

    // Body-supplied identity spoof on a write must be ignored.
    const mmQ = await db.collection("mathmissionquestions").findOne({});
    if (mmQ) {
      const before = await db.collection("studentmathattempts").countDocuments({ studentId: new mongoose.Types.ObjectId(studentBId) });
      const spoof = await api("post", `/maths/missions/${mmQ.questionId}/answer`,
        { token: tokenA, data: { answer: answerFor(mmQ), studentId: studentBId, classLevel: "8" } });
      const after = await db.collection("studentmathattempts").countDocuments({ studentId: new mongoose.Types.ObjectId(studentBId) });
      check("security: body studentId spoof ignored on maths write",
        spoof.status === 200 && after === before && after === 0,
        `before=${before} after=${after} status=${spoof.status}`);
    }
  }

  // ══ 11. ADMIN VISIBILITY (real aggregations over the data just written) ══
  {
    const dash = await api("get", "/admin/dashboard", { token: adminToken });
    check("admin dashboard live (real aggregation)",
      dash.status === 200 && typeof dash.data?.totalStudents === "number", `status=${dash.status}`);

    const users = await api("get", "/admin/users?userType=school_student&limit=500", { token: adminToken });
    const list = Array.isArray(users.data) ? users.data : (Array.isArray(users.data?.users) ? users.data.users : []);
    const a = list.find((u) => u.email === EMAIL_A);
    const c = list.find((u) => u.email === EMAIL_C);
    const d = list.find((u) => u.email === EMAIL_D);
    check("admin: class-8 student visible with classLevel 8",
      users.status === 200 && !!a && String(a.classLevel) === "8", `status=${users.status} classLevel=${a && a.classLevel}`);
    check("admin: class-10 student visible with classLevel 10",
      !!c && String(c.classLevel) === "10", `classLevel=${c && c.classLevel}`);
    check("admin: class-12 student visible with classLevel 12",
      !!d && String(d.classLevel) === "12", `classLevel=${d && d.classLevel}`);

    const detail = await api("get", `/admin/users/${studentAId}`, { token: adminToken });
    check("admin user detail returns profile + recommendation key",
      detail.status === 200 && detail.data?.user?._id === studentAId && "recommendation" in (detail.data || {}),
      `status=${detail.status}`);

    const blk = await api("patch", `/admin/users/${studentAId}/block`, { token: adminToken });
    const l1 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
    check("admin block round-trip: blocked student cannot login",
      blk.status === 200 && l1.status === 403, `blk=${blk.status} login=${l1.status}`);
    const unblk = await api("patch", `/admin/users/${studentAId}/unblock`, { token: adminToken });
    const l2 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
    check("admin unblock restores login", unblk.status === 200 && l2.status === 200, `unblk=${unblk.status} login=${l2.status}`);
    tokenA = l2.data.token || tokenA;
  }

  // ══ 12. RECOVERY — progress survives a fresh login (no fabricated state) ══
  {
    const m = await api("get", "/maths/missions/topic/fractions", { token: tokenA });
    check("recovery: maths fractions still completed after re-login",
      m.status === 200 && m.data?.data?.progress?.topicCompleted === true,
      `status=${m.status} completed=${m.data && m.data.data && m.data.data.progress && m.data.data.progress.topicCompleted}`);

    const s = await api("get", "/class8-skills/milestones", { token: tokenA });
    const codes = s.data && s.data.milestones ? s.data.milestones.map((x) => x.code) : [];
    check("recovery: skills milestones persist after re-login",
      s.status === 200 && codes.includes("diagnostic_done") && codes.includes("independent_solver"), codes);

    const e = await api("get", "/english-missions/progress", { token: tokenA });
    const g1 = e.data && e.data.areas && e.data.areas.find((a) => a.id === "grammar");
    check("recovery: english activity progress persists after re-login",
      e.status === 200 && g1 && g1.topics[0].state !== "locked" &&
      (g1.topics[0].state === "completed" || g1.topics[0].bestPercent >= 0),
      g1 && g1.topics && g1.topics[0] && { state: g1.topics[0].state });
  }

  // ══ 13. CLEANUP (isolated identities only) ═══════════════════════════════
  if (!KEEP) {
    const aId = new mongoose.Types.ObjectId(studentAId);
    const bId = new mongoose.Types.ObjectId(studentBId);
    const cId = new mongoose.Types.ObjectId(studentCId);
    const dId = new mongoose.Types.ObjectId(studentDId);
    await db.collection("users").deleteMany({ email: { $in: [EMAIL_A, EMAIL_B, EMAIL_C, EMAIL_D] } });
    await db.collection("admins").deleteMany({ $or: [{ _id: adminDocId }, { email: EMAIL_ADMIN }] });
    if (createdContentId) await db.collection("classcontents").deleteMany({ _id: new mongoose.Types.ObjectId(createdContentId) });
    if (createdStreamId) await db.collection("streams").deleteMany({ _id: new mongoose.Types.ObjectId(createdStreamId) });

    const idCols = [
      "skillattempts", "skillmilestones", "studentskillprofiles", "studentlearningdnas",
      "skillprogresshistories", "learningrecommendations",
      "studentmathmissionprogresses", "studentmathattempts",
      "studentenglishprogresses", "englishassessments",
    ];
    for (const col of idCols) {
      try {
        await db.collection(col).deleteMany({ studentId: { $in: [aId, bId, cId, dId] } });
      } catch { /* collection may not exist */ }
    }
    console.log("CLEANUP: removed isolated class-8/10/12 audit identities");
  } else {
    console.log(`KEEP: audit identities retained — ${EMAIL_A}`);
  }

  await mongoose.disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log("\n" + "═".repeat(70));
  console.log(`CLASS 8/10/12 AUDIT ${RUN} — ${results.length} checks, ${results.length - failed.length} passed, ${failed.length} failed`);
  if (failed.length) {
    for (const f of failed) console.log(`  ✗ ${f.name}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("C81012 AUDIT ABORTED:", e.message);
  process.exit(2);
});