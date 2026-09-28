const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getStreams,
  getAllStreams,
  createStream,
  updateStream,
  togglePublish,
  deleteStream,
  bulkReorder,
  bulkImport,
  uploadThemeAsset,
} = require("../controllers/streamController");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// ─── Theme asset uploads (uploads/themes) ──────────────────────────────
const themesDir = path.join(__dirname, "..", "uploads", "themes");
fs.mkdirSync(themesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, themesDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

// ─── Public ─────────────────────────────────────────────────────────────
router.get("/", getStreams);

// ─── Admin ──────────────────────────────────────────────────────────────
router.get("/admin", verifyAdmin, getAllStreams);
router.post("/admin", verifyAdmin, createStream);
router.put("/admin/:id", verifyAdmin, updateStream);
router.patch("/admin/:id/toggle-publish", verifyAdmin, togglePublish);
router.delete("/admin/:id", verifyAdmin, deleteStream);
router.post("/admin/bulk-reorder", verifyAdmin, bulkReorder);
router.post("/admin/bulk-import", verifyAdmin, bulkImport);
router.post("/admin/theme-assets/upload", verifyAdmin, upload.single("image"), uploadThemeAsset);

module.exports = router;