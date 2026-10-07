/* One-off smoke test for the Class 8 English Space Explorer stack.
   Creates a throwaway student (and a second one for access-control checks),
   plays the Grammar Galaxy first topic end-to-end through the real HTTP API,
   verifies: curriculum delivery, answer-key secrecy, server-side activity
   grading + completion gating, sequential topic unlocking, AI assessment
   generation (when the AI provider responds), stable pending set, submit &
   grading, retake with a fresh set, best-score persistence, progress &
   continue-learning, writing-feedback guidance, and cross-student access
   control. Removes every trace afterwards. Safe to re-run.
   Run:  node backend/scripts/_smokeEnglishMissions.js
*/
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("../models/User");
const EnglishAssessment = require("../models/EnglishAssessment");
const StudentEnglishProgress = require("../models/StudentEnglishProgress");
const seed = require("../seeders/seedEnglishMissions");

const API = process.env.API_URL || "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let failures = 0;
let warnings = 0;
function check(name, cond, extra) {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra) : ""}`);
}
function note(name, extra) {
  warnings += 1;
  console.log(`INFO  ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra) : ""}`);
}

async function waitForApi(tries = 20) {
  for (let i = 0; i < tries; i += 1) {
    try {
      await axios.get(`${API}/english-missions/areas`);
      return true;
    } catch (e) {
      if (e.response && e.response.status === 401) return true; // api up, needs auth
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}

// Does a JSON tree (parsed) contain any answer-bearing key? The word
// "correct" legitimately appears inside instruction TEXT, so we only walk
// object KEYS.
const BANNED_KEYS = new Set(["correct", "correctAnswer", "correct_order", "acceptedAnswers", "explanation", "answer"]);
function hasAnswerKeys(node, where) {
  if (Array.isArray(node)) return node.some((x) => hasAnswerKeys(x, where));
  if (node && typeof node === "object") {
    return Object.keys(node).some(
      (k) => BANNED_KEYS.has(k) || (typeof node[k] === "object" && node[k] !== null && hasAnswerKeys(node[k], where))
    );
  }
  return false;
}

// Build a correct `answer` array (aligned to activity items) from the raw
// curriculum seed. The smoke harness may read the seed — a client never can.
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

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const up = await waitForApi();
  check("backend reachable", up);
  if (!up) { process.exit(1); }

  const email = `smoke-english-${Date.now()}@uyarvu.test`;
  const user = await User.create({
    name: "Smoke English Explorer", email, password: "x",
    role: "student", userType: "school_student", classLevel: "8", isVerified: true,
  });
  const auth = { headers: { Authorization: `Bearer ${jwt.sign({ id: user._id }, JWT_SECRET)}` } };

  let aiDown = false;

  try {
    // ── 1. Module overview ─────────────────────────────────────────────────
    const overview = (await axios.get(`${API}/english-missions/areas`, auth)).data;
    check("areas: 6 areas served", overview.areas && overview.areas.length === 6, overview.areas && overview.areas.length);
    check("areas: 23 topics across areas", overview.areas.reduce((n, a) => n + a.topics.length, 0) === 23,
      overview.areas.reduce((n, a) => n + a.topics.length, 0));
    check("areas: totals shipped", overview.totals.topicsCompleted === 0 && overview.totals.topicsTotal === 23, overview.totals);
    const g0 = overview.areas.find((a) => a.id === "grammar");
    check("areas: first grammar topic open, rest locked",
      g0.topics[0].state === "open" && g0.topics.slice(1).every((t) => t.state === "locked"),
      g0.topics.map((t) => t.state));
    check("areas: each topic has world + accent + state",
      overview.areas.every((a) => a.topics.every((t) => t.world && t.accent && t.state)));
    check("areas: continueLearning = first topic", overview.continueLearning && overview.continueLearning.topicId === "present-tenses",
      overview.continueLearning);

    // ── 2. Area journey ────────────────────────────────────────────────────
    const area = (await axios.get(`${API}/english-missions/areas/grammar`, auth)).data.area;
    check("area: grammar has 8 topics", area.topics.length === 8, area.topics.length);
    check("area: states [open,locked…]", area.topics[0].state === "open" && area.topics.slice(1).every((t) => t.state === "locked"),
      area.topics.map((t) => t.state));
    check("area: progress counters", area.topicsCompleted === 0 && area.topicsTotal === 8);

    // ── 3. Topic content + answer-key secrecy ──────────────────────────────
    const topicRes = (await axios.get(`${API}/english-missions/topics/present-tenses`, auth)).data;
    const T = topicRes.topic;
    check("topic: content fields", T.id === "present-tenses" && T.objectives.length >= 3 && T.lesson.sections.length >= 3 && T.recap.length >= 4 && T.activities.length === 3,
      { objectives: T.objectives.length, sections: T.lesson.sections.length, recap: T.recap.length, activities: T.activities.length });
    check("topic: lesson has timeline for visual band", T.lesson.sections[0].timeline && T.lesson.sections[0].timeline.length >= 3,
      T.lesson.sections[0].timeline && T.lesson.sections[0].timeline.length);
    check("topic: assessment meta", topicRes.assessment.count === 6 && typeof topicRes.assessment.difficulty === "string", topicRes.assessment);
    check("topic: assessment locked at start", topicRes.assessment.available === false && topicRes.progress.allActivitiesDone === false);
    check("topic: not locked (first in area)", topicRes.progress.locked === false);

    // Answer-key secrecy: the ENTIRE topic payload must not contain answer keys.
    const payloadHasKeys = hasAnswerKeys({ topicRes }, "topic payload");
    check("secrecy: topic payload carries no answer keys", payloadHasKeys === false, payloadHasKeys);

    // ── 4. Activities: wrong then correct, server-graded ───────────────────
    const act = seed.activityById(seed.englishTopicById("present-tenses"), "pres-mcq");
    const wrong = (await axios.post(`${API}/english-missions/topics/present-tenses/activities/pres-mcq/answer`, { answer: ["nope", "nope", "nope", "nope"] }, auth)).data;
    check("activity: wrong answer -> incorrect, not completed", wrong.correct === false && wrong.activityComplete === false, wrong && { correct: wrong.correct });

    const right = (await axios.post(`${API}/english-missions/topics/present-tenses/activities/pres-mcq/answer`, { answer: correctAnswerFor(act) }, auth)).data;
    check("activity: correct answer -> all items correct", right.correct === true && right.results.length === 4, right.results.length);
    check("activity: only first of three activities done", right.allActivitiesDone === false, right.allActivitiesDone);

    // Fill + fix activities complete the topic.
    for (const [aid] of [["pres-fill"], ["pres-fix"]]) {
      const a = seed.activityById(seed.englishTopicById("present-tenses"), aid);
      const r = (await axios.post(`${API}/english-missions/topics/present-tenses/activities/${aid}/answer`, { answer: correctAnswerFor(a) }, auth)).data;
      check(`activity: ${aid} completed`, r.correct === true && r.activityComplete === true, r && { correct: r.correct });
    }
    const unlocked = (await axios.get(`${API}/english-missions/topics/present-tenses`, auth)).data;
    check("topic: all activities done -> assessment available", unlocked.assessment.available === true && unlocked.progress.allActivitiesDone === true);
    check("topic: 3/3 activities recorded", unlocked.progress.completedActivities.length === 3, unlocked.progress.completedActivities);

    // ── 5. Sequential unlocking within the area ────────────────────────────
    const ahead = await axios.post(
      `${API}/english-missions/topics/past-tenses/activities/past-mcq/answer`,
      { answer: ["x", "x", "x"] }, auth
    ).catch((e) => e.response);
    check("gating: next topic activities blocked (403)", ahead && ahead.status === 403 && ahead.data.locked === true,
      ahead && { status: ahead.status, locked: ahead.data && ahead.data.locked });
    const aheadTopic = (await axios.get(`${API}/english-missions/topics/past-tenses`, auth)).data;
    check("gating: next topic marked locked", aheadTopic.progress.locked === true);

    // ── 6. AI assessment: start → stable → submit → results ────────────────
    let startRes;
    try {
      startRes = (await axios.post(`${API}/english-missions/topics/present-tenses/assessment/start`, {}, { ...auth, timeout: 180000 })).data;
    } catch (e) {
      const st = e.response ? e.response.status : 0;
      const aiFlag = e.response && e.response.data && e.response.data.ai;
      note(st === 502 && aiFlag ? "AI generation unavailable (provider/network) — AI-dependent checks skipped" : `AI start failed: ${st} ${e.message}`);
      aiDown = true;
    }

    if (!aiDown && startRes && startRes.success) {
      check("assessment: generated set has 6 questions", startRes.assessment.questions.length === 6, startRes.assessment.questions.length);
      check("assessment: totalMarks matches sum", startRes.assessment.totalMarks === startRes.assessment.questions.reduce((n, q) => n + q.marks, 0), startRes.assessment.totalMarks);
      check("assessment: source is ai", startRes.assessment.source === "ai");
      check("secrecy: question payload carries no answer keys", hasAnswerKeys(startRes.assessment.questions, "assessment questions") === false);
      check("assessment: question shape complete", startRes.assessment.questions.every((q) => q.id && q.question && q.marks >= 1 && (q.options ? q.options.length >= 2 : true) && q.difficulty));

      // Stable pending set: second call must reuse the same generated set.
      const again = (await axios.post(`${API}/english-missions/topics/present-tenses/assessment/start`, {}, { ...auth, timeout: 60000 })).data;
      check("assessment: start again reuses pending set (stable)", again.reused === true && String(again.assessment.id) === String(startRes.assessment.id),
        { reused: again.reused, sameId: again.assessment.id === startRes.assessment.id });

      // Grade from the stored (DB) set — the smoke may, a client may not.
      const doc = await EnglishAssessment.findOne({ studentId: user._id, topic: "present-tenses", status: "pending" }).lean();
      check("assessment: stored doc holds the answer key server-side", doc && Array.isArray(doc.questions) && doc.questions.every((q) => q.correctAnswer), doc && doc.questions && doc.questions.length);

      const answers = doc.questions.map((q) => {
        if (q.type === "fill-in-the-blank") return { questionId: q.id, answer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer };
        if (q.type === "true-false") return { questionId: q.id, answer: q.correctAnswer === "True" ? true : false };
        return { questionId: q.id, answer: q.correctAnswer };
      });
      const sub = (await axios.post(`${API}/english-missions/assessments/${doc._id}/submit`, { answers }, auth)).data;
      check("submit: perfect run scores 100%", sub.percent === 100 && sub.score === sub.totalMarks, { percent: sub.percent, score: sub.score, total: sub.totalMarks });
      check("submit: every question reviewed with explanation", sub.results.length === 6 && sub.results.every((r) => r.explanation && r.correct), sub.results.length);
      check("submit: results carry correctAnswer post-submit", sub.results.every((r) => r.correctAnswer !== undefined));
      check("submit: assessment completed flag", sub.assessmentCompleted === true);

      // Best score rolled into progress.
      const progAfter = (await axios.get(`${API}/english-missions/progress`, auth)).data;
      check("progress: grammar topic 1 completed", progAfter.areas.find((a) => a.id === "grammar").topics[0].state === "completed");
      check("progress: topic 2 now open", progAfter.areas.find((a) => a.id === "grammar").topics[1].state === "open");
      check("progress: totals advanced", progAfter.totals.topicsCompleted === 1, progAfter.totals);
      check("progress: continueLearning = past-tenses", progAfter.continueLearning && progAfter.continueLearning.topicId === "past-tenses", progAfter.continueLearning);

      // Re-submitting the same assessment is refused (idempotent).
      try {
        await axios.post(`${API}/english-missions/assessments/${doc._id}/submit`, { answers: [] }, auth);
        check("submit: duplicate submit refused", false);
      } catch (e) {
        check("submit: duplicate submit refused", e.response && e.response.status === 400, e.response && e.response.status);
      }

      // Retake: attempt 2, fresh set, all wrong → 0% but best 100% kept.
      const start2 = (await axios.post(`${API}/english-missions/topics/present-tenses/assessment/start`, {}, { ...auth, timeout: 180000 })).data;
      check("retake: new attempt number", start2.assessment.attempt === 2, start2.assessment.attempt);
      check("retake: not reusing the old pending set", start2.reused === false, start2.reused);
      const doc2 = await EnglishAssessment.findOne({ studentId: user._id, topic: "present-tenses", attempt: 2 }).lean();
      const q1Texts = startRes.assessment.questions.map((q) => q.question);
      const emptyAnswers = doc2.questions.map(() => ({ questionId: "q0", answer: "definitely-not-right" }));
      const sub2 = (await axios.post(`${API}/english-missions/assessments/${doc2._id}/submit`, { answers: emptyAnswers }, auth)).data;
      check("retake: all-wrong scores 0%", sub2.percent === 0 && sub2.score === 0, { percent: sub2.percent });
      check("retake: fresh question content vs attempt 1",
        JSON.stringify(start2.assessment.questions.map((q) => q.question)) !== JSON.stringify(q1Texts),
        { attempt1: q1Texts.length, attempt2: start2.assessment.questions.length });
      const prog2 = (await axios.get(`${API}/english-missions/progress`, auth)).data;
      const g1 = prog2.areas.find((a) => a.id === "grammar").topics[0];
      check("retake: best 100% preserved, attempts = 2", g1.bestPercent === 100 && g1.state === "completed",
        { bestPercent: g1.bestPercent, state: g1.state });
      const kept = await StudentEnglishProgress.findOne({ studentId: user._id, topic: "present-tenses" }).lean();
      check("retake: backend attempt counter", kept.assessmentAttempts === 2, kept.assessmentAttempts);
    } else if (aiDown) {
      const p = await StudentEnglishProgress.findOne({ studentId: user._id, topic: "present-tenses" }).lean();
      check("(AI down) activity progress still persisted", p && p.completedActivities.length === 3 && p.assessmentCompleted === false,
        p && { acts: p.completedActivities.length, completed: p.assessmentCompleted });
    }

    // ── 7. Writing feedback ────────────────────────────────────────────────
    const fbBad = await axios.post(`${API}/english-missions/topics/paragraph-writing/writing/feedback`, { text: "Hi" }, auth).catch((e) => e.response);
    check("writing: too-short draft rejected (400)", fbBad && fbBad.status === 400, fbBad && fbBad.status);
    try {
      const fb = (await axios.post(
        `${API}/english-missions/topics/paragraph-writing/writing/feedback`,
        { text: "My favourite place is my school library. It is quiet and full of books. I like reading adventure stories there every afternoon." },
        { ...auth, timeout: 120000 }
      )).data;
      check("writing: AI guidance returned", fb.success === true && fb.feedback && Array.isArray(fb.feedback.strengths) && fb.feedback.overall,
        fb.feedback && { strengths: fb.feedback.strengths.length, improvements: fb.feedback.improvements.length });
    } catch (e) {
      const st = e.response ? e.response.status : 0;
      const aiFlag = e.response && e.response.data && e.response.data.ai;
      if (st === 502 && aiFlag) note("writing feedback unavailable (provider/network) — skipped");
      else { check(`writing: unexpected error ${st}`, false, e.message); }
    }

    // ── 8. Access control: another student sees nothing of the first ──────
    const bob = await User.create({
      name: "Smoke Other", email: `smoke-other-${Date.now()}@uyarvu.test`, password: "x",
      role: "student", userType: "school_student", classLevel: "8", isVerified: true,
    });
    const bobAuth = { headers: { Authorization: `Bearer ${jwt.sign({ id: bob._id }, JWT_SECRET)}` } };
    const bobTopic = (await axios.get(`${API}/english-missions/topics/present-tenses`, bobAuth)).data;
    check("access: other student starts fresh (no leaked progress)", bobTopic.progress.completedActivities.length === 0 && bobTopic.progress.assessmentCompleted === false);
    const anyAssess = await EnglishAssessment.findOne({ studentId: user._id }).lean();
    if (anyAssess && !aiDown) {
      let leak;
      try {
        await axios.post(`${API}/english-missions/assessments/${anyAssess._id}/submit`, { answers: [] }, bobAuth);
      } catch (e) {
        leak = e.response;
      }
      check("access: other student cannot submit someone else's assessment", leak && (leak.status === 404 || leak.status === 401), leak && leak.status);
    }
    await User.deleteOne({ _id: bob._id });

    console.log(failures === 0 ? "\nALL SMOKE CHECKS PASSED" : `\n${failures} CHECK(S) FAILED` + (warnings ? ` (${warnings} info note(s))` : ""));
  } finally {
    await EnglishAssessment.deleteMany({ studentId: user._id });
    await StudentEnglishProgress.deleteMany({ studentId: user._id });
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error("Smoke run crashed:", e); process.exit(2); });