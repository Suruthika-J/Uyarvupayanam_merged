const mongoose = require("mongoose");

const collegeCareerCatalogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true }, // e.g. "Software & Computing", "AI & Data Science", "Core Engineering", "R&D"
    shortDescription: { type: String, required: true },
    typicalWorkArea: { type: String, default: "" },
    
    // Academic Alignments
    requiredFields: [{ type: String }],
    requiredDegrees: [{ type: String }],
    requiredDomains: [{ type: String }],
    requiredSpecializations: [{ type: String }],
    
    // Skills & Subjects
    requiredSkills: [{ type: String }],
    suggestedSubjects: [{ type: String }],
    suggestedNextSteps: [{ type: String }],
    relatedDegrees: [{ type: String }],
    workSectors: [{ type: String }],
    
    growthOutlook: { type: String, default: "High Growth Industry" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeCareerCatalog", collegeCareerCatalogSchema);
