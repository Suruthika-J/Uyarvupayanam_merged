const express = require("express");
const {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  bulkInsertColleges,
  getOfferedCourses,
  importCoursesFromPdf,
} = require("../controllers/collegeController");
const {
  fetchCollegeCourses,
  getFetchedCourses,
  syncCourses,
  bulkFetchAllCourses
} = require("../controllers/automatedCourseController");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// Public routes
router.get("/", getAllColleges);
router.get("/:id", getCollegeById);
router.get("/:id/offered-courses", getOfferedCourses);

// Admin-protected routes
router.post("/", verifyAdmin, createCollege);
router.post("/bulk", verifyAdmin, bulkInsertColleges);
router.put("/:id", verifyAdmin, updateCollege);
router.delete("/:id", verifyAdmin, deleteCollege);
router.post("/import-courses-from-pdf", verifyAdmin, importCoursesFromPdf);

// Automated Course Fetching Routes
router.post("/bulk/fetch-all-courses", verifyAdmin, bulkFetchAllCourses);
router.post("/:id/fetch-courses", verifyAdmin, fetchCollegeCourses);
router.get("/:id/courses", verifyAdmin, getFetchedCourses);
router.post("/:id/sync-courses", verifyAdmin, syncCourses);

module.exports = router;
