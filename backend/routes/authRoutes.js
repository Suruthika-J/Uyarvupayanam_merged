const express = require("express");
const router = express.Router();
const { rateLimit } = require("../middleware/rateLimit");
const {
  register,
  login,
  requestOtp,
  verifyLoginOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

const TEN_MINUTES = 10 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

// Anti-spam: no more than 3 OTP emails per email address per 10 minutes.
const otpEmailLimit = rateLimit({
  keyFn: (req) =>
    `${String(req.body?.email || "").trim().toLowerCase()}:otp:${req.body?.purpose === "reset" ? "reset" : "login"}`,
  max: 3,
  windowMs: TEN_MINUTES,
  message: "Too many code requests. Please wait a few minutes and try again.",
});

// Anti-bruteforce: cap how often a single email can try to verify a code.
const otpVerifyLimit = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:otp-verify`,
  max: 10,
  windowMs: TEN_MINUTES,
  message: "Too many attempts. Please wait a few minutes and try again.",
});

// Resend cooldown: one resend per email per 30 seconds.
const resendCooldown = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:otp-resend-cd`,
  max: 1,
  windowMs: THIRTY_SECONDS,
  message: "Please wait a moment before requesting another code.",
});

// Resend safety net: cap total resends per email per 10 minutes.
const resendWindow = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:otp-resend`,
  max: 5,
  windowMs: TEN_MINUTES,
  message: "Too many resend requests. Please wait a few minutes and try again.",
});

const forgotPasswordLimit = rateLimit({
  keyFn: (req) => `${String(req.body?.email || "").trim().toLowerCase()}:reset-request`,
  max: 3,
  windowMs: TEN_MINUTES,
  message: "Too many reset requests. Please wait a few minutes and try again.",
});

router.post("/register", register);
router.post("/login", login);

// ── OTP sign-in (alternative to password) ──
router.post("/otp/send", otpEmailLimit, requestOtp);
router.post("/login/otp", otpVerifyLimit, verifyLoginOtp);
router.post("/resend-otp", resendCooldown, resendWindow, resendOtp);

// ── Forgot Password (OTP-based) ──
router.post("/forgot-password", forgotPasswordLimit, forgotPassword);
router.post("/forgot-password/verify", otpVerifyLimit, verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;