// backend/services/skillGameService.js
//
// Authoritative server-side grading for the Class 8 Skill Adventure. The
// browser never tells the server whether an answer is right: it sends the raw
// selection and THIS module grades it against the catalog answer key.
//
// Scoring: weighted percent over the deterministic tasks of an attempt
// (choice/pattern/order/sort/match/decode). Open practice tasks (speak/create)
// carry no accuracy signal — they are participation evidence only, so mastery
// can never be claimed from completing them alone.

"use strict";

const { tasksForLevel, weightForTask, UNLOCK_SCORE } = require("../config/class8SkillsCatalog");

// ── sanitizers: malformed input never reaches the answer key ────────────────
function sanitizeChoice(val, optionCount) {
    const n = parseInt(val, 10);
    if (!Number.isInteger(n) || n < 0 || n >= optionCount) return null;
    return n;
}

function sanitizeIds(val, allowedIds) {
    if (!Array.isArray(val)) return null;
    const list = val.map((v) => String(v));
    if (!list.length || list.length !== allowedIds.length) return null;
    if (new Set(list).size !== list.length) return null;
    if (list.some((v) => !allowedIds.includes(v))) return null;
    return list;
}

function sanitizeSort(val, itemIds, bucketIds) {
    if (!val || typeof val !== "object" || Array.isArray(val)) return null;
    const out = {};
    for (const id of itemIds) {
        const b = String(val[id] ?? "");
        if (!bucketIds.includes(b)) return null;
        out[id] = b;
    }
    return out;
}

function sanitizeMatch(val, leftIds, rightIds) {
    if (!Array.isArray(val)) return null;
    const out = {};
    for (const entry of val) {
        if (!entry || typeof entry !== "object") return null;
        const aId = String(entry.aId || "");
        const bId = String(entry.bId || "");
        if (!leftIds.includes(aId) || !rightIds.includes(bId)) return null;
        if (out[aId] !== undefined) return null; // duplicate left item
        out[aId] = bId;
    }
    return out;
}

// ── grading ─────────────────────────────────────────────────────────────────
// Returns { valid, correct, score(0–1), cleaned }.
function gradeTask(task, given) {
    switch (task.type) {
        case "choice":
        case "pattern":
        case "decode": {
            const cleaned = sanitizeChoice(given, task.options ? task.options.length : 0);
            if (cleaned === null) return { valid: false };
            const correct = cleaned === task.answerIndex;
            return { valid: true, correct, score: correct ? 1 : 0, cleaned };
        }
        case "order": {
            const ids = task.steps.map((s) => s.id);
            const cleaned = sanitizeIds(given, ids);
            if (!cleaned) return { valid: false };
            const expected = task.steps.map((s) => s.id).join("|");
            const got = cleaned.join("|");
            const correct = got === expected;
            const score = correct ? 1 : ids.reduce((acc, id, i) => acc + (cleaned[i] === id ? 1 : 0), 0) / ids.length;
            return { valid: true, correct, score, cleaned };
        }
        case "sort": {
            const itemIds = task.items.map((it) => it.id);
            const bucketIds = task.buckets.map((b) => b.id);
            const cleaned = sanitizeSort(given, itemIds, bucketIds);
            if (!cleaned) return { valid: false };
            let correctItems = 0;
            for (const it of task.items) {
                if (cleaned[it.id] === task.buckets[it.bucket].id) correctItems += 1;
            }
            const score = itemIds.length ? correctItems / itemIds.length : 0;
            return { valid: true, correct: score === 1, score, cleaned };
        }
        case "match": {
            const leftIds = task.pairs.map((p) => p.a.id);
            const rightIds = task.pairs.map((p) => p.b.id);
            const cleaned = sanitizeMatch(given, leftIds, rightIds);
            if (!cleaned) return { valid: false };
            let correctPairs = 0;
            for (const pr of task.pairs) {
                if (cleaned[pr.a.id] === pr.b.id) correctPairs += 1;
            }
            const score = task.pairs.length ? correctPairs / task.pairs.length : 0;
            return { valid: true, correct: score === 1, score, cleaned };
        }
        default:
            return { valid: false };
    }
}

// Deterministic mechanics only (speak/create are practice).
const DETERMINISTIC = new Set(["choice", "pattern", "order", "sort", "match", "decode"]);

function isDeterministic(task) {
    return DETERMINISTIC.has(task.type);
}

// Evidence weight for a task — hint usage reduces the weight (independence
// matters) but never flips correctness.
function evidenceWeight(activity, level, sliceIndex, hintUsed) {
    const w = weightForTask(activity, level, sliceIndex);
    return Math.round(w * (hintUsed ? 0.6 : 1) * 10) / 10;
}

// Score an attempt from its recorded answer rows.
// `tasks` is the attempt's resolved task list (catalog tasks for play mode,
// diagnostic tasks for the diagnostic). Evidence weights come from the stored
// answer rows (already hint-adjusted and level-weighted at answer time).
// returns { score, correctCount, totalTasks, hintCount, stars }
function summarizeAttempt(attempt, tasks) {
    const rows = attempt.answers || [];
    let weightSum = 0;
    let weighted = 0;
    let correctCount = 0;
    let totalTasks = 0;
    const hintCount = rows.filter((r) => r.hintUsed).length;

    tasks.forEach((task, i) => {
        if (!isDeterministic(task)) return;
        totalTasks += 1;
        const row = rows.find((r) => r.taskIndex === i);
        if (!row) return; // unanswered → contributes 0
        const w = Number(row.weight) || 1;
        weightSum += w;
        weighted += w * (row.score || 0);
        if (row.correct) correctCount += 1;
    });

    const score = weightSum ? Math.round((weighted / weightSum) * 100) : totalTasks ? 0 : 100;
    const stars = totalTasks ? (score >= 85 ? 3 : score >= UNLOCK_SCORE ? 2 : 1) : 2;
    return { score, correctCount, totalTasks, hintCount, stars };
}

module.exports = {
    gradeTask,
    isDeterministic,
    evidenceWeight,
    summarizeAttempt,
    sanitizeChoice,
    sanitizeIds,
    sanitizeSort,
    sanitizeMatch,
};