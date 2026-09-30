const express = require("express");
const router  = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  startFocusSession,
  addFocusEvents,
  updateFocusSession,
  completeFocusSession,
  endFocusSession,
  getFocusHistory,
  getTodayFocusStats,
  getWeeklyFocusStats,
  getFocusStats
} = require("../controllers/focusController");

// All routes require authentication
router.post("/start",          verifyStudent, startFocusSession);
router.post("/:id/events",     verifyStudent, addFocusEvents);
router.patch("/:id",           verifyStudent, updateFocusSession);
router.post("/:id/complete",   verifyStudent, completeFocusSession);
router.post("/:id/end",        verifyStudent, endFocusSession);
router.get("/history",         verifyStudent, getFocusHistory);
router.get("/today",           verifyStudent, getTodayFocusStats);
router.get("/weekly",          verifyStudent, getWeeklyFocusStats);
router.get("/stats",           verifyStudent, getFocusStats);

module.exports = router;
