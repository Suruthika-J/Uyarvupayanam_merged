const mongoose = require("mongoose");

// Real-world professional video clips, tagged to a career world.
const careerVideoSchema = new mongoose.Schema(
  {
    careerWorldKey: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    durationSec: { type: Number, default: 120 },
    subtitlesUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerVideo", careerVideoSchema);