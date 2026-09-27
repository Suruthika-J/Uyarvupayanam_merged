// backend/controllers/learningDiagnosisController.js
//
// LD-NBSE (Learning DNA – Next Best Skill Engine) API controller.
//
// Philosophy: Groq generates question CONTENT only. Everything about skill
// level, gaps, prerequisites and the next best skill is decided by the
// deterministic engines (services/nextBestSkillEngine.js et al).
"use strict";

const crypto = require("crypto");
const User = require("../models/User");
const GeneratedAssessment = require("../models/GeneratedAssessment");
const StudentSkillProfile = require("../models/StudentSkillProfile");
const StudentLearningDNA = require("../models/StudentLearningDNA");
const StudentInterestProfile = require("../models/StudentInterestProfile");
const SkillProgressHistory = require("../models/SkillProgressHistory");
const LearningRecommendation = require("../models/LearningRecommendation");
const SkillTaxonomy = require("../models/SkillTaxonomy");
const SkillDependency = require("../models/SkillDependency");
const LdnbsConfig = require("../models/LdnbsConfig");
const AssessmentSummary = require("../models/AssessmentSummary");

const { loadEffectiveConfig } = require("../config/ldnbs/loadEffectiveConfig");
const taxonomy = require("../config/ldnbs/skillTaxonomyConfig");
const { validateWeights } = require("../config/ldnbs/recommendationWeights");
const { normalizeGrade } = require("./onboardingAssessmentController");
const diagnosticService = require("../services/diagnosticQuestionService");
const orchestrator = require("../services/ldnbsOrchestrator");
const { upsertStudentProfile } = require("../utils/studentProfileSync");

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function toClientQuestion(row) {
    return {
        _id: row._id,
        questionText: row.questionText,
        options: row.options,
        skill: row.skill,
        subskill: row.subskill || "general",
        cognitiveType: row.cognitiveType || "understanding",
        difficulty: row.difficulty || "easy",
        weight: Number(row.weight) || 1,
    };
}

function sanitizeInterestBank() {
    return taxonomy.INTEREST_BANK.map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        preview: q.preview,
        options: q.options.map((o) => o.option),
    }));
}

async function getBlueprintRows(grade, cfg) {
    const over = cfg?.blueprintOverrides?.[grade];
    if (Array.isArray(over) && over.length) return over;
    return taxonomy.getBlueprint(grade);
}

// ────────────────────────────────────────────────────────────────────────────
// POST /api/onboarding/ld/generate-questions
// Body: { studentId, grade?, sessionId?, mode? }
// → blueprint-driven 15–20 question diagnostic set (with metadata) + the 4
//   interest questions. Session-resume safe (same session → same set).
// ────────────────────────────────────────────────────────────────────────────
exports.generateDiagnosticQuestions = async (req, res) => {
    try {
        const { studentId, grade, sessionId, forceBank } = req.body || {};
        if (!studentId) return res.status(400).json({ success: false, message: "studentId is required" });

        const student = await User.findById(studentId).select("name classLevel userType recommendationGenerated onboardingCompleted").lean();
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        const resolvedGrade = normalizeGrade(grade) || normalizeGrade(student.classLevel);
        if (!resolvedGrade) {
            return res.status(400).json({ success: false, message: "Student class level is not set. Please update your profile." });
        }

        if (student.recommendationGenerated && !sessionId) {
            return res.json({ success: true, alreadyCompleted: true, grade: resolvedGrade });
        }

        // Resume: same session → return the stored set without regenerating.
        if (sessionId) {
            const existing = await GeneratedAssessment.find({ sessionId, studentId }).sort({ _id: 1 }).lean();
            if (existing.length) {
                return res.json({
                    success: true,
                    source: "resume",
                    sessionId,
                    grade: resolvedGrade,
                    questions: existing.map(toClientQuestion),
                    totalQuestions: existing.length,
                    interestQuestions: sanitizeInterestBank(),
                });
            }
        }

        const cfg = await loadEffectiveConfig({ LdnbsConfig });
        const blueprintRows = await getBlueprintRows(resolvedGrade, cfg);
        if (!blueprintRows.length) {
            return res.status(404).json({ success: false, message: `No diagnostic blueprint is configured for ${resolvedGrade} yet.` });
        }

        const { rows, source } = await diagnosticService.generateDiagnosticSet(resolvedGrade, blueprintRows, { forceBank: !!forceBank });
        if (!rows.length) {
            return res.status(404).json({ success: false, message: `No diagnostic questions could be generated for ${resolvedGrade}. Please try again later.` });
        }
        const storedSource = source === "ai" || source === "mixed" ? "ai" : "bank";

        const newSessionId = crypto.randomBytes(16).toString("hex");
        const submittedAt = new Date();
        const inserted = await GeneratedAssessment.insertMany(
            rows.map((q) => ({
                studentId,
                sessionId: newSessionId,
                grade: resolvedGrade,
                skill: q.skill,
                subskill: q.subskill,
                cognitiveType: q.cognitiveType,
                weight: q.weight,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty,
                source: storedSource,
                mode: "onboarding",
                submittedAt,
            }))
        );

        res.json({
            success: true,
            sessionId: newSessionId,
            grade: resolvedGrade,
            source,
            questions: inserted.map(toClientQuestion),
            totalQuestions: inserted.length,
            interestQuestions: sanitizeInterestBank(),
        });
    } catch (error) {
        console.error("LD generate error:", error);
        res.status(500).json({ success: false, message: "Failed to generate diagnostic questions" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/onboarding/ld/submit
// Body: { studentId, sessionId, answers, interestAnswers?, ...legacyFields }
// → deterministic diagnosis + persistence + full Part-24 payload.
// ────────────────────────────────────────────────────────────────────────────
exports.submitDiagnostic = async (req, res) => {
    try {
        const { studentId, sessionId, grade, answers = [], interestAnswers, ...legacyFields } = req.body || {};
        if (!studentId || !sessionId) {
            return res.status(400).json({ success: false, message: "studentId and sessionId are required" });
        }
        const student = await User.findById(studentId).select("name email classLevel userType").lean();
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });
        const resolvedGrade = normalizeGrade(grade) || normalizeGrade(student.classLevel);
        if (!resolvedGrade) {
            return res.status(400).json({ success: false, message: "Student class level is not set. Please update your profile." });
        }

        const cfg = await loadEffectiveConfig({ LdnbsConfig });
        const sessionRows = await GeneratedAssessment.find({ sessionId, studentId }).lean();
        if (!sessionRows.length) {
            return res.status(400).json({ success: false, message: "Assessment session not found. Please restart the assessment." });
        }

        const outcome = await orchestrator.runAssessmentPipeline({
            studentId,
            grade: resolvedGrade,
            sessionId,
            answers,
            interestAnswers,
            legacyFields,
            mode: "onboarding",
            cfg,
            sessionRows,
            student,
            models: {
                GeneratedAssessment, StudentSkillProfile, StudentLearningDNA, StudentInterestProfile,
                SkillProgressHistory, LearningRecommendation, AssessmentSummary, User,
            },
        });

        if (!outcome.ok) {
            const status = outcome.code === "SESSION_NOT_FOUND" ? 400 : 422;
            return res.status(status).json({ success: false, code: outcome.code, message: outcome.message });
        }

        // Phase 3 — durable home for the Step-1 profile fields. `legacyFields`
        // carries the 13 onboarding fields the form spreads into this body.
        // Best-effort only: a profile-sync failure must never fail or change the
        // onboarding response that already succeeded (existing behavior preserved).
        try {
            await upsertStudentProfile({ userId: studentId, classLevel: resolvedGrade, fields: legacyFields });
        } catch (syncErr) {
            console.error("StudentProfile sync (LD submit) failed:", syncErr.message);
        }

        res.json({ success: true, result: outcome.payload });
    } catch (error) {
        console.error("LD submit error:", error);
        res.status(500).json({ success: false, message: "Failed to run the learning diagnosis" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/onboarding/ld/reassess
// Body: { studentId, grade?, sessionId?, target? }
// → generates 3–5 targeted questions around the primary focus (Part 19),
//   stored as a new "reassess" session (the adaptive loop, Part 17).
// ────────────────────────────────────────────────────────────────────────────
exports.reassessDiagnostic = async (req, res) => {
    try {
        const { studentId, grade, sessionId, target, forceBank } = req.body || {};
        if (!studentId) return res.status(400).json({ success: false, message: "studentId is required" });
        const student = await User.findById(studentId).select("classLevel userType").lean();
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });
        const resolvedGrade = normalizeGrade(grade) || normalizeGrade(student.classLevel);
        if (!resolvedGrade) return res.status(400).json({ success: false, message: "Student class level is not set." });

        if (sessionId) {
            const existing = await GeneratedAssessment.find({ sessionId, studentId, mode: "reassess" }).sort({ _id: 1 }).lean();
            if (existing.length) {
                return res.json({ success: true, source: "resume", sessionId, grade: resolvedGrade, questions: existing.map(toClientQuestion), totalQuestions: existing.length });
            }
        }

        // Find the latest recommendation (or an explicit target) as the focus.
        let focus = null;
        if (target && typeof target === "object" && target.subskill) {
            focus = { skill: target.skill, subskill: target.subskill, currentStatus: target.currentStatus || "developing", gapTypes: target.gapTypes || [] };
        } else {
            const latest = await LearningRecommendation.findOne({ studentId }).sort({ submittedAt: -1 }).lean();
            if (latest?.primaryFocus?.subskill && latest.primaryFocus.subskill !== "exploration") {
                focus = {
                    skill: latest.primaryFocus.skill,
                    subskill: latest.primaryFocus.subskill,
                    currentStatus: latest.primaryFocus.currentStatus || "developing",
                    gapTypes: (latest.detectedGaps || []).map((g) => g.type),
                };
            }
        }
        if (!focus) {
            return res.status(404).json({ success: false, message: "No recommendation found to reassess. Complete the onboarding diagnosis first." });
        }

        const cfg = await loadEffectiveConfig({ LdnbsConfig });
        const specs = taxonomy.buildReassessmentSpecs(focus);
        const { questionRows, source } = await diagnosticService.generateDiagnosticForSkill(resolvedGrade, focus.skill, specs, { forceBank: !!forceBank });
        if (!questionRows.length) {
            return res.status(404).json({ success: false, message: `No reassessment questions could be generated for ${focus.subskill}. Please try again later.` });
        }

        const newSessionId = crypto.randomBytes(16).toString("hex");
        const submittedAt = new Date();
        const inserted = await GeneratedAssessment.insertMany(
            questionRows.map((q) => ({
                studentId,
                sessionId: newSessionId,
                grade: resolvedGrade,
                skill: focus.skill,
                subskill: q.subskill,
                cognitiveType: q.cognitiveType,
                weight: q.weight,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty,
                source: source === "ai" ? "ai" : "bank",
                mode: "reassess",
                reassessTarget: q.subskill,
                submittedAt,
            }))
        );

        res.json({
            success: true,
            sessionId: newSessionId,
            grade: resolvedGrade,
            source,
            mode: "reassess",
            focus: { skill: focus.skill, subskill: focus.subskill },
            questions: inserted.map(toClientQuestion),
            totalQuestions: inserted.length,
        });
    } catch (error) {
        console.error("LD reassess error:", error);
        res.status(500).json({ success: false, message: "Failed to generate reassessment questions" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /api/onboarding/ld/result/:studentId
// → Part 24 payload built from the persisted LD-NBSE documents.
// ────────────────────────────────────────────────────────────────────────────
exports.getDiagnosticResult = async (req, res) => {
    try {
        // Owner is guaranteed by verifyStudent + verifyOwnership middleware.
        const studentId = String(req.student._id);
        const student = await User.findById(studentId).select("name email classLevel userType").lean();
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        const [dna, interests, profiles, history, latest] = await Promise.all([
            StudentLearningDNA.findOne({ studentId }).lean(),
            StudentInterestProfile.findOne({ studentId }).lean(),
            StudentSkillProfile.find({ studentId }).sort({ lastAttemptAt: 1 }).lean(),
            SkillProgressHistory.find({ studentId }).sort({ recordedAt: 1 }).lean(),
            LearningRecommendation.findOne({ studentId }).sort({ submittedAt: -1 }).lean(),
        ]);

        if (!latest) {
            return res.status(404).json({ success: false, message: "No learning diagnosis found. Complete the assessment first." });
        }

        res.json({
            success: true,
            studentId,
            grade: latest.grade,
            studentProfile: { name: student.name, email: student.email, classLevel: student.classLevel, userType: student.userType, assessedAt: latest.submittedAt },
            learningDNA: dna?.dimensions ? dna : { dimensions: latest.explanation?.decision?.dna || {} },
            skillDiagnosis: profiles,
            interestProfile: interests ? { interests: interests.interests, source: interests.source } : { interests: {}, source: "none" },
            detectedGaps: latest.detectedGaps || [],
            primaryFocus: latest.primaryFocus,
            secondaryFocus: latest.secondaryFocus || [],
            strengthsToMaintain: latest.strengthsToMaintain || [],
            lockedSkills: latest.lockedSkills || [],
            unlockedSkills: latest.unlockedSkills || [],
            learningPath: latest.learningPath || [],
            progress: latest.progress || [],
            areasToExplore: latest.areasToExplore || [],
            explanation: latest.explanation,
            recommendationType: latest.recommendationType,
            confidence: latest.confidence,
            cycle: latest.cycle,
            assessmentId: String(latest._id),
            history: history,
        });
    } catch (error) {
        console.error("LD result error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch the learning diagnosis" });
    }
};

// ────────────────────────────────────────────────────────────────────────────
// Admin configuration (Part 27)
// ────────────────────────────────────────────────────────────────────────────

exports.getLdConfig = async (req, res) => {
    try {
        const cfg = await loadEffectiveConfig({ LdnbsConfig });
        const [tax, deps] = await Promise.all([
            SkillTaxonomy.find().lean(),
            SkillDependency.find().lean(),
        ]);
        res.json({
            success: true,
            config: {
                weights: cfg.weights,
                thresholds: cfg.thresholds,
                effortByStatus: cfg.effortByStatus,
                successMessages: cfg.successMessages,
                blueprintOverrides: cfg.blueprintOverrides || {},
                gradingCurves: cfg.thresholds?.status || {},
            },
            taxonomy: tax,
            dependencies: deps,
            defaults: {
                weights: taxonomyBlueprintDefaults().weights,
                taxonomy: taxonomy.TAXONOMY,
                dependenciesFlat: taxonomy.getDependenciesFlat ? taxonomy.getDependenciesFlat() : {},
            },
        });
    } catch (error) {
        console.error("LD config error:", error);
        res.status(500).json({ success: false, message: "Failed to load LD-NBSE configuration" });
    }
};

function taxonomyBlueprintDefaults() {
    const flat = {};
    for (const grade of taxonomy.GRADES) {
        flat[grade] = [];
        for (const skill of Object.keys(taxonomy.TAXONOMY[grade] || {})) {
            for (const sub of taxonomy.TAXONOMY[grade][skill]) {
                (flat[grade] || flat[grade]).push({ skill, subskill: sub });
            }
        }
    }
    return { weights: require("../config/ldnbs/recommendationWeights").DEFAULT_WEIGHTS, flat };
}

exports.updateLdConfig = async (req, res) => {
    try {
        const { weights, thresholds, effortByStatus, successMessages, blueprintOverrides } = req.body || {};
        const update = { updatedAt: new Date() };
        if (weights) update.weights = validateWeights(weights);
        if (thresholds) update.thresholds = thresholds;
        if (effortByStatus) update.effortByStatus = effortByStatus;
        if (successMessages) update.successMessages = successMessages;
        if (blueprintOverrides) update.blueprintOverrides = blueprintOverrides;

        await LdnbsConfig.updateOne({ key: "default" }, { $set: update }, { upsert: true });
        const cfg = await loadEffectiveConfig({ LdnbsConfig });
        res.json({ success: true, message: "LD-NBSE configuration updated.", config: { weights: cfg.weights, thresholds: cfg.thresholds, blueprintOverrides: cfg.blueprintOverrides || {} } });
    } catch (error) {
        console.error("LD config update error:", error);
        res.status(500).json({ success: false, message: "Failed to update LD-NBSE configuration" });
    }
};

// PUT /api/onboarding/ld/admin/taxonomy — replace the taxonomy for one grade.
exports.updateTaxonomy = async (req, res) => {
    try {
        const { grade, skills } = req.body || {};
        if (!grade || !skills || typeof skills !== "object") {
            return res.status(400).json({ success: false, message: "grade and skills (skill → [subskills]) are required" });
        }
        await SkillTaxonomy.deleteMany({ grade });
        const docs = Object.entries(skills).map(([skill, subskills]) => ({ grade, skill, subskills: subskills || [] }));
        if (docs.length) await SkillTaxonomy.insertMany(docs);
        res.json({ success: true, message: `Taxonomy for ${grade} updated.` });
    } catch (error) {
        console.error("LD taxonomy update error:", error);
        res.status(500).json({ success: false, message: "Failed to update taxonomy" });
    }
};

// PUT /api/onboarding/ld/admin/dependencies — replace the dependency graph for one grade.
exports.updateDependencies = async (req, res) => {
    try {
        const { grade, dependencies } = req.body || {};
        if (!grade || !Array.isArray(dependencies)) {
            return res.status(400).json({ success: false, message: "grade and dependencies array are required" });
        }
        await SkillDependency.deleteMany({ grade });
        if (dependencies.length) await SkillDependency.insertMany(dependencies);
        res.json({ success: true, message: `Dependency graph for ${grade} updated.` });
    } catch (error) {
        console.error("LD dependency update error:", error);
        res.status(500).json({ success: false, message: "Failed to update dependencies" });
    }
};