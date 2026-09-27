// backend/services/recommendationExplanationService.js
//
// Part 14/15/26 — Explanation Generation. Builds the student-facing "why"
// from the FINAL decision + assessment evidence. This service never changes a
// decision; a Groq wrapper could paraphrase the output later without altering
// the underlying recommendation.
"use strict";

const STATUS_LABEL = { foundation: "still building", developing: "developing", ready: "ready to advance", advanced: "strong" };

/**
 * A specific, evidence-backed "why this skill" sentence.
 * @param {object} candidate { kind, reasonCode, blockedBy, profile }
 * @param {object} ctx { profile, grade, gaps, successTarget }
 */
function reasonSentence(candidate, ctx = {}) {
    const p = candidate?.profile || ctx.profile || {};
    const skillLabel = p.skill || "";
    const sub = p.subskill || "";
    const code = candidate?.reasonCode || "skill_gap";
    const gaps = ctx.gaps || [];

    const skillCap = skillLabel === "Logical Thinking" ? "Logical Thinking" : skillLabel;
    const gap = gaps.find((g) => (g.relatedSkills || []).some((r) => r.includes(sub)));
    const gapPhrase = gap ? ` This is part of the detected ${gap.label.toLowerCase()}.` : "";

    const difficultyHint = difficultyEvidence(p);

    switch (code) {
        case "prerequisite_gap":
            return `Work on ${sub} first — ${candidate.blockedBy || `${p.skill} application`} cannot progress until ${sub} is ready.${difficultyHint}${gapPhrase}`;
        case "foundation_gap":
            return `${sub} fundamentals in ${skillCap} are below where they need to be.${difficultyHint} Master this before moving to harder ${skillCap.toLowerCase()} problems.${gapPhrase}`;
        case "skill_gap":
            return `${sub} is ${STATUS_LABEL[p.status] || "developing"} in ${skillCap}.${difficultyHint} Strengthening it will unlock the next level of ${skillCap.toLowerCase()}.${gapPhrase}`;
        case "exploration":
            return `Your core skills are strong — the next challenge is interest-linked exploration, not repeating basics.`;
        default:
            return `Focus on ${sub} because it is ${STATUS_LABEL[p.status] || "currently developing"} in ${skillCap}.${difficultyHint}`;
    }
}

function difficultyEvidence(p) {
    const d = p.difficultyPerformance;
    if (!d) return "";
    if (d.easy !== null && d.medium !== null && d.easy - d.medium >= 20) {
        return ` You handle easy items well, but performance drops sharply on medium-difficulty ones.`;
    }
    if (d.easy !== null && d.hard !== null && d.easy - d.hard >= 30) {
        return ` You are steady on easy items but struggle on harder ones.`;
    }
    return "";
}

/**
 * Build { summary, decision } for the recommendation payload.
 */
function buildExplanation({ recommendationType, primaryFocus, decision, profiles, gaps }) {
    const summaryParts = [];
    if (primaryFocus?.reason) {
        summaryParts.push(
            recommendationType === "EXPLORATION"
                ? `Next step: ${primaryFocus.reason}`
                : `Next best skill: ${primaryFocus.subskill} in ${primaryFocus.skill}. ${primaryFocus.reason}`
        );
    }
    if (profiles && profiles.length) {
        summaryParts.push(`Your strongest areas: ${profiles.filter((p) => p.status === "advanced" || p.status === "ready").slice(0, 3).map((p) => p.subskill).join(", ") || "being confirmed"}.`);
    }
    return {
        summary: summaryParts.join(" "),
        decision: decision || null,
    };
}

module.exports = { reasonSentence, buildExplanation, difficultyEvidence };