const express = require("express");
const router = express.Router();
const {
  getInsightSummary,
  getCategoryCourses,
  getCourseColleges,
  getCategoryColleges,
  getCollegeCourses,
} = require("../controllers/collegesInsightController");

// Public read endpoints — no auth. Backed by the admin's College-Course
// Mapping data (only confirmed/active mappings are exposed).
router.get("/", getInsightSummary);
router.get("/:category/courses", getCategoryCourses);
router.get("/:category/courses/:courseId/colleges", getCourseColleges);
// College detail endpoints (multi-stream: returns courses from every stream).
router.get("/colleges/:collegeId/courses", getCollegeCourses);
router.get("/:category/colleges", getCategoryColleges);

module.exports = router;