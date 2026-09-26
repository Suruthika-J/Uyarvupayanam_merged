const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  verifySignupOtp,
  resendSignupOtp,
} = require("../controllers/studentController");
const { getClass12Categories, getClass12Content } = require("../controllers/class12Controller");
const { getStudentCourseDetails } = require("../controllers/courseController");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

const TEN_MINUTES = 10 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

// Anti-spam: at most 3 sign-up submissions — each one emails a code — per email
// per 10 minutes (the OTP itself is also capped on resend below).
const signupSendLimit = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:signup-send`,
  max: 3,
  windowMs: TEN_MINUTES,
  message: "Too many sign-up requests. Please wait a few minutes and try again.",
});

// Anti-bruteforce: cap sign-up OTP verification attempts per email (shared
// bucket with the sign-in OTP verify so an email can't brute-force across flows).
const signupVerifyLimit = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:otp-verify`,
  max: 10,
  windowMs: TEN_MINUTES,
  message: "Too many attempts. Please wait a few minutes and try again.",
});

// Resend cooldown: one resend per email per 30 seconds (shared bucket with the
// sign-in resend so an email can't spam across flows).
const signupResendCooldown = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:otp-resend-cd`,
  max: 1,
  windowMs: THIRTY_SECONDS,
  message: "Please wait a moment before requesting another code.",
});

const signupResendWindow = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:otp-resend`,
  max: 5,
  windowMs: TEN_MINUTES,
  message: "Too many resend requests. Please wait a few minutes and try again.",
});

// Public Auth routes
router.post("/register", signupSendLimit, registerStudent);
router.post("/login", loginStudent);
router.post("/verify-otp", signupVerifyLimit, verifySignupOtp);
router.post("/resend-otp", signupResendCooldown, signupResendWindow, resendSignupOtp);

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