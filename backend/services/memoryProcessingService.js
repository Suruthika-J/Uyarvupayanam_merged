// backend/services/memoryProcessingService.js
//
// Memory understanding pipeline:
//
//   save (pending) -> extract text (documents) | transcribe (voice)
//                  -> summarize + metadata (best-effort AI)
//                  -> ready | failed
//
// The ORIGINAL content is never replaced: `content` holds the user's own
// words (or the verbatim extracted document text), `summary`/`topics` are
// auxiliary metadata, and a failed AI stage never destroys the memory.
//
// Background execution: this app is a single Node process with no job queue
// infrastructure, so expensive stages run as in-process background tasks
// (fire-and-forget with a status guard). The UI polls status.

const fs = require("fs");
const path = require("path");
const Memory = require("../models/Memory");
const { transcribeAudio, summarizeMemory } = require("./memoryAiService");

const MAX_DOC_CHARS = 60000; // songs of text are fine, but cap what we index

// ── Text extraction from uploaded documents ────────────────────────────────
const TEXT_MIME = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
]);

async function extractDocumentText(filePath, mimeType) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("Uploaded document is missing on disk.");
  }
  const mime = String(mimeType || "").toLowerCase();

  if (mime === "application/pdf" || /\.pdf$/i.test(filePath)) {
    // pdf-parse is a backend dependency already used by other importers.
    const pdfParse = require("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = String(data && data.text || "").trim();
    if (!text) throw new Error("Could not extract any text from the PDF (scanned/unreadable).");
    return text.slice(0, MAX_DOC_CHARS);
  }

  if (TEXT_MIME.has(mime)) {
    const text = fs.readFileSync(filePath, "utf8").trim();
    if (!text) throw new Error("The document appears to be empty.");
    return text.slice(0, MAX_DOC_CHARS);
  }

  const err = new Error("Unsupported document type — upload a .txt, .md or .pdf file.");
  err.code = "UNSUPPORTED_DOC_TYPE";
  throw err;
}

// ── Single source of sentinel/status transitions ─────────────────────────
async function markProcessing(memory) {
  memory.status = "processing";
  memory.processAttempts = (memory.processAttempts || 0) + 1;
  memory.processingError = "";
  await memory.save();
}

async function markReady(memory) {
  memory.status = "ready";
  memory.processingError = "";
  await memory.save();
}

async function markFailed(memory, message) {
  memory.status = "failed";
  memory.processingError = String(message || "Processing failed.").slice(0, 500);
  await memory.save();
}

/**
 * Run the full pipeline for one memory. Idempotent-ish: guarded by a status
 * check so two concurrent clients can't double-process the same doc.
 */
async function processMemory(memoryId) {
  // The initial lookup can transiently fail when the DB connection is
  // re-establishing (e.g., a DNS blip to Atlas); retry briefly so a healthy
  // job isn't left stuck in "processing" by a hiccup.
  let memory = null;
  for (let attempt = 0; attempt < 4 && !memory; attempt++) {
    try {
      memory = await Memory.findById(memoryId);
    } catch (lookupErr) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      } else {
        console.warn(`[memory] lookup failed after retries for ${memoryId}: ${lookupErr.message}`);
        throw lookupErr;
      }
    }
  }
  if (!memory) return;
  if (memory.status === "processing") return; // already running

  await markProcessing(memory);

  try {
    // Stage 1 — extract / transcribe the real content.
    if (memory.type === "document") {
      const filePath = path.join(__dirname, "..", (memory.fileUrl || "").replace(/^\/uploads\//, "uploads/"));
      memory.content = await extractDocumentText(filePath, memory.mimeType);
    } else if (memory.type === "voice" && memory.fileUrl) {
      const transcript = await transcribeAudio({ fileUrl: memory.fileUrl, mimeType: memory.mimeType });
      memory.audioTranscript = transcript;
      memory.hasTranscript = true;
      if (!memory.voiceNote) memory.content = transcript;
      // If the user also typed a note we keep `content` = their note (their
      // words take priority) — the transcript is available for retrieval too.
    }

    // Stage 2 — best-effort AI metadata (never blocks, never replaces).
    const meta = await summarizeMemory({
      content: memory.content || memory.voiceNote || memory.audioTranscript,
      type: memory.type,
      title: memory.title,
    });
    if (meta && !memory.summary) {
      memory.summary = meta.summary;
      memory.topics = meta.topics;
      memory.entities = meta.entities;
      if (meta.eventDate && !memory.eventDate) memory.eventDate = meta.eventDate;
    }

    await markReady(memory);
  } catch (err) {
    // Non-fatal toll: if the user typed a voice note we can still index it
    // even when transcription failed — surface the error as info instead.
    const isVoiceWithNote = memory.type === "voice" && memory.voiceNote;
    if (isVoiceWithNote) {
      memory.content = memory.voiceNote || memory.content;
      await markReady(memory);
      memory.processingError = `Transcription unavailable (${err.message}) — your typed note is saved and searchable.`;
      try { await memory.save(); } catch (e) {}
    } else {
      await markFailed(memory, err.message);
    }
    console.warn(`[memory] processing failed for ${memoryId}: ${err.message}`);
  }
  return memory;
}

/** Fire-and-forget background processing (single-process architecture). */
function startProcessing(memoryId) {
  // Small delay so the API response can flush before heavy work starts.
  setTimeout(() => {
    processMemory(memoryId).catch((err) =>
      console.warn(`[memory] background processing crashed for ${memoryId}: ${err.message}`)
    );
  }, 50);
}

/**
 * Boot-time crash recovery. In-process jobs die with the process (no durable
 * queue), so after a restart any memory still pending/processing would stay
 * stuck forever. We surface them as failed-with-message so the UI shows the
 * Retry action instead of an endless spinner. Re-queueing is deliberately
 * avoided: re-running could duplicate AI summarization side effects, while
 * failed-with-retry keeps the "never silently stuck" guarantee.
 */
async function recoverInterrupted() {
  try {
    const res = await Memory.updateMany(
      { status: { $in: ["pending", "processing"] } },
      {
        $set: {
          status: "failed",
          processingError: "Processing was interrupted by a server restart. Tap Retry to process again.",
        },
      }
    );
    if (res && res.modifiedCount > 0) {
      console.warn(`[memory] recovered ${res.modifiedCount} interrupted memory job(s) after restart.`);
    }
  } catch (err) {
    console.warn("[memory] recovery scan skipped:", err.message);
  }
}

module.exports = {
  processMemory,
  startProcessing,
  recoverInterrupted,
  extractDocumentText,
  MAX_DOC_CHARS,
};