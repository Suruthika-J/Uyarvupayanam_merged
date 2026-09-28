const mongoose = require("mongoose");

// 5-axis strength profile. Recalculated after each quiz / challenge / mini-game completion.
const skillProfileSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
    creativity: { type: Number, default: 25 },
    logic: { type: Number, default: 25 },
    empathy: { type: Number, default: 25 },
    leadership: { type: Number, default: 25 },
    focus: { type: Number, default: 25 },
    lastWorldKey: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillProfile", skillProfileSchema);