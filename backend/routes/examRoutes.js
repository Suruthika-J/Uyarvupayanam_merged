const express = require("express");
const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  uploadCSV,
} = require("../controllers/examController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// POST - Upload CSV
router.post("/upload-csv", verifyAdmin, upload.single("file"), uploadCSV);

// POST - Create new exam
router.post("/", verifyAdmin, createExam);

// GET - Get all exams
router.get("/", getAllExams);

// GET - Get single exam by ID
router.get("/:id", getExamById);

// PUT - Update exam
router.put("/:id", verifyAdmin, updateExam);

// DELETE - Delete exam
router.delete("/:id", verifyAdmin, deleteExam);

module.exports = router;
