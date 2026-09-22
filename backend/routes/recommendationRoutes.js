// ============================================================================
// Recommendation Routes (School Module)
// Mounted at /api/recommendations in server.js
//   GET /api/recommendations/:studentId?studyMinutes=120
// ============================================================================

const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

// Read-only endpoint: builds the academic recommendation snapshot on the fly
// from the student's saved onboarding + quiz results.
router.get("/:studentId", recommendationController.getRecommendations);

module.exports = router;