const express = require("express");
const {
  getAllCareerPaths,
  getCareerPathById,
} = require("../controllers/careerPathController");

const router = express.Router();

// Public User APIs
// Supports query: ?level=5th
router.get("/", (req, res, next) => {
  // If no status is specified, default to published for public routes
  if (!req.query.status) req.query.status = "published";
  next();
}, getAllCareerPaths);

// GET - Get single career path by ID
router.get("/:id", getCareerPathById);

// Specific route as requested in prompt (alternative to query)
router.get("/level/:level", (req, res, next) => {
  req.query.level = req.params.level;
  req.query.status = "published"; // Force published only for this public route
  next();
}, getAllCareerPaths);

module.exports = router;
