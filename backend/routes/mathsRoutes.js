const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const MathWorld = require("../models/MathWorld");
const MathQuestion = require("../models/MathQuestion");
const MathsProgress = require("../models/MathsProgress");
const MathsStudentLevel = require("../models/MathsStudentLevel");
const MathsStudentMeta = require("../models/MathsStudentMeta");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

// Math Adventure Worlds.
//   GET  /worlds         - public list. Themes stay browseable logged out;
//                          when a student token is present each world is
//                          annotated with that student's { solved, total,
//                          locked, completed } plus continueTopic.
//   GET  /worlds/:topic  - public single-world meta (deep links).
//   GET  /daily          - today's challenge for the logged-in student.
//   GET  /:topic         - next question for the logged-in student at their
//                          adaptive difficulty (resumes where they left off).
//   POST /answer         - record an answer + invisible adaptive level move.
// All gameplay (daily, topic, answer) requires a student token so progress,
// unlocking and level are tracked per child server-side. Worlds unlock one
// after another, per student, and only once the previous world is complete.

const WORLDS_FIELDS = {
  _id: 0,
  createdAt: 0,
  updatedAt: 0,
  __v: 0,
};

const DIFFICULTY_STEP = { easy: "medium", medium: "challenge", challenge: "challenge" };
const DIFFICULTY_BACK = { challenge: "medium", medium: "easy", easy: "easy" };

// Reads a Bearer token when present but never blocks: a valid token annotates
// the public world list as "this student's view"; missing/stale tokens simply
// leave req.student unset and the list stays browseable.
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.student = user;
  } catch (error) {
    // stale / invalid token -> treat as logged out for this public listing
  }
  next();
}

function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dayIndex(bankLength) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return dayOfYear % Math.max(1, bankLength);
}

const shapeQuestion = (doc) => ({
  id: doc.id,
  topic: doc.topic,
  type: doc.type,
  difficulty: doc.difficulty,
  question: doc.question,
  objects: doc.objects || {},
  options: doc.options || [],
  answer: doc.answer,
  explanation: doc.explanation || "",
});

// Sequenced lock rule: world `topic` is playable for `studentId` only when
// every question of the previous world (order - 1) is solved. The first world
// (order 1) is always playable.
async function lockStatus(studentId, topic) {
  const world = await MathWorld.findOne({ id: topic }).lean();
  if (!world) return { missing: true, locked: false, prevName: "" };
  if (world.order <= 1) return { missing: false, locked: false, prevName: "" };
  const prev = await MathWorld.findOne({ order: world.order - 1 }).lean();
  const total = prev ? await MathQuestion.countDocuments({ topic: prev.id }) : 0;
  const solvedCount = studentId && total > 0
    ? await MathsProgress.countDocuments({ studentId, topic: prev.id, solved: true })
    : 0;
  return { missing: false, locked: !(total > 0 && solvedCount >= total), prevName: prev ? prev.nameEn : "" };
}

// Per-student view of every world: how many questions are solved, whether the
// world is fully complete, whether it is locked behind the previous world, and
// which world the student should continue next. Plus last-activity pointer.
async function computeStudentWorldStatus(studentId) {
  const worlds = await MathWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
  if (!worlds.length) return { worlds: [], continueTopic: null, lastTopic: "" };

  const topics = worlds.map((w) => w.id);
  const [countRows, doneDocs, meta] = await Promise.all([
    MathQuestion.aggregate([
      { $match: { topic: { $in: topics } } },
      { $group: { _id: "$topic", total: { $sum: 1 } } },
    ]),
    MathsProgress.find({ studentId, topic: { $in: topics } })
      .select("topic solved")
      .lean(),
    MathsStudentMeta.findOne({ studentId }).lean(),
  ]);

  const totals = Object.fromEntries(countRows.map((r) => [String(r._id), r.total || 0]));
  const solvedByTopic = {};
  topics.forEach((t) => {
    solvedByTopic[String(t)] = 0;
  });
  doneDocs.forEach((d) => {
    if (d.solved && solvedByTopic[String(d.topic)] != null) solvedByTopic[String(d.topic)] += 1;
  });

  const list = [];
  let prevComplete = true; // the first world is always open
  let continueTopic = null;
  for (const w of worlds) {
    const total = totals[String(w.id)] || 0;
    const solved = Math.min(solvedByTopic[String(w.id)] || 0, total);
    const completed = total === 0 || solved === total;
    const locked = w.order > 1 && !prevComplete;
    if (!locked && !completed && continueTopic === null) continueTopic = w.id;
    prevComplete = completed;
    list.push({
      id: w.id,
      order: w.order,
      name: w.name,
      nameEn: w.nameEn,
      skills: w.skills || [],
      accent: w.accent,
      environment: w.environment,
      intro: w.intro,
      theme: w.theme,
      solved,
      total,
      locked,
      completed,
    });
  }

  return { worlds: list, continueTopic, lastTopic: (meta && meta.lastTopic) || "" };
}

// ── Public world list (themes + intro; no questions here) ─────────────────
// With a student token this is that student's personal adventure state.
router.get("/worlds", optionalAuth, async (req, res) => {
  try {
    if (req.student) {
      const status = await computeStudentWorldStatus(req.student._id);
      return res.json({ success: true, data: status });
    }
    const docs = await MathWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
    res.json({
      success: true,
      data: {
        worlds: docs.map((w) => ({
          id: w.id,
          order: w.order,
          name: w.name,
          nameEn: w.nameEn,
          skills: w.skills || [],
          accent: w.accent,
          environment: w.environment,
          intro: w.intro,
          theme: w.theme,
          locked: false,
          solved: 0,
          total: 0,
          completed: false,
        })),
        continueTopic: null,
        lastTopic: "",
      },
    });
  } catch (error) {
    console.error("GET /api/maths/worlds failed:", error);
    res.status(500).json({ success: false, message: "Error loading maths worlds", error: error.message });
  }
});

// ── Single world meta (for deep links / world header) ─────────────────────
router.get("/worlds/:topic", async (req, res) => {
  try {
    const world = await MathWorld.findOne({ id: req.params.topic }, WORLDS_FIELDS).lean();
    if (!world) return res.status(404).json({ success: false, message: "World not found." });
    res.json({ success: true, data: { world } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading world", error: error.message });
  }
});

// ── Today's single Challenge question (mixed topics, rotated daily) ──────
router.get("/daily", verifyStudent, async (req, res) => {
  try {
    const scope = {
      studentId: req.student._id,
      classId: req.student.classLevel || "5",
      schoolId: "default",
    };
    const all = await MathQuestion.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
      .sort({ id: 1 })
      .lean();
    if (!all.length) return res.status(404).json({ success: false, message: "Question bank is empty." });

    const question = all[dayIndex(all.length)];
    const progress = await MathsProgress.findOne({
      studentId: scope.studentId,
      questionId: question.id,
    }).lean();

    res.json({
      success: true,
      data: {
        question: shapeQuestion(question),
        solved: Boolean(progress && progress.solved),
        attempts: progress ? progress.attemptCount : 0,
      },
    });
  } catch (error) {
    console.error("GET /api/maths/daily failed:", error);
    res.status(500).json({ success: false, message: "Error loading daily challenge", error: error.message });
  }
});

// ── Next question for a topic, at the student's adaptive level ────────────
// Serves undefeated (unsolved) questions at the current difficulty first,
// then any unsolved, then loops to solved ones so there is always a question.
router.get("/:topic", verifyStudent, async (req, res) => {
  try {
    const scope = {
      studentId: req.student._id,
      classId: req.student.classLevel || "5",
      schoolId: "default",
    };
    const topic = req.params.topic;
    const world = await MathWorld.findOne({ id: topic }).lean();
    if (!world) return res.status(404).json({ success: false, message: "World not found." });

    const lk = await lockStatus(scope.studentId, topic);
    if (lk.missing) return res.status(404).json({ success: false, message: "World not found." });
    if (lk.locked) {
      return res.status(403).json({
        success: false,
        locked: true,
        message: `Finish ${lk.prevName} first — ${world.nameEn} will unlock when you do!`,
      });
    }

    const [level, doneDocs] = await Promise.all([
      MathsStudentLevel.findOne({ studentId: scope.studentId, topic }).lean(),
      MathsProgress.find({ studentId: scope.studentId, topic }).lean(),
    ]);
    const levelName = (level && level.difficulty) || "easy";
    const solvedIds = new Set(doneDocs.filter((d) => d.solved).map((d) => String(d.questionId)));

    const pool = await MathQuestion.find({ topic }).sort({ id: 1 }).lean();
    const fresh = pool.filter((qDoc) => qDoc.difficulty === levelName && !solvedIds.has(String(qDoc.id)));
    const anyFresh = pool.filter((qDoc) => !solvedIds.has(String(qDoc.id)));
    const allUnseen = fresh.length ? fresh : anyFresh;
    const bank = allUnseen.length ? allUnseen : pool;

    const picked = shuffleArr(bank)[0];
    const total = pool.length;
    const solvedCount = doneDocs.filter((d) => d.solved).length;

    await MathsStudentMeta.findOneAndUpdate(
      { studentId: scope.studentId },
      { $set: { lastTopic: topic, lastQuestionId: picked.id, lastAt: new Date() } },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        world: {
          id: world.id,
          order: world.order,
          name: world.name,
          nameEn: world.nameEn,
          environment: world.environment,
          accent: world.accent,
          theme: world.theme,
        },
        question: shapeQuestion(picked),
        progress: { completed: Math.min(solvedCount, total), total },
        level: levelName,
      },
    });
  } catch (error) {
    console.error(`GET /api/maths/${req.params.topic} failed:`, error);
    res.status(500).json({ success: false, message: "Error loading question", error: error.message });
  }
});

// ── Record an answer + invisible adaptive level move ──────────────────────
router.post(
  "/answer",
  verifyStudent,
  rateLimit({ keyFn: (req) => `maths:${req.student._id}`, max: 45, windowMs: 60000 }),
  async (req, res) => {
    try {
      const scope = {
        studentId: req.student._id,
        classId: req.student.classLevel || "5",
        schoolId: "default",
      };
      const { topic, questionId, correct } = req.body || {};
      if (!topic || questionId == null) {
        return res.status(400).json({ success: false, message: "topic and questionId are required." });
      }
      const question = await MathQuestion.findOne({ id: Number(questionId), topic }).lean();
      if (!question) return res.status(404).json({ success: false, message: "Question not found." });
      if (typeof correct !== "boolean") {
        return res.status(400).json({ success: false, message: "correct must be a boolean." });
      }

      const lk = await lockStatus(scope.studentId, topic);
      if (lk.locked) {
        return res.status(403).json({
          success: false,
          locked: true,
          message: `Finish ${lk.prevName} first — ${question.topic} answers can't be saved until it unlocks.`,
        });
      }

      const existing = await MathsProgress.findOne({
        studentId: scope.studentId,
        questionId: question.id,
      });
      const alreadySolved = Boolean(existing && existing.solved);
      const solved = Boolean(correct) || alreadySolved;
      const patch = {
        topic: question.topic,
        solved,
        classId: scope.classId,
        schoolId: scope.schoolId,
      };
      if (solved && !alreadySolved) patch.solvedAt = new Date();
      await MathsProgress.findOneAndUpdate(
        { studentId: scope.studentId, questionId: question.id },
        {
          $set: patch,
          $inc: { attemptCount: 1 },
          $push: { attempts: { correct: Boolean(correct), at: new Date() } },
        },
        { upsert: true, new: true }
      );

      // Adaptive difficulty: 3 correct in a row -> up; 2 wrong in a row -> down.
      const levelDoc = await MathsStudentLevel.findOneAndUpdate(
        { studentId: scope.studentId, topic: question.topic },
        { $setOnInsert: { classId: scope.classId, schoolId: scope.schoolId } },
        { upsert: true, new: true }
      );
      const nextCorrect = correct ? levelDoc.correctStreak + 1 : 0;
      const nextWrong = correct ? 0 : levelDoc.wrongStreak + 1;
      let nextDiff = levelDoc.difficulty;
      if (!correct) nextDiff = DIFFICULTY_BACK[levelDoc.difficulty];
      if (correct && nextCorrect >= 3) {
        nextDiff = DIFFICULTY_STEP[levelDoc.difficulty];
      }
      await MathsStudentLevel.updateOne(
        { _id: levelDoc._id },
        { $set: { difficulty: nextDiff, correctStreak: nextCorrect, wrongStreak: nextWrong } }
      );

      const total = await MathQuestion.countDocuments({ topic: question.topic });
      const doneDocs = await MathsProgress.find({
        studentId: scope.studentId,
        topic: question.topic,
        solved: true,
      }).lean();
      const completed = total > 0 && doneDocs.length >= total;

      await MathsStudentMeta.findOneAndUpdate(
        { studentId: scope.studentId },
        { $set: { lastTopic: question.topic, lastQuestionId: question.id, lastAt: new Date() } },
        { upsert: true }
      );

      res.json({
        success: true,
        data: {
          solved,
          completed,
          progress: { completed: Math.min(doneDocs.length, total), total },
        },
      });
    } catch (error) {
      console.error("POST /api/maths/answer failed:", error);
      res.status(500).json({ success: false, message: "Error saving answer", error: error.message });
    }
  }
);

module.exports = router;