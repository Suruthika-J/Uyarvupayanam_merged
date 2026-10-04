// backend/routes/memoryRoutes.js
//
// Personal Memory Vault — authenticated CRUD + processing + retrieval-facing
// endpoints. EVERY route derives the user from the JWT (req.student._id);
// no client-supplied userId/studentId is ever trusted.
//
//   POST   /              create a memory (handles file uploads for voice/document)
//   GET    /              list/search/filter the user's memories
//   GET    /:id           one memory
//   PUT    /:id           edit (re-processes after a meaningful change)
//   DELETE /:id           delete a memory + its file attachment
//   POST   /:id/reprocess re-run the processing pipeline
//   GET    /settings      memory privacy settings
//   PUT    /settings      toggle "use memories in AI chat"

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");
const Memory = require("../models/Memory");
const MemorySettings = require("../models/MemorySettings");
const { startProcessing, processMemory } = require("../services/memoryProcessingService");
const { retrieveMemories } = require("../services/memoryRetrievalService");

const MEMORY_TYPES = Memory.MEMORY_TYPES;

// ── File uploads (voice audio + documents) ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/memories");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = /^\.[a-z0-9]{1,8}$/i.test(ext) ? ext : "";
    cb(null, `mem-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — covers long voice notes + PDFs
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase();
    const allowed =
      /^audio\//.test(mime) ||
      ["application/pdf", "text/plain", "text/markdown", "text/csv", "application/json"].includes(mime) ||
      [".txt", ".md", ".markdown", ".pdf", ".csv", ".json"].includes(ext);
    cb(allowed ? null : new Error("Unsupported file type. Use audio (voice) or .txt/.md/.pdf documents."), allowed);
  },
});

const createLimit = rateLimit({
  keyFn: (req) => `${req.student._id}:mem-create`,
  max: 30,
  windowMs: 60 * 60 * 1000,
  message: "Too many memories created. Please slow down.",
});

// ── helpers ───────────────────────────────────────────────────────────────
// Serialize a Memory doc (mongoose or lean) into a stable client shape with
// no internal fields (userId, embeddingRef, etc.) ever exposed.
function publicMemory(m) {
  if (!m) return null;
  const d = m.toSafeJSON ? m.toSafeJSON() : m;
  return {
    id: String(d.id || m._id || ""),
    type: d.type,
    title: d.title || "",
    content: d.content || "",
    voiceNote: d.voiceNote || "",
    audioTranscript: d.audioTranscript || "",
    hasTranscript: !!d.hasTranscript,
    summary: d.summary || "",
    topics: d.topics || [],
    entities: d.entities || [],
    eventDate: d.eventDate || null,
    fileUrl: d.fileUrl || "",
    fileName: d.fileName || "",
    mimeType: d.mimeType || "",
    status: d.status,
    processingError: d.processingError || "",
    processAttempts: d.processAttempts || 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// Turn multer's middleware into one that sends JSON errors instead of the
// default HTML error page (Express 5 would otherwise 500 on bad uploads).
function guardedFile(mw) {
  return (req, res, next) =>
    mw(req, res, (err) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File is too large (max 20MB)." });
      }
      return res.status(400).json({ success: false, message: err.message || "Upload failed." });
    });
}
const uploadOne = guardedFile(upload.single("file"));

function isOwnedMemory(req, mem) {
  return mem && String(mem.userId) === String(req.student._id);
}

const textForType = {
  journal: "Write your journal entry",
  email: "Paste the email or letter text",
  story: "Write your story or note",
};

function validateCreateBody(body, hasFile) {
  const type = String(body.type || "").trim();
  if (!MEMORY_TYPES.includes(type)) return "Please choose a valid memory type.";

  const content = String(body.content || "").trim();
  const voiceNote = String(body.voiceNote || "").trim();

  if (type === "voice") {
    if (!hasFile && !voiceNote) return "Add a voice recording or type a short note.";
  } else if (type === "document") {
    if (!hasFile) return "Attach a document (.txt, .md or .pdf) to save.";
  } else {
    if (!content) return `Please add some text — ${textForType[type]}.`;
    if (content.length < 3) return "Your memory is a little too short to save.";
  }
  return null;
}

// ── POST / — create ────────────────────────────────────────────────────────
router.post("/", verifyStudent, createLimit, uploadOne, async (req, res) => {
  try {
    const errMsg = validateCreateBody(req.body || {}, !!req.file);
    if (errMsg) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: errMsg });
    }

    const body = req.body || {};
    const type = body.type;
    const content = type === "voice" ? req.body.voiceNote || "" :
                    type === "document" ? "" : String(body.content || "").trim();

    const title = String(body.title || "").trim().slice(0, 120);
    let eventDate = null;
    if (body.eventDate) {
      const d = new Date(body.eventDate);
      if (!Number.isNaN(d.getTime())) eventDate = d;
    }

    const memory = await Memory.create({
      userId: req.student._id,
      type,
      title,
      content,
      voiceNote: type === "voice" ? String(body.voiceNote || "").trim() : "",
      eventDate,
      fileUrl: req.file ? `/uploads/memories/${req.file.filename}` : "",
      fileName: req.file ? req.file.originalname : "",
      mimeType: req.file ? req.file.mimetype : "",
      status: "pending",
    });

    startProcessing(memory._id);

    res.status(201).json({ success: true, memory: publicMemory(memory) });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "File is too large (max 20MB)."
      : err.message === "Unsupported file type. Use audio (voice) or .txt/.md/.pdf documents."
        ? err.message
        : "Could not save the memory.";
    console.error("[memory] create failed:", err.message);
    res.status(err.code === "LIMIT_FILE_SIZE" || /Unsupported file type/.test(err.message) ? 400 : 500)
      .json({ success: false, message });
  }
});

// ── GET / — list, search, filter ───────────────────────────────────────────
router.get("/", verifyStudent, async (req, res) => {
  try {
    const { q, type, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    // Search with q -> retrieval engine; otherwise simple listing.
    let items;
    let total = 0;
    let searchUsed = false;

    if (q && String(q).trim()) {
      const hits = await retrieveMemories({
        userId: req.student._id,
        query: String(q).trim(),
        types: type ? [type] : [],
        limit: limitNum,
        minScore: 0.2,
      });
      // Enrich with full safe docs.
      const ids = hits.map((h) => h.memoryId);
      const docs = ids.length ? await Memory.find({ _id: { $in: ids }, userId: req.student._id }).lean() : [];
      const byId = new Map(docs.map((d) => [String(d._id), d]));
      items = hits
        .map((h) => ({ ...publicMemory(byId.get(h.memoryId)), relevance: h.score }))
        .filter(Boolean);
      searchUsed = true;
    } else {
      const filter = { userId: req.student._id };
      if (type && MEMORY_TYPES.includes(type)) filter.type = type;
      if (status && Memory.PROCESSING_STATUSES.includes(status)) filter.status = status;
      total = await Memory.countDocuments(filter);
      items = await Memory.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
        .then((rows) => rows.map(publicMemory));
    }

    // Per-type counts for filter chips (small, user-scoped).
    const byType = {};
    const counts = await Memory.aggregate([
      { $match: { userId: req.student._id } },
      { $group: { _id: "$type", n: { $sum: 1 } } },
    ]);
    counts.forEach((c) => { byType[c._id] = c.n; });

    res.json({
      success: true,
      items,
      total: searchUsed ? items.length : total,
      page: pageNum,
      searchUsed,
      byType,
      statuses: {
        pending: (await Memory.countDocuments({ userId: req.student._id, status: { $in: ["pending", "processing"] } })),
        failed: (await Memory.countDocuments({ userId: req.student._id, status: "failed" })),
      },
    });
  } catch (err) {
    console.error("[memory] list failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load memories." });
  }
});

// ── GET /settings, PUT /settings — privacy controls ───────────────────────
// NOTE: registered BEFORE the /:id routes on purpose, so "settings" is never
// treated as a memory id.
router.get("/settings", verifyStudent, async (req, res) => {
  try {
    let settings = await MemorySettings.findOne({ userId: req.student._id });
    if (!settings) {
      settings = await MemorySettings.create({ userId: req.student._id, useMemoryInChat: true });
    }
    res.json({ success: true, useMemoryInChat: settings.useMemoryInChat !== false });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not load memory settings." });
  }
});

router.put("/settings", verifyStudent, async (req, res) => {
  try {
    const useMemoryInChat = req.body && req.body.useMemoryInChat === true;
    const settings = await MemorySettings.findOneAndUpdate(
      { userId: req.student._id },
      { $set: { useMemoryInChat } },
      { upsert: true, new: true }
    );
    res.json({ success: true, useMemoryInChat: settings.useMemoryInChat === true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update memory settings." });
  }
});

// ── GET /:id ───────────────────────────────────────────────────────────────
router.get("/:id", verifyStudent, async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.student._id });
    if (!memory) return res.status(404).json({ success: false, message: "Memory not found." });
    res.json({ success: true, memory: publicMemory(memory) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not load the memory." });
  }
});

// ── PUT /:id — edit (re-processes when the real content changes) ──────────
router.put("/:id", verifyStudent, uploadOne, async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.student._id });
    if (!memory) return res.status(404).json({ success: false, message: "Memory not found." });

    const body = req.body || {};
    const contentChanged = typeof body.content === "string" && body.content.trim() !== memory.content;
    const titleChanged = typeof body.title === "string" && body.title.trim() !== memory.title;

    if (typeof body.title === "string") memory.title = body.title.trim().slice(0, 120);
    if (memory.type === "voice" && typeof body.voiceNote === "string") {
      if (body.voiceNote.trim() !== memory.voiceNote) {
        memory.voiceNote = body.voiceNote.trim();
        memory.content = memory.voiceNote;
      }
    }
    if (contentChanged) {
      if (!body.content.trim()) return res.status(400).json({ success: false, message: "Content cannot be empty." });
      memory.content = body.content.trim();
      memory.summary = "";
      memory.topics = [];
      memory.entities = [];
    }
    if (body.eventDate === "") memory.eventDate = null;
    else if (body.eventDate) {
      const d = new Date(body.eventDate);
      if (!Number.isNaN(d.getTime())) memory.eventDate = d;
    }

    // Replacement file
    const fileReplaced = req.file;
    if (fileReplaced) {
      if (memory.fileUrl) {
        const old = path.join(__dirname, "..", memory.fileUrl.replace(/^\/uploads\//, "uploads/"));
        fs.unlink(old, () => {});
      }
      memory.fileUrl = `/uploads/memories/${req.file.filename}`;
      memory.fileName = req.file.originalname;
      memory.mimeType = req.file.mimetype;
      if (memory.type === "voice") { memory.audioTranscript = ""; memory.hasTranscript = false; }
      if (memory.type === "document") memory.content = "";
    }

    await memory.save();

    const reprocess = contentChanged || fileReplaced || (memory.type === "voice" && memory.voiceNote);
    if (reprocess) startProcessing(memory._id);

    res.json({ success: true, memory: publicMemory(memory), reprocessing: reprocess });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("[memory] update failed:", err.message);
    res.status(500).json({ success: false, message: "Could not update the memory." });
  }
});

// ── DELETE /:id (removes the memory + its file + derived metadata) ────────
router.delete("/:id", verifyStudent, async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.student._id });
    if (!memory) return res.status(404).json({ success: false, message: "Memory not found." });

    if (memory.fileUrl) {
      const p = path.join(__dirname, "..", memory.fileUrl.replace(/^\/uploads\//, "uploads/"));
      fs.unlink(p, () => {});
    }
    await Memory.deleteOne({ _id: memory._id });

    res.json({ success: true, message: "Memory deleted." });
  } catch (err) {
    console.error("[memory] delete failed:", err.message);
    res.status(500).json({ success: false, message: "Could not delete the memory." });
  }
});

// ── POST /:id/reprocess — retry a failed (or refresh a ready) memory ──────
router.post(
  "/:id/reprocess",
  verifyStudent,
  rateLimit({ keyFn: (req) => `${req.student._id}:mem-reprocess:${req.params.id}`, max: 10, windowMs: 60000 }),
  async (req, res) => {
    try {
      const memory = await Memory.findOne({ _id: req.params.id, userId: req.student._id });
      if (!memory) return res.status(404).json({ success: false, message: "Memory not found." });
      startProcessing(memory._id);
      res.json({ success: true, message: "Processing restarted." });
    } catch (err) {
      res.status(500).json({ success: false, message: "Could not restart processing." });
    }
  }
);

module.exports = router;