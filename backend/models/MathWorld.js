const mongoose = require("mongoose");

// Theme drives the cartoon illustration. The frontend maps the environment
// key + palette to SVG scenes; no image assets are stored here.
// Kept separate from the question bank so art direction and content can be
// edited independently (mathWorldThemes frontend mirror lives in
// frontend/src/student/data/mathWorldThemes.js).
const mathThemeSchema = new mongoose.Schema(
  {
    environment: { type: String, required: true },
    mood: { type: String, required: true },
    animation: { type: String, default: "none" },
    cardStyle: { type: String, default: "storybook" },
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

const mathWorldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // topic key, e.g. "addition"
    order: { type: Number, required: true, unique: true }, // trail order 1..11
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    skills: { type: [String], default: [] },
    accent: { type: String, required: true },
    environment: { type: String, required: true },
    intro: { type: String, required: true },
    theme: { type: mathThemeSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MathWorld", mathWorldSchema);