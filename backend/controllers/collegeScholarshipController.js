const CollegeScholarship = require("../models/CollegeScholarship");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const SavedItem = require("../models/SavedItem");
const ScholarshipApplication = require("../models/ScholarshipApplication");
const User = require("../models/User");

/**
 * ── GET /api/college-scholarships ───────────────────────────────────────────
 * Browse College Scholarships with Search, Filtering & Sorting
 */
exports.getCollegeScholarships = async (req, res) => {
  try {
    // Seed sample college scholarships if DB is empty
    const count = await CollegeScholarship.countDocuments();
    if (count === 0) {
      await CollegeScholarship.insertMany([
        {
          scholarshipName: "Central Sector Scheme of Scholarships for College and University Students",
          provider: "Department of Higher Education (MHRD / NSP)",
          category: "Government Scholarship",
          benefit: "₹12,000 / Year (UG) to ₹20,000 / Year (PG)",
          description: "Financial assistance to meritorious students from low income families to meet day-to-day expenses while pursuing higher studies.",
          applicationLink: "https://scholarships.gov.in/",
          deadline: "31st October 2026",
          status: "published",
          eligibleFields: ["All"],
          eligibleDegrees: ["B.E. (Bachelor of Engineering)", "B.Tech (Bachelor of Technology)", "B.Sc (Bachelor of Science)", "BBA (Bachelor of Business Administration)", "B.Com (Bachelor of Commerce)"],
          eligibleDomains: ["All"],
          eligibleYears: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
          minCGPA: "Above 80th percentile in Higher Secondary",
          familyIncomeLimit: "Below ₹4,50,000 per annum",
          additionalEligibility: "Applicant must be pursuing regular full-time undergraduate or postgraduate course in a recognized college."
        },
        {
          scholarshipName: "AICTE Pragati Scholarship for Women in Engineering & Technology",
          provider: "AICTE (All India Council for Technical Education)",
          category: "Women in Education",
          benefit: "₹50,000 / Year for college fees & computer allowance",
          description: "Scheme aiming to provide assistance for advancement of girls pursuing technical education in AICTE approved colleges.",
          applicationLink: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
          deadline: "15th November 2026",
          status: "published",
          eligibleFields: ["Engineering & Technology"],
          eligibleDegrees: ["B.E. (Bachelor of Engineering)", "B.Tech (Bachelor of Technology)", "Diploma in Engineering (3 Years)"],
          eligibleDomains: ["Computer Science & Information Technology", "Electronics & Electrical Engineering", "Mechanical & Automotive Engineering", "Civil & Architecture"],
          eligibleYears: ["1st Year", "2nd Year"],
          minCGPA: "Minimum 6.5 CGPA or 65% in 12th Std",
          familyIncomeLimit: "Below ₹8,00,000 per annum",
          additionalEligibility: "Female students admitted to 1st year of Degree/Diploma level course or 2nd year through lateral entry."
        },
        {
          scholarshipName: "Post-Matric Scholarship Scheme for SC/ST/SCC College Students",
          provider: "Adi Dravidar and Tribal Welfare Department, Govt of Tamil Nadu",
          category: "Government Scholarship",
          benefit: "100% Tuition Fee Waiver + Maintenance Allowance ₹7,500/yr",
          description: "Comprehensive financial support for SC/ST students enrolled in degree, diploma, medical, engineering and professional colleges.",
          applicationLink: "https://tnadw.tn.gov.in/",
          deadline: "30th November 2026",
          status: "published",
          eligibleFields: ["All"],
          eligibleDegrees: ["All"],
          eligibleDomains: ["All"],
          eligibleYears: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
          minCGPA: "Passed qualifying examination",
          familyIncomeLimit: "Below ₹2,50,000 per annum",
          additionalEligibility: "Must be a native of Tamil Nadu belonging to SC/ST community enrolled in recognized Tamil Nadu institution."
        },
        {
          scholarshipName: "State Merit Scholarship for Higher Education Degree Students",
          provider: "Directorate of Collegiate Education, Govt of Tamil Nadu",
          category: "Merit-Based",
          benefit: "₹25,000 / Year + Hostel Support Allowance",
          description: "Awarded to top ranking undergraduate students in Arts, Science, Commerce, Management and Professional degree colleges.",
          applicationLink: "https://tndce.tn.gov.in/",
          deadline: "20th December 2026",
          status: "published",
          eligibleFields: ["Engineering & Technology", "Arts & Social Sciences", "Pure Sciences", "Commerce & Accountancy", "Management & Business Administration"],
          eligibleDegrees: ["B.A. (Bachelor of Arts)", "B.Sc (Bachelor of Science)", "B.Com (Bachelor of Commerce)", "BBA (Bachelor of Business Administration)", "B.E. (Bachelor of Engineering)"],
          eligibleDomains: ["All"],
          eligibleYears: ["1st Year", "2nd Year", "3rd Year"],
          minCGPA: "Minimum 75% marks in Higher Secondary / Previous Semesters",
          familyIncomeLimit: "No family income limit for open merit quota",
          additionalEligibility: "Students holding top ranks in state board examination or university semester exams."
        },
        {
          scholarshipName: "Foundation for Academic Excellence and Access (FAEA) College Grant",
          provider: "FAEA & Tata Trusts",
          category: "Need-Based",
          benefit: "Full College Fee + Maintenance & Hostel Expenses",
          description: "Supports students from economically disadvantaged backgrounds to pursue undergraduate studies in Arts, Commerce, Science, Engineering and Medical streams.",
          applicationLink: "https://www.faeaindia.org/",
          deadline: "31st January 2027",
          status: "published",
          eligibleFields: ["All"],
          eligibleDegrees: ["All"],
          eligibleDomains: ["All"],
          eligibleYears: ["1st Year"],
          minCGPA: "Passed 12th Standard from recognized Board",
          familyIncomeLimit: "Below ₹3,00,000 per annum",
          additionalEligibility: "Open to students belonging to BPL, SC/ST, or socially disadvantaged sections."
        }
      ]);
    }

    const {
      search,
      category,
      field,
      degree,
      domain,
      year,
      status,
      sortBy = "recently_added"
    } = req.query;

    const query = {};

    // For student portal, default to active & published
    if (!status) {
      query.status = { $in: ["published", "active"] };
    } else if (status !== "all") {
      query.status = status;
    }

    if (category && category !== "All" && category !== "all") {
      query.category = category;
    }

    if (field && field !== "All" && field !== "all") {
      query.$or = [
        { eligibleFields: "All" },
        { eligibleFields: { $regex: field, $options: "i" } }
      ];
    }

    if (degree && degree !== "All" && degree !== "all") {
      query.$or = [
        { eligibleDegrees: "All" },
        { eligibleDegrees: { $regex: degree, $options: "i" } }
      ];
    }

    if (domain && domain !== "All" && domain !== "all") {
      query.$or = [
        { eligibleDomains: "All" },
        { eligibleDomains: { $regex: domain, $options: "i" } }
      ];
    }

    if (year && year !== "All" && year !== "all") {
      query.$or = [
        { eligibleYears: "All" },
        { eligibleYears: { $regex: year, $options: "i" } }
      ];
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { scholarshipName: { $regex: s, $options: "i" } },
        { provider: { $regex: s, $options: "i" } },
        { category: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sortBy === "recently_added") {
      sortObj = { createdAt: -1 };
    } else if (sortBy === "deadline_soon") {
      sortObj = { deadline: 1 };
    } else if (sortBy === "highest_benefit") {
      sortObj = { benefit: -1 };
    }

    const scholarships = await CollegeScholarship.find(query).sort(sortObj).lean();

    res.json({
      success: true,
      count: scholarships.length,
      scholarships
    });
  } catch (error) {
    console.error("Get College Scholarships Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch college scholarships" });
  }
};

/**
 * ── GET /api/college-scholarships/recommended ──────────────────────────────
 * AI Profile Matching Engine: Matches student's CollegeStudentProfile
 */
exports.getRecommendedScholarships = async (req, res) => {
  try {
    // verifyStudent sets req.student (not req.user)
    const userId = req.student?._id;
    const profile = await CollegeStudentProfile.findOne({ userId }).lean();

    const scholarships = await CollegeScholarship.find({
      status: { $in: ["published", "active"] }
    }).lean();

    if (!profile) {
      // If student hasn't completed profile, return basic list with 70% match
      const fallback = scholarships.map(s => ({
        ...s,
        matchPercentage: 75,
        matchReasons: ["✓ General Higher Education Scholarship", "⚠️ Complete your profile for 95%+ precision match"],
        unverifiedCriteria: ["Academic CGPA not on file", "Family Income Certificate unverified"]
      }));

      return res.json({
        success: true,
        recommended: fallback.slice(0, 6),
        profileComplete: false
      });
    }

    const matched = scholarships.map(sch => {
      let score = 50; // Base score for active student
      const matchReasons = [];
      const unverifiedCriteria = [];

      // 1. Field Match
      const isFieldMatch = sch.eligibleFields.includes("All") ||
        sch.eligibleFields.some(f => f.toLowerCase().includes(profile.field?.toLowerCase() || ""));
      if (isFieldMatch) {
        score += 15;
        matchReasons.push(`✓ Field matches (${profile.field || 'Enrolled Discipline'})`);
      }

      // 2. Degree Match
      const isDegreeMatch = sch.eligibleDegrees.includes("All") ||
        sch.eligibleDegrees.some(d => d.toLowerCase().includes(profile.degreeProgramme?.toLowerCase() || ""));
      if (isDegreeMatch) {
        score += 15;
        matchReasons.push(`✓ Degree Programme matches (${profile.degreeProgramme || 'Degree'})`);
      }

      // 3. Domain / Branch Match
      const isDomainMatch = sch.eligibleDomains.includes("All") ||
        sch.eligibleDomains.some(dom => dom.toLowerCase().includes(profile.domain?.toLowerCase() || ""));
      if (isDomainMatch) {
        score += 10;
        matchReasons.push(`✓ Domain/Branch matches (${profile.domain || 'Branch'})`);
      }

      // 4. Year Match
      const isYearMatch = sch.eligibleYears.includes("All") ||
        sch.eligibleYears.some(y => y.toLowerCase().includes(profile.currentYear?.toLowerCase() || ""));
      if (isYearMatch) {
        score += 10;
        matchReasons.push(`✓ Academic Year matches (${profile.currentYear || 'Enrolled Year'})`);
      }

      // Notes on unverified
      if (sch.minCGPA && sch.minCGPA !== "No minimum CGPA criteria") {
        unverifiedCriteria.push(`Requires ${sch.minCGPA} (Verify your marksheets)`);
      }
      if (sch.familyIncomeLimit && sch.familyIncomeLimit !== "No family income limit") {
        unverifiedCriteria.push(`Income criteria: ${sch.familyIncomeLimit} (Income cert required)`);
      }

      const matchPercentage = Math.min(score, 98);

      return {
        ...sch,
        matchPercentage,
        matchReasons,
        unverifiedCriteria
      };
    });

    // Sort by highest match score
    matched.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      recommended: matched.slice(0, 6),
      profileComplete: true
    });
  } catch (error) {
    console.error("Get Recommended College Scholarships Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate recommendations" });
  }
};

/**
 * ── GET /api/college-scholarships/:id ──────────────────────────────────────
 * Detailed single scholarship view
 */
exports.getCollegeScholarshipById = async (req, res) => {
  try {
    const scholarship = await CollegeScholarship.findById(req.params.id).lean();
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    res.json({ success: true, scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch scholarship details" });
  }
};

/**
 * ── POST /api/college-scholarships (Admin) ───────────────────────────────────
 * Admin Create College Scholarship
 */
exports.createCollegeScholarship = async (req, res) => {
  try {
    const data = req.body;
    const newScholarship = new CollegeScholarship(data);
    await newScholarship.save();

    res.status(201).json({
      success: true,
      message: "College Scholarship created successfully",
      scholarship: newScholarship
    });
  } catch (error) {
    console.error("Create College Scholarship Error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create scholarship" });
  }
};

/**
 * ── PUT /api/college-scholarships/:id (Admin) ──────────────────────────────
 * Admin Update College Scholarship
 */
exports.updateCollegeScholarship = async (req, res) => {
  try {
    const updated = await CollegeScholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    res.json({
      success: true,
      message: "College Scholarship updated successfully",
      scholarship: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || "Failed to update scholarship" });
  }
};

/**
 * ── DELETE /api/college-scholarships/:id (Admin) ───────────────────────────
 * Admin Delete College Scholarship
 */
exports.deleteCollegeScholarship = async (req, res) => {
  try {
    const deleted = await CollegeScholarship.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    res.json({
      success: true,
      message: "College Scholarship deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete scholarship" });
  }
};

/**
 * ── POST /api/college-scholarships/import (Admin CSV/XLSX Bulk Import) ─────
 */
exports.importCollegeScholarshipsCSV = async (req, res) => {
  try {
    const { scholarshipsData } = req.body;
    if (!Array.isArray(scholarshipsData) || scholarshipsData.length === 0) {
      return res.status(400).json({ success: false, message: "No valid scholarship data provided" });
    }

    let inserted = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < scholarshipsData.length; i++) {
      const row = scholarshipsData[i];
      try {
        if (!row.scholarshipName) {
          failed++;
          errors.push(`Row ${i + 1}: Missing scholarshipName`);
          continue;
        }

        const doc = {
          scholarshipName: row.scholarshipName,
          provider: row.provider || "Government / Educational Trust",
          category: row.category || "Government Scholarship",
          benefit: row.benefit || "Financial Waiver",
          description: row.description || "",
          applicationLink: row.applicationLink || "",
          deadline: row.deadline || "",
          status: row.status || "published",
          eligibleFields: row.eligibleFields ? row.eligibleFields.split(",").map(s => s.trim()) : ["All"],
          eligibleDegrees: row.eligibleDegrees ? row.eligibleDegrees.split(",").map(s => s.trim()) : ["All"],
          eligibleDomains: row.eligibleDomains ? row.eligibleDomains.split(",").map(s => s.trim()) : ["All"],
          eligibleYears: row.eligibleYears ? row.eligibleYears.split(",").map(s => s.trim()) : ["All"],
          minCGPA: row.minCGPA || "No minimum CGPA criteria",
          familyIncomeLimit: row.familyIncomeLimit || "No family income limit"
        };

        await CollegeScholarship.create(doc);
        inserted++;
      } catch (err) {
        failed++;
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `${inserted} college scholarships imported successfully, ${failed} records failed.`,
      inserted,
      failed,
      errors
    });
  } catch (error) {
    console.error("Import College Scholarships Error:", error);
    res.status(500).json({ success: false, message: "Failed to process import" });
  }
};

/**
 * ── GET /api/college-scholarships/my-applications ──────────────────────────
 * Returns a map of scholarshipId → applicationStatus for the current student.
 * Used by the frontend to show Tracking section and per-card status badges.
 */
exports.getMyApplicationStatuses = async (req, res) => {
  try {
    const studentId = req.student?._id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const applications = await ScholarshipApplication.find({
      studentId,
      scholarshipType: "college"
    }).lean();

    // Build a map { scholarshipId: applicationStatus }
    const statusMap = {};
    applications.forEach(app => {
      if (app.scholarshipId) {
        statusMap[app.scholarshipId.toString()] = app.applicationStatus;
      }
    });

    // Also return full records for the Tracking tab
    res.json({
      success: true,
      statusMap,
      applications
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch application statuses" });
  }
};

/**
 * ── POST /api/college-scholarships/:id/apply-status ────────────────────────
 * Body: { status: "Interested" | "Applied" | "Not Interested" | "remove" }
 * Upserts a ScholarshipApplication record for the authenticated student.
 * If status is "remove", the tracking record is deleted.
 */
exports.setApplicationStatus = async (req, res) => {
  try {
    const studentId = req.student?._id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id: scholarshipId } = req.params;
    const { status, notes } = req.body;

    const VALID_STATUSES = ["Interested", "Applied", "Not Interested"];

    // Handle removal
    if (status === "remove") {
      await ScholarshipApplication.findOneAndDelete({ studentId, scholarshipId });
      return res.json({ success: true, message: "Tracking record removed" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
      });
    }

    // Fetch scholarship for name/provider
    const scholarship = await CollegeScholarship.findById(scholarshipId).lean();
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    // Get student details
    const student = await User.findById(studentId).lean();

    // Upsert — create or update the tracking record
    const updated = await ScholarshipApplication.findOneAndUpdate(
      { studentId, scholarshipId },
      {
        studentId,
        scholarshipId,
        scholarshipType: "college",
        scholarshipName: scholarship.scholarshipName,
        scholarshipProvider: scholarship.provider,
        studentName: student?.name || "Student",
        studentEmail: student?.email || "",
        applicationStatus: status,
        notes: notes || "",
        appliedDate: status === "Applied" ? new Date() : undefined
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Status set to "${status}" successfully`,
      application: updated
    });
  } catch (error) {
    console.error("Set Application Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update application status" });
  }
};
