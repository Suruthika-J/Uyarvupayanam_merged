const express = require("express");
const router = express.Router();
const {
  getAdvisorRecommendations,
  getCareerDetail,
  setTargetCareer,
  getStudentSkillGap,
  acquireSkillProgress,
  getSkillAssessmentQuestions,
  verifySkillAssessment,
  getStudentRoadmap,
  updateRoadmapProgress,
  runAcceptanceTestProfiles,
  compareCareers,
  getAllCareersAdmin,
  adminSaveCareer,
  adminDeleteCareer
} = require("../controllers/collegeAdvisorController");
const verifyStudent = require("../middleware/verifyStudent");
const verifyAdmin = require("../middleware/verifyAdmin");
const requireTestFlag = require("../middleware/requireTestFlag");

const { getCurrentRoadmap } = require("../controllers/learningRoadmapController");

// Protected Student Routes
router.get("/recommendations", verifyStudent, getAdvisorRecommendations);
router.get("/career/:slug", verifyStudent, getCareerDetail);
router.post("/target-career", verifyStudent, setTargetCareer);
router.get("/skill-gap", verifyStudent, getStudentSkillGap);
router.post("/skill/acquire", verifyStudent, acquireSkillProgress);
router.get("/skill/assessment", verifyStudent, getSkillAssessmentQuestions);
router.post("/skill/verify", verifyStudent, verifySkillAssessment);
router.get("/roadmap", verifyStudent, getCurrentRoadmap);
router.post("/roadmap/progress", verifyStudent, getCurrentRoadmap);
router.post("/compare", verifyStudent, compareCareers);
router.get("/test-profiles", requireTestFlag, runAcceptanceTestProfiles);

// Protected Admin Routes (Requires Admin auth token)
router.get("/admin/careers", verifyAdmin, getAllCareersAdmin);
router.post("/admin/careers", verifyAdmin, adminSaveCareer);
router.delete("/admin/careers/:id", verifyAdmin, adminDeleteCareer);

module.exports = router;

