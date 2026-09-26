const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const OtpCode = require("../models/OtpCode");
const { transporter } = require("../config/mailer");

// One active code per email+purpose. Sign-in codes are valid for 5 minutes;
// sign-up verification and password-reset codes get the longer 10-minute window.
const OTP_TTL_MS = {
  login: 5 * 60 * 1000,
  signup: 10 * 60 * 1000,
  reset: 10 * 60 * 1000,
};
const MAX_OTP_ATTEMPTS = 5; // fail the code after 5 bad guesses

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// Store only the bcrypt hash of the code (never the raw OTP). Any previous code
// for the same email+purpose is invalidated at the same time.
const storeOtp = async ({ email, otp, purpose }) => {
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);
  await OtpCode.deleteMany({ email, purpose });
  await OtpCode.create({
    email,
    otpHash,
    purpose,
    attempts: 0,
    expiresAt: new Date(Date.now() + (OTP_TTL_MS[purpose] || OTP_TTL_MS.login)),
  });
};

const PURPOSE_EMAIL = {
  login: { subject: "Uyarvu Payanam Sign In OTP", heading: "Your Sign-In Code" },
  signup: { subject: "Uyarvu Payanam Email Verification", heading: "Verify Your Email" },
  reset: { subject: "Uyarvu Payanam Password Reset Code", heading: "Password Reset Code" },
};

// The OTP is sent to the account holder's own email (user.email) — never an
// admin address, never a hardcoded one. The raw OTP is never logged.
const sendOtpEmail = async ({ email, otp, purpose }) => {
  const label = PURPOSE_EMAIL[purpose] || PURPOSE_EMAIL.login;
  const validForMin = purpose === "login" ? 5 : 10;
  await transporter.sendMail({
    from: `"Uyarvu Payanam" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: label.subject,
    text: `Your Uyarvu Payanam verification code is: ${otp}\n\nThis OTP is valid for ${validForMin} minutes.\n\nIf you did not request this code, please ignore this email.`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafb; padding: 32px;">
        <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #0f4c75; font-size: 24px; margin: 0;">Uyarvu Payanam</h1>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Career Guidance Platform</p>
          </div>
          <h2 style="color: #111827; font-size: 20px; margin-bottom: 12px;">
            ${label.heading}
          </h2>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Your verification code is:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; background: #f0f4fa; border: 1px dashed #b6c5d4; color: #0f4c75; letter-spacing: 8px; font-size: 28px; font-weight: 800; padding: 12px 22px; border-radius: 12px;">
              ${otp}
            </span>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
            This OTP is valid for <strong>${validForMin} minutes</strong>. If you didn't
            request it, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Uyarvu Payanam. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
};

// Shared OTP verification: enforce expiry + attempt cap, and only succeed when
// the bcrypt comparison passes. Consumed (single-use) on success.
const verifyStoredOtp = async ({ email, otp, purpose }) => {
  // Freshest record for this email+purpose — whether or not it has expired yet,
  // so we can give a precise "expired" message even before the TTL sweep runs.
  const record = await OtpCode.findOne({ email, purpose }).sort({ createdAt: -1 });

  if (!record) return { ok: false, error: "Incorrect OTP. Please try again." };

  if (record.expiresAt <= new Date()) {
    await OtpCode.deleteOne({ _id: record._id });
    return { ok: false, error: "This OTP has expired. Please request a new OTP." };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await OtpCode.deleteOne({ _id: record._id });
    return { ok: false, error: "Too many incorrect attempts. Please request a new OTP." };
  }

  const match = await bcrypt.compare(String(otp).trim(), record.otpHash);
  if (!match) {
    record.attempts += 1;
    const exhausted = record.attempts >= MAX_OTP_ATTEMPTS;
    await record.save();
    if (exhausted) {
      await OtpCode.deleteOne({ _id: record._id });
    }
    return {
      ok: false,
      error: exhausted
        ? "Too many incorrect attempts. Please request a new OTP."
        : "Incorrect OTP. Please try again.",
    };
  }

  await OtpCode.deleteMany({ email, purpose });
  return { ok: true };
};

module.exports = {
  OTP_TTL_MS,
  MAX_OTP_ATTEMPTS,
  generateOtp,
  storeOtp,
  sendOtpEmail,
  verifyStoredOtp,
};