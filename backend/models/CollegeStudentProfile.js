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
    field: { type: String, trim: true },

    // Step 3: Degree Programme
    degreeProgramme: { type: String, trim: true },

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

    // ── Extended Profile Fields (Task 02 — Single Source of Truth) ──────────
    currentSemester: { type: String, trim: true },          // e.g. "3rd Semester"
    cgpa: { type: String, trim: true },                     // e.g. "8.2"
    subjects: [{ type: String }],                           // active semester subjects
    targetCareer: { type: String, trim: true },             // primary career goal
    completedCourses: [{ type: String }],                   // course titles completed
    projects: [{
      title: { type: String },
      description: { type: String },
      techStack: { type: String },
      year: { type: String },
      link: { type: String }
    }],
    phone: { type: String, trim: true },
    grokAssessmentScore: { type: Number },
    grokAssessmentResults: [{ type: mongoose.Schema.Types.Mixed }],

    // ── New Reference Profile Sections (Personal Info, Parent Info, Education 10/12/UG, Social Profiles) ──
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dob: { type: String, trim: true },
    address: { type: String, trim: true },
    profilePhoto: { type: String, trim: true },
    introVideo: { type: String, trim: true },
    careerObjective: { type: String, trim: true },

    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    parentOccupation: { type: String, trim: true },
    parentEmail: { type: String, trim: true },

    // Class 10
    school10: { type: String, trim: true },
    cgpa10: { type: String, trim: true },
    startDate10: { type: String, trim: true },
    endDate10: { type: String, trim: true },

    // Class 12 / Diploma
    institution12: { type: String, trim: true },
    cgpa12: { type: String, trim: true },
    branch12: { type: String, trim: true },
    startDate12: { type: String, trim: true },
    endDate12: { type: String, trim: true },
    isDiploma: { type: Boolean, default: false },

    // UG Dates
    startDateUg: { type: String, trim: true },
    endDateUg: { type: String, trim: true },

    // Achievements & Certificates
    achievements: [{
      title: { type: String },
      description: { type: String },
      date: { type: String }
    }],

    // Social Profiles
    socialProfiles: {
      linkedIn: { type: String, trim: true },
      github: { type: String, trim: true },
      hackerEarth: { type: String, trim: true },
      leetcode: { type: String, trim: true },
      codechef: { type: String, trim: true },
      geeksforgeeks: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true }
    },

    // Wizard completion tracking
    currentStep: { type: Number, default: 1 },
    profileCompletion: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeStudentProfile", collegeStudentProfileSchema);
