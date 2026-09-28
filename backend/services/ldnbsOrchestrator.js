// backend/services/ldnbsOrchestrator.js
//
// Glue for the LD-NBSE pipeline: evaluate answers against generated_assessments
// (server-side correct answers), run the deterministic engines in order,
// persist the results, and return the Part-24 result payload.
//
// Pipeline: Learning DNA → Skill Diagnosis → Gap Detection → Dependency Check
//           → Interest → Progress → Next Best Skill (decision engine).
"use strict";

const skillDiagnosis = require("./skillDiagnosisEngine");
const learningDNA = require("./learningDNAEngine");
const gapDetection = require("./gapDetectionEngine");
const interestEngine = require("./interestProfileEngine");
const progressEngine = require("./progressAnalysisEngine");
const nextBestSkill = require("./nextBestSkillEngine");
const taxonomy = require("../config/ldnbs/skillTaxonomyConfig");

const MIN_COMPLETION_RATIO = 0.3; // < 30% answered → no confident diagnosis

/**
 * Evaluate submitted answers + run + persist the full pipeline.
 * @param {object} args {
 *   studentId, grade, sessionId, answers, interestAnswers, legacyFields, mode,
 *   cfg, models { GeneratedAssessment, StudentSkillProfile, StudentLearningDNA,
 *   StudentInterestProfile, SkillProgressHistory, LearningRecommendation,
 *   AssessmentSummary, User }
 * }
 * @returns {Promise<{ok: true, payload} | {ok: false, code, message}>}
 */
async function runAssessmentPipeline(args) {
    const {
        studentId, grade, sessionId, answers = [], interestAnswers, legacyFields = {}, mode = "onboarding",
        cfg, models, sessionRows, student,
    } = args;
    const {
        GeneratedAssessment = {}, StudentSkillProfile = {}, StudentLearningDNA = {},
        StudentInterestProfile = {}, SkillProgressHistory = {}, LearningRecommendation = {},
        AssessmentSummary = {}, User = {},
    } = models || {};

    // ── 1. evaluate answers against server rows (the only trusted source) ──
    let rows = sessionRows;
    if (!rows && GeneratedAssessment.find) {
        rows = await GeneratedAssessment.find({ sessionId, studentId }).lean();
    }
    if (!rows || !rows.length) return { ok: false, code: "SESSION_NOT_FOUND", message: "Assessment session not found. Please restart the assessment." };

    const rowById = new Map();
    for (const r of rows) rowById.set(String(r._id), r);

    const answeredQuestions = [];
    for (const a of answers || []) {
        const r = rowById.get(String(a.questionId));
        if (!r) continue;
        const isCorrect = r.correctAnswer === a.selectedAnswer;
        answeredQuestions.push({
            skill: r.skill,
            subskill: r.subskill || "general",
            cognitiveType: r.cognitiveType || "understanding",
            difficulty: r.difficulty || "easy",
            weight: Number(r.weight) || 1,
            isCorrect,
        });
    }

    const completionRatio = rows.length ? answeredQuestions.length / rows.length : 0;
    if (completionRatio < MIN_COMPLETION_RATIO) {
        return {
            ok: false,
            code: "INCOMPLETE_ASSESSMENT",
            message: `Only ${answeredQuestions.length} of ${rows.length} questions were answered — that is too little to diagnose reliably. Please complete the assessment.`,
        };
    }

    // ── 2. run the deterministic engines ──
    const { profiles } = skillDiagnosis.diagnose(answeredQuestions, { grade, cfg });
    const dna = learningDNA.build(answeredQuestions, { cfg });
    const gaps = gapDetection.detect({ dna, profiles }, { cfg });
    const interest = interestEngine.compute(interestAnswers, legacyFields);

    // history excluding the current cycle, for progress classification
    let history = [];
    if (SkillProgressHistory.find) {
        history = await SkillProgressHistory.find({ studentId }).sort({ recordedAt: 1 }).lean();
    }
    const progress = progressEngine.analyze(profiles, history, { cfg });

    const deps = taxonomy.getDependencies(grade);
    const recommendation = nextBestSkill.decide({
        grade,
        profiles,
        dna,
        gaps,
        interests: interest.interests,
        progress,
        deps,
        cfg,
        mode,
        allAnsweredCount: answeredQuestions.length,
        assessedSubskills: [...new Set(answeredQuestions.map((q) => q.subskill))],
    });
    recommendation.evidence.sessionId = sessionId;

    // ── 3. persist ──
    const now = new Date();

    if (StudentSkillProfile && StudentSkillProfile.bulkWrite) {
        const ops = profiles.map((p) => ({
            updateOne: {
                filter: { studentId, skill: p.skill, subskill: p.subskill },
                update: { $set: { ...p, grade, lastAttemptAt: now } },
                upsert: true,
            },
        }));
        await StudentSkillProfile.bulkWrite(ops);
    }
    if (StudentLearningDNA && StudentLearningDNA.findOneAndUpdate) {
        await StudentLearningDNA.findOneAndUpdate(
            { studentId },
            { $set: { grade, dimensions: dna.dimensions, lastAssessmentAt: now } },
            { upsert: true }
        );
    }
    if (StudentInterestProfile && StudentInterestProfile.findOneAndUpdate) {
        await StudentInterestProfile.findOneAndUpdate(
            { studentId },
            { $set: { grade, interests: interest.interests, source: interest.source, lastUpdatedAt: now } },
            { upsert: true }
        );
    }
    let cycle = 1;
    let recommendationId = null;
    if (LearningRecommendation && LearningRecommendation.countDocuments) {
        cycle = (await LearningRecommendation.countDocuments({ studentId })) + 1;
        if (SkillProgressHistory && SkillProgressHistory.insertMany) {
            await SkillProgressHistory.insertMany(
                profiles.map((p) => ({
                    studentId,
                    grade,
                    skill: p.skill,
                    subskill: p.subskill,
                    score: p.weightedScore,
                    status: p.status,
                    attemptedCount: p.attemptedCount,
                    recordedAt: now,
                }))
            );
        }
        const doc = await LearningRecommendation.create({
            studentId,
            grade,
            cycle,
            mode,
            recommendationType: recommendation.recommendationType,
            confidence: recommendation.confidence,
            primaryFocus: recommendation.primaryFocus,
            secondaryFocus: recommendation.secondaryFocus,
            strengthsToMaintain: recommendation.strengthsToMaintain,
            detectedGaps: recommendation.detectedGaps,
            lockedSkills: recommendation.lockedSkills,
            unlockedSkills: recommendation.unlockedSkills,
            learningPath: recommendation.learningPath,
            areasToExplore: recommendation.areasToExplore,
            progress: recommendation.progress,
            explanation: recommendation.explanation,
            evidence: recommendation.evidence,
            submittedAt: now,
        });
        recommendationId = doc._id;
        recommendation.cycle = cycle;
        recommendation.learningRecommendationId = String(recommendationId);
    }
    if (AssessmentSummary && AssessmentSummary.create) {
        await AssessmentSummary.create({
            studentId,
            sessionId: sessionId || "",
            grade,
            overallScore: dna.accuracy,
            overallLevel: dna.accuracy >= 80 ? "Strong" : dna.accuracy >= 50 ? "Average" : "Needs Improvement",
            skillBreakdown: profiles.map((p) => ({ skill: `${p.skill} · ${p.subskill}`, correct: p.correctCount, total: p.attemptedCount, percentage: p.weightedScore, level: p.status })),
            strongSkills: profiles.filter((p) => p.status === "advanced" || p.status === "ready").map((p) => p.subskill),
            needsImprovement: profiles.filter((p) => p.status === "foundation" || p.status === "developing").map((p) => p.subskill),
            recommendedSkillsToFocus: primaryFocusList(recommendation),
            suggestedActivities: suggestedActivitiesFor(recommendation),
            recommendedExams: [],
            quickGuideline: recommendation.explanation?.summary || "",
            submittedAt: now,
        });
    }
    if (User && User.findByIdAndUpdate && student?.recommendationGenerated !== true) {
        await User.findByIdAndUpdate(studentId, { onboardingCompleted: true, recommendationGenerated: true });
    }
    if (mode === "onboarding" && User && User.findByIdAndUpdate) {
        await User.findByIdAndUpdate(studentId, { onboardingCompleted: true, recommendationGenerated: true });
    }

    // ── 4. assemble Part-24 payload ──
    const payload = {
        studentProfile: { name: student?.name || "", classLevel: student?.classLevel, userType: student?.userType, assessedAt: now },
        learningDNA: dna,
        skillDiagnosis: profiles,
        interestProfile: { interests: interest.interests, source: interest.source },
        detectedGaps: recommendation.detectedGaps,
        primaryFocus: recommendation.primaryFocus,
        secondaryFocus: recommendation.secondaryFocus,
        strengthsToMaintain: recommendation.strengthsToMaintain,
        lockedSkills: recommendation.lockedSkills,
        unlockedSkills: recommendation.unlockedSkills,
        learningPath: recommendation.learningPath,
        progress: recommendation.progress,
        areasToExplore: recommendation.areasToExplore,
        explanation: recommendation.explanation,
        recommendationType: recommendation.recommendationType,
        confidence: recommendation.confidence,
        cycle,
        assessmentId: recommendation.learningRecommendationId,
    };
    return { ok: true, payload };
}

function primaryFocusList(recommendation) {
    const list = [];
    if (recommendation.primaryFocus?.subskill && recommendation.primaryFocus.subskill !== "exploration") list.push(recommendation.primaryFocus.subskill);
    for (const s of recommendation.secondaryFocus || []) list.push(s.subskill);
    return [...new Set(list)];
}

function suggestedActivitiesFor(recommendation) {
    const out = [];
    const p = recommendation.primaryFocus;
    if (p?.subskill && p.subskill !== "exploration") {
        out.push(`Daily practice on ${p.subskill} (${p.recommendedDifficulty || "medium"} difficulty), ~15 minutes.`);
        if (p.prerequisite) out.push(`Quick prerequisite check on ${p.prerequisite} before advanced ${p.subskill} work.`);
        out.push(`Work one word-problem/applied task a day that uses ${p.subskill}.`);
    }
    for (const g of recommendation.detectedGaps || []) {
        out.push(`Gap focus: ${g.label} — practice transforming understanding into ${g.relatedSkills[0] || "applied" } problems.`);
    }
    return [...new Set(out)].slice(0, 5);
}

module.exports = { runAssessmentPipeline, MIN_COMPLETION_RATIO };