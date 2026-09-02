const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyStudent = require("../middleware/verifyStudent");
const {
  getProgress,
  completeStep,
  submitActivityResult,
  getOrGenerateDailyMission,
  completeDailyMission,
  uploadVoiceRecording,
  getPublicPassport,
} = require("../controllers/class5CommunicationController");

// Configure Multer for voice recordings upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/voice-recordings");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Determine extension, default to .webm as standard MediaRecorder format
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `voice-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit
});

// Authenticated student routes
router.get("/progress", verifyStudent, getProgress);
router.post("/step", verifyStudent, completeStep);
router.post("/activity-result", verifyStudent, submitActivityResult);
router.get("/daily-mission", verifyStudent, getOrGenerateDailyMission);
router.post("/daily-mission/complete", verifyStudent, completeDailyMission);
router.post("/voice-recording", verifyStudent, upload.single("audio"), uploadVoiceRecording);

// Public passport route (accessible by parents and teachers)
router.get("/passport/:studentId", getPublicPassport);

module.exports = router;
