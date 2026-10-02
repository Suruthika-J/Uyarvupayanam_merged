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
    // Email-verification gate for new sign-ups. Accounts created before this
    // field existed have no value (undefined !== false), so nothing is locked out.
    isVerified: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Academic Journey History (Preserving past educational milestones)
    academicJourney: [
      {
        stage: { type: String, enum: ["school_student", "college_student", "graduate"] },
        classLevel: { type: String },
        institution: { type: String },
        degreeProgramme: { type: String },
        specialization: { type: String },
        year: { type: String },
        completedAt: { type: Date, default: Date.now },
        transitionNote: { type: String }
      }
    ],
    transitionStatus: {
      type: String,
      enum: ["none", "in_progress", "completed"],
      default: "none"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
