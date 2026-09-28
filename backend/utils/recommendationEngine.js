// backend/utils/recommendationEngine.js
//
// Standalone, swappable recommendation engine for the onboarding assessment.
// It is decoupled from HOW skillResults was produced — it only takes the
// per-skill results ({ skill, correct, total }) and the student's grade, so a
// different scoring method (adaptive IRT/CAT, AI evaluation, ...) can feed it
// later without changing this file.
//
// Rule lookups are async (MongoDB) but accept optionally preloaded `rules` /
// `guidelines` arrays for pure/offline use.
const RecommendationRule = require("../models/RecommendationRule");
const GuidelineRule = require("../models/GuidelineRule");

const STRONG = "Strong";
const AVERAGE = "Average";
const NEEDS_IMPROVEMENT = "Needs Improvement";

// Pure: percentage → level (>=80 Strong, >=50 Average, else Needs Improvement)
function classifySkillLevel(percentage) {
    if (percentage >= 80) return STRONG;
    if (percentage >= 50) return AVERAGE;
    return NEEDS_IMPROVEMENT;
}

// Rules may target a specific grade or "All".
function gradeMatches(ruleGrade, studentGrade) {
    return ruleGrade === "All" || ruleGrade === studentGrade;
}

/**
 * Build the full recommendation payload.
 * @param {{ studentGrade: string, skillResults: Array<{skill: string, correct: number, total: number}>, rules?: Array, guidelines?: Array }} input
 * @returns {Promise<object>} the engine payload (see README / result screen contract)
 */
async function getRecommendations({ studentGrade, skillResults, rules, guidelines }) {
    const breakdown = (skillResults || []).map(({ skill, correct, total }) => {
        const safeTotal = Number(total) || 0;
        const safeCorrect = Math.min(Number(correct) || 0, safeTotal);
        const percentage = safeTotal > 0 ? Math.round((safeCorrect / safeTotal) * 100) : 0;
        return { skill, correct: safeCorrect, total: safeTotal, percentage, level: classifySkillLevel(percentage) };
    });

    const strongSkills = breakdown.filter((b) => b.level === STRONG).map((b) => b.skill);
    const needsImprovement = breakdown.filter((b) => b.level === NEEDS_IMPROVEMENT).map((b) => b.skill);
    const recommendedSkillsToFocus = breakdown.filter((b) => b.level !== STRONG).map((b) => b.skill);

    // ── per-skill rule lookup (activity + exam), deduped, grade-filtered ──
    const allRules = rules || (await RecommendationRule.find().lean());
    const suggestedActivities = [];
    const recommendedExams = [];
    const seenActivity = new Set();
    const seenExam = new Set();

    for (const b of breakdown) {
        const match = allRules.find(
            (r) =>
                String(r.skill || "").toLowerCase() === String(b.skill || "").toLowerCase() &&
                r.skillLevel === b.level &&
                gradeMatches(r.grade, studentGrade)
        );
        if (!match) {
            console.warn(`[recommendationEngine] No rule for grade=${studentGrade}, skill=${b.skill}, level=${b.level}`);
            continue;
        }
        if (match.recommendedActivity && !seenActivity.has(match.recommendedActivity)) {
            seenActivity.add(match.recommendedActivity);
            suggestedActivities.push(match.recommendedActivity);
        }
        if (match.recommendedExam && !seenExam.has(match.recommendedExam)) {
            seenExam.add(match.recommendedExam);
            recommendedExams.push(match.recommendedExam);
        }
    }

    // ── overall score (average of per-skill percentages) + level ──
    const overallScore = breakdown.length
        ? Math.round(breakdown.reduce((sum, b) => sum + b.percentage, 0) / breakdown.length)
        : 0;
    const overallLevel = classifySkillLevel(overallScore);

    // ── quick guideline lookup with generic fallback ──
    const allGuidelines = guidelines || (await GuidelineRule.find().lean());
    const guideline =
        allGuidelines.find((g) => g.overallLevel === overallLevel) ||
        allGuidelines.find((g) => g.overallLevel === "Fallback") ||
        null;
    const quickGuideline =
        guideline?.guidelineText ||
        "Keep a consistent study routine and review your progress regularly.";

    return {
        overallScore,
        overallLevel,
        skillBreakdown: breakdown,
        strongSkills,
        needsImprovement,
        recommendedSkillsToFocus,
        suggestedActivities,
        recommendedExams,
        quickGuideline,
    };
}

module.exports = { classifySkillLevel, getRecommendations, STRONG, AVERAGE, NEEDS_IMPROVEMENT };