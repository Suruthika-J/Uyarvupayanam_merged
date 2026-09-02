const express = require("express");
const router = express.Router();
const { getAdvisorRecommendations, compareCareers, getAllCareersAdmin, adminSaveCareer, adminDeleteCareer } = require("../controllers/collegeAdvisorController");
const verifyStudent = require("../middleware/verifyStudent");
const verifyAdmin = require("../middleware/verifyAdmin");

// Protected routes (Requires Student auth token)
router.get("/recommendations", verifyStudent, getAdvisorRecommendations);
router.post("/compare", verifyStudent, compareCareers);

// Protected Admin Routes (Requires Admin auth token)
router.get("/admin/careers", verifyAdmin, getAllCareersAdmin);
router.post("/admin/careers", verifyAdmin, adminSaveCareer);
router.delete("/admin/careers/:id", verifyAdmin, adminDeleteCareer);

module.exports = router;
