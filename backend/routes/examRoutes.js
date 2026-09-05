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

const router = express.Router();

// POST - Upload CSV
router.post("/upload-csv", upload.single("file"), uploadCSV);

// POST - Create new exam
router.post("/", createExam);

// GET - Get all exams
router.get("/", getAllExams);

// GET - Get single exam by ID
router.get("/:id", getExamById);

// PUT - Update exam
router.put("/:id", updateExam);

// DELETE - Delete exam
router.delete("/:id", deleteExam);

module.exports = router;
