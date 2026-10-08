const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  getDefaultResume,
  generateResume,
  analyzeAts,
  resumeReadiness,
  listResumes,
  createResume,
  getResume,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");

router.get("/resume/default", verifyStudent, getDefaultResume);
router.post("/resume/generate", verifyStudent, generateResume);
router.post("/resume/ats", verifyStudent, analyzeAts);
router.post("/resume/readiness", verifyStudent, resumeReadiness);
router.get("/resumes", verifyStudent, listResumes);
router.post("/resumes", verifyStudent, createResume);
router.get("/resumes/:id", verifyStudent, getResume);
router.put("/resumes/:id", verifyStudent, updateResume);
router.delete("/resumes/:id", verifyStudent, deleteResume);

module.exports = router;
