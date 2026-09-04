const express = require("express");
const router = express.Router();
const { getMetadata, getMyProfile, saveProfile, patchProfile } = require("../controllers/collegeProfileController");
const verifyStudent = require("../middleware/verifyStudent");

// Public metadata route
router.get("/metadata", getMetadata);

// Protected routes (Student auth required)
router.get("/my-profile", verifyStudent, getMyProfile);
router.post("/save", verifyStudent, saveProfile);
router.put("/patch", verifyStudent, patchProfile);

module.exports = router;
