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
    difficulty: "Moderate",
    eligibility: "Class 5 Students",
    subjects: ["Science"],
    pattern: "Objective Type (MCQs)"
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
    difficulty: "Moderate",
    eligibility: "Class 5 Students",
    subjects: ["Mathematics"],
    pattern: "Objective Type (MCQs)"
  },
  {
    name: "IEO (English Olympiad)",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 5",
    category: "English",
    importantDates: "Oct–Nov",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate",
    eligibility: "Class 5 Students",
    subjects: ["English"],
    pattern: "Objective Type (MCQs)"
  },
  {
    name: "UCO (Cyber Olympiad)",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 5",
    category: "Science", // Categorized as Science for tab compatibility
    importantDates: "Oct–Nov",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate",
    eligibility: "Class 5 Students",
    subjects: ["Computers", "IT"],
    pattern: "Objective Type (MCQs)"
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
    difficulty: "Moderate",
    eligibility: "Class 5 Students",
    subjects: ["Science", "Mathematics"],
    pattern: "Objective Type (MCQs)"
  },
  {
    name: "IOS",
    conductingBody: "SilverZone Foundation",
    level: "Class 5",
    category: "Science",
    importantDates: "Nov",
    officialWebsite: "https://silverzone.org",
    applicableClass: ["5"],
    examType: "Olympiad",
    difficulty: "Moderate",
    eligibility: "Class 5 Students",
    subjects: ["Science"],
    pattern: "Objective Type (MCQs)"
  },

  // --- CLASS 8 ---
  {
    name: "NTSE (Stage 1)",
    conductingBody: "NCERT",
    level: "Class 8-10",
    category: "Scholarship",
    importantDates: "Nov",
    officialWebsite: "https://ncert.nic.in",
    applicableClass: ["8"],
    examType: "Scholarship Exam",
    difficulty: "Hard",
    eligibility: "Class 8-10 Students",
    subjects: ["Mental Ability", "Scholastic Aptitude"],
    pattern: "Objective Type (MCQs)"
  },
  {
    name: "NSEJS",
    conductingBody: "Indian Association of Physics Teachers",
    level: "Class 8-10",
    category: "Science",
    importantDates: "Nov",
    officialWebsite: "https://iapt.org.in",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Hard",
    eligibility: "Class 8-10 Students",
    subjects: ["Physics", "Chemistry", "Biology"],
    pattern: "Objective Type (MCQs)"
  },
  {
    name: "IOQM",
    conductingBody: "Homi Bhabha Centre for Science Education",
    level: "Class 8-10",
    category: "Mathematics",
    importantDates: "Oct",
    officialWebsite: "https://hbcse.tifr.res.in",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Hard",
    eligibility: "Class 8-10 Students",
    subjects: ["Mathematics"],
    pattern: "Descriptive / Multiple Choice"
  },
  {
    name: "SOF Olympiads",
    conductingBody: "Science Olympiad Foundation",
    level: "Class 8",
    category: "Scholarship", // Categorized for tab compatibility
    importantDates: "Oct–Dec",
    officialWebsite: "https://sofworld.org",
    applicableClass: ["8"],
    examType: "Olympiad",
    difficulty: "Moderate",
    eligibility: "Class 8 Students",
    subjects: ["Science", "Mathematics", "English"],
    pattern: "Objective Type (MCQs)"
  },

  // --- CLASS 10 ---
  {
    name: "Polytechnic Admission",
    conductingBody: "Directorate of Technical Education Tamil Nadu",
    level: "After 10th",
    category: "Diploma",
    importantDates: "May–June",
    officialWebsite: "https://tndte.gov.in",
    applicableClass: ["10"],
    examType: "Admission Process",
    difficulty: "Moderate",
    eligibility: "10th Pass",
    subjects: ["Maths", "Science"],
    pattern: "Marks Based Admission"
  },
  {
    name: "ITI Admission",
    conductingBody: "Directorate of Employment and Training Tamil Nadu",
    level: "After 10th",
    category: "Skill",
    importantDates: "June–July",
    officialWebsite: "https://skilltraining.tn.gov.in",
    applicableClass: ["10"],
    examType: "Admission Process",
    difficulty: "Easy",
    eligibility: "10th Pass / 8th Pass",
    subjects: ["General Knowledge"],
    pattern: "Merit Based Admission"
  },
  {
    name: "JNV Lateral Entry",
    conductingBody: "Navodaya Vidyalaya Samiti",
    level: "After 10th",
    category: "School",
    importantDates: "Jan–Feb",
    officialWebsite: "https://navodaya.gov.in",
    applicableClass: ["10"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "Class 10 Students",
    subjects: ["English", "Maths", "Science", "Social Science"],
    pattern: "Objective Type (MCQs)"
  },

  // --- CLASS 12 ---
  {
    name: "JEE Main",
    conductingBody: "National Testing Agency",
    level: "After 12th",
    category: "Engineering",
    importantDates: "Jan & Apr",
    officialWebsite: "https://jeemain.nta.nic.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass (PCM)",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    pattern: "Computer Based Test (MCQs + Numerical)"
  },
  {
    name: "JEE Advanced",
    conductingBody: "Indian Institutes of Technology",
    level: "After 12th",
    category: "Engineering",
    importantDates: "May-Jun",
    officialWebsite: "https://jeeadv.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Very Hard",
    eligibility: "Top JEE Main Rankers",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    pattern: "Computer Based Test (MCQs + Numerical)"
  },
  {
    name: "IISER Aptitude Test",
    conductingBody: "Indian Institutes of Science Education and Research",
    level: "After 12th",
    category: "Science",
    importantDates: "June",
    officialWebsite: "https://iiseradmission.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass (PCM/PCB)",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    pattern: "Computer Based Test (MCQs)"
  },
  {
    name: "NEET UG",
    conductingBody: "National Testing Agency",
    level: "After 12th",
    category: "Medical",
    importantDates: "May",
    officialWebsite: "https://neet.nta.nic.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass (PCB)",
    subjects: ["Physics", "Chemistry", "Biology (Botany & Zoology)"],
    pattern: "Offline (Pen & Paper)"
  },
  {
    name: "CLAT",
    conductingBody: "Consortium of National Law Universities",
    level: "After 12th",
    category: "Law",
    importantDates: "Dec",
    officialWebsite: "https://consortiumofnlus.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass",
    subjects: ["English", "Current Affairs", "Legal Reasoning", "Logical Reasoning", "Maths"],
    pattern: "Offline (Pen & Paper)"
  },
  {
    name: "AILET",
    conductingBody: "National Law University Delhi",
    level: "After 12th",
    category: "Law",
    importantDates: "Dec",
    officialWebsite: "https://nationallawuniversitydelhi.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass",
    subjects: ["English", "Current Affairs", "Logical Reasoning"],
    pattern: "Offline (Pen & Paper)"
  },
  {
    name: "NID DAT",
    conductingBody: "National Institute of Design",
    level: "After 12th",
    category: "Design",
    importantDates: "Jan",
    officialWebsite: "https://admissions.nid.edu",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass",
    subjects: ["Drawing", "Design Aptitude", "General Knowledge"],
    pattern: "Mains + Studio Test"
  },
  {
    name: "NATA",
    conductingBody: "Council of Architecture",
    level: "After 12th",
    category: "Design",
    importantDates: "Apr-July",
    officialWebsite: "https://nata.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass (Maths)",
    subjects: ["Drawing", "General Aptitude", "Mathematics"],
    pattern: "Offline + Online"
  },
  {
    name: "CA Foundation",
    conductingBody: "Institute of Chartered Accountants of India",
    level: "After 12th",
    category: "Commerce",
    importantDates: "May/Nov",
    officialWebsite: "https://icai.org",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass",
    subjects: ["Accounting", "Law", "Maths", "Economics"],
    pattern: "Subjective + Objective"
  },
  {
    name: "CUET UG",
    conductingBody: "National Testing Agency",
    level: "After 12th",
    category: "Multiple",
    importantDates: "May",
    officialWebsite: "https://cuet.nta.nic.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass",
    subjects: ["Language", "Domain Subjects", "General Test"],
    pattern: "Computer Based Test"
  },
  {
    name: "VITEEE",
    conductingBody: "Vellore Institute of Technology",
    level: "After 12th",
    category: "Engineering",
    importantDates: "April",
    officialWebsite: "https://vit.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass (PCM/PCB)",
    subjects: ["Physics", "Chemistry", "Maths/Bio", "English", "Aptitude"],
    pattern: "Computer Based Test"
  },
  {
    name: "SRMJEEE",
    conductingBody: "SRM Institute of Science and Technology",
    level: "After 12th",
    category: "Engineering",
    importantDates: "April/June",
    officialWebsite: "https://srmist.edu.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass (PCM/PCB)",
    subjects: ["Physics", "Chemistry", "Maths/Bio", "English", "Aptitude"],
    pattern: "Computer Based Test"
  },
  {
    name: "BITSAT",
    conductingBody: "BITS Pilani",
    level: "After 12th",
    category: "Engineering",
    importantDates: "May-June",
    officialWebsite: "https://bitsadmission.com",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Hard",
    eligibility: "12th Pass (PCM)",
    subjects: ["Physics", "Chemistry", "Mathematics", "English Proficiency", "Logical Reasoning"],
    pattern: "Computer Based Test"
  },
  {
    name: "KIITEE",
    conductingBody: "KIIT University",
    level: "After 12th",
    category: "Engineering",
    importantDates: "March/May",
    officialWebsite: "https://kiit.ac.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    pattern: "Computer Based Test"
  },
  {
    name: "LPUNEST",
    conductingBody: "Lovely Professional University",
    level: "After 12th",
    category: "Engineering",
    importantDates: "Jan-June",
    officialWebsite: "https://lpu.in",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass",
    subjects: ["Physics", "Chemistry", "Mathematics/Biology", "English"],
    pattern: "Computer Based Test"
  },
  {
    name: "MET",
    conductingBody: "Manipal Academy of Higher Education",
    level: "After 12th",
    category: "Engineering",
    importantDates: "April/May",
    officialWebsite: "https://manipal.edu",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    difficulty: "Moderate",
    eligibility: "12th Pass",
    subjects: ["Physics", "Chemistry", "Mathematics", "English"],
    pattern: "Computer Based Test"
  }
];

async function seedExams() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in environment variables");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for clean seeding...");

    // Remove existing exams to ensure clean state as requested
    await Exam.deleteMany({});
    console.log("Cleared existing exams.");

    for (const examData of examsData) {
      await Exam.create(examData);
    }

    console.log(`Seeding complete! Successfully inserted ${examsData.length} clean exams.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding exams:", error);
    process.exit(1);
  }
}

seedExams();
