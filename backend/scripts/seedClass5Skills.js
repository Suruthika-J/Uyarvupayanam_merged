const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassContent = require('../models/ClassContent');

dotenv.config();

const class5Skills = [
  {
    title: "Communication Skills",
    targetClass: "5",
    sectionType: "Skills",
    category: "Life Skills",
    subCategoryLabel: "Speaking",
    shortDescription: "Speaking clearly in Tamil & English, expressing ideas, and asking questions.",
    fullDescription: "At Class 5 level, students should focus on developing basic life skills and communication. Learn to speak clearly, express your ideas confidently, and participate in class discussions.",
    coverImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School classroom, Group discussions, Speaking activities",
    tips: [
      "Speak clearly in Tamil & English",
      "Express ideas",
      "Ask questions"
    ],
    activities: [
      "Speak 2–3 lines daily about your day",
      "Participate in class discussions"
    ],
    status: "published",
    featured: true,
    displayOrder: 1
  },
  {
    title: "Reading Skills",
    targetClass: "5",
    sectionType: "Skills",
    category: "Academic Skills",
    subCategoryLabel: "Reading",
    shortDescription: "Reading Tamil & English fluently, understanding meaning, and reading aloud.",
    fullDescription: "Develop a habit of reading daily. Reading improves vocabulary and helps you understand subjects better. Use school textbooks and library storybooks.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School textbooks, Library books, Storybooks",
    tips: [
      "Read Tamil & English fluently",
      "Understand meaning",
      "Read aloud"
    ],
    activities: [
      "Read 15 minutes daily",
      "Practice reading aloud to parents"
    ],
    status: "published",
    featured: true,
    displayOrder: 2
  },
  {
    title: "Writing Skills",
    targetClass: "5",
    sectionType: "Skills",
    category: "Academic Skills",
    subCategoryLabel: "Writing",
    shortDescription: "Neat handwriting, sentence formation, and basic paragraph writing.",
    fullDescription: "Good writing skills lead to better exam performance and clarity of thought. Practice writing neat sentences and short paragraphs daily.",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School exercises, Homework, Practice books",
    tips: [
      "Neat handwriting",
      "Sentence formation",
      "Basic paragraph writing"
    ],
    activities: [
      "Write 5–10 lines daily",
      "Practice dictation"
    ],
    status: "published",
    displayOrder: 3
  },
  {
    title: "Creativity",
    targetClass: "5",
    sectionType: "Skills",
    category: "Creative Skills",
    subCategoryLabel: "Arts",
    shortDescription: "Drawing, craft making, and creative thinking.",
    fullDescription: "Creativity sparks innovation and imagination. Engage in drawing, craft making, and creative thinking exercises at home or in art class.",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "Art class, Home activities, DIY videos",
    tips: [
      "Drawing",
      "Craft making",
      "Creative thinking"
    ],
    activities: [
      "Draw weekly",
      "Make crafts from waste materials"
    ],
    status: "published",
    displayOrder: 4
  },
  {
    title: "Problem Solving",
    targetClass: "5",
    sectionType: "Skills",
    category: "Thinking Skills",
    subCategoryLabel: "Logic",
    shortDescription: "Logical thinking and solving problems step-by-step.",
    fullDescription: "Problem solving builds thinking ability and decision making. Learn to approach puzzles and maths problems logically, step-by-step.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "Maths class, Puzzle games, Worksheets",
    tips: [
      "Logical thinking",
      "Solving problems step-by-step"
    ],
    activities: [
      "Solve puzzles",
      "Try reasoning questions"
    ],
    status: "published",
    displayOrder: 5
  },
  {
    title: "Teamwork",
    targetClass: "5",
    sectionType: "Skills",
    category: "Life Skills",
    subCategoryLabel: "Social",
    shortDescription: "Working with others, sharing ideas, and helping friends.",
    fullDescription: "Teamwork fosters cooperation and leadership. Learn to work harmoniously in group activities and school projects.",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "Group activities, School projects",
    tips: [
      "Working with others",
      "Sharing ideas",
      "Helping friends"
    ],
    activities: [
      "Group assignments",
      "Team games"
    ],
    status: "published",
    displayOrder: 6
  },
  {
    title: "Time Management",
    targetClass: "5",
    sectionType: "Skills",
    category: "Life Skills",
    subCategoryLabel: "Planning",
    shortDescription: "Managing study and play time, and following a timetable.",
    fullDescription: "Good time management builds discipline and productivity. Learn to balance your study time and playtime effectively.",
    coverImage: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "Home routine, Teacher guidance",
    tips: [
      "Managing study and play time",
      "Following a timetable"
    ],
    activities: [
      "Create daily timetable",
      "Follow schedule"
    ],
    status: "published",
    displayOrder: 7
  },
  {
    title: "Basic Digital Skills",
    targetClass: "5",
    sectionType: "Skills",
    category: "Technical Skills",
    subCategoryLabel: "Computers",
    shortDescription: "Computer basics, typing, and safe internet use.",
    fullDescription: "Digital skills prepare you for the future. Learn basic typing, understand computer tools, and practice safe internet browsing.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School lab, Computer classes",
    tips: [
      "Computer basics",
      "Typing",
      "Safe internet use"
    ],
    activities: [
      "Practice typing",
      "Learn basic tools"
    ],
    status: "published",
    displayOrder: 8
  }
];

const seedClass5Skills = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear old Class 5 Skills
    await ClassContent.deleteMany({ targetClass: '5', sectionType: 'Skills' });
    console.log('🗑️  Cleared old Class 5 Skills data');

    // Insert new skills
    await ClassContent.insertMany(class5Skills);
    console.log(`📝 Inserted ${class5Skills.length} new Class 5 Skills records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedClass5Skills();
