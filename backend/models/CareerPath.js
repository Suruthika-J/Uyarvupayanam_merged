const mongoose = require("mongoose");

const careerPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: ["5th", "8th", "10th", "12th"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    careerDirections: {
      type: [String],
      default: [],
    },
    suggestedSkills: {
      type: [String],
      default: [],
    },
    relatedScholarships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scholarship",
      },
    ],
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    // Keep internal structure for potential legacy section support if needed
    sections: {
      type: [{
        heading: { type: String, trim: true },
        content: { type: String, trim: true },
        images: { type: [String], default: [] },
        videoUrl: { type: String, trim: true },
      }],
      default: [],
    },
    interestArea: {
      type: String,
      enum: ["Science", "Arts", "Commerce", "General", "Technology", "Vocational"],
      default: "General",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CareerPath", careerPathSchema);
