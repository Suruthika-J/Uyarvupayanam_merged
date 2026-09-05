const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassContent = require('../models/ClassContent');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const class12SeedData = [
  // --- BASICS ---
  {
    title: "The Big Decision: Career After 12th",
    sectionType: "Basics",
    category: "Overview",
    subCategoryLabel: "Introduction, Future Path",
    shortDescription: "Class 12 is the final step before college. Understand your options in Degree, Engineering, Medicine, or Professional courses.",
    fullDescription: "After 12th, students face the biggest educational decision. Whether it is choosing a traditional degree (BSc, BCom, BA), technical education (BTech, BE), medicine (MBBS, BDS), or pursuing specialized careers like Law, Design, or CA. This module helps you navigate the options based on your current stream.",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1200&auto=format&fit=crop",
    importantNote: "Focus on entrance exams like JEE, NEET, CUET, and CLAT as they are gateways to top institutes.",
    status: "published",
    featured: true,
    displayOrder: 1,
    targetClass: "12"
  },

  // --- SCHOLARSHIPS ---
  {
    title: "Central Sector Scheme for College Students",
    sectionType: "Scholarships",
    category: "Government",
    subCategoryLabel: "NSP, Merit-based",
    shortDescription: "Main scholarship for students transitioning from 12th to university.",
    fullDescription: "Supports meritorious students from low-income families with college expenses while pursuing regular degree courses.",
    benefitAmount: "₹12,000 to ₹20,000 per year",
    eligibilityMarks: "Above 80th percentile in Class 12 board",
    familyIncomeLimit: "Below ₹4,50,000 annual income",
    applicationMode: "Online via NSP Portal",
    externalLink: "https://scholarships.gov.in/",
    status: "published",
    featured: true,
    displayOrder: 2,
    targetClass: "12"
  },
  {
    title: "INSPIRE Scholarship for Higher Education (SHE)",
    sectionType: "Scholarships",
    category: "Merit",
    subCategoryLabel: "Science, Research",
    shortDescription: "Prestigious scholarship for top science students pursuing degree/research.",
    fullDescription: "Provided by DST to students in the top 1% of their Class 12 board pursuing basic sciences.",
    benefitAmount: "₹80,000 per year",
    eligibilityMarks: "Top 1% in Class 12 board",
    externalLink: "https://online-inspire.gov.in/",
    status: "published",
    featured: true,
    displayOrder: 3,
    targetClass: "12"
  },

  // --- ENTRANCE EXAMS ---
  
  // 1. ENGINEERING
  {
    title: "JEE Main – National Engineering Entrance",
    sectionType: "Entrance Exams",
    category: "Engineering",
    subCategoryLabel: "NTA, Engineering Entrance",
    shortDescription: "Entrance for NITs, IIITs and qualifier for JEE Advanced (IITs).",
    fullDescription: "Conducted twice a year by NTA. Core subjects: Physics, Chemistry, Mathematics. Gateway to top engineering institutes in India.",
    examPattern: "Multiple Choice Questions (MCQs) and Numerical Value Questions.",
    externalLink: "https://jeemain.nta.nic.in/",
    status: "published",
    featured: true,
    displayOrder: 10,
    targetClass: "12"
  },
  {
    title: "TNEA – Tamil Nadu Engineering Admission",
    sectionType: "Entrance Exams",
    category: "Engineering",
    subCategoryLabel: "Tamil Nadu, Merit-based",
    shortDescription: "Admission based on Class 12 marks (Cut-off) for engineering in TN colleges.",
    fullDescription: "No entrance exam. Centralized single window counseling based on Class 12 cut-off marks (Physics, Chemistry, Maths).",
    externalLink: "https://www.tneaonline.org/",
    status: "published",
    featured: true,
    displayOrder: 11,
    targetClass: "12"
  },
  {
    title: "BITSAT – BITS Pilani Entrance",
    sectionType: "Entrance Exams",
    category: "Engineering",
    subCategoryLabel: "Private, Top-tier College",
    shortDescription: "Entrance for BITS Pilani campuses (Pilani, Goa, Hyderabad).",
    fullDescription: "Highly competitive private entrance exam. Known for quality of education and placements. Subjects: PCM + English & Logical Reasoning.",
    externalLink: "https://www.bitsadmission.com/",
    status: "published",
    featured: false,
    displayOrder: 12,
    targetClass: "12"
  },

  // 2. MEDICAL
  {
    title: "NEET UG – Medical Entrance Exam",
    sectionType: "Entrance Exams",
    category: "Medical",
    subCategoryLabel: "Medicine, Nursing, AYUSH",
    shortDescription: "The only entrance for MBBS, BDS, Nursing and AYUSH in India.",
    fullDescription: "Mandatory for all medical and dental colleges (Govt + Private). Covers Biology, Physics, and Chemistry (Class 11 & 12).",
    externalLink: "https://neet.nta.nic.in/",
    status: "published",
    featured: true,
    displayOrder: 20,
    targetClass: "12"
  },

  // 3. LAW
  {
    title: "CLAT – National Law University Entrance",
    sectionType: "Entrance Exams",
    category: "Law",
    subCategoryLabel: "Legal Studies, National NLUs",
    shortDescription: "National exam for admission into 22 National Law Universities (NLUs).",
    fullDescription: "Tests English, GK, Legal Reasoning, Logical Reasoning, and Quantitative Techniques. Focus on reading and comprehension.",
    externalLink: "https://consortiumofnlus.ac.in/",
    status: "published",
    featured: true,
    displayOrder: 30,
    targetClass: "12"
  },
  {
    title: "AILET – NLU Delhi Entrance",
    sectionType: "Entrance Exams",
    category: "Law",
    subCategoryLabel: "Law, NLU Delhi",
    shortDescription: "Dedicated entrance exam specifically for National Law University, Delhi.",
    fullDescription: "Independent exam for the premier NLU located in New Delhi. Highly competitive and separate from CLAT.",
    externalLink: "https://nationallawuniversitydelhi.in/",
    status: "published",
    featured: false,
    displayOrder: 31,
    targetClass: "12"
  },

  // 4. DESIGN & ARCHITECTURE
  {
    title: "NIFT – Fashion Design Entrance",
    sectionType: "Entrance Exams",
    category: "Design",
    subCategoryLabel: "Fashion, Textile, Creative",
    shortDescription: "The premier entrance for fashion and design courses in India.",
    fullDescription: "Focuses on creative ability (CAT) and general ability (GAT). Gateway to various NIFT campuses across India.",
    externalLink: "https://nift.ac.in/",
    status: "published",
    featured: true,
    displayOrder: 40,
    targetClass: "12"
  },
  {
    title: "UCEED – IIT Design Entrance",
    sectionType: "Entrance Exams",
    category: "Design",
    subCategoryLabel: "Bachelor of Design, IITs",
    shortDescription: "IIT-conducted entrance for Bachelor of Design (B.Des) programs.",
    fullDescription: "Conducted by IIT Bombay. Admission to B.Des programs in several IITs and other participating institutes.",
    externalLink: "http://www.uceed.iitb.ac.in/",
    status: "published",
    featured: false,
    displayOrder: 41,
    targetClass: "12"
  },
  {
    title: "NATA – Architecture Entrance Exam",
    sectionType: "Entrance Exams",
    category: "Architecture",
    subCategoryLabel: "B.Arch Admission",
    shortDescription: "National entrance for admission into Architecture graduation (B.Arch).",
    fullDescription: "Mandatory qualification for architecture in any college. Tests drawing, aesthetic sensitivity, and critical thinking.",
    externalLink: "https://www.nata.in/",
    status: "published",
    featured: false,
    displayOrder: 42,
    targetClass: "12"
  },

  // 5. COMMERCE & MANAGEMENT
  {
    title: "CA Foundation – Chartered Accountancy",
    sectionType: "Entrance Exams",
    category: "Commerce",
    subCategoryLabel: "Professional Course, ICAI",
    shortDescription: "The first step towards becoming a Chartered Accountant (CA).",
    fullDescription: "Entrance exam conducted by ICAI. Includes subjects like Accounting, Law, Economics, and Quantitative Aptitude.",
    externalLink: "https://www.icai.org/",
    status: "published",
    featured: true,
    displayOrder: 50,
    targetClass: "12"
  },
  {
    title: "IPMAT – IIM 5-Year Integrated Management",
    sectionType: "Entrance Exams",
    category: "Management",
    subCategoryLabel: "IIM Indore, IIM Rohtak, BBA+MBA",
    shortDescription: "Enter IIM directly after 12th for a 5-year Integrated Management program.",
    fullDescription: "Combined BBA + MBA program. High value management education right from school completion.",
    externalLink: "https://www.iimidr.ac.in/academic-programmes/five-year-integrated-programme-in-management-ipm/",
    status: "published",
    featured: false,
    displayOrder: 51,
    targetClass: "12"
  },

  // 6. SCIENCE & RESEARCH
  {
    title: "IISER Aptitude Test (IAT)",
    sectionType: "Entrance Exams",
    category: "Science",
    subCategoryLabel: "Research, IISER Institutions",
    shortDescription: "Admission to 7 IISERs for BS-MS dual degree programs.",
    fullDescription: "For students interested in top-level scientific research and pure sciences. Highly prestigious research pathway.",
    externalLink: "https://iiseradmission.in/",
    status: "published",
    featured: true,
    displayOrder: 60,
    targetClass: "12"
  },
  {
    title: "NEST – National Research Screening Center",
    sectionType: "Entrance Exams",
    category: "Science",
    subCategoryLabel: "NISER, CEBS Research",
    shortDescription: "Entrance for NISER and UM-DAE CEBS for 5-year MSc programs.",
    fullDescription: "A specialized test for research-oriented students. Focus on biology, chemistry, mathematics, and physics.",
    externalLink: "https://www.nestexam.in/",
    status: "published",
    featured: false,
    displayOrder: 61,
    targetClass: "12"
  },

  // 7. DEFENCE & GOVERNMENT
  {
    title: "NDA – National Defence Academy",
    sectionType: "Entrance Exams",
    category: "Defence",
    subCategoryLabel: "Army, Navy, Air Force Officers",
    shortDescription: "Premier entrance to join Indian Armed Forces as a Commissioned Officer.",
    fullDescription: "Entrance for the tri-service academy. Includes a written test followed by SSB interview and medicals.",
    externalLink: "https://upsc.gov.in/",
    status: "published",
    featured: true,
    displayOrder: 70,
    targetClass: "12"
  },
  {
    title: "Indian Air Force – Agniveer Vayu",
    sectionType: "Entrance Exams",
    category: "Defence",
    subCategoryLabel: "Air Force Entry",
    shortDescription: "Direct entry to join the Indian Air Force after Class 12.",
    fullDescription: "Recruitment for the Vayu (Air Force) wing under the Agniveer scheme. Direct early career path in defence.",
    externalLink: "https://agnipathvayu.cdac.in/",
    status: "published",
    featured: false,
    displayOrder: 71,
    targetClass: "12"
  }
];

// Helper to ensure slug is set
const slugify = (text) => {
  return text.toLowerCase()
    .split(" ")
    .join("-")
    .replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).substr(2, 5);
};

const class12SeedDataWithSlugs = class12SeedData.map(item => ({
    ...item,
    slug: slugify(item.title)
}));

async function seed() {
  try {
    if (!MONGO_URI) throw new Error("No MONGO_URI in .env");
    console.log("Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");
    
    // Clear old 12th items
    const del = await ClassContent.deleteMany({ targetClass: { $in: ["12", "class12"] } });
    console.log(`Cleared ${del.deletedCount} old items.`);

    console.log(`Inserting ${class12SeedDataWithSlugs.length} comprehensive items for Class 12...`);
    let count = 0;
    for (const item of class12SeedDataWithSlugs) {
        try {
            await ClassContent.create(item);
            count++;
            console.log(`Inserted: ${item.title}`);
        } catch (itemError) {
            console.error(`FAILED: ${item.title}`);
            console.log(itemError);
        }
    }
    
    console.log(`✅ Success! Seeded ${count} out of ${class12SeedDataWithSlugs.length} items.`);
    process.exit(0);
  } catch (error) {
    console.error("CRITICAL ERROR:");
    console.error(error.message || error);
    process.exit(1);
  }
}

seed();
