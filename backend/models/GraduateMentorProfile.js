const mongoose = require("mongoose");

const graduateMentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    headline: { type: String, trim: true, default: "Graduate Mentor & Career Guide" },
    graduationDegree: { type: String, required: true },
    graduationYear: { type: String, required: true },
    currentRole: { type: String, default: "Software Engineer / Professional" },
    company: { type: String, default: "Tech Sector" },
    experienceYears: { type: Number, default: 1 },
    skills: [{ type: String }],
    domains: [{ type: String }],
    preferredMentoringTopics: [{ type: String }],
    bio: { type: String, default: "Happy to guide college students with technical preparation, career choices, and interview prep." },
    availability: { type: String, default: "Available 2-3 hours/week" },
    linkedinUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    profileVisibility: { type: Boolean, default: true },
    rating: { type: Number, default: 5.0 },
    ratingsCount: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GraduateMentorProfile", graduateMentorProfileSchema);
