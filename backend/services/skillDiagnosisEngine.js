// backend/services/skillDiagnosisEngine.js
//
// Part 5 — Skill Diagnosis. Deterministic, evidence-first diagnosis per
// subskill. Never classifies a student based on a single question: with
// insufficient evidence the status is "insufficient_evidence".
//
// Input: answered questions with metadata:
//   { skill, subskill, cognitiveType, difficulty, weight, isCorrect }
"use strict";

const PKEY = (skill, subskill) => `${skill}::${subskill}`;

/**
 * Diagnose every subskill present in the answered questions.
 * @param {Array} answeredQuestions
 * @param {{ grade?: string, cfg?: object }} opts
 * @returns {Array<object>} profile rows (subskill level) + .byKey map attached
 */
function diagnose(answeredQuestions, { grade, cfg } = {}) {
    const thresholds = cfg?.thresholds?.status?.[grade] || cfg?.thresholds?.status?.default || { foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 };
    const ev = cfg?.thresholds?.evidence || { minForJudgment: 2, highConfidenceAt: 3 };
    const min = Math.max(1, Number(ev.minForJudgment) || 2);
    const highAt = Number(ev.highConfidenceAt) || 3;

    const buckets = {};
    for (const q of answeredQuestions || []) {
        if (!q || !q.skill || !q.subskill) continue;
        const key = PKEY(q.skill, q.subskill);
        (buckets[key] = buckets[key] || []).push(q);
    }

    const profiles = [];
    const byKey = {};
    for (const [key, qs] of Object.entries(buckets)) {
        const [skill, subskill] = key.split("::");
        const attemptedCount = qs.length;
        const correctCount = qs.filter((q) => q.isCorrect).length;
        const rawScore = Math.round((correctCount / attemptedCount) * 100);
        const totalWeight = qs.reduce((s, q) => s + (Number(q.weight) || 1), 0);
        const weightedSum = qs.reduce((s, q) => s + ((Number(q.weight) || 1) * (q.isCorrect ? 1 : 0)), 0);
        const weightedScore = totalWeight ? Math.round((weightedSum / totalWeight) * 100) : 0;

        const difficultyPerformance = { easy: null, medium: null, hard: null };
        for (const d of ["easy", "medium", "hard"]) {
            const subset = qs.filter((q) => q.difficulty === d);
            if (subset.length) difficultyPerformance[d] = Math.round((subset.filter((q) => q.isCorrect).length / subset.length) * 100);
        }
        const cognitivePerformance = {};
        for (const ct of [...new Set(qs.map((q) => q.cognitiveType).filter(Boolean))]) {
            const subset = qs.filter((q) => q.cognitiveType === ct);
            cognitivePerformance[ct] = Math.round((subset.filter((q) => q.isCorrect).length / subset.length) * 100);
        }

        let status;
        if (attemptedCount < min) status = "insufficient_evidence";
        else if (weightedScore >= thresholds.advancedAt) status = "advanced";
        else if (weightedScore >= thresholds.readyUnder) status = "ready";
        else if (weightedScore >= thresholds.developingUnder) status = "developing";
        else status = "foundation";

        const confidence = attemptedCount >= highAt ? "high" : attemptedCount >= 2 ? "medium" : "low";

        const row = {
            skill,
            subskill,
            score: rawScore,
            correctCount,
            attemptedCount,
            weightedScore,
            difficultyPerformance,
            cognitivePerformance,
            confidence,
            status,
        };
        profiles.push(row);
        byKey[key] = row;
    }

    return { profiles, byKey };
}

module.exports = { diagnose, PKEY };