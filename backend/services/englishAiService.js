// backend/services/englishAiService.js
//
// Live AI question generation + writing feedback for the Class 8 English
// module. The LLM's ONLY role is creating question/feedback CONTENT: every
// answer, option and explanation is validated server-side before it is
// stored, the answer key never leaves the backend, and scoring is done by
// the routes against the stored set (never by the AI, never by the client).
//
// The provider plumbing (Groq/OpenAI/Anthropic/Grok + timeouts + JSON-mode
// fallback) is reused from utils/aiQuestionGenerator.js so there is exactly
// one AI gateway in the backend.
//
// Contract: returns null when no provider is configured or the LLM keeps
// failing/returning invalid output (the route then returns a clear error —
// it never fabricates questions or pretends generated content came from AI).

const { resolveProvider, callLLM, extractJson } = require("../utils/aiQuestionGenerator");

const MAX_TOTAL_ATTEMPTS = 4; // cap on LLM calls per generation (incremental top-ups)
const FEEDBACK_ATTEMPTS = 4; // cap on LLM calls per writing-feedback request
const REQUIRED_COUNT = 6; // default question count per assessment
const ALLOWED_TYPES = new Set(["mcq", "true-false", "fill-in-the-blank", "sentence-correction"]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

// ── tiny text helpers ──────────────────────────────────────────────────────

function norm(value) {
  return String(value === undefined || value === null ? "" : value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function stripPunct(value) {
  return norm(value).replace(/[.!?;,"']+$/g, "").replace(/^\s+|\s+$/g, "");
}

// Tolerant JSON extraction: accept { questions: [...] } OR a bare array.
function parseQuestionArray(rawText) {
  const cleaned = String(rawText || "").replace(/```json/gi, "").replace(/```/gi, "").trim();
  let data = null;
  try { data = JSON.parse(cleaned); } catch (e) { data = null; }
  if (data && Array.isArray(data.questions)) return data.questions;
  if (Array.isArray(data)) return data;
  try { return extractJson(cleaned); } catch (e) { return null; }
}

// Mark whether the LLM's answer matches one of its own options.
function answerInsideOptions(options, answer) {
  const a = stripPunct(answer);
  return options.some((o) => stripPunct(o) === a);
}

function optionAt(options, answer) {
  const a = stripPunct(answer);
  return options.find((o) => stripPunct(o) === a) || "";
}

// Validate + normalize ONE AI-produced question into the storage shape.
// Returns null when the question is unusable (wrong type, bad options,
// answer not among options, empty explanation, ...). When `reason` is
// supplied it is invoked with a human-readable rejection cause — used for
// diagnostics/logging only; validation logic never depends on it.
function validateQuestion(q, topic, reason) {
  const reject = (why) => {
    if (typeof reason === "function") reason(why);
    return null;
  };

  if (!q || typeof q !== "object") return reject("not an object");

  const type = String(q.type || "").trim();
  if (!ALLOWED_TYPES.has(type)) return reject(`type "${type}" not allowed`);

  const question = typeof q.question === "string" ? q.question.trim() : "";
  if (!question || question.length < 10) return reject("question missing or too short");

  const explanation = typeof q.explanation === "string" ? q.explanation.trim() : "";
  const difficulty = VALID_DIFFICULTIES.has(q.difficulty) ? q.difficulty : "medium";
  const marks = Number(q.marks) === 2 ? 2 : 1;

  let options = [];
  let correctAnswer = "";

  if (type === "true-false") {
    const raw = norm(q.correct_answer);
    if (raw !== "true" && raw !== "false") return reject("true-false answer must be True/False");
    options = ["True", "False"];
    correctAnswer = raw === "true" ? "True" : "False";
  } else if (type === "fill-in-the-blank") {
    if (!question.includes("____")) return reject("fill-in-the-blank question lacks ____");
    if (Array.isArray(q.correct_answer)) {
      const accepted = q.correct_answer
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter(Boolean);
      if (!accepted.length) return reject("fill-in-the-blank accepted list empty");
      correctAnswer = accepted;
    } else {
      const raw = typeof q.correct_answer === "string" ? q.correct_answer.trim() : "";
      if (!raw) return reject("fill-in-the-blank answer missing");
      correctAnswer = [raw];
    }
    // Optional options must still contain the answer (guard against AI sloppiness).
    if (Array.isArray(q.options) && q.options.length) {
      const opts = q.options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean);
      if (opts.length < 2 || !opts.some((o) => stripPunct(o) === stripPunct(correctAnswer[0]))) {
        return reject("fill-in-the-blank options missing or answer not among them");
      }
      options = opts;
    }
  } else {
    // mcq + sentence-correction: exactly 4 unique options, answer among them.
    if (!Array.isArray(q.options) || q.options.length !== 4) return reject(`needs exactly 4 options (got ${Array.isArray(q.options) ? q.options.length : "none"})`);
    options = q.options.map((o) => (typeof o === "string" ? o.trim() : ""));
    if (options.some((o) => !o)) return reject("empty option text");
    if (new Set(options.map(norm)).size !== 4) return reject("duplicate options");
    const raw = typeof q.correct_answer === "string" ? q.correct_answer.trim() : "";
    if (!raw || !answerInsideOptions(options, raw)) return reject("correct_answer not among options");
    correctAnswer = optionAt(options, raw);
  }

  // Explanations that teach are required for every stored question.
  if (!explanation) return reject("explanation missing");

  const learningObjective =
    typeof q.learningObjective === "string" && q.learningObjective.trim()
      ? q.learningObjective.trim()
      : (topic.objectives && topic.objectives[0]) || topic.name;

  return {
    type,
    question: type === "sentence-correction" ? question : question,
    options,
    correctAnswer,
    explanation,
    marks,
    difficulty,
    learningObjective,
  };
}

// Condense lesson content so the LLM sees the topic + the passage + the rules
// without the whole curriculum.
function lessonDigest(topic) {
  const parts = [];
  if (topic.lesson && topic.lesson.intro) parts.push(topic.lesson.intro);
  for (const s of topic.lesson.sections || []) {
    parts.push(s.heading);
    if (s.body) parts.push(s.body);
    for (const p of s.points || []) parts.push(p);
    for (const e of s.examples || []) parts.push(e);
  }
  const recap = (topic.recap || []).join(" • ");
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.length > 2600 ? text.slice(0, 2600) : text;
}

function typeMixSentence(types) {
  return (types || []).join(", ");
}

function buildAssessmentPrompt(topic, area, count, difficulty, types, alreadyAccepted) {
  const example = (type) => {
    switch (type) {
      case "true-false":
        return `{"type":"true-false","question":"The present perfect is formed with has/have plus the past participle.","options":["True","False"],"correct_answer":"True","explanation":"Yes — has or have + past participle (e.g. has gone).","difficulty":"easy","marks":1,"learningObjective":"Recognise verb tenses"}`;
      case "fill-in-the-blank":
        return `{"type":"fill-in-the-blank","question":"By next year I ____ (study) at this school for three years.","options":[],"correct_answer":"will have studied","explanation":"By a future time, use the future perfect: will have + past participle.","difficulty":"medium","marks":1,"learningObjective":"Use future tenses"}`;
      case "sentence-correction":
        return `{"type":"sentence-correction","question":"She don't like mangoes.","options":["She doesn't like mangoes.","She don't likes mangoes.","She isn't like mangoes.","She not like mangoes."],"correct_answer":"She doesn't like mangoes.","explanation":"Third-person singular needs doesn't + base verb.","difficulty":"easy","marks":1,"learningObjective":"Correct common errors"}`;
      default:
        return `{"type":"mcq","question":"Look! The children ____ football in the park now.","options":["play","plays","are playing","have played"],"correct_answer":"are playing","explanation":"An action happening now takes the present continuous.","difficulty":"easy","marks":1,"learningObjective":"Use present tenses"}`;
    }
  };

  const acceptedBlock = alreadyAccepted && alreadyAccepted.length
    ? `\nYou have already accepted these ${alreadyAccepted.length} question(s) — do NOT repeat them or their ideas:\n${alreadyAccepted.map((q) => `- ${q.question}`).join("\n")}\nGenerate the rest as NEW questions.\n`
    : "";

  return [
    `You are a veteran Class 8 English teacher writing an end-of-topic assessment called "${topic.name}" for the learning area "${area.name}".`,
    `The assessment must test ONLY the content of this topic, at Class 8 level.`,
    ``,
    `LEARNING OBJECTIVES:`,
    ...(topic.objectives || []).map((o) => `- ${o}`),
    ``,
    `LESSON SUMMARY (use this as the source of truth; comprehension questions for reading/listening topics must be grounded in the passage included here):`,
    lessonDigest(topic),
    ``,
    `Generate exactly ${count} question(s)${types && types.length ? ` using these types in a sensible mix: ${typeMixSentence(types)}` : ""}.`,
    acceptedBlock,
    ``,
    `HARD RULES:`,
    `- Return ONLY raw JSON with a top-level "questions" array: {"questions":[...]} (or a bare array). No markdown fences, no commentary, no trailing commas.`,
    `- Question types are exactly one of "mcq", "true-false", "fill-in-the-blank", "sentence-correction".`,
    `- mcq / sentence-correction: exactly 4 options, all distinct; "correct_answer" MUST be the EXACT full text of one of the options (never a letter, never an abbreviation).`,
    `- true-false: options must be exactly ["True","False"]; correct_answer "True" or "False".`,
    `- fill-in-the-blank: the question text must contain "____" for the missing word(s); correct_answer = the missing word(s); options optional (empty array fine).`,
    `- sentence-correction: the question shows one sentence containing an error; the options are 4 candidate corrected sentences; correct_answer is the exact text of the one fully correct version.`,
    `- Every question MUST include a 1–2 sentence "explanation" that states the rule and the correct form.`,
    `- No two questions may repeat the same idea. Wrong options must be plausible but clearly wrong.`,
    `- Do not include the answer key anywhere except the "correct_answer" field.`,
    ``,
    `EXACT SHAPE TO FOLLOW (copy these field names and value formats):`,
    ...(types && types.length ? types.map((t) => `- ${t}: ${example(t)}`) : [example("mcq"), example("true-false"), example("fill-in-the-blank"), example("sentence-correction")]),
    ``,
    `Return ONLY the JSON.`,
  ].join("\n");
}

/**
 * Generate a validated, deduplicated question set for a topic assessment.
 * Uses adaptive top-up: each LLM call asks only for the still-missing count
 * and receives the already-accepted questions so it avoids repeats. Returns
 * null if the exact count cannot be reached (the route then returns a clear
 * error — nothing is ever fabricated or silently substituted).
 */
async function generateAssessmentQuestions({ topic, area, count = REQUIRED_COUNT, difficulty = "medium", types }) {
  const provider = resolveProvider();
  if (!provider) return null;

  const requestedTypes = Array.isArray(types) && types.length ? types : ["mcq", "true-false", "fill-in-the-blank"];
  const safeCount = Math.min(Math.max(3, Number(count) || REQUIRED_COUNT), 8);

  let lastError = null;
  let collected = [];
  const seen = new Set();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 0; attempt < MAX_TOTAL_ATTEMPTS && collected.length < safeCount; attempt++) {
    const missing = safeCount - collected.length;
    const prompt = buildAssessmentPrompt(topic, area, missing, difficulty, requestedTypes, collected);
    try {
      const rawText = await callLLM(provider, prompt);
      const array = parseQuestionArray(rawText);
      const reasons = {};
      const fresh = (array || [])
        .map((q) => validateQuestion(q, topic, (why) => { reasons[why] = (reasons[why] || 0) + 1; }))
        .filter(Boolean)
        .filter((q) => {
          const key = norm(q.question);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      collected = collected.concat(fresh);
      if (collected.length >= safeCount) {
        return collected.slice(0, safeCount);
      }
      lastError = new Error(`validation produced ${collected.length}/${safeCount} usable questions so far`);
      const top = Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${v}x ${k}`).join("; ");
      console.warn(`[englishAiService] attempt ${attempt + 1}: ${lastError.message}${top ? ` (rejections: ${top})` : ""}`);
      await sleep(1500); // small pause to keep the provider happy between top-ups
    } catch (err) {
      lastError = err;
      const is429 = err && (err.response && err.response.status === 429);
      console.warn(`[englishAiService] attempt ${attempt + 1} failed: ${err.message}${is429 ? " (rate limited — backing off)" : ""}`);
      await sleep(is429 ? 10000 : 2500);
    }
  }
  console.warn(`[englishAiService] giving up after ${MAX_TOTAL_ATTEMPTS} attempts: ${lastError?.message || ""}`);
  return null;
}

// ── AI writing feedback (guidance only — never a grade) ────────────────────

function buildFeedbackPrompt(topic, studentText) {
  const practice = topic.practice || {};
  return [
    `You are a kind, precise Class 8 English writing tutor. A student answered this task:`,
    ``,
    `TASK: ${practice.prompt || ""}`,
    ``,
    `RUBRIC:`,
    ...(practice.rubric || []).map((r) => `- ${r}`),
    ``,
    `STUDENT'S DRAFT:`,
    `"""${String(studentText || "").slice(0, 1600)}"""`,
    ``,
    `Write short, encouraging, actionable feedback. Do NOT rewrite the whole draft. Do NOT give a score or grade. `,
    `Return ONLY raw JSON (no markdown) shaped like:`,
    `{"strengths":["...","..."],"improvements":["...","..."],"overall":"one clear sentence summarising the next step"}`,
  ].join("\n");
}

function parseFeedback(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/gi, "").trim();
  let data = null;
  try { data = JSON.parse(cleaned); } catch (e) { data = null; }
  if (!data || typeof data !== "object") return null;
  const strengths = Array.isArray(data.strengths) ? data.strengths.filter((s) => typeof s === "string" && s.trim()) : [];
  const improvements = Array.isArray(data.improvements) ? data.improvements.filter((s) => typeof s === "string" && s.trim()) : [];
  const overall = typeof data.overall === "string" ? data.overall.trim() : "";
  if (!strengths.length && !improvements.length && !overall) return null;
  return { strengths, improvements, overall };
}

/**
 * Rubric-based AI guidance on a student's writing draft.
 * Returns null when the LLM cannot produce usable feedback.
 */
async function generateWritingFeedback({ topic, text }) {
  const provider = resolveProvider();
  if (!provider) return null;
  const prompt = buildFeedbackPrompt(topic, text);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let attempt = 0; attempt < FEEDBACK_ATTEMPTS; attempt++) {
    try {
      const raw = await callLLM(provider, prompt);
      const feedback = parseFeedback(raw);
      if (feedback) return feedback;
      console.warn(`[englishAiService] feedback parse failed (attempt ${attempt + 1})`);
      await sleep(1500);
    } catch (err) {
      const is429 = err && (err.response && err.response.status === 429);
      console.warn(`[englishAiService] feedback call failed (attempt ${attempt + 1}): ${err.message}${is429 ? " (rate limited)" : ""}`);
      await sleep(is429 ? 10000 : 2500);
    }
  }
  return null;
}

module.exports = {
  generateAssessmentQuestions,
  generateWritingFeedback,
  parseQuestionArray,
  validateQuestion,
  REQUIRED_COUNT,
};