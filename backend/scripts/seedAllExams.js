const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const examsData = [
  // --- CLASS 5 ---
  {
    name: "NSO (National Science Olympiad)",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 5",
    category: "Science",
    importantDates: "Nov–Dec",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "IMO (International Mathematics Olympiad)",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 5",
    category: "Mathematics",
    importantDates: "Oct–Nov",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "IEO (International English Olympiad)",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 5",
    category: "English",
    importantDates: "Oct–Nov",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "IGKO (General Knowledge Olympiad)",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 5",
    category: "GK",
    importantDates: "Sep–Oct",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Easy"
  },
  {
    name: "SilverZone Olympiads",
    conductingBody: "SilverZone Foundation",
    level: "Class 5",
    category: "Multiple",
    importantDates: "Oct–Dec",
    officialWebsite: "https://silverzone.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "NSTSE",
    conductingBody: "Unified Council",
    level: "Class 5",
    category: "Science",
    importantDates: "Dec",
    officialWebsite: "https://unifiedcouncil.com",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "AISSEE (Sainik School)",
    conductingBody: "NTA",
    level: "School Level",
    category: "Defence",
    importantDates: "Jan",
    officialWebsite: "https://aissee.nta.nic.in",
    applicableClass: ["5"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },

  // --- CLASS 8 ---
  {
    name: "NMMS",
    conductingBody: "Ministry of Education",
    level: "Class 8",
    category: "Scholarship",
    importantDates: "Aug–Nov",
    officialWebsite: "https://scholarships.gov.in",
    applicableClass: ["8"],
    examType: "Scholarship Exam",
    difficulty: "Moderate"
  },
  {
    name: "IOQM",
    conductingBody: "HBCSE",
    level: "Class 8",
    category: "Mathematics",
    importantDates: "Aug–Sep",
    officialWebsite: "https://ioqmexam.in",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Hard"
  },
  {
    name: "PRMO",
    conductingBody: "HBCSE",
    level: "Class 8",
    category: "Mathematics",
    importantDates: "Aug",
    officialWebsite: "https://hbcse.tifr.res.in",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Hard"
  },
  {
    name: "VVM (Vidyarthi Vigyan Manthan)",
    conductingBody: "NCERT",
    level: "Class 8",
    category: "Science",
    importantDates: "Aug–Oct",
    officialWebsite: "https://vvm.org.in",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "NSO",
    conductingBody: "SOF",
    level: "Class 8",
    category: "Science",
    importantDates: "Nov–Dec",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "IMO",
    conductingBody: "SOF",
    level: "Class 8",
    category: "Mathematics",
    importantDates: "Oct–Nov",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "IEO",
    conductingBody: "SOF",
    level: "Class 8",
    category: "English",
    importantDates: "Oct–Nov",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Moderate"
  },
  {
    name: "AISSEE (Sainik School)",
    conductingBody: "NTA",
    level: "School Level",
    category: "Defence",
    importantDates: "Jan",
    officialWebsite: "https://aissee.nta.nic.in",
    applicableClass: ["8"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },

  // --- CLASS 10 ---
  {
    name: "Tamil Nadu Polytechnic Admission",
    conductingBody: "DoTE Tamil Nadu",
    level: "After 10th",
    category: "Engineering",
    importantDates: "May–June",
    officialWebsite: "https://www.tndte.gov.in",
    applicableClass: ["10"],
    examType: "Admission Process",
    difficulty: "Moderate"
  },
  {
    name: "Tamil Nadu ITI Admission",
    conductingBody: "DET Tamil Nadu",
    level: "After 10th",
    category: "Skill",
    importantDates: "May–July",
    officialWebsite: "https://skilltraining.tn.gov.in",
    applicableClass: ["10"],
    examType: "Admission Process",
    difficulty: "Easy"
  },
  {
    name: "AISSEE (Sainik School)",
    conductingBody: "NTA",
    level: "After 10th",
    category: "Defence",
    importantDates: "Jan",
    officialWebsite: "https://aissee.nta.nic.in",
    applicableClass: ["10"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },
  {
    name: "JNVST Lateral Entry",
    conductingBody: "Navodaya Vidyalaya",
    level: "After 10th",
    category: "School",
    importantDates: "May–June",
    officialWebsite: "https://navodaya.gov.in",
    applicableClass: ["10"],
    examType: "Entrance Exam",
    difficulty: "Moderate"
  },
  {
    name: "NSEJS",
    conductingBody: "IAPT",
    level: "Class 9–10",
    category: "Science",
    importantDates: "Nov",
    officialWebsite: "https://iapt.org.in",
    applicableClass: ["10"],
    examType: "Olympiad",
    difficulty: "Hard"
  },
  {
    name: "IOQM",
    conductingBody: "HBCSE",
    level: "Class 10",
    category: "Mathematics",
    importantDates: "Aug–Sep",
    officialWebsite: "https://ioqmexam.in",
    applicableClass: ["10"],
    examType: "Olympiad",
    difficulty: "Hard"
  },

  // --- CLASS 12 ---
  {
    name: "JEE Main",
    conductingBody: "NTA",
    level: "Undergraduate",
    category: "Engineering",
    importantDates: "Jan & Apr",
    officialWebsite: "https://jeemain.nta.nic.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },
  {
    name: "JEE Advanced",
    conductingBody: "IIT Council",
    level: "Undergraduate",
    category: "Engineering",
    importantDates: "May–Jun",
    officialWebsite: "https://jeeadv.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hardest"
  },
  {
    name: "TNEA",
    conductingBody: "DoTE Tamil Nadu",
    level: "Undergraduate",
    category: "Engineering",
    importantDates: "May–June",
    officialWebsite: "https://www.tneaonline.org",
    applicableClass: ["12"],
    examType: "Admission Process",
    difficulty: "Moderate"
  },
  {
    name: "BITSAT",
    conductingBody: "BITS Pilani",
    level: "Undergraduate",
    category: "Engineering",
    importantDates: "May–Jun",
    officialWebsite: "https://www.bitsadmission.com",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },
  {
    name: "VITEEE",
    conductingBody: "VIT",
    level: "Undergraduate",
    category: "Engineering",
    importantDates: "Apr–May",
    officialWebsite: "https://viteee.vit.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate"
  },
  {
    name: "SRMJEEE",
    conductingBody: "SRM Institute",
    level: "Undergraduate",
    category: "Engineering",
    importantDates: "Apr–May",
    officialWebsite: "https://applications.srmist.edu.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate"
  },
  {
    name: "NEET UG",
    conductingBody: "NTA",
    level: "Undergraduate",
    category: "Medical",
    importantDates: "May",
    officialWebsite: "https://neet.nta.nic.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },
  {
    name: "CLAT",
    conductingBody: "Consortium of NLUs",
    level: "Undergraduate",
    category: "Law",
    importantDates: "Dec",
    officialWebsite: "https://consortiumofnlus.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },
  {
    name: "CUET UG",
    conductingBody: "NTA",
    level: "Undergraduate",
    category: "Multiple",
    importantDates: "May",
    officialWebsite: "https://cuet.nta.nic.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate"
  },
  {
    name: "CA Foundation",
    conductingBody: "ICAI",
    level: "Undergraduate",
    category: "Commerce",
    importantDates: "May/Nov",
    officialWebsite: "https://icai.org",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  },
  {
    name: "NDA",
    conductingBody: "UPSC",
    level: "Undergraduate",
    category: "Defence",
    importantDates: "Apr & Sep",
    officialWebsite: "https://upsc.gov.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard"
  }
];

async function seedExams() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in environment variables");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing exams to avoid duplicates if needed, or just insert
    // For now, let's just insert and handle duplicates manually or clear first
    // await Exam.deleteMany({}); // Uncomment to clear existing data

    for (const examData of examsData) {
      await Exam.findOneAndUpdate(
        { name: examData.name, conductingBody: examData.conductingBody },
        { $set: examData },
        { upsert: true, new: true }
      );
    }

    console.log("Seeding complete! Successfully updated/inserted all exams.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding exams:", error);
    process.exit(1);
  }
}

seedExams();
