const express = require("express");
const router = express.Router();
const { registerStudent, loginStudent } = require("../controllers/studentController");
const { getClass12Categories, getClass12Content } = require("../controllers/class12Controller");
const { getStudentCourseDetails } = require("../controllers/courseController");
const verifyStudent = require("../middleware/verifyStudent");

// Public Auth routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Exploration routes (Public)
router.get("/class12/categories", getClass12Categories);
router.get("/class12/exploration", getClass12Content);
router.get("/courses/:courseId", getStudentCourseDetails);

// Protected routes (Login required)
router.get("/profile", verifyStudent, (req, res) => {
    res.json({ message: "Protected profile data", student: req.student });
});

router.get("/recommendations", verifyStudent, (req, res) => {
    res.json({ message: "Protected personalized recommendations", student: req.student._id });
});

module.exports = router;
