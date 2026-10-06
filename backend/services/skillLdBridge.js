// backend/services/skillLdBridge.js
//
// Bridges the Class 8 Skill Adventure evidence into the existing LD-NBSE
// pipeline. Every deterministic game answer becomes an answered-question row
// { skill: "Class 8 Skills", subskill: <category>, cognitiveType, difficulty,
// weight, isCorrect } — the exact shape the existing engines consume — so the
// skill diagnosis, learning DNA, gap detection and the next-best-skill decision
// engine all run on real game evidence with ZERO new analytics code.
//
// Open practice tasks (speak/create) are deliberately excluded from the
// accuracy signal: completing them is participation, not mastery.
//
// All engines are deterministic; the module keeps working with a simple
// fallback recommendation if the LD pass fails (e.g. DB hiccup).

"use strict";

const skillDiagnosis = require("./skillDiagnosisEngine");
const learningDNA = require("./learningDNAEngine");
const gapDetection = require("./gapDetectionEngine");
const progressEngine = require("./progressAnalysisEngine");
const nextBestSkill = require("./nextBestSkillEngine");
const taxonomy = require("../config/ldnbs/skillTaxonomyConfig");
const { loadEffectiveConfig } = require("../config/ldnbs/loadEffectiveConfig");
const catalog = require("../config/class8SkillsCatalog");

const SKILL = "Class 8 Skills";
const GRADE = "Class 8";
const DETERMINISTIC_TYPES = new Set(["choice", "pattern", "order", "sort", "match", "decode"]);

function isDeterministicType(t) {
    return DETERMINISTIC_TYPES.has(t);
}

// ── evidence → answeredQuestions ────────────────────────────────────────────
async function buildAnsweredQuestions({ studentId, models }) {
    const { SkillAttempt } = models;
    const attempts = await SkillAttempt.find({
        studentId,
        status: "completed",
        mode: { $in: ["play", "diagnostic"] },
    })
        .sort({ completedAt: -1 })
        .limit(120)
        .lean();

    const rows = [];
    for (const attempt of attempts) {
        for (const ans of attempt.answers || []) {
            if (!isDeterministicType(ans.taskType)) continue;
            rows.push({
                skill: SKILL,
                subskill: ans.category || attempt.skillId,
                cognitiveType: ans.cognitiveType || "understanding",
                difficulty: ans.difficulty || "easy",
                weight: Math.max(1, Number(ans.weight) || 1),
                isCorrect: !!ans.correct,
            });
        }
    }
    return rows;
}

// ── full LD refresh (diagnose → DNA → gaps → next-best-skill → persist) ─────
async function refreshLd({ studentId, models }) {
    const {
        SkillAttempt,
        StudentSkillProfile,
        StudentLearningDNA,
        SkillProgressHistory,
        LearningRecommendation,
        StudentInterestProfile,
        LdnbsConfig,
    } = models;

    const cfg = await loadEffectiveConfig({ LdnbsConfig });
    const rows = await buildAnsweredQuestions({ studentId, models });
    if (!rows.length) {
        // Nothing new worth running engines over — leave the LD docs as they are.
        return { ok: true, refreshed: false, rows: 0 };
    }

    const { profiles } = skillDiagnosis.diagnose(rows, { grade: GRADE, cfg });
    const dna = learningDNA.build(rows, { cfg });
    const gaps = gapDetection.detect({ dna, profiles }, { cfg });

    let history = [];
    if (SkillProgressHistory && SkillProgressHistory.find) {
        history = await SkillProgressHistory.find({ studentId }).sort({ recordedAt: 1 }).lean();
    }
    const progress = progressEngine.analyze(profiles, history, { cfg });
    const deps = taxonomy.getDependencies(GRADE);

    let interests = {};
    try {
        const ip = await StudentInterestProfile.findOne({ studentId }).lean();
        if (ip && ip.interests) interests = ip.interests;
    } catch (e) {
        interests = {};
    }

    const decision = nextBestSkill.decide({
        grade: GRADE,
        profiles,
        dna,
        gaps,
        interests,
        progress,
        deps,
        cfg,
        mode: "skills",
        allAnsweredCount: rows.length,
        assessedSubskills: [...new Set(rows.map((r) => r.subskill))],
    });

    const now = new Date();

    if (StudentSkillProfile && StudentSkillProfile.bulkWrite) {
        await StudentSkillProfile.bulkWrite(
            profiles.map((p) => ({
                updateOne: {
                    filter: { studentId, skill: p.skill, subskill: p.subskill },
                    update: { $set: { ...p, grade: GRADE, lastAttemptAt: now } },
                    upsert: true,
                },
            }))
        );
    }
    if (StudentLearningDNA && StudentLearningDNA.findOneAndUpdate) {
        await StudentLearningDNA.findOneAndUpdate(
            { studentId },
            { $set: { grade: GRADE, dimensions: dna.dimensions, lastAssessmentAt: now } },
            { upsert: true }
        );
    }
    if (SkillProgressHistory && SkillProgressHistory.insertMany) {
        await SkillProgressHistory.insertMany(
            profiles.map((p) => ({
                studentId,
                grade: GRADE,
                skill: p.skill,
                subskill: p.subskill,
                score: p.weightedScore,
                status: p.status,
                attemptedCount: p.attemptedCount,
                recordedAt: now,
            }))
        );
    }

    let recommendationId = null;
    if (LearningRecommendation && LearningRecommendation.countDocuments) {
        const cycle = (await LearningRecommendation.countDocuments({ studentId })) + 1;
        const doc = await LearningRecommendation.create({
            studentId,
            grade: GRADE,
            cycle,
            mode: "skills",
            recommendationType: decision.recommendationType,
            confidence: decision.confidence,
            primaryFocus: decision.primaryFocus,
            secondaryFocus: decision.secondaryFocus,
            strengthsToMaintain: decision.strengthsToMaintain,
            detectedGaps: decision.detectedGaps,
            lockedSkills: decision.lockedSkills,
            unlockedSkills: decision.unlockedSkills,
            learningPath: decision.learningPath,
            areasToExplore: decision.areasToExplore,
            progress: decision.progress,
            explanation: decision.explanation,
            evidence: decision.evidence,
            submittedAt: now,
        });
        recommendationId = doc._id;
    }

    return { ok: true, refreshed: true, rows: rows.length, profiles, dna, decision, recommendationId };
}

// ── stage labels for the dashboard (evidence-based, no over-claiming) ───────
function stageForStatus(status) {
    const map = {
        null: "not-assessed",
        undefined: "not-assessed",
        insufficient_evidence: "exploring",
        foundation: "developing",
        developing: "developing",
        ready: "practicing",
        advanced: "applying",
    };
    return map[status] || "not-assessed";
}

// ── per-student profile map for the dashboard ───────────────────────────────
async function profilesByCategory({ studentId, models }) {
    const { StudentSkillProfile } = models;
    const docs = await StudentSkillProfile.find({ studentId, skill: SKILL }).lean();
    const map = {};
    for (const d of docs) map[d.subskill] = d;
    return map;
}

// ── level picker based on demonstrated performance ──────────────────────────
function bestByLevel(attempts, activityId) {
    const by = { 1: 0, 2: 0, 3: 0 };
    for (const a of attempts) {
        if (a.activityId === activityId && a.status === "completed") {
            by[a.level] = Math.max(by[a.level] || 0, a.score || 0);
        }
    }
    return by;
}

function nextLevelForActivity(attempts, activityId) {
    const by = bestByLevel(attempts, activityId);
    for (let lv = 1; lv <= 3; lv += 1) {
        const unlocked = lv === 1 || by[lv - 1] >= catalog.UNLOCK_SCORE;
        if (!unlocked) return null;
        if (by[lv] < catalog.UNLOCK_SCORE) return lv;
    }
    return null; // all levels passed
}

// ── recommendation without the LD pass (deterministic fallback) ─────────────
async function deterministicRecommendation({ studentId, models }) {
    const { SkillAttempt, StudentSkillProfile } = models;
    const attempts = await SkillAttempt.find({ studentId, status: "completed" }).sort({ completedAt: -1 }).lean();
    const profiles = await StudentSkillProfile.find({ studentId, skill: SKILL }).lean();
    const categories = catalog.getCategories();

    const recRows = categories.map((cat) => {
        const prof = profiles.find((p) => p.subskill === cat.id);
        return {
            category: cat,
            status: prof ? prof.status : null,
            weightedScore: prof ? prof.weightedScore : 0,
            attemptedCount: attempts.filter((a) => a.skillId === cat.id).length,
        };
    });

    const hasEvidence = attempts.length > 0;
    const diagnosticDone = attempts.some((a) => a.mode === "diagnostic");
    if (!hasEvidence) {
        return diagnosticDone
            ? defaultPlayRec(categories[0], attempts)
            : { categoryId: "diagnostic", kind: "diagnostic" };
    }

    // weakest assessed → strengthen first
    const weak = recRows
        .filter((r) => r.attemptedCount > 0 && ["foundation", "developing", "insufficient_evidence"].includes(r.status))
        .sort((a, b) => a.weightedScore - b.weightedScore)[0];
    const pick = weak || recRows.filter((r) => r.attemptedCount > 0).sort((a, b) => b.weightedScore - a.weightedScore)[0] || recRows[0];
    return buildActivityRec(pick.category, pick.status, attempts, models, "deterministic");
}

async function defaultPlayRec(category, attempts) {
    return buildActivityRec(category, "insufficient_evidence", attempts, {}, "deterministic");
}

async function buildActivityRec(category, status, attempts, models, source) {
    const activities = category.activities || [];
    for (const activity of activities) {
        const lv = nextLevelForActivity(attempts, activity.id);
        if (lv === null) continue; // fully mastered
        return {
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            activityId: activity.id,
            activityTitle: activity.title,
            activityIcon: activity.icon,
            level: lv,
            levelName: catalog.LEVEL_META[lv] ? catalog.LEVEL_META[lv].name : "Explorer",
            status: status || "insufficient_evidence",
            source,
            reason: reasonSentence(category, activity, lv, status),
            reasonCode: status === "advanced" ? "advancement" : status === "ready" ? "practice" : "development",
            recommendedActivity: true,
        };
    }
    return {
        categoryId: category.id,
        categoryName: category.name,
        activityId: null,
        activityTitle: `All games mastered in ${category.name} — revisit a level 3 mission for fun`,
        level: 3,
        status: status || "insufficient_evidence",
        source,
        reason: `You have finished every game in ${category.name} at Master level. Replay a mission to keep sharpening this skill.`,
        reasonCode: "exploration",
        recommendedActivity: false,
    };
}

function reasonSentence(category, activity, level, status) {
    const lvlName = catalog.LEVEL_META[level] ? catalog.LEVEL_META[level].name : "Explorer";
    if (!status || status === "insufficient_evidence" || status === "foundation") {
        return `Let's practice ${activity.title}! This game will help you build your ${category.name.toLowerCase()} step by step.`;
    }
    if (status === "developing") {
        return `You are improving in ${category.name.toLowerCase()}. Play the ${lvlName} level of ${activity.title} to grow even more.`;
    }
    if (status === "ready") {
        return `You are doing well in ${category.name.toLowerCase()}! The ${lvlName} level of ${activity.title} will stretch your thinking.`;
    }
    return `Strong work in ${category.name.toLowerCase()}! Master the ${lvlName} level of ${activity.title} to go even further.`;
}

// ── top recommendation: prefer the LD decision, fall back to deterministic ──
async function getTopRecommendation({ studentId, models }) {
    const { SkillAttempt, LearningRecommendation } = models;

    // 1) latest LD decision (mode skills)
    try {
        const rec = await LearningRecommendation.findOne({ studentId, mode: "skills" }).sort({ submittedAt: -1 }).lean();
        if (rec && rec.primaryFocus && rec.primaryFocus.subskill) {
            const category = catalog.categoryById(rec.primaryFocus.subskill);
            if (category) {
                const attempts = await SkillAttempt.find({ studentId, status: "completed" }).sort({ completedAt: -1 }).lean();
            for (const activity of category.activities) {
                    const lv = nextLevelForActivity(attempts, activity.id);
                    if (lv !== null) {
                        return {
                            categoryId: category.id,
                            categoryName: category.name,
                            categoryColor: category.color,
                            activityId: activity.id,
                            activityTitle: activity.title,
                            activityIcon: activity.icon,
                            level: lv,
                            levelName: catalog.LEVEL_META[lv] ? catalog.LEVEL_META[lv].name : "Explorer",
                            status: rec.primaryFocus.currentStatus,
                            source: "ld",
                            reason: reasonSentence(category, activity, lv, rec.primaryFocus.currentStatus),
                            reasonCode: rec.primaryFocus.reasonCode || rec.recommendationType,
                            recommendedActivity: true,
                        };
                    }
                }
                // The LD focus category has all levels passed → explore next category
            }
        }
    } catch (e) {
        // fall through to deterministic
    }

    // 2) deterministic fallback
    try {
        return await deterministicRecommendation({ studentId, models });
    } catch (e) {
        return {
            categoryId: null,
            activityId: null,
            level: 1,
            source: "none",
            reason: "Complete a game to unlock your next recommendation.",
            recommendedActivity: false,
        };
    }
}

module.exports = {
    SKILL,
    GRADE,
    buildAnsweredQuestions,
    refreshLd,
    stageForStatus,
    profilesByCategory,
    bestByLevel,
    nextLevelForActivity,
    deterministicRecommendation,
    getTopRecommendation,
    reasonSentence,
};