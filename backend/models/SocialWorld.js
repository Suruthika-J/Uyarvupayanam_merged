const mongoose = require("mongoose");

// Theme drives the cartoon illustration. The frontend maps the environment
// key + palette to SVG scenes; no image assets are stored here.
// kept separate from the question bank so art direction and content can be
// edited independently (socialWorldThemes frontend mirror lives in
// frontend/src/student/data/socialWorldThemes.js).
const socialThemeSchema = new mongoose.Schema(
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

// Short, illustrated "touch to discover" items shown before questions.
// Art key maps to a small SVG icon in the frontend SOCIAL_ART library.
const discoverySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    blurb: { type: String, required: true },
    art: { type: String, default: "" },
  },
  { _id: false }
);

const socialWorldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // world key, e.g. "solar-system"
    order: { type: Number, required: true, unique: true }, // globe order 1..8
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    guideLine: { type: String, default: "" }, // the explorer's opening line
    skills: { type: [String], default: [] },
    accent: { type: String, required: true },
    environment: { type: String, required: true },
    intro: { type: String, required: true },
    discoveries: { type: [discoverySchema], default: [] },
    theme: { type: socialThemeSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialWorld", socialWorldSchema);