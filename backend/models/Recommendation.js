const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        grade: {
            type: String,
            required: true,
        },
        scorePercentage: { type: Number, required: true },
        performanceLevel: { type: String, required: true },
        // Onboarding Fields (especially for Class 10 & 12)
        marksPercentage: { type: Number },
        board: { type: String },
        stream: { type: String },
        interests: [String],
        preferredStream: { type: String },
        preferredCourseCategory: { type: String },
        careerInterest: { type: String },
        entranceExamPlan: { type: String },
        goalAfter10th: { type: String },
        goalAfter12th: { type: String },
        
        strongSkills: [String],
        averageSkills: [String],
        weakSkills: [String],
        
        recommendedSkills: [String],
        recommendedStreams: [String],
        recommendedCourses: [String],
        recommendedExams: [String],
        recommendedScholarships: [String],
        recommendedColleges: [String],
        recommendedCutoffDetails: { type: String },
        recommendedCareerPaths: [String],
        
        suggestedActivities: [String],
        learningGuidelines: { type: String },
        improvementMessage: { type: String },

        fetchedClass5Content: {
            skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "ClassContent" }],
            exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
            scholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scholarship" }],
            careers: [{ type: mongoose.Schema.Types.ObjectId, ref: "CareerPath" }],
            habits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Habit" }],
            fun: [{ type: mongoose.Schema.Types.ObjectId, ref: "ClassContent" }]
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
