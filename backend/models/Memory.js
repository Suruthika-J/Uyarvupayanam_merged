// backend/models/Memory.js
//
// Personal memory vault — the single source of truth for everything a user
// saves about their own life (voice recordings, journal entries, emails /
// letters, uploaded documents, stories and notes).
//
// Privacy & safety rules applied by the routes/services:
//   - every query filters by userId derived from the JWT (req.student._id);
//     a client-supplied userId is never trusted
//   - the ORIGINAL user content is preserved verbatim in `content`; the
//     AI-generated `summary` is auxiliary metadata and can never replace it
//   - file attachments are referenced by URL under /uploads/memories/...

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MEMORY_TYPES = ["voice", "journal", "email", "document", "story"];
const PROCESSING_STATUSES = ["pending", "processing", "ready", "failed"];

const memorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: MEMORY_TYPES, required: true },

    // Original content the user provided (journal/email/story text, document
    // extracted text, or the voice note the user typed while recording).
    content: { type: String, default: "" },

    // Raw voice note supplied by the user at save time (kept separately so a
    // failed transcription never silently replaces what the user said).
    voiceNote: { type: String, default: "" },

    // Groq-Whisper transcription of a voice recording (when supported).
    audioTranscript: { type: String, default: "" },
    hasTranscript: { type: Boolean, default: false },

    title: { type: String, trim: true, default: "" },

    // Attachment reference (voice audio / uploaded document).
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },

    // AI enrichment (never replaces `content`).
    summary: { type: String, default: "" },
    topics: { type: [String], default: [] },
    entities: { type: [String], default: [] },
    eventDate: { type: Date, default: null },

    // Processing pipeline state: pending -> processing -> ready | failed
    status: { type: String, enum: PROCESSING_STATUSES, default: "pending" },
    processingError: { type: String, default: "" },
    processAttempts: { type: Number, default: 0 },

    // Embedding reference (reserved; the current deployment uses hybrid
    // lexical + fuzzy retrieval, so this stays null — no vector DB exists).
    embeddingRef: { type: String, default: null },
  },
  { timestamps: true }
);

// ── Indexes (privacy-first: every index is userId-scoped) ────────────────
memorySchema.index({ userId: 1, createdAt: -1 });
memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, status: 1 });
// MongoDB full-text index used as one candidate source by the retrieval
// engine. Text indexes are collection-wide; the engine additionally filters
// every query by userId so cross-user text hits are impossible at the doc
// level, and lexical re-scoring happens per user below that.
memorySchema.index(
  { title: "text", summary: "text", topics: "text", content: "text" },
  { name: "memory_search_text", weights: { title: 4, summary: 2, topics: 3, content: 1 } }
);

memorySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    type: this.type,
    title: this.title || "",
    content: this.content || "",
    voiceNote: this.voiceNote || "",
    audioTranscript: this.audioTranscript || "",
    hasTranscript: !!this.hasTranscript,
    summary: this.summary || "",
    topics: this.topics || [],
    entities: this.entities || [],
    eventDate: this.eventDate || null,
    fileUrl: this.fileUrl || "",
    fileName: this.fileName || "",
    mimeType: this.mimeType || "",
    status: this.status,
    processingError: this.processingError || "",
    processAttempts: this.processAttempts || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.models.Memory || mongoose.model("Memory", memorySchema);
module.exports.MEMORY_TYPES = MEMORY_TYPES;
module.exports.PROCESSING_STATUSES = PROCESSING_STATUSES;