const mongoose = require("mongoose");

const collegeCareerCatalogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true }, // e.g. "Software & Computing", "AI & Data Science", "Core Engineering", "R&D"
    shortDescription: { type: String, required: true },
    roleDescription: { type: String, default: "" },
    typicalWorkArea: { type: String, default: "" },
    
    // Academic Alignments
    requiredFields: [{ type: String }],
    requiredDegrees: [{ type: String }],
    requiredDomains: [{ type: String }],
    requiredSpecializations: [{ type: String }],
    
    // Skills & Categorization
    requiredSkills: [{ type: String }],
    coreSkills: [{ name: { type: String }, suggestedProficiency: { type: String, default: "Advanced" } }],
    advancedSkills: [{ name: { type: String }, suggestedProficiency: { type: String, default: "Intermediate" } }],
    optionalSkills: [{ name: { type: String }, suggestedProficiency: { type: String, default: "Basic" } }],
    skillsToDevelop: [{ type: String }],
    
    // Subjects & Next Steps
    suggestedSubjects: [{ type: String }],
    suggestedNextSteps: [{ type: String }],
    relatedDegrees: [{ type: String }],
    workSectors: [{ type: String }],
    growthOutlook: { type: String, default: "High Growth Industry" },

    // Extended Details
    typicalResponsibilities: [{ type: String }],
    recommendedRoadmap: [{
      phase: { type: String },
      title: { type: String },
      description: { type: String },
      items: [{ type: String }],
      defaultStatus: { type: String, default: "upcoming" }
    }],
    relatedCertifications: [{ type: String }],
    relatedProjects: [{
      title: { type: String },
      description: { type: String },
      techStack: { type: String }
    }],
    interviewPrep: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeCareerCatalog", collegeCareerCatalogSchema);

