const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    branchCode: {
      type: String, // TNEA Branch Code (e.g., CS, IT)
      trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    level: {
      type: String, // "after10th", "after12th", "diploma"
      required: [true, "Level is required"],
      trim: true,
    },
    category: {
      type: String, // "Medical", "Engineering", "Arts", "Commerce", "Science", "Management", "Certificate", "Architecture", "Diploma"
      required: [true, "Category is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    eligibility: {
      type: String,
      required: [true, "Eligibility is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    
    // Extended fields for imported courses
    scope: { type: String, default: "" },
    averageSalary: { type: String, default: "" },
    sourceName: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["active", "draft", "archived"],
      default: "active" 
    },

    // Detailed Content (Full Page)
    overview: { type: String, default: "" },
    admissionProcess: { type: String, default: "" },
    subjectsCovered: { type: [String], default: [] },
    skillsRequired: { type: [String], default: [] },
    careerScope: { type: String, default: "" },
    jobRoles: { type: [String], default: [] },
    salaryRange: {
      starting: { type: String, default: "" },
      growth: { type: String, default: "" }
    },
    higherStudies: { type: String, default: "" },
    workSectors: { type: [String], default: [] },
    advantages: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    studentNote: { type: String, default: "" },
    faqs: [faqSchema],

    isPublished: {
      type: Boolean,
      default: true,
    },
    isImported: {
      type: Boolean,
      default: false,
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save to create slug
courseSchema.pre("save", function () {
  if (this.courseName && !this.slug) {
    this.slug = this.courseName
      .toLowerCase()
      .split(" ")
      .join("-")
      .replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).substr(2, 5);
  }
});

module.exports = mongoose.model("Course", courseSchema);
