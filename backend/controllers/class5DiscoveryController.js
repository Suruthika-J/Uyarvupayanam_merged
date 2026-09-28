const User = require("../models/User");
const CareerWorld = require("../models/CareerWorld");
const SortingQuizQuestion = require("../models/SortingQuizQuestion");
const DiscoverQuestion = require("../models/DiscoverQuestion");
const StudentDiscoverProgress = require("../models/StudentDiscoverProgress");
const QuizResult = require("../models/QuizResult");
const SkillProfile = require("../models/SkillProfile");
const WeeklyChallenge = require("../models/WeeklyChallenge");
const ChallengeSubmission = require("../models/ChallengeSubmission");
const MiniGame = require("../models/MiniGame");
const GameAttempt = require("../models/GameAttempt");
const ExpeditionContribution = require("../models/ExpeditionContribution");
const SpotlightEntry = require("../models/SpotlightEntry");
const CareerVideo = require("../models/CareerVideo");
const CareerEvent = require("../models/CareerEvent");
const EventAttendance = require("../models/EventAttendance");
const Badge = require("../models/Badge");
const StudentCareerBadge = require("../models/StudentCareerBadge");
const Class5Streak = require("../models/Class5Streak");
const SeasonalEvent = require("../models/SeasonalEvent");
const CareerCertificate = require("../models/CareerCertificate");

const engine = require("../services/class5EngineService");
const { generateFutureMapPdf, generateCertificatePdf } = require("../services/class5PdfService");

// ─── Helpers ─────────────────────────────────────────────────────────────

const getScope = (req) => ({
  classId: (req.student && req.student.classLevel) || "5",
  schoolId: "default",
  studentId: req.student ? req.student._id : null,
});

const ownsId = (req, id) => {
  const target = String(id || "");
  const own = req.student ? String(req.student._id) : target;
  return target === own;
};

const WORLD_AXES = {
  "ocean-explorer": { logic: 3, focus: 2, creativity: 1 },
  "story-weaver": { creativity: 3, empathy: 2, leadership: 1 },
  "money-master": { logic: 3, focus: 2, creativity: 1 },
  "green-builder": { empathy: 3, leadership: 2, focus: 1 },
  "space-engineer": { logic: 3, creativity: 2, focus: 2 },
  "community-doctor": { empathy: 3, leadership: 3, logic: 1 },
  "code-wizard": { logic: 3, focus: 3, creativity: 2 },
  "science-lab": { logic: 3, focus: 2, creativity: 2 },
};

const worldAxes = (worldKey) => WORLD_AXES[worldKey] || { logic: 2, creativity: 2, empathy: 1, leadership: 1, focus: 2 };

const dayKey = () => new Date().toISOString().split("T")[0];

// ─── DISCOVER ME · quest cards ──────────────────────────────────────────

const shuffleArr = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const shapeQuestion = (q) => ({
  id: q.questionId,
  worldId: q.worldKey,
  type: q.type,
  prompt: q.prompt,
  hint: q.hint || "",
  feedback: q.feedback || "",
  assets: q.assets || {},
  options: q.options || [],
  targets: q.targets || [],
  buckets: q.buckets || [],
  correctAnswer: q.correctAnswer,
  difficulty: q.difficulty || 1,
});

const worldStars = (done, total) => {
  if (!total || done <= 0) return 0;
  const step = Math.ceil(total / 3);
  return Math.min(3, 1 + Math.floor((done - 1) / step));
};

// Per-world progress summary for the quest-card home screen.
exports.getDiscoverProgress = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const [worlds, progressDocs, totals] = await Promise.all([
      CareerWorld.find({ classId }).lean(),
      StudentDiscoverProgress.find({ studentId, solved: true }).lean(),
      DiscoverQuestion.aggregate([
        { $match: { classId } },
        { $group: { _id: "$worldKey", n: { $sum: 1 } } },
      ]),
    ]);
    const totalByWorld = {};
    totals.forEach((t) => { totalByWorld[t._id] = t.n; });
    const doneByWorld = {};
    progressDocs.forEach((d) => { doneByWorld[d.worldKey] = (doneByWorld[d.worldKey] || 0) + 1; });

    const worldsData = worlds.map((w) => {
      const total = totalByWorld[w.worldKey] || 0;
      const done = Math.min(doneByWorld[w.worldKey] || 0, total);
      return {
        worldId: w.worldKey,
        name: w.name,
        colorTag: w.colorTag,
        image: w.image || "",
        completed: done,
        total,
        stars: worldStars(done, total),
      };
    });

    const earnedCount = await StudentCareerBadge.countDocuments({ studentId });
    res.status(200).json({
      success: true,
      data: {
        worlds: worldsData,
        totalSolved: progressDocs.length,
        badgesCount: earnedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading quest progress", error: error.message });
  }
};

// Fetch a fresh batch of questions for one world. Unseen questions first;
// reviewed ones only loop back once the bank for that world is exhausted.
exports.getNextQuestions = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const worldId = req.query.worldId || "";
    const count = Math.min(4, Math.max(1, Number(req.query.count) || 3));

    const [solvedDocs, worlds] = await Promise.all([
      StudentDiscoverProgress.find({ studentId }).lean(),
      CareerWorld.find({ worldKey: worldId, classId }).lean(),
    ]);
    const solvedIds = new Set(solvedDocs.map((d) => d.questionId));
    const world = worlds[0] || { worldKey: worldId, name: worldId, colorTag: "navy", image: "" };

    const baseQuery = { classId, worldKey: worldId };
    const fresh = await DiscoverQuestion.find({ ...baseQuery, questionId: { $nin: [...solvedIds] } }).lean();
    let pool = fresh;
    if (pool.length < count) {
      const seen = await DiscoverQuestion.find(baseQuery).then((docs) =>
        docs.filter((x) => solvedIds.has(x.questionId))
      );
      seen.sort((a, b) => String(a.questionId).localeCompare(String(b.questionId)));
      pool = pool.concat(seen);
    }
    pool = shuffleArr(pool).slice(0, count);

    const total = await DiscoverQuestion.countDocuments(baseQuery);
    const done = solvedDocs.filter((d) => d.worldKey === worldId && d.solved).length;

    res.status(200).json({
      success: true,
      data: {
        world: {
          key: world.worldKey,
          name: world.name,
          colorTag: world.colorTag,
          image: world.image || "",
        },
        progress: { completed: Math.min(done, total), total, stars: worldStars(done, total) },
        questions: pool.map(shapeQuestion),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading quest questions", error: error.message });
  }
};

// Record a solved/attempted question and grow the student's profile.
exports.completeQuestion = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const { questionId, solved } = req.body || {};
    if (!questionId) {
      return res.status(400).json({ success: false, message: "questionId is required." });
    }
    const question = await DiscoverQuestion.findOne({ questionId, classId }).lean();
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const existing = await StudentDiscoverProgress.findOne({ studentId, questionId });
    const firstSolve = Boolean(solved) && (!existing || !existing.solved);

    await StudentDiscoverProgress.findOneAndUpdate(
      { studentId, questionId },
      {
        $set: { worldKey: question.worldKey, solved: Boolean(existing && existing.solved) || firstSolve },
        $push: { attempts: { correct: Boolean(solved), at: new Date() } },
        $inc: { attemptCount: 1 },
      },
      { upsert: true, new: true }
    );

    let xpEarned = 0;
    let skills = null;
    let streak = null;
    let newBadge = null;

    if (solved && firstSolve) {
      xpEarned = { 1: 5, 2: 8, 3: 12 }[question.difficulty] || 8;
      const gains = worldAxes(question.worldKey);
      const scaled = {};
      ["creativity", "logic", "empathy", "leadership", "focus"].forEach((axis) => {
        scaled[axis] = Math.round(Number(gains[axis]) || 0);
      });
      const profile = await engine.applyProfileUpdate(studentId, scaled, { classId });
      skills = {
        creativity: profile.creativity,
        logic: profile.logic,
        empathy: profile.empathy,
        leadership: profile.leadership,
        focus: profile.focus,
      };
      streak = await engine.touchStreak(studentId, { classId });
      await engine.contributeToExpedition(studentId, xpEarned, "discover", { classId });
      const awarded = await engine.awardBadge(studentId, "first-discover");
      if (awarded) newBadge = { key: awarded.badgeKey, name: awarded.name, emoji: awarded.emoji };
    }

    const doneDocs = await StudentDiscoverProgress.find({ studentId, worldKey: question.worldKey, solved: true }).lean();
    const done = doneDocs.length;
    const total = await DiscoverQuestion.countDocuments({ classId, worldKey: question.worldKey });

    res.status(200).json({
      success: true,
      message: solved ? "Nice solving!" : "Progress saved.",
      data: {
        progress: { worldId: question.worldKey, completed: Math.min(done, total), total, stars: worldStars(done, total) },
        xpEarned,
        skills,
        streak: streak ? streak.currentStreak : null,
        newBadge,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving question progress", error: error.message });
  }
};

// ─── DISCOVER ME ─────────────────────────────────────────────────────────

exports.getQuizQuestions = async (req, res) => {
  try {
    const questions = await SortingQuizQuestion.find({ classId: getScope(req).classId })
      .sort({ _id: 1 })
      .lean();
    res.status(200).json({
      success: true,
      data: questions.map((q) => ({
        id: q._id,
        text: q.text,
        emoji: q.emoji || "✨",
        options: (q.options || []).map((o, i) => ({
          index: i,
          label: o.label,
          emoji: o.emoji || "",
          worldKey: o.worldKey,
        })),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading quiz questions", error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

    const questions = await SortingQuizQuestion.find({ classId }).lean();
    if (!questions.length) {
      return res.status(404).json({ success: false, message: "No quiz questions configured yet" });
    }

    const scores = {}; // worldKey -> count
    const axisTotals = { creativity: 0, logic: 0, empathy: 0, leadership: 0, focus: 0 };
    let answered = 0;

    answers.forEach((a) => {
      const q = questions.find((x) => String(x._id) === String(a.questionId)) || questions[a.questionIndex];
      const opt = q && q.options[a.optionIndex];
      if (!opt) return;
      answered += 1;
      scores[opt.worldKey] = (scores[opt.worldKey] || 0) + 1;
      Object.keys(axisTotals).forEach((axis) => {
        axisTotals[axis] += Number(opt.axes && opt.axes[axis]) || 0;
      });
    });

    if (answered === 0) {
      return res.status(400).json({ success: false, message: "Please answer at least one question." });
    }

    const resultWorldKey = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || "ocean-explorer";
    const world = await CareerWorld.findOne({ worldKey: resultWorldKey }).lean();

    // Persist result
    await QuizResult.create({
      studentId,
      answers: answers.map((a, i) => ({ questionId: a.questionId, optionIndex: a.optionIndex })),
      resultWorldKey,
      resultWorldName: (world && world.name) || resultWorldKey,
      classId,
    });

    // Update skill profile (average per answered question, weighted by option axes)
    const gains = {};
    Object.keys(axisTotals).forEach((axis) => {
      gains[axis] = answered ? Math.round(axisTotals[axis] / answered) * 2 : 0;
    });
    const profile = await engine.applyProfileUpdate(studentId, gains, { classId });

    // Streak + first-quiz badge + expedition contribution
    const streak = await engine.touchStreak(studentId, { classId });
    const newBadge = await engine.awardBadge(studentId, "first-quiz");
    await engine.contributeToExpedition(studentId, 10, "quiz", { classId });

    res.status(200).json({
      success: true,
      message: world && world.description
        ? `Your starting world is ${world.name}!`
        : "Quiz complete!",
      data: {
        resultWorld: {
          key: world ? world.worldKey : resultWorldKey,
          name: (world && world.name) || resultWorldKey,
          image: (world && world.image) || "",
          colorTag: (world && world.colorTag) || "blue",
          tagline: (world && world.tagline) || "",
          description: (world && world.description) || "",
          skillTags: (world && world.skillTags) || [],
        },
        skills: {
          creativity: profile.creativity,
          logic: profile.logic,
          empathy: profile.empathy,
          leadership: profile.leadership,
          focus: profile.focus,
        },
        streak: streak.currentStreak,
        newBadge: newBadge && { key: newBadge.badgeKey, name: newBadge.name, emoji: newBadge.emoji },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting quiz", error: error.message });
  }
};

exports.getSkillProfile = async (req, res) => {
  try {
    const requestedId = req.params.id;
    if (!ownsId(req, requestedId)) {
      return res.status(403).json({ success: false, message: "You can only view your own skill profile." });
    }
    const studentId = requestedId || getScope(req).studentId;
    const scope = { ...getScope(req), studentId };
    const profile = await engine.ensureSkillProfile(studentId, scope);
    const lastQuiz = await QuizResult.findOne({ studentId }).sort({ takenAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: {
        skills: {
          creativity: profile.creativity,
          logic: profile.logic,
          empathy: profile.empathy,
          leadership: profile.leadership,
          focus: profile.focus,
        },
        updatedAt: profile.updatedAt,
        lastWorld: lastQuiz ? { key: lastQuiz.resultWorldKey, name: lastQuiz.resultWorldName } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching skill profile", error: error.message });
  }
};

exports.getCurrentChallenge = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const now = new Date();
    let challenge = await WeeklyChallenge.findOne({
      classId,
      activeFrom: { $lte: now },
      activeTo: { $gte: now },
    })
      .sort({ activeFrom: -1 })
      .lean();

    if (!challenge) {
      // Self-healing: whenever the seeded window rolls over, spin up the next
      // challenge so the weekly "Try it" card is never empty.
      const pool = [
        { title: "Design a rocket fin", worldTag: "space-engineer", oneLiner: "why it matters: engineers test mini ideas before big builds.", description: "A rocket needs a fin to fly straight! Sketch one shape that could keep a paper rocket steady.", taskType: "open", taskPrompt: "Draw or describe your rocket fin. What shape is it? Why would it help?", options: [] },
        { title: "Write today's headline", worldTag: "story-weaver", oneLiner: "why it matters: headlines catch attention — a journalist's superpower.", description: "Something amazing happened at your school today. Write one headline.", taskType: "open", taskPrompt: "Write one fun headline about today at school.", options: [] },
        { title: "Balance the shop's sales", worldTag: "money-master", oneLiner: "why it matters: counting money carefully builds trust.", description: "Your stall sold 4 snacks at 5 coins each. How many coins are in the tin?", taskType: "choose", taskPrompt: "Pick the right total.", options: ["15", "20", "25", "30"] },
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const created = await WeeklyChallenge.create({
        ...pick,
        activeFrom: now,
        activeTo: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        classId,
      });
      challenge = created.toObject();
    }

    const submission = await ChallengeSubmission.findOne({ studentId, challengeId: challenge._id }).lean();
    res.status(200).json({
      success: true,
      data: {
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        oneLiner: challenge.oneLiner,
        image: challenge.image || "",
        taskType: challenge.taskType,
        taskPrompt: challenge.taskPrompt,
        options: challenge.options || [],
        worldTag: challenge.worldTag,
        submitted: Boolean(submission),
        submission: submission
          ? { response: submission.response, submittedAt: submission.submittedAt }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching weekly challenge", error: error.message });
  }
};

exports.submitChallenge = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const challenge = await WeeklyChallenge.findById(req.params.id).lean();
    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found." });
    }
    const now = new Date();
    if (now < challenge.activeFrom || now > challenge.activeTo) {
      return res.status(400).json({ success: false, message: "This challenge is not open right now." });
    }

    const existing = await ChallengeSubmission.findOne({ studentId, challengeId: challenge._id });
    if (existing) {
      return res.status(200).json({ success: true, message: "You already finished this week's try-it!", alreadySubmitted: true, data: {} });
    }

    const { response = "", responseIndex = -1 } = req.body || {};
    await ChallengeSubmission.create({
      studentId,
      challengeId: challenge._id,
      response: typeof response === "string" ? response.substring(0, 500) : "",
      responseIndex: Number(responseIndex),
      classId,
    });

    const gains = worldAxes(challenge.worldTag);
    const profile = await engine.applyProfileUpdate(studentId, gains, { classId });
    const streak = await engine.touchStreak(studentId, { classId });
    const newBadge = await engine.awardBadge(studentId, "first-challenge");
    await engine.contributeToExpedition(studentId, 15, "challenge", { classId });

    res.status(200).json({
      success: true,
      message: `Try-it done! +${challenge.worldTag ? "growth points" : ""} Nice exploring!`,
      data: {
        skills: {
          creativity: profile.creativity,
          logic: profile.logic,
          empathy: profile.empathy,
          leadership: profile.leadership,
          focus: profile.focus,
        },
        streak: streak.currentStreak,
        newBadge: newBadge && { key: newBadge.badgeKey, name: newBadge.name, emoji: newBadge.emoji },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting challenge", error: error.message });
  }
};

// ─── SKILL QUESTS ─────────────────────────────────────────────────────────

exports.listGames = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const category = req.query.category;
    const query = { classId };
    if (category && category !== "all") query.category = category;

    const [games, attempts] = await Promise.all([
      MiniGame.find(query).sort({ order: 1, _id: 1 }).lean(),
      GameAttempt.find({ studentId }).lean(),
    ]);

    const bestByGame = {};
    attempts.forEach((a) => {
      if (!bestByGame[a.gameKey] || a.pct > bestByGame[a.gameKey]) bestByGame[a.gameKey] = a.pct;
    });

    res.status(200).json({
      success: true,
      data: games.map((g) => ({
        id: g._id,
        key: g.key,
        category: g.category,
        title: g.title,
        description: g.description,
        oneLiner: g.oneLiner,
        emoji: g.emoji,
        gradient: g.gradient,
        image: g.image || "",
        featured: Boolean(g.featured),
        xpValue: g.xpValue,
        skillTags: g.skillTags || [],
        bestPct: bestByGame[g.key] || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading games", error: error.message });
  }
};

exports.getGame = async (req, res) => {
  try {
    const { studentId } = getScope(req);
    const game = await MiniGame.findOne({ $or: [{ _id: req.params.id }, { key: req.params.id }] })
      .lean();
    if (!game) {
      return res.status(404).json({ success: false, message: "Game not found." });
    }

    const attempts = await GameAttempt.find({ studentId, gameKey: game.key }).sort({ completedAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: {
        id: game._id,
        key: game.key,
        category: game.category,
        title: game.title,
        description: game.description,
        oneLiner: game.oneLiner,
        emoji: game.emoji,
        gradient: game.gradient,
        image: game.image || "",
        xpValue: game.xpValue,
        skillTags: game.skillTags || [],
        axisGains: game.axisGains || {},
        play: game.play || {},
        attempts: (attempts || []).map((a) => ({ pct: a.pct, xpEarned: a.xpEarned, completedAt: a.completedAt })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading game", error: error.message });
  }
};

// Award helper for game completion badges
const GAME_BADGES = {
  "pattern-bridge": { key: "logic-learner", name: "Logic Learner" },
  "code-wizard-lite": { key: "code-curious", name: "Code Curious" },
  "story-spark": { key: "story-weaver", name: "Story Weaver" },
  "shop-balance": { key: "money-smart", name: "Money Smart" },
  "debate-pal": { key: "voice-hero", name: "Voice Hero" },
};

exports.submitGameAttempt = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const game = await MiniGame.findOne({ $or: [{ _id: req.params.id }, { key: req.params.id }] }).lean();
    if (!game) {
      return res.status(404).json({ success: false, message: "Game not found." });
    }

    const pct = Math.max(0, Math.min(100, Number(req.body.pct) || 0));
    const score = Number(req.body.score) || 0;

    // Anti-farming: repeat attempts within 30s earn base XP, not bonus XP.
    const last = await GameAttempt.findOne({ studentId, gameKey: game.key }).sort({ completedAt: -1 });
    const tooFast = last && Date.now() - new Date(last.completedAt).getTime() < 30000;

    const baseXp = Number(game.xpValue) || 15;
    const xpEarned = Math.round(pct >= 80 ? baseXp : baseXp * Math.max(0.4, pct / 100));
    const awardedXp = tooFast ? 0 : xpEarned;

    await GameAttempt.create({
      studentId,
      gameId: game._id,
      gameKey: game.key,
      score,
      pct,
      xpEarned: awardedXp,
      classId,
    });

    const axisGains = {};
    const gains = game.axisGains || {};
    ["creativity", "logic", "empathy", "leadership", "focus"].forEach((axis) => {
      axisGains[axis] = Math.round((Number(gains[axis]) || 0) * (pct / 100));
    });
    const profile = await engine.applyProfileUpdate(studentId, axisGains, { classId });
    const streak = await engine.touchStreak(studentId, { classId });

    let newBadge = null;
    if (!tooFast && pct >= 80) {
      const cfg = GAME_BADGES[game.key];
      if (cfg) {
        const earned = await engine.awardBadge(studentId, cfg.key);
        if (earned) newBadge = { key: earned.badgeKey, name: earned.name, emoji: earned.emoji };
      }
    }

    await engine.contributeToExpedition(studentId, awardedXp, "game", { classId });

    res.status(200).json({
      success: true,
      message: tooFast ? "Nice replay! Take a moment, then try another quest." : `Great play! +${awardedXp} XP added to your expedition.`,
      data: {
        xpEarned: awardedXp,
        pct,
        skills: {
          creativity: profile.creativity,
          logic: profile.logic,
          empathy: profile.empathy,
          leadership: profile.leadership,
          focus: profile.focus,
        },
        streak: streak.currentStreak,
        newBadge,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving game attempt", error: error.message });
  }
};

// ─── SQUAD ────────────────────────────────────────────────────────────────

exports.getExpedition = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const expedition = await engine.findCurrentExpedition({ classId });
    if (!expedition) {
      return res.status(200).json({ success: true, data: null });
    }

    const ownContrib = await ExpeditionContribution.aggregate([
      { $match: { expeditionId: expedition._id, studentId } },
      { $group: { _id: null, xp: { $sum: "$xpContributed" } } },
    ]);
    const recent = await ExpeditionContribution.find({ expeditionId: expedition._id })
      .sort({ contributedAt: -1 })
      .limit(6)
      .lean();

    const names = {};
    await Promise.all(
      recent.map(async (r) => {
        if (names[r.studentId]) return;
        const u = await User.findById(r.studentId).select("name");
        names[r.studentId] = (u && u.name) || "A classmate";
      })
    );

    res.status(200).json({
      success: true,
      data: {
        id: expedition._id,
        title: expedition.title,
        subtitle: expedition.subtitle,
        goalWorldKey: expedition.goalWorldKey,
        goalWorldName: expedition.goalWorldName,
        targetXp: expedition.targetXp,
        currentXp: expedition.currentXp,
        pct: Math.round((expedition.currentXp / expedition.targetXp) * 100),
        starsToUnlock: expedition.starsToUnlock,
        myXp: (ownContrib[0] && ownContrib[0].xp) || 0,
        recentCheer: recent.map((r) => ({
          name: names[r.studentId] || "A classmate",
          xp: r.xpContributed,
          source: r.source,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching expedition", error: error.message });
  }
};

exports.contributeToExpedition = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const expedition = await engine.findCurrentExpedition({ classId });
    if (!expedition || String(expedition._id) !== String(req.params.id)) {
      return res.status(404).json({ success: false, message: "Expedition not found." });
    }

    // Only one manual effort per student per day (auto XP from quests is separate).
    const today = dayKey();
    const start = new Date(`${today}T00:00:00.000Z`);
    const end = new Date(`${today}T23:59:59.999Z`);
    const manualToday = await ExpeditionContribution.findOne({
      expeditionId: expedition._id,
      studentId,
      source: "manual",
      contributedAt: { $gte: start, $lte: end },
    });
    if (manualToday) {
      return res.status(429).json({ success: false, message: "You already shared today's effort. Come back tomorrow!" });
    }

    const amount = Math.max(5, Math.min(20, Number(req.body.xp) || 10));
    await ExpeditionContribution.create({
      studentId,
      expeditionId: expedition._id,
      xpContributed: amount,
      source: "manual",
    });
    expedition.currentXp = (expedition.currentXp || 0) + amount;
    await expedition.save();
    await engine.touchStreak(studentId, { classId });

    res.status(200).json({
      success: true,
      message: `You added ${amount} XP to the class expedition!`,
      data: { currentXp: expedition.currentXp, targetXp: expedition.targetXp, added: amount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error contributing to expedition", error: error.message });
  }
};

exports.getSpotlight = async (req, res) => {
  try {
    const { classId } = getScope(req);
    const week = engine.weekKey();
    let entry = await SpotlightEntry.findOne({ classId, weekOf: week }).lean();
    if (!entry) {
      entry = await SpotlightEntry.findOne({ classId }).sort({ weekOf: -1 }).lean();
    }
    res.status(200).json({ success: true, data: entry || null });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching spotlight", error: error.message });
  }
};

// Parent/teacher talking-point suggestions, generated from growth (not comparison).
exports.getNudges = async (req, res) => {
  try {
    const requestedId = req.query.studentId;
    if (!ownsId(req, requestedId)) {
      return res.status(403).json({ success: false, message: "You can only request nudges for your own profile." });
    }
    const studentId = requestedId || getScope(req).studentId;

    const [profile, lastQuiz, streak, badges, gamesPlayed, challenge] = await Promise.all([
      SkillProfile.findOne({ studentId }).lean(),
      QuizResult.findOne({ studentId }).sort({ takenAt: -1 }).lean(),
      Class5Streak.findOne({ studentId }).lean(),
      StudentCareerBadge.find({ studentId }).lean(),
      GameAttempt.countDocuments({ studentId }),
      ChallengeSubmission.countDocuments({ studentId }),
    ]);

    const name = (req.student && req.student.name) || "your child";
    const world = lastQuiz ? lastQuiz.resultWorldName : null;
    const nudges = [];

    if (world) {
      nudges.push({
        context: "Career world",
        text: `Ask about the ${world} world they unlocked in the sorting quiz.`,
      });
    }
    if (streak && streak.currentStreak >= 2) {
      nudges.push({
        context: "Streak",
        text: `They've been consistent for ${streak.currentStreak} days. Ask what kept them curious.`,
      });
    } else {
      nudges.push({ context: "Consistency", text: "Ask what one small thing they'd like to try today." });
    }
    if (gamesPlayed >= 1) {
      nudges.push({
        context: "Quest",
        text: `They've played ${gamesPlayed} quest${gamesPlayed > 1 ? "s" : ""}. Ask which felt the most fun.`,
      });
    }
    if (challenge >= 1) {
      nudges.push({
        context: "Weekly try-it",
        text: "Ask them to walk you through this week's 5-minute \"try it\" challenge.",
      });
    }
    if (badges.length >= 1) {
      nudges.push({
        context: "Badges",
        text: `They earned ${badges.length} badge${badges.length > 1 ? "s" : ""}. Ask them to show it in their Trophy Room.`,
      });
    }
    if (profile) {
      const strongest = ["creativity", "logic", "empathy", "leadership", "focus"]
        .map((a) => ({ axis: a, v: profile[a] || 25 }))
        .sort((a, b) => b.v - a.v)[0];
      if (strongest) {
        nudges.push({
          context: "Strength radar",
          text: `${strongest.axis.toUpperCase()} is their strongest growing strength. Ask what makes it feel easy for them.`,
        });
      }
    }

    res.status(200).json({ success: true, data: nudges.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating nudges", error: error.message });
  }
};

// ─── REAL WORLD ───────────────────────────────────────────────────────────

exports.listVideos = async (req, res) => {
  try {
    const { classId } = getScope(req);
    const worldId = req.query.worldId;
    const query = { classId };
    if (worldId && worldId !== "all") query.careerWorldKey = String(worldId);

    const [videos, worlds] = await Promise.all([
      CareerVideo.find(query).sort({ featured: -1, _id: 1 }).lean(),
      CareerWorld.find({ classId }).lean(),
    ]);

    const worldName = (key) => {
      const w = worlds.find((x) => x.worldKey === key);
      return w ? { name: w.name, emoji: w.emoji, colorTag: w.colorTag } : { name: key, emoji: "🌍", colorTag: "blue" };
    };

    res.status(200).json({
      success: true,
      data: videos.map((v) => ({
        id: v._id,
        careerWorldKey: v.careerWorldKey,
        world: worldName(v.careerWorldKey),
        title: v.title,
        url: v.url,
        thumbnail: v.thumbnail,
        durationSec: v.durationSec,
        subtitlesUrl: v.subtitlesUrl,
        featured: Boolean(v.featured),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading videos", error: error.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const { studentId } = getScope(req);
    const now = new Date();
    const events = await CareerEvent.find({ dateTime: { $gte: now } }).sort({ dateTime: 1 }).lean();
    const attended = await EventAttendance.find({ studentId }).lean();
    const attendedSet = new Set(attended.map((a) => String(a.eventId)));
    res.status(200).json({
      success: true,
      data: events.map((e) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        coverImage: e.coverImage || "",
        dateTime: e.dateTime,
        durationMin: e.durationMin,
        type: e.type,
        attended: attendedSet.has(String(e._id)),
        attendanceBadgeKey: e.attendanceBadgeKey,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading events", error: error.message });
  }
};

exports.attendEvent = async (req, res) => {
  try {
    const { studentId, classId } = getScope(req);
    const event = await CareerEvent.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    let attendance = await EventAttendance.findOne({ studentId, eventId: event._id });
    let newBadge = null;
    if (!attendance) {
      attendance = await EventAttendance.create({ studentId, eventId: event._id });
      if (event.attendanceBadgeKey) {
        const earned = await engine.awardBadge(studentId, event.attendanceBadgeKey);
        if (earned) newBadge = { key: earned.badgeKey, name: earned.name, emoji: earned.emoji };
      }
      await engine.touchStreak(studentId, { classId });
    }

    res.status(200).json({
      success: true,
      message: newBadge ? `Attendance recorded! You earned the ${newBadge.name} badge!` : "Attendance already recorded. ✅",
      data: { attended: true, newBadge },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error recording attendance", error: error.message });
  }
};

exports.generateFutureMap = async (req, res) => {
  try {
    const studentId = getScope(req).studentId;
    const { worldKey, exploredWorldKeys = [] } = req.body || {};

    const student = await User.findById(studentId).select("name");
    const quizzes = await QuizResult.find({ studentId }).sort({ takenAt: -1 }).lean();
    const worlds = await CareerWorld.find({}).lean();
    const worldByKey = {};
    worlds.forEach((w) => { worldByKey[w.worldKey] = w; });

    const primaryKey = worldKey || (quizzes[0] && quizzes[0].resultWorldKey) || Object.keys(worldByKey)[0];
    const primary = worldByKey[primaryKey] || { name: "Your starting world", emoji: "🌍", description: "A world full of things to discover about you." };

    // Explored worlds: from quiz history + client-requested extras
    const exploredKeys = new Set(exploredWorldKeys.map(String));
    quizzes.forEach((q) => exploredKeys.add(q.resultWorldKey));
    if (!worldKey) exploredKeys.add(primaryKey);
    if (exploredKeys.size === 0) exploredKeys.add(primaryKey);

    const profile = await engine.ensureSkillProfile(studentId);
    const skills = {
      creativity: profile.creativity,
      logic: profile.logic,
      empathy: profile.empathy,
      leadership: profile.leadership,
      focus: profile.focus,
    };

    const explored = [...exploredKeys]
      .map((k) => worldByKey[k] || { name: k, emoji: "🌍" })
      .filter(Boolean)
      .slice(0, 8);

    const { url, fullPath } = generateFutureMapPdf({
      studentName: (student && student.name) || "Future Explorer",
      world: primary,
      worldsExplored: explored,
      skills,
      date: new Date().toLocaleDateString(),
    });

    const certificate = await CareerCertificate.create({
      studentId,
      studentName: (student && student.name) || "Future Explorer",
      title: "My Future Map",
      subtitle: `${primary.name} ${primary.emoji ? primary.emoji : ""}`,
      kind: "future-map",
      pdfUrl: url,
    });

    await engine.awardBadge(studentId, "future-map");
    await engine.touchStreak(studentId);

    res.status(201).json({
      success: true,
      message: "Your Future Map poster is ready to print!",
      data: { certificateId: certificate._id, downloadUrl: url },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating Future Map", error: error.message });
  }
};

// ─── TROPHY ROOM ──────────────────────────────────────────────────────────

exports.getStreak = async (req, res) => {
  try {
    const requestedId = req.params.id;
    if (!ownsId(req, requestedId)) {
      return res.status(403).json({ success: false, message: "You can only view your own streak." });
    }
    const studentId = requestedId;
    const today = dayKey();

    let streak = await Class5Streak.findOne({ studentId }).lean();
    if (!streak) streak = { currentStreak: 0, longestStreak: 0, lastActiveDate: null };

    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const [games, quizzes, challenges] = await Promise.all([
      GameAttempt.find({ studentId, completedAt: { $gte: since } }).lean(),
      QuizResult.find({ studentId, takenAt: { $gte: since } }).lean(),
      ChallengeSubmission.find({ studentId, submittedAt: { $gte: since } }).lean(),
    ]);
    const active = new Set();
    [games, quizzes, challenges].forEach((list) =>
      list.forEach((x) => active.add(new Date(x.completedAt || x.takenAt || x.submittedAt).toISOString().split("T")[0]))
    );

    const last7Days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      last7Days.push({ day: d, active: d === today ? true : active.has(d) });
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak: streak.currentStreak || 0,
        longestStreak: streak.longestStreak || 0,
        lastActiveDate: streak.lastActiveDate || null,
        last7Days,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching streak", error: error.message });
  }
};

exports.getSeasonalEvents = async (req, res) => {
  try {
    const { classId } = getScope(req);
    const now = new Date();
    const events = await SeasonalEvent.find({
      classId,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .sort({ endsAt: 1 })
      .lean();
    res.status(200).json({
      success: true,
      data: events.map((e) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        image: e.image || "",
        worldKey: e.worldKey,
        worldName: e.worldName,
        endsAt: e.endsAt,
        timeLeftMs: Math.max(0, new Date(e.endsAt).getTime() - now.getTime()),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching seasonal events", error: error.message });
  }
};

exports.getBadges = async (req, res) => {
  try {
    const requestedId = req.params.id;
    if (!ownsId(req, requestedId)) {
      return res.status(403).json({ success: false, message: "You can only view your own badges." });
    }
    const studentId = requestedId;

    const [earned, catalogue] = await Promise.all([
      StudentCareerBadge.find({ studentId }).sort({ earnedAt: -1 }).lean(),
      Badge.find({}).lean(),
    ]);

    const earnedKeys = new Set(earned.map((b) => b.badgeKey));
    const shelf = catalogue.map((c) => ({
      key: c.key,
      name: c.name,
      emoji: c.emoji || "🎖️",
      iconUrl: c.iconUrl || "",
      category: c.category,
      description: c.description,
      earnedAt: earnedKeys.has(c.key) ? earned.find((e) => e.badgeKey === c.key).earnedAt : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        earnedCount: earned.length,
        shelf,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching badges", error: error.message });
  }
};

exports.getCertificates = async (req, res) => {
  try {
    const requestedId = req.params.id;
    if (!ownsId(req, requestedId)) {
      return res.status(403).json({ success: false, message: "You can only view your own certificates." });
    }
    const studentId = requestedId;
    const certificates = await CareerCertificate.find({ studentId }).sort({ issuedAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching certificates", error: error.message });
  }
};

exports.getCertificatePdf = async (req, res) => {
  try {
    const cert = await CareerCertificate.findById(req.params.id).lean();
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }
    const sanitized = cert.pdfUrl.replace(/^\/uploads\//, "");
    const filePath = require("path").join(__dirname, "..", "uploads", sanitized);
    return res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error reading certificate", error: error.message });
  }
};

// Generate a wall certificate for an earned badge (trophy shelf "download").
exports.generateBadgeCertificate = async (req, res) => {
  try {
    const studentId = getScope(req).studentId;
    const { badgeKey } = req.body || {};
    if (!badgeKey) {
      return res.status(400).json({ success: false, message: "badgeKey is required." });
    }

    const earned = await StudentCareerBadge.findOne({ studentId, badgeKey }).lean();
    if (!earned) {
      return res.status(404).json({ success: false, message: "Earn this badge first before printing its certificate." });
    }
    const student = await User.findById(studentId).select("name");

    const { url } = generateCertificatePdf({
      studentName: (student && student.name) || "Future Explorer",
      title: earned.name,
      subtitle: "Earned through curiosity, consistency and trying new things.",
      kind: "badge",
    });

    const certificate = await CareerCertificate.create({
      studentId,
      studentName: (student && student.name) || "Future Explorer",
      title: earned.name,
      subtitle: "Earned through curiosity, consistency and trying new things.",
      kind: "badge",
      pdfUrl: url,
    });

    res.status(201).json({
      success: true,
      message: "Certificate ready to print!",
      data: { certificateId: certificate._id, downloadUrl: url },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating badge certificate", error: error.message });
  }
};

// ─── PARENT / TEACHER (read-only snapshot, no raw answers, no rankings) ──

exports.getParentSnapshot = async (req, res) => {
  try {
    const studentId = req.query.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId query param is required." });
    }
    const student = await User.findById(studentId).select("name classLevel district createdAt");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const [profile, streak, badges, expedition, gamesCount, world] = await Promise.all([
      SkillProfile.findOne({ studentId }).lean(),
      Class5Streak.findOne({ studentId }).lean(),
      StudentCareerBadge.find({ studentId }).sort({ earnedAt: -1 }).lean(),
      engine.findCurrentExpedition({ classId: student.classLevel || "5" }),
      GameAttempt.countDocuments({ studentId }),
      QuizResult.findOne({ studentId })
        .sort({ takenAt: -1 })
        .then((q) =>
          q ? CareerWorld.findOne({ worldKey: q.resultWorldKey }).lean() : null
        ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        student: {
          name: student.name,
          classLevel: student.classLevel,
          district: student.district,
          joined: student.createdAt,
        },
        skills: profile
          ? { creativity: profile.creativity, logic: profile.logic, empathy: profile.empathy, leadership: profile.leadership, focus: profile.focus }
          : null,
        streak: streak ? { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak } : { currentStreak: 0, longestStreak: 0 },
        badges: badges.map((b) => ({ name: b.name, emoji: b.emoji, earnedAt: b.earnedAt })),
        gamesPlayed: gamesCount,
        startingWorld: world ? { name: world.name, emoji: world.emoji, description: world.description } : null,
        expedition: expedition
          ? {
              title: expedition.title,
              currentXp: expedition.currentXp,
              targetXp: expedition.targetXp,
              pct: Math.round((expedition.currentXp / expedition.targetXp) * 100),
            }
          : null,
        message:
          "This is a growth-focused snapshot. No quiz answers, scores or rankings are shared — progress belongs to the student.",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching career snapshot", error: error.message });
  }
};