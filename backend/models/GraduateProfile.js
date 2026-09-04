const mongoose = require("mongoose");

const graduateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ── STAGE 1: Degree Completed & Education ──────────────────────────────
    field: { type: String, trim: true },
    degree: { type: String, trim: true },
    domain: { type: String, trim: true },
    specialization: { type: String, trim: true },
    college: { type: String, trim: true },
    university: { type: String, trim: true },
    graduationYear: { type: String, trim: true },
    cgpa: { type: String, trim: true },
    percentage: { type: String, trim: true },
    hasBacklogs: { type: Boolean, default: false },
    backlogCount: { type: Number, default: 0 },
    employmentStatus: {
      type: String,
      default: "Fresher / Not currently working"
    },

    // ── STAGE 2: Skills & Interests ────────────────────────────────────────
    technicalSkills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Intermediate"
        }
      }
    ],
    softSkills: [{ type: String }],
    tools: [{ type: String }],
    interests: [{ type: String }],

    // ── STAGE 3: Career Direction & Preferences ────────────────────────────
    primaryCareerDirection: {
      type: String,
      default: "Get a Job"
    },
    secondaryDirections: [{ type: String }],
    preferredWorkType: {
      type: String,
      default: "Technical"
    },
    preferredEnvironment: {
      type: String,
      default: "Office / Hybrid"
    },
    careerPriority: {
      type: String,
      default: "Growth & Skill Development"
    },
    targetCareer: { type: String, trim: true },

    // ── STAGE 4: Competitive Exams ─────────────────────────────────────────
    examInterest: {
      type: String,
      enum: ["Yes", "Maybe", "No"],
      default: "No"
    },
    selectedExams: [
      {
        examName: { type: String },
        category: { type: String },
        targetYear: { type: String },
        preparationStatus: { type: String, default: "Exploring" }
      }
    ],

    // ── STAGE 5: Higher Studies / Upskilling ───────────────────────────────
    higherStudyInterest: {
      type: String,
      enum: ["Yes", "Maybe", "No"],
      default: "No"
    },
    preferredHigherDegrees: [{ type: String }], // e.g. M.Tech, MBA, MS Abroad, PhD
    targetCountries: [{ type: String }],
    upskillingFocusAreas: [{ type: String }],

    // ── STAGE 6: Professional Placement ────────────────────────────────────
    lookingForOpportunity: {
      type: String,
      default: "Full-time job"
    },
    preferredRoles: [{ type: String }],
    preferredIndustries: [{ type: String }],
    preferredLocations: [{ type: String }],
    remotePreference: {
      type: String,
      default: "Flexible"
    },
    expectedSalary: { type: String, trim: true },
    relocationWillingness: { type: Boolean, default: true },

    // ── Portfolio, Projects & Experience ───────────────────────────────────
    projects: [
      {
        title: { type: String },
        description: { type: String },
        techStack: { type: String },
        projectUrl: { type: String }
      }
    ],
    internships: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
        description: { type: String }
      }
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        issueYear: { type: String }
      }
    ],
    workExperience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
        description: { type: String }
      }
    ],
    resumeUrl: { type: String },

    // ── Telemetry & Scores ─────────────────────────────────────────────────
    currentStep: { type: Number, default: 1 },
    profileCompletion: { type: Number, default: 0 },
    careerReadinessScore: { type: Number, default: 40 },
    onboardingCompleted: { type: Boolean, default: false },

    // Cache of personalized recommendations
    cachedRecommendations: {
      bestFitCareers: [{ type: mongoose.Schema.Types.Mixed }],
      skillGap: { type: mongoose.Schema.Types.Mixed },
      roadmap: [{ type: mongoose.Schema.Types.Mixed }],
      suggestedExams: [{ type: mongoose.Schema.Types.Mixed }],
      higherStudies: [{ type: mongoose.Schema.Types.Mixed }]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GraduateProfile", graduateProfileSchema);
