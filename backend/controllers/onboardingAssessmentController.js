const User = require("../models/User");
const OnboardingQuestion = require("../models/OnboardingQuestion");
const OnboardingResponse = require("../models/OnboardingResponse");
const AssessmentResult = require("../models/AssessmentResult");
const crypto = require("crypto");
const GeneratedAssessment = require("../models/GeneratedAssessment");
const AssessmentSummary = require("../models/AssessmentSummary");
const RecommendationRule = require("../models/RecommendationRule");
const GuidelineRule = require("../models/GuidelineRule");
const { generateQuestionsForSkill, MAX_FETCH_SKILLS } = require("../utils/aiQuestionGenerator");
const { getRecommendations } = require("../utils/recommendationEngine");

// Configurable number of questions drawn per skill category. If a skill has
// fewer questions than this, whatever is available is used instead.
const PER_SKILL_COUNT = Math.max(1, parseInt(process.env.ASSESSMENT_PER_SKILL || "3", 10));

// Map any classLevel representation ("Class 5", "5", "5th", "class-5", ...)
// onto the canonical "Class N" grade used by the OnboardingQuestion pool.
function normalizeGrade(value) {
    if (!value) return null;
    const digits = String(value).replace(/[^\d]/g, "");
    const map = { 5: "Class 5", 8: "Class 8", 10: "Class 10", 12: "Class 12" };
    return map[digits] || null;
}

// Fisher–Yates shuffle on a copy so repeated attempts get different sets.
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// GET /api/onboarding/assessment/questions?studentId=...
// Dynamically generates a sanitized question set for the student's class level:
//  - filtered by the student's grade stored at signup (never trusted from the client)
//  - a configurable count per skill (PER_SKILL_COUNT, default 3), falling back to
//    whatever is available when a skill has fewer questions
//  - order randomized per skill and across the combined set
//  - correctAnswer / explanation NEVER exposed to the frontend
//  - blocked once completed, unless the explicit retake flow reset the student
exports.generateAssessment = async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) {
            return res.status(400).json({ success: false, message: "studentId is required" });
        }

        const student = await User.findById(studentId)
            .select("name email classLevel userType recommendationGenerated onboardingCompleted")
            .lean();
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const grade = normalizeGrade(student.classLevel);
        if (!grade) {
            return res.status(400).json({
                success: false,
                message: "Student class level is not set. Please update your profile.",
            });
        }

        // Retake guard — an assessment can only be re-run through the explicit
        // retake flow (/onboarding/retake/:userId) which clears this flag.
        if (student.recommendationGenerated) {
            return res.json({ success: true, alreadyCompleted: true, grade });
        }

        const pool = await OnboardingQuestion.find({ grade })
            .select("_id questionText options skillTag difficultyLevel correctAnswer explanation")
            .lean();

        if (!pool.length) {
            return res.status(404).json({
                success: false,
                message: `No assessment questions available for ${grade} yet. Please check back later.`,
            });
        }

        // Group by skill, shuffle within each skill, take the per-skill cap,
        // then shuffle the combined set so skills interleave randomly.
        const bySkill = {};
        for (const q of pool) {
            const key = q.skillTag || "General";
            (bySkill[key] = bySkill[key] || []).push(q);
        }

        const selected = [];
        const questionsPerSkill = {};
        for (const [skill, list] of Object.entries(bySkill)) {
            const take = Math.min(PER_SKILL_COUNT, list.length);
            questionsPerSkill[skill] = take;
            selected.push(...shuffle(list).slice(0, take));
        }
        const finalSet = shuffle(selected);

        const questions = finalSet.map((q) => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            skillTag: q.skillTag,
            difficultyLevel: q.difficultyLevel,
        }));

        res.json({
            success: true,
            grade,
            questions,
            totalQuestions: questions.length,
            questionsPerSkill,
            perSkillCount: PER_SKILL_COUNT,
        });
    } catch (error) {
        console.error("Generate assessment error:", error);
        res.status(500).json({ success: false, message: "Failed to generate assessment" });
    }
};

// GET /api/onboarding/response/user/:userId
// Latest scored response (per-skill breakdown) — powers the student result screen.
exports.getLatestResponse = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await OnboardingResponse.findOne({ userId }).sort({ createdAt: -1 }).lean();
        if (!response) {
            return res.status(404).json({ success: false, message: "No assessment response found" });
        }
        res.json({ success: true, response });
    } catch (error) {
        console.error("Get latest response error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assessment response" });
    }
};

// GET /api/onboarding/admin/results?grade=&skill=&search=
// Admin view of student assessment results. assessment_results holds one row
// per (student × skill × attempt); rows are grouped back into attempts so the
// existing admin table/filter pattern can show per-skill scores + overall.
exports.getAdminResults = async (req, res) => {
    try {
        const { grade, skill, search } = req.query;
        const filter = {};
        if (grade) filter.grade = grade;
        if (skill) filter.skill = skill;
        if (search) {
            const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const rx = new RegExp(escaped, "i");
            filter.$or = [{ studentName: rx }, { studentEmail: rx }];
        }

        const rows = await AssessmentResult.find(filter).sort({ submittedAt: 1 }).lean();

        const attempts = [];
        const attemptIndex = new Map();
        for (const row of rows) {
            const key = `${String(row.studentId)}__${row.submittedAt ? row.submittedAt.getTime() : ""}`;
            let attempt = attemptIndex.get(key);
            if (!attempt) {
                attempt = {
                    studentId: row.studentId,
                    studentName: row.studentName,
                    studentEmail: row.studentEmail,
                    grade: row.grade,
                    submittedAt: row.submittedAt,
                    skills: [],
                    totalScore: 0,
                    totalQuestions: 0,
                };
                attemptIndex.set(key, attempt);
                attempts.push(attempt);
            }
            attempt.skills.push({
                skill: row.skill,
                score: row.score,
                totalQuestions: row.totalQuestions,
                percentage: row.percentage,
            });
            attempt.totalScore += row.score;
            attempt.totalQuestions += row.totalQuestions;
        }

        const result = attempts
            .map((a) => ({
                ...a,
                percentage: a.totalQuestions > 0 ? Math.round((a.totalScore / a.totalQuestions) * 100) : 0,
                skills: [...a.skills].sort((x, y) => y.totalQuestions - x.totalQuestions || y.score - x.score),
            }))
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        const skillOptions = [...new Set(rows.map((r) => r.skill))].filter(Boolean).sort();
        const gradeOptions = [...new Set(rows.map((r) => r.grade))].filter(Boolean).sort();

        res.json({ success: true, attempts: result, count: result.length, skillOptions, gradeOptions });
    } catch (error) {
        console.error("Get admin results error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assessment results" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// Live AI question generation (with static-bank fallback)
// ────────────────────────────────────────────────────────────────────────────

function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Randomly sample up to `count` bank questions for a grade+skill (fallback when
// the LLM is unavailable or returns invalid output). Returns normalized objects
// identical in shape to what the LLM path produces.
async function sampleStaticBank(grade, skill, count) {
    const rx = new RegExp(`^${escapeRegex(skill)}$`, "i");
    const pool = await OnboardingQuestion.find({ grade, skillTag: rx })
        .select("questionText options correctAnswer difficultyLevel")
        .lean();
    return shuffle(pool).slice(0, count).map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficultyLevel || "easy",
    }));
}

// Strip every trace of the correct answer before anything leaves the server.
function toClientQuestion(row) {
    return {
        _id: row._id,
        questionText: row.questionText,
        options: row.options,
        skill: row.skill,
        difficulty: row.difficulty,
    };
}

function countsBySkill(rows) {
    const bySkill = {};
    for (const row of rows) {
        bySkill[row.skill] = (bySkill[row.skill] || 0) + 1;
    }
    return bySkill;
}

// POST /api/onboarding/generate-questions
// Body: { studentId, grade?, skills: [...], sessionId? }
//
//   per skill → LLM (strict prompt, server-side validation, ≤2 retries) and if
//               that fails → static Question Management bank for that skill
//   stores the full set (incl. correct answers) in generated_assessments BEFORE
//   responding, keyed by a fresh sessionId; the client never sees correctAnswer
//   passing `sessionId` resumes an in-progress session from the DB instead of
//   calling the LLM again (page refresh safe).
exports.generateOnboardingQuestions = async (req, res) => {
    try {
        const { studentId, grade, skills, sessionId } = req.body || {};
        if (!studentId) {
            return res.status(400).json({ success: false, message: "studentId is required" });
        }

        const student = await User.findById(studentId)
            .select("name classLevel userType recommendationGenerated onboardingCompleted")
            .lean();
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const resolvedGrade = normalizeGrade(grade) || normalizeGrade(student.classLevel);
        if (!resolvedGrade) {
            return res.status(400).json({
                success: false,
                message: "Student class level is not set. Please update your profile.",
            });
        }

        // Retake guard — completed students can only re-run through the explicit
        // retake flow (/onboarding/retake/:userId).
        if (student.recommendationGenerated) {
            return res.json({ success: true, alreadyCompleted: true, grade: resolvedGrade });
        }

        // Page-refresh resume: same session → same generated set, no LLM call.
        if (sessionId) {
            const existing = await GeneratedAssessment.find({ sessionId, studentId })
                .sort({ _id: 1 })
                .lean();
            if (existing.length) {
                return res.json({
                    success: true,
                    source: "resume",
                    sessionId,
                    grade: resolvedGrade,
                    questions: existing.map(toClientQuestion),
                    totalQuestions: existing.length,
                    questionsPerSkill: countsBySkill(existing),
                    perSkillCount: PER_SKILL_COUNT,
                });
            }
        }

        const skillList = [...new Set((Array.isArray(skills) ? skills : []).map((s) => String(s).trim()).filter(Boolean))]
            .slice(0, MAX_FETCH_SKILLS);
        if (!skillList.length) {
            return res.status(400).json({ success: false, message: "At least one skill is required" });
        }

        // Hard cap on cost/tokens per session: PER_SKILL_COUNT × skills ≤ 3 × 12.
        const perSkillCount = Math.min(PER_SKILL_COUNT, 5);
        const maxTotal = skillList.length * perSkillCount;

        const newSessionId = crypto.randomBytes(16).toString("hex");
        const submittedAt = new Date(); // one shared timestamp per attempt

        const rows = [];
        const questionsPerSkill = {};
        let sessionSource = "ai";

        for (const skill of skillList) {
            const aiQuestions = await generateQuestionsForSkill(skill, resolvedGrade, perSkillCount);
            let picked = Array.isArray(aiQuestions) && aiQuestions.length ? aiQuestions : null;
            let source = "ai";

            if (!picked) {
                // LLM unavailable / failed / invalid → static bank fallback so
                // onboarding never breaks for this skill.
                picked = await sampleStaticBank(resolvedGrade, skill, perSkillCount);
                source = "bank";
            }
            if (!picked.length) {
                questionsPerSkill[skill] = 0;
                continue; // no AI key AND no bank questions for this grade+skill
            }
            if (source === "bank") sessionSource = "mixed";
            questionsPerSkill[skill] = picked.length;

            for (const q of picked) {
                if (rows.length >= maxTotal) break;
                rows.push({
                    studentId,
                    sessionId: newSessionId,
                    grade: resolvedGrade,
                    skill,
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty || "easy",
                    source,
                    submittedAt,
                });
            }
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: `No questions could be generated for ${resolvedGrade}. Please try again later.`,
            });
        }

        // Persist BEFORE responding — this is the server's source of truth for
        // grading (correct answers live here, synchronously with the delivery).
        const inserted = await GeneratedAssessment.insertMany(rows);

        res.json({
            success: true,
            sessionId: newSessionId,
            grade: resolvedGrade,
            source: sessionSource,
            questions: inserted.map(toClientQuestion),
            totalQuestions: inserted.length,
            questionsPerSkill,
            perSkillCount,
        });
    } catch (error) {
        console.error("Generate onboarding questions error:", error);
        res.status(500).json({ success: false, message: "Failed to generate questions" });
    }
};

// GET /api/onboarding/result/:studentId
// Runs scoring (read from the per-skill assessment_results rows) + the
// recommendation engine, marks the student onboarding-completed, and returns
// the full payload for the result screen.
exports.getOnboardingResult = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId).select("name classLevel").lean();
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const grade = normalizeGrade(student.classLevel);
        const rows = await AssessmentResult.find({ studentId }).lean();
        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "No assessment results found. Complete the assessment first.",
            });
        }

        const skillResults = rows.map((r) => ({ skill: r.skill, correct: r.score, total: r.totalQuestions }));
        const result = await getRecommendations({ studentGrade: grade, skillResults });

        await User.findByIdAndUpdate(studentId, {
            onboardingCompleted: true,
            recommendationGenerated: true,
        });

        res.json({ success: true, studentId, grade, result });
    } catch (error) {
        console.error("Get onboarding result error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assessment result" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// Admin CRUD — recommendation_rules  (grade × skill × level → activity/exam)
// ────────────────────────────────────────────────────────────────────────────

exports.getRecommendationRules = async (req, res) => {
    try {
        const { grade, skill, level } = req.query;
        const filter = {};
        if (grade) filter.grade = grade;
        if (skill) filter.skill = skill;
        if (level) filter.skillLevel = level;
        const rules = await RecommendationRule.find(filter).sort({ grade: 1, skill: 1, skillLevel: 1 }).lean();
        res.json({ success: true, rules, count: rules.length });
    } catch (error) {
        console.error("Get recommendation rules error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch recommendation rules" });
    }
};

exports.createRecommendationRule = async (req, res) => {
    try {
        const { grade = "All", skill, skillLevel, recommendedActivity = "", recommendedExam = "" } = req.body || {};
        if (!skill || !skillLevel) {
            return res.status(400).json({ success: false, message: "skill and skillLevel are required" });
        }
        const rule = await RecommendationRule.create({ grade, skill, skillLevel, recommendedActivity, recommendedExam });
        res.status(201).json({ success: true, rule });
    } catch (error) {
        console.error("Create recommendation rule error:", error);
        res.status(500).json({ success: false, message: "Failed to create recommendation rule" });
    }
};

exports.updateRecommendationRule = async (req, res) => {
    try {
        const { grade, skill, skillLevel, recommendedActivity, recommendedExam } = req.body || {};
        const rule = await RecommendationRule.findByIdAndUpdate(
            req.params.id,
            { grade, skill, skillLevel, recommendedActivity, recommendedExam },
            { new: true, runValidators: true }
        );
        if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
        res.json({ success: true, rule });
    } catch (error) {
        console.error("Update recommendation rule error:", error);
        res.status(500).json({ success: false, message: "Failed to update recommendation rule" });
    }
};

exports.deleteRecommendationRule = async (req, res) => {
    try {
        const rule = await RecommendationRule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
        res.json({ success: true, message: "Rule deleted" });
    } catch (error) {
        console.error("Delete recommendation rule error:", error);
        res.status(500).json({ success: false, message: "Failed to delete recommendation rule" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// Admin CRUD — guideline_rules (overallLevel → quick message)
// ────────────────────────────────────────────────────────────────────────────

exports.getGuidelineRules = async (req, res) => {
    try {
        const guidelines = await GuidelineRule.find().sort({ overallLevel: 1 }).lean();
        res.json({ success: true, guidelines, count: guidelines.length });
    } catch (error) {
        console.error("Get guideline rules error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch guideline rules" });
    }
};

exports.createGuidelineRule = async (req, res) => {
    try {
        const { overallLevel, guidelineText } = req.body || {};
        if (!overallLevel || !guidelineText) {
            return res.status(400).json({ success: false, message: "overallLevel and guidelineText are required" });
        }
        const guideline = await GuidelineRule.create({ overallLevel, guidelineText });
        res.status(201).json({ success: true, guideline });
    } catch (error) {
        console.error("Create guideline rule error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "A guideline for this level already exists" });
        }
        res.status(500).json({ success: false, message: "Failed to create guideline rule" });
    }
};

exports.updateGuidelineRule = async (req, res) => {
    try {
        const { overallLevel, guidelineText } = req.body || {};
        const guideline = await GuidelineRule.findByIdAndUpdate(
            req.params.id,
            { overallLevel, guidelineText },
            { new: true, runValidators: true }
        );
        if (!guideline) return res.status(404).json({ success: false, message: "Guideline not found" });
        res.json({ success: true, guideline });
    } catch (error) {
        console.error("Update guideline rule error:", error);
        res.status(500).json({ success: false, message: "Failed to update guideline rule" });
    }
};

exports.deleteGuidelineRule = async (req, res) => {
    try {
        const guideline = await GuidelineRule.findByIdAndDelete(req.params.id);
        if (!guideline) return res.status(404).json({ success: false, message: "Guideline not found" });
        res.json({ success: true, message: "Guideline deleted" });
    } catch (error) {
        console.error("Delete guideline rule error:", error);
        res.status(500).json({ success: false, message: "Failed to delete guideline rule" });
    }
};

// Re-export helper for the LD-NBSE diagnostic controller (additive).
exports.normalizeGrade = normalizeGrade;