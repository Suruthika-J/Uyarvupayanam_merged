// backend/services/skillDependencyEngine.js
//
// Part 8 + Part 9 — Skill Dependency Graph + Skill Unlock System.
// Prerequisites are checked BEFORE a subskill can be considered "ready to
// advance": even a strong advanced score does NOT unlock a subskill whose
// prerequisites have insufficient/wrong evidence (Part 30 Profile H).
"use strict";

const READY_STATUSES = new Set(["ready", "advanced"]);

/**
 * Normalize dependency rows into a lookup: skill → subskill → prerequisites.
 */
function normalizeDeps(deps) {
    const map = {};
    for (const d of deps || []) {
        (map[d.skill] = map[d.skill] || {})[d.subskill] = (d.prerequisites || []).filter(Boolean);
    }
    return map;
}

/**
 * Evaluate lock/unlock state for every dependency node given the diagnosed
 * subskill profiles.
 * @param {Array} profiles subskill diagnoses
 * @param {Array} deps dependency rows [{grade, skill, subskill, prerequisites}]
 * @returns {{ lockedSkills: Array, unlockedSkills: Array, chain: Map }}
 */
function evaluate(profiles, deps) {
    const map = normalizeDeps(deps);
    const statusOf = new Map();
    for (const p of profiles || []) statusOf.set(`${p.skill}::${p.subskill}`, p.status);

    const lockedSkills = [];
    const unlockedSkills = [];
    const chain = new Map();

    for (const skill of Object.keys(map)) {
        for (const subskill of Object.keys(map[skill])) {
            const prereqs = map[skill][subskill];
            if (!prereqs.length) continue; // roots are always available
            const missing = [];
            for (const pr of prereqs) {
                const st = statusOf.get(`${skill}::${pr}`);
                if (!READY_STATUSES.has(st)) missing.push(pr);
            }
            if (missing.length) {
                lockedSkills.push({
                    skill,
                    subskill,
                    reason: `Requires ${missing.join(", ")} to be ready first`,
                    missingPrerequisites: missing,
                });
            } else {
                unlockedSkills.push({ skill, subskill });
            }
            if (prereqs.length) chain.set(`${skill}::${subskill}`, prereqs);
        }
    }

    return { lockedSkills, unlockedSkills, chain, map };
}

/**
 * Build the ordered learning-path chain for one subskill: walk prerequisites
 * from the root(s) down to the target (Part 16).
 * @returns {Array<{skill, subskill, milestone}>}
 */
function buildPath(skill, subskill, deps, profiles) {
    const map = normalizeDeps(deps);
    const visited = new Set();
    const order = [];

    // upstream walk: collect prerequisite chain recursively
    const collect = (s, sub) => {
        const key = `${s}::${sub}`;
        if (visited.has(key)) return;
        visited.add(key);
        const prereqs = map[s]?.[sub] || [];
        for (const pr of prereqs) collect(s, pr);
        order.push({ skill: s, subskill: sub });
    };
    collect(skill, subskill);

    const statusOf = new Map();
    for (const p of profiles || []) statusOf.set(`${p.skill}::${p.subskill}`, p.status);

    return order.map((n, i) => ({
        step: i + 1,
        skill: n.skill,
        subskill: n.subskill,
        milestone: milestoneFor(n.subskill, prereqStatus(n.skill, n.subskill, map, statusOf), i === order.length - 1),
    }));
}

function prereqStatus(skill, subskill, map, statusOf) {
    return statusOf.get(`${skill}::${subskill}`) || "advanced"; // placeholders for non-assessed roots
}

function milestoneFor(sub, prereqStatus, isTarget) {
    if (isTarget) return `Master ${sub} to unlock the next step`;
    if (READY_STATUSES.has(prereqStatus)) return `Reinforce ${sub} (already ready)`;
    return `Build ${sub} fundamentals`;
}

module.exports = { evaluate, buildPath, normalizeDeps, READY_STATUSES };