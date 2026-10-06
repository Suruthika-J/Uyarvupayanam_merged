// ============================================================================
// Recommendation Routes (School Module)
// Mounted at /api/recommendations in server.js
//   GET /api/recommendations/:studentId?studyMinutes=120
// ============================================================================

const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const verifyStudent = require("../middleware/verifyStudent");
const verifyOwnership = require("../middleware/verifyOwnership");

// Read-only endpoint: builds the academic recommendation snapshot on the fly
// from the student's saved onboarding + quiz results.
// Own-data only: the :studentId must equal the authenticated student.
router.get("/:studentId", verifyStudent, verifyOwnership("studentId"), recommendationController.getRecommendations);

module.exports = router;