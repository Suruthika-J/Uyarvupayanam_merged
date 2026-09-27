// backend/services/diagnosticQuestionService.js
//
// Diagnostic (metadata-rich) question generation for the LD-NBSE flow.
//
// Groq/LLM role is STRICTLY content creation: given a (skill, subskill,
// cognitiveType, difficulty) spec row it returns age-appropriate questions and
// fills the metadata fields. The LLM NEVER decides skill level, weakness or
// next best skill — those are computed by the deterministic engines.
//
// Fallback: when the LLM is absent/fails, the static Question Management bank
// is used and the blueprint metadata is attached deterministically, so the
// diagnostic pipeline never depends on the LLM being up.
"use strict";

const axios = require("axios");
const OnboardingQuestion = require("../models/OnboardingQuestion");
const { resolveProvider, callLLM, extractJson, MAX_QUESTIONS_PER_CALL } = require("../utils/aiQuestionGenerator");
const { VALID_COGNITIVE_TYPES, VALID_DIFFICULTIES } = require("../config/ldnbs/learningDNAConfig");
const taxonomy = require("../config/ldnbs/skillTaxonomyConfig");

const MAX_RETRIES = 2;
const GRADES = { "Class 5": "5", "Class 8": "8", "Class 10": "10", "Class 12": "12" };

function buildDiagnosticPrompt(grade, skill, rows) {
    const gradeNum = GRADES[grade] || String(grade || "").replace(/^Class\s*/i, "").trim() || "school";
    const specs = rows
        .map((r) => `- subskill "${r.subskill}", cognitive type "${r.cognitiveType}", difficulty "${r.difficulty}"`)
        .join("\n");
    return `Generate exactly ${rows.length} age-appropriate screening questions for a Class ${gradeNum} student to assess the skill "${skill}". Each question must target the subskill, cognitive type and difficulty listed below, IN THE SAME ORDER. Questions must be reasoning/aptitude or skill-based MCQs with exactly 4 options and exactly one correct answer. Keep each question under 40 words and each option under 12 words. Return ONLY valid JSON, no preamble, no markdown, exactly this shape: [{"question":"...","options":["A","B","C","D"],"correct_answer":"B","subskill":"...","cognitive_type":"...","difficulty":"easy"}]. "correct_answer" must be the exact text of one option. "subskill" must be taken from my list, "cognitive_type" from [${VALID_COGNITIVE_TYPES.join(", ")}], "difficulty" from [${VALID_DIFFICULTIES.join(", ")}].\n\nRequired specs:\n${specs}`;
}

// Normalize a question returned by the LLM against its spec row.
function normalizeLlmQuestion(q, spec) {
    if (!q || typeof q !== "object") return null;
    const question = typeof q.question === "string" ? q.question.trim() : "";
    if (!question) return null;
    if (!Array.isArray(q.options) || q.options.length !== 4) return null;
    const options = q.options.map((o) => (typeof o === "string" ? o.trim() : ""));
    if (options.some((o) => !o) || new Set(options).size !== 4) return null;
    const correctAnswer = typeof q.correct_answer === "string" ? q.correct_answer.trim() : "";
    if (!correctAnswer || !options.includes(correctAnswer)) return null;

    // Metadata: prefer the spec (deterministic), fall back to the LLM's values
    // only when they are valid. We never let the LLM move a question outside
    // the requested blueprint.
    const cognitiveType = VALID_COGNITIVE_TYPES.includes(q.cognitive_type) ? q.cognitive_type : spec.cognitiveType;
    const difficulty = VALID_DIFFICULTIES.includes(q.difficulty) ? q.difficulty : spec.difficulty;
    return {
        questionText: question,
        options,
        correctAnswer,
        subskill: spec.subskill,
        cognitiveType,
        difficulty,
        weight: Number(spec.weight) || 1,
    };
}

// Deterministic bank fallback: pick matching grade+skill questions and attach
// the blueprint metadata by rotating through the spec rows.
async function sampleBankForBlueprints(grade, skill, rows) {
    const rx = new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const pool = await OnboardingQuestion.find({ grade, skillTag: rx })
        .select("questionText options correctAnswer difficultyLevel subskill cognitiveType")
        .lean();
    const out = [];
    let specIndex = 0;
    let poolIndex = 0;
    for (let i = 0; i < rows.length; i++) {
        const spec = rows[specIndex % rows.length];
        const q = pool[poolIndex % pool.length];
        if (!q) break;
        out.push({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            subskill: spec.subskill,
            cognitiveType: spec.cognitiveType,
            difficulty: spec.difficulty || q.difficultyLevel?.toLowerCase?.() || "easy",
            weight: Number(spec.weight) || 1,
        });
        specIndex += 1;
        poolIndex += 1;
    }
    return out;
}

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Groq/free tiers signal quota exhaustion as HTTP 429 or a 400 with a
// rate-limit error. Retrying instantly on those just burns attempts and makes
// the onboarding screen feel even slower, so we back off briefly instead.
function isRateLimitError(err) {
    const status = err?.response?.status;
    if (status === 429) return true;
    const code = String(err?.response?.data?.error?.code || "") || String(err?.code || "");
    const msg = String(err?.response?.data?.error?.message || "") + " " + String(err?.message || "");
    return /rate_limit|rate limit|requests per|exceeds available/i.test(code + " " + msg);
}

/**
 * Generate questions for one skill across its blueprint spec rows.
 * rows: [{ subskill, cognitiveType, difficulty, weight, count }]
 * opts.forceBank → skip the LLM entirely (deterministic tests/fallback).
 * Returns { questionRows, source: "ai" | "bank" } — questionRows are
 * metadata-bearing normalized objects (correctAnswer included for storage).
 */
async function generateDiagnosticForSkill(grade, skill, rows, opts = {}) {
    const provider = opts.forceBank ? null : resolveProvider();
    const specs = [];
    for (const r of rows) {
        for (let c = 0; c < (Number(r.count) || 1); c++) specs.push({ ...r });
    }
    if (!specs.length) return { questionRows: [], source: "bank" };

    // LLM path (up to MAX_RETRIES extra attempts) — any failure falls back.
    if (provider) {
        let lastError = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const prompt = buildDiagnosticPrompt(grade, skill, specs.slice(0, MAX_QUESTIONS_PER_CALL));
                // split large spec lists into MAX_QUESTIONS_PER_CALL chunks
                const chunks = [];
                for (let i = 0; i < specs.length; i += MAX_QUESTIONS_PER_CALL) {
                    chunks.push(specs.slice(i, i + MAX_QUESTIONS_PER_CALL));
                }
                const questionRows = [];
                let failed = false;
                for (const chunk of chunks) {
                    const rawText = await callLLM(provider, buildDiagnosticPrompt(grade, skill, chunk));
                    const parsed = extractJson(rawText);
                    if (!Array.isArray(parsed)) { failed = true; break; }
                    const norm = parsed.map((q, i) => normalizeLlmQuestion(q, chunk[i])).filter(Boolean);
                    if (norm.length < Math.min(2, chunk.length)) { failed = true; break; }
                    questionRows.push(...norm);
                }
                if (!failed && questionRows.length) {
                    let aiRows = questionRows;
                    let skillSource = "ai";
                    if (aiRows.length < specs.length) {
                        // The LLM came up short (providers sometimes return fewer
                        // rows than asked). Top the missing tail up from the bank
                        // so the blueprint evidence count stays intact — the
                        // deterministic diagnosis needs ≥2 rows per core subskill
                        // (minForJudgment) and would otherwise wrongly report
                        // "insufficient evidence" for that subskill.
                        const needed = specs.length - aiRows.length;
                        const bankPool = await sampleBankForBlueprints(grade, skill, specs);
                        const extra = bankPool.slice(aiRows.length, aiRows.length + needed);
                        aiRows = [...aiRows, ...extra];
                        if (extra.length) skillSource = "mixed";
                    }
                    return { questionRows: aiRows, source: skillSource };
                }
                lastError = new Error("validation produced too few diagnostic questions");
            } catch (err) {
                lastError = err;
                console.warn(`[diagnosticQuestionService] attempt ${attempt + 1} failed for "${skill}": ${err.message}`);
                if (isRateLimitError(err) && attempt < MAX_RETRIES) {
                    // back off before retrying a quota-limited provider instead
                    // of hammering it (instant retries on 429/400 just extend
                    // the delay AND push more skills to the bank fallback).
                    await sleep(600 * (attempt + 1));
                }
            }
        }
        console.warn(`[diagnosticQuestionService] giving up on AI for "${skill}" — bank fallback. (${lastError?.message || ""})`);
    }

    const bankRows = await sampleBankForBlueprints(grade, skill, specs);
    return { questionRows: shuffle(bankRows).slice(0, specs.length), source: "bank" };
}

/**
 * Build the full diagnostic set for a blueprint.
 * blueprintRows: [{ skill, subskill, cognitiveType, difficulty, weight, count }]
 *
 * Per-skill LLM calls run concurrently (small pool) so a 5–7 skill blueprint
 * finishes in ~1–2 LLM round trips instead of N sequential ones — this is the
 * main lever that keeps OTP → onboarding snappy while questions stay AI-made.
 */
async function generateDiagnosticSet(grade, blueprintRows, opts = {}) {
    const bySkill = {};
    for (const r of blueprintRows) {
        (bySkill[r.skill] = bySkill[r.skill] || []).push(r);
    }
    const skillEntries = Object.entries(bySkill);

    const resultsMap = new Map();
    const CONCURRENCY = 2; // steadier request flow → far fewer free-tier 429/400 quota hits than 3–5 at once
    let cursor = 0;
    async function worker() {
        while (cursor < skillEntries.length) {
            const [skill, skillRows] = skillEntries[cursor++];
            const { questionRows, source } = await generateDiagnosticForSkill(grade, skill, skillRows, opts);
            resultsMap.set(skill, { questionRows, source });
        }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, skillEntries.length) }, worker));

    const rows = [];
    const questionsPerRow = {};
    let sources = new Set();
    let index = 0;
    for (const [skill, skillRows] of skillEntries) {
        const { questionRows, source } = resultsMap.get(skill);
        sources.add(source);
        for (const q of questionRows) {
            rows.push({ index: index++, ...q, skill });
            if (q.subskill && q.subskill in questionsPerRow) questionsPerRow[q.subskill] += 1;
            else questionsPerRow[q.subskill] = 1;
        }
    }
    return { rows: shuffle(rows), questionsPerRow, source: sources.has("ai") ? (sources.size > 1 ? "mixed" : "ai") : "bank" };
}

module.exports = {
    buildDiagnosticPrompt,
    generateDiagnosticForSkill,
    generateDiagnosticSet,
    sampleBankForBlueprints,
    normalizeLlmQuestion,
    shuffle,
};