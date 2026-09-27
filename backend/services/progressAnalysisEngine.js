// backend/services/progressAnalysisEngine.js
//
// Part 18 — Progress Analysis. Tracks subskill change over time and classifies
// progress (improving / stable / declining / mastered) ONLY when prior evidence
// exists — a first assessment yields "insufficient_data".
"use strict";

/**
 * Classify progress for each diagnosed subskill against prior history.
 * @param {Array} profiles current subskill diagnoses
 * @param {Array} history prior SkillProgressHistory rows (excluding the current cycle)
 * @param {{ cfg?: object }} opts
 * @returns {Array<{skill, subskill, previousScore, currentScore, change, classification}>}
 */
function analyze(profiles, history, { cfg } = {}) {
    const imp = cfg?.thresholds?.progress?.improveBy ?? 10;
    const dec = cfg?.thresholds?.progress?.declineBy ?? -10;
    const st = cfg?.thresholds?.status?.default || { readyUnder: 70, advancedAt: 85 };

    const latestByKey = new Map();
    for (const h of history || []) {
        const key = `${h.skill}::${h.subskill}`;
        if (!latestByKey.has(key)) latestByKey.set(key, h);
    }

    const out = [];
    for (const p of profiles || []) {
        const prev = latestByKey.get(`${p.skill}::${p.subskill}`);
        if (!prev || typeof prev.score !== "number") {
            out.push({ skill: p.skill, subskill: p.subskill, previousScore: null, currentScore: p.weightedScore, change: null, classification: "insufficient_data" });
            continue;
        }
        const change = Math.round((p.weightedScore - prev.score) * 10) / 10;
        let classification;
        if (change >= imp) classification = "improving";
        else if (change <= dec) classification = "declining";
        else if (p.status === "advanced" && prev.score >= (st.readyUnder || 70)) classification = "mastered";
        else classification = "stable";
        out.push({ skill: p.skill, subskill: p.subskill, previousScore: prev.score, currentScore: p.weightedScore, change, classification });
    }
    return out;
}

module.exports = { analyze };