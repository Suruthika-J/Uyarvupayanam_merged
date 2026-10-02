/**
 * seedEngineeringColleges.js
 * Inserts / upserts Engineering colleges across Tamil Nadu districts,
 * specifically ensuring Thoothukudi/Tuticorin and all major districts have complete Engineering college data.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const College = require("../models/College");

dotenv.config({ path: path.join(__dirname, "../.env") });

const engineeringColleges = [
  // ── THOOTHUKUDI / TUTICORIN ──
  {
    collegeName: "National Engineering College, Kovilpatti",
    collegeCode: "4962",
    district: "Thoothukudi",
    location: "Kovilpatti, Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "NAAC A+",
    rank: "Top TNEA College",
    website: "https://nec.edu.in"
  },
  {
    collegeName: "Dr. Sivanthi Aditanar College of Engineering",
    collegeCode: "4955",
    district: "Thoothukudi",
    location: "Tiruchendur, Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "NAAC Accredited",
    website: "https://drsacoe.org"
  },
  {
    collegeName: "University College of Engineering, Thoothukudi",
    collegeCode: "4020",
    district: "Thoothukudi",
    location: "Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "Anna University Constituent",
    website: "https://www.autut.in"
  },
  {
    collegeName: "Grace College of Engineering",
    collegeCode: "4970",
    district: "Thoothukudi",
    location: "Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "AICTE Approved"
  },
  {
    collegeName: "Chandy College of Engineering",
    collegeCode: "4975",
    district: "Thoothukudi",
    location: "Mullakkadu, Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "AICTE Approved"
  },
  {
    collegeName: "Infant Jesus College of Engineering",
    collegeCode: "4957",
    district: "Thoothukudi",
    location: "Keelavallanadu, Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "NAAC Accredited"
  },
  {
    collegeName: "Jayaraj Annapackiam CSI College of Engineering",
    collegeCode: "4959",
    district: "Thoothukudi",
    location: "Nazareth, Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "AICTE Approved"
  },
  {
    collegeName: "Holy Cross Engineering College",
    collegeCode: "4980",
    district: "Thoothukudi",
    location: "Vagaikulam, Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "AICTE Approved"
  },
  {
    collegeName: "SCAD College of Engineering and Technology",
    collegeCode: "4960",
    district: "Thoothukudi",
    location: "Cheranmahadevi / Thoothukudi",
    state: "Tamil Nadu",
    stream: "Engineering",
    streamsOffered: ["Engineering"],
    category: "Engineering",
    type: "Engineering College",
    collegeType: "Engineering College",
    accreditation: "NAAC Accredited"
  },

  // ── CHENNAI ──
  { collegeName: "IIT Madras", district: "Chennai", location: "Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A++", rank: "#1" },
  { collegeName: "Anna University - CEG", district: "Chennai", location: "Guindy, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+", rank: "#5" },
  { collegeName: "Anna University - MIT Campus", district: "Chennai", location: "Chrompet, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "Sri Sairam Engineering College", district: "Chennai", location: "West Tambaram, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "Velammal Engineering College", district: "Chennai", location: "Surapet, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Saveetha Engineering College", district: "Chennai", location: "Thandalam, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "St. Joseph's College of Engineering", district: "Chennai", location: "Jeppiaar Nagar, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "Rajalakshmi Engineering College", district: "Chennai", location: "Thandalam, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A++" },
  { collegeName: "Chennai Institute of Technology", district: "Chennai", location: "Kundrathur, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "Panimalar Engineering College", district: "Chennai", location: "Poonamallee, Chennai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" },

  // ── COIMBATORE ──
  { collegeName: "PSG College of Technology", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+", rank: "#25" },
  { collegeName: "Coimbatore Institute of Technology", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Kumaraguru College of Technology", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "Sri Krishna College of Engineering and Technology", district: "Coimbatore", location: "Kuniamuthur, Coimbatore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "Government College of Technology, Coimbatore", district: "Coimbatore", location: "Thadagam Road, Coimbatore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },

  // ── TIRUCHIRAPPALLI ──
  { collegeName: "NIT Tiruchirappalli", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+", rank: "#10" },
  { collegeName: "K. Ramakrishnan College of Engineering", district: "Tiruchirappalli", location: "Samayapuram, Tiruchirappalli", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Bharathidasan Institute of Technology (BIT Campus)", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" },

  // ── MADURAI ──
  { collegeName: "Thiagarajar College of Engineering", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A", rank: "#40" },
  { collegeName: "Government College of Engineering, Madurai", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" },

  // ── TIRUNELVELI ──
  { collegeName: "Government College of Engineering, Tirunelveli", district: "Tirunelveli", location: "Tirunelveli", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Francis Xavier Engineering College", district: "Tirunelveli", location: "Vannarpettai, Tirunelveli", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "PET Engineering College", district: "Tirunelveli", location: "Vallioor, Tirunelveli", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" },

  // ── VIRUDHUNAGAR ──
  { collegeName: "Mepco Schlenk Engineering College", district: "Virudhunagar", location: "Sivakasi, Virudhunagar", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Kamaraj College of Engineering and Technology", district: "Virudhunagar", location: "Virudhunagar", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },

  // ── KANCHIPURAM ──
  { collegeName: "SSN College of Engineering", district: "Kanchipuram", location: "Kalavakkam, Kanchipuram", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },
  { collegeName: "SRM Institute of Science and Technology", district: "Kanchipuram", location: "Kattankulathur, Kanchipuram", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A++" },
  { collegeName: "Sri Venkateswara College of Engineering", district: "Kanchipuram", location: "Sriperumbudur, Kanchipuram", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },

  // ── VELLORE ──
  { collegeName: "VIT Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A++" },
  { collegeName: "Kingston Engineering College", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" },

  // ── ERODE ──
  { collegeName: "Kongu Engineering College", district: "Erode", location: "Perundurai, Erode", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Bannari Amman Institute of Technology", district: "Erode", location: "Sathyamangalam, Erode", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A+" },

  // ── SALEM ──
  { collegeName: "Government College of Engineering, Salem", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Sona College of Technology", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A++" },

  // ── KANYAKUMARI ──
  { collegeName: "Noorul Islam Centre for Higher Education", district: "Kanyakumari", location: "Kumaracoil, Kanyakumari", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College", accreditation: "NAAC A" },
  { collegeName: "Ponjesly College of Engineering", district: "Kanyakumari", location: "Nagercoil, Kanyakumari", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" },
  { collegeName: "Arunachala College of Engineering for Women", district: "Kanyakumari", location: "Manavilai, Kanyakumari", state: "Tamil Nadu", stream: "Engineering", category: "Engineering", type: "Engineering College" }
];

async function seed() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam";
    console.log("Connecting to MongoDB:", mongoURI);
    await mongoose.connect(mongoURI);

    let inserted = 0;
    let updated = 0;

    for (const col of engineeringColleges) {
      const filter = {
        $or: [
          { collegeName: new RegExp(`^${col.collegeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
          ...(col.collegeCode ? [{ collegeCode: col.collegeCode }] : [])
        ]
      };

      const updateData = {
        ...col,
        streamsOffered: [col.stream],
        type: col.type || "Engineering College",
        collegeType: col.collegeType || "Engineering College"
      };

      const res = await College.findOneAndUpdate(filter, updateData, { upsert: true, new: true, setDefaultsOnInsert: true });
      if (res.isNew) inserted++;
      else updated++;
    }

    console.log(`✅ Engineering Colleges Seeding Complete! Inserted: ${inserted}, Updated / Ensured: ${updated}`);

    // Verify Thoothukudi count
    const thoothukudiColleges = await College.find({
      $or: [
        { district: /thoothukudi|tuticorin/i },
        { location: /thoothukudi|tuticorin/i }
      ]
    }).select("collegeName stream district location type").lean();

    console.log(`\nVerified Thoothukudi Colleges in DB (${thoothukudiColleges.length} total):`);
    thoothukudiColleges.forEach(c => {
      console.log(`  - [${c.stream}] ${c.collegeName} (District: ${c.district})`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
