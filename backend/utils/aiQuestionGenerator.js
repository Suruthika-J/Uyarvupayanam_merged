// backend/utils/aiQuestionGenerator.js
//
// Live AI (LLM) generation engine for onboarding screening questions.
//
// Providers (OpenAI-compatible chat completions + Anthropic messages):
//   - Anthropic:      ANTHROPIC_API_KEY  (model AI_QUESTIONS_MODEL, default claude-sonnet-4-5)
//   - OpenAI:         OPENAI_API_KEY     (model AI_QUESTIONS_MODEL, default gpt-4o-mini)
//   - Groq:           GROQ_API_KEY       (model AI_QUESTIONS_MODEL, default llama-3.3-70b-versatile)
//   - xAI Grok:       GROK_API_KEY       (model AI_QUESTIONS_MODEL, default grok-2-latest)
//   - custom:         AI_QUESTIONS_API_KEY + AI_QUESTIONS_BASE_URL + AI_QUESTIONS_MODEL
//
// Safety rails:
//   - strict JSON prompt + server-side parse/validation (reject malformed JSON,
//     options not exactly 4, correct_answer not among options, duplicates)
//   - up to 2 retries per skill on failure/timeout
//   - request timeout + a hard cap on how many skills/questions a caller can ask for
//   - if the LLM is unavailable (no key, timeout, bad output) the caller falls
//     back to the static Question Management bank so onboarding never breaks.
const axios = require("axios");

const MAX_RETRIES = 2; // additional attempts after the first
const TIMEOUT_MS = Number(process.env.AI_QUESTIONS_TIMEOUT_MS) || 25000;
const MAX_FETCH_SKILLS = 12;
const MAX_QUESTIONS_PER_CALL = 5; // per skill, hard cap

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

// Pick the provider from the environment. Returns null when no LLM key exists —
// the caller then falls back to the static bank.
function resolveProvider() {
    if (process.env.AI_QUESTIONS_API_KEY && process.env.AI_QUESTIONS_BASE_URL) {
        return {
            type: "openai",
            apiKey: process.env.AI_QUESTIONS_API_KEY,
            model: process.env.AI_QUESTIONS_MODEL || "gpt-4o-mini",
            baseUrl: process.env.AI_QUESTIONS_BASE_URL.replace(/\/$/, ""),
        };
    }
    if (process.env.ANTHROPIC_API_KEY) {
        return {
            type: "anthropic",
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: process.env.AI_QUESTIONS_MODEL || "claude-sonnet-4-5",
        };
    }
    if (process.env.OPENAI_API_KEY) {
        return {
            type: "openai",
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.AI_QUESTIONS_MODEL || "gpt-4o-mini",
            baseUrl: process.env.AI_QUESTIONS_BASE_URL || "https://api.openai.com/v1",
        };
    }
    if (process.env.GROK_API_KEY) {
        return {
            type: "openai",
            apiKey: process.env.GROK_API_KEY,
            model: process.env.AI_QUESTIONS_MODEL || "grok-2-latest",
            baseUrl: process.env.AI_QUESTIONS_BASE_URL || "https://api.x.ai/v1",
        };
    }
    if (process.env.GROQ_API_KEY) {
        return {
            type: "openai",
            apiKey: process.env.GROQ_API_KEY,
            model: process.env.AI_QUESTIONS_MODEL || "openai/gpt-oss-120b",
            baseUrl: process.env.AI_QUESTIONS_BASE_URL || "https://api.groq.com/openai/v1",
        };
    }
    return null;
}

function buildPrompt(grade, skill, count) {
    const gradeNum = String(grade || "").replace(/^Class\s*/i, "").trim() || "school";
    return `Generate exactly ${count} simple IQ-style screening questions for a Class ${gradeNum} student to assess the skill "${skill}". Questions must be age-appropriate, single-correct-answer, multiple choice (4 options), reasoning/aptitude style only — no curriculum or textbook knowledge required. Keep each question under 40 words and each option under 10 words. Return ONLY valid JSON, with no preamble, no markdown, exactly in this shape: [{"question":"...","options":["A","B","C","D"],"correct_answer":"B","difficulty":"easy"}]. The "correct_answer" must be the exact text of one of the 4 options.`;
}

// Pull the first JSON array out of an LLM reply (tolerates code fences / prose).
function extractJson(text) {
    const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/gi, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("No JSON array found in LLM response");
    }
    return JSON.parse(cleaned.slice(start, end + 1));
}

// Strict server-side validation → normalized question objects.
function parseAndValidateQuestions(rawText) {
    const parsed = extractJson(rawText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("LLM returned no questions");
    }

    const valid = [];
    for (const q of parsed) {
        if (!q || typeof q !== "object") continue;
        const question = typeof q.question === "string" ? q.question.trim() : "";
        if (!question) continue;

        if (!Array.isArray(q.options) || q.options.length !== 4) continue;
        const options = q.options.map((o) => (typeof o === "string" ? o.trim() : ""));
        if (options.some((o) => !o)) continue;
        if (new Set(options).size !== 4) continue; // duplicate option → reject

        const correctAnswer = typeof q.correct_answer === "string" ? q.correct_answer.trim() : "";
        if (!correctAnswer || !options.includes(correctAnswer)) continue; // answer must match an option

        valid.push({
            questionText: question,
            options,
            correctAnswer,
            difficulty: VALID_DIFFICULTIES.has(q.difficulty) ? q.difficulty : "easy",
        });
    }
    return valid;
}

async function callLLM(provider, prompt) {
    const system = "You are a specialized assessment question generator. Respond strictly with raw valid JSON only, no markdown, no commentary.";

    if (provider.type === "anthropic") {
        const res = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
                model: provider.model,
                max_tokens: 1200,
                temperature: 0.7,
                system,
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": provider.apiKey,
                    "anthropic-version": "2023-06-01",
                },
                timeout: TIMEOUT_MS,
            }
        );
        const content = res.data?.content || [];
        return content.map((c) => c.text || "").join("");
    }

    // OpenAI-compatible (OpenAI / Groq / Grok / custom).
    // JSON mode returns clean structured output, but the provider can reject the
    // response it generated itself (e.g. Groq 400 "json_validate_failed"). In
    // that case we retry once WITHOUT JSON mode — extractJson() still tolerates
    // the reply, so questions keep coming from AI instead of the bank.
    const attempt = async (jsonMode) =>
        await axios.post(
            `${provider.baseUrl}/chat/completions`,
            {
                model: provider.model,
                temperature: 0.2, // near-deterministic output → far fewer validation retries
                max_tokens: 1200,
                ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt },
                ],
            },
            {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.apiKey}` },
                timeout: TIMEOUT_MS,
            }
        );

    try {
        const res = await attempt(true);
        return res.data?.choices?.[0]?.message?.content || "";
    } catch (err) {
        // Invalid-request 400s from the JSON-mode endpoint (JSON validation
        // failures, parameter rejection) → retry once without JSON mode.
        if (err?.response?.status === 400 || String(err?.response?.data?.error?.code) === "json_validate_failed") {
            const res = await attempt(false);
            return res.data?.choices?.[0]?.message?.content || "";
        }
        throw err;
    }
}

/**
 * Generate `count` validated questions for one skill via the LLM.
 * Returns null if no provider is configured OR the LLM fails/returns garbage
 * after retries — the caller falls back to the static bank in that case.
 */
async function generateQuestionsForSkill(skill, grade, count) {
    const provider = resolveProvider();
    if (!provider) return null;

    const safeCount = Math.min(Math.max(1, Number(count) || 3), MAX_QUESTIONS_PER_CALL);
    const prompt = buildPrompt(grade, skill, safeCount);

    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const rawText = await callLLM(provider, prompt);
            const questions = parseAndValidateQuestions(rawText);
            if (questions.length) return questions.slice(0, safeCount);
            lastError = new Error("validation produced 0 questions");
            console.warn(`[aiQuestionGenerator] attempt ${attempt + 1} failed validation for skill "${skill}"`);
        } catch (err) {
            lastError = err;
            console.warn(`[aiQuestionGenerator] attempt ${attempt + 1} failed for skill "${skill}": ${err.message}`);
        }
    }
    console.warn(`[aiQuestionGenerator] giving up on skill "${skill}" after ${MAX_RETRIES + 1} attempts — bank fallback will be used. (${lastError?.message || ""})`);
    return null;
}

module.exports = {
    generateQuestionsForSkill,
    parseAndValidateQuestions,
    buildPrompt,
    resolveProvider,
    callLLM,
    extractJson,
    MAX_FETCH_SKILLS,
    MAX_QUESTIONS_PER_CALL,
};