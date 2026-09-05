/**
 * seedCollegeCourseMappings.js
 *
 * Seeds college-course mappings for 30 top TN engineering colleges
 * from the provided PDF data.
 *
 * Usage: node scripts/seedCollegeCourseMappings.js
 *
 * This script:
 *  1. Finds each college in the DB (fuzzy match), or creates it if missing.
 *  2. Expands course abbreviations (CSE, ECE, etc.) to full course names.
 *  3. Finds matching Course documents in the DB.
 *  4. Creates CollegeCourseMapping entries (upsert, no duplicates).
 *  5. Syncs College.coursesOffered for each college.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const College = require("../models/College");
const Course = require("../models/Course");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");

// ─── COURSE ABBREVIATION → Full Name Expansion ─────────────────────────────
// These map the short labels from the PDF to possible course names in the DB
const COURSE_KEYWORDS = {
  "CSE": [
    "computer science and engineering",
    "b.e. computer science and engineering",
    "b.tech computer science and engineering",
    "computer science & engineering",
    "cse"
  ],
  "ECE": [
    "electronics and communication engineering",
    "b.e. electronics and communication engineering",
    "electronics & communication engineering",
    "ece"
  ],
  "EEE": [
    "electrical and electronics engineering",
    "b.e. electrical and electronics engineering",
    "electrical & electronics engineering",
    "eee"
  ],
  "IT": [
    "information technology",
    "b.e. information technology",
    "b.tech information technology",
    "it"
  ],
  "Mechanical": [
    "mechanical engineering",
    "b.e. mechanical engineering",
    "me"
  ],
  "Civil": [
    "civil engineering",
    "b.e. civil engineering",
    "ce"
  ],
  "Automobile": [
    "automobile engineering",
    "b.e. automobile engineering",
    "automotive engineering"
  ],
  "Aeronautical": [
    "aeronautical engineering",
    "b.e. aeronautical engineering",
    "aerospace engineering"
  ],
  "Chemical": [
    "chemical engineering",
    "b.e. chemical engineering",
    "b.tech chemical engineering"
  ],
  "Bio-Technology": [
    "biotechnology",
    "bio technology",
    "b.tech biotechnology",
    "bio-technology"
  ],
  "Electronics & Instrumentation": [
    "electronics and instrumentation engineering",
    "b.e. electronics and instrumentation engineering",
    "electronics & instrumentation engineering",
    "instrumentation and control engineering",
    "instrumentation engineering"
  ],
  "Production": [
    "production engineering",
    "b.e. production engineering",
    "manufacturing engineering",
    "industrial engineering"
  ],
  "AIDS": [
    "artificial intelligence and data science",
    "b.e. artificial intelligence and data science",
    "b.tech artificial intelligence and data science",
    "ai & data science",
    "ai and data science",
    "aids"
  ]
};

// ─── COLLEGE-COURSE DATA (from PDF) ────────────────────────────────────────
const COLLEGE_COURSE_DATA = [
  {
    names: [
      "University Departments of Anna University, CEG Campus",
      "Anna University - CEG",
      "College of Engineering, Guindy",
      "Anna University CEG"
    ],
    district: "Chennai",
    location: "Guindy, Chennai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Production"]
  },
  {
    names: [
      "University Departments of Anna University, MIT Campus",
      "Madras Institute of Technology",
      "Anna University MIT Campus",
      "MIT Campus Anna University"
    ],
    district: "Chennai",
    location: "Chromepet, Chennai",
    courses: ["CSE", "ECE", "IT", "Automobile", "Aeronautical", "Electronics & Instrumentation", "Production"]
  },
  {
    names: [
      "University Departments of Anna University, ACT Campus",
      "A.C. College of Technology",
      "Anna University ACT Campus",
      "ACT Campus Anna University"
    ],
    district: "Chennai",
    location: "Guindy, Chennai",
    courses: ["Chemical", "Bio-Technology"]
  },
  {
    names: [
      "PSG College of Technology",
      "PSG College of Technology, Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Bio-Technology", "Electronics & Instrumentation", "Production"]
  },
  {
    names: [
      "Coimbatore Institute of Technology",
      "Coimbatore Institute of Technology, Coimbatore",
      "CIT Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical"]
  },
  {
    names: [
      "Government College of Technology, Coimbatore",
      "Government College of Technology",
      "GCT Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Bio-Technology", "Electronics & Instrumentation", "Production"]
  },
  {
    names: [
      "Thiagarajar College of Engineering",
      "Thiagarajar College of Engineering, Madurai",
      "TCE Madurai"
    ],
    district: "Madurai",
    location: "Madurai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "Kumaraguru College of Technology",
      "Kumaraguru College of Technology, Coimbatore",
      "KCT Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Aeronautical", "Bio-Technology", "Electronics & Instrumentation"]
  },
  {
    names: [
      "Sri Sivasubramaniya Nadar College of Engineering",
      "SSN College of Engineering",
      "SSN",
      "Sri Sivasubramaniya Nadar College of Engineering (SSN)"
    ],
    district: "Kanchipuram",
    location: "Kalavakkam",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical"]
  },
  {
    names: [
      "Sri Venkateswara College of Engineering",
      "Sri Venkateswara College of Engineering, Sriperumbudur",
      "SVCE Sriperumbudur"
    ],
    district: "Kanchipuram",
    location: "Sriperumbudur",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Chemical", "Bio-Technology"]
  },
  {
    names: [
      "PSG Institute of Technology and Applied Research",
      "PSG Institute of Technology and Applied Research, Coimbatore",
      "PSGiTech"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "Civil"]
  },
  {
    names: [
      "St. Joseph's College of Engineering",
      "St. Joseph's College of Engineering, Chennai",
      "St Joseph College of Engineering"
    ],
    district: "Chennai",
    location: "Jeppiaar Nagar, Chennai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical", "Bio-Technology", "Electronics & Instrumentation"]
  },
  {
    names: [
      "Government College of Engineering, Salem",
      "GCE Salem"
    ],
    district: "Salem",
    location: "Salem",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "Kongu Engineering College",
      "Kongu Engineering College, Erode",
      "Kongu Engineering College, Perundurai"
    ],
    district: "Erode",
    location: "Perundurai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical", "Electronics & Instrumentation"]
  },
  {
    names: [
      "A.C. College of Engineering and Technology",
      "A.C. College of Engineering and Technology, Karaikudi",
      "ACET Karaikudi",
      "Alagappa Chettiar College of Engineering and Technology"
    ],
    district: "Sivaganga",
    location: "Karaikudi",
    courses: ["CSE", "ECE", "EEE", "Civil"]
  },
  {
    names: [
      "Sri Krishna College of Engineering and Technology",
      "Sri Krishna College of Engineering and Technology, Coimbatore",
      "SKCET Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Aeronautical", "Bio-Technology", "Electronics & Instrumentation"]
  },
  {
    names: [
      "Meenakshi Sundararajan Engineering College",
      "Meenakshi Sundararajan Engineering College, Chennai",
      "MSEC Chennai"
    ],
    district: "Chennai",
    location: "Kodambakkam, Chennai",
    courses: ["CSE", "ECE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "RMK Engineering College",
      "RMK Engineering College, Gummidipoondi",
      "R.M.K. Engineering College"
    ],
    district: "Tiruvallur",
    location: "Kavaraipettai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "Panimalar Engineering College",
      "Panimalar Engineering College, Poonamallee, Chennai",
      "Panimalar Engineering College, Chennai"
    ],
    district: "Chennai",
    location: "Poonamallee, Chennai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Electronics & Instrumentation"]
  },
  {
    names: [
      "Velammal Engineering College",
      "Velammal Engineering College, Ambattur, Chennai",
      "Velammal Engineering College, Surapet, Chennai"
    ],
    district: "Chennai",
    location: "Surapet, Chennai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Electronics & Instrumentation", "Production"]
  },
  {
    names: [
      "Bannari Amman Institute of Technology",
      "Bannari Amman Institute of Technology, Sathyamangalam",
      "BIT Sathyamangalam"
    ],
    district: "Erode",
    location: "Sathyamangalam",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Aeronautical", "Bio-Technology", "Electronics & Instrumentation"]
  },
  {
    names: [
      "Sairam Engineering College",
      "Sairam Engineering College, West Tambaram, Chennai",
      "Sri Sairam Engineering College"
    ],
    district: "Chennai",
    location: "West Tambaram, Chennai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Production"]
  },
  {
    names: [
      "Sona College of Technology",
      "Sona College of Technology, Salem"
    ],
    district: "Salem",
    location: "Salem",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "Sri Ramakrishna Engineering College",
      "Sri Ramakrishna Engineering College, Coimbatore",
      "SREC Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Automobile", "Aeronautical", "Electronics & Instrumentation"]
  },
  {
    names: [
      "Rajalakshmi Engineering College",
      "Rajalakshmi Engineering College, Thandalam, Chennai",
      "Rajalakshmi Engineering College, Thandalam"
    ],
    district: "Chennai",
    location: "Thandalam, Chennai",
    courses: ["CSE", "ECE", "EEE", "IT", "Automobile", "Aeronautical"]
  },
  {
    names: [
      "Velammal Institute of Technology",
      "Velammal Institute of Technology, Ponneri"
    ],
    district: "Tiruvallur",
    location: "Ponneri",
    courses: ["CSE", "ECE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "Velammal College of Engineering and Technology",
      "Velammal College of Engineering and Technology, Madurai"
    ],
    district: "Madurai",
    location: "Madurai",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil"]
  },
  {
    names: [
      "PSNA College of Engineering and Technology",
      "PSNA College of Engineering and Technology, Dindigul",
      "P.S.N.A. College of Engineering and Technology"
    ],
    district: "Dindigul",
    location: "Dindigul",
    courses: ["CSE", "ECE", "EEE", "IT", "Civil"]
  },
  {
    names: [
      "Karpagam College of Engineering",
      "Karpagam College of Engineering, Coimbatore"
    ],
    district: "Coimbatore",
    location: "Coimbatore",
    courses: ["CSE", "IT", "Civil", "Automobile", "Electronics & Instrumentation"]
  },
  {
    names: [
      "National Engineering College",
      "National Engineering College, Kovilpatti"
    ],
    district: "Thoothukudi",
    location: "Kovilpatti",
    courses: ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "AIDS"]
  }
];

// ─── Normalization helpers (mirrored from collegeCourseController) ──────────
const normalizeCollegeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\(autonomous\)/g, "")
    .replace(/autonomous/g, "")
    .replace(/\(a\)/g, "")
    .replace(/[.,'']/g, "")
    .trim();
};

const normalizeCourseName = (name) => {
  if (!name) return "";
  let n = name.toLowerCase().trim();
  const degreeRegex = /^(b\.?e\.?|b\.?tech\.?|b\.?sc\.?|m\.?e\.?|m\.?tech\.?|diploma in)\s+/i;
  n = n.replace(degreeRegex, "");
  n = n.replace(/\s+/g, " ").replace(/[.,]/g, "").replace(/&/g, "and").trim();
  return n;
};

// ─── MAIN SEED FUNCTION ────────────────────────────────────────────────────
async function seedCollegeCourseMappings() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error("❌ ERROR: MONGO_URI not found in .env");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Load all colleges and courses
    const allColleges = await College.find({}).lean();
    const allCourses = await Course.find({}).lean();

    console.log(`📊 Found ${allColleges.length} colleges and ${allCourses.length} courses in DB\n`);

    // 2. Build college lookup map (normalized name → doc)
    const collegeByNorm = {};
    allColleges.forEach(c => {
      collegeByNorm[normalizeCollegeName(c.collegeName)] = c;
    });

    // 3. Build course lookup map (normalized name → doc)
    const courseByNorm = {};
    allCourses.forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      // Only keep the first match for each normalized name (avoid duplication)
      if (!courseByNorm[norm]) courseByNorm[norm] = c;
    });

    // Stats
    const stats = {
      totalColleges: COLLEGE_COURSE_DATA.length,
      matchedColleges: 0,
      createdColleges: 0,
      unmatchedColleges: [],
      totalMappingsCreated: 0,
      totalMappingsSkipped: 0,
      unmatchedCourses: new Set(),
      details: []
    };

    const batchId = `PDF-SEED-${Date.now()}`;

    // 4. Process each college
    for (const entry of COLLEGE_COURSE_DATA) {
      const primaryName = entry.names[0];
      console.log(`\n🏫 Processing: ${primaryName}`);

      // Try to find the college by any of the alias names
      let college = null;
      for (const alias of entry.names) {
        const norm = normalizeCollegeName(alias);
        if (collegeByNorm[norm]) {
          college = collegeByNorm[norm];
          break;
        }
      }

      // If still not found, try fuzzy substring matching
      if (!college) {
        const primaryNorm = normalizeCollegeName(primaryName);
        for (const [normKey, colDoc] of Object.entries(collegeByNorm)) {
          if (normKey.includes(primaryNorm) || primaryNorm.includes(normKey)) {
            college = colDoc;
            break;
          }
        }
      }

      // If truly not found, create the college
      if (!college) {
        console.log(`   ⚠️  College not found in DB. Creating: ${primaryName}`);
        try {
          const newCollege = await College.create({
            collegeName: primaryName,
            district: entry.district,
            location: entry.location,
            state: "Tamil Nadu",
            stream: "Engineering",
            coursesOffered: []
          });
          college = newCollege.toObject();
          // Add to lookup
          collegeByNorm[normalizeCollegeName(primaryName)] = college;
          stats.createdColleges++;
          console.log(`   ✅ Created with ID: ${college._id}`);
        } catch (createErr) {
          if (createErr.code === 11000) {
            // Duplicate key — fetch it
            const existing = await College.findOne({ collegeName: primaryName }).lean();
            if (existing) {
              college = existing;
              console.log(`   ♻️  Found duplicate, using existing ID: ${college._id}`);
            }
          } else {
            console.error(`   ❌ Failed to create: ${createErr.message}`);
            stats.unmatchedColleges.push(primaryName);
            continue;
          }
        }
      } else {
        console.log(`   ✅ Matched to: ${college.collegeName} (${college._id})`);
        stats.matchedColleges++;
      }

      if (!college) {
        stats.unmatchedColleges.push(primaryName);
        continue;
      }

      // 5. Resolve courses
      const resolvedCourseIds = [];
      const collegeDetail = { collegeName: college.collegeName, courses: [], missed: [] };

      for (const courseAbbrev of entry.courses) {
        const keywords = COURSE_KEYWORDS[courseAbbrev];
        if (!keywords) {
          console.log(`   ❓ Unknown course abbreviation: ${courseAbbrev}`);
          stats.unmatchedCourses.add(courseAbbrev);
          collegeDetail.missed.push(courseAbbrev);
          continue;
        }

        // Try each keyword variant to find a match
        let matchedCourse = null;
        for (const keyword of keywords) {
          const normKeyword = normalizeCourseName(keyword);
          if (courseByNorm[normKeyword]) {
            matchedCourse = courseByNorm[normKeyword];
            break;
          }
        }

        // If not found by exact normalized match, try substring matching
        if (!matchedCourse) {
          const primaryKeyword = normalizeCourseName(keywords[0]);
          for (const [normKey, courseDoc] of Object.entries(courseByNorm)) {
            // Prefer "after12th" or "Engineering" category courses
            if (normKey.includes(primaryKeyword) || primaryKeyword.includes(normKey)) {
              if (courseDoc.category === "Engineering" || courseDoc.level === "after12th") {
                matchedCourse = courseDoc;
                break;
              }
              if (!matchedCourse) matchedCourse = courseDoc;
            }
          }
        }

        if (matchedCourse) {
          resolvedCourseIds.push(matchedCourse._id);
          collegeDetail.courses.push(`${courseAbbrev} → ${matchedCourse.courseName}`);
          console.log(`   📚 ${courseAbbrev} → ${matchedCourse.courseName}`);
        } else {
          console.log(`   ⚠️  No DB match for: ${courseAbbrev} (${keywords[0]})`);
          stats.unmatchedCourses.add(courseAbbrev);
          collegeDetail.missed.push(courseAbbrev);
        }
      }

      // 6. Create mappings
      let created = 0;
      let skipped = 0;

      for (const courseId of resolvedCourseIds) {
        try {
          await CollegeCourseMapping.findOneAndUpdate(
            { collegeId: college._id, courseId },
            {
              source: "Import",
              importBatchId: batchId,
              sourceFileName: "PDF College List (Top 30)",
              isVerified: true,
              isActive: true
            },
            { upsert: true, new: true }
          );
          created++;
        } catch (err) {
          if (err.code === 11000) {
            skipped++;
          } else {
            console.error(`   ❌ Mapping error: ${err.message}`);
          }
        }
      }

      // 7. Sync College.coursesOffered
      if (resolvedCourseIds.length > 0) {
        const existingIds = (college.coursesOffered || []).map(id => id.toString());
        const newIds = resolvedCourseIds.map(id => id.toString());
        const mergedSet = new Set([...existingIds, ...newIds]);

        await College.findByIdAndUpdate(college._id, {
          $set: { coursesOffered: Array.from(mergedSet) }
        });
      }

      stats.totalMappingsCreated += created;
      stats.totalMappingsSkipped += skipped;
      stats.details.push(collegeDetail);

      console.log(`   📊 ${created} mappings created, ${skipped} skipped (duplicates)`);
    }

    // ─── SUMMARY ──────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("📊 SEED SUMMARY");
    console.log("═".repeat(60));
    console.log(`  Total colleges in PDF       : ${stats.totalColleges}`);
    console.log(`  Matched existing colleges   : ${stats.matchedColleges}`);
    console.log(`  Newly created colleges      : ${stats.createdColleges}`);
    console.log(`  Unmatched colleges          : ${stats.unmatchedColleges.length}`);
    if (stats.unmatchedColleges.length > 0) {
      stats.unmatchedColleges.forEach(n => console.log(`    - ${n}`));
    }
    console.log(`  Total mappings created      : ${stats.totalMappingsCreated}`);
    console.log(`  Duplicate mappings skipped  : ${stats.totalMappingsSkipped}`);
    if (stats.unmatchedCourses.size > 0) {
      console.log(`  Unmatched course labels     : ${[...stats.unmatchedCourses].join(", ")}`);
    }
    console.log("═".repeat(60));

    console.log("\n✅ College-Course Mapping Seed Complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
    process.exit(1);
  }
}

seedCollegeCourseMappings();
