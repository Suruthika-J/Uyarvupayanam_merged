const express = require("express");
const router = express.Router();
const {
  createMentorRequest,
  getAllMentorRequests,
  getUserMentorRequests,
  getMentorRequestById,
  updateMentorRequest,
  deleteMentorRequest
} = require("../controllers/mentorRequestController");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyStudent = require("../middleware/verifyStudent");

// User Side: Create request
router.post("/", createMentorRequest);

// User Side: Get my requests
router.get("/user/:userId", verifyStudent, getUserMentorRequests);

// Admin Side: Management
router.get("/", verifyAdmin, getAllMentorRequests);
router.get("/:id", verifyAdmin, getMentorRequestById);
router.put("/:id", verifyAdmin, updateMentorRequest);
router.delete("/:id", verifyAdmin, deleteMentorRequest);

module.exports = router;
