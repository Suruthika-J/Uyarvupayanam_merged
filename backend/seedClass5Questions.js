const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const OnboardingQuestion = require("./models/OnboardingQuestion");

const questions = [
  {
    "questionText": "What is 48 + 27?",
    "options": ["65", "75", "85", "95"],
    "correctAnswer": "75",
    "skillTag": "Mathematics",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Numerical Skill",
    "grade": "Class 5",
    "explanation": "48 + 27 = 75."
  },
  {
    "questionText": "What is 9 × 6?",
    "options": ["45", "54", "63", "72"],
    "correctAnswer": "54",
    "skillTag": "Mathematics",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Multiplication Skill",
    "grade": "Class 5",
    "explanation": "9 times 6 is 54."
  },
  {
    "questionText": "Which fraction is equal to one half?",
    "options": ["1/4", "2/4", "3/4", "4/4"],
    "correctAnswer": "2/4",
    "skillTag": "Mathematics",
    "difficultyLevel": "Medium",
    "recommendationCategory": "Fraction Understanding",
    "grade": "Class 5",
    "explanation": "2/4 is equal to 1/2 when simplified."
  },
  {
    "questionText": "A rectangle has 4 sides. How many sides do 3 rectangles have in total?",
    "options": ["8", "10", "12", "16"],
    "correctAnswer": "12",
    "skillTag": "Mathematics",
    "difficultyLevel": "Medium",
    "recommendationCategory": "Problem Solving",
    "grade": "Class 5",
    "explanation": "3 rectangles * 4 sides = 12 sides."
  },
  {
    "questionText": "Choose the correct spelling.",
    "options": ["Enviroment", "Environment", "Envirment", "Envirement"],
    "correctAnswer": "Environment",
    "skillTag": "English",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Vocabulary Skill",
    "grade": "Class 5",
    "explanation": "The correct spelling is Environment."
  },
  {
    "questionText": "Which word is a noun?",
    "options": ["Run", "Beautiful", "School", "Quickly"],
    "correctAnswer": "School",
    "skillTag": "English",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Grammar Skill",
    "grade": "Class 5",
    "explanation": "School is a naming word (noun)."
  },
  {
    "questionText": "Choose the correct sentence.",
    "options": ["She go to school.", "She goes to school.", "She going school.", "She gone to school."],
    "correctAnswer": "She goes to school.",
    "skillTag": "English",
    "difficultyLevel": "Medium",
    "recommendationCategory": "Sentence Formation",
    "grade": "Class 5",
    "explanation": "With third person singular (She), we use 'goes'."
  },
  {
    "questionText": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Jupiter", "Venus"],
    "correctAnswer": "Mars",
    "skillTag": "Science",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Science Awareness",
    "grade": "Class 5",
    "explanation": "Mars is known as the Red Planet due to iron oxide on its surface."
  },
  {
    "questionText": "Which part of the plant makes food?",
    "options": ["Root", "Stem", "Leaf", "Flower"],
    "correctAnswer": "Leaf",
    "skillTag": "Science",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Observation Skill",
    "grade": "Class 5",
    "explanation": "Leaves make food for the plant through photosynthesis."
  },
  {
    "questionText": "Water changes into vapor by which process?",
    "options": ["Freezing", "Melting", "Evaporation", "Condensation"],
    "correctAnswer": "Evaporation",
    "skillTag": "Science",
    "difficultyLevel": "Medium",
    "recommendationCategory": "Concept Understanding",
    "grade": "Class 5",
    "explanation": "Evaporation is the process of water turning into vapor."
  },
  {
    "questionText": "Who is called the Father of the Nation in India?",
    "options": ["Jawaharlal Nehru", "Mahatma Gandhi", "Dr. A.P.J. Abdul Kalam", "Subhash Chandra Bose"],
    "correctAnswer": "Mahatma Gandhi",
    "skillTag": "General Knowledge",
    "difficultyLevel": "Easy",
    "recommendationCategory": "GK Awareness",
    "grade": "Class 5",
    "explanation": "Mahatma Gandhi is known as the Father of the Nation."
  },
  {
    "questionText": "Which is the national animal of India?",
    "options": ["Lion", "Tiger", "Elephant", "Peacock"],
    "correctAnswer": "Tiger",
    "skillTag": "General Knowledge",
    "difficultyLevel": "Easy",
    "recommendationCategory": "GK Awareness",
    "grade": "Class 5",
    "explanation": "Tiger is the national animal of India."
  },
  {
    "questionText": "Find the next number: 2, 4, 6, 8, __",
    "options": ["9", "10", "11", "12"],
    "correctAnswer": "10",
    "skillTag": "Logical Thinking",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Pattern Recognition",
    "grade": "Class 5",
    "explanation": "The pattern is adding 2 each time. 8 + 2 = 10."
  },
  {
    "questionText": "Which one is different from the others?",
    "options": ["Apple", "Mango", "Carrot", "Banana"],
    "correctAnswer": "Carrot",
    "skillTag": "Logical Thinking",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Classification Skill",
    "grade": "Class 5",
    "explanation": "Apple, Mango, and Banana are fruits, while Carrot is a vegetable."
  },
  {
    "questionText": "If all birds have wings and a parrot is a bird, what does a parrot have?",
    "options": ["Fins", "Wings", "Horns", "Paws"],
    "correctAnswer": "Wings",
    "skillTag": "Logical Thinking",
    "difficultyLevel": "Medium",
    "recommendationCategory": "Reasoning Skill",
    "grade": "Class 5",
    "explanation": "Since all birds have wings and a parrot is a bird, it must have wings."
  },
  {
    "questionText": "Read this sentence: 'Ravi waters the plants every morning.' What does Ravi water?",
    "options": ["Animals", "Plants", "Books", "Toys"],
    "correctAnswer": "Plants",
    "skillTag": "Reading Ability",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Reading Comprehension",
    "grade": "Class 5",
    "explanation": "The sentence clearly states Ravi waters the plants."
  },
  {
    "questionText": "Read this sentence: 'The sun rises in the east.' Where does the sun rise?",
    "options": ["North", "South", "East", "West"],
    "correctAnswer": "East",
    "skillTag": "Reading Ability",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Reading Comprehension",
    "grade": "Class 5",
    "explanation": "The sentence states the sun rises in the east."
  },
  {
    "questionText": "Which activity shows creativity?",
    "options": ["Copying homework", "Drawing a new picture", "Sleeping in class", "Skipping school"],
    "correctAnswer": "Drawing a new picture",
    "skillTag": "Creativity",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Creative Thinking",
    "grade": "Class 5",
    "explanation": "Creating something new like a drawing shows creativity."
  },
  {
    "questionText": "If you want to make a greeting card, what should you use first?",
    "options": ["Idea and imagination", "Only money", "Only phone", "Only food"],
    "correctAnswer": "Idea and imagination",
    "skillTag": "Creativity",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Creative Planning",
    "grade": "Class 5",
    "explanation": "Ideas and imagination are the first steps to any creative work."
  },
  {
    "questionText": "What should you say when you ask your teacher for help?",
    "options": ["Give me now", "Please help me", "I do not care", "Move away"],
    "correctAnswer": "Please help me",
    "skillTag": "Communication",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Speaking Skill",
    "grade": "Class 5",
    "explanation": "'Please help me' is the polite way to ask for assistance."
  },
  {
    "questionText": "Good communication means:",
    "options": ["Speaking clearly and listening", "Shouting always", "Ignoring others", "Never asking questions"],
    "correctAnswer": "Speaking clearly and listening",
    "skillTag": "Communication",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Communication Skill",
    "grade": "Class 5",
    "explanation": "Communication involves both expressing yourself clearly and listening to others."
  },
  {
    "questionText": "Which device is used to type letters on a computer?",
    "options": ["Mouse", "Keyboard", "Speaker", "Printer"],
    "correctAnswer": "Keyboard",
    "skillTag": "Computer Basics",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Digital Literacy",
    "grade": "Class 5",
    "explanation": "The keyboard is the primary input device for typing."
  },
  {
    "questionText": "Which one is used to browse the internet?",
    "options": ["Paint", "Web Browser", "Calculator", "Notepad"],
    "correctAnswer": "Web Browser",
    "skillTag": "Computer Basics",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Internet Basics",
    "grade": "Class 5",
    "explanation": "A web browser like Chrome or Firefox is used to access the internet."
  },
  {
    "questionText": "Which habit helps students learn better?",
    "options": ["Studying regularly", "Watching TV all day", "Skipping homework", "Sleeping in class"],
    "correctAnswer": "Studying regularly",
    "skillTag": "Learning Habits",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Study Habit",
    "grade": "Class 5",
    "explanation": "Consistency and regular study lead to better learning."
  },
  {
    "questionText": "What should you do if you do not understand a lesson?",
    "options": ["Stay silent forever", "Ask teacher or parent", "Throw the book", "Stop studying"],
    "correctAnswer": "Ask teacher or parent",
    "skillTag": "Learning Habits",
    "difficultyLevel": "Easy",
    "recommendationCategory": "Self Improvement",
    "grade": "Class 5",
    "explanation": "Asking questions is a key part of learning when you are confused."
  }
];

const seedQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        await OnboardingQuestion.deleteMany({ grade: "Class 5" });
        console.log("Deleted existing Class 5 questions");

        await OnboardingQuestion.insertMany(questions);
        console.log("Successfully seeded 25 questions for Class 5");

        process.exit();
    } catch (error) {
        console.error("Error seeding questions:", error);
        process.exit(1);
    }
};

seedQuestions();
