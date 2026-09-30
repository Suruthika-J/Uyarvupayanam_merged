const express = require("express");
const router = express.Router();
const MathMission = require("../models/MathMission");
const MathMissionQuestion = require("../models/MathMissionQuestion");
const StudentMathMissionProgress = require("../models/StudentMathMissionProgress");
const StudentMathAttempt = require("../models/StudentMathAttempt");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");
const { MISSION_TOPICS, topicMetaById } = require("../seeders/seedMathMissions");

// Class 8 Maths Missions.
//   GET  /missions/topic/:topicId   - topic meta + mission chain with the
//                                     student's per-mission status.
//   GET  /missions/questions        - start a mission: concept + simple
//                                     example + the graded question session
//                                     (adaptive). Answers are never included.
//   POST /missions/:questionId/answer   - validate + grade + update progress.
//   POST /missions/:questionId/hint     - hint 1, then hint 2 (server-driven).
//   GET  /missions/:questionId/explanation - teacher explanation + answer.
//   GET  /missions/progress         - overview across all 15 topics.
//   POST /missions/progress/reset   - clear a student's mission progress.
//
// All endpoints require a student token; scoring is authoritative on the
// server (the client is never trusted with the final score).

const SCORE = {
  correct: 10,
  correctHinted: 5,
  boss: 20,
  bossHinted: 10,
  missionBonus: 25,
  topicBonus: 50,
};

// ── helpers ───────────────────────────────────────────────────────────────

function normalizeAnswer(value) {
  if (Array.isArray(value)) return value.map(normalizeAnswer);
  return String(value ?? "").trim().replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/").toLowerCase();
}

function isNumeric(value) {
  const s = String(value).trim();
  return s !== "" && !Number.isNaN(Number(s));
}

// Server-side answer validation. Works for every questionType.
function isAnswerCorrect(question, answer) {
  const accepted = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [question.correctAnswer];

  if (question.questionType === "arrange-steps" || question.questionType === "drag-and-drop") {
    const a = Array.isArray(answer) ? normalizeAnswer(answer) : [];
    const c = normalizeAnswer(accepted);
    return (
      Array.isArray(a) && Array.isArray(c) && a.length === c.length && a.every((v, i) => v === c[i])
    );
  }

  const na = normalizeAnswer(answer);
  if (Array.isArray(na)) return false;
  return accepted.some((k) => {
    const nk = normalizeAnswer(k);
    if (nk === na) return true;
    if (isNumeric(nk) && isNumeric(na)) return Number(nk) === Number(na);
    return false;
  });
}

async function getProgressDoc(studentId, topic) {
  let doc = await StudentMathMissionProgress.findOne({ studentId, topic });
  if (!doc) doc = new StudentMathMissionProgress({ studentId, topic });
  return doc;
}

// A question as served to the client: no answer, no explanation, no hints.
function shapeQuestion(q) {
  return {
    questionId: q.questionId,
    slot: q.slot,
    difficulty: q.difficulty,
    questionType: q.questionType,
    question: q.question,
    options: q.options || [],
    visual: q.visual || null,
    realLife: Boolean(q.realLife),
  };
}

function shapeProgress(p, totalMissions) {
  if (!p) {
    return { score: 0, attempts: 0, hintsUsed: 0, completedMissions: [], masteryPercentage: 0, currentLevel: 1, topicCompleted: false, stars: 0, missionStars: {} };
  }
  const completed = Array.isArray(p.completedMissions) ? p.completedMissions : [];
  const mastery = totalMissions > 0 ? Math.round((completed.length / totalMissions) * 100) : 0;
  const level = totalMissions > 0 ? Math.min(5, Math.max(1, completed.length + 1)) : 1;
  const ms = p.missionStars && typeof p.missionStars === "object" ? p.missionStars : {};
  const stars = Object.values(ms).reduce((s, v) => s + (Number(v) || 0), 0);
  return {
    score: p.score || 0,
    attempts: p.attempts || 0,
    hintsUsed: p.hintsUsed || 0,
    completedMissions: completed,
    masteryPercentage: p.topicCompleted ? 100 : mastery,
    currentLevel: p.topicCompleted ? 5 : level,
    topicCompleted: Boolean(p.topicCompleted),
    stars,
    missionStars: ms,
  };
}

// ── GET /missions/topic/:topicId ────────────────────────────────────────────
// Topic meta + the mission journey with per-student statuses
// (completed / current / locked).
router.get("/missions/topic/:topicId", verifyStudent, async (req, res) => {
  try {
    const topicId = req.params.topicId;
    const topicMeta = topicMetaById(topicId);
    if (!topicMeta) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const missions = await MathMission.find({ topic: topicId }).sort({ order: 1 }).lean();
    const progress = await StudentMathMissionProgress.findOne({ studentId: req.student._id, topic: topicId }).lean();
    const completed = progress && Array.isArray(progress.completedMissions) ? progress.completedMissions : [];
    const ms = progress && progress.missionStars && typeof progress.missionStars === "object" ? progress.missionStars : {};

    const chain = missions.map((m, i) => {
      const done = completed.includes(m.missionId);
      const prevDone = i === 0 ? true : completed.includes(missions[i - 1].missionId);
      let status = "locked";
      if (done) status = "completed";
      else if (prevDone) status = "current";
      return {
        missionId: m.missionId,
        order: m.order,
        name: m.name,
        tagline: m.tagline,
        reward: m.reward,
        status,
        isBoss: i === missions.length - 1, // last mission = the Master Challenge
        stars: Number(ms[m.missionId]) || 0,
      };
    });

    const totalMissions = missions.length;
    const nextTopic = topicMeta.order < MISSION_TOPICS.length ? MISSION_TOPICS[topicMeta.order] : null;

    res.json({
      success: true,
      data: {
        topic: {
          id: topicMeta.id,
          name: topicMeta.name,
          order: topicMeta.order,
          planned: totalMissions === 0,
          worldName: topicMeta.worldName,
          world: topicMeta.world,
          accent: topicMeta.accent,
          tagline: topicMeta.tagline,
        },
        missions: chain,
        progress: shapeProgress(progress, totalMissions),
        nextTopic: nextTopic ? { id: nextTopic.id, name: nextTopic.name, worldName: nextTopic.worldName } : null,
      },
    });
  } catch (err) {
    console.error("GET /missions/topic/:topicId", err);
    res.status(500).json({ success: false, message: "Could not load the topic" });
  }
});

// ── GET /missions/questions ────────────────────────────────────────────────
// Builds the mission session for this student: concept card, simple example,
// then the graded steps. Adaptive: a student who has failed at least two of
// their last three attempts for the mission gets the easier `reinforce`
// question in place of the harder application slot.
router.get("/missions/questions", verifyStudent, async (req, res) => {
  try {
    const { topic, mission } = req.query;
    if (!topic || !mission) {
      return res.status(400).json({ success: false, message: "topic and mission are required" });
    }

    const missionDoc = await MathMission.findOne({ topic, missionId: mission }).lean();
    if (!missionDoc) {
      return res.status(404).json({ success: false, message: "Mission not found" });
    }

    const questions = await MathMissionQuestion.find({ mission }).lean();
    // Fresh run tracker: counts this mission-session's mistakes + hints so the
    // Master Challenge can award 1–3 stars honestly at completion (server-side).
    const progress = await getProgressDoc(req.student._id, topic);
    progress.run = { mission, mistakes: 0, hints: 0 };
    progress.markModified("run");
    await progress.save();

    const totalMissions = await MathMission.countDocuments({ topic });

    // How is this student doing right now on this mission?
    const recent = await StudentMathAttempt.find({ studentId: req.student._id, mission })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const answerLog = recent.filter((a) => a.kind === "answer");
    const lastThree = answerLog.slice(0, 3);
    const struggling =
      lastThree.length >= 2 && lastThree.filter((a) => a.correct === false).length >= 2;

    const countAttempts = (q) =>
      answerLog.filter((a) => a.questionId === q.questionId).length;
    const pickSlot = (slot) =>
      questions
        .filter((q) => q.slot === slot)
        .sort((a, b) => countAttempts(a) - countAttempts(b))[0] || null;

    const q1 = pickSlot("q1");
    const q2 = pickSlot("q2");
    let q3 = pickSlot("q3");
    const boss = pickSlot("boss");
    if (struggling) {
      const reinforce = pickSlot("reinforce");
      if (reinforce) q3 = reinforce; // easier related question
    }

    const steps = [
      {
        slot: "concept",
        type: "concept",
        heading: missionDoc.concept.heading,
        body: missionDoc.concept.body,
        points: missionDoc.concept.points || [],
        visual: missionDoc.concept.visual || null,
      },
      {
        slot: "example",
        type: "example",
        heading: missionDoc.example.heading,
        body: missionDoc.example.body,
        exampleLine: missionDoc.example.exampleLine || "",
        visual: missionDoc.example.visual || null,
      },
    ];

    const order = [
      ["question", q1, 1],
      ["question", q2, 2],
      ["question", q3, 3],
      ["boss", boss, 4],
    ];
    for (const [slot, q, num] of order) {
      if (!q) continue;
      steps.push({
        slot,
        type: "question",
        order: num,
        goal: slot === "boss" ? "Final challenge" : `Question ${num}`,
        ...shapeQuestion(q),
      });
    }

    res.json({
      success: true,
      data: {
        topic: { id: topic },
        mission: {
          missionId: missionDoc.missionId,
          name: missionDoc.name,
          tagline: missionDoc.tagline,
          order: missionDoc.order,
          reward: missionDoc.reward,
        },
        steps,
        progress: shapeProgress(progress, totalMissions),
        adaptive: struggling,
      },
    });
  } catch (err) {
    console.error("GET /missions/questions", err);
    res.status(500).json({ success: false, message: "Could not build the mission session" });
  }
});

// ── POST /missions/:questionId/answer ──────────────────────────────────────
router.post(
  "/missions/:questionId/answer",
  verifyStudent,
  rateLimit({ keyFn: (req) => `mm-answer:${req.student?._id}`, max: 40, windowMs: 60000 }),
  async (req, res) => {
    try {
      const studentId = req.student._id;
      const questionId = req.params.questionId;
      const { answer, hintsUsed = 0 } = req.body || {};

      const q = await MathMissionQuestion.findOne({ questionId }).lean();
      if (!q) return res.status(404).json({ success: false, message: "Question not found" });

      const correct = isAnswerCorrect(q, answer);
      const hintCount = Math.min(2, Math.max(0, Number(hintsUsed) || 0));
      const isBoss = q.slot === "boss";

      const progress = await getProgressDoc(studentId, q.topic);
      const completedSoFar = Array.isArray(progress.completedMissions) ? progress.completedMissions : [];

      // Run tracker: lags behind the current mission session and powers the
      // star rating at completion (mistakes + hints for this run).
      const run = progress.run && progress.run.mission === q.mission
        ? progress.run
        : { mission: q.mission, mistakes: 0, hints: 0 };
      run.mistakes += correct ? 0 : 1;
      run.hints = Math.max(Number(run.hints) || 0, hintCount);
      progress.run = run;
      progress.markModified("run");
      // Review mode: replaying an already-earned mission is practice — no
      // points are farmed, but attempts and mistakes are still tracked.
      const isReplay = completedSoFar.includes(q.mission);

      // Order guard: a mission only scores once the mission before it is
      // complete (deep links to locked missions can be viewed, not farmed).
      const missions = await MathMission.find({ topic: q.topic }).sort({ order: 1 }).lean();
      const thisMission = missions.find((m) => m.missionId === q.mission);
      let unlocked = true;
      if (thisMission && thisMission.order > 1) {
        unlocked = missions
          .filter((m) => m.order < thisMission.order)
          .every((m) => completedSoFar.includes(m.missionId));
      }

      progress.attempts = (progress.attempts || 0) + 1;
      progress.hintsUsed = (progress.hintsUsed || 0) + hintCount;
      progress.lastPlayed = new Date();
      progress.markModified("mistakes");

      const canEarn = unlocked && !isReplay;
      let earned = 0;
      if (correct && canEarn) {
        earned = isBoss
          ? hintCount > 0 ? SCORE.bossHinted : SCORE.boss
          : hintCount > 0 ? SCORE.correctHinted : SCORE.correct;
        progress.score = (progress.score || 0) + earned;
      } else if (!correct) {
        const mistakeType = q.mistakeType || "generic";
        const list = Array.isArray(progress.mistakes) ? progress.mistakes : [];
        const found = list.find((m) => m && m.type === mistakeType);
        if (found) found.count = (found.count || 0) + 1;
        else list.push({ type: mistakeType, count: 1, questionId });
        progress.mistakes = list;
      }

      const totalMissions = await MathMission.countDocuments({ topic: q.topic });
      const completed = Array.isArray(progress.completedMissions) ? progress.completedMissions : [];

      let missionCompleted = false;
      let justCompletedTopic = false;
      let missionName = "";
      let starsEarned = 0;
      if (correct && isBoss && unlocked && !isReplay) {
        missionName = q.mission;
        if (!completed.includes(q.mission)) {
          completed.push(q.mission);
          progress.completedMissions = completed;
          missionCompleted = true;
          progress.score = (progress.score || 0) + SCORE.missionBonus;
          // Star rating for this mission (kind, encouraging, never punishing):
          //   3 = clean run (no mistakes, no hints) · 2 = a few stumbles ·
          //   1 = needed real help. The best rating ever earned is kept.
          starsEarned = run.mistakes === 0 && run.hints === 0 ? 3 : run.mistakes <= 2 && run.hints <= 1 ? 2 : 1;
          const ms = progress.missionStars && typeof progress.missionStars === "object" ? progress.missionStars : {};
          if (starsEarned > (Number(ms[q.mission]) || 0)) {
            ms[q.mission] = starsEarned;
            progress.missionStars = ms;
            progress.markModified("missionStars");
          } else {
            starsEarned = Number(ms[q.mission]) || starsEarned;
          }
          const allDone = totalMissions > 0 && completed.length >= totalMissions;
          if (allDone && !progress.topicCompleted) {
            progress.topicCompleted = true;
            justCompletedTopic = true;
            progress.score = (progress.score || 0) + SCORE.topicBonus;
          }
        }
      }

      progress.masteryPercentage =
        totalMissions > 0 ? Math.round((completed.length / totalMissions) * 100) : 0;
      progress.currentLevel = progress.topicCompleted
        ? 5
        : totalMissions > 0
          ? Math.min(5, Math.max(1, completed.length + 1))
          : 1;
      await progress.save();

      await StudentMathAttempt.create({
        studentId,
        topic: q.topic,
        mission: q.mission,
        questionId,
        answer: answer ?? null,
        correct,
        difficulty: q.difficulty,
        hintsUsed: hintCount,
        kind: "answer",
      });

      // Which mission unlocks next (if any)?
      const nextMission = missions.find((m) => !completed.includes(m.missionId)) || null;

      const topicMeta = topicMetaById(q.topic);
      const nextTopic = progress.topicCompleted && topicMeta && topicMeta.order < MISSION_TOPICS.length
        ? MISSION_TOPICS[topicMeta.order]
        : null;

      res.json({
        success: true,
        data: {
          correct,
          earned,
          missionCompleted,
          topicCompleted: progress.topicCompleted,
          explanation: correct ? q.explanation : "",
          answerShown: correct ? q.correctAnswer : null,
          missionName: missionCompleted ? missionName : "",
          stars: missionCompleted ? starsEarned : 0,
          missionsRemaining: Math.max(0, (missions.length || 0) - completed.length),
          lockedMission: !unlocked,
          nextMission: nextMission ? { missionId: nextMission.missionId, name: nextMission.name } : null,
          nextTopic: nextTopic ? { id: nextTopic.id, name: nextTopic.name, worldName: nextTopic.worldName } : null,
          progress: shapeProgress(progress, totalMissions),
          justCompletedTopic,
        },
      });
    } catch (err) {
      console.error("POST /missions/:questionId/answer", err);
      res.status(500).json({ success: false, message: "Could not record the answer" });
    }
  }
);

// ── POST /missions/:questionId/hint ────────────────────────────────────────
// Server decides which hint to show: the first request for a question returns
// hint1, later requests return hint2.
router.post(
  "/missions/:questionId/hint",
  verifyStudent,
  rateLimit({ keyFn: (req) => `mm-hint:${req.student?._id}`, max: 60, windowMs: 60000 }),
  async (req, res) => {
    try {
      const studentId = req.student._id;
      const questionId = req.params.questionId;
      const q = await MathMissionQuestion.findOne({ questionId }).lean();
      if (!q) return res.status(404).json({ success: false, message: "Question not found" });

      const hintUses = await StudentMathAttempt.countDocuments({ studentId, questionId, kind: "hint" });
      const hintLevel = hintUses === 0 ? 1 : 2;
      const hint = hintLevel === 1 ? q.hint1 : q.hint2;

      await StudentMathAttempt.create({
        studentId,
        topic: q.topic,
        mission: q.mission,
        questionId,
        correct: null,
        difficulty: q.difficulty,
        hintsUsed: 1,
        kind: "hint",
      });
      const progressDoc = await getProgressDoc(studentId, q.topic);
      progressDoc.hintsUsed = (progressDoc.hintsUsed || 0) + 1;
      if (progressDoc.run && progressDoc.run.mission === q.mission) {
        progressDoc.run.hints = (Number(progressDoc.run.hints) || 0) + 1;
        progressDoc.markModified("run");
      }
      await progressDoc.save();

      res.json({ success: true, data: { hint, hintLevel, hasMore: hintLevel === 1 && Boolean(q.hint2) } });
    } catch (err) {
      console.error("POST /missions/:questionId/hint", err);
      res.status(500).json({ success: false, message: "Could not load a hint" });
    }
  }
);

// ── GET /missions/:questionId/explanation ──────────────────────────────────
router.get("/missions/:questionId/explanation", verifyStudent, async (req, res) => {
  try {
    const q = await MathMissionQuestion.findOne({ questionId: req.params.questionId }).lean();
    if (!q) return res.status(404).json({ success: false, message: "Question not found" });
    res.json({
      success: true,
      data: {
        questionId: q.questionId,
        explanation: q.explanation,
        answer: q.correctAnswer,
      },
    });
  } catch (err) {
    console.error("GET /missions/:questionId/explanation", err);
    res.status(500).json({ success: false, message: "Could not load the explanation" });
  }
});

// ── GET /missions/progress ─────────────────────────────────────────────────
router.get("/missions/progress", verifyStudent, async (req, res) => {
  try {
    const studentId = req.student._id;
    const docs = await StudentMathMissionProgress.find({ studentId }).lean();
    const byTopic = {};
    for (const d of docs) byTopic[d.topic] = d;

    const missionCounts = {};
    const missions = await MathMission.find({}).select("topic").lean();
    for (const m of missions) missionCounts[m.topic] = (missionCounts[m.topic] || 0) + 1;

    const topics = MISSION_TOPICS.map((t, idx) => {
      const p = byTopic[t.id] || null;
      const prevTopic = idx === 0 ? null : MISSION_TOPICS[idx - 1].id;
      const prevDone = prevTopic ? Boolean(byTopic[prevTopic] && byTopic[prevTopic].topicCompleted) : true;
      const count = Math.max(missionCounts[t.id] || 0, 5); // 5 planned missions per topic
      const completedCount = p && Array.isArray(p.completedMissions) ? p.completedMissions.length : 0;
      const ms = p && p.missionStars && typeof p.missionStars === "object" ? p.missionStars : {};
      const stars = Object.values(ms).reduce((s, v) => s + (Number(v) || 0), 0);
      return {
        id: t.id,
        name: t.name,
        order: t.order,
        worldName: t.worldName,
        world: t.world,
        accent: t.accent,
        tagline: t.tagline,
        unlocked: prevDone,
        completed: Boolean(p && p.topicCompleted),
        score: p ? p.score || 0 : 0,
        stars,
        completedMissions: completedCount,
        totalMissions: count,
        masteryPercentage: p && count > 0 ? Math.round((completedCount / count) * 100) : 0,
        currentLevel: completedCount > 0 ? Math.min(5, completedCount + 1) : 1,
      };
    });

    let totalScore = 0;
    let completedMissionCount = 0;
    let totalStars = 0;
    for (const t of topics) {
      totalScore += t.score;
      completedMissionCount += t.completedMissions;
      totalStars += t.stars;
    }
    const totalMissions = topics.reduce((sum, t) => sum + t.totalMissions, 0);

    res.json({
      success: true,
      data: {
        topics,
        totalScore,
        totalStars,
        completedMissions: completedMissionCount,
        totalMissions,
        currentTopic: topics.find((t) => t.unlocked && !t.completed) || null,
      },
    });
  } catch (err) {
    console.error("GET /missions/progress", err);
    res.status(500).json({ success: false, message: "Could not load progress" });
  }
});

// ── POST /missions/progress/reset ──────────────────────────────────────────
router.post(
  "/missions/progress/reset",
  verifyStudent,
  rateLimit({ keyFn: (req) => `mm-reset:${req.student?._id}`, max: 5, windowMs: 60000 }),
  async (req, res) => {
    try {
      const studentId = req.student._id;
      await StudentMathMissionProgress.deleteMany({ studentId });
      await StudentMathAttempt.deleteMany({ studentId });
      res.json({ success: true, data: { reset: true } });
    } catch (err) {
      console.error("POST /missions/progress/reset", err);
      res.status(500).json({ success: false, message: "Could not reset progress" });
    }
  }
);

module.exports = router;