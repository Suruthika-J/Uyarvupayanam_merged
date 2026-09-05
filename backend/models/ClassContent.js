const mongoose = require("mongoose");

const classContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    targetClass: {
      type: String, // "5", "8", "10", "12"
      required: true,
    },
    sectionType: {
      type: String,
      enum: [
        "Basics",
        "Exams",
        "Fun",
        "Skills",
        "Games",
        "Careers",
        "Videos",
        "Habits",
        "Streams",
        "Scholarships",
        "Entrance Exams",
        "Resources",
        "FAQs"
      ],
      required: true,
    },
    category: {
      type: String,
      trim: true,
      required: true,
    },
    subCategoryLabel: {
      type: String,
      trim: true,
      default: "",
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    galleryImages: [String],
    benefitType: {
      type: String,
      default: "",
    },
    scholarshipType: {
      type: String, // "government", "private", etc.
      default: "",
    },
    eligibilityClass: {
      type: String,
      default: "",
    },
    eligibilityMarks: {
      type: String,
      default: "",
    },
    familyIncomeLimit: {
      type: String,
      default: "",
    },
    benefitAmount: {
      type: String,
      default: "",
    },
    conductedBy: {
      type: String,
      default: "",
    },
    applicationMode: {
      type: String,
      default: "",
    },
    importantNote: {
      type: String,
      default: "",
    },
    examPattern: {
      type: String,
      default: "",
    },
    relatedSubjects: {
      type: String,
      default: "",
    },
    whyItMatters: {
      type: String,
      default: "",
    },
    activities: [String],
    tips: [String],
    faqs: [
      {
        question: String,
        answer: String,
      }
    ],
    youtubeLink: {
      type: String,
      default: "",
    },
    externalLink: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    }
  },
  {
    timestamps: true,
  }
);

classContentSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .split(" ")
      .join("-")
      .replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).substr(2, 5);
  }
});

module.exports = mongoose.model("ClassContent", classContentSchema);
