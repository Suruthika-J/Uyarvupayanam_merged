// ============================================================================
// Academic Recommendation Service (School Module)
// ============================================================================
// PURPOSE
//   Builds an adaptive academic recommendation for a school student from data
//   that is ALREADY produced by the existing Onboarding assessment and the
//   existing Quiz test. This service does NOT replace either assessment, it
//   only READS their saved results.
//
// GUIDING RULES (project requirements)
//   1. The LATEST snapshot (onboarding OR quiz, whichever was created last) is
//      the PRIMARY source for the current weakness analysis and recommendations.
//   2. Previous OnboardingResponse / StudentTestResult records are used ONLY
//      to compute progress / improvement deltas (never to define what is weak).
//   3. Old and new scores are NEVER averaged: current strength is always the
//      latest measurement itself. This keeps a student's real current state
//      visible even if they performed badly in an earlier attempt.
//   4. Onboarding and quiz measurements stay distinguishable via a `type`
//      field ("onboarding" | "quiz") because they are different kinds of
//      measurements and must not be treated as identical.
//   5. Topic-level detail is preserved from OnboardingQuestion.
//      recommendationCategory whenever an onboarding snapshot is available.
//   6. Priority bands are based ONLY on the latest percentage:
//         <40     -> "Critical"
//         40-59   -> "Weak"
//         60-74   -> "Needs Practice"
//         75-89   -> "Good"
//         >=90    -> "Excellent"
//   7. Study minutes (query param `studyMinutes`, default 120) are allocated
//      to weak subjects proportionally to their priority weight, and each
//      subject's time is split Revision 40% / Practice 35% / Quiz 25%.
//   8. If ClassContent / Skill / AssessmentQuestion lookups are empty or fail,
//      safe fallback content is returned instead of throwing an API error.
// ============================================================================

const User = require("../models/User");
const OnboardingResponse = require("../models/OnboardingResponse");
const OnboardingQuestion = require("../models/OnboardingQuestion");
const StudentTestResult = require("../models/StudentTestResult");
const AssessmentQuestion = require("../models/AssessmentQuestion");
const ClassContent = require("../models/ClassContent");
const Skill = require("../models/Skill");

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

// Priority bands. Order matters: first band whose `max` is greater than the
// percentage wins. Percentages under 40 map to Critical, 90+ to Excellent.
const BANDS = [
  { max: 40, label: "Critical",     weight: 4 },
  { max: 60, label: "Weak",         weight: 3 },
  { max: 75, label: "Needs Practice", weight: 2 },
  { max: 90, label: "Good",         weight: 1 },
  { max: Infinity, label: "Excellent", weight: 0 },
];

const DEFAULT_STUDY_MINUTES = 120;

// A subject on an onboarding assessment can be mapped to the closest quiz
// category so practice questions can be suggested for the same skill area.
const SUBJECT_TO_QUIZ_CATEGORY = {
  "Mathematics": ["Mathematics / Quantitative Ability"],
  "Science": ["Science Understanding"],
  "English": ["Communication"],
  "Communication": ["Communication"],
  "Logical Thinking": ["Logical Thinking"],
  "General Awareness": ["General Awareness"],
  "Decision Making": ["Decision Making"],
  "Creativity": ["Creativity"],
  "Career Interest": ["Career Interest"],
};

const REVISION_PCT = 0.4; // study-plan activity split
const PRACTICE_PCT = 0.35;
const QUIZ_PCT = 0.25;

// ----------------------------------------------------------------------------
// Small pure helpers
// ----------------------------------------------------------------------------

// Round a number to 2 decimals (percentages come from the DB as floats).
const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Extract a numeric grade key ("Class 10" / "10" / "10th" -> "10").
const normalizeGrade = (grade) => {
  if (!grade) return "10";
  const match = String(grade).match(/\d+/);
  return match ? match[0] : "10";
};

// Classify a latest percentage into its band + priority weight.
const classifyBand = (pct) => {
  const value = Number.isFinite(Number(pct)) ? Number(pct) : 0;
  for (const band of BANDS) {
    if (value < band.max) {
      return { label: band.label, weight: band.weight };
    }
  }
  return { label: "Excellent", weight: 0 }; // unreachable, kept for safety
};

// Distribute a fixed pool of minutes across items proportionally to weight,
// giving rounding remainders to the highest-weight (weakest) item first.
const allocateMinutes = (total, items) => {
  if (!items.length || !(total > 0)) {
    return items.map((i) => ({ ...i, minutes: 0 }));
  }
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0) || 1;
  const result = items.map((i) => ({
    ...i,
    minutes: Math.floor(total * (i.weight / totalWeight)),
  }));
  let used = result.reduce((sum, r) => sum + r.minutes, 0);
  let remainder = Math.max(0, Math.floor(total) - used);
  const sorted = [...result].sort((a, b) => b.weight - a.weight);
  let idx = 0;
  while (remainder > 0) {
    sorted[idx % sorted.length].minutes += 1;
    remainder -= 1;
    idx += 1;
  }
  return result;
};

// ----------------------------------------------------------------------------
// Snapshot builders
// ----------------------------------------------------------------------------

// Convert a saved OnboardingResponse into a normalized snapshot containing
// subject-level measurements AND topic-level measurements. The topic level is
// derived by joining each answered question back to its OnboardingQuestion
// document and reading `recommendationCategory` (e.g. "Algebra", "Physics").
const buildOnboardingSnapshot = async (doc) => {
  const subjects = (doc.skillWiseScore || []).map((s) => ({
    type: "onboarding",
    sourceLabel: "Onboarding Assessment",
    level: s.skillTag,           // subject, e.g. "Mathematics"
    pct: round(s.percentage),
    score: s.score,
    total: s.total,
  }));

  // Topic-level aggregation for THIS attempt.
  let topics = [];
  try {
    const questionIds = (doc.answers || [])
      .filter((a) => a.questionId)
      .map((a) => a.questionId);
    const questions = await OnboardingQuestion.find({ _id: { $in: questionIds } });
    const byId = new Map(questions.map((q) => [String(q._id), q]));

    const topicMap = {};
    for (const ans of doc.answers || []) {
      const q = byId.get(String(ans.questionId));
      if (!q || !q.recommendationCategory) continue;
      const topic = q.recommendationCategory;
      if (!topicMap[topic]) {
        topicMap[topic] = { topic, subject: q.skillTag, correct: 0, total: 0 };
      }
      topicMap[topic].total += 1;
      if (ans.isCorrect) topicMap[topic].correct += 1;
    }
    topics = Object.values(topicMap)
      .map((t) => ({
        type: "onboarding",
        sourceLabel: "Onboarding Assessment",
        subject: t.subject,
        topic: t.topic,
        pct: round((t.correct / t.total) * 100),
      }))
      .filter((t) => Number.isFinite(t.pct));
  } catch (err) {
    // Topic join must never break recommendations; fall back to no topics.
    console.warn("academicRecommendationService: topic join failed", err.message);
    topics = [];
  }

  return {
    type: "onboarding",
    sourceLabel: "Onboarding Assessment",
    date: doc.createdAt,
    grade: doc.grade,
    classKey: normalizeGrade(doc.grade),
    scorePercentage: round(doc.scorePercentage),
    subjects,
    topics,
  };
};

// Convert a saved StudentTestResult into a normalized snapshot. Quiz results
// are category-based (e.g. "Logical Thinking"); they have no topic-level data.
const buildQuizSnapshot = (doc) => ({
  type: "quiz",
  sourceLabel: "Quiz Test",
  date: doc.createdAt,
  classLevel: doc.classLevel,
  classKey: normalizeGrade(doc.classLevel),
  scorePercentage: round(doc.totalScore && doc.totalScore.percentage),
  subjects: (doc.categoryScores || []).map((c) => ({
    type: "quiz",
    sourceLabel: "Quiz Test",
    level: c.category,           // e.g. "Logical Thinking"
    pct: round(c.percentage),
    score: c.score,
    total: c.total,
  })),
  topics: [], // quiz results do not store topic granularity
});

// ----------------------------------------------------------------------------
// Resource / practice lookups (all defensive, with safe fallbacks)
// ----------------------------------------------------------------------------

// Revision resources from ClassContent. Falls back to generic content, then to
// a safe static fallback so the API never fails because of empty data.
const fetchRevisionResources = async (classKey, subject) => {
  const subjectKeyword = subject.split(" ")[0];
  const subjectRe = new RegExp(subjectKeyword, "i");
  try {
    let content = await ClassContent.find({
      targetClass: classKey,
      status: "published",
      $or: [{ relatedSubjects: subjectRe }, { tags: subjectRe }, { title: subjectRe }],
    })
      .limit(3)
      .lean();
    if (!content.length) {
      content = await ClassContent.find({
        targetClass: classKey,
        status: "published",
        sectionType: { $in: ["Resources", "Basics", "Skills"] },
      })
        .limit(3)
        .lean();
    }
    if (!content.length) return [];
    return content.map((c) => ({
      id: c._id,
      title: c.title,
      description: c.shortDescription || c.fullDescription || "",
      type: "revision",
    }));
  } catch (err) {
    console.warn("academicRecommendationService: ClassContent lookup failed", err.message);
    return [];
  }
};

// Skill resource cards (extra study material) with graceful degradation.
const fetchSkillResources = async (classKey, subject) => {
  const subjectKeyword = subject.split(" ")[0];
  try {
    const skills = await Skill.find({
      classLevel: { $in: [classKey, "All"] },
      $or: [{ category: new RegExp(subjectKeyword, "i") }, { title: new RegExp(subjectKeyword, "i") }, { tags: new RegExp(subjectKeyword, "i") }],
    })
      .limit(3)
      .lean();
    return skills.map((s) => ({
      id: s._id,
      title: s.title,
      description: s.description,
      resources: s.resources || [],
      type: "skill",
    }));
  } catch (err) {
    console.warn("academicRecommendationService: Skill lookup failed", err.message);
    return [];
  }
};

// Practice questions from AssessmentQuestion filtered by the mapped category.
const fetchPracticeQuestions = async (classKey, subject) => {
  const categories = SUBJECT_TO_QUIZ_CATEGORY[subject] || [];
  if (!categories.length) return [];
  try {
    const questions = await AssessmentQuestion.find({
      classLevel: classKey,
      category: { $in: categories },
    })
      .limit(4)
      .lean();
    return questions.map((q) => ({
      id: q._id,
      question: q.questionText,
      category: q.category,
      type: "practice",
    }));
  } catch (err) {
    console.warn("academicRecommendationService: AssessmentQuestion lookup failed", err.message);
    return [];
  }
};

// ----------------------------------------------------------------------------
// Main entry point
// ----------------------------------------------------------------------------

/**
 * Build a full academic recommendation payload for one student.
 * @param {object} params
 * @param {string} params.userId   - Mongo id of the User (school student)
 * @param {string|number} [params.studyMinutes] - daily study minutes from query
 * @returns {object}  A { success, data } payload (or a 404 marker).
 */
const buildAcademicRecommendations = async ({ userId, studyMinutes }) => {
  // --- Produce a valid daily study-time budget from the query parameter -----
  const parsedMinutes = Number(studyMinutes);
  const totalMinutes =
    Number.isFinite(parsedMinutes) && parsedMinutes > 0
      ? Math.floor(parsedMinutes)
      : DEFAULT_STUDY_MINUTES;

  // --- Identity -------------------------------------------------------------
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    return { status: 404, error: "Student not found" };
  }
  const classKey = normalizeGrade(user.classLevel);

  // --- Load ALL assessment history (chronological) --------------------------
  const [onboardingDocs, quizDocs] = await Promise.all([
    OnboardingResponse.find({ userId }).sort({ createdAt: 1 }).lean(),
    StudentTestResult.find({ userId }).sort({ createdAt: 1 }).lean(),
  ]);

  // Build normalized snapshots; onboarding snapshots carry topic detail.
  const onboardingSnapshots = await Promise.all(onboardingDocs.map(buildOnboardingSnapshot));
  const quizSnapshots = quizDocs.map(buildQuizSnapshot);

  // Every snapshot, merged and ordered by date. The last one is PRIMARY.
  const allSnapshots = [...onboardingSnapshots, ...quizSnapshots].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const generatedAt = new Date().toISOString();

  // ---- Case: student has NO assessment data at all --------------------------
  if (allSnapshots.length === 0) {
    return {
      success: true,
      data: {
        hasAssessment: false,
        student: { userId: user._id, name: user.name, classLevel: user.classLevel },
        message: "No assessment found yet. Complete the onboarding assessment or a quiz to unlock recommendations.",
        overallPerformance: null,
        weakSubjects: [],
        weakTopics: [],
        recommendedActivities: [],
        studyPlan: {
          studyMinutesPerDay: totalMinutes,
          sessions: [],
          note: "Complete an assessment to receive a personalized study plan.",
        },
        progress: { summary: { total: 0, improved: 0, regressed: 0, unchanged: 0, new: 0 }, details: [] },
        dataSources: [],
        generatedAt,
      },
    };
  }

  // ---- Primary source: the single latest snapshot ---------------------------
  // Rule 1: current recommendations come ONLY from the latest snapshot.
  const latest = allSnapshots[allSnapshots.length - 1];
  // Topic detail is richest in onboarding data, so use the latest onboarding
  // snapshot (which may be older than the latest quiz) as the topic source.
  const topicSource = onboardingSnapshots.length
    ? onboardingSnapshots[onboardingSnapshots.length - 1]
    : null;

  // Build a history map keyed by "type::level" so onboarding and quiz subjects
  // never collide (e.g. "onboarding::Mathematics" vs "quiz::Logical Thinking").
  const historyMap = {};
  for (const snap of allSnapshots) {
    for (const m of snap.subjects) {
      const key = `${m.type}::${m.level}`;
      if (!historyMap[key]) historyMap[key] = [];
      historyMap[key].push({ date: snap.date, pct: m.pct });
    }
  }

  // For every current measurement attach band, priority weight and the delta
  // vs the IMMEDIATELY PREVIOUS attempt of the SAME kind (never an average).
  const currentMeasurements = latest.subjects.map((m) => {
    const band = classifyBand(m.pct);
    const history = historyMap[`${m.type}::${m.level}`] || [];
    const previous = history.length >= 2 ? history[history.length - 2] : null;
    const previousBand = previous ? classifyBand(previous.pct).label : null;
    const delta = previous ? round(m.pct - previous.pct) : null;
    const trend = previous === null ? "new" : delta > 0 ? "improved" : delta < 0 ? "regressed" : "unchanged";
    return {
      type: m.type,
      sourceLabel: m.sourceLabel,
      level: m.level,
      scorePercentage: m.pct,
      band: band.label,
      priorityWeight: band.weight,       // higher weight => weaker => more time
      previousScorePercentage: previous ? previous.pct : null,
      previousBand,
      delta,
      trend,
    };
  });

  // ---- Weak subjects: latest percentage < 75, weakest first -----------------
  const weakSubjects = currentMeasurements
    .filter((m) => m.scorePercentage < 75)
    .sort((a, b) => a.scorePercentage - b.scorePercentage);

  // Subjects >= 75 are considered stable (Good/Excellent) - just maintenance.
  const strongSubjects = currentMeasurements
    .filter((m) => m.scorePercentage >= 75)
    .sort((a, b) => b.scorePercentage - a.scorePercentage);

  // ---- Weak topics preserved from onboarding (recommendationCategory) -------
  // Rule 5: topics below 75% on the topic source snapshot are surfaced.
  let weakTopics = [];
  let topicsNote = "";
  if (topicSource && topicSource.topics.length) {
    weakTopics = topicSource.topics
      .filter((t) => t.pct < 75)
      .map((t) => ({
        topic: t.topic,
        subject: t.subject,
        scorePercentage: t.pct,
        band: classifyBand(t.pct).label,
      }))
      .sort((a, b) => a.scorePercentage - b.scorePercentage);
  } else {
    topicsNote = "Topic-level detail is available only from onboarding assessments.";
  }

  // ---- Recommended activities per weak subject (with safe fallbacks) --------
  // Rule 8: every lookup is defensive - never let empty data break the API.
  const recommendedActivities = [];
  for (const weak of weakSubjects) {
    const revision = await fetchRevisionResources(classKey, weak.level);
    const skillCards = await fetchSkillResources(classKey, weak.level);
    const practice = await fetchPracticeQuestions(classKey, weak.level);
    const subjectTopics = weakTopics.filter((t) => t.subject === weak.level);

    recommendedActivities.push({
      subject: weak.level,
      band: weak.band,
      priorityWeight: weak.priorityWeight,
      scorePercentage: weak.scorePercentage,
      delta: weak.delta,
      trend: weak.trend,
      topics: subjectTopics,
      revisionResources: revision.length ? revision : [
        { title: `Build a strong foundation in ${weak.level}`, description: "Review the core concepts of this subject step by step before attempting problems.", type: "revision", fallback: true },
      ],
      skillResources: skillCards,
      practiceQuestions: practice.length ? practice : [
        { question: `Solve additional ${weak.level} practice problems to build fluency.`, category: weak.level, type: "practice", fallback: true },
      ],
      suggestedActions: [
        `Revise ${weak.level} fundamentals daily (40% of the subject's study time).`,
        `Attempt ${weak.level} practice problems under timed conditions (35% of the subject's study time).`,
        `Take the weekly ${weak.level} quiz on the dashboard to track progress (25% of the subject's study time).`,
      ],
    });
  }

  // ---- Personalized study plan ----------------------------------------------
  // Rule 7: daily minutes are distributed proportionally to priority weight,
  // so weaker subjects (Critical=4 > Weak=3 > Needs Practice=2) receive more.
  const plannedSubjects = allocateMinutes(
    totalMinutes,
    weakSubjects.map((w) => ({ subject: w.level, band: w.band, weight: w.priorityWeight }))
  );

  const sessions = plannedSubjects.map((p) => {
    const revision = Math.round(p.minutes * REVISION_PCT);
    const practice = Math.round(p.minutes * PRACTICE_PCT);
    const quiz = Math.max(0, p.minutes - revision - practice); // absorbs rounding
    return {
      subject: p.subject,
      band: p.band,
      priorityWeight: p.weight,
      dailyMinutes: p.minutes,
      distribution: {
        revision: { minutes: revision, percentage: 40 },
        practice: { minutes: practice, percentage: 35 },
        quiz: { minutes: quiz, percentage: 25 },
      },
    };
  });
  sessions.sort((a, b) => b.dailyMinutes - a.dailyMinutes);

  const studyPlan = {
    studyMinutesPerDay: totalMinutes,
    allocationBasis: "Daily minutes are split using priority weights (Critical=4, Weak=3, Needs Practice=2, Good=1); weaker subjects receive more time.",
    activitySplit: "Revision 40% / Practice 35% / Quiz 25% per subject",
    sessions,
    maintainSubjects: strongSubjects.map((s) => ({ subject: s.level, band: s.band, note: "Score at or above 75% - keep it sharp with light weekly revision." })),
    note: weakSubjects.length
      ? "Priority focus should go to subjects with the smallest score first."
      : "All assessed areas are at or above 75%. Maintain with light weekly revision and re-test periodically.",
  };

  // ---- Progress / improvement comparison ------------------------------------
  // Rule 2 + 6: strictly latest vs previous, same assessment kind, no averaging.
  const summary = { total: 0, improved: 0, regressed: 0, unchanged: 0, new: 0 };
  const progressDetails = currentMeasurements.map((m) => {
    summary.total += 1;
    if (m.trend === "improved") summary.improved += 1;
    else if (m.trend === "regressed") summary.regressed += 1;
    else if (m.trend === "unchanged") summary.unchanged += 1;
    else summary.new += 1;
    return {
      type: m.type,
      sourceLabel: m.sourceLabel,
      level: m.level,
      currentScorePercentage: m.scorePercentage,
      previousScorePercentage: m.previousScorePercentage,
      delta: m.delta,
      trend: m.trend,
      band: m.band,
      previousBand: m.previousBand,
    };
  });

  // ---- Overall performance (from the latest snapshot) -----------------------
  const overallBand = classifyBand(latest.scorePercentage);
  const overallPerformance = {
    scorePercentage: latest.scorePercentage,
    band: overallBand.label,
    sourceType: latest.type,
    sourceLabel: latest.sourceLabel,
    gradeKey: latest.classKey,
    date: latest.date,
  };

  // ---- Data sources for transparency -----------------------------------------
  const dataSources = allSnapshots.map((s) => ({
    type: s.type,
    sourceLabel: s.sourceLabel,
    grade: s.grade || s.classLevel,
    scorePercentage: s.scorePercentage,
    date: s.date,
    isLatest: s.date === latest.date,
  }));

  return {
    success: true,
    data: {
      hasAssessment: true,
      student: { userId: user._id, name: user.name, classLevel: user.classLevel },
      overallPerformance,
      weakSubjects,
      strongSubjects,
      weakTopics,
      topicsNote,
      recommendedActivities,
      studyPlan,
      progress: { summary, details: progressDetails },
      dataSources,
      methodology: "Current scores = latest snapshot only. Earlier records are used purely to show improvement deltas. Onboarding and quiz data are kept separate. Priority bands: <40 Critical, 40-59 Weak, 60-74 Needs Practice, 75-89 Good, >=90 Excellent.",
      generatedAt,
    },
  };
};

module.exports = { buildAcademicRecommendations };