const SkillProfile = require("../models/SkillProfile");
const Class5Streak = require("../models/Class5Streak");
const StudentCareerBadge = require("../models/StudentCareerBadge");
const Badge = require("../models/Badge");
const SpotlightEntry = require("../models/SpotlightEntry");
const Expedition = require("../models/Expedition");
const ExpeditionContribution = require("../models/ExpeditionContribution");
const ChallengeSubmission = require("../models/ChallengeSubmission");
const QuizResult = require("../models/QuizResult");
const GameAttempt = require("../models/GameAttempt");
const User = require("../models/User");

// ─── Helpers ─────────────────────────────────────────────────────────────

const toDateKey = (d) => {
  const date = d ? new Date(d) : new Date();
  return date.toISOString().split("T")[0];
};

const daysBetween = (a, b) => {
  const da = new Date(toDateKey(a)).getTime();
  const db = new Date(toDateKey(b)).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

// ISO week start (Monday) key, e.g. "2026-09-21"
const weekKey = (d) => {
  const date = d ? new Date(d) : new Date();
  const day = (date.getDay() + 6) % 7; // Monday = 0
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  return start.toISOString().split("T")[0];
};

// ─── Skill Profile ────────────────────────────────────────────────────────

async function ensureSkillProfile(studentId, scope = {}) {
  let profile = await SkillProfile.findOne({ studentId });
  if (!profile) {
    profile = await SkillProfile.create({
      studentId,
      classId: scope.classId || "5",
      schoolId: scope.schoolId || "default",
    });
  }
  return profile;
}

// Apply axis gains (0-100 capped) to a student's skill profile.
async function applyProfileUpdate(studentId, gains = {}, scope = {}) {
  const profile = await ensureSkillProfile(studentId, scope);
  ["creativity", "logic", "empathy", "leadership", "focus"].forEach((axis) => {
    const delta = Number(gains && gains[axis]) || 0;
    if (delta) {
      profile[axis] = Math.max(0, Math.min(100, (Number(profile[axis]) || 25) + delta));
    }
  });
  profile.updatedAt = new Date();
  await profile.save();
  return profile;
}

// ─── Streak ───────────────────────────────────────────────────────────────

// Call after any activity. Keeps currentStreak aligned to the calendar day.
async function touchStreak(studentId, scope = {}) {
  const todayKey = toDateKey();
  let streak = await Class5Streak.findOne({ studentId });
  if (!streak) {
    streak = await Class5Streak.create({
      studentId,
      classId: scope.classId || "5",
      schoolId: scope.schoolId || "default",
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date(),
    });
  } else {
    const last = toDateKey(streak.lastActiveDate);
    if (last === todayKey) {
      // already active today
    } else if (daysBetween(streak.lastActiveDate, new Date()) === 1) {
      streak.currentStreak += 1;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    } else {
      streak.currentStreak = 1;
    }
    streak.lastActiveDate = new Date();
    await streak.save();
  }
  await awardStreakBadges(studentId, streak.currentStreak);
  return streak;
}

// Daily scheduled job: reset any streak whose last active day is older than yesterday.
async function runDailyStreakJob() {
  const todayKey = toDateKey();
  const all = await Class5Streak.find({ currentStreak: { $gt: 0 } });
  let changed = 0;
  for (const s of all) {
    if (!s.lastActiveDate) continue;
    if (daysBetween(s.lastActiveDate, new Date()) > 1) {
      s.currentStreak = 0;
      await s.save();
      changed += 1;
    }
  }
  return { reset: changed };
}

const STREAK_BADGES = [
  { key: "streak-3",  name: "Spark Starter",  streak: 3  },
  { key: "streak-7",  name: "Week Warrior",   streak: 7  },
  { key: "streak-14", name: "Fortnight Feat", streak: 14 },
  { key: "streak-30", name: "Monthly Legend", streak: 30 },
];

async function awardStreakBadges(studentId, currentStreak) {
  const outputs = [];
  for (const b of STREAK_BADGES) {
    if (currentStreak >= b.streak) {
      const earned = await awardBadge(studentId, b.key);
      if (earned) outputs.push(earned);
    }
  }
  return outputs;
}

// ─── Badges ───────────────────────────────────────────────────────────────

// Awards the catalogue Badge (if it exists) to the student exactly once.
async function awardBadge(studentId, badgeKey) {
  const badge = await Badge.findOne({ key: badgeKey });
  if (!badge) return null;
  try {
    const created = await StudentCareerBadge.create({
      studentId,
      badgeKey: badge.key,
      name: badge.name,
      emoji: badge.emoji || "🎖️",
      iconUrl: badge.iconUrl || "",
      category: badge.category,
    });
    return created;
  } catch (e) {
    // duplicate (already earned) – ignore
    return null;
  }
}

// ─── Expedition ───────────────────────────────────────────────────────────

async function findCurrentExpedition(scope = {}) {
  const classId = scope.classId || "5";
  const schoolId = scope.schoolId || "default";
  const now = new Date();
  return Expedition.findOne({
    classId,
    schoolId,
    startsAt: { $lte: now },
    $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
  }).sort({ createdAt: -1 });
}

// Adds a student contribution to the active class expedition.
async function contributeToExpedition(studentId, xp, source = "game", scope = {}) {
  const expedition = await findCurrentExpedition(scope);
  if (!expedition) return null;
  if (!xp || xp <= 0) return expedition;
  await ExpeditionContribution.create({
    studentId,
    expeditionId: expedition._id,
    xpContributed: xp,
    source,
  });
  expedition.currentXp += xp;
  await expedition.save();
  return expedition;
}

// ─── Spotlight (effort-based, no ranking exposed) ─────────────────────────

// Effort score intentionally uses consistency + participation signals only,
// never raw game scores. Used internally by the weekly job — never returned.
async function buildEffortScore(studentId, since) {
  const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const streak = await Class5Streak.findOne({ studentId });
  const [challenges, quizzes, games] = await Promise.all([
    ChallengeSubmission.countDocuments({ studentId, submittedAt: { $gte: sinceDate } }),
    QuizResult.countDocuments({ studentId, takenAt: { $gte: sinceDate } }),
    GameAttempt.countDocuments({ studentId, completedAt: { $gte: sinceDate } }),
  ]);
  const streakScore = streak ? Math.min(streak.currentStreak, 30) : 0;
  return streakScore * 10 + challenges * 15 + quizzes * 10 + Math.min(games, 10) * 5;
}

// Weekly cron: selects one SpotlightEntry per class based on the week's effort.
async function runWeeklySpotlightJob() {
  const week = weekKey();
  const existing = await SpotlightEntry.findOne({ weekOf: week });
  if (existing) return { week, created: 0 };

  const classIds = await Class5Streak.distinct("classId");
  const schoolIds = ["default"];
  let created = 0;

  for (const classId of classIds) {
    for (const schoolId of schoolIds) {
      const students = await Class5Streak.find({ classId, schoolId }).select("studentId").limit(300);
      if (!students.length) continue;
      let best = null;
      let bestScore = -1;

      for (const s of students) {
        try {
          const score = await buildEffortScore(s.studentId);
          if (score > bestScore) {
            const u = await User.findById(s.studentId).select("name");
            if (!u) continue;
            best = { studentId: s.studentId, name: u.name, score };
            bestScore = score;
          }
        } catch (e) {
          // skip student on error
        }
      }

      if (best && bestScore > 0) {
        const note = buildSpotlightNote(bestScore);
        await SpotlightEntry.create({
          studentId: best.studentId,
          studentName: best.name,
          weekOf: week,
          reasonNote: note,
          classId,
          schoolId,
        });
        created += 1;
      }
    }
  }
  return { week, created };
}

function buildSpotlightNote(score) {
  if (score >= 40) return "Kept learning every single day this week!";
  if (score >= 25) return "Showed up consistently and tried new quests.";
  if (score >= 10) return "Made real progress with daily practice.";
  return "Took the first brave step into a new career world.";
}

// ─── Scheduler ────────────────────────────────────────────────────────────

let started = false;
function startScheduler() {
  if (started) return;
  started = true;

  let lastDay = toDateKey();
  let lastWeek = weekKey();

  const runJobs = async () => {
    const today = toDateKey();
    const week = weekKey();

    if (today !== lastDay) {
      lastDay = today;
      try {
        await runDailyStreakJob();
      } catch (e) {
        console.error("Class5 streak job error:", e.message);
      }
    }

    if (week !== lastWeek) {
      lastWeek = week;
      try {
        await runWeeklySpotlightJob();
      } catch (e) {
        console.error("Class5 spotlight job error:", e.message);
      }
    }
  };

  // Check every 10 minutes; jobs only fire when the day/week actually rolls over.
  const interval = setInterval(runJobs, 10 * 60 * 1000);
  if (interval.unref) interval.unref();

  // Run once shortly after boot (spotlight if missing for current week).
  setTimeout(() => {
    runWeeklySpotlightJob().catch(() => {});
    runDailyStreakJob().catch(() => {});
  }, 15 * 1000);
}

module.exports = {
  ensureSkillProfile,
  applyProfileUpdate,
  touchStreak,
  runDailyStreakJob,
  runWeeklySpotlightJob,
  startScheduler,
  awardBadge,
  awardStreakBadges,
  findCurrentExpedition,
  contributeToExpedition,
  weekKey,
  toDateKey,
};