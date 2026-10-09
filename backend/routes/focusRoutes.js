const express = require("express");
const router  = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  startFocusSession,
  getCurrentSession,
  addFocusEvents,
  pauseFocusSession,
  resumeFocusSession,
  updateFocusSession,
  completeFocusSession,
  endFocusSession,
  getFocusHistory,
  getTodayFocusStats,
  getWeeklyFocusStats,
  getSubjectAnalytics,
  getFocusAnalytics,
  getFocusStats
} = require("../controllers/focusController");

// All routes require authentication

// Session lifecycle endpoints
router.post("/start",               verifyStudent, startFocusSession);
router.post("/sessions",            verifyStudent, startFocusSession);

router.get("/sessions/current",     verifyStudent, getCurrentSession);
router.get("/current",              verifyStudent, getCurrentSession);

router.post("/sessions/:id/events", verifyStudent, addFocusEvents);
router.post("/:id/events",          verifyStudent, addFocusEvents);

router.post("/sessions/:id/pause",  verifyStudent, pauseFocusSession);
router.post("/:id/pause",           verifyStudent, pauseFocusSession);

router.post("/sessions/:id/resume", verifyStudent, resumeFocusSession);
router.post("/:id/resume",          verifyStudent, resumeFocusSession);

router.post("/sessions/:id/end",    verifyStudent, endFocusSession);
router.post("/:id/end",             verifyStudent, endFocusSession);

router.post("/sessions/:id/complete", verifyStudent, completeFocusSession);
router.post("/:id/complete",        verifyStudent, completeFocusSession);

router.patch("/:id",                verifyStudent, updateFocusSession);

// Analytics endpoints
router.get("/analytics",            verifyStudent, getFocusAnalytics);
router.get("/stats",                verifyStudent, getFocusStats);

router.get("/analytics/weekly",     verifyStudent, getWeeklyFocusStats);
router.get("/weekly",               verifyStudent, getWeeklyFocusStats);

router.get("/analytics/subjects",   verifyStudent, getSubjectAnalytics);
router.get("/subjects",             verifyStudent, getSubjectAnalytics);

router.get("/history",              verifyStudent, getFocusHistory);
router.get("/today",                verifyStudent, getTodayFocusStats);

module.exports = router;
