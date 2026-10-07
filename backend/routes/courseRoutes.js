const express = require("express");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  bulkImportCourses,
  previewSourceImport,
  importFromSource
} = require("../controllers/courseController");

const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");

// POST - Create new course
router.post("/", verifyAdmin, createCourse);

// POST - Bulk Import (text-based)
router.post("/bulk", verifyAdmin, bulkImportCourses);

// POST - Preview source import (dry run)
router.post("/preview-import", verifyAdmin, previewSourceImport);

// POST - Import from source (actual insert)
router.post("/import-from-source", verifyAdmin, importFromSource);

// GET - Get all courses
router.get("/", getAllCourses);

// GET - Get single course by ID
router.get("/:id", getCourseById);

// PUT - Update course
router.put("/:id", verifyAdmin, updateCourse);

// DELETE - Delete course
router.delete("/:id", verifyAdmin, deleteCourse);

module.exports = router;
