// backend/services/interestProfileEngine.js
//
// Part 10 — Interest Profile. Interest is measured SEPARATELY from ability.
// A high interest in technology with low mathematics ability never blocks
// technology exploration — interest only influences exploration and priority.
"use strict";

const taxonomy = require("../config/ldnbs/skillTaxonomyConfig");

const LEGACY_INTEREST_MAP = {
    "Software / IT": { technology: 75, mathematics: 60 },
    "Doctor / Healthcare": { science: 80 },
    Engineer: { technology: 70, mathematics: 65 },
    "Business / Finance": { business: 80, mathematics: 60 },
    "Government Sector": { social: 70 },
    "Teacher / Professor": { communication: 70 },
    Lawyer: { communication: 70, social: 55 },
    Designer: { design: 80, creative: 70 },
    Agriculture: { science: 70, social: 55 },
    Research: { science: 70, mathematics: 55 },
    Entrepreneurship: { business: 75, creative: 60 },
};

const CATEGORIES = taxonomy.INTEREST_CATEGORIES;

/**
 * Compute interest profile (0–100 per category) from the mini interest
 * assessment answers + legacy onboarding fields.
 * @param {Array} interestAnswers [{questionId, option|selected}]
 * @param {object} legacy { careerInterest, preferredCourseCategory, preferredStream, stream }
 * @returns {{ interests: object, source: string }}
 */
function compute(interestAnswers, legacy = {}) {
    const interests = {};
    for (const c of CATEGORIES) {
        interests[c] = 50; // neutral default
    }

    const answers = (interestAnswers || []).filter(
        (a) => a && a.questionId && (a.option || a.selected)
    );

    if (answers.length) {
        const hitCount = {};
        for (const c of CATEGORIES) hitCount[c] = 0;
        for (const q of taxonomy.INTEREST_BANK) {
            const answer = answers.find((a) => String(a.questionId) === q.questionId);
            if (!answer || !q.options) continue;
            const selectedText = String(answer.option || answer.selected).trim().toLowerCase();
            const optionRow = q.options.find((o) => o.option.trim().toLowerCase() === selectedText);
            if (!optionRow) continue;
            for (const c of optionRow.categories) hitCount[c] += 1;
        }
        for (const c of CATEGORIES) {
            // exposure across the answered questions that could have offered this category
            const possible = taxonomy.INTEREST_BANK.filter((q) =>
                answers.some((a) => String(a.questionId) === q.questionId) && q.options.some((o) => o.categories.includes(c))
            ).length;
            interests[c] = possible ? Math.round((hitCount[c] / possible) * 100) : 50;
        }
        return { interests, source: "onboarding" };
    }

    // No interest answers → derive from legacy onboarding preferences (weak signal).
    const src = legacy.careerInterest || legacy.preferredCourseCategory || legacy.preferredStream || legacy.stream;
    let any = false;
    for (const [key, map] of Object.entries(LEGACY_INTEREST_MAP)) {
        if (String(legacy.careerInterest || "").toLowerCase().includes(key.toLowerCase())) {
            for (const [c, v] of Object.entries(map)) interests[c] = Math.max(interests[c], v);
            any = true;
        }
    }
    if (legacy.preferredCourseCategory && ["Computer / IT", "Engineering"].includes(legacy.preferredCourseCategory)) {
        interests.technology = Math.max(interests.technology, 65);
        interests.mathematics = Math.max(interests.mathematics, 55);
        any = true;
    }
    if (legacy.preferredCourseCategory === "Medical") { interests.science = Math.max(interests.science, 75); any = true; }
    if (legacy.stream && String(legacy.stream).includes("Commerce")) { interests.business = Math.max(interests.business, 70); any = true; }
    if (!any) return { interests, source: "neutral" };
    return { interests, source: "legacy" };
}

// Align an interest category value (0–100) with a skill domain (for the NBSE
// interestAlignment score). Returns 0..1.
function interestScoreForSkill(skill, interests) {
    const cats = taxonomy.SKILL_TO_INTEREST[skill] || [];
    if (!cats.length) return 0.5;
    const vals = cats.map((c) => (interests[c] ?? 50) / 100);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// "Areas to explore" (Part 22): exploratory, never deterministic/eligibility.
function areasToExplore(interests, profiles) {
    const areas = [];
    const cat = Object.entries(interests || {}).sort((a, b) => b[1] - a[1]);
    const strongSkills = (profiles || []).filter((p) => p.status === "advanced" || p.status === "ready").map((p) => p.skill);
    const top = cat[0];
    if (top && top[1] >= 60) {
        const skillHint = strongSkills[0];
        const map = {
            technology: "technology and logic-based problem solving",
            science: "science experiments and inquiry projects",
            mathematics: "mathematics and puzzle-based exploration",
            creative: "creative writing, art and storytelling",
            design: "design thinking and visual projects",
            communication: "public speaking, debate and communication clubs",
            business: "simple business and money-management projects",
            social: "community projects and social problem solving",
        };
        areas.push(
            `Explore ${map[top[0]] || top[0]}${skillHint ? ` — pairs well with your strength in ${skillHint}` : ""}.`
        );
    }
    if (cat[1] && cat[1][1] >= 60) {
        const map2 = { technology: "technology", science: "science", mathematics: "mathematics", creative: "creative", design: "design", communication: "communication", business: "business", social: "social" };
        areas.push(`You also showed interest in ${map2[cat[1][0]] || cat[1][0]} — try one short project there to see if you enjoy it.`);
    }
    if (!areas.length) areas.push("Keep exploring a mix of subjects to discover what you enjoy most.");
    return areas.slice(0, 4);
}

module.exports = { compute, interestScoreForSkill, areasToExplore, LEGACY_INTEREST_MAP };