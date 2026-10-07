const Class5DailyChallenge = require("../models/Class5DailyChallenge");

// ─── Shared "Today's Challenge" engine for the three Class 5 worlds ─────────
//
// Math Adventure, World Explorer and Science World each have their own question
// bank, renderer and artwork, but the *daily* mechanics are identical:
// rotate one question per calendar day, remember it per student for that day,
// and never let the daily challenge disturb per-world progress. That logic lives
// here once and is used by all three routes.
//
// Every function is subject-parameterised: there is no per-subject branch.

/** "YYYY-MM-DD" in server local time. The day boundary is the server's, so the
 *  client and server can never disagree about which day it is. */
function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Deterministic index into the bank for a given day. Same day -> same question
 * for every student, and a refresh cannot change it.
 */
function dayIndex(bankLength, d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d - start) / 86400000);
  return dayOfYear % Math.max(1, bankLength);
}

/**
 * Pick today's question out of an already-sorted bank.
 *
 * When more than one question is available the pick is nudged forward while it
 * has the same `type` as yesterday's, so the student does not get the same
 * *kind* of puzzle two days running (an ordering task one day, a matching task
 * the next).
 */
function pickDailyQuestion(sortedBank, d = new Date()) {
  if (!sortedBank.length) return null;
  const total = sortedBank.length;

  let idx = dayIndex(total, d);
  const yesterdayIdx = (dayIndex(total, d) + total - 1) % total;

  const sameAsYesterday = () =>
    total > 1 &&
    sortedBank[idx] &&
    sortedBank[yesterdayIdx] &&
    sortedBank[idx].type === sortedBank[yesterdayIdx].type;

  if (sameAsYesterday()) idx = (idx + 1) % total;
  if (sameAsYesterday() && total > 2) idx = (idx + 1) % total;

  return sortedBank[idx];
}

/**
 * Read today's record for a student+subject.
 *
 * `legacy` is an optional one-time import hook used by Science World, whose
 * completions live in the older `ScienceDaily` collection. When a legacy record
 * shows the day was already completed it is copied into the new store so the
 * student never loses a completion they earned before this change.
 */
async function getDailyRecord({ studentId, subject, dateKey = todayKey(), legacy = null }) {
  let rec = await Class5DailyChallenge.findOne({ studentId, subject, dateKey }).lean();

  if (!rec && legacy && legacy.model) {
    const old = await legacy.model
      .findOne({ ...legacy.match, studentId, dateKey })
      .lean();
    if (old && (old.solved || old.completed)) {
      rec = await Class5DailyChallenge.findOneAndUpdate(
        { studentId, subject, dateKey },
        {
          $set: {
            questionId: old.questionId,
            solved: true,
            completed: true,
            solvedAt: old.solvedAt || null,
          },
          $setOnInsert: { classId: "5", schoolId: "default" },
          $inc: { attempts: old.attempts || 0 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
    }
  }

  return rec || null;
}

/**
 * Record an attempt at today's challenge.
 *
 * This deliberately does NOT touch MathsProgress / SocialProgress /
 * ScienceProgress or the adaptive level, so playing the daily challenge cannot
 * change world completion, unlocking or difficulty.
 *
 * A correct answer is remembered for the rest of the day: re-visiting today
 * keeps showing the completed state instead of serving a fresh question.
 */
async function recordDailyAttempt({
  studentId,
  subject,
  questionId,
  correct,
  dateKey = todayKey(),
  classId,
  schoolId,
}) {
  const existing = await Class5DailyChallenge.findOne({ studentId, subject, dateKey });
  const alreadyCompleted = Boolean(existing && existing.completed);
  const completed = alreadyCompleted || Boolean(correct);

  return Class5DailyChallenge.findOneAndUpdate(
    { studentId, subject, dateKey },
    {
      $set: {
        questionId,
        solved: completed,
        completed,
        solvedAt: completed && !alreadyCompleted ? new Date() : existing ? existing.solvedAt : null,
      },
      $setOnInsert: { classId: classId || "5", schoolId: schoolId || "default" },
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

module.exports = {
  todayKey,
  dayIndex,
  pickDailyQuestion,
  getDailyRecord,
  recordDailyAttempt,
};