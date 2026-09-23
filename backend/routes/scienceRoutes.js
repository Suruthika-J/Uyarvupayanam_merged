const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const ScienceWorld = require("../models/ScienceWorld");
const ScienceQuestion = require("../models/ScienceQuestion");
const ScienceProgress = require("../models/ScienceProgress");
const ScienceStudentLevel = require("../models/ScienceStudentLevel");
const ScienceStudentMeta = require("../models/ScienceStudentMeta");
const ScienceExperimentResult = require("../models/ScienceExperimentResult");
const ScienceDaily = require("../models/ScienceDaily");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

// Cartoon Science Adventure World (Class 5 Science).
//   GET  /worlds                      - public world list + themes + discoveries
//                                       (browseable logged out; personalised
//                                       { solved, total, locked, completed } +
//                                       continueWorld with a student token).
//   GET  /worlds/:world               - public single-world meta (deep links).
//   GET  /topics                      - topic / activity index across worlds.
//   GET  /questions                   - batch question index (no answers).
//   GET  /questions/:id               - single question meta (no answer).
//   GET  /experiments                 - experiment ideas index (no answers).
//   GET  /experiments/:world          - one experiment preview (no answers).
//   GET  /:world                      - play bundle for the logged-in student:
//                                       world, discoveries, experiment preview,
//                                       next question at adaptive difficulty,
//                                       progress, resumeStage, experimentDone.
//   POST /answer                      - validate a pick server-side + record it.
//   POST /progress                    - record explore/experiment/play stage.
//   GET  /progress                    - continueWorld + last stage pointer.
//   GET  /daily                       - today's single Daily Science Challenge.
//   POST /daily/complete              - validate + record the daily challenge.
//   POST /experiments/:world/result   - save a prediction and reveal outcomes.
//
// Answers NEVER ship in GET payloads: they are the single source of truth,
// validated per type server-side, and only returned after a submission (so the
// page can celebrate/explain). Gameplay requires a student token so progress,
// unlocking, level and resume are tracked per child. Worlds unlock one after
// another per student, only when the previous world is complete.

const WORLDS_FIELDS = { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 };

const DIFFICULTY_STEP = { easy: "medium", medium: "challenge", challenge: "challenge" };
const DIFFICULTY_BACK = { challenge: "medium", medium: "easy", easy: "easy" };

// Reads a Bearer token when present but never blocks: a valid token annotates
// the public world list as "this student's view"; stale tokens simply leave
// req.student unset and the list stays browseable.
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

function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function normStr(v) {
  return String(v == null ? "" : v).trim().toLowerCase();
}

function normPairs(arr) {
  return (arr || [])
    .map((p) => [normStr(p && p[0]), normStr(p && p[1])])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1));
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (normStr(a[i]) !== normStr(b[i])) return false;
  return true;
}

// Shape a question for the CLIENT. Topic/activity/concept/hint are part of the
// activity experience; the answer and explanation are never exposed here so the
// renderer cannot cheat and the server stays the single source of truth.
const shapeQuestion = (doc) => ({
  id: doc.id,
  world: doc.world,
  topic: doc.topic || "",
  activity: doc.activity || "",
  concept: doc.concept || "",
  type: doc.type,
  difficulty: doc.difficulty,
  question: doc.question,
  options: doc.options || [],
  objects: doc.objects || {},
  hint: doc.hint || "",
  image: doc.image || "",
});

const shapeExperiment = (exp) =>
  exp
    ? {
        prompt: exp.prompt || "",
        instruction: exp.instruction || "",
        buckets: exp.buckets || [],
        items: exp.items || [],
      }
    : null;

// Sequenced lock rule: a world is playable only when every activity of the
// previous world (order - 1) is solved. Order 1 is always playable.
async function lockStatus(studentId, world) {
  const w = await ScienceWorld.findOne({ id: world }).lean();
  if (!w) return { missing: true, locked: false, prevName: "" };
  if (w.order <= 1) return { missing: false, locked: false, prevName: "" };
  const prev = await ScienceWorld.findOne({ order: w.order - 1 }).lean();
  const total = prev ? await ScienceQuestion.countDocuments({ world: prev.id }) : 0;
  const solvedCount = studentId && total > 0
    ? await ScienceProgress.countDocuments({ studentId, world: prev.id, solved: true })
    : 0;
  return { missing: false, locked: !(total > 0 && solvedCount >= total), prevName: prev ? prev.nameEn : "" };
}

// Per-student view of every world: solved counts, completion, lock state, the
// world to continue next, and the last exploration stage.
async function computeStudentWorldStatus(studentId) {
  const worlds = await ScienceWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
  if (!worlds.length) return { worlds: [], continueWorld: null, lastWorld: "", stage: "explore" };

  const ids = worlds.map((w) => w.id);
  const [countRows, doneDocs, meta, expRows] = await Promise.all([
    ScienceQuestion.aggregate([
      { $match: { world: { $in: ids } } },
      { $group: { _id: "$world", total: { $sum: 1 } } },
    ]),
    ScienceProgress.find({ studentId, world: { $in: ids } }).select("world solved").lean(),
    ScienceStudentMeta.findOne({ studentId }).lean(),
    ScienceExperimentResult.find({ studentId, world: { $in: ids } }).select("world").lean(),
  ]);

  const totals = Object.fromEntries(countRows.map((r) => [String(r._id), r.total || 0]));
  const solvedByWorld = {};
  ids.forEach((w) => {
    solvedByWorld[String(w)] = 0;
  });
  doneDocs.forEach((d) => {
    if (d.solved && solvedByWorld[String(d.world)] != null) solvedByWorld[String(d.world)] += 1;
  });
  const expDone = new Set(expRows.map((e) => String(e.world)));

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
      experiment: shapeExperiment(w.experiment),
      experimentDone: expDone.has(String(w.id)),
      solved,
      total,
      locked,
      completed,
    });
  }

  return {
    worlds: list,
    continueWorld,
    lastWorld: (meta && meta.lastWorld) || "",
    stage: (meta && meta.stage) || "explore",
  };
}

async function advanceLevel(studentId, scope, world, correct) {
  const levelDoc = await ScienceStudentLevel.findOneAndUpdate(
    { studentId, world },
    { $setOnInsert: { classId: scope.classId, schoolId: scope.schoolId } },
    { upsert: true, new: true }
  );
  const nextCorrect = correct ? levelDoc.correctStreak + 1 : 0;
  const nextWrong = correct ? 0 : levelDoc.wrongStreak + 1;
  let nextDiff = levelDoc.difficulty;
  if (!correct) nextDiff = DIFFICULTY_BACK[levelDoc.difficulty];
  if (correct && nextCorrect >= 3) nextDiff = DIFFICULTY_STEP[levelDoc.difficulty];
  await ScienceStudentLevel.updateOne(
    { _id: levelDoc._id },
    { $set: { difficulty: nextDiff, correctStreak: nextCorrect, wrongStreak: nextWrong } }
  );
  return nextDiff;
}

// ── Public world list ───────────────────────────────────────────────────────
router.get("/worlds", optionalAuth, async (req, res) => {
  try {
    if (req.student) {
      const status = await computeStudentWorldStatus(req.student._id);
      return res.json({ success: true, data: status });
    }
    const docs = await ScienceWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
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
          experiment: shapeExperiment(w.experiment),
          experimentDone: false,
          locked: false,
          solved: 0,
          total: 0,
          completed: false,
        })),
        continueWorld: null,
        lastWorld: "",
        stage: "explore",
      },
    });
  } catch (error) {
    console.error("GET /api/science/worlds failed:", error);
    res.status(500).json({ success: false, message: "Error loading adventure worlds", error: error.message });
  }
});

// ── Single world meta (public, deep links / world header) ──────────────────
router.get("/worlds/:world", async (req, res) => {
  try {
    const world = await ScienceWorld.findOne({ id: req.params.world }, WORLDS_FIELDS).lean();
    if (!world) return res.status(404).json({ success: false, message: "World not found." });
    res.json({
      success: true,
      data: {
        world: {
          id: world.id,
          order: world.order,
          name: world.name,
          nameEn: world.nameEn,
          guideLine: world.guideLine || "",
          skills: world.skills || [],
          accent: world.accent,
          environment: world.environment,
          intro: world.intro,
          discoveries: world.discoveries || [],
          theme: world.theme,
          experiment: shapeExperiment(world.experiment),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading world", error: error.message });
  }
});

// ── Topic / activity index (public; no answers) ────────────────────────────
router.get("/topics", async (req, res) => {
  try {
    const docs = await ScienceQuestion.find({}).sort({ id: 1 }).lean();
    const map = {};
    docs.forEach((q) => {
      if (!map[q.world]) map[q.world] = [];
      map[q.world].push({
        id: q.id,
        topic: q.topic || "",
        activity: q.activity || "",
        concept: q.concept || "",
        type: q.type,
        difficulty: q.difficulty,
      });
    });
    res.json({ success: true, data: { topics: map } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading topics", error: error.message });
  }
});

// ── Question index (public batch; no answers) ───────────────────────────────
router.get("/questions", async (req, res) => {
  try {
    const { world, topic, difficulty, limit } = req.query;
    const filter = {};
    if (world) filter.world = world;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    const docs = await ScienceQuestion.find(filter)
      .sort({ id: 1 })
      .limit(Math.min(Number(limit) || 100, 200))
      .lean();
    res.json({
      success: true,
      data: {
        count: docs.length,
        questions: docs.map(shapeQuestion),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading questions", error: error.message });
  }
});

// ── Single question meta (public; no answer) ───────────────────────────────
router.get("/questions/:id", async (req, res) => {
  try {
    const q = await ScienceQuestion.findOne({ id: Number(req.params.id) }).lean();
    if (!q) return res.status(404).json({ success: false, message: "Question not found." });
    res.json({ success: true, data: { question: shapeQuestion(q) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading question", error: error.message });
  }
});

// ── Experiment ideas index (public preview; no answers) ─────────────────────
router.get("/experiments", async (req, res) => {
  try {
    const docs = await ScienceWorld.find({}, WORLDS_FIELDS).sort({ order: 1 }).lean();
    res.json({
      success: true,
      data: {
        experiments: docs
          .filter((w) => w.experiment)
          .map((w) => ({
            world: w.id,
            name: w.name,
            nameEn: w.nameEn,
            accent: w.accent,
            environment: w.environment,
            experiment: shapeExperiment(w.experiment),
          })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading experiments", error: error.message });
  }
});

// ── One experiment preview (public; no answers) ─────────────────────────────
router.get("/experiments/:world", async (req, res) => {
  try {
    const w = await ScienceWorld.findOne({ id: req.params.world }, WORLDS_FIELDS).lean();
    if (!w || !w.experiment) return res.status(404).json({ success: false, message: "Experiment not found." });
    res.json({
      success: true,
      data: {
        world: w.id,
        name: w.name,
        nameEn: w.nameEn,
        accent: w.accent,
        environment: w.environment,
        experiment: shapeExperiment(w.experiment),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading experiment", error: error.message });
  }
});

// ── Run + validate an experiment prediction ─────────────────────────────────
router.post(
  "/experiments/:world/result",
  verifyStudent,
  rateLimit({ keyFn: (req) => `sciExp:${req.student._id}:${req.params.world}`, max: 10, windowMs: 60000 }),
  async (req, res) => {
    try {
      const scope = {
        studentId: req.student._id,
        classId: req.student.classLevel || "5",
        schoolId: "default",
      };
      const worldId = req.params.world;
      const w = await ScienceWorld.findOne({ id: worldId }).lean();
      if (!w || !w.experiment) {
        return res.status(404).json({ success: false, message: "Experiment not found." });
      }
      const exp = w.experiment;
      const pick = (req.body && req.body.pick) || {};
      if (!pick || typeof pick !== "object" || Array.isArray(pick)) {
        return res.status(400).json({ success: false, message: "pick must be an object mapping items to buckets." });
      }

      for (const item of exp.items) {
        const chosen = pick[item.key];
        if (chosen == null || !exp.buckets.includes(String(chosen))) {
          return res.status(400).json({
            success: false,
            message: `Place every item in a prediction bucket first.`,
          });
        }
      }

      const answerMap = exp.answer || {};
      const results = {};
      let correct = 0;
      exp.items.forEach((item) => {
        const isRight = normStr(pick[item.key]) === normStr(answerMap[item.key]);
        results[item.key] = isRight;
        if (isRight) correct += 1;
      });

      const existing = await ScienceExperimentResult.exists({ studentId: scope.studentId, world: worldId });
      await ScienceExperimentResult.findOneAndUpdate(
        { studentId: scope.studentId, world: worldId },
        {
          $set: {
            pick,
            results,
            correct,
            total: exp.items.length,
            ranAt: new Date(),
            classId: scope.classId,
            schoolId: scope.schoolId,
          },
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        data: {
          correct,
          total: exp.items.length,
          results,
          observe: exp.observe || "",
          reveal: exp.reveal || "",
          guide: exp.guide || "",
          followUp: exp.followUp || "",
          alreadyRun: Boolean(existing),
        },
      });
    } catch (error) {
      console.error(`POST /api/science/experiments/${req.params.world}/result failed:`, error);
      res.status(500).json({ success: false, message: "Error running experiment", error: error.message });
    }
  }
);

// ── Daily Science Challenge (today's mixed question, rotated daily) ─────────
router.get("/daily", verifyStudent, async (req, res) => {
  try {
    const all = await ScienceQuestion.find({ world: "daily" }, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
      .sort({ id: 1 })
      .lean();
    if (!all.length) return res.status(404).json({ success: false, message: "Question bank is empty." });

    let idx = dayIndex(all.length);
    const yesterday = (dayIndex(all.length) + all.length - 1) % all.length;
    if (all[idx] && all[yesterday] && all[idx].type === all[yesterday].type) {
      idx = (idx + 1) % all.length;
      if (all[idx] && all[idx].type === all[yesterday].type && all.length > 2) {
        idx = (idx + 1) % all.length;
      }
    }

    const question = all[idx];
    const key = todayKey();
    const rec = await ScienceDaily.findOne({
      studentId: req.student._id,
      dateKey: key,
      questionId: question.id,
    }).lean();

    res.json({
      success: true,
      data: {
        question: shapeQuestion(question),
        solved: Boolean(rec && rec.solved),
        attempts: rec ? rec.attempts : 0,
      },
    });
  } catch (error) {
    console.error("GET /api/science/daily failed:", error);
    res.status(500).json({ success: false, message: "Error loading daily challenge", error: error.message });
  }
});

// ── Validate + record today's Daily Science Challenge ───────────────────────
router.post(
  "/daily/complete",
  verifyStudent,
  rateLimit({ keyFn: (req) => `sciDaily:${req.student._id}`, max: 20, windowMs: 60000 }),
  async (req, res) => {
    try {
      const { questionId, pick } = req.body || {};
      if (questionId == null || pick === undefined) {
        return res.status(400).json({ success: false, message: "questionId and pick are required." });
      }
      const question = await ScienceQuestion.findOne({ id: Number(questionId), world: "daily" }).lean();
      if (!question) return res.status(404).json({ success: false, message: "Question not found." });

      const validated = validatePick(question, pick);
      if (!validated.ok) {
        return res.status(400).json({ success: false, message: validated.message || "Invalid answer format." });
      }

      const key = todayKey();
      const rec = await ScienceDaily.findOne({
        studentId: req.student._id,
        dateKey: key,
        questionId: question.id,
      });
      const solved = Boolean(validated.correct) || Boolean(rec && rec.solved);
      await ScienceDaily.findOneAndUpdate(
        { studentId: req.student._id, dateKey: key, questionId: question.id },
        {
          $set: {
            solved,
            solvedAt: solved && (!rec || !rec.solved) ? new Date() : rec ? rec.solvedAt : null,
          },
          $inc: { attempts: 1 },
        },
        { upsert: true }
      );

      res.json({
        success: true,
        data: {
          correct: validated.correct,
          solved,
          hint: question.hint || "",
          explanation: question.explanation || "",
          answer: question.answer,
        },
      });
    } catch (error) {
      console.error("POST /api/science/daily/complete failed:", error);
      res.status(500).json({ success: false, message: "Error saving daily challenge", error: error.message });
    }
  }
);

// ── Play bundle for one world (login required) ──────────────────────────────
router.get("/:world", verifyStudent, async (req, res) => {
  try {
    const scope = {
      studentId: req.student._id,
      classId: req.student.classLevel || "5",
      schoolId: "default",
    };
    const worldId = req.params.world;
    if (worldId === "daily") {
      return res.redirect("/api/science/daily");
    }
    const w = await ScienceWorld.findOne({ id: worldId }).lean();
    if (!w) return res.status(404).json({ success: false, message: "World not found." });

    const lk = await lockStatus(scope.studentId, worldId);
    if (lk.missing) return res.status(404).json({ success: false, message: "World not found." });
    if (lk.locked) {
      return res.status(403).json({
        success: false,
        locked: true,
        message: `Finish ${lk.prevName} first — ${w.nameEn} will unlock when you do!`,
      });
    }

    const [level, doneDocs, meta, expRec] = await Promise.all([
      ScienceStudentLevel.findOne({ studentId: scope.studentId, world: worldId }).lean(),
      ScienceProgress.find({ studentId: scope.studentId, world: worldId }).lean(),
      ScienceStudentMeta.findOne({ studentId: scope.studentId }).lean(),
      ScienceExperimentResult.findOne({ studentId: scope.studentId, world: worldId }).lean(),
    ]);

    const levelName = (level && level.difficulty) || "easy";
    const solvedIds = new Set(doneDocs.filter((d) => d.solved).map((d) => String(d.questionId)));

    const pool = await ScienceQuestion.find({ world: worldId }).sort({ id: 1 }).lean();
    const fresh = pool.filter((qDoc) => qDoc.difficulty === levelName && !solvedIds.has(String(qDoc.id)));
    const anyFresh = pool.filter((qDoc) => !solvedIds.has(String(qDoc.id)));
    const allUnseen = fresh.length ? fresh : anyFresh;
    const bank = allUnseen.length ? allUnseen : pool;

    // least-seen first: repeat visits surface the questions a child has barely tried
    const counts = new Map();
    doneDocs.forEach((d) => counts.set(String(d.questionId), d.attemptCount || 0));
    const picked = [...bank].sort((a, b) => {
      const ca = counts.get(String(a.id)) || 0;
      const cb = counts.get(String(b.id)) || 0;
      return ca - cb || Math.random() - 0.5;
    })[0];

    const total = pool.length;
    const solvedCount = doneDocs.filter((d) => d.solved).length;

    const lastWorldPrev = (meta && meta.lastWorld) || "";
    let resumeStage = lastWorldPrev === worldId && meta && meta.stage ? meta.stage : "explore";
    const experimentDone = Boolean(expRec);
    if (resumeStage === "experiment") {
      resumeStage = w.experiment ? (experimentDone ? "play" : "experiment") : "explore";
    }

    await ScienceStudentMeta.findOneAndUpdate(
      { studentId: scope.studentId },
      { $set: { lastWorld: worldId, lastAt: new Date() } },
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
          experiment: shapeExperiment(w.experiment),
        },
        question: shapeQuestion(picked),
        progress: { completed: Math.min(solvedCount, total), total },
        level: levelName,
        resumeStage,
        experimentDone,
      },
    });
  } catch (error) {
    console.error(`GET /api/science/${req.params.world} failed:`, error);
    res.status(500).json({ success: false, message: "Error loading activity", error: error.message });
  }
});

// ── Per-type answer validation, all server-side ─────────────────────────────
function validatePick(question, pick) {
  const type = question.type;
  const answer = question.answer;

  if (["multiple-choice", "image-choice", "true-false", "scenario", "predict", "compare"].includes(type)) {
    if (typeof pick !== "string") return { ok: false, message: "pick must be a string." };
    return { ok: true, correct: normStr(pick) === normStr(answer) };
  }
  if (type === "image-map") {
    if (typeof pick !== "string") return { ok: false, message: "pick must be a hotspot id." };
    return { ok: true, correct: normStr(pick) === normStr(answer) };
  }
  if (type === "fill-blank") {
    if (typeof pick !== "string") return { ok: false, message: "pick must be the spelled word." };
    return { ok: true, correct: normStr(pick) === normStr(answer) };
  }
  if (type === "ordering") {
    if (!Array.isArray(pick)) return { ok: false, message: "pick must be an array." };
    if (!Array.isArray(answer) || !arraysEqual(pick, answer)) {
      return { ok: true, correct: false };
    }
    return { ok: true, correct: true };
  }
  if (type === "matching") {
    if (!Array.isArray(pick)) return { ok: false, message: "pick must be an array of pairs." };
    return { ok: true, correct: JSON.stringify(normPairs(pick)) === JSON.stringify(normPairs(answer)) };
  }
  if (type === "sort") {
    if (!Array.isArray(pick)) return { ok: false, message: "pick must be an array of [itemKey, bucket] pairs." };
    return { ok: true, correct: JSON.stringify(normPairs(pick)) === JSON.stringify(normPairs(answer)) };
  }
  return { ok: false, message: `Unknown question type: ${type}` };
}

// ── Record an answer + invisible adaptive level move ────────────────────────
router.post(
  "/answer",
  verifyStudent,
  rateLimit({ keyFn: (req) => `science:${req.student._id}`, max: 45, windowMs: 60000 }),
  async (req, res) => {
    try {
      const scope = {
        studentId: req.student._id,
        classId: req.student.classLevel || "5",
        schoolId: "default",
      };
      const { world, questionId, pick } = req.body || {};
      if (!world || questionId == null || pick === undefined) {
        return res.status(400).json({ success: false, message: "world, questionId and pick are required." });
      }
      if (world === "daily") {
        return res.status(400).json({ success: false, message: "Use /daily/complete for daily questions." });
      }
      const question = await ScienceQuestion.findOne({ id: Number(questionId), world }).lean();
      if (!question) return res.status(404).json({ success: false, message: "Question not found." });

      const validated = validatePick(question, pick);
      if (!validated.ok) {
        return res.status(400).json({ success: false, message: validated.message || "Invalid answer format." });
      }

      const lk = await lockStatus(scope.studentId, world);
      if (lk.locked) {
        return res.status(403).json({
          success: false,
          locked: true,
          message: `Finish ${lk.prevName} first — ${world} answers can't be saved until it unlocks.`,
        });
      }

      const correct = validated.correct;
      const existing = await ScienceProgress.findOne({
        studentId: scope.studentId,
        questionId: question.id,
      });
      const alreadySolved = Boolean(existing && existing.solved);
      const solved = correct || alreadySolved;
      const patch = {
        world: question.world,
        solved,
        classId: scope.classId,
        schoolId: scope.schoolId,
      };
      if (solved && !alreadySolved) patch.solvedAt = new Date();
      await ScienceProgress.findOneAndUpdate(
        { studentId: scope.studentId, questionId: question.id },
        {
          $set: patch,
          $inc: { attemptCount: 1 },
          $push: { attempts: { correct, at: new Date() } },
        },
        { upsert: true, new: true }
      );

      const nextDiff = await advanceLevel(scope.studentId, scope, question.world, correct);

      const doneDocs = await ScienceProgress.find({
        studentId: scope.studentId,
        world: question.world,
        solved: true,
      }).lean();
      const total = await ScienceQuestion.countDocuments({ world: question.world });
      const completed = total > 0 && doneDocs.length >= total;

      await ScienceStudentMeta.findOneAndUpdate(
        { studentId: scope.studentId },
        { $set: { lastWorld: question.world, lastAt: new Date() } },
        { upsert: true }
      );

      res.json({
        success: true,
        data: {
          correct,
          solved,
          completed,
          progress: { completed: Math.min(doneDocs.length, total), total },
          level: nextDiff,
          hint: question.hint || "",
          explanation: question.explanation || "",
          answer: question.answer, // post-submission only, so the page can explain
        },
      });
    } catch (error) {
      console.error("POST /api/science/answer failed:", error);
      res.status(500).json({ success: false, message: "Error saving answer", error: error.message });
    }
  }
);

// ── Per-student stage pointer (explore/experiment/play) ─────────────────────
router.post("/progress", verifyStudent, async (req, res) => {
  try {
    const { world, stage } = req.body || {};
    if (!['explore', 'experiment', 'play'].includes(stage)) {
      return res.status(400).json({ success: false, message: "stage must be explore, experiment or play." });
    }
    if (!world) return res.status(400).json({ success: false, message: "world is required." });
    await ScienceStudentMeta.findOneAndUpdate(
      { studentId: req.student._id },
      { $set: { lastWorld: world, stage, lastAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true, data: { world, stage } });
  } catch (error) {
    console.error("POST /api/science/progress failed:", error);
    res.status(500).json({ success: false, message: "Error saving progress", error: error.message });
  }
});

// ── Resume pointer + continue world (login required) ────────────────────────
router.get("/progress", verifyStudent, async (req, res) => {
  try {
    const meta = await ScienceStudentMeta.findOne({ studentId: req.student._id }).lean();
    const status = await computeStudentWorldStatus(req.student._id);
    res.json({
      success: true,
      data: {
        continueWorld: status.continueWorld,
        lastWorld: status.lastWorld,
        stage: (meta && meta.stage) || "explore",
        resumeStage: status.continueWorld === status.lastWorld ? (meta && meta.stage) || "explore" : "explore",
      },
    });
  } catch (error) {
    console.error("GET /api/science/progress failed:", error);
    res.status(500).json({ success: false, message: "Error loading progress", error: error.message });
  }
});

module.exports = router;