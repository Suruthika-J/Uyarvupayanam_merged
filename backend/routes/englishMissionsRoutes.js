// backend/routes/englishMissionsRoutes.js
//
// Class 8 English Space Explorer — server-driven learning + assessment API.
//
//   GET   /areas                                - 6 areas + per-topic status + continue-learning target
//   GET   /areas/:areaId                        - one area + its topic journey with statuses
//   GET   /topics/:topicId                      - lesson content + activities (answers stripped) + progress
//   POST  /topics/:topicId/activities/:activityId/answer  - validate answers server-side, record completion
//   POST  /topics/:topicId/assessment/start     - unlock-gated AI question set (answers never sent)
//   POST  /assessments/:assessmentId/submit     - grade against the stored set, results + explanations
//   GET   /progress                             - module overview used by dashboards
//   POST  /topics/:topicId/writing/feedback     - rubric-based AI guidance for writing practice tasks
//
// Everything requires a student token. Scoring, completion and unlock checks
// are authoritative on the server: the client is never trusted with marks,
// completion flags or the answer key.

const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");
const EnglishAssessment = require("../models/EnglishAssessment");
const StudentEnglishProgress = require("../models/StudentEnglishProgress");
const {
  getEnglishAreas,
  getEnglishArea,
  getEnglishTopics,
  englishTopicById,
  requiredActivityIds,
  activityById,
  shapeTopic,
  orderedTopics,
} = require("../seeders/seedEnglishMissions");
const {
  generateAssessmentQuestions,
  generateWritingFeedback,
} = require("../services/englishAiService");

// ── tiny compare helpers (shared by activity + assessment graders) ─────────
function norm(value) {
  return String(value === undefined || value === null ? "" : value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function stripPunct(value) {
  return norm(value).replace(/[.!?;,"']+$/g, "").trim();
}

function answersEqual(a, b) {
  return stripPunct(a) === stripPunct(b);
}

// ── progress helpers ───────────────────────────────────────────────────────

async function progressMap(studentId) {
  const docs = await StudentEnglishProgress.find({ studentId });
  const map = {};
  for (const d of docs) map[d.topic] = d;
  return map;
}

function topicState(topic, p, prevCompleted) {
  const required = requiredActivityIds(topic);
  const completed = (p && p.completedActivities) || [];
  const allActivitiesDone = required.every((id) => completed.includes(id));
  if (!prevCompleted) return "locked";
  if (p && p.assessmentCompleted) return "completed";
  if (allActivitiesDone) return "ready";
  return "open";
}

// First topic (in curriculum order) the student should work on next.
function findContinueLearning(ordered, pmap) {
  for (const topic of ordered) {
    const p = pmap[topic.id];
    if (p && p.assessmentCompleted) continue;
    const areaTopics = getEnglishTopics(topic.areaId);
    const idx = areaTopics.findIndex((t) => t.id === topic.id);
    const prev = idx > 0 ? areaTopics[idx - 1] : null;
    const prevDone = prev ? !!(pmap[prev.id] && pmap[prev.id].assessmentCompleted) : true;
    if (!prevDone) continue;
    return { areaId: topic.areaId, topicId: topic.id, topicName: topic.name };
  }
  return null;
}

function topicSummary(topic, p, prevCompleted) {
  return {
    id: topic.id,
    name: topic.name,
    order: topic.order,
    tagline: topic.tagline,
    world: topic.world,
    accent: topic.accent,
    state: topicState(topic, p, prevCompleted),
    bestPercent: p ? p.bestPercent : 0,
  };
}

async function areaPayload(area, pmap) {
  const topics = getEnglishTopics(area.id);
  let prevDone = true;
  const summary = topics.map((t) => {
    const s = topicSummary(t, pmap[t.id], prevDone);
    // Sequential unlocking: from the first uncompleted topic on, everything
    // stays locked until the previous topic's assessment is submitted.
    prevDone = prevDone && s.state === "completed";
    return s;
  });
  return {
    ...area,
    topics: summary,
    topicsCompleted: summary.filter((t) => t.state === "completed").length,
    topicsTotal: summary.length,
  };
}

// Strip answers + explanations from a stored question before sending to the
// browser — the answer key never leaves the backend pre-submission.
function shapeQuestion(q) {
  const out = {
    id: q.id,
    type: q.type,
    question: q.question,
    marks: q.marks,
    difficulty: q.difficulty,
    learningObjective: q.learningObjective,
  };
  if (q.options && q.options.length) out.options = q.options;
  return out;
}

// Does a submitted activity answer pass? Returns per-item results.
function gradeActivity(activity, answer) {
  const items = activity.items || [];
  const expected = items.map((it, i) => {
    if (activity.type === "mcq" || activity.type === "error-find") return it.correct;
    if (activity.type === "true-false") return it.correct;
    if (activity.type === "fill-blank") return it.correct; // array of accepted
    if (activity.type === "match-pairs") return it.right;
    if (activity.type === "sentence-order") return it.correctOrder; // array of ids
    return null;
  });

  return items.map((it, i) => {
    const student = Array.isArray(answer) ? answer[i] : i === 0 ? answer : undefined;
    const exp = expected[i];

    if (activity.type === "mcq" || activity.type === "error-find") {
      const ok = typeof student === "string" && answersEqual(student, exp);
      return { correct: ok, studentAnswer: student, correctAnswer: exp, explanation: it.explanation || "" };
    }
    if (activity.type === "true-false") {
      const studentBool = student === true || student === "True" || student === "true";
      const ok = studentBool === Boolean(exp);
      const display = student === true || student === false ? student : student;
      return { correct: ok, studentAnswer: display, correctAnswer: exp, explanation: it.explanation || "" };
    }
    if (activity.type === "fill-blank") {
      const accepted = Array.isArray(exp) ? exp : [exp];
      const ok = typeof student === "string" && accepted.some((a) => answersEqual(student, a));
      return { correct: ok, studentAnswer: student, correctAnswer: accepted.join(" / "), explanation: it.explanation || "" };
    }
    if (activity.type === "match-pairs") {
      const ok = typeof student === "string" && answersEqual(student, exp);
      return { correct: ok, studentAnswer: student, correctAnswer: exp, explanation: "Correct pair." };
    }
    if (activity.type === "sentence-order") {
      const ok = Array.isArray(student) && student.length === exp.length && student.every((v, j) => v === exp[j]);
      return { correct: ok, studentAnswer: Array.isArray(student) ? student : [], correctAnswer: exp, explanation: it.explanation || "" };
    }
    return { correct: false, explanation: "" };
  });
}

// ── GET /areas ─────────────────────────────────────────────────────────────
router.get("/areas", verifyStudent, async (req, res) => {
  try {
    const pmap = await progressMap(req.student._id);
    const areas = [];
    for (const a of getEnglishAreas()) {
      areas.push(await areaPayload(a, pmap));
    }
    const totalTopics = areas.reduce((n, a) => n + a.topicsTotal, 0);
    const topicsCompleted = areas.reduce((n, a) => n + a.topicsCompleted, 0);
    res.json({
      success: true,
      areas,
      totals: { topicsCompleted, topicsTotal: totalTopics },
      continueLearning: findContinueLearning(orderedTopics(), pmap),
    });
  } catch (err) {
    console.error("[englishMissions] GET /areas failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load the English module." });
  }
});

// ── GET /areas/:areaId ─────────────────────────────────────────────────────
router.get("/areas/:areaId", verifyStudent, async (req, res) => {
  try {
    const area = getEnglishArea(req.params.areaId);
    if (!area) return res.status(404).json({ success: false, message: "Area not found." });
    const pmap = await progressMap(req.student._id);
    const payload = await areaPayload(area, pmap);
    res.json({ success: true, area: payload });
  } catch (err) {
    console.error("[englishMissions] GET /areas/:areaId failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load the area." });
  }
});

// ── GET /topics/:topicId ───────────────────────────────────────────────────
router.get("/topics/:topicId", verifyStudent, async (req, res) => {
  try {
    const topic = englishTopicById(req.params.topicId);
    if (!topic) return res.status(404).json({ success: false, message: "Topic not found." });
    const pmap = await progressMap(req.student._id);
    const p = pmap[topic.id];
    const areaTopics = getEnglishTopics(topic.areaId);
    const idx = areaTopics.findIndex((t) => t.id === topic.id);
    const prev = idx > 0 ? areaTopics[idx - 1] : null;
    const prevCompleted = prev ? !!(pmap[prev.id] && pmap[prev.id].assessmentCompleted) : true;
    const required = requiredActivityIds(topic);
    const completedActs = (p && p.completedActivities) || [];
    const allActivitiesDone = required.every((id) => completedActs.includes(id));

    res.json({
      success: true,
      topic: shapeTopic(topic),
      progress: {
        completedActivities: completedActs,
        allActivitiesDone,
        assessmentCompleted: p ? !!p.assessmentCompleted : false,
        bestScore: p ? p.bestScore : 0,
        bestPercent: p ? p.bestPercent : 0,
        assessmentAttempts: p ? p.assessmentAttempts : 0,
        locked: !prevCompleted,
      },
      assessment: {
        available: prevCompleted && allActivitiesDone,
        count: topic.assessment.questionCount,
        difficulty: topic.assessment.difficulty,
      },
      nextTopic: idx < areaTopics.length - 1 ? { topicId: areaTopics[idx + 1].id, name: areaTopics[idx + 1].name } : null,
    });
  } catch (err) {
    console.error("[englishMissions] GET /topics/:topicId failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load the topic." });
  }
});

// ── POST /topics/:topicId/activities/:activityId/answer ────────────────────
router.post(
  "/topics/:topicId/activities/:activityId/answer",
  verifyStudent,
  rateLimit({
    keyFn: (req) => `${req.student._id}:act:${req.params.topicId}:${req.params.activityId}`,
    max: 12,
    windowMs: 60000,
    message: "Too many attempts. Take a short break and try again.",
  }),
  async (req, res) => {
    try {
      const topic = englishTopicById(req.params.topicId);
      if (!topic) return res.status(404).json({ success: false, message: "Topic not found." });
      const activity = activityById(topic, req.params.activityId);
      if (!activity) return res.status(404).json({ success: false, message: "Activity not found." });

      // Sequential unlocking within an area: activities of a topic may only be
      // attempted once the previous topic's assessment is submitted.
      const areaTopics = getEnglishTopics(topic.areaId);
      const idx = areaTopics.findIndex((t) => t.id === topic.id);
      const prev = idx > 0 ? areaTopics[idx - 1] : null;
      if (prev) {
        const prevDoc = await StudentEnglishProgress.findOne({ studentId: req.student._id, topic: prev.id });
        if (!prevDoc || !prevDoc.assessmentCompleted) {
          return res.status(403).json({ success: false, locked: true, message: `Complete "${prev.name}" first to unlock this topic.` });
        }
      }

      const answer = req.body && req.body.answer;
      const results = gradeActivity(activity, answer);
      const correct = results.every((r) => r.correct);

      let progress = await StudentEnglishProgress.findOne({ studentId: req.student._id, topic: topic.id });
      if (!progress) {
        progress = await StudentEnglishProgress.create({
          studentId: req.student._id,
          areaId: topic.areaId,
          topic: topic.id,
        });
      }
      progress.lastPlayed = new Date();
      const attempts = progress.activityAttempts || {};
      attempts[activity.activityId] = (attempts[activity.activityId] || 0) + 1;
      progress.activityAttempts = attempts;

      const freshlyCompleted = correct && !progress.completedActivities.includes(activity.activityId);
      if (freshlyCompleted) progress.completedActivities.push(activity.activityId);
      await progress.save();

      const required = requiredActivityIds(topic);
      const allActivitiesDone = required.every((id) => progress.completedActivities.includes(id));

      res.json({
        success: true,
        activityId: activity.activityId,
        correct,
        results,
        activityComplete: freshlyCompleted,
        allActivitiesDone,
      });
    } catch (err) {
      console.error("[englishMissions] activity answer failed:", err.message);
      res.status(500).json({ success: false, message: "Could not check the activity." });
    }
  }
);

// ── POST /topics/:topicId/assessment/start ─────────────────────────────────
router.post(
  "/topics/:topicId/assessment/start",
  verifyStudent,
  rateLimit({
    keyFn: (req) => `${req.student._id}:astart:${req.params.topicId}`,
    max: 6,
    windowMs: 60000,
    message: "You are generating assessments too quickly. Please wait a moment.",
  }),
  async (req, res) => {
    try {
      const topic = englishTopicById(req.params.topicId);
      if (!topic) return res.status(404).json({ success: false, message: "Topic not found." });

      const pmap = await progressMap(req.student._id);
      const areaTopics = getEnglishTopics(topic.areaId);
      const idx = areaTopics.findIndex((t) => t.id === topic.id);
      const prev = idx > 0 ? areaTopics[idx - 1] : null;
      const prevCompleted = prev ? !!(pmap[prev.id] && pmap[prev.id].assessmentCompleted) : true;
      if (!prevCompleted) {
        return res.status(403).json({ success: false, locked: true, message: "Complete the previous topic first." });
      }
      const p = pmap[topic.id];
      const completedActs = (p && p.completedActivities) || [];
      const allActivitiesDone = requiredActivityIds(topic).every((id) => completedActs.includes(id));
      if (!allActivitiesDone) {
        return res.status(403).json({ success: false, locked: true, message: "Complete all activities for this topic before starting the assessment." });
      }

      // Stable set mid-attempt: reuse a pending (generated, un-submitted) set.
      const pending = await EnglishAssessment.findOne({ studentId: req.student._id, topic: topic.id, status: "pending" })
        .sort({ attempt: -1 });
      if (pending) {
        return res.json({
          success: true,
          assessment: {
            id: pending._id,
            attempt: pending.attempt,
            source: pending.source,
            questions: (pending.questions || []).map(shapeQuestion),
            totalMarks: 0,
          },
          reused: true,
        });
      }

      const previousAttempts = await EnglishAssessment.countDocuments({ studentId: req.student._id, topic: topic.id });
      const attempt = previousAttempts + 1;

      console.log(`[englishMissions] generating assessment for "${topic.id}" (attempt ${attempt}) via AI...`);
      const questions = await generateAssessmentQuestions({
        topic,
        area: topic.areaId,
        count: topic.assessment.questionCount,
        difficulty: topic.assessment.difficulty,
        types: topic.assessment.types,
      });
      if (!questions || !questions.length) {
        return res.status(502).json({
          success: false,
          ai: true,
          message: "The AI question service could not generate a valid question set right now. Please try again in a moment.",
        });
      }

      const doc = await EnglishAssessment.create({
        studentId: req.student._id,
        areaId: topic.areaId,
        topic: topic.id,
        attempt,
        status: "pending",
        source: "ai",
        questions: questions.map((q, i) => ({ id: `q${i + 1}`, ...q })),
        totalMarks: questions.reduce((n, q) => n + (q.marks || 1), 0),
      });

      if (p) {
        p.assessmentAttempts = (p.assessmentAttempts || 0) + 1;
        p.lastPlayed = new Date();
        await p.save();
      }

      res.json({
        success: true,
        assessment: {
          id: doc._id,
          attempt: doc.attempt,
          source: doc.source,
          questions: doc.questions.map(shapeQuestion),
          totalMarks: doc.totalMarks,
        },
        reused: false,
      });
    } catch (err) {
      console.error("[englishMissions] assessment start failed:", err.message);
      res.status(500).json({ success: false, message: "Could not prepare the assessment." });
    }
  }
);

// ── POST /assessments/:assessmentId/submit ─────────────────────────────────
router.post(
  "/assessments/:assessmentId/submit",
  verifyStudent,
  rateLimit({
    keyFn: (req) => `${req.student._id}:asubmit:${req.params.assessmentId}`,
    max: 10,
    windowMs: 60000,
    message: "Too many submissions. Please wait a moment.",
  }),
  async (req, res) => {
    try {
      const doc = await EnglishAssessment.findOne({
        _id: req.params.assessmentId,
        studentId: req.student._id,
      });
      if (!doc) return res.status(404).json({ success: false, message: "Assessment not found." });
      if (doc.status !== "pending") {
        return res.status(400).json({ success: false, message: "This assessment has already been submitted." });
      }

      const submitted = Array.isArray(req.body && req.body.answers) ? req.body.answers : [];

      const results = (doc.questions || []).map((q) => {
        const found = submitted.find((s) => s.questionId === q.id);
        const student = found === undefined ? undefined : found.answer;

        let correct = false;
        let studentAnswer = student;

        if (q.type === "fill-in-the-blank") {
          const accepted = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
          correct = typeof student === "string" && accepted.some((a) => answersEqual(student, a));
        } else if (q.type === "true-false") {
          const sb = student === true || student === "True" || student === "true";
          const eb = q.correctAnswer === "True" || q.correctAnswer === true;
          correct = sb === eb;
          studentAnswer = sb ? true : false;
        } else {
          correct = typeof student === "string" && answersEqual(student, q.correctAnswer);
        }

        return {
          questionId: q.id,
          type: q.type,
          question: q.question,
          options: q.options || [],
          marks: q.marks || 1,
          difficulty: q.difficulty,
          learningObjective: q.learningObjective,
          correct,
          studentAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
        };
      });

      const score = results.reduce((n, r) => n + (r.correct ? r.marks : 0), 0);
      const totalMarks = doc.totalMarks || results.reduce((n, r) => n + r.marks, 0);
      const percent = totalMarks ? Math.round((score / totalMarks) * 100) : 0;

      doc.status = "submitted";
      doc.answers = results.map((r) => ({ questionId: r.questionId, answer: r.studentAnswer, correct: r.correct }));
      doc.score = score;
      doc.totalMarks = totalMarks;
      doc.percent = percent;
      doc.submittedAt = new Date();
      await doc.save();

      let progress = await StudentEnglishProgress.findOne({ studentId: req.student._id, topic: doc.topic });
      if (!progress) {
        progress = await StudentEnglishProgress.create({
          studentId: req.student._id,
          areaId: doc.areaId,
          topic: doc.topic,
        });
      }
      progress.assessmentCompleted = true;
      if (score > progress.bestScore) progress.bestScore = score;
      if (percent > progress.bestPercent) progress.bestPercent = percent;
      progress.assessmentAttempts = Math.max(progress.assessmentAttempts || 0, doc.attempt);
      progress.lastPlayed = new Date();
      await progress.save();

      res.json({
        success: true,
        results,
        score,
        totalMarks,
        percent,
        attempt: doc.attempt,
        assessmentCompleted: true,
      });
    } catch (err) {
      console.error("[englishMissions] submit failed:", err.message);
      res.status(500).json({ success: false, message: "Could not submit the assessment." });
    }
  }
);

// ── GET /progress ──────────────────────────────────────────────────────────
router.get("/progress", verifyStudent, async (req, res) => {
  try {
    const pmap = await progressMap(req.student._id);
    const areas = [];
    for (const a of getEnglishAreas()) {
      areas.push(await areaPayload(a, pmap));
    }
    const totalTopics = areas.reduce((n, a) => n + a.topicsTotal, 0);
    const topicsCompleted = areas.reduce((n, a) => n + a.topicsCompleted, 0);
    res.json({
      success: true,
      areas,
      totals: { topicsCompleted, topicsTotal: totalTopics },
      continueLearning: findContinueLearning(orderedTopics(), pmap),
    });
  } catch (err) {
    console.error("[englishMissions] GET /progress failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load progress." });
  }
});

// ── POST /topics/:topicId/writing/feedback ─────────────────────────────────
router.post(
  "/topics/:topicId/writing/feedback",
  verifyStudent,
  rateLimit({
    keyFn: (req) => `${req.student._id}:wfeedback:${req.params.topicId}`,
    max: 5,
    windowMs: 60000,
    message: "You are requesting feedback too quickly. Please wait a moment.",
  }),
  async (req, res) => {
    try {
      const topic = englishTopicById(req.params.topicId);
      if (!topic || !topic.practice) {
        return res.status(400).json({ success: false, message: "This topic does not have a writing practice task." });
      }
      const text = typeof (req.body && req.body.text) === "string" ? req.body.text.trim() : "";
      if (!text || text.length < 20) {
        return res.status(400).json({ success: false, message: "Please write a bit more before asking for feedback (at least a sentence)." });
      }
      if (text.length > 1600) {
        return res.status(400).json({ success: false, message: "Your draft is longer than 1600 characters. Trim it and try again." });
      }

      const feedback = await generateWritingFeedback({ topic, text });
      if (!feedback) {
        return res.status(502).json({
          success: false,
          ai: true,
          message: "AI feedback is unavailable right now. Please try again in a moment.",
        });
      }
      res.json({ success: true, feedback });
    } catch (err) {
      console.error("[englishMissions] writing feedback failed:", err.message);
      res.status(500).json({ success: false, message: "Could not generate feedback." });
    }
  }
);

module.exports = router;