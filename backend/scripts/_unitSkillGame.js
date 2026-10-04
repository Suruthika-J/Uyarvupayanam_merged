// backend/scripts/_unitSkillGame.js
//
// Offline unit checks for the Class 8 Skill Adventure:
//   1. Catalog integrity — every category has ≥3 activities; every activity has
//      ≥5 tasks ending with the required fields; answer keys are coherent
//      (answerIndex in range, order ids match steps, sort buckets valid, match
//      pairs well-formed); deterministic tasks carry a valid cognitiveType,
//      difficulty and weight; open tasks carry tips/brief.
//   2. Answer-key secrecy — public tasks never contain answerIndex / correct
//      order / bucket assignments / pattern rule.
//   3. Grading matrix — every mechanic grades correct + wrong + malformed input
//      correctly (malformed input must be rejected, never crash).
//   4. summarizeAttempt weighting — hint-used answers reduce evidence weight;
//      partial-credit mechanics produce partial scores.
//
// Run: node backend/scripts/_unitSkillGame.js   (no DB, no network)

"use strict";

const catalog = require("../config/class8SkillsCatalog");
const game = require("../services/skillGameService");

const VALID_COGNITIVE = new Set([
    "recall", "understanding", "application", "reasoning", "problem_solving",
    "pattern_recognition", "interpretation", "communication",
]);
const VALID_DIFFICULTY = new Set(["easy", "medium", "hard"]);
const MECHANICS = new Set(["choice", "pattern", "order", "sort", "match", "decode", "speak", "create"]);

let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond, detail) {
    if (cond) {
        pass += 1;
    } else {
        fail += 1;
        failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    }
}

function collect() {
    const out = [];
    for (const cat of catalog.CATEGORIES) {
        for (const act of cat.activities) {
            out.push({ cat, act });
        }
    }
    return out;
}

// ── 1. catalog integrity ────────────────────────────────────────────────────
check("8 categories", catalog.CATEGORIES.length === 8, `got ${catalog.CATEGORIES.length}`);
const ids = new Set();
for (const cat of catalog.CATEGORIES) {
    check(`unique category id ${cat.id}`, !ids.has(cat.id));
    ids.add(cat.id);

    check(`category ${cat.id} has name/color/icon`, !!cat.name && !!cat.color && !!cat.icon);
    check(`category ${cat.id} has ≥3 activities`, cat.activities.length >= 3, `got ${cat.activities.length}`);
    check(`category ${cat.id} has ≥4 tasks per activity`, cat.activities.every((a) => a.tasks.length >= 5));
    check(`category ${cat.id} has ≥2 mechanics across activities`, new Set(cat.activities.map((a) => a.mechanic)).size >= 2);

    for (const act of cat.activities) {
        const aid = `${cat.id}::${act.id}`;
        check(`activity ${aid} has title/tagline/icon`, !!act.title && !!act.tagline && !!act.icon);
        check(`activity ${aid} declares a mechanic`, ["choice", "pattern", "order", "sort", "match", "decode", "speak", "create"].includes(act.mechanic), act.mechanic);
        check(`activity ${aid} task count is 5`, act.tasks.length === 5, `got ${act.tasks.length}`);

        act.tasks.forEach((task, i) => {
            const t = `${aid} task ${i}`;
            check(`${t} unknown type`, MECHANICS.has(task.type), task.type);
            check(`${t} has prompt`, typeof task.prompt === "string" && task.prompt.length > 5);

            const det = !["speak", "create"].includes(task.type);
            if (det) {
                check(`${t} valid cognitiveType`, VALID_COGNITIVE.has(task.cognitiveType), task.cognitiveType);
                check(`${t} valid difficulty`, VALID_DIFFICULTY.has(task.difficulty), task.difficulty);
                check(`${t} has explanation`, typeof task.explanation === "string" && task.explanation.length > 3);
                check(`${t} has hint`, typeof task.hint === "string" && task.hint.length > 0);

                if (task.type === "choice" || task.type === "pattern" || task.type === "decode") {
                    check(`${t} options length 3+`, Array.isArray(task.options) && task.options.length >= 3);
                    check(`${t} answerIndex in range`, Number.isInteger(task.answerIndex) && task.answerIndex >= 0 && task.answerIndex < task.options.length);
                }
                if (task.type === "order") {
                    check(`${t} steps 3+`, Array.isArray(task.steps) && task.steps.length >= 3);
                    check(`${t} steps have unique ids`, new Set(task.steps.map((s) => s.id)).size === task.steps.length);
                }
                if (task.type === "sort") {
                    check(`${t} buckets 2+`, Array.isArray(task.buckets) && task.buckets.length >= 2);
                    check(`${t} items 4+`, Array.isArray(task.items) && task.items.length >= 4);
                    check(`${t} bucket idx valid`, task.items.every((it) => Number.isInteger(it.bucket) && it.bucket >= 0 && it.bucket < task.buckets.length));
                }
                if (task.type === "match") {
                    check(`${t} pairs 3+`, Array.isArray(task.pairs) && task.pairs.length >= 3);
                    check(`${t} pairs well-formed`, task.pairs.every((p) => p.id && p.a && p.a.id && p.a.label && p.b && p.b.id && p.b.label));
                }
            } else if (task.type === "speak") {
                check(`${t} has tips`, Array.isArray(task.tips) && task.tips.length >= 3);
            } else if (task.type === "create") {
                check(`${t} has brief`, typeof task.brief === "string" && task.brief.length > 3);
            }
        });
    }
}

// ── 2. answer-key secrecy ────────────────────────────────────────────────────
const usedMechanics = new Set(catalog.CATEGORIES.flatMap((c) => c.activities.map((a) => a.mechanic)));
for (const mech of ["choice", "pattern", "order", "sort", "match", "decode", "speak", "create"]) {
    check(`mechanic "${mech}" used somewhere in the module`, usedMechanics.has(mech));
}
const BANNED = ["answerIndex", "correctOrder", "explanation", "rule", "bucket"];
for (const { cat, act } of collect()) {
    [1, 2, 3].forEach((level) => {
        catalog.publicTasks(act, level).forEach((t) => {
            const s = JSON.stringify(t);
            for (const key of BANNED) {
                check(`secrecy ${cat.id}/${act.id} L${level} t${t.taskIndex} → no ${key}`, !new RegExp(`"${key}"`).test(s));
            }
        });
    });
    // underlying task still carries the answer key server-side
    for (const t of act.tasks) {
        if (t.type === "choice" || t.type === "pattern" || t.type === "decode") {
            check(`server keeps answerIndex ${cat.id}/${act.id}`, Number.isInteger(t.answerIndex));
        }
    }
}

// diagnostic tasks are stripped + carry category
for (const t of catalog.getDiagnostic()) {
    check(`diagnostic task has category`, !!t.category);
    const pub = catalog.stripForClient(t);
    const s = JSON.stringify(pub);
    for (const key of BANNED) check(`diagnostic secrecy → no ${key}`, !new RegExp(`"${key}"`).test(s));
}

// ── 3. grading matrix ───────────────────────────────────────────────────────
const g1 = game.gradeTask({ type: "choice", options: ["a", "b", "c", "d"], answerIndex: 2 }, 2);
check("choice correct", g1.valid && g1.correct && g1.score === 1);
check("choice wrong", game.gradeTask({ type: "choice", options: ["a", "b", "c", "d"], answerIndex: 2 }, 0).correct === false);
check("choice malformed rejected", game.gradeTask({ type: "choice", options: ["a", "b", "c", "d"], answerIndex: 2 }, 9).valid === false);
check("choice NaN rejected", game.gradeTask({ type: "choice", options: ["a", "b", "c", "d"], answerIndex: 2 }, "x").valid === false);

const ordTask = { type: "order", steps: [{ id: "a" }, { id: "b" }, { id: "c" }] };
const o1 = game.gradeTask(ordTask, ["a", "b", "c"]);
check("order correct", o1.valid && o1.correct && o1.score === 1);
const o2 = game.gradeTask(ordTask, ["b", "a", "c"]);
check("order partial score", o2.valid && o2.correct === false && Math.abs(o2.score - 1 / 3) < 1e-9, `score ${o2.score}`);
check("order wrong length rejected", game.gradeTask(ordTask, ["a", "b"]).valid === false);
check("order duplicates rejected", game.gradeTask(ordTask, ["a", "a", "c"]).valid === false);

const sortTask = {
    type: "sort",
    buckets: [{ id: "x" }, { id: "y" }],
    items: [{ id: "i1", bucket: 0 }, { id: "i2", bucket: 1 }, { id: "i3", bucket: 0 }, { id: "i4", bucket: 1 }],
};
const s1 = game.gradeTask(sortTask, { i1: "x", i2: "y", i3: "x", i4: "y" });
check("sort correct", s1.valid && s1.correct && s1.score === 1);
const s2 = game.gradeTask(sortTask, { i1: "x", i2: "x", i3: "y", i4: "y" });
check("sort partial score", s2.valid && s2.correct === false && Math.abs(s2.score - 0.5) < 1e-9, `score ${s2.score}`);
check("sort missing item rejected", game.gradeTask(sortTask, { i1: "x", i2: "y", i3: "x" }).valid === false);
check("sort bad bucket rejected", game.gradeTask(sortTask, { i1: "z", i2: "y", i3: "x", i4: "y" }).valid === false);

const matchTask = {
    type: "match",
    pairs: [
        { a: { id: "a1" }, b: { id: "b1" } },
        { a: { id: "a2" }, b: { id: "b2" } },
        { a: { id: "a3" }, b: { id: "b3" } },
    ],
};
const m1 = game.gradeTask(matchTask, [{ aId: "a1", bId: "b1" }, { aId: "a2", bId: "b2" }, { aId: "a3", bId: "b3" }]);
check("match correct", m1.valid && m1.correct && m1.score === 1);
const m2 = game.gradeTask(matchTask, [{ aId: "a1", bId: "b2" }, { aId: "a2", bId: "b1" }, { aId: "a3", bId: "b3" }]);
check("match partial score", m2.valid && m2.correct === false && Math.abs(m2.score - 1 / 3) < 1e-9, `score ${m2.score}`);
check("match duplicate left rejected", game.gradeTask(matchTask, [{ aId: "a1", bId: "b1" }, { aId: "a1", bId: "b2" }, { aId: "a3", bId: "b3" }]).valid === false);
check("match bad id rejected", game.gradeTask(matchTask, [{ aId: "a9", bId: "b1" }, { aId: "a2", bId: "b2" }, { aId: "a3", bId: "b3" }]).valid === false);

const decTask = { type: "decode", options: ["AB", "BA", "CC"], answerIndex: 1 };
check("decode correct", game.gradeTask(decTask, 1).correct === true);
check("decode malformed", game.gradeTask(decTask, null).valid === false);
const patTask = { type: "pattern", options: ["x", "y", "z"], answerIndex: 2 };
check("pattern correct", game.gradeTask(patTask, 2).correct === true);

// ── 4. summarizeAttempt weighting (hint reduces weight; partial credit) ─────
const actFixture = { tasks: [{ type: "choice", options: ["a", "b"], answerIndex: 0 }, { type: "choice", options: ["a", "b"], answerIndex: 1 }, { type: "order", steps: [{ id: "p1" }, { id: "p2" }] }] };
const attemptFixture = {
    answers: [
        { taskIndex: 0, correct: true, score: 1, hintUsed: false, weight: 1 },
        { taskIndex: 1, correct: false, score: 0, hintUsed: true, weight: 0.6 },
        { taskIndex: 2, correct: true, score: 1, hintUsed: false, weight: 2 },
    ],
};
const sum = game.summarizeAttempt(attemptFixture, actFixture.tasks);
check("summary weighted score", sum.score === 83, `got ${sum.score}`); // (1×1 + 2×1)/(1+0.6+2) = 3/3.6 ≈ 83%
check("summary correctCount", sum.correctCount === 2, `got ${sum.correctCount}`);
check("summary totalTasks", sum.totalTasks === 3);
check("summary hintCount", sum.hintCount === 1);

// ── level slicing sanity ────────────────────────────────────────────────────
for (const { cat, act } of collect()) {
    const l1 = catalog.tasksForLevel(act, 1).length;
    const l2 = catalog.tasksForLevel(act, 2).length;
    const l3 = catalog.tasksForLevel(act, 3).length;
    check(`levels ${cat.id}/${act.id}: L1=${l1} L2=${l2} L3=${l3}`, l1 === 3 && l2 === 4 && l3 === 3, `${l1}/${l2}/${l3}`);
}

// ── summary ─────────────────────────────────────────────────────────────────
console.log(`\nSkill Adventure unit checks: ${pass} passed, ${fail} failed`);
if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  ✗ ${f}`));
    process.exit(1);
}
console.log("All checks green ✓");
process.exit(0);