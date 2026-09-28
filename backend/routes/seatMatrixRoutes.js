const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  importSeatMatrix,
  listCourses,
  getCourseColleges,
  getSummary,
  getStreamsSummary,
} = require("../controllers/seatMatrixController");

// In-memory buffer is required by the PDF parser and is safer than writing the
// TNEA matrix (potentially ~2-5MB) to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype === "application/pdf" ||
      /\.pdf$/i.test(file.originalname || "");
    cb(ok ? null : new Error("Only PDF files are allowed"), ok);
  },
});

// All seat-matrix endpoints are admin-only.
router.use(verifyAdmin);

router.post("/import", upload.single("pdf"), importSeatMatrix);
router.get("/streams-summary", getStreamsSummary);
router.get("/courses", listCourses);
router.get("/courses/:courseId/colleges", getCourseColleges);
router.get("/summary", getSummary);

module.exports = router;