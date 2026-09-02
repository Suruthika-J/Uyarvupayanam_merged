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
  importCollegeScholarshipsCSV
} = require("../controllers/collegeScholarshipController");

// Student Routes
router.get("/", getCollegeScholarships);
router.get("/recommended", verifyStudent, getRecommendedScholarships);
router.get("/:id", getCollegeScholarshipById);

// Admin Routes (Protected)
router.post("/", verifyAdmin, createCollegeScholarship);
router.put("/:id", verifyAdmin, updateCollegeScholarship);
router.delete("/:id", verifyAdmin, deleteCollegeScholarship);
router.post("/import", verifyAdmin, importCollegeScholarshipsCSV);

module.exports = router;
