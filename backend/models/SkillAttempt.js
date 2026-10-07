const mongoose = require("mongoose");

// Collection: skill_attempts
// One document per Class 8 Skill Adventure game session (an "attempt").
// The attempt IS the session: status in_progress lets a student resume an
// interrupted game exactly where they left off; completion is final and
// idempotent (the server grades every task, never the client).
//
// Scoring rule: weighted percent over the DETERMINISTIC tasks of the attempt
// (choice/pattern/order/sort/match/decode). Open practice tasks (speak/create)
// are recorded as participation only — they never produce an accuracy signal.
const skillAttemptSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        skillId: { type: String, required: true }, // category id (or "diagnostic")
        activityId: { type: String, required: true },
        activityTitle: { type: String, default: "" },
        categoryName: { type: String, default: "" },
        mode: { type: String, enum: ["play", "diagnostic"], default: "play" },
        level: { type: Number, min: 1, max: 3, default: 1 },

        status: { type: String, enum: ["in_progress", "completed", "abandoned"], default: "in_progress" },

        // Per-task grading record (taskIndex 0-based within the attempt task list)
        answers: [
            {
                taskIndex: { type: Number, required: true },
                taskType: { type: String, default: "" },
                category: { type: String, default: "" }, // diagnostic split
                given: { type: mongoose.Schema.Types.Mixed, default: null },
                correct: { type: Boolean, default: false },
                hintUsed: { type: Boolean, default: false },
                attempts: { type: Number, default: 1 }, // retries on this task
                score: { type: Number, default: 0 }, // partial score 0–1
                weight: { type: Number, default: 1 },
                cognitiveType: { type: String, default: "understanding" },
                difficulty: { type: String, default: "easy" },
            },
        ],

        // Aggregate summary (set on completion)
        score: { type: Number, default: 0 }, // weighted % 0–100 (deterministic tasks)
        correctCount: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 }, // deterministic task count
        hintCount: { type: Number, default: 0 },
        durationMs: { type: Number, default: 0 },

        meta: {
            selfRating: { type: Number, min: 1, max: 5, default: null },
            note: { type: String, default: "" },
            voiceDurationMs: { type: Number, default: 0 },
        },

        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

skillAttemptSchema.index({ studentId: 1, createdAt: -1 });
skillAttemptSchema.index({ studentId: 1, status: 1, mode: 1 });
skillAttemptSchema.index({ studentId: 1, skillId: 1, activityId: 1, level: 1, status: 1 });

module.exports = mongoose.model("SkillAttempt", skillAttemptSchema);