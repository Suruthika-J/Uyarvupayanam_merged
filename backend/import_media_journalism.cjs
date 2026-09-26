/**
 * Import the Collegedunia "Top Journalism Colleges in Tamil Nadu 2026" list
 * (scanned PDF exported from collegedunia.com) into the Media & Journalism
 * stream.
 *
 * - Colleges already staged under Media & Journalism (or present under other
 *   streams) are REUSED by normalized core name and enriched; only genuinely
 *   new colleges are created.
 * - Each college is linked to its journalism course via CollegeCourseMapping
 *   (no seat fields -> the admin detail page shows "No seat data").
 * - New courses are created only for course types not already in the catalog
 *   (Certification, Ph.D, PG Diploma Public Health/Hindi Journalism).
 *
 * Data source: "media and journalism.pdf" (10-page print of
 * https://collegedunia.com/mass-communications/journalism/tamil-nadu-colleges)
 * Values were transcribed from OCR; fees/ratings are best-effort.
 *
 * Idempotent: re-running only upserts and never duplicates.
 */
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const College = require("./models/College");
const Course = require("./models/Course");
const CollegeCourseMapping = require("./models/CollegeCourseMapping");

const STREAM_LABEL = "Media & Journalism";
const SOURCE = "Collegedunia Journalism Rankings 2026";
const SOURCE_FILE = "media and journalism.pdf";

// ---------------------------------------------------------------------------
// Curated dataset: rank | name | city | abbr | approvals | course | enrichment
// ---------------------------------------------------------------------------
const ROWS = [
  { rank: 1,  name: "Asian College of Journalism", city: "Chennai", abbr: "ACJ", approvals: "", course: "PGD Journalism", fees: 460200, rating: 4.6, reviews: 0, avgPkg: "", highPkg: "", score: 732 },
  { rank: 2,  name: "SRM Institute of Science and Technology", city: "Chennai", abbr: "SRMIST", approvals: "NCTE, AICTE, PCI, MCI, NCHMCT Approved", course: "MA Journalism and Mass Communication", fees: 150000, rating: 4.0, reviews: 3149, avgPkg: "6.66 LPA", highPkg: "60 LPA", score: 422 },
  { rank: 3,  name: "Loyola College", city: "Chennai", abbr: "", approvals: "NAAC A++ | UGC Approved", course: "Certification in Journalism", fees: 0, rating: 4.3, reviews: 303, avgPkg: "", highPkg: "9.5 LPA", score: 553 },
  { rank: 4,  name: "Rathinam College of Arts and Science", city: "Coimbatore", abbr: "RCAS", approvals: "NAAC A+ | AICTE, NBA, ACCA Approved", course: "MA Journalism and Mass Communication", fees: 20000, rating: 4.2, reviews: 71, avgPkg: "5 LPA", highPkg: "14 LPA", score: 0 },
  { rank: 5,  name: "PSG College of Arts and Science", city: "Coimbatore", abbr: "", approvals: "NAAC A+", course: "MJMC", fees: 20000, rating: 4.2, reviews: 228, avgPkg: "", highPkg: "14 LPA", score: 492 },
  { rank: 6,  name: "Bharathiar University", city: "Coimbatore", abbr: "BU", approvals: "NAAC A+ | UGC Approved", course: "MJMC", fees: 27870, rating: 4.1, reviews: 2023, avgPkg: "", highPkg: "", score: 385 },
  { rank: 7,  name: "Ethiraj College for Women", city: "Chennai", abbr: "", approvals: "NAAC A+ | UGC Approved", course: "MA Journalism and Mass Communication", fees: 93534, rating: 4.1, reviews: 144, avgPkg: "4 LPA", highPkg: "10 LPA", score: 0 },
  { rank: 8,  name: "Bishop Heber College", city: "Tiruchirappalli", abbr: "BHC", approvals: "NAAC A++ | AICTE, UGC Approved", course: "PGD Journalism", fees: 7160, rating: 4.2, reviews: 117, avgPkg: "12 LPA", highPkg: "35 LPA", score: 0 },
  { rank: 9,  name: "Rathinam Group of Institutions", city: "Coimbatore", abbr: "", approvals: "NAAC A++ | NBA Approved", course: "MA Journalism and Mass Communication", fees: 20000, rating: 0, reviews: 0, avgPkg: "5 LPA", highPkg: "3 Cr", score: 473 },
  { rank: 10, name: "Dr. N.G.P. Arts and Science College", city: "Coimbatore", abbr: "DrNGPASC", approvals: "NAAC A++ | UGC Approved", course: "Certification in Journalism", fees: 5000, rating: 4.0, reviews: 59, avgPkg: "3.3 LPA", highPkg: "39 LPA", score: 0 },
  { rank: 11, name: "SDNB Vaishnav College for Women", city: "Chennai", abbr: "", approvals: "NAAC A+ | UGC Approved", course: "MA Journalism and Mass Communication", fees: 37500, rating: 4.3, reviews: 143, avgPkg: "7.5 LPA", highPkg: "7.5 LPA", score: 0 },
  { rank: 12, name: "Shri Shankarlal Sundarbai Shasun Jain College for Women", city: "Chennai", abbr: "", approvals: "NAAC A+", course: "MA Journalism and Mass Communication", fees: 104000, rating: 4.2, reviews: 125, avgPkg: "2.5 LPA", highPkg: "7.6 LPA", score: 0, placementPct: 96 },
  { rank: 13, name: "University of Madras", city: "Chennai", abbr: "", approvals: "NAAC A+ | UGC Approved", course: "MA Journalism and Mass Communication", fees: 24500, rating: 3.9, reviews: 3318, avgPkg: "3.5 LPA", highPkg: "6 LPA", score: 435 },
  { rank: 14, name: "Periyar University", city: "Salem", abbr: "", approvals: "NAAC A++", course: "Diploma in Journalism", fees: 0, rating: 3.9, reviews: 381, avgPkg: "", highPkg: "", score: 424 },
  { rank: 15, name: "Dr. M.G.R. Educational and Research Institute", city: "Chennai", abbr: "", approvals: "NAAC A+ | AICTE, MCI, UGC, NBA Approved", course: "BA Journalism and Mass Communication", fees: 790000, rating: 3.9, reviews: 225, avgPkg: "6.69 LPA", highPkg: "13 LPA", score: 0 },
  { rank: 16, name: "Madurai Kamaraj University", city: "Madurai", abbr: "MKU", approvals: "NAAC A+ | UGC Approved", course: "Ph.D Journalism and Mass Communication", fees: 0, rating: 3.9, reviews: 848, avgPkg: "", highPkg: "33.6 LPA", score: 425 },
  { rank: 17, name: "Alagappa University", city: "Karaikudi", abbr: "", approvals: "NAAC A+ | AICTE, UGC, MHRD Approved", course: "MJMC", fees: 10600, rating: 3.8, reviews: 158, avgPkg: "", highPkg: "", score: 435 },
  { rank: 18, name: "SRM Institute of Science and Technology, Ramapuram Campus", city: "Chennai", abbr: "", approvals: "NAAC A++ | DCI, AICTE, COA, UGC, MHRD Approved", course: "BA Journalism and Mass Communication", fees: 150000, rating: 3.9, reviews: 255, avgPkg: "", highPkg: "55 LPA", score: 0 },
  { rank: 19, name: "Kongunadu Arts and Science College", city: "Coimbatore", abbr: "", approvals: "NAAC A+ | UGC Approved", course: "Certification in Journalism", fees: 73500, rating: 3.8, reviews: 31, avgPkg: "", highPkg: "", score: 0 },
  { rank: 20, name: "Ayya Nadar Janaki Ammal College", city: "Sivakasi", abbr: "ANJA", approvals: "NAAC A+ | AICTE, UGC Approved", course: "PGD Journalism", fees: 12150, rating: 4.1, reviews: 30, avgPkg: "", highPkg: "", score: 0 },
  { rank: 21, name: "National College", city: "Tiruchirappalli", abbr: "NCT", approvals: "NAAC A+ | UGC Approved", course: "Diploma in Journalism", fees: 0, rating: 4.0, reviews: 22, avgPkg: "", highPkg: "3 LPA", score: 0 },
  { rank: 22, name: "Cheran Group of Institutions", city: "Coimbatore", abbr: "", approvals: "", course: "MA Journalism and Mass Communication", fees: 39000, rating: 0, reviews: 0, avgPkg: "", highPkg: "", score: 0 },
  { rank: 23, name: "Dr GR Damodaran College of Science", city: "Coimbatore", abbr: "GRDCS", approvals: "NAAC A+ | AICTE, UGC Approved", course: "MA Journalism and Mass Communication", fees: 23680, rating: 3.8, reviews: 60, avgPkg: "3.75 LPA", highPkg: "23.9 LPA", score: 0 },
  { rank: 24, name: "Annamalai University", city: "Chidambaram", abbr: "AU", approvals: "NAAC A+ | NCTE, AICTE, NBA Approved", course: "Diploma in Journalism", fees: 59100, rating: 3.7, reviews: 301, avgPkg: "23.2 LPA", highPkg: "6 LPA", score: 0 },
  { rank: 25, name: "Theivanai Ammal College for Women", city: "Viluppuram", abbr: "", approvals: "NAAC A", course: "BA Journalism and Mass Communication", fees: 122700, rating: 3.8, reviews: 6, avgPkg: "5 LPA", highPkg: "8.36 LPA", score: 0 },
  { rank: 26, name: "Manonmaniam Sundaranar University", city: "Tirunelveli", abbr: "", approvals: "NAAC A+ | NCTE, AICTE, PCI, UGC Approved", course: "Ph.D Journalism and Mass Communication", fees: 53100, rating: 3.9, reviews: 354, avgPkg: "", highPkg: "4 LPA", score: 0 },
  { rank: 27, name: "University VOC College of Engineering, Anna University", city: "Thoothukudi", abbr: "UVOCCET", approvals: "AICTE Approved", course: "Ph.D Journalism and Mass Communication", fees: 0, rating: 3.7, reviews: 18, avgPkg: "", highPkg: "", score: 0 },
  { rank: 28, name: "Madurai Kamaraj University, Directorate of Distance Education", city: "Madurai", abbr: "MKUDDE", approvals: "NAAC A++ | UGC, DEB Approved", course: "PGD Journalism", fees: 8000, rating: 4.0, reviews: 29, avgPkg: "", highPkg: "", score: 0 },
  { rank: 29, name: "Annamalai University, Directorate of Distance Education", city: "Annamalainagar", abbr: "", approvals: "NAAC A+ | NCTE, UGC Approved", course: "Diploma in Journalism", fees: 3800, rating: 4.2, reviews: 23, avgPkg: "", highPkg: "", score: 0 },
  { rank: 30, name: "Jaya College of Arts and Science", city: "Chennai", abbr: "JCAS", approvals: "AICTE Approved", course: "Certification in Journalism", fees: 30000, rating: 3.8, reviews: 20, avgPkg: "", highPkg: "", score: 0 },
  { rank: 31, name: "Quaide Milleth International Academy of Media Studies", city: "Chennai", abbr: "QIAMS", approvals: "", course: "Diploma in Journalism", fees: 125000, rating: 0, reviews: 0, avgPkg: "", highPkg: "", score: 0 },
  { rank: 32, name: "Idhaya College for Women", city: "Kumbakonam", abbr: "", approvals: "NAAC A+ | UGC Approved", course: "Diploma in Journalism", fees: 21160, rating: 4.0, reviews: 9, avgPkg: "", highPkg: "", score: 0 },
  { rank: 33, name: "Periyar Maniammai Institute of Science and Technology", city: "Thanjavur", abbr: "PMIST", approvals: "AICTE, COA, UGC Approved", course: "BA Journalism and Mass Communication", fees: 62000, rating: 4.0, reviews: 31, avgPkg: "", highPkg: "3.84 LPA", score: 0 },
  { rank: 34, name: "Cheran Arts and Science College", city: "Kangayam", abbr: "", approvals: "AICTE, INC Approved", course: "MA Journalism and Mass Communication", fees: 36000, rating: 3.4, reviews: 3, avgPkg: "", highPkg: "", score: 0 },
  { rank: 35, name: "All India Institute of Technology and Management", city: "Chennai", abbr: "AIITM", approvals: "AICTE Approved", course: "PGD Journalism", fees: 25000, rating: 3.5, reviews: 3, avgPkg: "", highPkg: "", score: 0 },
  { rank: 36, name: "Crescent Community College", city: "Kanyakumari", abbr: "", approvals: "", course: "Diploma in Journalism", fees: 18000, rating: 4.0, reviews: 1, avgPkg: "", highPkg: "", score: 0 },
  { rank: 37, name: "The Tamil Nadu Dr. M.G.R. Medical University", city: "Chennai", abbr: "", approvals: "MCI Approved", course: "PG Diploma Public Health Journalism", fees: 0, rating: 4.0, reviews: 1173, avgPkg: "", highPkg: "", score: 0 },
  { rank: 38, name: "E.M.G. Yadava Women's College", city: "Madurai", abbr: "", approvals: "", course: "Certification in Journalism", fees: 1950, rating: 3.2, reviews: 50, avgPkg: "", highPkg: "", score: 0 },
  { rank: 39, name: "Mahendra Arts and Science College", city: "Namakkal", abbr: "", approvals: "", course: "BA Journalism and Mass Communication", fees: 75000, rating: 3.6, reviews: 5, avgPkg: "", highPkg: "", score: 0 },
  { rank: 40, name: "Nadar Saraswathi College of Arts and Science", city: "Theni", abbr: "", approvals: "UGC Approved", course: "Certification in Journalism", fees: 30000, rating: 4.4, reviews: 11, avgPkg: "", highPkg: "", score: 0 },
  { rank: 41, name: "Srinivasan College of Arts and Science", city: "Perambalur", abbr: "", approvals: "UGC Approved", course: "BA Journalism and Mass Communication", fees: 89550, rating: 4.0, reviews: 11, avgPkg: "", highPkg: "", score: 0 },
  { rank: 42, name: "Visualite Academy", city: "Chennai", abbr: "", approvals: "", course: "Diploma in Journalism", fees: 50000, rating: 4.0, reviews: 2, avgPkg: "", highPkg: "", score: 0 },
  { rank: 43, name: "All India Institute of Management Studies", city: "Chennai", abbr: "AIIMAS", approvals: "DEB Approved", course: "PGD Journalism", fees: 30000, rating: 4.6, reviews: 3, avgPkg: "", highPkg: "", score: 0 },
  { rank: 44, name: "Meenakshi Ramasamy Arts and Science College", city: "Udayarpalayam", abbr: "", approvals: "AICTE Approved", course: "Diploma in Journalism", fees: 59000, rating: 0, reviews: 0, avgPkg: "", highPkg: "", score: 0 },
  { rank: 45, name: "Anugraha Institute of Social Sciences", city: "Dindigul", abbr: "AISS", approvals: "", course: "Ph.D Journalism and Mass Communication", fees: 90000, rating: 0, reviews: 0, avgPkg: "", highPkg: "", score: 0 },
  { rank: 46, name: "Thiru. Vi. Ka. Govt. Arts College", city: "Thiruvarur", abbr: "TVKGAC", approvals: "", course: "BA Journalism and Mass Communication", fees: 75000, rating: 3.1, reviews: 2, avgPkg: "", highPkg: "", score: 0 },
  { rank: 47, name: "Bridge Academy for Media Studies", city: "Chennai", abbr: "", approvals: "NAAC A", course: "Diploma in Journalism", fees: 30000, rating: 3.8, reviews: 5, avgPkg: "", highPkg: "", score: 0 },
  { rank: 48, name: "SMS College of Arts and Science", city: "Coimbatore", abbr: "", approvals: "", course: "MA Journalism and Mass Communication", fees: 80000, rating: 4.0, reviews: 1, avgPkg: "", highPkg: "", score: 0 },
  { rank: 49, name: "Dakshina Bharat Hindi Prachar Sabha", city: "Chennai", abbr: "", approvals: "NAAC A++", course: "PG Diploma Hindi Journalism and Mass Communication", fees: 5250, rating: 0, reviews: 0, avgPkg: "", highPkg: "", score: 0 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const normText = (s = "") => String(s).toLowerCase().replace(/[^a-z0-9]/g, "").trim();

/** Distill a college name to a stable match key: strips "[ABBR]" suffixes
 *  and ALL-CAPS parenthetical abbreviations, collapses punctuation. */
function coreKey(name) {
  let s = String(name || "");
  s = s.replace(/\[[^\]]*\]/g, " ");                       // "[ACJ]"
  s = s.replace(/\([A-Z][A-Z0-9 .\-]*\)/g, " ");           // "(SRMIST)"
  s = s.replace(/[^a-z0-9]+/gi, " ");
  return normText(s);
}

function makeSlug(courseName) {
  const base = String(courseName || "")
    .toLowerCase()
    .split(" ")
    .join("-")
    .replace(/[^\w-]+/g, "");
  return `${base}-${Math.random().toString(36).substr(2, 5)}`;
}

// Courses that must exist (canonical name -> level/duration for new ones).
const COURSE_DEFS = {
  "PGD Journalism": { existing: true },
  "MA Journalism and Mass Communication": { existing: true },
  "BA Journalism and Mass Communication": { existing: true },
  "MJMC": { existing: true },
  "Diploma in Journalism": { existing: true },
  "Certification in Journalism": { level: "after12th", duration: "6 Months" },
  "Ph.D Journalism and Mass Communication": { level: "after12th", duration: "3 Years" },
  "PG Diploma Public Health Journalism": { level: "after12th", duration: "2 Years" },
  "PG Diploma Hindi Journalism and Mass Communication": { level: "after12th", duration: "2 Years" },
};

const ELIGIBILITY =
  "Passed 10+2 or equivalent from a recognized board (varies by course and college).";
const DESC =
  "Journalism & mass communication programme listed in the Collegedunia 2026 Tamil Nadu journalism college rankings.";

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });

  // Existing colleges indexed by core key.
  const colleges = await College.find({})
    .select("collegeName collegeCode stream streamsOffered district rank accreditation feesPerYear placementPercentage totalFees cdScore placementAvgPackage placementHighestPackage userRating totalReviews")
    .lean();
  const byCore = new Map(); // core key -> docs[]
  for (const c of colleges) {
    const k = coreKey(c.collegeName);
    if (!byCore.has(k)) byCore.set(k, []);
    byCore.get(k).push(c);
  }

  // Existing Media & Journalism courses indexed by normalized name.
  const courses = await Course.find({ status: { $ne: "archived" } })
    .select("_id courseName category")
    .lean();
  const courseByName = new Map();
  for (const c of courses) courseByName.set(normText(c.courseName), c);

  const resolveCollege = (row) => {
    const key = coreKey(row.name);
    const cands = byCore.get(key) || [];
    const score = (c) => {
      let s = 0;
      if (c.stream === STREAM_LABEL) s += 100;
      if ((c.streamsOffered || []).includes(STREAM_LABEL)) s += 50;
      if (normText(c.district) === normText(row.city)) s += 20;
      if (c.stream === "Arts & Science") s += 5;
      if (c.collegeName.replace(/[^a-z0-9]/gi, "") === row.name.replace(/[^a-z0-9]/gi, "")) s += 10;
      return s;
    };
    cands.sort((a, b) => score(b) - score(a));
    if (cands.length) return { college: cands[0], reused: true };

    // Prefix-fuzzy fallback: a single existing record whose key starts with
    // ours (or ours with theirs) and whose district matches.
    const startMatches = colleges.filter(
      (c) =>
        (coreKey(c.collegeName).startsWith(key) || key.startsWith(coreKey(c.collegeName))) &&
        coreKey(c.collegeName) !== key &&
        normText(c.district) === normText(row.city)
    );
    if (startMatches.length) {
      const m = startMatches.sort((a, b) => score(b) - score(a))[0];
      return { college: m, reused: true };
    }

    // Create a new college.
    return {
      college: new College({
        collegeName: row.name,
        collegeCode: row.abbr || "",
        stream: STREAM_LABEL,
        streamsOffered: [STREAM_LABEL],
        district: row.city,
        state: "Tamil Nadu",
        rank: `#${row.rank}`,
        accreditation: row.approvals,
      }),
      reused: false,
    };
  };

  const enrichCollege = (doc, row) => {
    const set = {};
    if (!doc.district) set.district = row.city;
    if (!doc.rank && row.rank) set.rank = `#${row.rank}`;
    if (!doc.accreditation && row.approvals) set.accreditation = row.approvals;
    if (!doc.totalFees && row.fees) set.totalFees = row.fees;
    if (!doc.userRating && row.rating) set.userRating = row.rating;
    if (!doc.totalReviews && row.reviews) set.totalReviews = row.reviews;
    if (!doc.placementAvgPackage && row.avgPkg) set.placementAvgPackage = row.avgPkg;
    if (!doc.placementHighestPackage && row.highPkg) set.placementHighestPackage = row.highPkg;
    if (!doc.cdScore && row.score) set.cdScore = row.score;
    if (row.placementPct && !(doc.placementPercentage > 0)) set.placementPercentage = row.placementPct;
    if (!(doc.streamsOffered || []).includes(STREAM_LABEL)) {
      set.streamsOffered = [...(doc.streamsOffered || []), STREAM_LABEL];
    }
    return set;
  };

  const resolveCourse = async (name) => {
    const existing = courseByName.get(normText(name));
    if (existing) return { course: existing, created: false };
    const def = COURSE_DEFS[name] || {};
    const course = new Course({
      courseName: name,
      branchCode: "",
      slug: makeSlug(name),
      level: def.level || "after12th",
      category: STREAM_LABEL,
      duration: def.duration || "2 Years",
      eligibility: ELIGIBILITY,
      shortDescription: DESC,
      isImported: true,
      source: SOURCE,
      sourceUrl: "https://collegedunia.com/mass-communications/journalism/tamil-nadu-colleges",
      verified: true,
      status: "active",
      isPublished: true,
    });
    await course.save();
    courseByName.set(normText(name), course);
    return { course, created: true };
  };

  const stats = {
    collegesReused: 0,
    collegesCreated: 0,
    collegesEnriched: 0,
    coursesCreated: 0,
    mappingsCreated: 0,
    mappingsUpdated: 0,
    unmatched: [],
  };

  for (const row of ROWS) {
    let updated = {};
    try {
      const { college, reused } = resolveCollege(row);
      updated = enrichCollege(college, row);
      if (!reused) {
        // New college: constructor sets basics, enrichCollege adds the rest.
        college.set(updated);
        await college.save();
        stats.collegesCreated++;
        if (Object.keys(updated).length) stats.collegesEnriched++;
      } else {
        stats.collegesReused++;
        if (Object.keys(updated).length) {
          await College.updateOne({ _id: college._id }, { $set: updated });
          stats.collegesEnriched++;
        }
      }

      const { course, created } = await resolveCourse(row.course);
      if (created) stats.coursesCreated++;

      const result = await CollegeCourseMapping.updateOne(
        { collegeId: college._id, courseId: course._id },
        {
          $set: {
            stream: STREAM_LABEL,
            source: SOURCE,
            sourceFileName: SOURCE_FILE,
            isActive: true,
            isVerified: true,
            collegeName: college.collegeName,
            courseName: course.courseName,
          },
          $setOnInsert: { collegeId: college._id, courseId: course._id },
        },
        { upsert: true }
      );
      if (result.upsertedCount) stats.mappingsCreated++;
      else if (result.modifiedCount) stats.mappingsUpdated++;

      // These mappings carry no TNEA seat data. Keep the seat fields absent
      // (mongoose schema defaults would otherwise materialize zeros) so the
      // admin detail page renders "No seat data for this college." instead of
      // misleading zero seat counts.
      await CollegeCourseMapping.updateOne(
        { collegeId: college._id, courseId: course._id },
        {
          $unset: {
            seatsOC: 1, seatsBC: 1, seatsBCM: 1, seatsMBC: 1,
            seatsSC: 1, seatsSCA: 1, seatsST: 1, seatsTotal: 1,
          },
        }
      );
    } catch (e) {
      console.error("❌ row failed:", row.rank, row.name, e.message);
      stats.unmatched.push({ rank: row.rank, name: row.name, error: e.message });
    }
  }

  console.log(JSON.stringify({ ...stats, rows: ROWS.length }, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});