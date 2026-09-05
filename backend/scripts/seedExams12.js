const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('../models/Exam');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam";

const examsData = [
  // Engineering
  {
    name: "JEE Main",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "NTA",
    eligibility: "Class 12 PCM",
    subjects: ["Physics", "Chemistry", "Maths"],
    pattern: "MCQs + Numerical Value Questions",
    difficulty: "Hard",
    importantDates: "Nov–Dec (Session 1), Feb–Mar (Session 2)",
    officialWebsite: "https://jeemain.nta.nic.in",
    preparation: {
      strategy: "0–3 months: Basics (NCERT focus).\n3–6 months: Practice + PYQs.\nLast 2 months: Mock tests + revision.",
      timeline: "6-12 months",
      books: ["NCERT Physics/Chemistry/Maths", "HC Verma for Physics", "RD Sharma for Maths"],
      resources: ["Previous Year Questions", "NTA Abhyas App"]
    },
    careerOptions: ["B.Tech/B.E. in NITs, IIITs, GFTIs", "Eligibility for JEE Advanced"]
  },
  {
    name: "JEE Advanced",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "IIT",
    eligibility: "Top 2.5 Lakh in JEE Main",
    subjects: ["Physics", "Chemistry", "Maths"],
    pattern: "Multiple Choice, Multiple Select, Numerical",
    difficulty: "Very Hard",
    importantDates: "April–May",
    officialWebsite: "https://jeeadv.ac.in",
    preparation: {
      strategy: "Focus on deep conceptual clarity and complex multi-concept problem solving.",
      timeline: "6-12 months post-JEE Main prep",
      books: ["IE Irodov", "Cengage series", "Advanced PYQs"],
      resources: ["JEE Advanced Archive"]
    },
    careerOptions: ["B.Tech/B.E./B.Arch in IITs"]
  },
  {
    name: "TNEA",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Admission Process",
    conductingBody: "DoTE Tamil Nadu",
    eligibility: "Class 12 Pass",
    subjects: ["Physics", "Chemistry", "Maths"],
    pattern: "Based on Board Exam Marks (Cutoff = Maths + (Physics+Chemistry)/2)",
    difficulty: "Easy",
    importantDates: "May–June",
    officialWebsite: "https://www.tneaonline.org",
    preparation: {
      strategy: "Focus entirely on maximizing Class 12 board marks in PCM.",
      timeline: "Board Exam schedule",
      books: ["Tamil Nadu State Board Books"],
      resources: ["Previous Year Cutoff Analysis"]
    },
    careerOptions: ["Engineering colleges across Tamil Nadu (Anna University, etc.)"]
  },
  {
    name: "BITSAT",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "BITS Pilani",
    eligibility: "Class 12 PCM (75% aggregate)",
    subjects: ["Physics", "Chemistry", "Maths", "English", "Logical Reasoning"],
    pattern: "130 MCQs",
    difficulty: "Moderate to Hard",
    importantDates: "Jan–April",
    officialWebsite: "https://www.bitsadmission.com",
    preparation: {
      strategy: "Focus on speed and accuracy. Practice English and Logical Reasoning alongside PCM.",
      timeline: "3-6 months",
      books: ["NCERT", "Arihant BITSAT Prep Guide"],
      resources: ["Online Mock Tests"]
    },
    careerOptions: ["B.E. at BITS Pilani, Goa, Hyderabad"]
  },
  {
    name: "VITEEE",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "VIT",
    eligibility: "Class 12 PCM/PCB (60% aggregate)",
    subjects: ["Physics", "Chemistry", "Maths/Biology", "English", "Aptitude"],
    pattern: "125 MCQs",
    difficulty: "Moderate",
    importantDates: "Nov–March",
    officialWebsite: "https://viteee.vit.ac.in",
    preparation: {
      strategy: "Good grasp of NCERT and strong time management.",
      timeline: "3-4 months",
      books: ["NCERT", "VITEEE PYQs"],
      resources: ["Mock Tests"]
    },
    careerOptions: ["B.Tech at VIT Campuses"]
  },
  {
    name: "SRMJEEE",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "SRM Institute",
    eligibility: "Class 12 PCM",
    subjects: ["Physics", "Chemistry", "Maths", "English", "Aptitude"],
    pattern: "125 MCQs",
    difficulty: "Moderate",
    importantDates: "Nov–April",
    officialWebsite: "https://applications.srmist.edu.in",
    preparation: {
      strategy: "Review state board and CBSE syllabus.",
      timeline: "2-3 months",
      books: ["NCERT"],
      resources: ["SRMJEEE Mock Papers"]
    },
    careerOptions: ["B.Tech at SRM Campuses"]
  },
  {
    name: "MET (Manipal Entrance Test)",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "MAHE",
    eligibility: "Class 12 PCM",
    subjects: ["Physics", "Chemistry", "Maths", "English"],
    pattern: "MCQs",
    difficulty: "Moderate",
    importantDates: "Oct–March",
    officialWebsite: "https://manipal.edu",
    preparation: {
      strategy: "Clear fundamental concepts and practice English.",
      timeline: "2-3 months",
      books: ["NCERT"],
      resources: []
    },
    careerOptions: ["B.Tech at Manipal Institute of Technology"]
  },
  {
    name: "KIITEE",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "KIIT University",
    eligibility: "Class 12 PCM",
    subjects: ["Physics", "Chemistry", "Maths"],
    pattern: "120 MCQs",
    difficulty: "Moderate",
    importantDates: "Dec–April",
    officialWebsite: "https://kiitee.kiit.ac.in",
    preparation: {
      strategy: "Similar preparation to JEE Main but slightly lower difficulty.",
      timeline: "2-3 months",
      books: ["NCERT"],
      resources: []
    },
    careerOptions: ["B.Tech at KIIT"]
  },
  {
    name: "LPUNEST",
    category: "Engineering",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "Lovely Professional University",
    eligibility: "Class 12 PCM",
    subjects: ["Physics", "Chemistry", "Maths", "English", "Aptitude"],
    pattern: "MCQs",
    difficulty: "Easy to Moderate",
    importantDates: "Nov–March",
    officialWebsite: "https://nest.lpu.in",
    preparation: {
      strategy: "Basic conceptual review. Acts as both admission and scholarship test.",
      timeline: "1-2 months",
      books: ["NCERT"],
      resources: []
    },
    careerOptions: ["B.Tech at LPU (with scholarships)"]
  },

  // Medical
  {
    name: "NEET UG",
    category: "Medical",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "NTA",
    eligibility: "Class 12 PCB",
    subjects: ["Physics", "Chemistry", "Biology (Botany + Zoology)"],
    pattern: "200 MCQs (Attempt 180)",
    difficulty: "Hard",
    importantDates: "Feb-March",
    officialWebsite: "https://neet.nta.nic.in",
    preparation: {
      strategy: "0–3 months: Complete NCERT line-by-line.\n3–6 months: Intensive MCQ practice.\nLast 2 months: Full-length Mock Tests.",
      timeline: "1-2 years",
      books: ["NCERT Biology/Chemistry/Physics", "MTG Objective NCERT"],
      resources: ["NEET PYQs", "Aakash/Allen Test Series"]
    },
    careerOptions: ["MBBS, BDS, BAMS, BHMS, Veterinary"]
  },

  // Law
  {
    name: "CLAT",
    category: "Law",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "Consortium of NLUs",
    eligibility: "Class 12 Any Stream",
    subjects: ["English", "Current Affairs", "Legal Reasoning", "Logical Reasoning", "Quantitative Techniques"],
    pattern: "120 MCQs (Comprehension-based)",
    difficulty: "Moderate to Hard",
    importantDates: "July-Nov",
    officialWebsite: "https://consortiumofnlus.ac.in",
    preparation: {
      strategy: "Daily newspaper reading (The Hindu). Practice reading comprehension and logical puzzles.",
      timeline: "6-12 months",
      books: ["Word Power Made Easy", "Universal's Guide to CLAT"],
      resources: ["Daily Current Affairs", "Mock Test series"]
    },
    careerOptions: ["BA LLB, BBA LLB at National Law Universities"]
  },
  {
    name: "AILET",
    category: "Law",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "NLU Delhi",
    eligibility: "Class 12 Any Stream",
    subjects: ["English", "Current Affairs", "Logical Reasoning"],
    pattern: "150 MCQs",
    difficulty: "Hard",
    importantDates: "August-Nov",
    officialWebsite: "https://nludelhi.ac.in",
    preparation: {
      strategy: "Focus heavily on English and Logical Reasoning speed.",
      timeline: "6-12 months",
      books: ["RS Aggarwal for Reasoning"],
      resources: ["AILET PYQs"]
    },
    careerOptions: ["BA LLB at NLU Delhi"]
  },

  // Commerce / Management
  {
    name: "CUET UG",
    category: "Commerce / Management",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "NTA",
    eligibility: "Class 12 Any Stream",
    subjects: ["Languages", "Domain Subjects", "General Test"],
    pattern: "MCQs",
    difficulty: "Moderate",
    importantDates: "Feb-March",
    officialWebsite: "https://cuet.samarth.ac.in",
    preparation: {
      strategy: "Stick strictly to NCERT for domain subjects. Practice basic aptitude for General Test.",
      timeline: "3-6 months",
      books: ["NCERTs of respective domains"],
      resources: ["CUET Mock portals"]
    },
    careerOptions: ["B.Com, BBA, BA, B.Sc at Central Universities (DU, BHU, etc.)"]
  },
  {
    name: "CA Foundation",
    category: "Commerce / Management",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "ICAI",
    eligibility: "Class 12 (Appearing/Passed)",
    subjects: ["Accounting", "Business Laws", "Quantitative Aptitude", "Business Economics"],
    pattern: "Subjective + Objective",
    difficulty: "Hard",
    importantDates: "Jan/July (Multiple windows)",
    officialWebsite: "https://www.icai.org",
    preparation: {
      strategy: "Strong foundation in 11th and 12th Accountancy. Regular practice of Maths/Stats.",
      timeline: "4-6 months",
      books: ["ICAI Study Material"],
      resources: ["ICAI Mock Test Papers"]
    },
    careerOptions: ["Chartered Accountant"]
  },

  // Science / Research
  {
    name: "IISER Aptitude Test (IAT)",
    category: "Science",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "IISER",
    eligibility: "Class 12 Science",
    subjects: ["Physics", "Chemistry", "Maths", "Biology"],
    pattern: "60 MCQs",
    difficulty: "Hard",
    importantDates: "March-May",
    officialWebsite: "https://iiseradmission.in",
    preparation: {
      strategy: "Focus on research-oriented, conceptual questions.",
      timeline: "6 months",
      books: ["NCERT", "JEE/NEET materials"],
      resources: ["IAT PYQs"]
    },
    careerOptions: ["BS-MS Dual Degree, Research Scientist"]
  },

  // Design / Architecture
  {
    name: "NATA",
    category: "Design",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "Council of Architecture",
    eligibility: "Class 12 PCM",
    subjects: ["Maths", "General Aptitude", "Drawing"],
    pattern: "Online Test + Drawing Test",
    difficulty: "Moderate",
    importantDates: "March-July (Multiple phases)",
    officialWebsite: "https://www.nata.in",
    preparation: {
      strategy: "Practice perspective drawing and basic 3D visualization. Brush up 11th/12th Math basics.",
      timeline: "3-6 months",
      books: ["NATA Study Guides by Arihant"],
      resources: ["Drawing practice channels"]
    },
    careerOptions: ["B.Arch"]
  },
  {
    name: "NID DAT",
    category: "Design",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "National Institute of Design",
    eligibility: "Class 12 Any Stream",
    subjects: ["Visual Design", "Thematic Color Arrangement", "Subjective Drawing"],
    pattern: "Prelims (Written) + Mains (Studio Test)",
    difficulty: "Hard",
    importantDates: "Oct-Dec",
    officialWebsite: "https://admissions.nid.edu",
    preparation: {
      strategy: "Develop creative thinking, observation skills, and portfolio.",
      timeline: "6-12 months",
      books: [],
      resources: ["Design coaching material", "Sketching tutorials"]
    },
    careerOptions: ["B.Des (Product Design, Animation, Graphic Design)"]
  },

  // Others
  {
    name: "NDA (National Defence Academy)",
    category: "Others",
    level: "Undergraduate",
    applicableClass: ["12"],
    examType: "Entrance Exam",
    conductingBody: "UPSC",
    eligibility: "Class 12 (PCM required for Air Force/Navy)",
    subjects: ["Mathematics", "General Ability Test (English + General Knowledge)"],
    pattern: "Objective Written Test + SSB Interview",
    difficulty: "Hard",
    importantDates: "Dec/Jan and May/June (Twice a year)",
    officialWebsite: "https://upsc.gov.in",
    preparation: {
      strategy: "Strong command over Class 11/12 Maths. Daily reading for General Knowledge and Current Affairs. Physical fitness.",
      timeline: "6-12 months",
      books: ["Pathfinder for NDA", "NCERT Books"],
      resources: ["Previous Year Papers"]
    },
    careerOptions: ["Officer in Indian Army, Navy, or Air Force"]
  }
];

async function seed() {
  try {
    if (!MONGO_URI) throw new Error("No MONGO_URI in .env");
    console.log("Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    // Delete all exams
    await Exam.deleteMany({});
    console.log("Cleared old exams.");

    console.log(`Attempting to insert ${examsData.length} exams...`);
    for (const item of examsData) {
      await Exam.create(item);
      console.log(`Inserted: ${item.name}`);
    }
    
    console.log("Done! Successfully seeded.");
    process.exit(0);
  } catch (error) {
    console.error("CRITICAL SEEDING ERROR:");
    console.error(error.message || error);
    process.exit(1);
  }
}

seed();
