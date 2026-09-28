const express = require("express");
const router = express.Router();
const EnglishStudentMeta = require("../models/EnglishStudentMeta");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

// English Adventure (Class 5).
//   GET  /progress        -> the student's full English state (stars, streak,
//                            level, badges, activity counts, mistakes, progress)
//   POST /activity        -> record finishing/attempting an activity; awards
//                            stars, updates streak/level/badges/mistakes
//   POST /grammar-answer  -> record a grammar question attempt (per topic)
//   GET  /daily           -> today's daily challenge marker (rotation + done)
//
// All endpoints require a student token. Content (questions, writing topics,
// speaking scenes...) lives on the frontend; this API is the persistent
// record of how the child is doing and what they have earned.

// ── Levels (mirrored on frontend) ──────────────────────────────────────────
const LEVELS = [
  { level: 1, name: "Beginner", min: 0 },
  { level: 2, name: "Explorer", min: 50 },
  { level: 3, name: "Confident", min: 150 },
  { level: 4, name: "English Star", min: 300 },
  { level: 5, name: "English Champion", min: 500 },
];

function levelFromStars(stars) {
  let out = LEVELS[0];
  for (const l of LEVELS) {
    if (stars >= l.min) out = l;
  }
  return out;
}

// ── Badges (mirrored on frontend) ──────────────────────────────────────────
function badgeId(badges, key) {
  return badges.includes(key);
}

function computeBadges(meta) {
  const counts = Object.fromEntries((meta.activityCounts || []).map((a) => [a.activity, a.count]));
  const grammarSolved = (meta.grammarTopics || []).reduce((n, t) => n + (t.solved || 0), 0);
  const badges = meta.badges || [];
  const add = (key) => {
    if (!badgeId(badges, key)) badges.push(key);
  };
  if ((meta.activitiesCompleted || 0) >= 1) add("first-step");
  if (counts.writing >= 1) add("little-writer");
  if (counts.speaking >= 1) add("brave-speaker");
  if (counts.vocabulary >= 1) add("word-explorer");
  if (grammarSolved >= 10) add("grammar-hero");
  if (counts["sentence-builder"] >= 1) add("builder-buddy");
  if (counts["listen-speak"] >= 1) add("listener-star");
  if (counts["daily-challenge"] >= 1) add("daily-doer");
  if ((meta.activitiesCompleted || 0) >= 7) add("english-explorer");
  if ((meta.bestStreak || meta.streak || 0) >= 3) add("streak-3");
  if ((meta.bestStreak || 0) >= 7) add("streak-7");
  if ((meta.stars || 0) >= 500) add("champion");
  return badges;
}

function localDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
}

function bumpStreak(meta) {
  const today = localDate();
  const last = meta.lastActiveDay || "";
  if (last === today) return { streak: meta.streak, changed: false };
  const streak = last === yesterdayDate() ? (meta.streak || 0) + 1 : 1;
  meta.streak = streak;
  meta.bestStreak = Math.max(meta.bestStreak || 0, streak);
  meta.lastActiveDay = today;
  return { streak, changed: true };
}

function bumpActivityCount(meta, activity, by = 1) {
  const row = meta.activityCounts.find((a) => a.activity === activity);
  if (row) {
    row.count += by;
    row.lastAt = new Date();
  } else {
    meta.activityCounts.push({ activity, count: by, lastAt: new Date() });
  }
}

function bumpMistakes(meta, mistakes) {
  (mistakes || []).slice(0, 8).forEach((topic) => {
    if (!topic) return;
    const row = meta.commonMistakes.find((m) => m.topic === topic);
    if (row) {
      row.count += 1;
      row.updatedAt = new Date();
    } else {
      meta.commonMistakes.push({ topic, count: 1, updatedAt: new Date() });
    }
  });
  meta.commonMistakes.sort((a, b) => b.count - a.count);
  meta.commonMistakes = meta.commonMistakes.slice(0, 12);
}

function shapeMeta(meta) {
  const level = levelFromStars(meta.stars || 0);
  const counts = Object.fromEntries((meta.activityCounts || []).map((a) => [a.activity, a.count]));
  const distinct = (meta.activityCounts || []).filter((a) => a.count > 0).length;
  return {
    stars: meta.stars || 0,
    streak: meta.streak || 0,
    bestStreak: meta.bestStreak || 0,
    level: level.level,
    levelName: level.name,
    activitiesCompleted: meta.activitiesCompleted || 0,
    activitiesTried: distinct,
    badges: meta.badges || [],
    activityCounts: counts,
    grammarTopics: (meta.grammarTopics || []).map((t) => ({
      topicId: t.topicId,
      solved: t.solved || 0,
      total: t.total || 0,
    })),
    commonMistakes: (meta.commonMistakes || []).slice(0, 12).map((m) => ({ topic: m.topic, count: m.count })),
    dailyChallenge: meta.dailyChallenge || { date: "", activityKey: "" },
    weeklyChallenge: meta.weeklyChallenge || { weekKey: "", rounds: 0 },
  };
}

async function loadMeta(studentId) {
  const meta = await EnglishStudentMeta.findOneAndUpdate(
    { studentId },
    { $setOnInsert: { studentId } },
    { upsert: true, new: true }
  );
  return meta;
}

// ── GET /progress ──────────────────────────────────────────────────────────
router.get("/progress", verifyStudent, rateLimit({ keyFn: (req) => `english:${req.student._id}`, max: 60, windowMs: 60000 }), async (req, res) => {
  try {
    const meta = await loadMeta(req.student._id);
    const before = (meta.badges || []).length;
    meta.badges = computeBadges(meta);
    if ((meta.badges || []).length !== before) await meta.save();
    res.json({ success: true, data: shapeMeta(meta) });
  } catch (error) {
    console.error("GET /api/english/progress failed:", error);
    res.status(500).json({ success: false, message: "Error loading English progress", error: error.message });
  }
});

// ── POST /activity ─────────────────────────────────────────────────────────
// body: { activity, stars, mistakes: [topic...], completed: bool }
router.post("/activity", verifyStudent, rateLimit({ keyFn: (req) => `english:${req.student._id}`, max: 60, windowMs: 60000 }), async (req, res) => {
  try {
    const { activity, stars = 0, mistakes = [], completed = false, topic } = req.body || {};
    if (!activity) return res.status(400).json({ success: false, message: "activity is required." });

    const meta = await loadMeta(req.student._id);

    bumpStreak(meta);
    meta.stars = Math.max(0, (meta.stars || 0) + Number(stars || 0));
    bumpActivityCount(meta, activity, 1);
    if (completed) meta.activitiesCompleted = (meta.activitiesCompleted || 0) + 1;

    if (activity === "daily-challenge") meta.dailyChallenge = { date: localDate(), activityKey: topic || activity };
    if (activity === "weekly-challenge") {
      const weekKey = localDate().slice(0, 7);
      if (meta.weeklyChallenge && meta.weeklyChallenge.weekKey !== weekKey) meta.weeklyChallenge = { weekKey, rounds: 0 };
      meta.weeklyChallenge.rounds = Math.max(meta.weeklyChallenge.rounds || 0, Number(topic || 1));
    }

    bumpMistakes(meta, mistakes);

    const before = (meta.badges || []).length;
    meta.badges = computeBadges(meta);
    const newlyEarned = (meta.badges || []).slice(before);

    await meta.save();
    res.json({ success: true, data: { state: shapeMeta(meta), newBadges: newlyEarned } });
  } catch (error) {
    console.error("POST /api/english/activity failed:", error);
    res.status(500).json({ success: false, message: "Error saving English activity", error: error.message });
  }
});

// ── POST /grammar-answer ───────────────────────────────────────────────────
// body: { topicId, correct }  — increments the solved count for a topic
router.post("/grammar-answer", verifyStudent, rateLimit({ keyFn: (req) => `english:${req.student._id}`, max: 90, windowMs: 60000 }), async (req, res) => {
  try {
    const { topicId, correct } = req.body || {};
    if (!topicId || typeof correct !== "boolean") {
      return res.status(400).json({ success: false, message: "topicId and correct are required." });
    }
    const meta = await loadMeta(req.student._id);
    let row = meta.grammarTopics.find((t) => t.topicId === topicId);
    if (!row) {
      row = { topicId, solved: 0, total: 0, lastAt: new Date() };
      meta.grammarTopics.push(row);
    }
    if (correct) row.solved += 1;
    row.total += 1;
    row.lastAt = new Date();

    const before = (meta.badges || []).length;
    meta.badges = computeBadges(meta);
    const newlyEarned = (meta.badges || []).slice(before);
    await meta.save();

    res.json({ success: true, data: { state: shapeMeta(meta), newBadges: newlyEarned } });
  } catch (error) {
    console.error("POST /api/english/grammar-answer failed:", error);
    res.status(500).json({ success: false, message: "Error saving grammar answer", error: error.message });
  }
});

// ── GET /daily ─────────────────────────────────────────────────────────────
// Returns today's date, weekday, the rotated daily challenge key and whether
// the student already finished today's mission.
const WEEKLY_CYCLE = ["write", "speak", "grammar", "picture", "listen", "story", "weekend"];
function dayOfWeekIndex() {
  // 0 = Sunday ... 6 = Saturday
  return new Date().getDay();
}

router.get("/daily", verifyStudent, async (req, res) => {
  try {
    const meta = await EnglishStudentMeta.findOne({ studentId: req.student._id }).lean();
    const dateKey = localDate();
    const idx = dayOfWeekIndex();
    const challenge = WEEKLY_CYCLE[idx];
    const done = Boolean(meta && meta.dailyChallenge && meta.dailyChallenge.date === dateKey);
    res.json({ success: true, data: { date: dateKey, dayIndex: idx, activityKey: challenge, done } });
  } catch (error) {
    console.error("GET /api/english/daily failed:", error);
    res.status(500).json({ success: false, message: "Error loading daily challenge", error: error.message });
  }
});

module.exports = router;