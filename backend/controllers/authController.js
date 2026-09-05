const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ── Email transporter ──────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const Settings = require("../models/Settings");

// ── Register ───────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings && settings.studentRegistration === false) {
      return res.status(403).json({ message: "Student registration is currently disabled by administrator." });
    }

    const { name, email, password, userType, classLevel, district } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const validUserTypes = ["school_student", "college_student", "graduate"];
    const finalUserType = validUserTypes.includes(userType) ? userType : "school_student";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: finalUserType,
      classLevel: classLevel || "",
      district: district || "",
      role: "student",
      status: "active"
    });

    await user.save();
    res.status(201).json({ 
        message: "Registration successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            onboardingCompleted: user.onboardingCompleted
        }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Login ──────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked by admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        classLevel: user.classLevel,
        district: user.district,
        role: user.role,
        status: user.status,
        onboardingCompleted: user.onboardingCompleted
      },
      student: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        classLevel: user.classLevel,
        district: user.district,
        onboardingCompleted: user.onboardingCompleted
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Forgot Password ────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({
        message: "If an account with that email exists, a reset link has been sent."
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token and set expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Build reset URL
    const resetUrl = `http://localhost:5173/student/reset-password/${resetToken}`;
    console.log(`\n🔑 [PASSWORD RESET GENERATED] Email: ${user.email} | Reset Link: ${resetUrl}\n`);

    // Send email if SMTP credentials configured
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"Uyarvu Payanam" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Password Reset - Uyarvu Payanam",
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafb; padding: 32px;">
              <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
                <div style="text-align: center; margin-bottom: 28px;">
                  <h1 style="color: #0f4c75; font-size: 24px; margin: 0;">Uyarvu Payanam</h1>
                  <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Career Guidance Platform</p>
                </div>
                <h2 style="color: #111827; font-size: 20px; margin-bottom: 12px;">Password Reset Request</h2>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                  Hello <strong>${user.name}</strong>,
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                  You requested to reset your password. Click the button below to set a new password:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: #0f4c75; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                  This link will expire in <strong>1 hour</strong>. If you didn't request this reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                  © ${new Date().getFullYear()} Uyarvu Payanam. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });

        emailSent = true;
        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailErr) {
        console.warn("SMTP Email delivery failed (using direct reset link fallback):", emailErr.message);
      }
    } else {
      console.log("SMTP EMAIL_USER/EMAIL_PASS not configured in .env; using direct dev reset link.");
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
      emailSent,
      resetUrl,
      resetToken
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ── Reset Password ─────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link. Please request a new one."
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Uyarvu Payanam" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Changed Successfully - Uyarvu Payanam",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafb; padding: 32px;">
            <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
              <div style="text-align: center; margin-bottom: 28px;">
                <h1 style="color: #0f4c75; font-size: 24px; margin: 0;">Uyarvu Payanam</h1>
              </div>
              <h2 style="color: #111827; font-size: 20px; margin-bottom: 12px;">Password Changed</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Hello <strong>${user.name}</strong>,
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Your password has been successfully changed. If you did not make this change, please contact us immediately.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("Confirmation email send error:", emailErr.message);
    }

    res.status(200).json({ message: "Password reset successful. You can now sign in." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
