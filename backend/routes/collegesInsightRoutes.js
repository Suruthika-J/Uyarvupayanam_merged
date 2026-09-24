const express = require("express");
const router = express.Router();
const {
  getInsightSummary,
  getCategoryCourses,
  getCourseColleges,
} = require("../controllers/collegesInsightController");

// Public read endpoints — no auth. Backed by the admin's College-Course
// Mapping data (only confirmed/active mappings are exposed).
router.get("/", getInsightSummary);
router.get("/:category/courses", getCategoryCourses);
router.get("/:category/courses/:courseId/colleges", getCourseColleges);

module.exports = router;