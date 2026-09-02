const mongoose = require("mongoose");

const collegeStudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    // Step 1: Basic Profile & Institution
    institution: { type: String, trim: true },
    institutionDistrict: { type: String, trim: true },
    currentYear: { type: String, trim: true },
    studyMode: {
      type: String,
      enum: ["Full-time", "Part-time", "Distance Learning", "Evening College"],
      default: "Full-time"
    },

    // Step 2: Major Field
    field: { type: String, required: true },

    // Step 3: Degree Programme
    degreeProgramme: { type: String, required: true },

    // Step 4: Domain & Specialization
    domain: { type: String, trim: true },
    specialization: { type: String, trim: true },
    certifications: [{ type: String }],

    // Step 5: Academic & Career Interests
    academicInterests: [{ type: String }],
    careerInterests: [{ type: String }],

    // Step 6: Skills & Strengths
    skills: [{ type: String }],
    strengths: [{ type: String }],

    // Wizard completion tracking
    currentStep: { type: Number, default: 1 },
    profileCompletion: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeStudentProfile", collegeStudentProfileSchema);
