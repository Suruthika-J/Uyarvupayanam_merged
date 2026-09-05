const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    scholarshipName: { 
      type: String, 
      alias: "name",
      required: [true, "Scholarship name is required"],
      trim: true,
      minlength: [2, "Scholarship name must be at least 2 characters"],
      maxlength: [200, "Scholarship name must be at most 200 characters"]
    },
    provider: { 
      type: String, 
      trim: true,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    benefit: { 
      type: String, 
      trim: true,
      default: ""
    },
    targetClass: {
      type: [String], // ["5", "8", "10", "12"]
      alias: "grades",
      default: ["10"]
    },
    category: {
      type: String,
      enum: ["Government", "State Schemes", "Merit", "NSP", "Process", "Tips", "Others"],
      default: "Government"
    },
    eligibility: { 
      type: String, 
      trim: true,
      default: ""
    },
    applicationLink: { 
      type: String, 
      alias: "link",
      trim: true,
      maxlength: [1000, "Application link must be at most 1000 characters"]
    },
    stepsToApply: {
      type: [String],
      default: []
    },
    image: {
      type: String,
      trim: true,
      default: ""
    },
    deadline: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "inactive", "published"],
      default: "published"
    }
  },
  {
    collection: "scholarships",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Explicit index to guarantee uniqueness at DB level for (name + provider)
scholarshipSchema.index({ scholarshipName: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model("Scholarship", scholarshipSchema);

