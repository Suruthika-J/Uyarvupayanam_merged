const mongoose = require("mongoose");

// Collection: generated_assessments
// One document per generated question, grouped by sessionId. Rows are written
// BEFORE the set is sent to the frontend so the server owns the correct
// answers (the AI — not a static bank — produced them) and evaluation is a
// deterministic option-match against this collection, never a re-query to the LLM.
const generatedAssessmentSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        sessionId: { type: String, required: true, index: true }, // one session = one generated set
        grade: { type: String, required: true }, // "Class 5" | "Class 8" | "Class 10" | "Class 12"
        skill: { type: String, required: true }, // skillTag / category name
        questionText: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: String, required: true },
        difficulty: { type: String, default: "easy" },
        source: { type: String, enum: ["ai", "bank"], default: "ai" }, // ai = LLM, bank = static fallback
        // LD-NBSE diagnostic metadata (Part 2) — optional so legacy rows are untouched.
        subskill: { type: String },
        cognitiveType: { type: String },
        weight: { type: Number, default: 1 },
        mode: { type: String, enum: ["onboarding", "reassess"], default: "onboarding" },
        reassessTarget: { type: String }, // primary focus subskill when mode === "reassess"
        submittedAt: { type: Date, default: Date.now }, // one timestamp per session (use when grouping)
    },
    { timestamps: true }
);

generatedAssessmentSchema.index({ sessionId: 1, studentId: 1 });
generatedAssessmentSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model("GeneratedAssessment", generatedAssessmentSchema);