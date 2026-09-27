// backend/services/learningDNAEngine.js
//
// Part 4 — Learning DNA. Builds the student's measurable learning-performance
// profile across cognitive dimensions. Only assessment behaviour is used.
"use strict";

const dnaConfig = require("../config/ldnbs/learningDNAConfig");

const DIMENSION_ORDER = [
    "accuracy",
    "understanding",
    "application",
    "reasoning",
    "problemSolving",
    "patternRecognition",
    "comprehension",
    "communication",
];

/**
 * Build the Learning DNA from answered questions.
 * @param {Array} answeredQuestions [{skill, subskill, cognitiveType, difficulty, weight, isCorrect}]
 * @param {{ cfg?: object }} opts
 * @returns {object} { dimensions, accuracy, evidenceCount, overallConfidence }
 */
function build(answeredQuestions, { cfg } = {}) {
    const ev = cfg?.thresholds?.evidence || { minForJudgment: 2, highConfidenceAt: 3 };
    const min = Math.max(1, Number(ev.minForJudgment) || 2);
    const highAt = Number(ev.highConfidenceAt) || 3;
    const questions = (answeredQuestions || []).filter((q) => q && typeof q.isCorrect === "boolean");

    const totalWeight = questions.reduce((s, q) => s + (Number(q.weight) || 1), 0);
    const correctWeight = questions.reduce((s, q) => s + ((Number(q.weight) || 1) * (q.isCorrect ? 1 : 0)), 0);
    const accuracy = totalWeight ? Math.round((correctWeight / totalWeight) * 100) : 0;

    const dimensions = {};
    let dimensionTotals = {};

    const confidenceFor = (n) => dnaConfig.CONFIDENCE_BY_EVIDENCE(n);

    for (const dim of DIMENSION_ORDER.filter((d) => d !== "accuracy")) {
        const dimQs = questions.filter((q) => dnaConfig.COGNITIVE_TO_DIMENSION[q.cognitiveType] === dim);
        const w = dimQs.reduce((s, q) => s + (Number(q.weight) || 1), 0);
        const cw = dimQs.reduce((s, q) => s + ((Number(q.weight) || 1) * (q.isCorrect ? 1 : 0)), 0);
        const score = w ? Math.round((cw / w) * 100) : null;
        dimensions[dim] = {
            score: score === null ? null : score,
            evidenceCount: dimQs.length,
            confidence: confidenceFor(dimQs.length),
        };
        dimensionTotals[dim] = { score, evidenceCount: dimQs.length };
    }

    // accuracy dimension (evidence = all questions)
    dimensions.accuracy = {
        score: accuracy,
        evidenceCount: questions.length,
        confidence: confidenceFor(questions.length),
    };

    // consistency = how evenly performance holds across dimensions.
    // 100 − average absolute deviation from accuracy (only for evidenced dims).
    const evidenced = DIMENSION_ORDER.filter((d) => dimensions[d] && dimensions[d].score !== null && dimensions[d].evidenceCount > 0 && d !== "accuracy");
    let consistency = null;
    if (evidenced.length && questions.length >= min) {
        const dev = evidenced.reduce((s, d) => s + Math.abs(dimensions[d].score - accuracy), 0) / evidenced.length;
        consistency = Math.max(0, Math.round(100 - dev));
    }
    dimensions.consistency = { score: consistency, evidenceCount: evidenced.length, confidence: confidenceFor(evidenced.length) };

    const overallConfidence = confidenceFor(questions.length);

    return {
        dimensions,
        accuracy,
        evidenceCount: questions.length,
        overallConfidence,
        // splitter for gap detection:
        byType: dimensionTotals,
    };
}

module.exports = { build };