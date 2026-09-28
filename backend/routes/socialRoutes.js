const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const SocialWorld = require("../models/SocialWorld");
const SocialQuestion = require("../models/SocialQuestion");
const SocialProgress = require("../models/SocialProgress");
const SocialStudentLevel = require("../models/SocialStudentLevel");
const SocialStudentMeta = require("../models/SocialStudentMeta");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

// World Explorer (Class 5 Social Science).
//   GET  /worlds         - public world list + themes + discoveries. Browseable
//                          logged out; with a student token each world shows
//                          that student's { solved, total, locked, completed }
//                          plus continueWorld.
//   GET  /worlds/:world  - public single-world meta (deep links).
//   GET  /daily          - today's Explorer challenge for the logged-in student.
//   GET  /:world         - next activity for the logged-in student at their
//                          adaptive difficulty (resumes where they left off).
//   POST /answer         - record an answer + invisible adaptive level move.
// All gameplay (daily, world, answer) requires a student token so progress,
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
  world: doc.world,
  type: doc.type,
  difficulty: doc.difficulty,
  question: doc.question,
  options: doc.options || [],
  objects: doc.objects || {},
  answer: doc.answer,
  explanation: doc.explanation || "",
});

// Sequenced lock rule: world `world` is playable for `studentId` only when
// every activity of the previous world (order - 1) is solved. The first world
// (order 1) is always playable.
async function lockStatus(studentId, world) {
  const w = await SocialWorld.findOne({ id: world }).lean();
  if (!w) return { missing: true, locked: false, prevName: "" };
  if (w.order <= 1) return { missing: false, locked: false, prevName: "" };
  const prev = await SocialWorld.findOne({ order: w.order - 1 }).lean();
  const total = prev ? await SocialQuestion.countDocuments({ world: prev.id }) : 0;
  const solvedCount = studentId && total > 0
    ? await SocialProgress.countDocuments({ studentId, world: prev.id, solved: true })
    : 0;
  return { missing: false, locked: !(total > 0 && solvedCount >= total), prevName: prev ? prev.nameEn : "" };
}

// Per-student view of every world: how many activities are solved, whether the
// world is fully complete, whether it is locked behind the previous world, and
// which world the student should continue next. Plus last-activity pointer.
async function computeStudentWorldStatus(studentId) {
  const worlds = await SocialWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
  if (!worlds.length) return { worlds: [], continueWorld: null, lastWorld: "" };

  const ids = worlds.map((w) => w.id);
  const [countRows, doneDocs, meta] = await Promise.all([
    SocialQuestion.aggregate([
      { $match: { world: { $in: ids } } },
      { $group: { _id: "$world", total: { $sum: 1 } } },
    ]),
    SocialProgress.find({ studentId, world: { $in: ids } })
      .select("world solved")
      .lean(),
    SocialStudentMeta.findOne({ studentId }).lean(),
  ]);

  const totals = Object.fromEntries(countRows.map((r) => [String(r._id), r.total || 0]));
  const solvedByWorld = {};
  ids.forEach((w) => {
    solvedByWorld[String(w)] = 0;
  });
  doneDocs.forEach((d) => {
    if (d.solved && solvedByWorld[String(d.world)] != null) solvedByWorld[String(d.world)] += 1;
  });

  const list = [];
  let prevComplete = true; // the first world is always open
  let continueWorld = null;
  for (const w of worlds) {
    const total = totals[String(w.id)] || 0;
    const solved = Math.min(solvedByWorld[String(w.id)] || 0, total);
    const completed = total === 0 || solved === total;
    const locked = w.order > 1 && !prevComplete;
    if (!locked && !completed && continueWorld === null) continueWorld = w.id;
    prevComplete = completed;
    list.push({
      id: w.id,
      order: w.order,
      name: w.name,
      nameEn: w.nameEn,
      guideLine: w.guideLine || "",
      skills: w.skills || [],
      accent: w.accent,
      environment: w.environment,
      intro: w.intro,
      discoveries: w.discoveries || [],
      theme: w.theme,
      solved,
      total,
      locked,
      completed,
    });
  }

  return { worlds: list, continueWorld, lastWorld: (meta && meta.lastWorld) || "" };
}

// ── Public world list (themes + intro + discoveries; no questions here) ───
// With a student token this is that student's personal explorer state.
router.get("/worlds", optionalAuth, async (req, res) => {
  try {
    if (req.student) {
      const status = await computeStudentWorldStatus(req.student._id);
      return res.json({ success: true, data: status });
    }
    const docs = await SocialWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
    res.json({
      success: true,
      data: {
        worlds: docs.map((w) => ({
          id: w.id,
          order: w.order,
          name: w.name,
          nameEn: w.nameEn,
          guideLine: w.guideLine || "",
          skills: w.skills || [],
          accent: w.accent,
          environment: w.environment,
          intro: w.intro,
          discoveries: w.discoveries || [],
          theme: w.theme,
          locked: false,
          solved: 0,
          total: 0,
          completed: false,
        })),
        continueWorld: null,
        lastWorld: "",
      },
    });
  } catch (error) {
    console.error("GET /api/social/worlds failed:", error);
    res.status(500).json({ success: false, message: "Error loading explorer worlds", error: error.message });
  }
});

// ── Single world meta (for deep links / world header) ─────────────────────
router.get("/worlds/:world", async (req, res) => {
  try {
    const world = await SocialWorld.findOne({ id: req.params.world }, WORLDS_FIELDS).lean();
    if (!world) return res.status(404).json({ success: false, message: "World not found." });
    res.json({ success: true, data: { world } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading world", error: error.message });
  }
});

// ── Today's single Explorer Challenge (mixed worlds, rotated daily) ───────
router.get("/daily", verifyStudent, async (req, res) => {
  try {
    const scope = {
      studentId: req.student._id,
      classId: req.student.classLevel || "5",
      schoolId: "default",
    };
    const all = await SocialQuestion.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
      .sort({ id: 1 })
      .lean();
    if (!all.length) return res.status(404).json({ success: false, message: "Question bank is empty." });

    // Vary the TYPE day to day so the challenge is not the same kind twice:
    // walk forward from today's index until the type differs from yesterday's
    // pick (yesterday = yesterday's index, by construction one apart).
    let idx = dayIndex(all.length);
    const yesterday = (dayIndex(all.length) + all.length - 1) % all.length;
    if (all[idx] && all[yesterday] && all[idx].type === all[yesterday].type) {
      idx = (idx + 1) % all.length;
      if (all[idx] && all[idx].type === all[yesterday].type && all.length > 2) {
        idx = (idx + 1) % all.length;
      }
    }

    const question = all[idx];
    const progress = await SocialProgress.findOne({
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
    console.error("GET /api/social/daily failed:", error);
    res.status(500).json({ success: false, message: "Error loading daily challenge", error: error.message });
  }
});

// ── Next activity for a world, at the student's adaptive level ────────────
// Serves undefeated (unsolved) activities at the current difficulty first,
// then any unsolved, then loops to solved ones so there is always a question.
router.get("/:world", verifyStudent, async (req, res) => {
  try {
    const scope = {
      studentId: req.student._id,
      classId: req.student.classLevel || "5",
      schoolId: "default",
    };
    const world = req.params.world;
    const w = await SocialWorld.findOne({ id: world }).lean();
    if (!w) return res.status(404).json({ success: false, message: "World not found." });

    const lk = await lockStatus(scope.studentId, world);
    if (lk.missing) return res.status(404).json({ success: false, message: "World not found." });
    if (lk.locked) {
      return res.status(403).json({
        success: false,
        locked: true,
        message: `Finish ${lk.prevName} first — ${w.nameEn} will unlock when you do!`,
      });
    }

    const [level, doneDocs] = await Promise.all([
      SocialStudentLevel.findOne({ studentId: scope.studentId, world }).lean(),
      SocialProgress.find({ studentId: scope.studentId, world }).lean(),
    ]);
    const levelName = (level && level.difficulty) || "easy";
    const solvedIds = new Set(doneDocs.filter((d) => d.solved).map((d) => String(d.questionId)));

    const pool = await SocialQuestion.find({ world }).sort({ id: 1 }).lean();
    const fresh = pool.filter((qDoc) => qDoc.difficulty === levelName && !solvedIds.has(String(qDoc.id)));
    const anyFresh = pool.filter((qDoc) => !solvedIds.has(String(qDoc.id)));
    const allUnseen = fresh.length ? fresh : anyFresh;
    const bank = allUnseen.length ? allUnseen : pool;

    const picked = shuffleArr(bank)[0];
    const total = pool.length;
    const solvedCount = doneDocs.filter((d) => d.solved).length;

    await SocialStudentMeta.findOneAndUpdate(
      { studentId: scope.studentId },
      { $set: { lastWorld: world, lastQuestionId: picked.id, lastAt: new Date() } },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        world: {
          id: w.id,
          order: w.order,
          name: w.name,
          nameEn: w.nameEn,
          guideLine: w.guideLine || "",
          environment: w.environment,
          accent: w.accent,
          discoveries: w.discoveries || [],
          theme: w.theme,
        },
        question: shapeQuestion(picked),
        progress: { completed: Math.min(solvedCount, total), total },
        level: levelName,
      },
    });
  } catch (error) {
    console.error(`GET /api/social/${req.params.world} failed:`, error);
    res.status(500).json({ success: false, message: "Error loading activity", error: error.message });
  }
});

// ── Record an answer + invisible adaptive level move ──────────────────────
router.post(
  "/answer",
  verifyStudent,
  rateLimit({ keyFn: (req) => `social:${req.student._id}`, max: 45, windowMs: 60000 }),
  async (req, res) => {
    try {
      const scope = {
        studentId: req.student._id,
        classId: req.student.classLevel || "5",
        schoolId: "default",
      };
      const { world, questionId, correct } = req.body || {};
      if (!world || questionId == null) {
        return res.status(400).json({ success: false, message: "world and questionId are required." });
      }
      const question = await SocialQuestion.findOne({ id: Number(questionId), world }).lean();
      if (!question) return res.status(404).json({ success: false, message: "Question not found." });
      if (typeof correct !== "boolean") {
        return res.status(400).json({ success: false, message: "correct must be a boolean." });
      }

      const lk = await lockStatus(scope.studentId, world);
      if (lk.locked) {
        return res.status(403).json({
          success: false,
          locked: true,
          message: `Finish ${lk.prevName} first — ${world} answers can't be saved until it unlocks.`,
        });
      }

      const existing = await SocialProgress.findOne({
        studentId: scope.studentId,
        questionId: question.id,
      });
      const alreadySolved = Boolean(existing && existing.solved);
      const solved = Boolean(correct) || alreadySolved;
      const patch = {
        world: question.world,
        solved,
        classId: scope.classId,
        schoolId: scope.schoolId,
      };
      if (solved && !alreadySolved) patch.solvedAt = new Date();
      await SocialProgress.findOneAndUpdate(
        { studentId: scope.studentId, questionId: question.id },
        {
          $set: patch,
          $inc: { attemptCount: 1 },
          $push: { attempts: { correct: Boolean(correct), at: new Date() } },
        },
        { upsert: true, new: true }
      );

      // Adaptive difficulty: 3 correct in a row -> up; 2 wrong in a row -> down.
      const levelDoc = await SocialStudentLevel.findOneAndUpdate(
        { studentId: scope.studentId, world: question.world },
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
      await SocialStudentLevel.updateOne(
        { _id: levelDoc._id },
        { $set: { difficulty: nextDiff, correctStreak: nextCorrect, wrongStreak: nextWrong } }
      );

      const total = await SocialQuestion.countDocuments({ world: question.world });
      const doneDocs = await SocialProgress.find({
        studentId: scope.studentId,
        world: question.world,
        solved: true,
      }).lean();
      const completed = total > 0 && doneDocs.length >= total;

      await SocialStudentMeta.findOneAndUpdate(
        { studentId: scope.studentId },
        { $set: { lastWorld: question.world, lastQuestionId: question.id, lastAt: new Date() } },
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
      console.error("POST /api/social/answer failed:", error);
      res.status(500).json({ success: false, message: "Error saving answer", error: error.message });
    }
  }
);

module.exports = router;