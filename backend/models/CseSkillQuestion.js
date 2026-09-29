const mongoose = require("mongoose");

const cseSkillQuestionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true, unique: true },
    questionText: { type: String, required: true },
    domain: {
      type: String,
      enum: [
        "Full-Stack Web & Software",
        "Artificial Intelligence & ML",
        "Data Science & Analytics",
        "Cybersecurity & DevSecOps",
        "Cloud Computing & DevOps",
        "Algorithms & Data Structures"
      ],
      required: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
      required: true
    },
    skillTag: { type: String, required: true }, // e.g., "Full Stack Web (React / Node)", "AI & Machine Learning"
    options: [
      {
        optionId: { type: String, required: true },
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
        scorePoints: { type: Number, default: 0 } // 1 for Easy, 2 for Medium, 3 for Hard if correct
      }
    ],
    explanation: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CseSkillQuestion", cseSkillQuestionSchema);
