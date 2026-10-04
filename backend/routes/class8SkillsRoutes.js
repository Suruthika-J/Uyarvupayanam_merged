// backend/routes/class8SkillsRoutes.js
//
// Class 8 Skill Adventure — server-driven game + evidence API. All scoring,
// unlock gating, milestones and recommendations are AUTHORITATIVE on the
// backend: the client only sends raw selections and receives feedback; answer
// keys never leave this module. Every query is scoped to req.student._id so
// students can never see each other's data.
//
//   GET  /dashboard                              - module overview for the hub page
//   GET  /categories                             - category cards with status
//   GET  /categories/:skillId                    - one category + activity status
//   GET  /categories/:skillId/activities/:activityId - activity + level status
//   POST /attempts                               - start/resume a game session
//   POST /attempts/:attemptId/hint               - reveal one hint (server counts it)
//   POST /attempts/:attemptId/answer             - grade one task answer
//   POST /attempts/:attemptId/complete           - finalize + LD refresh + milestones
//   POST /attempts/:attemptId/abandon            - mark an in-progress game abandoned
//   GET  /recommendations                        - top + alternative next steps
//   GET  /history                                - past attempts
//   GET  /milestones                             - earned milestones
//
// Mounted at /api/class8-skills. Pattern mirrors englishMissionsRoutes
// (route-file controller, verifyStudent, { success } envelope, rate limits).

"use strict";

const express = require("express");
const router = express.Router();

const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

const catalog = require("../config/class8SkillsCatalog");
const game = require("../services/skillGameService");
const skillLd = require("../services/skillLdBridge");
const ai = require("../services/skillAiService");

const SkillAttempt = require("../models/SkillAttempt");
const SkillMilestone = require("../models/SkillMilestone");
const StudentSkillProfile = require("../models/StudentSkillProfile");
const StudentLearningDNA = require("../models/StudentLearningDNA");
const SkillProgressHistory = require("../models/SkillProgressHistory");
const LearningRecommendation = require("../models/LearningRecommendation");
const StudentInterestProfile = require("../models/StudentInterestProfile");
const LdnbsConfig = require("../models/LdnbsConfig");

const MODELS = {
    SkillAttempt,
    SkillMilestone: SkillMilestone,
    StudentSkillProfile,
    StudentLearningDNA,
    SkillProgressHistory,
    LearningRecommendation,
    StudentInterestProfile,
    LdnbsConfig,
};

const startLimiter = rateLimit({ keyFn: (req) => req.student && `skills-start:${String(req.student._id)}`, max: 30, windowMs: 60000, message: "Too many game starts. Take a short break." });
const actLimiter = rateLimit({ keyFn: (req) => req.student && `skills-act:${String(req.student._id)}`, max: 90, windowMs: 60000, message: "Too many actions. Take a short break." });

const DIAG = { skillId: "diagnostic", activityId: "diagnostic" };
const PRACTICE_ACTIVITIES = new Set(["speak-up", "creative-canvas", "story-world"]);

function isDiagnostic(b) {
    return b.mode === "diagnostic" || (b.skillId === DIAG.skillId && b.activityId === DIAG.activityId);
}

function ok(res, data) {
    res.json({ success: true, ...data });
}

function fail(res, status, message, code) {
    res.status(status).json({ success: false, message, code });
}

// ── diagnostics ─────────────────────────────────────────────────────────────
function diagnosticPublicTasks() {
    return catalog.getDiagnostic().map((task) => ({
        taskIndex: task.taskIndex,
        category: task.category,
        hintAllowed: true,
        ...catalog.stripForClient(task),
    }));
}

// Serve the task list for an attempt (stripped) + current saved answers.
function attemptPayload(attempt) {
    let tasks = [];
    let saved = [];
    const rows = attempt.answers || [];
    if (attempt.mode === "diagnostic") {
        tasks = diagnosticPublicTasks();
    } else {
        const activity = catalog.activityById(attempt.skillId, attempt.activityId);
        if (activity) tasks = catalog.publicTasks(activity, attempt.level);
    }
    saved = rows.map((r) => ({
        taskIndex: r.taskIndex,
        given: r.given,
        correct: r.correct,
        hintUsed: r.hintUsed,
        score: r.score,
    }));
    const hintLimit = attempt.mode === "diagnostic" ? 2 : catalog.LEVEL_META[attempt.level] ? catalog.LEVEL_META[attempt.level].hintLimit : 2;
    const hintCount = rows.filter((r) => r.hintUsed).length;
    return {
        attempt: {
            _id: attempt._id,
            skillId: attempt.skillId,
            activityId: attempt.activityId,
            activityTitle: attempt.activityTitle,
            categoryName: attempt.categoryName,
            mode: attempt.mode,
            level: attempt.level,
            status: attempt.status,
            score: attempt.score,
            totalTasks: attempt.totalTasks,
            hintCount,
            hintLimit,
            createdAt: attempt.createdAt,
            startedAt: attempt.startedAt,
        },
        tasks,
        savedAnswers: saved,
    };
}

// Level gate: level N+1 unlocks only when level N was completed with score ≥ UNLOCK_SCORE.
function unlockedLevels(attempts) {
    const best = { 1: 0, 2: 0, 3: 0 };
    attempts.forEach((a) => {
        if (a.status === "completed") best[a.level] = Math.max(best[a.level] || 0, a.score || 0);
    });
    const unlocked = [1];
    if (best[1] >= catalog.UNLOCK_SCORE) unlocked.push(2);
    if (best[2] >= catalog.UNLOCK_SCORE) unlocked.push(3);
    return { unlocked, best };
}

function assertLevelAllowed(attempts, level, skillId, activityId) {
    if (level <= 1) return null;
    const { unlocked } = unlockedLevels(attempts.filter((a) => a.skillId === skillId && a.activityId === activityId));
    if (!unlocked.includes(level)) {
        return {
            ok: false,
            status: 400,
            error: "LOCKED",
            message: `Complete the previous level with ${catalog.UNLOCK_SCORE}+ to unlock the ${catalog.LEVEL_META[level].name} level.`,
        };
    }
    return null;
}

// ── milestones (deterministic, evidence-backed) ─────────────────────────────
const MILESTONE_DEFS = {
    first_mission: { title: "First Mission Completed", description: "Completed your first Skill Adventure game." },
    diagnostic_done: { title: "Skill Scout", description: "Finished the starter diagnostic covering all 8 skills." },
    skill_explorer: { title: "Skill Explorer", description: "Played games in 3 different skill areas." },
    independent_solver: { title: "Independent Problem Solver", description: "Solved a full game with no hints and 80+ score." },
    creative_thinker: { title: "Creative Thinker", description: "Finished a speaking or creativity challenge." },
    real_life_champion: { title: "Real-Life Challenge Champion", description: "Completed 5 different games." },
};

async function computeAndSaveMilestones(studentId, attempt, allCompleted) {
    const earned = new Set();
    if (allCompleted.length === 1) earned.add("first_mission");
    if (attempt.mode === "diagnostic") earned.add("diagnostic_done");
    if (attempt.mode === "play") {
        const cats = new Set(allCompleted.filter((a) => a.mode === "play").map((a) => a.skillId));
        if (cats.size >= 3) earned.add("skill_explorer");
        const activities = new Set(allCompleted.filter((a) => a.mode === "play").map((a) => a.activityId));
        if (activities.size >= 5) earned.add("real_life_champion");
        if (attempt.totalTasks > 0 && attempt.hintCount === 0 && attempt.score >= 80) earned.add("independent_solver");
        if (PRACTICE_ACTIVITIES.has(attempt.activityId)) earned.add("creative_thinker");
    }

    const existing = await SkillMilestone.find({ studentId, code: { $in: [...earned] } }).select("code").lean();
    const have = new Set(existing.map((e) => e.code));
    const toInsert = [...earned]
        .filter((c) => !have.has(c))
        .map((c) => ({ studentId, code: c, title: MILESTONE_DEFS[c].title, description: MILESTONE_DEFS[c].description, skillId: attempt.skillId, earnedAt: new Date() }));

    const inserted = [];
    if (toInsert.length) {
        try {
            const docs = await SkillMilestone.insertMany(toInsert, { ordered: false });
            inserted.push(...docs.map((d) => d.code));
        } catch (e) {
            // Rare duplicate-key race → read back the truth from the DB.
            const found = await SkillMilestone.find({ studentId, code: { $in: toInsert.map((t) => t.code) } }).select("code").lean();
            inserted.push(...found.map((f) => f.code));
        }
    }
    return { newlyEarned: inserted, earnedCodes: [...earned] };
}

async function loadDashboard(studentId) {
    const attempts = await SkillAttempt.find({ studentId }).sort({ completedAt: -1, createdAt: -1 }).lean();
    const completed = attempts.filter((a) => a.status === "completed");

    const categories = catalog.getCategories().map((cat) => {
        const own = completed.filter((a) => a.mode === "play" && a.skillId === cat.id);
        const bestScore = own.length ? Math.max(...own.map((a) => a.score || 0)) : null;
        const status = null;
        return { ...cat, completedActivities: own.length, bestScore, status, stage: "not-assessed" };
    });

    // merge real LD profile stages
    const profiles = await skillLd.profilesByCategory({ studentId, models: MODELS });
    for (const cat of categories) {
        const p = profiles[cat.id];
        if (p) {
            cat.status = p.status;
            cat.stage = skillLd.stageForStatus(p.status);
            cat.weightedScore = p.weightedScore;
            cat.evidenceCount = p.evidenceCount;
        }
    }

    const diagnosticAttempts = completed.filter((a) => a.mode === "diagnostic");
    const inProgressDoc = await SkillAttempt.find({ studentId, status: "in_progress" }).sort({ createdAt: -1 }).limit(1).lean();
    const inProgress = inProgressDoc.length ? inProgressDoc[0] : null;

    let recommendation = null;
    try {
        recommendation = await skillLd.getTopRecommendation({ studentId, models: MODELS });
    } catch (e) {
        recommendation = null;
    }

    const milestones = await SkillMilestone.find({ studentId }).sort({ earnedAt: -1 }).lean();
    const totalStars = completed.reduce((acc, a) => acc + starCount(a.score, a.totalTasks), 0);

    return {
        categories,
        diagnostic: {
            completed: diagnosticAttempts.length > 0,
            bestScore: diagnosticAttempts.length ? Math.max(...diagnosticAttempts.map((a) => a.score || 0)) : null,
        },
        resume: inProgress ? attemptPayload(inProgress) : null,
        recommendation,
        milestones,
        totalCompleted: completed.filter((a) => a.mode === "play").length,
        totalActivityIds: new Set(completed.filter((a) => a.mode === "play").map((a) => a.activityId)).size,
        totalStars,
        recentCompletions: completed.slice(0, 5).map((a) => {
            const act = a.mode === "play" ? catalog.activityById(a.skillId, a.activityId) : null;
            const cat = a.mode === "play" ? catalog.categoryById(a.skillId) : null;
            return {
                _id: a._id,
                skillId: a.skillId,
                activityId: a.activityId,
                activityTitle: a.activityTitle,
                categoryName: a.categoryName,
                mode: a.mode,
                level: a.level,
                score: a.score,
                stars: starCount(a.score, a.totalTasks),
                icon: act ? act.icon : a.mode === "diagnostic" ? "FiCompass" : null,
                categoryColor: cat ? cat.color : "#1a7a50",
                completedAt: a.completedAt,
            };
        }),
    };
}

function starCount(score, totalTasks) {
    if (totalTasks === 0) return 2; // practice completion
    if (score >= 85) return 3;
    if (score >= catalog.UNLOCK_SCORE) return 2;
    return 1;
}

// ── GET /dashboard ──────────────────────────────────────────────────────────
router.get("/dashboard", verifyStudent, async (req, res) => {
    try {
        ok(res, { ...(await loadDashboard(req.student._id)) });
    } catch (e) {
        fail(res, 500, "Could not load your skill dashboard. Please try again.", "DASHBOARD_ERROR");
    }
});

// ── GET /categories ─────────────────────────────────────────────────────────
router.get("/categories", verifyStudent, async (req, res) => {
    try {
        const dash = await loadDashboard(req.student._id);
        ok(res, { categories: dash.categories });
    } catch (e) {
        fail(res, 500, "Could not load skill areas.", "CATEGORIES_ERROR");
    }
});

// ── GET /categories/:skillId ────────────────────────────────────────────────
router.get("/categories/:skillId", verifyStudent, async (req, res) => {
    const cat = catalog.categoryById(req.params.skillId);
    if (!cat) return fail(res, 404, "Skill area not found.", "NOT_FOUND");

    const attempts = await SkillAttempt.find({ studentId: req.student._id, skillId: cat.id }).sort({ completedAt: -1 }).lean();
    const completed = attempts.filter((a) => a.status === "completed");
    const profiles = await skillLd.profilesByCategory({ studentId: req.student._id, models: MODELS });
    const profile = profiles[cat.id] || null;

    let recommendation = null;
    try {
        const top = await skillLd.getTopRecommendation({ studentId: req.student._id, models: MODELS });
        if (top && top.categoryId === cat.id) recommendation = top;
    } catch (e) {
        recommendation = null;
    }

    const activities = cat.activities.map((a) => {
        const own = completed.filter((x) => x.activityId === a.id);
        const { unlocked, best } = unlockedLevels(own);
        return {
            id: a.id,
            title: a.title,
            tagline: a.tagline,
            icon: a.icon,
            minutes: a.minutes,
            goal: a.goal,
            mechanic: a.mechanic,
            taskCount: a.tasks.length,
            completedCount: own.length,
            bestScore: own.length ? Math.max(...own.map((x) => x.score || 0)) : null,
            levelsCompleted: [1, 2, 3].map((lv) => ({ level: lv, name: catalog.LEVEL_META[lv].name, bestScore: best[lv] || null })),
            unlockedLevels: unlocked,
            isRecommended: !!(recommendation && recommendation.activityId === a.id && recommendation.level),
        };
    });

    ok(res, {
        category: { id: cat.id, name: cat.name, short: cat.short, color: cat.color, icon: cat.icon, intro: cat.intro, minutesTip: cat.minutesTip },
        status: profile ? skillLd.stageForStatus(profile.status) : "not-assessed",
        profileStatus: profile ? profile.status : null,
        activities,
        recommendation,
    });
});

// ── GET /categories/:skillId/activities/:activityId ────────────────────────
router.get("/categories/:skillId/activities/:activityId", verifyStudent, async (req, res) => {
    const activity = catalog.activityById(req.params.skillId, req.params.activityId);
    if (!activity) return fail(res, 404, "Activity not found.", "NOT_FOUND");

    const attempts = await SkillAttempt.find({ studentId: req.student._id, skillId: req.params.skillId, activityId: req.params.activityId }).sort({ createdAt: -1 }).lean();
    const completed = attempts.filter((a) => a.status === "completed");
    const { unlocked } = unlockedLevels(completed);

    const levels = Object.keys(catalog.LEVEL_META)
        .map(Number)
        .map((lv) => {
            const best = completed.filter((a) => a.level === lv);
            return {
                level: lv,
                name: catalog.LEVEL_META[lv].name,
                tagline: catalog.LEVEL_META[lv].tagline,
                hintLimit: catalog.LEVEL_META[lv].hintLimit,
                taskCount: catalog.LEVEL_META[lv].slice[1] - catalog.LEVEL_META[lv].slice[0],
                unlocked: unlocked.includes(lv),
                bestScore: best.length ? Math.max(...best.map((a) => a.score || 0)) : null,
                playedCount: best.length,
            };
        });

    ok(res, {
        activity: {
            id: activity.id,
            title: activity.title,
            tagline: activity.tagline,
            icon: activity.icon,
            minutes: activity.minutes,
            goal: activity.goal,
            mechanic: activity.mechanic,
            categoryId: req.params.skillId,
        },
        levels,
    });
});

// ── POST /attempts (start or resume) ────────────────────────────────────────
router.post("/attempts", verifyStudent, startLimiter, async (req, res) => {
    try {
        const { skillId, activityId, level } = req.body;
        const mode = req.body.mode === "diagnostic" ? "diagnostic" : "play";
        const lvl = mode === "diagnostic" ? 1 : [1, 2, 3].includes(Number(level)) ? Number(level) : 1;

        let activity = null;
        if (mode === "play") {
            activity = catalog.activityById(skillId, activityId);
            if (!activity) return fail(res, 400, "That skill game does not exist.", "BAD_ACTIVITY");
            if (!skillId || !activityId) return fail(res, 400, "skillId and activityId are required.", "BAD_REQUEST");

            const prior = await SkillAttempt.find({ studentId: req.student._id, skillId, activityId, status: "completed" }).lean();
            const gate = assertLevelAllowed(prior, lvl, skillId, activityId);
            if (gate) return fail(res, gate.status, gate.message, gate.error);
        }

        // Resume an interrupted session if one exists.
        const existing = await SkillAttempt.findOne({
            studentId: req.student._id,
            skillId: mode === "diagnostic" ? DIAG.skillId : skillId,
            activityId: mode === "diagnostic" ? DIAG.activityId : activityId,
            level: lvl,
            mode,
            status: "in_progress",
        }).lean();
        if (existing) return ok(res, { resumed: true, ...attemptPayload(existing) });

        const cat = mode === "diagnostic" ? null : catalog.categoryById(skillId);
        const attempt = await SkillAttempt.create({
            studentId: req.student._id,
            skillId: mode === "diagnostic" ? DIAG.skillId : skillId,
            activityId: mode === "diagnostic" ? DIAG.activityId : activityId,
            activityTitle: mode === "diagnostic" ? "Skill Starter Diagnostic" : activity.title,
            categoryName: mode === "diagnostic" ? "All 8 Skills" : cat ? cat.name : "",
            mode,
            level: lvl,
            status: "in_progress",
            answers: [],
            startedAt: new Date(),
        });

        ok(res, { resumed: false, ...attemptPayload(attempt) });
    } catch (e) {
        fail(res, 500, "Could not start the game. Please try again.", "START_ERROR");
    }
});

// ── POST /attempts/:attemptId/hint ──────────────────────────────────────────
router.post("/attempts/:attemptId/hint", verifyStudent, actLimiter, async (req, res) => {
    try {
        const attempt = await SkillAttempt.findOne({ _id: req.params.attemptId, studentId: req.student._id });
        if (!attempt) return fail(res, 404, "Game session not found.", "NOT_FOUND");
        if (attempt.status !== "in_progress") return fail(res, 400, "This game is already finished.", "NOT_ACTIVE");

        const taskIndex = Number(req.body.taskIndex);
        let hint = null;
        if (attempt.mode === "diagnostic") {
            const task = catalog.getDiagnostic().find((t) => t.taskIndex === taskIndex);
            if (!task || !isHintable(task)) return fail(res, 400, "That task has no hint.", "NO_HINT");
            hint = task.hint;
        } else {
            const activity = catalog.activityById(attempt.skillId, attempt.activityId);
            if (!activity) return fail(res, 400, "Activity not found.", "BAD_ACTIVITY");
            const tasks = catalog.tasksForLevel(activity, attempt.level);
            const task = tasks[taskIndex];
            if (!task || !task.hint) return fail(res, 400, "That task has no hint.", "NO_HINT");
            hint = task.hint;
        }

        const rows = attempt.answers || [];
        const hintCount = rows.filter((r) => r.hintUsed).length;
        const hintLimit = attempt.mode === "diagnostic" ? 2 : catalog.LEVEL_META[attempt.level] ? catalog.LEVEL_META[attempt.level].hintLimit : 2;
        if (hintCount >= hintLimit) return fail(res, 400, "No hints left for this mission.", "HINT_LIMIT");

        let row = rows.find((r) => r.taskIndex === taskIndex);
        if (row) {
            // Hint on an already-touched task — just mark it used.
            row.hintUsed = true;
        } else {
            // Build the whole row BEFORE push: for subdoc arrays, field writes
            // made after push() mutate the plain literal, not the cast copy,
            // so they would silently never persist.
            rows.push({ taskIndex, attempts: 1, hintUsed: true });
        }
        attempt.answers = rows;
        attempt.markModified("answers");
        await attempt.save();

        ok(res, { hint });
    } catch (e) {
        fail(res, 500, "Could not reveal the hint.", "HINT_ERROR");
    }
});

function isHintable(task) {
    return typeof task.hint === "string" && task.hint.length > 0;
}

// ── POST /attempts/:attemptId/answer ────────────────────────────────────────
router.post("/attempts/:attemptId/answer", verifyStudent, actLimiter, async (req, res) => {
    try {
        const attempt = await SkillAttempt.findOne({ _id: req.params.attemptId, studentId: req.student._id });
        if (!attempt) return fail(res, 404, "Game session not found.", "NOT_FOUND");
        if (attempt.status !== "in_progress") return fail(res, 400, "This game is already finished.", "NOT_ACTIVE");

        const taskIndex = Number(req.body.taskIndex);
        const given = req.body.given;

        let task = null;
        let category = attempt.skillId;
        if (attempt.mode === "diagnostic") {
            task = catalog.getDiagnostic().find((t) => t.taskIndex === taskIndex);
            if (!task) return fail(res, 400, "That question does not exist.", "BAD_TASK");
            category = task.category || attempt.skillId;
        } else {
            const activity = catalog.activityById(attempt.skillId, attempt.activityId);
            if (!activity) return fail(res, 400, "Activity not found.", "BAD_ACTIVITY");
            const tasks = catalog.tasksForLevel(activity, attempt.level);
            task = tasks[taskIndex];
            if (!task) return fail(res, 400, "That question does not exist.", "BAD_TASK");
        }

        let grade;
        if (task.type === "speak" || task.type === "create") {
            // participation evidence — never auto-graded
            if (given && given.done !== true) return fail(res, 400, "Mark this task complete to continue.", "BAD_ANSWER");
            grade = { valid: true, correct: true, score: 1, cleaned: { done: true } };
        } else {
            grade = game.gradeTask(task, given);
            if (!grade.valid) return fail(res, 400, "That does not look like a valid answer.", "BAD_ANSWER");
        }

        const rows = attempt.answers || [];
        const existed = rows.some((r) => r.taskIndex === taskIndex);
        const weight = attempt.mode === "diagnostic" ? diagnosticWeight(task) : game.evidenceWeight(activityFor(attempt), attempt.level, taskIndex, existed ? rows.find((r) => r.taskIndex === taskIndex).hintUsed : false);
        if (existed) {
            // Pre-existing subdoc → mutate it in place (persists correctly).
            const row = rows.find((r) => r.taskIndex === taskIndex);
            row.attempts = (row.attempts || 1) + 1;
            row.taskType = task.type;
            row.category = category;
            row.given = grade.cleaned;
            row.correct = grade.correct;
            row.score = grade.score;
            row.cognitiveType = task.cognitiveType || "understanding";
            row.difficulty = task.difficulty || "easy";
            row.weight = weight;
        } else {
            // Build the complete row BEFORE push (post-push writes to the plain
            // literal are dropped by the subdoc cast — see hint route).
            rows.push({
                taskIndex,
                attempts: 1,
                hintUsed: false,
                taskType: task.type,
                category,
                given: grade.cleaned,
                correct: grade.correct,
                score: grade.score,
                cognitiveType: task.cognitiveType || "understanding",
                difficulty: task.difficulty || "easy",
                weight,
            });
        }

        attempt.answers = rows;
        attempt.markModified("answers");
        await attempt.save();

        const hintCount = rows.filter((r) => r.hintUsed).length;
        const rowHintUsed = existed ? rows.find((r) => r.taskIndex === taskIndex).hintUsed : false;
        ok(res, {
            taskIndex,
            correct: grade.correct,
            score: grade.score,
            hintUsed: !!rowHintUsed,
            hintCount,
            // Explanation is revealed only once the task is solved — wrong
            // answers can be retried without giving the solution away.
            explanation: grade.correct && task.explanation ? task.explanation : null,
        });
    } catch (e) {
        fail(res, 500, "Could not grade your answer. Please try again.", "ANSWER_ERROR");
    }
});

function activityFor(attempt) {
    if (attempt.mode === "diagnostic") return null;
    return catalog.activityById(attempt.skillId, attempt.activityId);
}

function diagnosticWeight(task) {
    const base = task.difficulty === "hard" ? 2 : task.difficulty === "medium" ? 1.5 : 1;
    return Math.round(base * 10) / 10;
}

// ── POST /attempts/:attemptId/complete ──────────────────────────────────────
router.post("/attempts/:attemptId/complete", verifyStudent, actLimiter, async (req, res) => {
    try {
        const attempt = await SkillAttempt.findOne({ _id: req.params.attemptId, studentId: req.student._id });
        if (!attempt) return fail(res, 404, "Game session not found.", "NOT_FOUND");

        // Idempotent: completing an already-completed game never double-counts evidence.
        if (attempt.status === "completed") {
            const summary = summaryOf(attempt);
            const rec = await skillLd.getTopRecommendation({ studentId: req.student._id, models: MODELS }).catch(() => null);
            return ok(res, { alreadyCompleted: true, summary, recommendation: rec });
        }
        if (attempt.status === "abandoned") return fail(res, 400, "This game was already closed.", "NOT_ACTIVE");

        const activity = activityFor(attempt);
        let tasks;
        if (attempt.mode === "diagnostic") {
            tasks = catalog.getDiagnostic();
        } else {
            if (!activity) return fail(res, 400, "Activity not found.", "BAD_ACTIVITY");
            tasks = catalog.tasksForLevel(activity, attempt.level);
        }

        // The client may submit remaining answers here; grade anything missing.
        const pending = (req.body && req.body.answers) || [];
        for (const item of pending) {
            const task = tasks[Number(item.taskIndex)];
            if (!task) continue;
            let grade;
            if (task.type === "speak" || task.type === "create") {
                grade = { valid: true, correct: true, score: 1, cleaned: { done: true } };
            } else {
                grade = game.gradeTask(task, item.given);
                if (!grade.valid) continue;
            }
            const rows = attempt.answers || [];
            const row_ = rows.find((r) => r.taskIndex === item.taskIndex);
            const weight = attempt.mode === "diagnostic"
                ? diagnosticWeight(task)
                : game.evidenceWeight(activity, attempt.level, Number(item.taskIndex), row_ ? !!row_.hintUsed : false);
            if (row_) {
                row_.attempts = (row_.attempts || 1) + 1;
                row_.taskType = task.type;
                row_.category = attempt.mode === "diagnostic" ? task.category || attempt.skillId : attempt.skillId;
                row_.given = grade.cleaned;
                row_.correct = grade.correct;
                row_.score = grade.score;
                row_.cognitiveType = task.cognitiveType || "understanding";
                row_.difficulty = task.difficulty || "easy";
                row_.weight = weight;
            } else {
                rows.push({
                    taskIndex: Number(item.taskIndex),
                    attempts: 1,
                    hintUsed: false,
                    taskType: task.type,
                    category: attempt.mode === "diagnostic" ? task.category || attempt.skillId : attempt.skillId,
                    given: grade.cleaned,
                    correct: grade.correct,
                    score: grade.score,
                    cognitiveType: task.cognitiveType || "understanding",
                    difficulty: task.difficulty || "easy",
                    weight,
                });
            }
            attempt.answers = rows;
        }

        // Every task must be answered before completion is recorded honestly.
        const answered = new Set((attempt.answers || []).map((r) => r.taskIndex));
        const missing = tasks.map((t, i) => i).filter((i) => !answered.has(i));
        if (missing.length) {
            attempt.markModified("answers");
            await attempt.save();
            return fail(res, 400, "Finish every part of the mission before completing it.", "INCOMPLETE", missing);
        }

        const summary = game.summarizeAttempt(attempt, tasks);
        attempt.score = summary.score;
        attempt.correctCount = summary.correctCount;
        attempt.totalTasks = summary.totalTasks;
        attempt.hintCount = summary.hintCount;
        const meta = (req.body && req.body.meta) || {};
        if (Number.isInteger(meta.selfRating) && meta.selfRating >= 1 && meta.selfRating <= 5) attempt.meta.selfRating = meta.selfRating;
        if (typeof meta.note === "string") attempt.meta.note = meta.note.slice(0, 500);
        if (Number.isFinite(Number(meta.voiceDurationMs))) attempt.meta.voiceDurationMs = Number(meta.voiceDurationMs);
        if (Number.isFinite(Number(req.body.durationMs))) attempt.durationMs = Number(req.body.durationMs);
        attempt.status = "completed";
        attempt.completedAt = new Date();
        attempt.markModified("answers");
        await attempt.save();

        // LD-NBSE integration: refresh profiles/DNA/recommendation from evidence.
        let ld = null;
        try {
            ld = await skillLd.refreshLd({ studentId: req.student._id, models: MODELS });
        } catch (e) {
            ld = null; // the module still works with the deterministic fallback
        }

        // Milestones (deterministic).
        const allCompleted = await SkillAttempt.find({ studentId: req.student._id, status: "completed" }).sort({ completedAt: -1 }).lean();
        let milestones = { newlyEarned: [], earnedCodes: [] };
        try {
            milestones = await computeAndSaveMilestones(req.student._id, attempt.toObject ? attempt.toObject() : attempt, allCompleted);
        } catch (e) {
            milestones = { newlyEarned: [], earnedCodes: [] };
        }

        // AI encouragement (optional) — never affects scoring.
        let encouragement = null;
        try {
            const line = await ai.encourageCompletion({
                score: summary.score,
                categoryName: attempt.categoryName,
                activityTitle: attempt.activityTitle,
                hintCount: summary.hintCount,
            });
            encouragement = line || ai.deterministicLine({
                score: summary.score,
                categoryName: attempt.categoryName,
                activityTitle: attempt.activityTitle,
                hintCount: summary.hintCount,
            });
        } catch (e) {
            encouragement = ai.deterministicLine({
                score: summary.score,
                categoryName: attempt.categoryName,
                activityTitle: attempt.activityTitle,
                hintCount: summary.hintCount,
            });
        }

        const recommendation = await skillLd.getTopRecommendation({ studentId: req.student._id, models: MODELS }).catch(() => null);
        const nextUnlocked = attempt.mode === "play" && attempt.level < 3 && summary.score >= catalog.UNLOCK_SCORE;

        ok(res, {
            summary: summaryOf(attempt),
            encouragement,
            newlyEarnedMilestones: milestones.newlyEarned,
            recommendation,
            nextUnlocked,
            ld: ld ? { refreshed: ld.refreshed, rows: ld.rows } : null,
        });
    } catch (e) {
        fail(res, 500, "Could not finish the game. Please try again.", "COMPLETE_ERROR");
    }
});

function summaryOf(attempt) {
    return {
        attemptId: attempt._id,
        skillId: attempt.skillId,
        activityId: attempt.activityId,
        activityTitle: attempt.activityTitle,
        categoryName: attempt.categoryName,
        mode: attempt.mode,
        level: attempt.level,
        status: attempt.status,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalTasks: attempt.totalTasks,
        hintCount: attempt.hintCount,
        stars: starCount(attempt.score, attempt.totalTasks),
        durationMs: attempt.durationMs,
        selfRating: attempt.meta ? attempt.meta.selfRating : null,
        completedAt: attempt.completedAt,
    };
}

// ── POST /attempts/:attemptId/abandon ───────────────────────────────────────
router.post("/attempts/:attemptId/abandon", verifyStudent, actLimiter, async (req, res) => {
    try {
        const attempt = await SkillAttempt.findOneAndUpdate(
            { _id: req.params.attemptId, studentId: req.student._id, status: "in_progress" },
            { $set: { status: "abandoned", completedAt: new Date() } },
            { new: true }
        );
        if (!attempt) {
            const other = await SkillAttempt.findOne({ _id: req.params.attemptId, studentId: req.student._id }).lean();
            if (!other) return fail(res, 404, "Game session not found.", "NOT_FOUND");
            return ok(res, { abandoned: true });
        }
        ok(res, { abandoned: true });
    } catch (e) {
        fail(res, 500, "Could not close the game.", "ABANDON_ERROR");
    }
});

// ── GET /recommendations ────────────────────────────────────────────────────
router.get("/recommendations", verifyStudent, async (req, res) => {
    try {
        const top = await skillLd.getTopRecommendation({ studentId: req.student._id, models: MODELS });
        const attempts = await SkillAttempt.find({ studentId: req.student._id, status: "completed" }).lean();

        const alternatives = [];
        if (top && top.categoryId) {
            for (const cat of catalog.CATEGORIES) {
                if (cat.id === top.categoryId) continue;
                for (const activity of cat.activities) {
                    const lv = skillLd.nextLevelForActivity(attempts, activity.id);
                    if (lv !== null) {
                        alternatives.push({
                            categoryId: cat.id,
                            categoryName: cat.name,
                            activityId: activity.id,
                            activityTitle: activity.title,
                            level: lv,
                            reason: skillLd.reasonSentence(cat, activity, lv, null),
                        });
                        break;
                    }
                }
                if (alternatives.length >= 2) break;
            }
        }

        ok(res, { recommendation: top, alternatives, source: top && top.source });
    } catch (e) {
        fail(res, 500, "Could not load recommendations.", "REC_ERROR");
    }
});

// ── GET /history ────────────────────────────────────────────────────────────
router.get("/history", verifyStudent, async (req, res) => {
    try {
        const filter = { studentId: req.student._id };
        if (req.query.skillId) filter.skillId = String(req.query.skillId);
        if (req.query.mode) filter.mode = String(req.query.mode);
        if (req.query.status) filter.status = String(req.query.status);
        const rows = await SkillAttempt.find(filter).sort({ createdAt: -1 }).limit(60).lean();
        ok(res, {
            history: rows.map((a) => ({
                _id: a._id,
                skillId: a.skillId,
                activityId: a.activityId,
                activityTitle: a.activityTitle,
                categoryName: a.categoryName,
                mode: a.mode,
                level: a.level,
                status: a.status,
                score: a.score,
                correctCount: a.correctCount,
                totalTasks: a.totalTasks,
                hintCount: a.hintCount,
                stars: starCount(a.score, a.totalTasks),
                startedAt: a.startedAt,
                completedAt: a.completedAt,
            })),
        });
    } catch (e) {
        fail(res, 500, "Could not load your history.", "HISTORY_ERROR");
    }
});

// ── GET /milestones ─────────────────────────────────────────────────────────
router.get("/milestones", verifyStudent, async (req, res) => {
    try {
        const milestones = await SkillMilestone.find({ studentId: req.student._id }).sort({ earnedAt: 1 }).lean();
        ok(res, { milestones });
    } catch (e) {
        fail(res, 500, "Could not load milestones.", "MILESTONE_ERROR");
    }
});

module.exports = router;