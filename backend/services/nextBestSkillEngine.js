// backend/services/nextBestSkillEngine.js
//
// Learning DNA → Skill Diagnosis → Gap Detection → Dependency Check
//                                                     ↓
//                                          NEXT BEST SKILL (this engine)
//
// This is THE deterministic decision engine of LD-NBSE. It decides what the
// student should learn next and WHY, using:
//   nextBestSkillScore = skillGap*0.35 + prerequisiteImportance*0.25
//                      + cognitiveGap*0.20 + interestAlignment*0.10
//                      + recentProgress*0.10
// Weights are configurable (cfg.weights) and never shared with the client.
"use strict";

const dependencyEngine = require("./skillDependencyEngine");
const interestEngine = require("./interestProfileEngine");
const explanationService = require("./recommendationExplanationService");

const PKEY = (skill, sub) => `${skill}::${sub}`;

/**
 * Decide the next best skill for a student.
 * @param {object} input {
 *   grade, profiles, dna, gaps, interests, progress, deps,
 *   cfg, mode, allAnsweredCount, assessedSubskills
 * }
 */
function decide(input) {
    const { grade, profiles, dna, gaps = [], interests = {}, progress = [], deps = [], cfg = {} } = input;
    const weights = cfg.weights || { skillGap: 0.35, prerequisiteImportance: 0.25, cognitiveGap: 0.2, interestAlignment: 0.1, recentProgress: 0.1 };
    const successTarget = cfg.thresholds?.successTarget ?? 70;

    const profileByKey = new Map((profiles || []).map((p) => [PKEY(p.skill, p.subskill), p]));
    const progressByKey = new Map((progress || []).map((p) => [PKEY(p.skill, p.subskill), p]));

    // ── dependency graph (downstream counts for prerequisite importance) ──
    const depsMap = dependencyEngine.normalizeDeps(deps);
    const downstream = new Map(); // key -> number of nodes that depend on it
    for (const skill of Object.keys(depsMap)) {
        for (const sub of Object.keys(depsMap[skill])) {
            const walk = (s, sub2, seen) => {
                const key = PKEY(s, sub2);
                if (seen.has(key)) return;
                seen.add(key);
                for (const pr of depsMap[s]?.[sub2] || []) {
                    const pk = PKEY(s, pr);
                    downstream.set(pk, (downstream.get(pk) || 0) + 1);
                    walk(s, pr, seen);
                }
            };
            walk(skill, sub, new Set());
        }
    }

    // ── candidate set ──
    // 1) weak subskills (foundation/developing) with enough evidence
    // 2) blocking prerequisites of weak subskills (prerequisite candidates)
    const candidates = [];
    const blockingPrereq = new Map(); // key -> true when it blocks a weak subskill

    for (const p of profiles || []) {
        if ((p.status === "foundation" || p.status === "developing") && p.attemptedCount >= 1) {
            candidates.push({ kind: "weak", profile: p, reasonCode: p.status === "foundation" ? "foundation_gap" : "skill_gap" });
        }
        // blocking prereqs of weak subskills
        if (p.status === "foundation" || p.status === "developing") {
            const prereqs = depsMap[p.skill]?.[p.subskill] || [];
            for (const pr of prereqs) {
                const prProfile = profileByKey.get(PKEY(p.skill, pr));
                if (prProfile && (prProfile.status === "foundation" || prProfile.status === "insufficient_evidence")) {
                    blockingPrereq.set(PKEY(p.skill, pr), true);
                    if (!candidates.some((c) => c.profile.subskill === pr && c.profile.skill === p.skill)) {
                        candidates.push({ kind: "prereq", profile: prProfile, reasonCode: "prerequisite_gap", blockedBy: p.subskill });
                    }
                }
            }
        }
    }

    // ── score every candidate ──
    for (const c of candidates) {
        const p = c.profile;
        const key = PKEY(p.skill, p.subskill);

        const skillGap = (100 - (p.weightedScore || 0)) / 100;
        const downstreamCount = downstream.get(key) || 0;
        const isBlocking = blockingPrereq.has(key);
        const prerequisiteImportance = Math.min(1, downstreamCount * 0.5 + (isBlocking ? 0.5 : 0));

        // cognitiveGap: 1 when the candidate is flagged by a detected gap
        let cognitiveGap = 0;
        for (const g of gaps || []) {
            if ((g.relatedSkills || []).some((r) => String(r).split("·")[0].trim() === p.skill && r.includes(p.subskill))) {
                cognitiveGap = 1;
                break;
            }
        }
        const interestAlignment = interestEngine.interestScoreForSkill(p.skill, interests);
        const prog = progressByKey.get(key);
        const recentProgress = prog ? ({ improving: 1, stable: 0.6, declining: 0.8, mastered: 0.2, insufficient_data: 0.5 }[prog.classification] ?? 0.5) : 0.5;

        c.score =
            skillGap * weights.skillGap +
            prerequisiteImportance * weights.prerequisiteImportance +
            cognitiveGap * weights.cognitiveGap +
            interestAlignment * weights.interestAlignment +
            recentProgress * weights.recentProgress;
        c.components = { skillGap, prerequisiteImportance, cognitiveGap, interestAlignment, recentProgress };
        c.downstreamCount = downstreamCount;
    }

    // ── pick winner (deterministic tie-breaks) ──
    let chosen = null;
    if (candidates.length) {
        candidates.sort(
            (a, b) =>
                b.score - a.score ||
                (a.profile.weightedScore || 0) - (b.profile.weightedScore || 0) ||
                PKEY(a.profile.skill, a.profile.subskill).localeCompare(PKEY(b.profile.skill, b.profile.subskill))
        );
        chosen = candidates[0];
    }

    // ── build the recommendation ──
    const allProfiles = profiles || [];
    const strongest = [...allProfiles].sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0));
    const strengthsToMaintain = strongest
        .filter((p) => p.status === "advanced" || p.status === "ready")
        .slice(0, 3)
        .map((p) => ({ skill: p.skill, subskill: p.subskill, currentScore: p.weightedScore }));

    let recommendationType;
    let primaryFocus;
    let secondaryFocus = [];
    let explanation;

    if (!chosen) {
        const anyInsufficientOnly = profiles.length > 0 && profiles.every((p) => p.status === "insufficient_evidence");
        if (anyInsufficientOnly) {
            // Part 28: never over-claim — with too little evidence we ask for a
            // short targeted reassessment instead of recommending a skill.
            recommendationType = "DEVELOPMENT";
            const base = [...profiles].sort((a, b) => b.attemptedCount - a.attemptedCount)[0] || { skill: "Mathematics", subskill: "general", weightedScore: 0, status: "insufficient_evidence", confidence: "low" };
            primaryFocus = {
                skill: base.skill,
                subskill: base.subskill,
                currentScore: base.weightedScore || 0,
                currentStatus: base.status,
                targetStatus: "ready",
                reason: "There is not enough evidence yet to recommend your next best skill confidently. One short focused practice set will let us diagnose accurately.",
                reasonCode: "insufficient_evidence",
                prerequisite: "",
                recommendedDifficulty: "easy",
                estimatedEffort: "one short practice session, then reassess",
                successCondition: `Complete a {rate}%+ targeted practice set so we can set your next goal.`.replace("{rate}", successTarget),
                confidence: "low",
            };
        } else {
            // Everything strong enough → EXPLORATION (Part 13 type 4).
            recommendationType = "EXPLORATION";
            const base = strongest[0] || { skill: "Mathematics", subskill: "exploration", weightedScore: 0, status: "advanced" };
            const topInterest = Object.entries(interests).sort((a, b) => b[1] - a[1])[0];
            primaryFocus = {
                skill: base.skill,
                subskill: base.subskill,
                currentScore: base.weightedScore || 0,
                currentStatus: base.status,
                targetStatus: "advanced",
                reason: `Your core skills are strong${topInterest && topInterest[1] >= 60 ? `, and you show real interest in ${topInterest[0]}` : ""} — the next step is to explore challenging, interest-linked problems rather than repeat basics.`,
                reasonCode: "exploration",
                prerequisite: "",
                recommendedDifficulty: "hard",
                estimatedEffort: "challenge-level tasks weekly",
                successCondition: `Complete an exploration project mapped to ${topInterest ? topInterest[0] : "your interests"} and score ${successTarget}%+ on a practice set.`,
                confidence: allProfiles.length ? "medium" : "low",
            };
        }
        explanation = explanationService.buildExplanation({ recommendationType, primaryFocus, profiles: allProfiles });
    } else {
        const p = chosen.profile;
        const type = chosen.kind === "prereq" || p.status === "foundation"
            ? "FOUNDATION"
            : p.status === "ready" ? "ADVANCEMENT" : "DEVELOPMENT";

        recommendationType = type;
        const effortRow = cfg.effortByStatus?.[p.status];
        const targetStatus = p.status === "foundation" ? "ready" : p.status === "ready" ? "advanced" : "ready";
        primaryFocus = {
            skill: p.skill,
            subskill: p.subskill,
            currentScore: p.weightedScore || 0,
            currentStatus: p.status,
            targetStatus,
            reason: explanationService.reasonSentence(chosen, {
                profile: p,
                grade,
                gaps,
                successTarget,
            }),
            reasonCode: chosen.reasonCode,
            prerequisite: (depsMap[p.skill]?.[p.subskill] || []).join(", "),
            recommendedDifficulty: effortRow?.difficulty || "medium",
            estimatedEffort: effortRow?.effort || "15 minutes daily",
            successCondition: (cfg.successMessages?.[p.status] || "Reach {target}% on the next targeted assessment.").replace("{target}", successTarget),
            confidence: p.confidence,
        };

        const decision = {
            selectedSkill: p.skill,
            selectedSubskill: p.subskill,
            reasonCode: chosen.reasonCode,
            currentScore: p.weightedScore || 0,
            targetScore: successTarget,
            scoresByFactor: chosen.components,
            weightsUsed: weights,
            tieBreakNote: `Scored ${chosen.score.toFixed(3)} across ${candidates.length} candidate(s)`,
        };
        explanation = explanationService.buildExplanation({ recommendationType, primaryFocus, decision, profiles: allProfiles, gaps });

        // secondaryFocus: next 2 distinct candidates
        const seen = new Set([PKEY(p.skill, p.subskill)]);
        for (const c of candidates.slice(1)) {
            const k = PKEY(c.profile.skill, c.profile.subskill);
            if (seen.has(k)) continue;
            seen.add(k);
            const cp = c.profile;
            const ce = cfg.effortByStatus?.[cp.status];
            secondaryFocus.push({
                skill: cp.skill,
                subskill: cp.subskill,
                currentScore: cp.weightedScore || 0,
                currentStatus: cp.status,
                targetStatus: cp.status === "ready" ? "advanced" : "ready",
                reason: explanationService.reasonSentence(c, { profile: cp, grade, gaps, successTarget }),
                recommendedDifficulty: ce?.difficulty || "medium",
                confidence: cp.confidence,
            });
            if (secondaryFocus.length === 2) break;
        }
    }

    // ── locks / unlocks + learning path ──
    const lockState = dependencyEngine.evaluate(profiles, deps);
    const learningPath = dependencyEngine.buildPath(primaryFocus.skill, primaryFocus.subskill, deps, profiles);

    return {
        recommendationType,
        primaryFocus,
        secondaryFocus,
        strengthsToMaintain,
        detectedGaps: gaps,
        lockedSkills: lockState.lockedSkills,
        unlockedSkills: lockState.unlockedSkills,
        learningPath,
        areasToExplore: interestEngine.areasToExplore(interests, profiles),
        progress: progress || [],
        explanation,
        evidence: {
            questionCount: input.allAnsweredCount || 0,
            assessedSubskills: input.assessedSubskills || [],
        },
        confidence: primaryFocus.confidence,
    };
}

module.exports = { decide };