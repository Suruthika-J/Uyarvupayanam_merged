const mongoose = require("mongoose");

// Short-lived, single-use token handed out AFTER a user correctly verifies
// the reset OTP. The raw token goes to the client; only its bcrypt hash and
// the owning email are stored. Expires after 15 minutes (TTL index).
const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ email: 1, used: 1 });
// TTL cleanup: expired, never-used tokens are dropped automatically.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);