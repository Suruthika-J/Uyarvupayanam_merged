const express = require("express");
const { 
  getPublicClassContent, 
  getAdminClassContent, 
  getAdminLevelSummaries,
  getContentBySlug,
  createContent, 
  updateContent, 
  deleteContent, 
  togglePublish,
  toggleFeature
} = require("../controllers/classContentController");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// --- PUBLIC ---
router.get("/level/:level", getPublicClassContent);
router.get("/slug/:slug", getContentBySlug);

// --- ADMIN ---
router.get("/admin/summaries", verifyAdmin, getAdminLevelSummaries);
router.get("/admin/level/:level", verifyAdmin, getAdminClassContent);
router.get("/:id", verifyAdmin, updateContent); // Placeholder for single item admin view if needed
router.post("/", verifyAdmin, createContent);
router.put("/:id", verifyAdmin, updateContent);
router.delete("/:id", verifyAdmin, deleteContent);
router.patch("/:id/toggle-status", verifyAdmin, togglePublish);
router.patch("/:id/toggle-feature", verifyAdmin, toggleFeature);

module.exports = router;
