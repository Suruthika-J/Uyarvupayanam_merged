/* One-off smoke test for the Class 8 Maths Space Adventure stack.
   Creates a throwaway student, plays the Fractions world start-to-finish
   through the real HTTP API, verifies the world metadata, star awards,
   boss flags, topic completion + nextTopic, then removes every trace.
   Safe to re-run. Run:  node backend/scripts/_smokeMathsAdventure.js
*/
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("../models/User");
const MathMissionQuestion = require("../models/MathMissionQuestion");
const StudentMathMissionProgress = require("../models/StudentMathMissionProgress");
const StudentMathAttempt = require("../models/StudentMathAttempt");

const API = process.env.API_URL || "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let failures = 0;
function check(name, cond, extra) {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra) : ""}`);
}

async function waitForApi(tries = 20) {
  for (let i = 0; i < tries; i += 1) {
    try {
      await axios.get(`${API}/maths/missions/progress`);
      return true;
    } catch (e) {
      if (e.response && e.response.status === 401) return true; // api is up, needs auth
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}

// A valid answer a student could send for this question. correctAnswer may be
// a single string OR an array of accepted answers; for order-based types the
// whole ordered array is the answer, otherwise pick one accepted candidate.
function answerFor(q) {
  if (q.questionType === "arrange-steps" || q.questionType === "drag-and-drop") {
    return Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
  }
  if (Array.isArray(q.correctAnswer)) return q.correctAnswer[0];
  return q.correctAnswer;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const up = await waitForApi();
  check("backend reachable", up);
  if (!up) { process.exit(1); }

  const email = `smoke-adventure-${Date.now()}@uyarvu.test`;
  const user = await User.create({
    name: "Smoke Explorer", email, password: "x",
    role: "student", userType: "school_student", classLevel: "8", isVerified: true,
  });
  const auth = { headers: { Authorization: `Bearer ${jwt.sign({ id: user._id }, JWT_SECRET)}` } };

  try {
    // ── 1. Adventure map overview ──────────────────────────────────────────
    const prog = (await axios.get(`${API}/maths/missions/progress`, auth)).data.data;
    check("overview: 15 topics served", prog.topics && prog.topics.length === 15, prog.topics && prog.topics.length);
    const t0 = prog.topics[0];
    check("overview: topic has world identity", t0 && t0.worldName && t0.world && t0.accent && t0.tagline,
      t0 && { worldName: t0.worldName, world: t0.world, accent: t0.accent });
    check("overview: first world unlocked", t0 && t0.unlocked === true);
    check("overview: worlds 2..15 locked", prog.topics.slice(1).every((t) => t.unlocked === false));
    check("overview: totals shipped", typeof prog.totalScore === "number" && typeof prog.totalStars === "number" && prog.totalMissions > 0,
      { score: prog.totalScore, stars: prog.totalStars, totalMissions: prog.totalMissions });
    check("overview: currentTopic = first world", prog.currentTopic && prog.currentTopic.id === prog.topics[0].id,
      prog.currentTopic && prog.currentTopic.worldName);
    check("overview: per-topic fields complete", prog.topics.every((t) => typeof t.stars === "number" && typeof t.completedMissions === "number" && typeof t.masteryPercentage === "number"));

    // ── 2. Fractions planet ────────────────────────────────────────────────
    const topic = (await axios.get(`${API}/maths/missions/topic/fractions`, auth)).data.data;
    check("topic: world meta on planet", topic.topic && topic.topic.worldName === "Fraction Planet" && topic.topic.world === "planet" && topic.topic.accent,
      topic.topic && { worldName: topic.topic.worldName, world: topic.topic.world, accent: topic.topic.accent });
    check("topic: 6 missions", topic.missions && topic.missions.length === 6, topic.missions && topic.missions.length);
    const last = topic.missions.length - 1;
    check("topic: only last mission flagged boss", topic.missions[last].isBoss === true && topic.missions.slice(0, last).every((m) => !m.isBoss));
    check("topic: mission 1 current", topic.missions[0].status === "current");
    check("topic: mission 2 locked", topic.missions[1].status === "locked");
    check("topic: nextTopic shape (pre-complete)", topic.nextTopic === null || (topic.nextTopic.id && topic.nextTopic.worldName),
      topic.nextTopic && topic.nextTopic.worldName);
    check("topic: taglines present", Boolean(topic.missions[0].tagline) && Boolean(topic.topic.tagline));

    // ── 3. Play all six missions for real ──────────────────────────────────
    const starsPerMission = {};
    for (let mIdx = 0; mIdx < topic.missions.length; mIdx += 1) {
      const mission = topic.missions[mIdx];
      const sess = (await axios.get(`${API}/maths/missions/questions`, { ...auth, params: { topic: "fractions", mission: mission.missionId } })).data.data;
      check(`session ${mission.missionId}: steps built`, sess.steps && sess.steps.length >= 4, sess.steps && sess.steps.length);
      check(`session ${mission.missionId}: mission meta`, sess.mission && sess.mission.name === mission.name && sess.mission.reward);

      const qSteps = sess.steps.filter((s) => s.type === "question");
      let firstAnswered = false;
      for (const st of qSteps) {
        const q = await MathMissionQuestion.findOne({ questionId: st.questionId }).lean();
        // Exercise the wrong-answer path ONCE on the very first graded question.
        if (!firstAnswered && mIdx === 0) {
          const wrong = (await axios.post(`${API}/maths/missions/${st.questionId}/answer`, { answer: "definitely-not-right" }, auth)).data.data;
          check("answer: wrong attempt is reported", wrong && wrong.correct === false, wrong && { correct: wrong.correct });
          firstAnswered = true;
        }
        const res = (await axios.post(`${API}/maths/missions/${st.questionId}/answer`, { answer: answerFor(q) }, auth)).data.data;
        if (res.missionCompleted) starsPerMission[mission.missionId] = res.stars;
        if (mIdx === last && res.missionCompleted) {
          check("boss: clean run awards 3 stars on first completion", res.missionCompleted === true && res.stars === 3, { completed: res.missionCompleted, stars: res.stars });
          check("boss: topic just completed + nextTopic with worldName", res.justCompletedTopic === true && res.topicCompleted === true && res.nextTopic && res.nextTopic.worldName,
            res.nextTopic && { worldName: res.nextTopic.worldName, id: res.nextTopic.id });
        }
      }
    }

    // ── 4. Star spread: 2 from the deliberate stumble, 3 for clean runs ────
    check("stars: first mission 2 (one deliberate mistake)", starsPerMission[topic.missions[0].missionId] === 2, starsPerMission);
    check("stars: five clean missions each 3", topic.missions.slice(1).every((m) => starsPerMission[m.missionId] === 3), starsPerMission);

    // ── 5. State after conquering the planet ───────────────────────────────
    const after = (await axios.get(`${API}/maths/missions/topic/fractions`, auth)).data.data;
    check("after: all missions completed", after.missions.every((m) => m.status === "completed"));
    check("after: progress topicCompleted + 100%", after.progress.topicCompleted === true && after.progress.masteryPercentage === 100,
      { topicCompleted: after.progress.topicCompleted, mastery: after.progress.masteryPercentage });
    const bossStarsAfter = after.missions[last].stars;
    check("after: boss mission stars persisted (3)", bossStarsAfter === 3, bossStarsAfter);
    check("after: every mission has its stars", after.missions.every((m) => m.stars >= 2), after.missions.map((m) => m.stars));
    check("after: nextTopic leads to another world", after.nextTopic && after.nextTopic.id === "integers" && after.nextTopic.worldName === "Number Moon",
      after.nextTopic && { id: after.nextTopic.id, worldName: after.nextTopic.worldName });

    const prog2 = (await axios.get(`${API}/maths/missions/progress`, auth)).data.data;
    const expectedStars = Object.values(starsPerMission).reduce((s, v) => s + v, 0);
    check("overview: first world completed + stars sum", prog2.topics[0].completed === true && prog2.topics[0].stars === expectedStars,
      { completed: prog2.topics[0].completed, stars: prog2.topics[0].stars, expectedStars });
    check("overview: second world now unlocked", prog2.topics[1].unlocked === true);
    check("overview: totalStars = sum", prog2.totalStars === expectedStars, prog2.totalStars);
    check("overview: currentTopic advanced", prog2.currentTopic && prog2.currentTopic.id === prog2.topics[1].id, prog2.currentTopic && prog2.currentTopic.worldName);

    // ── 6. Replay cannot farm points or stars ──────────────────────────────
    const replaySess = (await axios.get(`${API}/maths/missions/questions`, { ...auth, params: { topic: "fractions", mission: topic.missions[last].missionId } })).data.data;
    const replayQ = replaySess.steps.find((s) => s.slot === "boss");
    const qDoc = await MathMissionQuestion.findOne({ questionId: replayQ.questionId }).lean();
    const replay = (await axios.post(`${API}/maths/missions/${replayQ.questionId}/answer`, { answer: answerFor(qDoc) }, auth)).data.data;
    check("replay: no re-award", replay.missionCompleted === false && replay.stars === 0 && replay.earned === 0,
      { missionCompleted: replay.missionCompleted, stars: replay.stars, earned: replay.earned });
    const kept = await StudentMathMissionProgress.findOne({ studentId: user._id, topic: "fractions" }).lean();
    check("replay: best star kept", kept.missionStars[topic.missions[last].missionId] === 3, kept.missionStars);

    console.log(failures === 0 ? "\nALL SMOKE CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  } finally {
    await StudentMathAttempt.deleteMany({ studentId: user._id });
    await StudentMathMissionProgress.deleteMany({ studentId: user._id });
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error("Smoke run crashed:", e); process.exit(2); });