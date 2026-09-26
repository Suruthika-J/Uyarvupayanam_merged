const mongoose = require("mongoose");

// One-time 6-digit codes emailed to users for OTP sign-in (purpose "login"),
// sign-up verification (purpose "signup") and password reset (purpose "reset").
// Only the bcrypt hash is stored; raw codes are never persisted. Codes expire
// (10 minutes) and are auto-removed via a MongoDB TTL index.
const otpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["login", "signup", "reset"], required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpCodeSchema.index({ email: 1, purpose: 1 });
// TTL cleanup: MongoDB drops the document once expiresAt passes.
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpCode", otpCodeSchema);