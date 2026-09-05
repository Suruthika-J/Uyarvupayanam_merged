const mongoose = require("mongoose");

const preparationSchema = new mongoose.Schema({
  strategy: { type: String, default: "" },
  timeline: { type: String, default: "" },
  books: { type: [String], default: [] },
  resources: { type: [String], default: [] }
});

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    category: {
      type: String, // "Engineering", "Medical", "Law", "Commerce / Management", "Science", "Design", "Others"
      required: [true, "Category is required"],
      trim: true,
    },
    level: {
      type: String, // "Undergraduate"
      required: [true, "Level is required"],
      default: "Undergraduate",
      trim: true,
    },
    applicableClass: {
      type: [String],
      default: ["12"],
    },
    examType: {
      type: String, // "Entrance Exam", "Admission Process"
      default: "Entrance Exam",
      trim: true,
    },
    conductingBody: {
      type: String,
      trim: true,
    },
    eligibility: {
      type: String,
      trim: true,
    },
    subjects: {
      type: [String],
      default: [],
    },
    pattern: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String, // "Easy", "Moderate", "Hard"
      trim: true,
    },
    importantDates: {
      type: String,
      trim: true,
    },
    officialWebsite: {
      type: String,
      trim: true,
    },
    preparation: {
      type: preparationSchema,
      default: () => ({})
    },
    careerOptions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exam", examSchema);
