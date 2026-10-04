// backend/services/memoryAiService.js
//
// AI support services for the personal memory system. The LLM is used ONLY
// to (a) transcribe voice recordings and (b) produce auxiliary metadata
// (summary / topics / entities). All AI output is validated server-side and
// the ORIGINAL user content is never replaced or rewritten by the AI.
//
// Provider rules:
//   - summarization reuses the shared gateway (utils/aiQuestionGenerator)
//     so there is exactly one AI integration path in the backend
//   - transcription uses Groq's Whisper API when GROQ_API_KEY is set (the
//     Groq endpoint is audio-transcription only; no chat content is sent)
//   - both features degrade gracefully: a failure never breaks saving a
//     memory, it only marks the pipeline stage as unavailable

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { resolveProvider, callLLM } = require("../utils/aiQuestionGenerator");

const TRANSCRIBE_URL = process.env.MEMORY_TRANSCRIBE_URL || "https://api.groq.com/openai/v1/audio/transcriptions";
const TRANSCRIBE_MODEL = process.env.MEMORY_TRANSCRIBE_MODEL || "whisper-large-v3-turbo";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

const SUPPORTED_AUDIO_MIME = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
]);

function isAudioMime(mime) {
  return SUPPORTED_AUDIO_MIME.has(String(mime || "").toLowerCase());
}

/**
 * Transcribe an audio file via Groq Whisper. Throws with a clear, safe
 * message when transcription is not possible (no key, network failure,
 * provider error, invalid response). The caller decides how to degrade.
 */
async function transcribeAudio({ fileUrl, mimeType }) {
  if (!GROQ_KEY) {
    const err = new Error("No transcription provider configured (GROQ_API_KEY missing).");
    err.code = "NO_TRANSCRIBE_PROVIDER";
    throw err;
  }
  if (!fileUrl) throw new Error("No audio file attached to transcribe.");

  // fileUrl is stored as /uploads/... — resolve to the real filesystem path.
  const filePath = path.join(__dirname, "..", fileUrl.replace(/^\/uploads\//, "uploads/"));
  if (!fs.existsSync(filePath)) throw new Error("Audio file missing on disk.");

  const fd = new FormData();
  fd.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: mimeType || "audio/webm",
  });
  fd.append("model", TRANSCRIBE_MODEL);
  fd.append("response_format", "json");
  fd.append("language", "en");

  const res = await axios.post(TRANSCRIBE_URL, fd, {
    headers: { ...fd.getHeaders(), Authorization: `Bearer ${GROQ_KEY}` },
    timeout: 90000,
    maxContentLength: 25 * 1024 * 1024,
  });

  const text = res.data && typeof res.data.text === "string" ? res.data.text.trim() : "";
  if (!text) {
    const err = new Error("Transcription returned no text.");
    err.code = "EMPTY_TRANSCRIPT";
    throw err;
  }
  return text;
}

/**
 * Build a compact, memory-safe AI summary + metadata. Returns null on any
 * failure (missing provider, invalid output) — summarization is best-effort
 * and NEVER blocks saving a memory or marks it failed.
 */
async function summarizeMemory({ content, type, title = "" }) {
  const provider = resolveProvider();
  if (!provider) return null;

  const text = String(content || "").trim();
  if (!text) return null;

  const typeLabel = { voice: "voice recording", journal: "journal entry", email: "email/letter", document: "document", story: "story/note" }[type] || "note";

  const prompt = [
    `You are helping organize a person's private "memory vault". Below is the full text of a ${typeLabel} they saved.`,
    `Produce a short, neutral structure about THIS text only — never add facts that are not present.`,
    "",
    `MEMORY TEXT:`,
    text.slice(0, 6000),
    "",
    `Return ONLY raw JSON with exactly this shape (no markdown, no commentary):`,
    `{"summary":"2-3 sentence plain-language summary in the person's own vocabulary","topics":["up to 6 short topic labels"],"entities":["up to 6 people/places/organizations mentioned, exact names only"],"eventDate":"yyyy-mm-dd or empty string"}`,
    "",
    `Rules:`,
    `- summary must clearly reflect what the person actually wrote; do not infer motives`,
    `- topics: short lowercase labels like "career", "family", "health", "studies"`,
    `- entities: only names literally present in the text; empty array if none`,
    `- eventDate: only if a concrete calendar date is present in the text; otherwise empty string`,
    `- do not output anything not present in the text`,
  ].join("\n");

  try {
    const raw = await callLLM(provider, prompt);
    const parsed = extractMemoryMetadata(raw);
    return parsed || null;
  } catch (err) {
    console.warn(`[memoryAi] summarize failed (non-fatal): ${err.message}`);
    return null;
  }
}

// Tolerant parser: accepts {"summary":...} or a bare object, tolerates code
// fences, and validates shapes so the AI can never inject junk into the DB.
function extractMemoryMetadata(rawText) {
  const cleaned = String(rawText || "")
    .replace(/```json/gi, "")
    .replace(/```/gi, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  let obj;
  try {
    obj = JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;

  const summary = typeof obj.summary === "string" ? obj.summary.trim().slice(0, 600) : "";
  const topics = Array.isArray(obj.topics)
    ? obj.topics.map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 6)
    : [];
  const entities = Array.isArray(obj.entities)
    ? obj.entities.map((e) => String(e).trim().slice(0, 60)).filter(Boolean).slice(0, 6)
    : [];
  let eventDate = null;
  if (typeof obj.eventDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(obj.eventDate.trim())) {
    const d = new Date(`${obj.eventDate.trim()}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) eventDate = d;
  }

  if (!summary) return null;
  return { summary, topics, entities, eventDate };
}

module.exports = { transcribeAudio, summarizeMemory, isAudioMime, extractMemoryMetadata };