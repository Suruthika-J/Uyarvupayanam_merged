const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getCollegeStudents,
  getCollegeStudentProfile,
  updateCollegeStudent,
  toggleStudentStatus,
  sendStudentNotification
} = require("../controllers/collegeAdminController");

// Protect all college admin routes
router.use(verifyAdmin);

router.get("/students", getCollegeStudents);
router.get("/students/:id", getCollegeStudentProfile);
router.put("/students/:id", updateCollegeStudent);
router.patch("/students/:id/status", toggleStudentStatus);
router.post("/students/:id/notify", sendStudentNotification);

module.exports = router;
