const path = require("path");
const xlsx = require("xlsx");
const fs = require("fs");
const csvParser = require("csv-parser");
const csvtojson = require("csvtojson");
const Scholarship = require("../models/Scholarship");
const ScholarshipApplication = require("../models/ScholarshipApplication");

const normalizeString = (v) => (v === null || v === undefined ? "" : String(v).trim());
const normalizeLower = (v) => normalizeString(v).toLowerCase();

const normalizeLevel = (v) => {
  const s = normalizeString(v);
  const map = {
    "5": "5th",
    "5th": "5th",
    "8": "8th",
    "8th": "8th",
    "10": "10th",
    "10th": "10th",
    "12": "12th",
    "12th": "12th",
    "graduate": "Graduate",
    "Graduation": "Graduate",
    "Graduate": "Graduate",
  };
  return map[s] || map[s.toLowerCase()] || s; // fallback
};

const parseDocuments = (v) => {
  if (Array.isArray(v)) return v.map((x) => normalizeString(x)).filter(Boolean);
  const s = normalizeString(v);
  if (!s) return [];
  // split by comma / newline / semicolon
  return s
    .split(/[,;\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);
};

const parseGrades = (v) => {
  if (Array.isArray(v)) {
    return v.map((x) => normalizeString(x)).filter(Boolean);
  }
  const s = normalizeString(v);
  if (!s) return ["10"];
  return s
    .split(/[,;\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);
};

const pickValue = (row, keys) => {
  const rowKeys = Object.keys(row || {});
  for (const rawKey of rowKeys) {
    const key = normalizeLower(rawKey).replace(/\s+/g, "");
    if (keys.some((candidate) => key.includes(candidate))) {
      return row[rawKey];
    }
  }
  return "";
};

const mapScholarshipRow = (row) => {
  const nameRaw = pickValue(row, ["name", "scholarship"]);
  const providerRaw = pickValue(row, ["provider", "organization", "sponsor"]);
  const categoryRaw = pickValue(row, ["category", "type", "segment"]);
  const eligibilityRaw = pickValue(row, ["eligibility", "criteria"]);
  const gradesRaw = pickValue(row, ["grades", "targetclass", "targetgrade", "class"]);
  const amountRaw = pickValue(row, ["amount", "benefit", "award", "fund"]);
  const deadlineRaw = pickValue(row, ["deadline", "lastdate", "enddate", "closingdate"]);
  const linkRaw = pickValue(row, ["link", "url", "apply"]);
  const descriptionRaw = pickValue(row, ["description", "details", "about", "info"]);

  const name = normalizeLower(nameRaw);
  const provider = normalizeLower(providerRaw);

  return {
    scholarshipName: name,
    provider,
    category: normalizeString(categoryRaw) || "General",
    eligibility: normalizeString(eligibilityRaw),
    targetClass: parseGrades(gradesRaw),
    amount: normalizeString(amountRaw),
    deadline: normalizeString(deadlineRaw),
    applicationLink: normalizeString(linkRaw),
    description: normalizeString(descriptionRaw),
    status: "published",
  };
};

// @desc    Create scholarship manually
// @route   POST /api/scholarships/add-scholarship
exports.addScholarship = async (req, res) => {
  try {
    let { 
      scholarshipName, 
      provider, 
      description, 
      benefit, 
      grades, 
      category, 
      eligibility, 
      applicationLink, 
      deadline, 
      image,
      status 
    } = req.body;

    if (!scholarshipName) {
      return res.status(400).json({ message: "Scholarship name is required" });
    }

    // Insert new scholarship
    const newScholarship = new Scholarship({
      scholarshipName: scholarshipName.trim(),
      provider: provider ? provider.trim() : "",
      description: description || "",
      benefit: benefit || "",
      grades: Array.isArray(grades) ? grades : (grades ? [grades] : ["10th"]),
      category: category || "Government",
      eligibility: eligibility ? eligibility.trim() : "",
      applicationLink: applicationLink ? applicationLink.trim() : "",
      deadline: deadline || "",
      image: image || "",
      status: status || "active"
    });

    await newScholarship.save();

    return res.status(201).json({ 
      success: true,
      message: "Scholarship added successfully",
      data: newScholarship
    });
  } catch (error) {
    if (error && (error.code === 11000 || error.code === 11001)) {
      return res.status(409).json({ message: "Scholarship already exists" });
    }
    console.error("❌ Error adding scholarship:", error);
    return res.status(500).json({ message: "Server error while adding scholarship", error: error.message });
  }
};

// @desc    Get all scholarships
// @route   GET /api/scholarships
exports.getAllScholarships = async (req, res) => {
  try {
    const { search, grade, category, status } = req.query;

    let filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    } else if (req.query.userSide === 'true' || req.query.userSide === true) {
      filter.status = { $in: ['active', 'published'] };
    }

    if (grade && grade !== "all") {
      const numMatch = grade.match(/\d+/);
      const gradeNum = numMatch ? numMatch[0] : grade;
      const cleanGrade = gradeNum.toString();
      
      const searchStrings = [
        cleanGrade,
        `${cleanGrade}th`,
        `Class ${cleanGrade}`,
        `Grade ${cleanGrade}`,
        `After ${cleanGrade}`
      ];

      filter.$or = [
        { targetClass: { $in: searchStrings } },
        { targetClass: new RegExp(`\\b${cleanGrade}(th)?\\b`, 'i') }
      ];
    }

    if (search && normalizeString(search)) {
      const searchRegex = new RegExp(normalizeString(search), "i");
      if (filter.$or) {
        const searchFilters = [
          { scholarshipName: searchRegex },
          { provider: searchRegex }
        ];
        filter = { $and: [ filter, { $or: searchFilters } ] };
      } else {
        filter.$or = [
          { scholarshipName: searchRegex },
          { provider: searchRegex }
        ];
      }
    }

    const scholarships = await Scholarship.find(filter).sort({ createdAt: -1 });
    
    console.log(`[Backend] GET /api/scholarships - Fetched ${scholarships.length} scholarships from MongoDB`);

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships,
    });
  } catch (error) {
    console.error("❌ Error fetching scholarships:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scholarships",
      error: error.message,
    });
  }
};

// @desc    Import scholarships from CSV
// @route   POST /api/scholarships/import
exports.importScholarshipsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file is required" });
    }

    // Convert CSV rows into JSON using csvtojson
    const jsonArray = await csvtojson().fromFile(req.file.path);

    console.log("[Backend] Parsed CSV Data Preview:", jsonArray.slice(0, 2));

    const validDocs = [];

    // Map CSV fields correctly
    for (const row of jsonArray) {
      const name = normalizeString(row.Name || row.scholarshipName || row.name || "");
      const provider = normalizeString(row.Provider || row.provider || "");
      
      // Skip empty rows
      if (!name) continue;

      let targetClass = ["10"];
      const gradesRaw = row.Grades || row.grades || row.targetClass;
      if (gradesRaw) {
        targetClass = gradesRaw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
      }

      validDocs.push({
        scholarshipName: name.trim().toLowerCase(),
        provider: provider.trim().toLowerCase(),
        amount: normalizeString(row.Amount || row.amount || ""),
        eligibility: normalizeString(row.Eligibility || row.eligibility || ""),
        targetClass: targetClass,
        category: normalizeString(row.Category || row.category || "") || "General",
        deadline: normalizeString(row.Deadline || row.deadline || ""),
        applicationLink: normalizeString(row.Link || row.link || row.applicationLink || ""),
        description: normalizeString(row.Description || row.description || ""),
        status: "published"
      });
    }

    if (!validDocs.length) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "No valid scholarship rows found in CSV" });
    }

    // Filter out duplicates based on exact name and provider combination in MongoDB
    const existing = await Scholarship.find(
      {
        $or: validDocs.map((doc) => ({
          scholarshipName: doc.scholarshipName,
          provider: doc.provider,
        })),
      },
      { scholarshipName: 1, provider: 1 }
    );

    const existingKeys = new Set(
      existing.map((d) => `${d.scholarshipName}::${d.provider || ""}`)
    );

    const docsToInsert = [];
    const seen = new Set();
    
    for (const doc of validDocs) {
      const key = `${doc.scholarshipName}::${doc.provider || ""}`;
      if (!existingKeys.has(key) && !seen.has(key)) {
        seen.add(key);
        docsToInsert.push(doc);
      }
    }

    let insertedCount = 0;
    // Insert data using insertMany()
    if (docsToInsert.length > 0) {
      const inserted = await Scholarship.insertMany(docsToInsert, { ordered: false });
      insertedCount = inserted.length;
    }

    console.log(`[Backend] Successfully inserted ${insertedCount} new records.`);

    // Clean up temporary file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // Return success message with number of records inserted
    return res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedCount} scholarships.`,
      summary: {
        totalRows: jsonArray.length,
        inserted: insertedCount,
        skipped: jsonArray.length - insertedCount
      }
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("❌ [Backend] CSV import failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import scholarships",
      error: error.message,
    });
  }
};

// @desc    Import scholarships from a local CSV file directly from hard disk (No upload required)
// @route   POST /api/scholarships/import-csv
exports.importScholarshipsFromLocalCSV = async (req, res) => {
  try {
    const defaultFilePath = "C:\\Users\\harin\\OneDrive\\Desktop\\Uyarvu Payanam\\Uyarvu-Payanam\\backend\\uploads\\Scholarship - Sheet1.csv";
    const filePath = req.body.filePath || defaultFilePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "CSV file not found at the given path: " + filePath });
    }

    console.log(`\n[Backend] Reading CSV file from: ${filePath}`);

    // Parse CSV to JSON
    const jsonArray = await csvtojson().fromFile(filePath);
    
    console.log("[Backend] Raw CSV Data Preview:", jsonArray.slice(0, 2));

    const validDocs = [];

    // Map columns
    for (const row of jsonArray) {
      // Handle potential casing issues
      const name = normalizeString(row.Name || row.scholarshipName || row.name || "");
      if (!name) continue; // skip blanks

      const provider = normalizeString(row.Provider || row.provider || "");
      const amount = normalizeString(row.Amount || row.amount || "");
      const eligibility = normalizeString(row.Eligibility || row.eligibility || "");
      const category = normalizeString(row.Category || row.category || "") || "General";
      const deadline = normalizeString(row.Deadline || row.deadline || "");
      const link = normalizeString(row.Link || row.link || row.applicationLink || "");
      const description = normalizeString(row.Description || row.description || "");

      let targetClass = ["10"];
      const gradesRaw = row.Grades || row.grades || row.targetClass;
      if (gradesRaw) {
        targetClass = gradesRaw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
      }

      validDocs.push({
        scholarshipName: name.toLowerCase(),
        provider: provider.toLowerCase(),
        amount: amount,
        eligibility: eligibility,
        targetClass: targetClass,
        category: category,
        deadline: deadline,
        applicationLink: link,
        description: description,
        status: "published"
      });
    }

    console.log("[Backend] Mapped Data Preview:", validDocs.slice(0, 2));

    if (validDocs.length === 0) {
      return res.status(400).json({ success: false, message: "No valid rows to insert." });
    }

    // Avoid duplicates using existing records in DB
    const existing = await Scholarship.find(
      { $or: validDocs.map((doc) => ({ scholarshipName: doc.scholarshipName, provider: doc.provider })) },
      { scholarshipName: 1, provider: 1 }
    );
    const existingKeys = new Set(existing.map((d) => `${d.scholarshipName}::${d.provider || ""}`));

    const docsToInsert = [];
    const seen = new Set();
    
    for (const doc of validDocs) {
      const key = `${doc.scholarshipName}::${doc.provider || ""}`;
      if (!existingKeys.has(key) && !seen.has(key)) {
        seen.add(key);
        docsToInsert.push(doc);
      }
    }

    let insertedCount = 0;
    
    // VERY IMPORTANT: Use insertMany with { ordered: false } to append data & skip constraints issues silently
    if (docsToInsert.length > 0) {
      const inserted = await Scholarship.insertMany(docsToInsert, { ordered: false });
      insertedCount = inserted.length;
    }

    console.log(`[Backend] Number of inserted records: ${insertedCount}`);

    return res.status(201).json({
      success: true,
      message: `Data added seamlessly. Inserted ${insertedCount} new records into "scholarships".`,
      summary: {
        totalParsed: jsonArray.length,
        inserted: insertedCount,
        skipped: jsonArray.length - insertedCount
      }
    });

  } catch (error) {
    console.error("❌ [Backend] Error during local CSV import:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get scholarship by ID
// @route   GET /api/scholarships/:id
exports.getScholarshipById = async (req, res) => {
  try {
    console.log("Backend: getScholarshipById received request for ID:", req.params.id);
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    return res.status(200).json({ success: true, data: scholarship });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch scholarship", error: error.message });
  }
};

// @desc    Update scholarship
// @route   PUT /api/scholarships/:id
exports.updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    const {
      scholarshipName,
      provider,
      description,
      benefit,
      grades,
      category,
      eligibility,
      applicationLink,
      deadline,
      image,
      status,
    } = req.body;

    if (scholarshipName !== undefined) scholarship.scholarshipName = scholarshipName;
    if (provider !== undefined) scholarship.provider = provider;
    if (description !== undefined) scholarship.description = description;
    if (benefit !== undefined) scholarship.benefit = benefit;
    if (grades !== undefined) scholarship.grades = Array.isArray(grades) ? grades : [grades];
    if (category !== undefined) scholarship.category = category;
    if (eligibility !== undefined) scholarship.eligibility = eligibility;
    if (applicationLink !== undefined) scholarship.applicationLink = applicationLink;
    if (deadline !== undefined) scholarship.deadline = deadline;
    if (image !== undefined) scholarship.image = image;
    if (status !== undefined) scholarship.status = status;

    await scholarship.save();

    return res.status(200).json({
      success: true,
      message: "Scholarship updated successfully",
      data: scholarship,
    });
  } catch (error) {
    console.error("❌ Error updating scholarship:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update scholarship",
      error: error.message,
    });
  }
};

// @desc    Delete scholarship
// @route   DELETE /api/scholarships/:id
exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    await scholarship.deleteOne();
    return res.status(200).json({ success: true, message: "Scholarship deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete scholarship", error: error.message });
  }
};

// @desc    Upload CSV/Excel and import scholarships
// @route   POST /api/scholarships/upload
exports.uploadScholarshipsCSV = async (req, res) => {
  try {
    console.log("[Backend] incoming file:", req.file);
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    if (fileExt !== 'csv') {
       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
       return res.status(400).json({ success: false, message: "Invalid file format. Only .csv allowed for this route." });
    }

    // Parse CSV to JSON
    const jsonArray = await csvtojson().fromFile(filePath);
    console.log("[Backend] Parsed CSV Data Preview:", jsonArray.slice(0, 2));

    const validDocs = [];

    // Map CSV fields to Mongoose schema
    for (const row of jsonArray) {
      // Intelligently fallback on headers
      const name = normalizeString(row.Name || row.scholarshipName || row.name || "");
      if (!name) continue; // Skip empty rows silently

      const provider = normalizeString(row.Provider || row.provider || "");
      const amount = normalizeString(row.Amount || row.amount || "");
      const eligibility = normalizeString(row.Eligibility || row.eligibility || "");
      const category = normalizeString(row.Category || row.category || "") || "General";
      const deadline = normalizeString(row.Deadline || row.deadline || "");
      const link = normalizeString(row.Link || row.link || row.applicationLink || "");
      const description = normalizeString(row.Description || row.description || "");

      let targetClass = ["10"];
      const gradesRaw = row.Grades || row.grades || row.targetClass;
      if (gradesRaw) {
        targetClass = gradesRaw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
      }

      validDocs.push({
        scholarshipName: name.toLowerCase(),
        provider: provider.toLowerCase(),
        amount,
        eligibility,
        targetClass,
        category,
        deadline,
        applicationLink: link,
        description,
        status: "published"
      });
    }

    if (!validDocs.length) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "No valid rows found in CSV." });
    }

    // Check existing records without overwriting
    const existing = await Scholarship.find(
      { $or: validDocs.map(doc => ({ scholarshipName: doc.scholarshipName, provider: doc.provider })) },
      { scholarshipName: 1, provider: 1 }
    );
    
    const existingKeys = new Set(existing.map(d => `${d.scholarshipName}::${d.provider || ""}`));

    const docsToInsert = [];
    const seen = new Set();
    
    for (const doc of validDocs) {
      const key = `${doc.scholarshipName}::${doc.provider || ""}`;
      if (!existingKeys.has(key) && !seen.has(key)) {
        seen.add(key);
        docsToInsert.push(doc);
      }
    }

    let insertedCount = 0;
    // Insert new data, skipping validation errors via { ordered: false } explicitly without deleting
    if (docsToInsert.length > 0) {
      const inserted = await Scholarship.insertMany(docsToInsert, { ordered: false });
      insertedCount = inserted.length;
    }

    console.log(`[Backend] Number of inserted records: ${insertedCount}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(201).json({
      success: true,
      message: `File uploaded successfully. Added ${insertedCount} new records.`,
      inserted: insertedCount,
      skipped: jsonArray.length - insertedCount,
      duplicates: jsonArray.length - insertedCount
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("❌ [Backend] CSV upload/import failed:", error);
    return res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
};

// @desc    Apply for scholarship
// @route   POST /api/scholarships/apply
exports.applyForScholarship = async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, scholarshipName, scholarshipProvider } = req.body;
    if (!studentName || !studentEmail || !scholarshipName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const application = await ScholarshipApplication.create({
      studentId: studentId || null,
      studentName,
      studentEmail,
      scholarshipName,
      scholarshipProvider: scholarshipProvider || "Unknown Provider",
      status: "Pending"
    });

    return res.status(201).json({ success: true, message: "Applied successfully", application });
  } catch (error) {
    console.error("❌ Array creating ScholarshipApplication:", error);
    return res.status(500).json({ success: false, message: "Failed to apply for scholarship", error: error.message });
  }
};
