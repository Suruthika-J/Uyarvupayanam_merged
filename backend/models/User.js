const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    userType: {
      type: String,
      enum: ["school_student", "college_student", "graduate"],
      default: "school_student"
    },
    classLevel: { type: String },
    district: { type: String },
    selectedCareer: { type: String },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    onboardingCompleted: { type: Boolean, default: false },
    recommendationGenerated: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
