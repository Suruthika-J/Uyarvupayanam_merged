const mongoose = require("mongoose");
require("dotenv").config();
const Skill = require("./models/Skill");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const sampleSkills = [
  // LOGICAL THINKING
  {
    title: "Critical Thinking",
    description: "Learn to analyze facts to form a judgment.",
    category: "logical thinking",
    classLevel: "5",
    icon: "🧠",
    tags: ["logic", "analysis"],
    resources: [{ title: "Logic Puzzles for Kids", link: "https://example.com/logic" }]
  },
  {
    title: "Chess Basics",
    description: "Improve strategy and logical planning by learning Chess.",
    category: "logical thinking",
    classLevel: "5",
    icon: "♟️",
    tags: ["logic", "strategy"],
    resources: [{ title: "Learn Chess", link: "https://example.com/chess" }]
  },
  
  // COMMUNICATION
  {
    title: "Public Speaking",
    description: "Gain confidence to speak in front of others.",
    category: "communication",
    classLevel: "5",
    icon: "🎤",
    tags: ["speech", "confidence"],
    resources: [{ title: "Speech Tips", link: "https://example.com/speech" }]
  },
  {
    title: "Storytelling",
    description: "Learn to express ideas through creative stories.",
    category: "communication",
    classLevel: "5",
    icon: "📖",
    tags: ["writing", "expression"],
    resources: [{ title: "Storytelling Guide", link: "https://example.com/stories" }]
  },

  // CREATIVITY
  {
    title: "Digital Art",
    description: "Explore your creative side with digital drawing tools.",
    category: "creativity",
    classLevel: "5",
    icon: "🎨",
    tags: ["art", "digital"],
    resources: [{ title: "Art for Beginners", link: "https://example.com/art" }]
  },

  // MATH
  {
    title: "Vedic Math",
    description: "Master fast calculation techniques for better speed.",
    category: "math",
    classLevel: "5",
    icon: "🔢",
    tags: ["math", "calculation"],
    resources: [{ title: "Vedic Math Tricks", link: "https://example.com/math" }]
  },

  // SCIENCE
  {
    title: "Do-it-Yourself Experiments",
    description: "Perform simple and fun science experiments at home.",
    category: "science",
    classLevel: "5",
    icon: "🧪",
    tags: ["science", "experiments"],
    resources: [{ title: "DIY Science", link: "https://example.com/science" }]
  }
];

const seedSkills = async () => {
  try {
    await Skill.deleteMany({ classLevel: "5" });
    console.log("Cleared old Class 5 skills.");

    await Skill.insertMany(sampleSkills);
    console.log("Sample Class 5 skills added successfully!");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding skills:", error);
    process.exit(1);
  }
};

seedSkills();
