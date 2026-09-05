const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassContent = require('../models/ClassContent');

dotenv.config();

const class5FunActivities = [
  {
    title: "Story Reading",
    targetClass: "5",
    sectionType: "Fun",
    category: "Fun Learning",
    subCategoryLabel: "Reading",
    shortDescription: "Read Tamil & English storybooks, listen to storytelling from parents or teachers.",
    fullDescription: "Learning becomes more interesting when it is fun. Story reading helps Tamil Nadu students learn creatively through local stories, fables, and moral tales like Panchatantra.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School library, Tamil storybooks, Reading apps",
    tips: [
      "Read Tamil & English storybooks",
      "Listen to storytelling from parents/teachers",
      "Read aloud"
    ],
    activities: [
      "Improves reading",
      "Builds imagination",
      "Improves vocabulary"
    ],
    status: "published",
    featured: true,
    displayOrder: 1
  },
  {
    title: "Drawing & Coloring",
    targetClass: "5",
    sectionType: "Fun",
    category: "Fun Learning",
    subCategoryLabel: "Arts",
    shortDescription: "Draw festivals (Pongal, Deepavali), nature, and animals to express creativity.",
    fullDescription: "Art and drawing help students focus and express themselves. Participate in school drawing competitions and enjoy coloring local festivals.",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School art class, Drawing YouTube videos, Coloring books",
    tips: [
      "Draw festivals (Pongal, Deepavali)",
      "Draw nature, animals",
      "Participate in competitions"
    ],
    activities: [
      "Creativity",
      "Focus",
      "Expression"
    ],
    status: "published",
    featured: true,
    displayOrder: 2
  },
  {
    title: "Simple Science Experiments",
    targetClass: "5",
    sectionType: "Fun",
    category: "Fun Learning",
    subCategoryLabel: "Science",
    shortDescription: "Grow plants, do water experiments, and enjoy simple home science activities.",
    fullDescription: "Practical learning sparks curiosity. Kids can learn a lot from basic science experiments done safely at home or in school.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School science class, Teacher guidance, Kids science videos",
    tips: [
      "Grow plants",
      "Water experiments",
      "Magnet activity",
      "Simple home experiments"
    ],
    activities: [
      "Curiosity",
      "Practical learning"
    ],
    status: "published",
    displayOrder: 3
  },
  {
    title: "DIY Crafts",
    targetClass: "5",
    sectionType: "Fun",
    category: "Fun Learning",
    subCategoryLabel: "Crafts",
    shortDescription: "Create paper crafts, waste-to-best projects, and beautiful greeting cards.",
    fullDescription: "Make beautiful crafts out of waste materials. DIY projects help build innovation and hands-on skills.",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School projects, Craft tutorials",
    tips: [
      "Paper crafts",
      "Waste-to-best projects",
      "Greeting cards"
    ],
    activities: [
      "Creativity",
      "Innovation"
    ],
    status: "published",
    displayOrder: 4
  },
  {
    title: "Nature Observation",
    targetClass: "5",
    sectionType: "Fun",
    category: "Fun Learning",
    subCategoryLabel: "Nature",
    shortDescription: "Observe local plants and trees, visit parks, and grow your own garden.",
    fullDescription: "Connecting with nature builds environmental awareness. Spend time outside observing the beautiful local flora and fauna.",
    coverImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "Garden, School trips",
    tips: [
      "Observe plants, trees",
      "Visit parks",
      "Grow plants at home"
    ],
    activities: [
      "Environmental awareness",
      "Observation skills"
    ],
    status: "published",
    displayOrder: 5
  },
  {
    title: "Singing & Rhymes",
    targetClass: "5",
    sectionType: "Fun",
    category: "Fun Learning",
    subCategoryLabel: "Music",
    shortDescription: "Learn Tamil rhymes, sing songs, and participate in school cultural events.",
    fullDescription: "Music and rhymes improve memory and confidence. Learn traditional Tamil songs and rhymes to stay connected to the culture.",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School, Music videos",
    tips: [
      "Learn Tamil rhymes",
      "Sing songs",
      "Participate in school events"
    ],
    activities: [
      "Confidence",
      "Memory"
    ],
    status: "published",
    displayOrder: 6
  }
];

const seedClass5Fun = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear old Class 5 Fun Learning
    await ClassContent.deleteMany({ targetClass: '5', sectionType: 'Fun' });
    console.log('🗑️  Cleared old Class 5 Fun data');

    // Insert new activities
    await ClassContent.insertMany(class5FunActivities);
    console.log(`📝 Inserted ${class5FunActivities.length} new Class 5 Fun Activity records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedClass5Fun();
