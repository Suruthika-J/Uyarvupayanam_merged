const mongoose = require("mongoose");

// Theme drives the cartoon illustration. The frontend maps the environment
// key + palette to SVG scenes; no image assets are stored here.
// Kept separate from the question bank so art direction and content can be
// edited independently (scienceWorldThemes frontend mirror lives in
// frontend/src/student/data/scienceWorldThemes.js).
const scienceThemeSchema = new mongoose.Schema(
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

// Short, illustrated "touch to explore" items shown before the experiment.
// Art key maps to a small SVG icon in the frontend SCI_ART library.
const discoverySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    blurb: { type: String, required: true },
    art: { type: String, default: "" },
  },
  { _id: false }
);

// ── "Try this" hands-on prediction experiment ──────────────────────────────
// The student taps items into prediction buckets, runs the experiment, and the
// server reveals the real outcome. `answer` holds the correct bucket per item
// and is NEVER sent to the client before the run — validation is server-side.
const experimentItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    art: { type: String, default: "" },
  },
  { _id: false }
);

const experimentSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    instruction: { type: String, required: true },
    buckets: { type: [String], required: true }, // prediction labels, e.g. ["Floats", "Sinks"]
    items: { type: [experimentItemSchema], default: [] },
    answer: { type: mongoose.Schema.Types.Mixed, default: {} }, // itemKey -> bucket label
    observe: { type: String, default: "" }, // what actually happened
    reveal: { type: String, default: "" }, // the science that explains it
    guide: { type: String, default: "" }, // the guide's reaction line
    followUp: { type: String, default: "" }, // links the result to the questions
  },
  { _id: false }
);

const scienceWorldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // world key, e.g. "matter"
    order: { type: Number, required: true, unique: true }, // adventure order 1..13
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    guideLine: { type: String, default: "" }, // the scientist's opening line
    skills: { type: [String], default: [] },
    accent: { type: String, required: true },
    environment: { type: String, required: true },
    intro: { type: String, required: true },
    discoveries: { type: [discoverySchema], default: [] },
    experiment: { type: experimentSchema, default: null },
    theme: { type: scienceThemeSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScienceWorld", scienceWorldSchema);