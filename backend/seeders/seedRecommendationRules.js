// backend/seeders/seedRecommendationRules.js
//
// Idempotent seed for the two admin-editable rule tables consumed by the
// recommendation engine:
//   - guideline_rules      (overallLevel → quick guideline message)
//   - recommendation_rules (grade × skill × level → activity + optional exam)
//
// Run:  node seedRecommendationRules.js   (from backend/)
import mongoose from "mongoose";
import dotenv from "dotenv";
import RecommendationRule from "../models/RecommendationRule.js";
import GuidelineRule from "../models/GuidelineRule.js";

dotenv.config();

const SKILLS = [
    "Mathematics", "English", "Science", "General Knowledge",
    "Logical Thinking", "Reading Ability", "Creativity",
    "Communication", "Computer Basics", "Learning Habits",
];
const LEVELS = ["Strong", "Average", "Needs Improvement"];

// skill → activity per level
const ACTIVITIES = {
    "Mathematics": {
        "Strong": "Take part in math olympiads and advanced problem solving.",
        "Average": "Practice 20 mixed problems weekly and review each mistake.",
        "Needs Improvement": "Strengthen tables, fractions and arithmetic with daily practice.",
    },
    "English": {
        "Strong": "Read novels and write daily summaries of what you learned.",
        "Average": "Read one article daily and note down five new words.",
        "Needs Improvement": "Practice vocabulary and simple sentence building every day.",
    },
    "Science": {
        "Strong": "Explore science projects and prepare for olympiads.",
        "Average": "Revise each concept with diagrams and short quizzes.",
        "Needs Improvement": "Build basics with daily reading and simple experiments at home.",
    },
    "General Knowledge": {
        "Strong": "Follow current affairs daily and take weekly quiz challenges.",
        "Average": "Read newspapers or child magazines once a week.",
        "Needs Improvement": "Start with simple GK quizzes and flashcards.",
    },
    "Logical Thinking": {
        "Strong": "Take part in logic olympiads and puzzle championships.",
        "Average": "Solve puzzles weekly and play strategy games.",
        "Needs Improvement": "Start with simple pattern, sequence and maze games.",
    },
    "Reading Ability": {
        "Strong": "Read longer books and write short reviews.",
        "Average": "Read 30 minutes daily and tell a friend what you read.",
        "Needs Improvement": "Start with short stories and read aloud every day.",
    },
    "Creativity": {
        "Strong": "Participate in art, fiction and design contests.",
        "Average": "Try daily creative prompts and small hobby projects.",
        "Needs Improvement": "Practice drawing, storytelling or craft once a week.",
    },
    "Communication": {
        "Strong": "Join debates, elocution and public speaking clubs.",
        "Average": "Practice mirror speaking and deliver small talks.",
        "Needs Improvement": "Speak one minute daily about your day to build confidence.",
    },
    "Computer Basics": {
        "Strong": "Learn coding basics and build small digital projects.",
        "Average": "Explore typing, documents and safe internet usage.",
        "Needs Improvement": "Start with mouse and keyboard basics plus fun typing games.",
    },
    "Learning Habits": {
        "Strong": "Mentor peers and set advanced personal goals.",
        "Average": "Build a fixed study timetable with planned breaks.",
        "Needs Improvement": "Set small daily goals and keep a study planner.",
    },
};

// grade-specific exam suggestions (grade filter is demonstrated here)
const GRADE_EXAMS = {
    "Class 10": {
        "Mathematics": { "Strong": "NTSE" },
        "Logical Thinking": { "Strong": "NTSE" },
        "General Knowledge": { "Strong": "NMMS" },
    },
    "Class 12": {
        "Mathematics": { "Strong": "JEE Mains" },
        "Science": { "Strong": "NEET" },
        "English": { "Strong": "CUET" },
        "Communication": { "Strong": "CUET" },
        "Logical Thinking": { "Strong": "CLAT" },
    },
};

const GUIDELINES = [
    { overallLevel: "Strong", guidelineText: "Excellent work! You have strong foundations. Focus on competitive exam strategies and advanced practice now." },
    { overallLevel: "Average", guidelineText: "Good progress! Identify your weaker skills and spend an extra 30–60 minutes daily on them to move to the Strong level." },
    { overallLevel: "Needs Improvement", guidelineText: "A structured daily routine with small, achievable goals will help you build basics first — consistency matters more than speed." },
    { overallLevel: "Fallback", guidelineText: "Keep a consistent study routine, review your progress weekly, and revisit areas you find difficult." },
];

async function run() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam");
    console.log("Connected. Seeding recommendation rules + guideline rules...");

    // 1) guideline_rules
    for (const g of GUIDELINES) {
        await GuidelineRule.updateOne(
            { overallLevel: g.overallLevel },
            { $set: { guidelineText: g.guidelineText } },
            { upsert: true }
        );
    }
    console.log(`  guideline_rules: ${GUIDELINES.length} upserted`);

    // 2) recommendation_rules — per skill × level, grade "All"
    const combos = [];
    for (const skill of SKILLS) {
        for (const level of LEVELS) {
            combos.push({ grade: "All", skill, skillLevel: level, recommendedActivity: ACTIVITIES[skill][level] });
        }
    }
    // 3) grade-specific exam suggestions
    for (const [grade, bySkill] of Object.entries(GRADE_EXAMS)) {
        for (const [skill, byLevel] of Object.entries(bySkill)) {
            for (const [level, exam] of Object.entries(byLevel)) {
                combos.push({ grade, skill, skillLevel: level, recommendedActivity: ACTIVITIES[skill]?.[level] || "", recommendedExam: exam });
            }
        }
    }

    for (const r of combos) {
        await RecommendationRule.updateOne(
            { grade: r.grade, skill: r.skill, skillLevel: r.skillLevel },
            { $set: { recommendedActivity: r.recommendedActivity, recommendedExam: r.recommendedExam || "" } },
            { upsert: true }
        );
    }
    console.log(`  recommendation_rules: ${combos.length} upserted`);

    await mongoose.disconnect();
    console.log("Done.");
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});