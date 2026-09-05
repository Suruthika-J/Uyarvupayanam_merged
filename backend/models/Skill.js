const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true 
    },
    classLevel: { type: String, enum: ["5", "8", "10", "12", "All"], default: "5" },
    icon: { type: String },
    tags: [String],
    resources: [{ title: String, link: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", skillSchema);
