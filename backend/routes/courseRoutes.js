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
const optionalStudent = require("../middleware/optionalStudent");

const router = express.Router();

// POST - Create new course
router.post("/", createCourse);

// POST - Bulk Import (text-based)
router.post("/bulk", bulkImportCourses);

// POST - Preview source import (dry run)
router.post("/preview-import", previewSourceImport);

// POST - Import from source (actual insert)
router.post("/import-from-source", importFromSource);

// GET - Get all courses (scoped to the student's level when a student token is present)
router.get("/", optionalStudent, getAllCourses);

// GET - Get single course by ID
router.get("/:id", getCourseById);

// PUT - Update course
router.put("/:id", updateCourse);

// DELETE - Delete course
router.delete("/:id", deleteCourse);

module.exports = router;
