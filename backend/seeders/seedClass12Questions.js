const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const OnboardingQuestion = require("../models/OnboardingQuestion");

const questions = [
    // Aptitude / Mathematics – 5 questions
    {
        grade: "Class 12",
        questionText: "20% of 500 is:",
        options: ["50", "75", "100", "150"],
        correctAnswer: "100",
        skillTag: "Aptitude / Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Percentage",
        explanation: "0.20 × 500 = 100."
    },
    {
        grade: "Class 12",
        questionText: "If x² = 49, then x can be:",
        options: ["5", "6", "7", "8"],
        correctAnswer: "7",
        skillTag: "Aptitude / Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Algebra",
        explanation: "Square root of 49 is 7."
    },
    {
        grade: "Class 12",
        questionText: "The simple interest formula is:",
        options: ["PRT/100", "PT/R", "PR/T", "P+R+T"],
        correctAnswer: "PRT/100",
        skillTag: "Aptitude / Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Simple Interest",
        explanation: "Interest = (Principal × Rate × Time) / 100."
    },
    {
        grade: "Class 12",
        questionText: "Ratio 3:4 is equal to:",
        options: ["6:8", "4:6", "9:10", "12:20"],
        correctAnswer: "6:8",
        skillTag: "Aptitude / Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Ratio",
        explanation: "3/4 = (3×2)/(4×2) = 6/8."
    },
    {
        grade: "Class 12",
        questionText: "Which skill is most important for engineering entrance preparation?",
        options: ["Guessing", "Problem solving", "Memorising only", "Avoiding practice"],
        correctAnswer: "Problem solving",
        skillTag: "Aptitude / Mathematics",
        difficultyLevel: "Easy",
        recommendationCategory: "Engineering Aptitude",
        explanation: "Engineering requires strong analytical and problem-solving skills."
    },
    // Science / Stream Knowledge – 5 questions
    {
        grade: "Class 12",
        questionText: "Which subject is most important for NEET?",
        options: ["Accountancy", "Biology", "History", "Business Studies"],
        correctAnswer: "Biology",
        skillTag: "Science / Stream Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Biology Awareness",
        explanation: "NEET is the entrance exam for medical courses where Biology is a core subject."
    },
    {
        grade: "Class 12",
        questionText: "In Physics, force is measured in:",
        options: ["Newton", "Joule", "Watt", "Volt"],
        correctAnswer: "Newton",
        skillTag: "Science / Stream Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Physics Basics",
        explanation: "The SI unit of force is the Newton."
    },
    {
        grade: "Class 12",
        questionText: "Which field is related to accountancy and finance?",
        options: ["Commerce", "Biology", "Physics", "Drawing only"],
        correctAnswer: "Commerce",
        skillTag: "Science / Stream Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Commerce Awareness",
        explanation: "Commerce stream covers accounting, finance, and business studies."
    },
    {
        grade: "Class 12",
        questionText: "Which degree is commonly related to computer applications?",
        options: ["BCA", "MBBS", "BDS", "B.Ed only"],
        correctAnswer: "BCA",
        skillTag: "Science / Stream Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Computer Course Awareness",
        explanation: "BCA stands for Bachelor of Computer Applications."
    },
    {
        grade: "Class 12",
        questionText: "Architecture entrance is commonly related to:",
        options: ["NATA", "NEET", "TNPSC", "Banking"],
        correctAnswer: "NATA",
        skillTag: "Science / Stream Knowledge",
        difficultyLevel: "Easy",
        recommendationCategory: "Architecture Awareness",
        explanation: "NATA is the National Aptitude Test in Architecture."
    },
    // English Communication – 4 questions
    {
        grade: "Class 12",
        questionText: "Choose the correct sentence:",
        options: [
            "She have completed her exam.",
            "She has completed her exam.",
            "She completing exam.",
            "She complete exam yesterday."
        ],
        correctAnswer: "She has completed her exam.",
        skillTag: "English Communication",
        difficultyLevel: "Easy",
        recommendationCategory: "Grammar",
        explanation: "Third-person singular 'She' uses 'has'."
    },
    {
        grade: "Class 12",
        questionText: "Synonym of 'Important' is:",
        options: ["Minor", "Useless", "Significant", "Weak"],
        correctAnswer: "Significant",
        skillTag: "English Communication",
        difficultyLevel: "Easy",
        recommendationCategory: "Vocabulary",
        explanation: "Significant and important are synonyms."
    },
    {
        grade: "Class 12",
        questionText: "A resume is mainly used for:",
        options: ["Applying for jobs/internships", "Playing games", "Drawing only", "Watching movies"],
        correctAnswer: "Applying for jobs/internships",
        skillTag: "English Communication",
        difficultyLevel: "Easy",
        recommendationCategory: "Resume Awareness",
        explanation: "A resume summarizes your education and skills for employers."
    },
    {
        grade: "Class 12",
        questionText: "Good communication means:",
        options: [
            "Speaking clearly and listening properly",
            "Speaking without listening",
            "Using only slang",
            "Avoiding conversation"
        ],
        correctAnswer: "Speaking clearly and listening properly",
        skillTag: "English Communication",
        difficultyLevel: "Easy",
        recommendationCategory: "Communication",
        explanation: "Effective communication involves both speaking and active listening."
    },
    // Logical Reasoning – 4 questions
    {
        grade: "Class 12",
        questionText: "Find the next number: 5, 10, 15, 20, __",
        options: ["21", "22", "25", "30"],
        correctAnswer: "25",
        skillTag: "Logical Reasoning",
        difficultyLevel: "Easy",
        recommendationCategory: "Number Series",
        explanation: "The sequence adds 5 to each term."
    },
    {
        grade: "Class 12",
        questionText: "If all engineers studied technical subjects, then engineering needs:",
        options: ["Technical knowledge", "Only drawing", "Only singing", "No study"],
        correctAnswer: "Technical knowledge",
        skillTag: "Logical Reasoning",
        difficultyLevel: "Easy",
        recommendationCategory: "Logical Thinking",
        explanation: "The premise links engineers to technical subjects."
    },
    {
        grade: "Class 12",
        questionText: "Which one is different?",
        options: ["Doctor", "Nurse", "Pharmacist", "Carpenter"],
        correctAnswer: "Carpenter",
        skillTag: "Logical Reasoning",
        difficultyLevel: "Easy",
        recommendationCategory: "Classification",
        explanation: "Carpenter is not a healthcare profession; the others are."
    },
    {
        grade: "Class 12",
        questionText: "Data interpretation means:",
        options: [
            "Understanding data and charts",
            "Ignoring numbers",
            "Writing poems",
            "Drawing random pictures"
        ],
        correctAnswer: "Understanding data and charts",
        skillTag: "Logical Reasoning",
        difficultyLevel: "Easy",
        recommendationCategory: "Data Interpretation",
        explanation: "It involves analyzing and explaining the meaning of data."
    },
    // Career & Course Awareness – 5 questions
    {
        grade: "Class 12",
        questionText: "TNEA is mainly used for:",
        options: [
            "Engineering admission in Tamil Nadu",
            "Medical admission only",
            "Law admission only",
            "School admission"
        ],
        correctAnswer: "Engineering admission in Tamil Nadu",
        skillTag: "Career & Course Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "TNEA Awareness",
        explanation: "TNEA is the counseling process for engineering in TN."
    },
    {
        grade: "Class 12",
        questionText: "NEET is mainly for:",
        options: ["Medical courses", "Commerce courses", "Arts courses only", "Polytechnic only"],
        correctAnswer: "Medical courses",
        skillTag: "Career & Course Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "NEET Awareness",
        explanation: "NEET is required for MBBS/BDS and other medical courses."
    },
    {
        grade: "Class 12",
        questionText: "CLAT is related to:",
        options: ["Law", "Engineering", "Nursing", "Agriculture only"],
        correctAnswer: "Law",
        skillTag: "Career & Course Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Law Entrance Awareness",
        explanation: "CLAT is the entrance exam for National Law Universities."
    },
    {
        grade: "Class 12",
        questionText: "Scholarships are helpful because they:",
        options: ["Provide financial support", "Stop education", "Increase difficulty only", "Remove courses"],
        correctAnswer: "Provide financial support",
        skillTag: "Career & Course Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Scholarship Awareness",
        explanation: "Scholarships provide financial aid to meritorious or needy students."
    },
    {
        grade: "Class 12",
        questionText: "Cutoff marks help students understand:",
        options: ["Admission chances", "Food menu", "Sports score", "Bus timing"],
        correctAnswer: "Admission chances",
        skillTag: "Career & Course Awareness",
        difficultyLevel: "Easy",
        recommendationCategory: "Cutoff Awareness",
        explanation: "Cutoff reflects the minimum marks required for admission in previous years."
    },
    // Digital / Employability Skills – 2 questions
    {
        grade: "Class 12",
        questionText: "Which tool is commonly used for preparing documents?",
        options: ["MS Word / Google Docs", "Paint only", "Calculator only", "Music player"],
        correctAnswer: "MS Word / Google Docs",
        skillTag: "Digital / Employability Skills",
        difficultyLevel: "Easy",
        recommendationCategory: "Digital Skills",
        explanation: "Word processors are standard tools for document creation."
    },
    {
        grade: "Class 12",
        questionText: "Email writing is useful for:",
        options: ["College communication and applications", "Sleeping", "Cooking", "Drawing"],
        correctAnswer: "College communication and applications",
        skillTag: "Digital / Employability Skills",
        difficultyLevel: "Easy",
        recommendationCategory: "Employability Communication",
        explanation: "Email is a formal communication method used in professional settings."
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        await OnboardingQuestion.deleteMany({ grade: "Class 12" });
        console.log("Deleted existing Class 12 questions");

        await OnboardingQuestion.insertMany(questions);
        console.log("Successfully seeded 25 questions for Class 12");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
