/* Full-stack smoke test for the Class 8 Skill Adventure module.
   Creates two throwaway students, drives the HTTP API like the real app
   (diagnostic → play → complete → resume/duplicate/isolation), then checks
   the persisted LD-NBSE evidence, milestones, recommendations and history.
   Safe to re-run. Run:  node backend/scripts/_smokeSkillGame.js
*/
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("../models/User");
const SkillAttempt = require("../models/SkillAttempt");
const SkillMilestone = require("../models/SkillMilestone");
const StudentSkillProfile = require("../models/StudentSkillProfile");
const StudentLearningDNA = require("../models/StudentLearningDNA");
const SkillProgressHistory = require("../models/SkillProgressHistory");
const LearningRecommendation = require("../models/LearningRecommendation");

// Server-side content + graders (same machine as the server under test).
const catalog = require("../config/class8SkillsCatalog");
const bridge = require("../services/skillLdBridge");

const MODELS = {
  SkillAttempt,
  StudentSkillProfile,
  StudentLearningDNA,
  SkillProgressHistory,
  LearningRecommendation,
  StudentInterestProfile: { findOne: async () => null },
  LdnbsConfig: require("../models/LdnbsConfig"),
};

const API = process.env.API_URL || "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let failures = 0;
function check(name, cond, extra) {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra) : ""}`);
}

async function waitForApi(tries = 24) {
  for (let i = 0; i < tries; i += 1) {
    try {
      await axios.get(`${API}/class8-skills/categories`);
      return true;
    } catch (e) {
      if (e.response && [401, 404].includes(e.response.status)) return true;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}

const BANNED = ["answerIndex", "correctOrder", "explanation", "rule", "bucket"];
function secrecyOk(tasks) {
  const s = JSON.stringify(tasks || []);
  return BANNED.every((k) => !new RegExp(`"${k}"`).test(s));
}

// A correct `given` for a server-side task (answer keys visible here only).
function correctGiven(task) {
  switch (task.type) {
    case "choice":
    case "pattern":
    case "decode":
      return task.answerIndex;
    case "order":
      return task.steps.map((s) => s.id);
    case "sort":
      return Object.fromEntries(task.items.map((it) => [it.id, task.buckets[it.bucket].id]));
    case "match":
      return task.pairs.map((p) => ({ aId: p.a.id, bId: p.b.id }));
    case "speak":
    case "create":
      return { done: true };
    default:
      return null;
  }
}

async function answerAll(auth, attemptId, tasks, { wrongOnce = false } = {}) {
  for (let i = 0; i < tasks.length; i += 1) {
    const given = correctGiven(tasks[i]);
    if (wrongOnce && i === 0 && tasks[i].options && tasks[i].options.length > 1) {
      const wrong = (tasks[i].answerIndex + 1) % tasks[i].options.length;
      const wr = await axios.post(`${API}/class8-skills/attempts/${attemptId}/answer`, { taskIndex: i, given: wrong }, auth).catch((e) => e.response);
      check(`answer ${i}: wrong attempt rejected as incorrect`, wr.data && wr.data.success === true && wr.data.correct === false, wr.data);
    }
    const res = await axios.post(`${API}/class8-skills/attempts/${attemptId}/answer`, { taskIndex: i, given }, auth).catch((e) => e.response);
    const isPractice = tasks[i].type === "speak" || tasks[i].type === "create";
    check(`answer ${i}: server graded (${tasks[i].type})`,
      res.data && res.data.success === true && res.data.correct === true &&
      (isPractice ? res.data.explanation === null : typeof res.data.explanation === "string"),
      res.data);
  }
}

async function playGame(auth, studentId, skillId, activityId, level, label) {
  const start = (await axios.post(`${API}/class8-skills/attempts`, { skillId, activityId, level }, auth)).data;
  check(`${label}: started level ${level}`, start.success && start.attempt && start.attempt.status === "in_progress" && start.attempt.level === level, start.attempt && { mode: start.attempt.mode, level: start.attempt.level });
  const activity = catalog.activityById(skillId, activityId);
  const tasks = catalog.tasksForLevel(activity, level);
  check(`${label}: ${tasks.length} tasks served without answer keys`, start.tasks && start.tasks.length === tasks.length && secrecyOk(start.tasks), start.tasks && start.tasks.length);
  await answerAll(auth, start.attempt._id, tasks);
  const comp = (await axios.post(`${API}/class8-skills/attempts/${start.attempt._id}/complete`, {}, auth)).data;
  check(`${label}: completed`, comp.success && comp.summary && comp.summary.status === "completed", comp.summary);
  return { start, comp };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const up = await waitForApi();
  check("backend reachable", up);
  if (!up) { process.exit(1); }

  const stamp = Date.now();
  const user1 = await User.create({ name: "Smoke Skill One", email: `smoke-sk1-${stamp}@uyarvu.test`, password: "x", role: "student", userType: "school_student", classLevel: "8", isVerified: true });
  const user2 = await User.create({ name: "Smoke Skill Two", email: `smoke-sk2-${stamp}@uyarvu.test`, password: "x", role: "student", userType: "school_student", classLevel: "8", isVerified: true });
  const auth1 = { headers: { Authorization: `Bearer ${jwt.sign({ id: user1._id }, JWT_SECRET)}` } };
  const auth2 = { headers: { Authorization: `Bearer ${jwt.sign({ id: user2._id }, JWT_SECRET)}` } };

  try {
    /* ── 0. categories + pre-state ────────────────────────────────────── */
    const cats = (await axios.get(`${API}/class8-skills/categories`, auth1)).data;
    check("categories: 8 skill areas", cats.success && cats.categories && cats.categories.length === 8, cats.categories && cats.categories.length);
    check("categories: every area has 3 games + identity", cats.categories.every((c) => c.activityCount === 3 && c.name && c.color && c.icon && c.activityIds.length === 3));
    const d0 = (await axios.get(`${API}/class8-skills/dashboard`, auth1)).data;
    check("dashboard: fresh student has no evidence", d0.success && d0.totalCompleted === 0 && d0.diagnostic.completed === false, d0.totalCompleted);
    check("dashboard: recommendation is 'take the diagnostic'", d0.recommendation && d0.recommendation.kind === "diagnostic", d0.recommendation);

    /* ── 1. diagnostic: start → hints → answers → complete ───────────── */
    const diag = (await axios.post(`${API}/class8-skills/attempts`, { skillId: "diagnostic", activityId: "diagnostic", mode: "diagnostic" }, auth1)).data;
    const diagTasks = catalog.getDiagnostic();
    check("diagnostic: 8 tasks served", diag.success && diag.tasks && diag.tasks.length === 8, diag.tasks && diag.tasks.length);
    check("diagnostic: tasks stripped of answer keys", secrecyOk(diag.tasks));
    const aid = diag.attempt._id;

    const h0 = (await axios.post(`${API}/class8-skills/attempts/${aid}/hint`, { taskIndex: 0 }, auth1)).data;
    check("hint 0 revealed", h0.success && typeof h0.hint === "string" && h0.hint.length > 3, h0.hint);
    const h1 = (await axios.post(`${API}/class8-skills/attempts/${aid}/hint`, { taskIndex: 1 }, auth1)).data;
    check("hint 1 revealed", h1.success);
    const h2 = (await axios.post(`${API}/class8-skills/attempts/${aid}/hint`, { taskIndex: 2 }, auth1).catch((e) => e.response)).data;
    check("hint 3 blocked by limit (2 per run)", h2.success === false && h2.code === "HINT_LIMIT", h2);

    await answerAll(auth1, aid, diagTasks, { wrongOnce: true });

    const comp = (await axios.post(`${API}/class8-skills/attempts/${aid}/complete`, {}, auth1)).data;
    check("diagnostic: completed + summary", comp.success && comp.summary && comp.summary.mode === "diagnostic" && comp.summary.score >= 60, comp.summary && { score: comp.summary.score, hintCount: comp.summary.hintCount });
    check("diagnostic: deterministic evidence only", comp.summary.totalTasks === 8 && comp.summary.correctCount === 8, comp.summary);
    check("diagnostic: milestones diagnostic_done + first_mission", (comp.newlyEarnedMilestones || []).includes("diagnostic_done") && (comp.newlyEarnedMilestones || []).includes("first_mission"), comp.newlyEarnedMilestones);
    check("diagnostic: encouragement present (AI or deterministic)", typeof comp.encouragement === "string" && comp.encouragement.length > 0, comp.encouragement);

    // Idempotency: completing again must not double-count evidence.
    const profBefore = await StudentSkillProfile.countDocuments({ studentId: user1._id });
    const comp2 = (await axios.post(`${API}/class8-skills/attempts/${aid}/complete`, {}, auth1)).data;
    check("diagnostic: duplicate complete is idempotent", comp2.success && comp2.alreadyCompleted === true, comp2.alreadyCompleted);
    const profAfter = await StudentSkillProfile.countDocuments({ studentId: user1._id });
    check("diagnostic: no profile change on re-complete", profBefore === profAfter, { profBefore, profAfter });

    // Persisted LD evidence.
    check("LD: 8 profile rows (one per subskill)", profAfter === 8, profAfter);
    const rec = await LearningRecommendation.findOne({ studentId: user1._id, mode: "skills" }).sort({ submittedAt: -1 }).lean();
    check("LD: skills-mode recommendation persisted", !!rec && !!rec.primaryFocus && !!rec.primaryFocus.subskill, rec && rec.primaryFocus);
    const dna = await StudentLearningDNA.findOne({ studentId: user1._id }).lean();
    check("LD: learning DNA row written", !!dna && !!dna.dimensions, dna && dna.dimensions && Object.keys(dna.dimensions || {}).length);
    const hist = await SkillProgressHistory.countDocuments({ studentId: user1._id });
    check("LD: progress history rows written", hist >= 8, hist);
    const rows = await bridge.buildAnsweredQuestions({ studentId: user1._id, models: MODELS });
    check("LD: deterministic evidence rows fed", rows.length >= 8, rows.length);
    const ms = await SkillMilestone.find({ studentId: user1._id }).lean();
    check("DB: diagnostic_done milestone stored", ms.some((m) => m.code === "diagnostic_done"), ms.map((m) => m.code));

    /* ── 2. practice-only (speak) must NOT create accuracy evidence ───── */
    const practiceRun = await playGame(auth1, user1._id, "communication", "speak-up", 1, "speak-up L1");
    check("speak: practice counts no deterministic tasks", practiceRun.comp.summary.totalTasks === 0 && practiceRun.comp.summary.stars === 2, practiceRun.comp.summary);
    const rowsAfterSpeak = await bridge.buildAnsweredQuestions({ studentId: user1._id, models: MODELS });
    check("speak: no accuracy rows added", rowsAfterSpeak.length === rows.length, { before: rows.length, after: rowsAfterSpeak.length });
    check("speak: creative_thinker milestone", (practiceRun.comp.newlyEarnedMilestones || []).includes("creative_thinker"), practiceRun.comp.newlyEarnedMilestones);

    /* ── 3. level gating (performance-based, not completion) ──────────── */
    const lockedRes = await axios.post(`${API}/class8-skills/attempts`, { skillId: "logical-thinking", activityId: "pattern-master", level: 2 }, auth1).catch((e) => e.response);
    check("gate: level 2 locked before level 1 pass", lockedRes.status === 400 && lockedRes.data && lockedRes.data.code === "LOCKED", lockedRes.data);

    const run1 = await playGame(auth1, user1._id, "logical-thinking", "pattern-master", 1, "pattern-master L1");
    check("gate: L1 clean run scores 100", run1.comp.summary.score === 100 && run1.comp.summary.hintCount === 0, run1.comp.summary);
    check("gate: independent_solver milestone", (run1.comp.newlyEarnedMilestones || []).includes("independent_solver"), run1.comp.newlyEarnedMilestones);

    const gate2 = (await axios.post(`${API}/class8-skills/attempts`, { skillId: "logical-thinking", activityId: "pattern-master", level: 2 }, auth1)).data;
    check("gate: level 2 now unlocked (score ≥ 60)", gate2.success && gate2.attempt && gate2.attempt.level === 2, gate2.attempt && { level: gate2.attempt.level, status: gate2.attempt.status });

    /* ── 4. hint reduces evidence weight (recorded row) ───────────────── */
    const pm = catalog.activityById("logical-thinking", "pattern-master");
    const pmTasks2 = catalog.tasksForLevel(pm, 2);
    const hL2 = (await axios.post(`${API}/class8-skills/attempts/${gate2.attempt._id}/hint`, { taskIndex: 0 }, auth1)).data;
    check("weight: hint served toward recorded weight", hL2.success && typeof hL2.hint === "string", hL2.hint);
    await answerAll(auth1, gate2.attempt._id, pmTasks2);
    const row0 = await SkillAttempt.findById(gate2.attempt._id).lean();
    const baseW0 = catalog.weightForTask(pm, 2, 0);
    check("weight: hint cuts evidence weight (×0.6)", row0.answers[0].weight === Math.round(baseW0 * 0.6 * 10) / 10, { row: row0.answers[0].weight, base: baseW0 });
    const compL2 = (await axios.post(`${API}/class8-skills/attempts/${gate2.attempt._id}/complete`, {}, auth1)).data;
    check("gate: L2 completed clean", compL2.success && compL2.summary.score >= 85, compL2.summary && compL2.summary.score);

    /* ── 5. more categories → explorer + real-life-champion milestones ── */
    const runW = await playGame(auth1, user1._id, "environment", "waste-sorting", 1, "waste-sorting L1");
    check("explorer: skill_explorer after 3rd category", (runW.comp.newlyEarnedMilestones || []).includes("skill_explorer"), runW.comp.newlyEarnedMilestones);
    await playGame(auth1, user1._id, "digital", "digital-explorer", 1, "digital-explorer L1");
    const runS = await playGame(auth1, user1._id, "social", "cooperation-challenge", 1, "cooperation-challenge L1");
    check("champion: real_life_champion after 5th activity", (runS.comp.newlyEarnedMilestones || []).includes("real_life_champion"), runS.comp.newlyEarnedMilestones);

    /* ── 6. isolation: second student sees nothing of student 1 ───────── */
    const d2 = (await axios.get(`${API}/class8-skills/dashboard`, auth2)).data;
    check("isolation: second student has zero activity", d2.success && d2.totalCompleted === 0 && d2.recentCompletions.length === 0, d2.totalCompleted);
    const h2hist = (await axios.get(`${API}/class8-skills/history`, auth2)).data;
    check("isolation: second student history empty", h2hist.success && h2hist.history.length === 0, h2hist.history.length);
    const intrude = await axios.post(`${API}/class8-skills/attempts/${gate2.attempt._id}/answer`, { taskIndex: 0, given: 0 }, auth2).catch((e) => e.response);
    check("isolation: cannot answer another student's attempt", intrude.status === 404, intrude.status);

    /* ── 7. reports ───────────────────────────────────────────────────── */
    const dash = (await axios.get(`${API}/class8-skills/dashboard`, auth1)).data;
    check("dashboard: diagnostic done + recommendation upgraded (non-diagnostic)", dash.success && dash.diagnostic.completed === true && dash.recommendation && typeof dash.recommendation.categoryId === "string" && dash.recommendation.categoryId !== "diagnostic" && typeof dash.recommendation.reason === "string", dash.recommendation && { categoryId: dash.recommendation.categoryId, source: dash.recommendation.source });
    const history = (await axios.get(`${API}/class8-skills/history`, auth1)).data;
    check("history: 7 completed attempts (1 diagnostic + 6 play)", history.success && history.history.filter((x) => x.status === "completed").length === 7, history.history.map((x) => `${x.activityId}@L${x.level}`));
    const recs = (await axios.get(`${API}/class8-skills/recommendations`, auth1)).data;
    check("recommendations: top + alternatives + reason", recs.success && recs.recommendation && recs.recommendation.categoryId && typeof recs.recommendation.reason === "string" && Array.isArray(recs.alternatives), recs.recommendation && { categoryId: recs.recommendation.categoryId, reason: recs.recommendation.reason });
    const mstones = (await axios.get(`${API}/class8-skills/milestones`, auth1)).data;
    const codes = mstones.milestones.map((m) => m.code);
    check("milestones: 5 deterministic milestones stored", ["first_mission", "diagnostic_done", "skill_explorer", "independent_solver", "creative_thinker", "real_life_champion"].every((c) => codes.includes(c)), codes);

    // Category page shape.
    const catPg = (await axios.get(`${API}/class8-skills/categories/logical-thinking`, auth1)).data;
    check("category page: activities carry level unlock + best score", catPg.success && catPg.activities.length === 3 && catPg.activities[0].unlockedLevels.includes(1) && typeof catPg.activities[0].mechanic === "string", catPg.activities && catPg.activities[0]);
    const actPg = (await axios.get(`${API}/class8-skills/categories/logical-thinking/activities/pattern-master`, auth1)).data;
    check("activity page: level 2 unlocked after pass", actPg.success && actPg.levels[1].unlocked === true && actPg.levels[1].bestScore === 100, actPg.levels && actPg.levels[1]);

    console.log(failures === 0 ? "\nALL SKILL-ADVENTURE SMOKE CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  } finally {
    for (const uid of [user1._id, user2._id]) {
      await SkillAttempt.deleteMany({ studentId: uid });
      await SkillMilestone.deleteMany({ studentId: uid });
      await StudentSkillProfile.deleteMany({ studentId: uid });
      await StudentLearningDNA.deleteMany({ studentId: uid });
      await SkillProgressHistory.deleteMany({ studentId: uid });
      await LearningRecommendation.deleteMany({ studentId: uid });
    }
    await User.deleteOne({ _id: user1._id });
    await User.deleteOne({ _id: user2._id });
    await mongoose.disconnect();
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error("SMOKE CRASH", e); process.exit(2); });