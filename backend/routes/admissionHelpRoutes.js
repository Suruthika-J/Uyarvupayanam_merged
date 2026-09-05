const express = require("express");
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  updateStatus
} = require("../controllers/admissionHelpController");
const verifyAdmin = require("../middleware/verifyAdmin");

// Student/Public Routes
router.post("/", createRequest);

// Admin Protected Routes
router.get("/admin", verifyAdmin, getAllRequests);
router.patch("/admin/:id", verifyAdmin, updateStatus);

module.exports = router;
