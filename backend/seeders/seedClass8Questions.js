const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const OnboardingQuestion = require("../models/OnboardingQuestion");

const questions = [
    // Mathematics
    {
        grade: "Class 8",
        questionText: "What is the value of 12 × 8?",
        options: ["86", "96", "108", "112"],
        correctAnswer: "96",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Basic Multiplication",
        explanation: "12 times 8 equals 96."
    },
    {
        grade: "Class 8",
        questionText: "Solve: 3x = 24. What is x?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Algebra Basics",
        explanation: "Dividing both sides by 3, x = 24 / 3 = 8."
    },
    {
        grade: "Class 8",
        questionText: "What is the perimeter of a square with side 9 cm?",
        options: ["18 cm", "27 cm", "36 cm", "81 cm"],
        correctAnswer: "36 cm",
        skillTag: "Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Geometry",
        explanation: "Perimeter of a square = 4 × side = 4 × 9 = 36 cm."
    },
    // Science
    {
        grade: "Class 8",
        questionText: "Which organ pumps blood in the human body?",
        options: ["Brain", "Heart", "Lungs", "Kidney"],
        correctAnswer: "Heart",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Human Body Basics",
        explanation: "The heart is the muscular organ that pumps blood throughout the body."
    },
    {
        grade: "Class 8",
        questionText: "Which gas do plants absorb during photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        correctAnswer: "Carbon dioxide",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Plant Science",
        explanation: "Plants take in carbon dioxide and release oxygen during photosynthesis."
    },
    {
        grade: "Class 8",
        questionText: "Which force pulls objects towards Earth?",
        options: ["Magnetic force", "Friction", "Gravity", "Electricity"],
        correctAnswer: "Gravity",
        skillTag: "Science",
        difficultyLevel: "Easy",
        recommendationCategory: "Physics Basics",
        explanation: "Gravity is the force by which a planet or other body draws objects toward its center."
    },
    // English
    {
        grade: "Class 8",
        questionText: "Choose the correct sentence.",
        options: [
            "She go to school daily.",
            "She goes to school daily.",
            "She going to school daily.",
            "She gone to school daily."
        ],
        correctAnswer: "She goes to school daily.",
        skillTag: "English",
        difficultyLevel: "Easy",
        recommendationCategory: "Grammar",
        explanation: "For third-person singular (She), the verb 'go' becomes 'goes'."
    },
    {
        grade: "Class 8",
        questionText: "What is the synonym of 'brave'?",
        options: ["Coward", "Fearless", "Weak", "Lazy"],
        correctAnswer: "Fearless",
        skillTag: "English",
        difficultyLevel: "Easy",
        recommendationCategory: "Vocabulary",
        explanation: "Brave and Fearless both mean showing no fear."
    },
    {
        grade: "Class 8",
        questionText: "Identify the noun: 'The teacher explained the lesson.'",
        options: ["explained", "lesson", "the", "teacher"],
        correctAnswer: "teacher",
        skillTag: "English",
        difficultyLevel: "Easy",
        recommendationCategory: "Parts of Speech",
        explanation: "'Teacher' and 'lesson' are nouns, but 'teacher' is the primary subject noun here."
    },
    // General Knowledge
    {
        grade: "Class 8",
        questionText: "Who is known as the Father of the Indian Constitution?",
        options: ["Mahatma Gandhi", "Dr. B. R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"],
        correctAnswer: "Dr. B. R. Ambedkar",
        skillTag: "General Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Indian Constitution Awareness",
        explanation: "Dr. B.R. Ambedkar was the chairman of the drafting committee of the Constitution."
    },
    {
        grade: "Class 8",
        questionText: "Which is the largest planet in the solar system?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Jupiter",
        skillTag: "General Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Space Awareness",
        explanation: "Jupiter is the largest planet in our solar system."
    },
    // Logical Thinking
    {
        grade: "Class 8",
        questionText: "Find the next number: 2, 4, 8, 16, __",
        options: ["18", "24", "32", "64"],
        correctAnswer: "32",
        skillTag: "Logical Thinking",
        difficultyLevel: "Easy",
        recommendationCategory: "Pattern Recognition",
        explanation: "The sequence is doubling each time: 2x2=4, 4x2=8, 8x2=16, 16x2=32."
    },
    {
        grade: "Class 8",
        questionText: "If all roses are flowers and some flowers are red, what can be concluded?",
        options: ["All roses are red", "Some flowers may be roses", "No roses are flowers", "All flowers are roses"],
        correctAnswer: "Some flowers may be roses",
        skillTag: "Logical Thinking",
        difficultyLevel: "Medium",
        recommendationCategory: "Reasoning",
        explanation: "Since all roses are flowers, it is true that some flowers (the ones that are roses) are indeed roses."
    },
    // Digital Awareness
    {
        grade: "Class 8",
        questionText: "Which of the following is used to search information online?",
        options: ["Keyboard", "Search Engine", "Speaker", "Printer"],
        correctAnswer: "Search Engine",
        skillTag: "Digital Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Internet Basics",
        explanation: "A search engine like Google is used to find information on the web."
    },
    {
        grade: "Class 8",
        questionText: "Which is a safe online practice?",
        options: ["Sharing passwords", "Clicking unknown links", "Using strong passwords", "Posting personal details publicly"],
        correctAnswer: "Using strong passwords",
        skillTag: "Digital Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Cyber Safety",
        explanation: "Using strong, unique passwords helps protect your accounts from being hacked."
    },
    // Career Awareness
    {
        grade: "Class 8",
        questionText: "A person who designs buildings is called:",
        options: ["Doctor", "Architect", "Pilot", "Farmer"],
        correctAnswer: "Architect",
        skillTag: "Career Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Career Awareness",
        explanation: "Architects plan and design buildings and other structures."
    },
    {
        grade: "Class 8",
        questionText: "Which skill is useful for becoming a scientist?",
        options: ["Observation", "Guessing", "Copying", "Ignoring facts"],
        correctAnswer: "Observation",
        skillTag: "Career Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Scientific Thinking",
        explanation: "Scientists use observation to gather data and understand phenomena."
    },
    // Study Habits
    {
        grade: "Class 8",
        questionText: "What is the best way to prepare for exams?",
        options: ["Study only one day before", "Make a timetable and revise regularly", "Skip difficult subjects", "Copy answers"],
        correctAnswer: "Make a timetable and revise regularly",
        skillTag: "Study Habits",
        difficultyLevel: "Easy",
        recommendationCategory: "Study Planning",
        explanation: "Consistent revision and planning lead to better learning outcomes."
    },
    {
        grade: "Class 8",
        questionText: "What should a student do after making a mistake?",
        options: ["Ignore it", "Blame others", "Learn and correct it", "Stop studying"],
        correctAnswer: "Learn and correct it",
        skillTag: "Study Habits",
        difficultyLevel: "Easy",
        recommendationCategory: "Self Improvement",
        explanation: "Mistakes are opportunities to learn and improve."
    },
    {
        grade: "Class 8",
        questionText: "Why is note-taking useful?",
        options: ["To waste time", "To remember important points", "To avoid listening", "To skip revision"],
        correctAnswer: "To remember important points",
        skillTag: "Study Habits",
        difficultyLevel: "Easy",
        recommendationCategory: "Learning Strategy",
        explanation: "Note-taking helps in active listening and provides material for later review."
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Keep Class 5 questions, only delete Class 8 ones to avoid duplicates if re-run
        await OnboardingQuestion.deleteMany({ grade: "Class 8" });
        console.log("Deleted existing Class 8 questions");

        await OnboardingQuestion.insertMany(questions);
        console.log("Successfully seeded 20 questions for Class 8");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
