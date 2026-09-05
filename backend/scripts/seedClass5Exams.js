const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassContent = require('../models/ClassContent');

dotenv.config();

const class5Exams = [
  // OLYMPIADS
  {
    title: "Science Olympiad (NSO)",
    targetClass: "5",
    sectionType: "Exams",
    category: "Olympiad Exams",
    subCategoryLabel: "Science Olympiad Foundation (SOF)",
    shortDescription: "Improves science understanding and observation skills. Suitable for Class 5 students interested in science.",
    fullDescription: "National Science Olympiad (NSO) helps students improve subject knowledge, logical thinking, and confidence. It tests basic science understanding, real-life science awareness, observation, and application of textbook concepts.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
    examPattern: "Plants and animals, Human body, Food and health, Air/water/environment, States of matter, Light/heat/energy, Simple machines",
    whyItMatters: "School EVS/Science textbook, Class 5 NCERT EVS book, SOF practice books, Simple science worksheets",
    tips: [
      "Read textbook concepts clearly",
      "Understand real-life examples",
      "Practice MCQs",
      "Revise diagrams and keywords",
      "Solve previous sample questions"
    ],
    activities: [
      "improves observation",
      "improves concept clarity",
      "develops scientific thinking",
      "helps in competitive exposure"
    ],
    applicationMode: "Through school",
    status: "published",
    featured: true,
    displayOrder: 1
  },
  {
    title: "Maths Olympiad (IMO)",
    targetClass: "5",
    sectionType: "Exams",
    category: "Olympiad Exams",
    subCategoryLabel: "Science Olympiad Foundation (SOF)",
    shortDescription: "Improves numerical ability, logical reasoning, and calculation accuracy.",
    fullDescription: "International Mathematics Olympiad (IMO) is suitable for Class 5 students interested in mathematics and problem solving. It tests concept application and logical reasoning.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600",
    examPattern: "Numbers, Addition/Subtraction/Multiplication/Division, Factors/Multiples, Fractions/Decimals, Geometry, Time/Money, Data handling, Patterns",
    whyItMatters: "School maths textbook, Class 5 NCERT Maths book, Olympiad worksheets, Mental maths exercises",
    tips: [
      "practice sums daily",
      "revise tables regularly",
      "solve step by step",
      "focus on understanding, not memorizing",
      "practice reasoning questions"
    ],
    activities: [
      "improves logical thinking",
      "improves speed and accuracy",
      "strengthens maths basics"
    ],
    applicationMode: "Through school",
    status: "published",
    displayOrder: 2
  },
  {
    title: "English Olympiad (IEO)",
    targetClass: "5",
    sectionType: "Exams",
    category: "Olympiad Exams",
    subCategoryLabel: "Science Olympiad Foundation (SOF)",
    shortDescription: "Improves grammar, vocabulary, and reading comprehension.",
    fullDescription: "International English Olympiad (IEO) is suitable for Class 5 students interested in English and communication. It tests sentence usage and language accuracy.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600",
    examPattern: "Nouns, Pronouns, Verbs, Tenses basics, Adjectives, Adverbs, Articles, Prepositions, Synonyms/antonyms, Comprehension",
    whyItMatters: "School English textbook, Grammar workbook, Storybooks for children, Vocabulary worksheets",
    tips: [
      "read daily",
      "practice grammar exercises",
      "learn new words",
      "improve spelling",
      "solve comprehension passages"
    ],
    activities: [
      "improves language skills",
      "improves speaking and writing confidence",
      "builds reading habit"
    ],
    applicationMode: "Through school",
    status: "published",
    displayOrder: 3
  },
  {
    title: "General Knowledge Olympiad (IGKO)",
    targetClass: "5",
    sectionType: "Exams",
    category: "Olympiad Exams",
    subCategoryLabel: "Science Olympiad Foundation (SOF)",
    shortDescription: "Tests general awareness, environmental knowledge, and current basic facts.",
    fullDescription: "International General Knowledge Olympiad (IGKO) is for students interested in awareness beyond textbooks. Tests social awareness and everyday knowledge.",
    coverImage: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=600",
    examPattern: "India basics, World basics, Famous places, Important people, Nature/environment, Animals/birds, Basic current affairs",
    whyItMatters: "GK books for children, Quiz books, Educational magazines, GK videos",
    tips: [
      "read small GK facts daily",
      "watch educational quiz videos",
      "learn through flashcards",
      "discuss with parents or teachers"
    ],
    activities: [
      "improves awareness",
      "improves memory",
      "improves confidence in competitions"
    ],
    applicationMode: "Through school",
    status: "published",
    displayOrder: 4
  },
  {
    title: "Computer Olympiad (ICO)",
    targetClass: "5",
    sectionType: "Exams",
    category: "Olympiad Exams",
    subCategoryLabel: "Science Olympiad Foundation (SOF)",
    shortDescription: "Tests basic computer knowledge, digital awareness, and logical thinking.",
    fullDescription: "International Computer Olympiad (ICO) is for students interested in computers and digital learning. Tests simple technology concepts.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    examPattern: "Parts of computer, Input/output devices, Keyboard/mouse, Basic software, Computer safety, Internet basics",
    whyItMatters: "School computer textbook, Computer lab practice, Basic digital literacy notes, Worksheets",
    tips: [
      "practice on a computer if available",
      "learn names and uses of devices",
      "revise definitions",
      "do simple logic exercises"
    ],
    activities: [
      "improves digital literacy",
      "builds confidence with computers",
      "supports future technology learning"
    ],
    applicationMode: "Through school",
    status: "published",
    displayOrder: 5
  },

  // TALENT / APTITUDE
  {
    title: "NSTSE",
    targetClass: "5",
    sectionType: "Exams",
    category: "Talent / Aptitude Exams",
    subCategoryLabel: "Unified Council",
    shortDescription: "National Level Science Talent Search Examination focusing on science, maths, and reasoning.",
    fullDescription: "Helps students build logical thinking, aptitude, and subject confidence through concept-based questions.",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    examPattern: "Class 5 science concepts, Class 5 maths concepts, Basic mental ability, Word problems",
    whyItMatters: "School textbook, Class notes, Practice papers, Reasoning worksheets",
    tips: [
      "study regularly",
      "solve MCQs",
      "practice reasoning questions"
    ],
    activities: [
      "improves aptitude",
      "improves scientific thinking",
      "provides exam exposure"
    ],
    applicationMode: "School or online",
    status: "published",
    displayOrder: 6
  },
  {
    title: "UCO",
    targetClass: "5",
    sectionType: "Exams",
    category: "Talent / Aptitude Exams",
    subCategoryLabel: "Unified Council",
    shortDescription: "Unified Cyber Olympiad focusing on basic computer knowledge and logical reasoning.",
    fullDescription: "Helps students build digital understanding and reasoning skills.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    examPattern: "Basics of computer, Uses of computer, Input/output devices, Simple software awareness, Reasoning",
    whyItMatters: "School computer book, Lab practice, Beginner worksheets, Kid-friendly learning videos",
    tips: [
      "practice lab sessions",
      "understand basic logic",
      "review simple software concepts"
    ],
    activities: [
      "improves computer knowledge",
      "builds digital confidence"
    ],
    applicationMode: "School or online",
    status: "published",
    displayOrder: 7
  },
  {
    title: "UIEO",
    targetClass: "5",
    sectionType: "Exams",
    category: "Talent / Aptitude Exams",
    subCategoryLabel: "Unified Council",
    shortDescription: "Unified International English Olympiad focusing on grammar, vocabulary, and comprehension.",
    fullDescription: "Helps students build a strong English foundation and improve language usage.",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&q=80&w=600",
    examPattern: "Grammar basics, Vocabulary, Sentence correction, Reading comprehension, Spellings",
    whyItMatters: "School English book, Grammar workbook, Reading passages",
    tips: [
      "read a variety of texts",
      "practice sentence correction",
      "learn 2 new words daily"
    ],
    activities: [
      "improves English foundation",
      "improves reading and communication"
    ],
    applicationMode: "School or online",
    status: "published",
    displayOrder: 8
  },

  // SCHOOL COMPETITIONS
  {
    title: "Quiz Competition",
    targetClass: "5",
    sectionType: "Exams",
    category: "School Competitions",
    subCategoryLabel: "General",
    shortDescription: "Improves awareness and confidence.",
    fullDescription: "School-level competitions are important because they help students gain confidence, creativity, and communication skills.",
    coverImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=600",
    examPattern: "School lessons, GK facts, simple science and maths questions",
    whyItMatters: "General knowledge books, school notes, daily news",
    tips: [
      "stay curious",
      "participate without fear",
      "learn from mistakes"
    ],
    activities: [
      "improves quick thinking and memory"
    ],
    applicationMode: "School events",
    status: "published",
    displayOrder: 9
  },
  {
    title: "Drawing Competition",
    targetClass: "5",
    sectionType: "Exams",
    category: "School Competitions",
    subCategoryLabel: "Arts",
    shortDescription: "Improves creativity and fine motor skills.",
    fullDescription: "A great way for students to express themselves visually and build confidence in their artistic abilities.",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
    examPattern: "Thematic drawing, coloring, basic shading, creative expression",
    whyItMatters: "Art class, drawing books, online art tutorials",
    tips: [
      "practice drawing shapes",
      "experiment with colors",
      "draw from imagination"
    ],
    activities: [
      "improves imagination and focus"
    ],
    applicationMode: "School events",
    status: "published",
    displayOrder: 10
  }
];

const seedClass5Exams = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear old Class 5 exams
    await ClassContent.deleteMany({ targetClass: '5', sectionType: 'Exams' });
    console.log('🗑️  Cleared old Class 5 Exams data');

    // Insert new exams
    await ClassContent.insertMany(class5Exams);
    console.log(`📝 Inserted ${class5Exams.length} new Class 5 Exam records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedClass5Exams();
