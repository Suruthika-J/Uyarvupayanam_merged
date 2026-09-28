"use strict";

// ────────────────────────────────────────────────────────────────────────────
// backend/controllers/studentProfileController.js
//
// Phase 3 — school-student profile API (GET/PUT /api/student/profile).
//
// OWNERSHIP BOUNDARY:
//   Both handlers derive the owner EXCLUSIVELY from req.student._id (set by
//   verifyStudent). These routes take NO :userId/:studentId URL parameter and
//   NEVER read a userId/studentId from the request body. A client cannot select
//   the owner — a student only ever sees/updates their own profile.
// ────────────────────────────────────────────────────────────────────────────

const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { upsertStudentProfile, pickProfileFields } = require("../utils/studentProfileSync");

// PUT-able User fields — already exist on the User model (no schema change).
const USER_FIELDS = ["name", "classLevel", "district"];

// ── GET /api/student/profile ────────────────────────────────────────────────
// Read-only. Returns { success, student, profile }. `student` is the verified
// user with phone/careerInterest merged from the profile. `profile` is null
// when the student has not completed any profile-bearing submit yet.
exports.getStudentProfile = async (req, res) => {
    try {
        const userId = req.student._id; // ownership from token only
        const profile = await StudentProfile.findOne({ userId }).lean();
        res.json({ success: true, student: publicStudent(req.student, profile), profile: profile || null });
    } catch (error) {
        console.error("Get student profile error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

// ── PUT /api/student/profile ────────────────────────────────────────────────
// Partial update:
//   - User fields (name, classLevel, district) → User (existing columns).
//   - All other whitelisted profile fields + phone → StudentProfile (upsert).
//   - undefined ⇒ preserve stored value; "" ⇒ clear; unknown keys ignored.
// Response keeps the existing ProfilePage contract: `student` carries the User
// fields plus phone/careerInterest merged from the profile, so
// `updateStudent(res.student)` in the frontend works unchanged.
exports.updateStudentProfile = async (req, res) => {
    try {
        const userId = req.student._id; // ownership from token only
        const body = req.body || {};

        // ── Validation: marksPercentage, when supplied and non-empty, 0–100 ──
        if (body.marksPercentage !== undefined && body.marksPercentage !== "") {
            const n = Number(body.marksPercentage);
            if (!Number.isFinite(n) || n < 0 || n > 100) {
                return res.status(400).json({ success: false, message: "marksPercentage must be a number between 0 and 100" });
            }
        }

        // ── User fields (whitelisted, trimmed) ──
        const userPatch = {};
        for (const key of USER_FIELDS) {
            if (body[key] !== undefined) {
                userPatch[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
            }
        }
        if (Object.keys(userPatch).length) {
            await User.findByIdAndUpdate(userId, { $set: userPatch });
        }

        // ── StudentProfile fields (whitelisted inside studentProfileSync) ──
        const profile = await upsertStudentProfile({
            userId,
            classLevel: userPatch.classLevel !== undefined ? userPatch.classLevel : req.student.classLevel,
            fields: pickProfileFields(body),
        });

        // Re-read the user so the response carries the fresh values.
        const freshUser = await User.findById(userId).select("-password").lean();

        res.json({
            success: true,
            message: "Profile updated successfully",
            student: publicStudent(freshUser, profile),
            profile: profile || null,
        });
    } catch (error) {
        console.error("Update student profile error:", error);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

// Merge User fields with the display fields the existing ProfilePage expects
// from a saved profile (phone, careerInterest live on StudentProfile).
function publicStudent(user, profile) {
    if (!user) return null;
    const out = {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType || "school_student",
        classLevel: user.classLevel,
        district: user.district,
        onboardingCompleted: user.onboardingCompleted,
        isVerified: user.isVerified,
    };
    if (profile) {
        if (profile.phone !== undefined) out.phone = profile.phone;
        if (profile.careerInterest !== undefined) out.careerInterest = profile.careerInterest;
    }
    return out;
}