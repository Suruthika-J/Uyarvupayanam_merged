const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  generateRoadmap,
  getCurrentRoadmap,
  listUserRoadmaps,
  activateRoadmap,
  toggleTopicCompletion,
  recalculateAdaptiveRoadmap,
  getTodayPlan,
  getWeeklyPlan
} = require("../controllers/learningRoadmapController");

router.post("/generate", verifyStudent, generateRoadmap);
router.get("/current", verifyStudent, getCurrentRoadmap);
router.get("/list", verifyStudent, listUserRoadmaps);
router.post("/:roadmapId/activate", verifyStudent, activateRoadmap);
router.post("/:roadmapId/topic/:topicId/complete", verifyStudent, toggleTopicCompletion);
router.post("/:roadmapId/recalculate", verifyStudent, recalculateAdaptiveRoadmap);
router.get("/:roadmapId/today", verifyStudent, getTodayPlan);
router.get("/:roadmapId/weekly", verifyStudent, getWeeklyPlan);

module.exports = router;
