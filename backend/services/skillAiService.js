// backend/services/skillAiService.js
//
// OPTIONAL AI encouragement for the Class 8 Skill Adventure. The AI's only job
// here is a short, friendly, personalised line after a completed game. It is
// NEVER used for scoring, evidence, milestones or recommendations — those are
// always deterministic and server-authoritative.
//
// Contract (mirrors englishAiService): returns null whenever no provider is
// configured or the LLM fails/times out/or returns invalid text — the caller
// then shows a deterministic encouragement line. No fabricated AI output, no
// claims about the student's intelligence/personality/emotional health, and
// no personal student data (name/email) is ever sent to the model.
//
// The single AI gateway (utils/aiQuestionGenerator.js) is reused.

"use strict";

const { resolveProvider, callLLM, extractJson } = require("../utils/aiQuestionGenerator");

const MAX_LINE = 140;
const MIN_LINE = 10;

function normLine(text) {
    return String(text || "")
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim()
        .replace(/\s+/g, " ");
}

// Tolerant extraction of a { line: "..." } object from LLM output.
function parseLine(rawText) {
    const cleaned = normLine(rawText).replace(/^[^{]*/, "").replace(/[^}]*$/, "");
    if (!cleaned) return null;
    let data = null;
    try {
        data = JSON.parse(cleaned);
    } catch (e) {
        data = null;
    }
    if (data && typeof data.line === "string") {
        const line = normLine(data.line);
        if (line.length >= MIN_LINE && line.length <= MAX_LINE) return line;
        return null;
    }
    try {
        const arr = extractJson(cleaned);
        if (Array.isArray(arr) && arr.length) {
            const line = normLine(arr[0]);
            if (line.length >= MIN_LINE && line.length <= MAX_LINE) return line;
        }
    } catch (e) {
        // ignore
    }
    return null;
}

// Score band → friendly deterministic fallback lines.
function deterministicLine({ score, categoryName, activityTitle, hintCount }) {
    const cat = categoryName || "this skill";
    const act = activityTitle || "this game";
    if (score >= 85) {
        return `Excellent work in ${act}! Your careful thinking in ${cat} really shows.`;
    }
    if (score >= 60) {
        return `Well done completing ${act}! A little more practice in ${cat} and you will shine.`;
    }
    if (hintCount === 0) {
        return `Great effort in ${act}! Try again and read each clue carefully — you are getting there.`;
    }
    return `Good try in ${act}! Using hints is smart. One more round and ${cat} will feel easier.`;
}

/**
 * Generate a short encouraging line for a completed game.
 * @returns {Promise<string|null>} line (never empty), or null on AI failure.
 */
async function encourageCompletion({ score, categoryName, activityTitle, hintCount, activityId }) {
    const fallback = deterministicLine({ score, categoryName, activityTitle, hintCount });

    const provider = resolveProvider();
    if (!provider) return null; // no AI available → deterministic fallback

    const prompt = [
        "You are a friendly coach for a 13-year-old student using a skills-practice game app.",
        "The student just finished a game. Write ONE short encouraging line (10 to 140 characters).",
        "Rules:",
        "- Talk about the game and their effort, never about their intelligence, personality or emotional health.",
        "- Do not claim they are the best or that they have mastered anything.",
        "- Use simple warm words a teenager would like.",
        "- Return ONLY a JSON object: {\"line\": \"...\"}",
        "",
        `Game: ${activityTitle || "a skill game"} (${categoryName || "skills"}). Score: ${score}/100. Hints used: ${hintCount}.`,
    ].join("\n");

    try {
        const raw = await callLLM(provider, prompt);
        const line = parseLine(raw);
        return line || null;
    } catch (e) {
        return null; // deterministic fallback
    }
}

module.exports = {
    encourageCompletion,
    deterministicLine,
    parseLine,
};