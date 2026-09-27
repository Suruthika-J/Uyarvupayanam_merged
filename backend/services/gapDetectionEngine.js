// backend/services/gapDetectionEngine.js
//
// Part 7 — Cognitive Gap Detection. Identifies HOW the student struggles
// (application vs understanding, reasoning vs recall, transfer from easy to
// hard, expression vs comprehension). Gaps are only emitted when the weak side
// has sufficient evidence — otherwise nothing confident is claimed.
"use strict";

/**
 * Detect cognitive gaps from DNA dimensions + subskill profiles.
 * @param {{ dimensions: object, accuracy: number }} dna
 * @param {Array} profiles subskill profile rows
 * @param {{ cfg?: object }} opts
 * @returns {Array<{type,label,relatedSkills,severity,description}>}
 */
function detect({ dna, profiles }, { cfg } = {}) {
    const transferMin = cfg?.thresholds?.transfer?.easyHardGapMin ?? 30;
    const dimGapMin = cfg?.thresholds?.transfer?.dimensionGapMin ?? 25;
    const ev = cfg?.thresholds?.evidence || { minForJudgment: 2 };
    const min = Math.max(1, Number(ev.minForJudgment) || 2);

    const dim = dna?.dimensions || {};
    const gaps = [];

    const dimScore = (name) => (dim[name] && typeof dim[name].score === "number" ? dim[name].score : null);
    const dimEv = (name) => (dim[name] ? dim[name].evidenceCount || 0 : 0);
    const strong = (name) => {
        const s = dimScore(name);
        return s !== null && s >= 60;
    };

    // Weak dimension → the cognitiveType(s) that evidence it inside a subskill.
    const DIM_TO_TYPE = {
        application: ["application"],
        reasoning: ["reasoning"],
        communication: ["communication"],
        understanding: ["recall", "understanding"],
    };

    const addGap = (type, weakDim, strongDims, delta) => {
        if (weakDim !== "transfer" && dimEv(weakDim) < min) return; // never emit with insufficient evidence
        const severity = delta >= 40 ? "high" : delta >= dimGapMin ? "medium" : "low";
        const related = [];
        const types = DIM_TO_TYPE[weakDim];
        if (weakDim === "transfer") {
            // transfer gap: subskills whose easy% is strong but hard% collapses
            for (const p of profiles || []) {
                if (p.attemptedCount >= min && p.difficultyPerformance?.easy !== null && p.difficultyPerformance?.hard !== null) {
                    const spread = p.difficultyPerformance.easy - p.difficultyPerformance.hard;
                    if (p.difficultyPerformance.easy >= 70 && spread >= transferMin) {
                        related.push(`${p.skill} · ${p.subskill}`);
                    }
                }
            }
        } else if (types) {
            // attribute the gap to subskills whose performance in that cognitive
            // dimension collapsed (drives the Next Best Skill cognitiveGap factor)
            for (const p of profiles || []) {
                if (p.attemptedCount < min) continue;
                const bad = types.some((t) => p.cognitivePerformance && typeof p.cognitivePerformance[t] === "number" && p.cognitivePerformance[t] < 40);
                if (bad) related.push(`${p.skill} · ${p.subskill}`);
            }
        }
        const label = { application_gap: "Application Gap", reasoning_gap: "Reasoning Gap", transfer_gap: "Transfer Gap", expression_gap: "Expression Gap" }[type];
        gaps.push({
            type,
            label,
            relatedSkills: [...new Set(related)].slice(0, 6),
            severity,
            description: describeGap(type, strongDims, weakDim, delta),
        });
    };

    // application_gap: understanding strong, application weak
    if (strong("understanding") && dimScore("application") !== null) {
        const delta = dimScore("understanding") - dimScore("application");
        if (delta >= dimGapMin || dimScore("application") < 40) addGap("application_gap", "application", ["understanding"], Math.max(delta, 40 - dimScore("application")));
    }
    // reasoning_gap: recall/understanding strong, reasoning weak
    if ((strong("understanding")) && dimScore("reasoning") !== null) {
        const delta = dimScore("understanding") - dimScore("reasoning");
        if (delta >= dimGapMin || dimScore("reasoning") < 40) addGap("reasoning_gap", "reasoning", ["understanding"], Math.max(delta, 40 - dimScore("reasoning")));
    }
    // transfer_gap: easy strong but hard collapses
    if (dna && dna.evidenceCount >= min) {
        let maxSpread = -1;
        for (const p of profiles || []) {
            if (p.attemptedCount >= min && p.difficultyPerformance?.easy !== null && p.difficultyPerformance?.hard !== null) {
                const spread = p.difficultyPerformance.easy - p.difficultyPerformance.hard;
                if (p.difficultyPerformance.easy >= 70 && spread >= transferMin && spread > maxSpread) maxSpread = spread;
            }
        }
        if (maxSpread >= transferMin) addGap("transfer_gap", "transfer", ["easy"], maxSpread);
    }
    // expression_gap: reasoning/pattern strong, communication weak
    if ((strong("reasoning") || strong("patternRecognition")) && dimScore("communication") !== null) {
        const base = Math.max(dimScore("reasoning") || 0, dimScore("patternRecognition") || 0);
        const delta = base - dimScore("communication");
        if (delta >= dimGapMin || dimScore("communication") < 40) addGap("expression_gap", "communication", ["reasoning", "patternRecognition"], Math.max(delta, 40 - dimScore("communication")));
    }

    return gaps.sort((a, b) => (a.severity === "high" ? -1 : 0) - (b.severity === "high" ? -1 : 0));
}

function describeGap(type, strongDims, weakDim, delta) {
    const weakLabel = weakDim === "transfer" ? "advanced application" : weakDim === "application" ? "application" : weakDim;
    const maps = {
        application_gap: `Understanding is strong but applying that understanding to new problems is much weaker (${delta} points behind).`,
        reasoning_gap: `Recall and basic understanding are solid, but reasoning with the information is weaker (${delta} points behind).`,
        transfer_gap: `Performance drops sharply when questions move from easy to hard — knowledge does not yet transfer to harder problems.`,
        expression_gap: `Thinking is strong but expressing and communicating those ideas is weaker (${delta} points behind).`,
    };
    return maps[type] || `${weakLabel} performance needs attention.`;
}

module.exports = { detect };