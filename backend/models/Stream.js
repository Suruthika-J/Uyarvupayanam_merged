const mongoose = require("mongoose");

/**
 * Streams After 10th
 * Each record represents one HSC group / vocational course a student can pick
 * after Class 10 in Tamil Nadu. Seeded from backend/data/streamsSeedData.json.
 */
const streamSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: 0,
    },
    code: {
      type: String,
      required: [true, "Group code is required"],
      trim: true,
    },
    groupName: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    subjects: {
      type: [String],
      required: [true, "Subjects are required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "At least one subject is required",
      },
    },
    bestFor: {
      type: String,
      required: [true, "Best-for description is required"],
      trim: true,
    },
    progression: {
      type: [String],
      required: [true, "Progression options are required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "At least one progression option is required",
      },
    },
    backgroundTheme: {
      type: String,
      required: [true, "Background theme is required"],
      trim: true,
    },
    // Optional per-record image override; otherwise the theme key maps to an
    // asset registered in the design system.
    backgroundImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: ["science", "commerce", "arts", "diploma", "polytechnic"],
      required: [true, "Category is required"],
      index: true,
    },
    subCategory: {
      type: String,
      enum: [
        "agriculture",
        "textile-design",
        "home-science",
        "food-hospitality",
        "healthcare",
        "commerce-vocational",
        "technical",
        "printing-creative",
      ],
      default: null,
      validate: {
        validator: function (v) {
          // Required only for diploma records
          if (this.category === "diploma") return !!v;
          return v === null || v === undefined || v === "";
        },
        message: "subCategory is required for diploma records",
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Guarantee order uniqueness within (category, subCategory) groups
streamSchema.index({ category: 1, subCategory: 1, order: 1 }, { unique: true });
streamSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Stream", streamSchema);