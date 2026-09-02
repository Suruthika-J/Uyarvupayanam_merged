const mongoose = require("mongoose");

const collegeScholarshipSchema = new mongoose.Schema(
  {
    scholarshipName: {
      type: String,
      required: [true, "Scholarship name is required"],
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
      default: "Government of India / State Govt",
    },
    category: {
      type: String,
      enum: [
        "Government Scholarship",
        "Private Scholarship",
        "Merit-Based",
        "Need-Based",
        "Women in Education",
        "Minority / Community Schemes",
        "Research Scholarship",
        "Technical Education Scholarship",
        "Engineering Scholarship",
        "Medical Scholarship",
        "Management Scholarship",
        "Law Scholarship",
        "Design Scholarship",
        "General Higher Education Scholarship"
      ],
      default: "Government Scholarship",
    },
    benefit: {
      type: String,
      trim: true,
      default: "Financial Assistance / Tuition Waiver",
    },
    description: {
      type: String,
      default: "",
    },
    applicationLink: {
      type: String,
      trim: true,
      default: "",
    },
    deadline: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "active", "inactive", "draft", "expired"],
      default: "published",
    },

    // College Academic Eligibility Hierarchy
    eligibleFields: {
      type: [String], // e.g. ["Engineering", "Medicine"] or ["All"]
      default: ["All"],
    },
    eligibleDegrees: {
      type: [String], // e.g. ["B.Tech", "B.E."] or ["All"]
      default: ["All"],
    },
    eligibleDomains: {
      type: [String], // e.g. ["Computer Science", "Electronics"] or ["All"]
      default: ["All"],
    },
    eligibleSpecializations: {
      type: [String],
      default: ["All"],
    },
    eligibleYears: {
      type: [String], // e.g. ["1st Year", "2nd Year"] or ["All"]
      default: ["All"],
    },
    eligibleSemesters: {
      type: [String],
      default: ["All"],
    },

    // Academic & Financial Criteria
    minCGPA: {
      type: String,
      default: "No minimum CGPA criteria",
    },
    familyIncomeLimit: {
      type: String,
      default: "No family income limit",
    },
    additionalEligibility: {
      type: String,
      default: "",
    },
    requiredDocuments: {
      type: [String],
      default: [
        "College Bonafide Certificate",
        "Aadhaar Card",
        "Income Certificate (if applicable)",
        "Previous Semester Marksheet",
        "Bank Passbook Copy"
      ],
    },
    termsAndConditions: {
      type: String,
      default: "Applicant must be actively enrolled in a recognized college/university.",
    },
  },
  {
    collection: "college_scholarships",
    timestamps: true,
  }
);

// Index for fast search and matching
collegeScholarshipSchema.index({ scholarshipName: "text", provider: "text" });

module.exports = mongoose.model("CollegeScholarship", collegeScholarshipSchema);
