const College = require("../models/College");
const Course = require("../models/Course");
const Cutoff = require("../models/Cutoff");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");
const axios = require("axios");

// Helper: Normalize College Name for matching
const normalizeCollegeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\(autonomous\)/g, "")
    .replace(/autonomous/g, "")
    .replace(/\(a\)/g, "")
    .replace(/[.,]/g, "")
    .trim();
};

// Helper: Normalize Course Name for STIRCT matching
const normalizeCourseName = (name) => {
  if (!name) return "";
  let n = name.toLowerCase().trim();
  
  // 1. Strip degree prefixes to get the "Core Name"
  const degreeRegex = /^(b\.?e\.?|b\.?tech\.?|b\.?sc\.?|b\.?a\.?|b\.?com\.?|m\.?e\.?|m\.?tech\.?|m\.?sc\.?|m\.?a\.?|m\.?com\.?|ph\.?d\.?|diploma in)\s+/i;
  n = n.replace(degreeRegex, "");

  // 2. Clean up punctuation and spacing
  n = n.replace(/\s+/g, " ").replace(/[.,]/g, "").trim();
  
  // 3. Handle common suffixes (Engg -> Engineering)
  n = n.replace(/ engg$/g, " engineering");
  n = n.replace(/ engg /g, " engineering ");

  // 4. Abbreviation mapping
  const abbrev = {
    "cse": "computer science and engineering",
    "ece": "electronics and communication engineering",
    "eee": "electrical and electronics engineering",
    "it": "information technology",
    "me": "mechanical engineering",
    "ce": "civil engineering",
    "ai&ds": "artificial intelligence and data science",
    "aids": "artificial intelligence and data science",
    "ads": "artificial intelligence and data science",
    "cst": "computer science and technology",
    "iot": "internet of things",
    "aiml": "artificial intelligence and machine learning",
    "cyber security": "computer science and engineering (cyber security)",
    "csbs": "computer science and business systems",
    "bt": "biotechnology",
    "ft": "food technology",
    "ag": "agriculture engineering",
    "pct": "petrochemical technology",
    "chemical": "chemical engineering",
    "bme": "bio medical engineering",
    "pharma": "pharmaceutical technology"
  };

  if (abbrev[n]) {
    n = abbrev[n];
  } else {
    // Check if it's "cse (something)" -> "computer science and engineering (something)"
    for (const key of Object.keys(abbrev)) {
      if (n.startsWith(key + " ")) {
        n = n.replace(key, abbrev[key]);
        break;
      }
    }
  }

  return n;
};


// @desc    Bulk Auto-Map Courses to Colleges from Import Data
// @route   POST /api/college-courses/bulk-map
// @access  Admin
exports.bulkAutoMap = async (req, res) => {
  try {
    const { mappingData, sourceName, overwriteMode } = req.body; // Array of { collegeName, courseName }
    
    if (!mappingData || !Array.isArray(mappingData)) {
      return res.status(400).json({ success: false, message: "Invalid mapping data" });
    }

    const batchId = `BATCH-${Date.now()}`;
    const stats = {
      totalRows: mappingData.length,
      matchedColleges: 0,
      matchedCourses: 0,
      mappingsCreated: 0,
      duplicatesSkipped: 0,
      unmatchedColleges: [],
      unmatchedCourses: []
    };

    // 1. Fetch all colleges and courses for rapid local matching
    const [allColleges, allCourses] = await Promise.all([
      College.find({}).lean(),
      Course.find({}).lean()
    ]);

    // 2. Prepare normalized lookup maps
    const collegeMap = {};
    allColleges.forEach(c => {
      const norm = normalizeCollegeName(c.collegeName);
      if (!collegeMap[norm]) collegeMap[norm] = c._id;
    });

    const courseMap = {};
    allCourses.forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      if (!courseMap[norm]) courseMap[norm] = c._id;
    });

    const targetColleges = new Set();
    const createdMappings = [];

    // 3. Identify which colleges we are touching
    for (const row of mappingData) {
      const normColl = normalizeCollegeName(row.collegeName);
      const cId = collegeMap[normColl];
      if (cId) targetColleges.add(cId.toString());
    }

    // 4. Overwrite Mode: Wipe existing mappings for these colleges before rebuild
    if (overwriteMode) {
      const targetIds = Array.from(targetColleges);
      await Promise.all([
        CollegeCourseMapping.deleteMany({ collegeId: { $in: targetIds } }),
        College.updateMany({ _id: { $in: targetIds } }, { $set: { coursesOffered: [] } })
      ]);
    }

    // 5. Process mappings
    for (const row of mappingData) {
      const normColl = normalizeCollegeName(row.collegeName);
      const normCour = normalizeCourseName(row.courseName);

      const collegeId = collegeMap[normColl];
      const courseId = courseMap[normCour];

      if (!collegeId) {
        if (!stats.unmatchedColleges.includes(row.collegeName)) {
          stats.unmatchedColleges.push(row.collegeName);
        }
        continue;
      }
      stats.matchedColleges++;

      if (!courseId) {
        if (!stats.unmatchedCourses.includes(row.courseName)) {
          stats.unmatchedCourses.push(row.courseName);
        }
        continue;
      }
      stats.matchedCourses++;

      // Create mapping in dedicated table
      try {
        await CollegeCourseMapping.findOneAndUpdate(
          { collegeId, courseId },
          { 
            source: "Import", 
            importBatchId: batchId, 
            sourceFileName: sourceName || "Bulk Paste",
            isActive: true 
          },
          { upsert: true, new: true }
        );
        
        createdMappings.push({ collegeId, courseId });
        stats.mappingsCreated++;
      } catch (err) {
        if (err.code === 11000) stats.duplicatesSkipped++;
      }
    }

    // 6. Sync results back to College.coursesOffered
    const collegeGrouped = {};
    createdMappings.forEach(m => {
      const cid = m.collegeId.toString();
      if (!collegeGrouped[cid]) collegeGrouped[cid] = new Set();
      collegeGrouped[cid].add(m.courseId.toString());
    });

    const bulkOps = Object.keys(collegeGrouped).map(cId => ({
      updateOne: {
        filter: { _id: cId },
        update: { $set: { coursesOffered: Array.from(collegeGrouped[cId]) } } // Use $set because we overwrote or filtered duplicates
      }
    }));

    if (bulkOps.length > 0) {
      await College.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      message: `Bulk mapping completed: ${stats.mappingsCreated} records synchronized.`,
      stats
    });

  } catch (error) {
    console.error("Bulk map error:", error);
    res.status(500).json({ success: false, message: "Bulk mapping failed", error: error.message });
  }
};

// @desc    Save/Update mapping between college and courses (Single College)
// @route   POST /api/college-courses
// @access  Admin
exports.saveMapping = async (req, res) => {
  try {
    const { collegeId, streamsOffered, coursesOffered } = req.body;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: "College ID is required" });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    if (streamsOffered !== undefined) college.streamsOffered = streamsOffered;
    
    if (coursesOffered !== undefined) {
      const uniqueCourseIds = [...new Set(coursesOffered)];
      college.coursesOffered = uniqueCourseIds;
      
      // Sync dedicated Mapping table - remove old manual/import ones and set new verified ones
      await CollegeCourseMapping.deleteMany({ collegeId });
      const mappingOps = uniqueCourseIds.map(cId => ({
        collegeId,
        courseId: cId,
        source: "Manual Verification",
        isVerified: true
      }));
      if (mappingOps.length > 0) await CollegeCourseMapping.insertMany(mappingOps);
    }

    await college.save();

    res.status(200).json({
      success: true,
      message: "Actual mapping verified and saved successfully",
      data: college
    });
  } catch (error) {
    console.error("Save mapping error:", error);
    res.status(500).json({ success: false, message: "Failed to save mapping", error: error.message });
  }
};

// @desc    Get college-course mappings
exports.getMappings = async (req, res) => {
  try {
    const { stream, collegeId } = req.query;
    const filter = {};

    if (collegeId) {
      filter._id = collegeId;
    }

    if (stream && stream !== "All") {
      filter.streamsOffered = stream;
    }

    const colleges = await College.find(filter)
      .populate("coursesOffered")
      .sort({ collegeName: 1 });

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error("Get mappings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mappings", error: error.message });
  }
};


// @desc    Scan College Website for course keywords
// @route   POST /api/college-courses/scan-website
// @access  Admin
exports.scanWebsite = async (req, res) => {
  try {
    const { collegeId, websiteUrl } = req.body;
    
    if (!collegeId || !websiteUrl) {
      return res.status(400).json({ success: false, message: "College ID and Website URL are required" });
    }

    // 1. Fetch website content
    let html = "";
    try {
      const response = await axios.get(websiteUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      html = response.data;
    } catch (err) {
      console.error("Scrape error:", err.message);
      return res.status(400).json({ success: false, message: `Could not access website: ${err.message}` });
    }

    // 2. Clean HTML to plain text
    const textContent = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();

    // 3. Fetch all courses and match keywords
    const allCourses = await Course.find({}).lean();
    const foundCourses = [];

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (const course of allCourses) {
      // Get the pure base name without degrees
      let name = course.courseName.toLowerCase();
      const degreeRegex = /^(b\.?e\.?|b\.?tech\.?|b\.?sc\.?|b\.?a\.?|b\.?com\.?|m\.?e\.?|m\.?tech\.?|m\.?sc\.?|m\.?a\.?|m\.?com\.?|ph\.?d\.?|diploma in)\s+/i;
      name = name.replace(degreeRegex, "").replace(/\s+/g, " ").replace(/[.,]/g, "").trim();

      // Look for full course name strictly with word boundaries
      const exactMatchRegex = new RegExp(`\\b${escapeRegExp(name)}\\b`);
      if (exactMatchRegex.test(textContent)) {
        foundCourses.push(course._id);
        continue;
      }
      
      // Look for shortcodes strictly
      const abbrevMap = {
        "cse": "computer science and engineering",
        "ece": "electronics and communication engineering",
        "eee": "electrical and electronics engineering",
        "it": "information technology",
        "me": "mechanical engineering",
        "ce": "civil engineering",
        "ai&ds": "artificial intelligence and data science",
        "cst": "computer science and technology",
        "iot": "internet of things",
        "csbs": "computer science and business systems"
      };

      const abbrevs = Object.keys(abbrevMap);
      for (const ab of abbrevs) {
        if (name === abbrevMap[ab] || name.includes(ab)) {
          const abRegex = new RegExp(`\\b${escapeRegExp(ab)}\\b`, 'i');
          if (abRegex.test(textContent)) {
            // We found the abbreviation on the site. But we don't know EXACTLY which course it is
            // if there are similar ones. To be safe, we only add it if it's the strict 'normal' one,
            // avoiding 'sandwich' or 'specialization' variants if only the abbrev was found.
            if (!name.includes("sandwich") && !name.includes("specialization") && !name.includes("(")) {
              foundCourses.push(course._id);
            }
            break;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Scanning complete. Found ${foundCourses.length} potential course matches on the website.`,
      foundCourseIds: Array.from(new Set(foundCourses.map(id => id.toString())))
    });

  } catch (error) {
    console.error("Scan website error:", error);
    res.status(500).json({ success: false, message: "Scanning failed", error: error.message });
  }
};

// @desc    Get REAL mappings for a college based on actual dataset/imports
// @route   GET /api/college-courses/suggested/:collegeId
// @access  Admin
exports.getSuggestedMappings = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const college = await College.findById(collegeId);
    
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    // 1. Get Actual Mappings from dedicated table
    const actualMappings = await CollegeCourseMapping.find({ collegeId }).lean();
    const mappedCourseIds = actualMappings
      .filter(m => m.courseId)
      .map(m => m.courseId.toString());

    // 2. Fallback logic: identify likely course categories
    const stream = (college.stream || "").toLowerCase();
    const streamsOffered = (college.streamsOffered || []).map(s => s.toLowerCase());
    const allStreamInfo = [stream, ...streamsOffered, (college.category || "").toLowerCase()].join(" ");

    let relevantCategories = [];
    if (allStreamInfo.includes("engineering")) relevantCategories.push("Engineering", "Architecture", "Design");
    if (allStreamInfo.includes("medical") || allStreamInfo.includes("nursing") || allStreamInfo.includes("pharmacy")) relevantCategories.push("Medical");
    if (allStreamInfo.includes("arts") || allStreamInfo.includes("science") || allStreamInfo.includes("commerce")) relevantCategories.push("Arts", "Science", "Commerce", "Management", "IT & Computer", "Media & Journalism", "Hotel Management");
    if (allStreamInfo.includes("law")) relevantCategories.push("Law");
    if (allStreamInfo.includes("polytechnic") || allStreamInfo.includes("diploma")) relevantCategories.push("Polytechnic");
    if (allStreamInfo.includes("iti")) relevantCategories.push("ITI");
    if (allStreamInfo.includes("agriculture")) relevantCategories.push("Agriculture");

    relevantCategories = [...new Set(relevantCategories)];

    // 3. Get Cutoff matches
    const cutoffRecords = await Cutoff.find({ collegeId }).select('courseId').lean();
    const cutoffCourseIds = cutoffRecords.map(cr => cr.courseId.toString());

    // 4. Fetch the union of all candidate courses
    const oldCollegeCourseIds = (college.coursesOffered || []).map(id => id.toString());
    const coursesToConsider = await Course.find({
      $or: [
        { category: { $in: relevantCategories } },
        { _id: { $in: [...cutoffCourseIds, ...mappedCourseIds, ...oldCollegeCourseIds] } }
      ]
    }).lean();

    // To identify similar matches, collect exact names of mapped courses
    const exactMappedNames = coursesToConsider
      .filter(c => mappedCourseIds.includes(c._id.toString()) || oldCollegeCourseIds.includes(c._id.toString()))
      .map(c => normalizeCourseName(c.courseName));

    // 5. Build response
    const result = coursesToConsider.map(course => {
      const courseIdStr = course._id.toString();
      const actualMapping = actualMappings.find(m => m.courseId && m.courseId.toString() === courseIdStr);
      const isMappedInColl = (college.coursesOffered || []).map(id=>id.toString()).includes(courseIdStr);
      const isMapped = !!actualMapping || isMappedInColl;
      const inCutoff = cutoffCourseIds.includes(courseIdStr);
      
      let source = "stream_suggest";
      let checked = false;

      if (actualMapping) {
        source = actualMapping.source === "Manual Verification" ? "verified_mapping" : "imported_data";
        checked = true; // ✅ Only trust manually verified or imported records
      } else if (inCutoff) {
        source = "cutoff_data";
        checked = true; // ✅ TNEA cutoff = official data, 100% reliable
      } else {
        // isMappedInColl = old College.coursesOffered field — UNRELIABLE (may have old stream-based guesses)
        // Check if it's a "Similar Variant" of a cutoff-matched or imported course
        const normName = normalizeCourseName(course.courseName);
        const isSimilar = exactMappedNames.some(exact =>
          (normName.includes(exact) || exact.includes(normName)) && normName !== exact
        );

        if (isMappedInColl && !isSimilar) {
          source = "existing_mapping";
          checked = true; // ✅ Mapped in college collection, trust it
        } else if (isSimilar) {
          source = "similar_match";
          checked = false; // ❌ Similar variant — admin must manually verify
        } else {
          source = "stream_suggest";
          checked = false; // ❌ Stream guess — never auto-tick
        }
      }

      return {
        _id: course._id,
        courseId: course._id,
        courseName: course.courseName,
        category: course.category,
        duration: course.duration,
        level: course.level,
        checked: checked,
        source: source
      };
    });

    result.sort((a, b) => {
      const order = { "verified_mapping": 1, "imported_data": 2, "existing_mapping": 3, "cutoff_data": 4, "similar_match": 5, "stream_suggest": 6 };
      return (order[a.source] || 7) - (order[b.source] || 7);
    });

    res.status(200).json({
      success: true,
      data: result,
      college: {
        collegeName: college.collegeName,
        stream: college.stream,
        website: college.website,
        id: college._id
      }
    });
  } catch (error) {
    console.error("Get suggested mappings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch actual mappings", error: error.message });
  }
};

// @desc    Global Mapping Cleanup (Deduplication)
// @route   POST /api/college-courses/deduplicate
// @access  Admin
exports.deduplicateMappings = async (req, res) => {
  try {
    const [colleges, allCourses] = await Promise.all([
      College.find({}),
      Course.find({})
    ]);

    const courseLookup = {};
    allCourses.forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      if (!courseLookup[norm]) courseLookup[norm] = c._id;
    });

    let totalFixed = 0;
    const stats = [];

    for (const college of colleges) {
      if (!college.coursesOffered || college.coursesOffered.length === 0) continue;

      const currentIds = college.coursesOffered.map(id => id.toString());
      const cleanedSet = new Set();
      let changed = false;

      for (const id of currentIds) {
        const courseObj = allCourses.find(c => c._id.toString() === id);
        if (!courseObj) continue;

        const bestId = courseLookup[normalizeCourseName(courseObj.courseName)];
        if (bestId) {
          cleanedSet.add(bestId.toString());
          if (bestId.toString() !== id) changed = true;
        }
      }

      if (cleanedSet.size !== currentIds.length) changed = true;

      if (changed) {
        college.coursesOffered = Array.from(cleanedSet);
        await college.save();
        totalFixed++;
        stats.push({ name: college.collegeName, count: cleanedSet.size });
      }
    }

    res.status(200).json({
      success: true,
      message: `Global cleanup complete. Deduplicated ${totalFixed} colleges.`,
      stats: stats
    });
  } catch (error) {
    console.error("Deduplication error:", error);
    res.status(500).json({ success: false, message: "Cleanup failed", error: error.message });
  }
};

// @desc    Import/Sync Diploma Course Offered mappings from Excel file
// @route   POST /api/college-courses/import-diploma
// @access  Admin
exports.importDiplomaRoute = async (req, res) => {
  try {
    const { importDiplomaCSV } = require("../utils/diplomaImporter");
    const result = await importDiplomaCSV(true); // Force run from API trigger
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Diploma Course Offered Mapping synchronization complete.",
        stats: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Diploma synchronization failed.",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Import diploma mapping route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger diploma mapping import.",
      error: error.message
    });
  }
};

// @desc    Import Arts & Science colleges and courses from Excel
// @route   POST /api/college-courses/import-arts-science
// @access  Admin
exports.importArtsScienceRoute = async (req, res) => {
  try {
    const { importArtsScienceExcel } = require("../utils/artsScienceImporter");
    const result = await importArtsScienceExcel(true);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Arts & Science College-Course Mapping synchronization complete.",
        stats: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Arts & Science synchronization failed.",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Import Arts & Science mapping route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger Arts & Science mapping import.",
      error: error.message
    });
  }
};

// @desc    Trigger Medical College-Course Mapping import
// @route   POST /api/college-courses/import-medical
// @access  Admin
exports.importMedicalRoute = async (req, res) => {
  try {
    const { importMedicalExcel } = require("../utils/medicalImporter");
    const result = await importMedicalExcel(true);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Medical College-Course Mapping synchronization complete.",
        stats: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Medical synchronization failed.",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Import Medical mapping route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger Medical mapping import.",
      error: error.message
    });
  }
};

// @desc    Trigger Siddha Medical College-Course Mapping import
// @route   POST /api/college-courses/import-siddha
// @access  Admin
exports.importSiddhaRoute = async (req, res) => {
  try {
    const { importSiddhaExcel } = require("../utils/siddhaImporter");
    const result = await importSiddhaExcel(true);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Siddha Medical College-Course Mapping synchronization complete.",
        stats: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Siddha synchronization failed.",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Import Siddha mapping route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger Siddha mapping import.",
      error: error.message
    });
  }
};

// @desc    Trigger Ayurveda Medical College-Course Mapping import
// @route   POST /api/college-courses/import-ayurveda
// @access  Admin
exports.importAyurvedaRoute = async (req, res) => {
  try {
    const { importAyurvedaExcel } = require("../utils/ayurvedaImporter");
    const result = await importAyurvedaExcel(true);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Ayurveda Medical College-Course Mapping synchronization complete.",
        stats: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Ayurveda synchronization failed.",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Import Ayurveda mapping route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger Ayurveda mapping import.",
      error: error.message
    });
  }
};

