const mongoose = require("mongoose");

// Collection: student_learning_dna
// The student's Learning-DNA profile (Part 4). One document per student;
// dimensions carry { score, evidenceCount, confidence }.
const studentLearningDnaSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        grade: { type: String },
        dimensions: {
            accuracy: { score: Number, evidenceCount: Number, confidence: String },
            understanding: { score: Number, evidenceCount: Number, confidence: String },
            application: { score: Number, evidenceCount: Number, confidence: String },
            reasoning: { score: Number, evidenceCount: Number, confidence: String },
            problemSolving: { score: Number, evidenceCount: Number, confidence: String },
            patternRecognition: { score: Number, evidenceCount: Number, confidence: String },
            comprehension: { score: Number, evidenceCount: Number, confidence: String },
            communication: { score: Number, evidenceCount: Number, confidence: String },
            consistency: { score: Number, evidenceCount: Number, confidence: String },
        },
        lastAssessmentAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

studentLearningDnaSchema.index({ studentId: 1 });

module.exports = mongoose.model("StudentLearningDNA", studentLearningDnaSchema);