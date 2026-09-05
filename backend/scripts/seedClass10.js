const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassContent = require('../models/ClassContent');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam";

const slugify = (text) => {
  return text.toLowerCase()
    .split(" ")
    .join("-")
    .replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).substr(2, 5);
};

const class10SeedData = [
  {
    title: "Science Stream (PCM, PCB, PCMB)",
    sectionType: "Streams",
    category: "Science",
    shortDescription: "The gateway to Engineering, Medicine, and Research careers.",
    fullDescription: "Choosing Science opens doors to highly technical, scientific, and medical fields.\n\n📚 **Key Subjects:** Physics, Chemistry, Maths, Biology.\n🚀 **Future Careers:** Doctor, Engineer, Scientist, Architect, Data Analyst.\n💡 **Decision Tip:** Choose this if you genuinely enjoy problem-solving, math, and understanding how things work.",
    benefitType: "Degree Paths",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200",
    status: "published",
    featured: true,
    displayOrder: 1,
    targetClass: "10"
  },
  {
    title: "Commerce Stream (Business & Finance)",
    sectionType: "Streams",
    category: "Commerce",
    shortDescription: "The foundation for Corporate Business, Accounting, and Finance.",
    fullDescription: "Commerce is ideal for students who want to understand money, business operations, and the economy.\n\n📚 **Key Subjects:** Accountancy, Business Studies, Economics, Math/Informatics Practices.\n🚀 **Future Careers:** Chartered Accountant (CA), Investment Banker, HR Manager, Entrepreneur.\n💡 **Decision Tip:** Choose this if you like managing finances, leading teams, or planning to start your own business.",
    coverImage: "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=1200",
    status: "published",
    featured: true,
    displayOrder: 2,
    targetClass: "10"
  },
  {
    title: "Arts / Humanities",
    sectionType: "Streams",
    category: "Arts",
    shortDescription: "Explore society, law, media, psychology, and public service.",
    fullDescription: "Arts focuses on human society, culture, and creative thinking.\n\n📚 **Key Subjects:** History, Political Science, Psychology, Sociology, Literature.\n🚀 **Future Careers:** Lawyer, Journalist, Psychologist, Civil Servant (IAS/IPS), Teacher.\n💡 **Decision Tip:** Choose this if you love reading, have strong communication skills, and want to understand human behavior or society.",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200",
    status: "published",
    displayOrder: 3,
    targetClass: "10"
  },
  {
    title: "Diploma / Polytechnic (After 10th)",
    sectionType: "Streams",
    category: "Diploma",
    shortDescription: "Early technical specialization and industry-ready practical skills.",
    fullDescription: "Diplomas provide fast-tracked, 3-year practical engineering training directly after Class 10.\n\n📚 **Key Focus:** Practical workshops, applied engineering basics.\n🚀 **Future Careers:** Junior Engineer, Technical Supervisor, direct entry to 2nd-year B.Tech (Lateral Entry).\n💡 **Decision Tip:** Choose this if you want to start earning sooner or prefer practical learning over heavy theory.",
    coverImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200",
    status: "published",
    displayOrder: 4,
    targetClass: "10"
  },
  {
    title: "Government Scholarships After 10th (India)",
    sectionType: "Scholarships",
    category: "Government",
    shortDescription: "Centralized government support for Class 11, 12, and beyond.",
    fullDescription: "NSP acts as a gateway for multiple central scholarship schemes.",
    externalLink: "https://scholarships.gov.in/",
    coverImage: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1200",
    status: "published",
    displayOrder: 5,
    targetClass: "10"
  },
  {
    title: "PM-YASASVI Post-Matric Scholarship",
    sectionType: "Scholarships",
    category: "Government",
    subCategoryLabel: "Merit",
    shortDescription: "Scholarship for OBC, EBC, and DNT students by MSJE.",
    fullDescription: "Tuition and maintenance support.",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
    status: "published",
    displayOrder: 6,
    targetClass: "10"
  },
  {
    title: "NMMS Scholarship Continuation",
    sectionType: "Scholarships",
    category: "Merit",
    shortDescription: "Keep receiving ₹1,000/month if you qualified in Class 8.",
    fullDescription: "Support till Class 12.",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
    status: "published",
    displayOrder: 7,
    targetClass: "10"
  },
  {
    title: "State Level Scholarships (Tamil Nadu)",
    sectionType: "Scholarships",
    category: "State Schemes",
    shortDescription: "Unique financial aid programs from the Govt of TN.",
    fullDescription: "Specific awards like Periyar Memorial Award.",
    externalLink: "https://www.tndce.tn.gov.in/",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200",
    status: "published",
    displayOrder: 8,
    targetClass: "10"
  },
  {
    title: "National Talent Search Examination (NTSE)",
    sectionType: "Entrance Exams",
    category: "Scholarship Exam",
    shortDescription: "Premier national scholarship exam by NCERT.",
    fullDescription: "A two-stage exam identifying talented students. Qualifiers receive monthly scholarships up to Ph.D. level.",
    coverImage: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200",
    status: "published",
    displayOrder: 9,
    targetClass: "10"
  },
  {
    title: "Tamil Nadu Rural Talent Search (TRUSTS)",
    sectionType: "Entrance Exams",
    category: "Scholarship Exam",
    subCategoryLabel: "TN Rural",
    shortDescription: "Targeted support for rural students in TN.",
    fullDescription: "Selected students receive ₹1,000/year to support their higher secondary education.",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
    status: "published",
    displayOrder: 10,
    targetClass: "10"
  },
  {
    title: "TN Technical & Vocational Exams",
    sectionType: "Entrance Exams",
    category: "Skill Exams",
    shortDescription: "Certifications for Drawing, Sewing, Music, etc.",
    fullDescription: "These certifications act as grading benchmarks and provide excellent early employment credentials.",
    coverImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200",
    status: "published",
    displayOrder: 11,
    targetClass: "10"
  },
  {
    title: "Tamil Nadu Police Constable Career",
    sectionType: "Entrance Exams",
    category: "Government Job",
    shortDescription: "Join uniform services via TNUSRB.",
    fullDescription: "With a minimum 10th pass qualification, you can apply for state police recruitment.",
    coverImage: "https://images.unsplash.com/photo-1592188657297-c6473602410a?q=80&w=1200",
    status: "published",
    displayOrder: 12,
    targetClass: "10"
  },
  {
    title: "Indian Army Recruitment (GD)",
    sectionType: "Entrance Exams",
    category: "Defence Career",
    shortDescription: "Join the Army directly as a soldier.",
    fullDescription: "10th pass soldier entry offers early independence, pride, and strong financial security.",
    coverImage: "https://images.unsplash.com/photo-1621453229864-7729f270b224?q=80&w=1200",
    status: "published",
    displayOrder: 13,
    targetClass: "10"
  },
  {
    title: "Railway & Post Office Recruitment",
    sectionType: "Entrance Exams",
    category: "Government Job",
    shortDescription: "Entry-level jobs in India's largest networks.",
    fullDescription: "Direct recruitment based on 10th marks or simple entrance exams for various foundational roles.",
    coverImage: "https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?q=80&w=1200",
    status: "published",
    displayOrder: 14,
    targetClass: "10"
  }
];

const class10SeedDataWithSlugs = class10SeedData.map(item => ({
    ...item,
    slug: slugify(item.title)
}));

async function seed() {
  try {
    if (!MONGO_URI) throw new Error("No MONGO_URI in .env");
    console.log("Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");
    
    await ClassContent.deleteMany({ targetClass: { $in: ["10", "class10"] } });
    console.log("Cleared old class 10 content.");

    console.log(`Attempting to insert ${class10SeedDataWithSlugs.length} items one by one...`);
    let count = 0;
    for (const item of class10SeedDataWithSlugs) {
        try {
            await ClassContent.create(item);
            count++;
            console.log(`Inserted: ${item.title}`);
        } catch (itemError) {
            console.error(`FAILED to insert: ${item.title}`);
            console.error(itemError.message || itemError);
        }
    }
    console.log(`Done! Successfully seeded ${count} out of ${class10SeedDataWithSlugs.length} items.`);
    
    process.exit(0);
  } catch (error) {
    console.error("CRITICAL SEEDING ERROR:");
    console.error(error.message || error);
    process.exit(1);
  }
}

seed();
