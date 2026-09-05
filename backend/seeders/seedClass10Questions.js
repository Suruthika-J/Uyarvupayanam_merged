const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const OnboardingQuestion = require("../models/OnboardingQuestion");

const questions = [
    // Mathematics Skill – 5 questions
    {
        grade: "Class 10",
        questionText: "If x + 5 = 12, what is x?",
        options: ["5", "6", "7", "8"],
        correctAnswer: "7",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Algebra",
        explanation: "12 - 5 = 7."
    },
    {
        grade: "Class 10",
        questionText: "The area of a rectangle is length × breadth. If length = 10 cm and breadth = 5 cm, area is:",
        options: ["15 cm²", "25 cm²", "50 cm²", "100 cm²"],
        correctAnswer: "50 cm²",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Geometry",
        explanation: "10 × 5 = 50."
    },
    {
        grade: "Class 10",
        questionText: "25% of 200 is:",
        options: ["25", "40", "50", "100"],
        correctAnswer: "50",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Percentage",
        explanation: "0.25 × 200 = 50."
    },
    {
        grade: "Class 10",
        questionText: "If a:b = 2:3 and b = 12, then a is:",
        options: ["6", "8", "10", "12"],
        correctAnswer: "8",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Ratio",
        explanation: "2/3 = a/12 => a = (2/3) × 12 = 8."
    },
    {
        grade: "Class 10",
        questionText: "The value of 5² is:",
        options: ["10", "20", "25", "30"],
        correctAnswer: "25",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Basic Math",
        explanation: "5 × 5 = 25."
    },
    // Science Skill – 5 questions
    {
        grade: "Class 10",
        questionText: "Which organ pumps blood in the human body?",
        options: ["Brain", "Heart", "Liver", "Kidney"],
        correctAnswer: "Heart",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Biology",
        explanation: "The heart pumps blood through the circulatory system."
    },
    {
        grade: "Class 10",
        questionText: "Water boils at:",
        options: ["50°C", "75°C", "100°C", "120°C"],
        correctAnswer: "100°C",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Physics/Chemistry",
        explanation: "Boiling point of water at standard pressure is 100°C."
    },
    {
        grade: "Class 10",
        questionText: "Which gas do plants absorb for photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        correctAnswer: "Carbon dioxide",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Biology",
        explanation: "Plants use CO2 and sunlight to make food."
    },
    {
        grade: "Class 10",
        questionText: "The SI unit of force is:",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: "Newton",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Physics",
        explanation: "Force is measured in Newtons (N)."
    },
    {
        grade: "Class 10",
        questionText: "Acid turns blue litmus paper into:",
        options: ["Red", "Green", "Yellow", "White"],
        correctAnswer: "Red",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Chemistry",
        explanation: "Acids turn blue litmus red; bases turn red litmus blue."
    },
    // English Communication – 3 questions
    {
        grade: "Class 10",
        questionText: "Choose the correct sentence:",
        options: ["He go to school.", "He goes to school.", "He going school.", "He gone school."],
        correctAnswer: "He goes to school.",
        skillTag: "English",
        difficultyLevel: "Easy",
        recommendationCategory: "Grammar",
        explanation: "Third-person singular 'He' takes 'goes'."
    },
    {
        grade: "Class 10",
        questionText: "Synonym of 'Happy' is:",
        options: ["Sad", "Angry", "Joyful", "Tired"],
        correctAnswer: "Joyful",
        skillTag: "English",
        difficultyLevel: "Easy",
        recommendationCategory: "Vocabulary",
        explanation: "Joyful is a synonym for happy."
    },
    {
        grade: "Class 10",
        questionText: "Choose the correct spelling:",
        options: ["Enviroment", "Environment", "Envirnment", "Envirement"],
        correctAnswer: "Environment",
        skillTag: "English",
        difficultyLevel: "Easy",
        recommendationCategory: "Spelling",
        explanation: "Environment is the correct spelling."
    },
    // Logical Reasoning – 3 questions
    {
        grade: "Class 10",
        questionText: "Find the next number: 2, 4, 6, 8, __",
        options: ["9", "10", "12", "14"],
        correctAnswer: "10",
        skillTag: "Logical Thinking",
        difficultyLevel: "Easy",
        recommendationCategory: "Number Series",
        explanation: "Sequence of even numbers."
    },
    {
        grade: "Class 10",
        questionText: "If all roses are flowers and some flowers are red, then roses are:",
        options: ["Animals", "Flowers", "Fruits", "Trees"],
        correctAnswer: "Flowers",
        skillTag: "Logical Thinking",
        difficultyLevel: "Easy",
        recommendationCategory: "Logical Thinking",
        explanation: "The premise explicitly states all roses are flowers."
    },
    {
        grade: "Class 10",
        questionText: "Which one is different?",
        options: ["Apple", "Mango", "Carrot", "Banana"],
        correctAnswer: "Carrot",
        skillTag: "Logical Thinking",
        difficultyLevel: "Easy",
        recommendationCategory: "Classification",
        explanation: "Carrot is a vegetable/root; others are fruits."
    },
    // Career Awareness – 4 questions
    {
        grade: "Class 10",
        questionText: "After Class 10, which option is available?",
        options: ["11th Standard", "Diploma", "ITI", "All of the above"],
        correctAnswer: "All of the above",
        skillTag: "Career Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Career Awareness",
        explanation: "Students can choose higher secondary, diploma, or vocational training."
    },
    {
        grade: "Class 10",
        questionText: "Which stream is commonly chosen for Engineering?",
        options: ["Science with Maths", "Commerce", "Arts", "History only"],
        correctAnswer: "Science with Maths",
        skillTag: "Career Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Stream Selection",
        explanation: "Engineering requires a strong foundation in Physics, Chemistry, and Math."
    },
    {
        grade: "Class 10",
        questionText: "Polytechnic courses are usually related to:",
        options: ["Engineering and technical skills", "Cooking only", "Dance only", "Sports only"],
        correctAnswer: "Engineering and technical skills",
        skillTag: "Career Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Diploma Awareness",
        explanation: "Polytechnic diplomas focus on practical technical education."
    },
    {
        grade: "Class 10",
        questionText: "Scholarships help students by:",
        options: ["Increasing fees", "Giving financial support", "Stopping education", "Reducing marks"],
        correctAnswer: "Giving financial support",
        skillTag: "Career Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Scholarship Awareness",
        explanation: "Scholarships provide financial aid to students."
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        await OnboardingQuestion.deleteMany({ grade: "Class 10" });
        console.log("Deleted existing Class 10 questions");

        await OnboardingQuestion.insertMany(questions);
        console.log("Successfully seeded 20 questions for Class 10");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
