const express = require("express");
const router = express.Router();

const {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getExams,
  getExamByIdOrSlug,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/graduateExamController");
const verifyAdmin = require("../middleware/verifyAdmin");

/* ── Organizations ────────────────────────────────────────────────────────── */

// @route   GET /api/graduate-exams/organizations  (public)
// @route   GET /api/graduate-exams/organizations/:id  (public)
// @route   POST|PUT|DELETE .../organizations...     (admin)
router.get("/organizations", getOrganizations);
router.get("/organizations/:id", getOrganizationById);
router.post("/organizations", verifyAdmin, createOrganization);
router.put("/organizations/:id", verifyAdmin, updateOrganization);
router.delete("/organizations/:id", verifyAdmin, deleteOrganization);

/* ── Exams ────────────────────────────────────────────────────────────────── */

// @route   GET /api/graduate-exams  (public list w/ search & filters)
// @route   GET /api/graduate-exams/:idOrSlug  (public detail)
// @route   POST|PUT|DELETE  (admin)
router.get("/", getExams);
router.get("/:idOrSlug", getExamByIdOrSlug);
router.post("/", verifyAdmin, createExam);
router.put("/:id", verifyAdmin, updateExam);
router.delete("/:id", verifyAdmin, deleteExam);

module.exports = router;