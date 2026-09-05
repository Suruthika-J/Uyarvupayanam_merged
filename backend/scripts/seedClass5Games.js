const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassContent = require('../models/ClassContent');

dotenv.config();

const class5Games = [
  {
    title: "Outdoor Games",
    targetClass: "5",
    sectionType: "Games",
    category: "Physical Fitness",
    subCategoryLabel: "Field Games",
    shortDescription: "Football, Cricket, Kabaddi, Kho-Kho, Running, and Cycling.",
    fullDescription: "Outdoor games improve stamina, teamwork, and coordination. Engaging in field sports like Football, Cricket, and Kabaddi builds physical strength and strategic thinking.",
    coverImage: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School playground, local parks, sports clubs",
    tips: [
      "Football - improves stamina & teamwork",
      "Cricket - focus, coordination",
      "Kabaddi - strength + strategy (very common in TN schools)",
      "Kho-Kho - speed & agility",
      "Running / Athletics - basic fitness",
      "Cycling - balance & endurance"
    ],
    activities: [
      "Play outdoor games daily for 1 hour",
      "Participate in school sports events"
    ],
    status: "published",
    featured: true,
    displayOrder: 1
  },
  {
    title: "Indoor Games",
    targetClass: "5",
    sectionType: "Games",
    category: "Skill Development",
    subCategoryLabel: "Board Games",
    shortDescription: "Chess, Carrom, Ludo, Puzzles, and Memory games.",
    fullDescription: "Indoor games are great for brain development, strategy, and concentration. Playing games like Chess and Carrom improves hand-eye coordination and logical thinking.",
    coverImage: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "Home, school indoor games room",
    tips: [
      "Chess - thinking, strategy",
      "Carrom - hand-eye coordination",
      "Ludo / Board Games - fun + basic logic",
      "Puzzles - brain development",
      "Memory games - concentration"
    ],
    activities: [
      "Solve puzzles in free time",
      "Play board games with family"
    ],
    status: "published",
    featured: true,
    displayOrder: 2
  },
  {
    title: "School-Level Activities",
    targetClass: "5",
    sectionType: "Games",
    category: "Structured Activities",
    subCategoryLabel: "Physical Training",
    shortDescription: "Yoga, PT Exercises, Sports Day Events, and Martial Arts.",
    fullDescription: "Structured school activities like Yoga and PT exercises instill discipline and calmness. Martial arts like Karate and Silambam build self-defense and confidence.",
    coverImage: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=600",
    whyItMatters: "School PT periods, after-school activities",
    tips: [
      "Yoga - flexibility & calmness",
      "PT Exercises - discipline + fitness",
      "Sports Day Events - race, relay, long jump",
      "Martial Arts (Karate/Silambam) - self-defense + confidence"
    ],
    activities: [
      "Practice yoga for 15 minutes daily",
      "Participate in PT exercises actively"
    ],
    status: "published",
    displayOrder: 3
  }
];

const seedClass5Games = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear old Class 5 Games
    await ClassContent.deleteMany({ targetClass: '5', sectionType: 'Games' });
    console.log('🗑️  Cleared old Class 5 Games data');

    // Insert new games
    await ClassContent.insertMany(class5Games);
    console.log(`📝 Inserted ${class5Games.length} new Class 5 Games records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedClass5Games();
