const mongoose = require("mongoose");

// Theme drives the cartoon illustration. The frontend maps the environment
// key + palette to SVG scenes; no image assets are stored here.
const themeSchema = new mongoose.Schema(
  {
    environment: { type: String, required: true },
    mood: { type: String, required: true },
    animation: { type: String, default: "none" },
    palette: {
      skyTop: { type: String, required: true },
      skyBottom: { type: String, required: true },
      ground: { type: String, required: true },
      accent: { type: String, required: true },
      cardBg: { type: String, required: true },
      cardAccent: { type: String, required: true },
    },
  },
  { _id: false }
);

const kuralSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    tamil: { type: [String], required: true },
    easyMeaning: { type: String, required: true },
    example: { type: String, default: "" },
  },
  { _id: false }
);

const adhikaramSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true },
    nameTamil: { type: String, required: true },
    nameEn: { type: String, required: true },
    section: { type: String, required: true },
    accent: { type: String, required: true },
    environment: { type: String, required: true },
    intro: { type: String, required: true },
    theme: { type: themeSchema, required: true },
    kurals: { type: [kuralSchema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adhikaram", adhikaramSchema);