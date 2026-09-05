const mongoose = require("mongoose");
require("dotenv").config();
const OnboardingQuestion = require("./models/OnboardingQuestion");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const sampleQuestions = [
  // CLASS 10 QUESTIONS
  {
    classLevel: "10",
    questionText: "Which of these activities do you enjoy the most?",
    category: "Interest",
    weight: 1,
    options: [
      { label: "Solving complex math puzzles", score: 5, tags: ["logical_thinking", "math_interest"] },
      { label: "Conducting science experiments", score: 5, tags: ["science_interest", "analytical"] },
      { label: "Writing stories or public speaking", score: 5, tags: ["communication", "creativity"] },
      { label: "Managing events or leading a team", score: 5, tags: ["leadership", "decision_making"] }
    ]
  },
  {
    classLevel: "10",
    questionText: "When facing a difficult problem, how do you usually approach it?",
    category: "Aptitude",
    weight: 1,
    options: [
      { label: "I break it down into logical steps", score: 5, tags: ["logical_thinking", "problem_solving"] },
      { label: "I look for creative or out-of-the-box solutions", score: 5, tags: ["creativity", "innovation"] },
      { label: "I ask others for their opinions and collaborate", score: 5, tags: ["communication", "teamwork"] },
      { label: "I research facts and data before deciding", score: 5, tags: ["analytical", "research"] }
    ]
  },
  {
    classLevel: "10",
    questionText: "Which subject makes you lose track of time?",
    category: "Academic",
    weight: 1,
    options: [
      { label: "Mathematics & Physics", score: 5, tags: ["math_interest", "logical_thinking"] },
      { label: "Biology & Chemistry", score: 5, tags: ["medical_interest", "science_interest"] },
      { label: "History, Economics, or Languages", score: 5, tags: ["humanities", "communication"] },
      { label: "Business Studies & Accounts", score: 5, tags: ["commerce_interest", "management"] }
    ]
  },
  
  // CLASS 5 QUESTIONS (Updated Categories to match Skill categories)
  {
    classLevel: "5",
    questionText: "Find the next number: 2, 4, 6, 8, ?",
    category: "logical thinking",
    weight: 1,
    options: [
      { label: "9", score: 0, tags: ["logical_thinking"] },
      { label: "10", score: 5, tags: ["logical_thinking"] },
      { label: "12", score: 0, tags: ["logical_thinking"] },
      { label: "6", score: 0, tags: ["logical_thinking"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "What is 15 + 10?",
    category: "math",
    weight: 1,
    options: [
      { label: "20", score: 0, tags: ["math_interest"] },
      { label: "25", score: 5, tags: ["math_interest"] },
      { label: "30", score: 0, tags: ["math_interest"] },
      { label: "35", score: 0, tags: ["math_interest"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "Which of these is a living thing?",
    category: "science",
    weight: 1,
    options: [
      { label: "Rock", score: 0, tags: ["science_interest"] },
      { label: "Tree", score: 5, tags: ["science_interest"] },
      { label: "Chair", score: 0, tags: ["science_interest"] },
      { label: "Table", score: 0, tags: ["science_interest"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "Choose correct sentence:",
    category: "communication",
    weight: 1,
    options: [
      { label: "She go school", score: 0, tags: ["communication"] },
      { label: "She goes to school", score: 5, tags: ["communication"] },
      { label: "She going school", score: 0, tags: ["communication"] },
      { label: "She gone school", score: 0, tags: ["communication"] }
    ]
  },
  {
    classLevel: "5",
    questionText: 'Remember this: “Dog, Ball, Tree”. What was the second word?',
    category: "logical thinking",
    weight: 1,
    options: [
      { label: "Dog", score: 0, tags: ["memory"] },
      { label: "Ball", score: 5, tags: ["memory"] },
      { label: "Tree", score: 0, tags: ["memory"] },
      { label: "Cat", score: 0, tags: ["memory"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "You have paper and colors. What will you do?",
    category: "creativity",
    weight: 1,
    options: [
      { label: "Leave it", score: 0, tags: ["creativity"] },
      { label: "Draw something new", score: 5, tags: ["creativity"] },
      { label: "Throw it", score: 0, tags: ["creativity"] },
      { label: "Ignore", score: 0, tags: ["creativity"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "Your toy is broken. What will you do?",
    category: "logical thinking",
    weight: 1,
    options: [
      { label: "Cry", score: 0, tags: ["problem_solving"] },
      { label: "Try to fix it", score: 5, tags: ["problem_solving", "logical_thinking"] },
      { label: "Throw it", score: 0, tags: ["problem_solving"] },
      { label: "Ignore", score: 0, tags: ["problem_solving"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "Your friend needs help in homework. What will you do?",
    category: "communication",
    weight: 1,
    options: [
      { label: "Ignore", score: 0, tags: ["teamwork", "leadership"] },
      { label: "Help them", score: 5, tags: ["teamwork", "leadership", "communication"] },
      { label: "Laugh", score: 0, tags: ["teamwork", "leadership"] },
      { label: "Walk away", score: 0, tags: ["teamwork", "leadership"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "What do you enjoy most?",
    category: "Interest",
    weight: 1,
    options: [
      { label: "Reading stories", score: 5, tags: ["communication", "humanities"] },
      { label: "Playing puzzles", score: 5, tags: ["logical_thinking", "problem_solving"] },
      { label: "Drawing", score: 5, tags: ["creativity", "arts"] },
      { label: "Science games", score: 5, tags: ["science_interest"] }
    ]
  },
  {
    classLevel: "5",
    questionText: "How do you feel about studies?",
    category: "Interest",
    weight: 1,
    options: [
      { label: "Very confident", score: 5, tags: ["career_clarity"] },
      { label: "Good", score: 4, tags: ["career_clarity"] },
      { label: "Okay", score: 2, tags: ["career_clarity"] },
      { label: "Need help", score: 1, tags: ["career_clarity"] }
    ]
  }
];

const seedDB = async () => {
  try {
    await OnboardingQuestion.deleteMany({ classLevel: { $in: ["10", "5"] } });
    console.log("Cleared old questions for class 5 and 10.");

    await OnboardingQuestion.insertMany(sampleQuestions);
    console.log("Sample onboarding questions for 5 and 10 added successfully!");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDB();
