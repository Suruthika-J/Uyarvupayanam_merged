const express = require("express");
const router = express.Router();
const {
  getAdvisorRecommendations,
  getCareerDetail,
  setTargetCareer,
  getStudentSkillGap,
  getStudentRoadmap,
  runAcceptanceTestProfiles,
  compareCareers,
  getAllCareersAdmin,
  adminSaveCareer,
  adminDeleteCareer
} = require("../controllers/collegeAdvisorController");
const verifyStudent = require("../middleware/verifyStudent");
const verifyAdmin = require("../middleware/verifyAdmin");

// Protected Student Routes
router.get("/recommendations", verifyStudent, getAdvisorRecommendations);
router.get("/career/:slug", verifyStudent, getCareerDetail);
router.post("/target-career", verifyStudent, setTargetCareer);
router.get("/skill-gap", verifyStudent, getStudentSkillGap);
router.get("/roadmap", verifyStudent, getStudentRoadmap);
router.post("/compare", verifyStudent, compareCareers);
router.get("/test-profiles", runAcceptanceTestProfiles);

// Protected Admin Routes (Requires Admin auth token)
router.get("/admin/careers", verifyAdmin, getAllCareersAdmin);
router.post("/admin/careers", verifyAdmin, adminSaveCareer);
router.delete("/admin/careers/:id", verifyAdmin, adminDeleteCareer);

module.exports = router;

