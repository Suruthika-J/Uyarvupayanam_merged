const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getCollegeScholarships,
  getRecommendedScholarships,
  getCollegeScholarshipById,
  createCollegeScholarship,
  updateCollegeScholarship,
  deleteCollegeScholarship,
  importCollegeScholarshipsCSV,
  getMyApplicationStatuses,
  setApplicationStatus
} = require("../controllers/collegeScholarshipController");

// ── Student Routes ─────────────────────────────────────────────────────────

// Public browse (no auth required — works for unauthenticated visitors too)
router.get("/", getCollegeScholarships);

// IMPORTANT: specific string routes must be declared BEFORE the /:id wildcard
// to prevent Express from interpreting "recommended" or "my-applications" as an ID
router.get("/recommended", verifyStudent, getRecommendedScholarships);
router.get("/my-applications", verifyStudent, getMyApplicationStatuses);

// Scholarship detail — public
router.get("/:id", getCollegeScholarshipById);

// Application status tracking — requires student login
router.post("/:id/apply-status", verifyStudent, setApplicationStatus);

// ── Admin Routes (Protected) ───────────────────────────────────────────────
router.post("/", verifyAdmin, createCollegeScholarship);
router.put("/:id", verifyAdmin, updateCollegeScholarship);
router.delete("/:id", verifyAdmin, deleteCollegeScholarship);
router.post("/import", verifyAdmin, importCollegeScholarshipsCSV);

module.exports = router;

