const mongoose = require("mongoose");

// Invisible adaptive level per student + world. Streaks drive difficulty moves
// in scienceRoutes, exactly like the maths/social modules. Never surfaced.
const scienceStudentLevelSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    world: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "challenge"], default: "easy" },
    correctStreak: { type: Number, default: 0 },
    wrongStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

scienceStudentLevelSchema.index({ studentId: 1, world: 1 }, { unique: true });
module.exports = mongoose.model("ScienceStudentLevel", scienceStudentLevelSchema);