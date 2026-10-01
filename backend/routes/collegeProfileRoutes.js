const express = require("express");
const router = express.Router();
const { getMetadata, getMyProfile, getMyContext, saveProfile, patchProfile } = require("../controllers/collegeProfileController");
const verifyStudent = require("../middleware/verifyStudent");

// Public metadata route
router.get("/metadata", getMetadata);

// Protected routes (Student auth required)
router.get("/my-profile", verifyStudent, getMyProfile);
router.get("/my-context", verifyStudent, getMyContext);
router.post("/save", verifyStudent, saveProfile);
router.put("/patch", verifyStudent, patchProfile);

module.exports = router;
