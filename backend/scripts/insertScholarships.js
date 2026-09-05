const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Scholarship = require("../models/Scholarship");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const dataset = [
    // --- CLASS 8 ---
    {
        "scholarshipName": "National Means Cum Merit Scholarship (NMMS)",
        "provider": "Ministry of Education",
        "eligibility": "Class 8 students from government schools with family income below ₹3.5 lakh",
        "amount": "₹12,000 per year",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["8"],
        "category": "Government",
        "description": "Financial support for students from economically weaker sections to continue secondary education."
    },
    {
        "scholarshipName": "National Talent Search Exam (NTSE)",
        "provider": "NCERT",
        "eligibility": "Class 8 and 10 students (varies by state)",
        "amount": "Scholarship + National Recognition",
        "applicationLink": "https://ncert.nic.in/national-talent-examination.php",
        "targetClass": ["8", "10"],
        "category": "Merit",
        "description": "A prestigious high school scholarship program to identify and nurture talented students."
    },
    {
        "scholarshipName": "Pre-Matric Scholarship for SC/ST/OBC Students",
        "provider": "State Government / Central Govt",
        "eligibility": "Students studying in Classes 1 to 10",
        "amount": "Varies by State",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["5", "8", "10"],
        "category": "Government",
        "description": "Financial assistance to students of minority/reserved categories to reduce school dropout rates."
    },

    // --- CLASS 10 (AFTER 10TH) ---
    {
        "scholarshipName": "Vidyadhan Scholarship Program",
        "provider": "Sarojini Damodaran Foundation",
        "eligibility": "Students who have completed Class 10 with high marks",
        "amount": "₹10,000 - ₹60,000 per year",
        "applicationLink": "https://www.vidyadhan.org/",
        "targetClass": ["10"],
        "category": "Private",
        "description": "Financial support for meritorious students from low-income families continuing with +1 and +2."
    },
    {
        "scholarshipName": "AICTE Pragati Scholarship for Girls",
        "provider": "AICTE",
        "eligibility": "Girls admitted to AICTE approved technical diploma/degree courses",
        "amount": "₹50,000 per year",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["10", "12"],
        "category": "Government",
        "description": "Empowering girl students to pursue technical education in India."
    },
    {
        "scholarshipName": "AICTE Saksham Scholarship",
        "provider": "AICTE",
        "eligibility": "Specially-abled students pursuing technical diploma or degree education",
        "amount": "₹50,000 per year",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["10", "12"],
        "category": "Government",
        "description": "Support for differently-abled students for technical learning."
    },
    {
        "scholarshipName": "Begum Hazrat Mahal National Scholarship",
        "provider": "Ministry of Minority Affairs",
        "eligibility": "Minority girl students studying in Classes 9 to 12",
        "amount": "₹6,000 per year",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["10", "12"],
        "category": "Government",
        "description": "Financial support for girl students belonging to national minorities."
    },
    {
        "scholarshipName": "Post Matric Scholarship for SC/ST Students",
        "provider": "Ministry of Social Justice / Tribal Affairs",
        "eligibility": "Students belonging to SC/ST categories studying after Class 10",
        "amount": "Variable depending on course",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["10", "12"],
        "category": "Government",
        "description": "A very important government scheme for students continuing education after 10th."
    },
    {
        "scholarshipName": "Kotak Junior Scholarship",
        "provider": "Kotak Education Foundation",
        "eligibility": "First-year students of Class 11 with family income below ₹3.2 lakh",
        "amount": "₹3,000 per month",
        "applicationLink": "https://kotakeducation.org/",
        "targetClass": ["10"],
        "category": "Private",
        "description": "Monthly stipend for students transitioning from 10th to higher secondary."
    },
    {
        "scholarshipName": "INSPIRE Award - MANAK",
        "provider": "Department of Science and Technology",
        "eligibility": "Original innovative ideas from students in classes 6 to 10",
        "amount": "₹10,000 per award",
        "applicationLink": "https://www.inspireawards-dst.gov.in/",
        "targetClass": ["10", "8"],
        "category": "Merit",
        "description": "Identifying original ideas and innovations at school level."
    },

    // --- CLASS 12 (AFTER 12TH) ---
    {
        "scholarshipName": "Central Sector Scheme for College and University Students",
        "provider": "Ministry of Education",
        "eligibility": "Students above 80th percentile in Class 12, income below ₹4.5 lakh",
        "amount": "₹12,000 - ₹20,000 per year",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["12"],
        "category": "Government",
        "description": "Financial aid for students pursuing undergraduate or postgraduate studies."
    },
    {
        "scholarshipName": "INSPIRE Scholarship for Higher Education (SHE)",
        "provider": "Department of Science and Technology",
        "eligibility": "Top 1% science students pursuing BSc/MSc with research focus",
        "amount": "₹80,000 per year",
        "applicationLink": "https://online-inspire.gov.in",
        "targetClass": ["12"],
        "category": "Merit",
        "description": "Prestigious scholarship for students pursuing basic and natural science courses."
    },
    {
        "scholarshipName": "Prime Minister Scholarship Scheme",
        "provider": "Ministry of Home Affairs",
        "eligibility": "Children of ex-servicemen and CAPF personnel pursuing professional degree",
        "amount": "₹30,000 per year",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["12"],
        "category": "Government",
        "description": "Support for higher education of wards of veterans and security personnel."
    },
    {
        "scholarshipName": "UGC Ishan Uday Scholarship",
        "provider": "University Grants Commission",
        "eligibility": "Students from North Eastern Region pursuing general degree/professional courses",
        "amount": "₹5,400 - ₹7,800 per month",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["12"],
        "category": "Government",
        "description": "Special scheme for promotion of higher education in North Eastern Region."
    },
    {
        "scholarshipName": "Top Class Education Scheme (SC/ST)",
        "provider": "Ministry of Social Justice / Tribal Affairs",
        "eligibility": "SC/ST students admitted to premier institutions like IIT/IIM",
        "amount": "Full Tution Fee + Up to ₹2,00,000 allowance",
        "applicationLink": "https://scholarships.gov.in",
        "targetClass": ["12"],
        "category": "Government",
        "description": "Covers high education costs in elite Indian institutes."
    },
    {
        "scholarshipName": "Muthoot M George Scholarship",
        "provider": "Muthoot Group",
        "eligibility": "Students pursuing MBBS, BTech, or Nursing from low-income families",
        "amount": "Up to ₹2,40,000 total",
        "applicationLink": "https://www.muthootgroup.com/",
        "targetClass": ["12"],
        "category": "Private",
        "description": "Professional education scholarship for financially vulnerable students."
    },
    {
        "scholarshipName": "Federal Bank Hormis Memorial Foundation",
        "provider": "Federal Bank",
        "eligibility": "Students from Kerala/Tamil Nadu/Gujarat/Maharashtra pursuing Degree courses",
        "amount": "Full Tuition Fee Support",
        "applicationLink": "https://www.federalbank.co.in/",
        "targetClass": ["12"],
        "category": "Private",
        "description": "Complete fee support for professional undergraduate studies."
    }
];

const insertScholarships = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log("Removing old scholarship entries...");
        await Scholarship.deleteMany({});

        console.log(`Inserting ${dataset.length} categorized scholarships...`);
        await Scholarship.insertMany(dataset);

        console.log("✅ Scholarship dataset organized by grade levels (8, 10, 12) successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inserting data:", error);
        process.exit(1);
    }
};

insertScholarships();
