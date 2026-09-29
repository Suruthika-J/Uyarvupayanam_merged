const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  getCandidateDomains,
  calculateAhp,
  saveAhpProfile,
  getAhpResult,
  reviseAhpComparisons
} = require("../controllers/ahpOnboardingController");

// Public / Authenticated Candidate Domains Discovery
router.get("/domains", getCandidateDomains);

// Deterministic Calculation Preview (non-persisted)
router.post("/calculate", calculateAhp);

// Authenticated Student Routes
router.post("/save", verifyStudent, saveAhpProfile);
router.get("/result", verifyStudent, getAhpResult);
router.post("/revise", verifyStudent, reviseAhpComparisons);

module.exports = router;
