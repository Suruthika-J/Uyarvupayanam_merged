const Exam = require("../models/Exam");
const fs = require("fs");
const csv = require("csv-parser");

// @desc    Create new exam
// @route   POST /api/exams
// @access  Admin
exports.createExam = async (req, res) => {
  try {
    console.log('🔵 [Backend] POST /api/exams - Request received');
    console.log('📦 Request Body:', req.body);
    
    const { 
      name, category, level, applicableClass, examType, conductingBody, 
      eligibility, subjects, pattern, difficulty, importantDates, 
      officialWebsite, preparation, careerOptions, isActive 
    } = req.body;

    // Validation
    if (!name || !category || !level) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: "Name, Category, and Level are required" 
      });
    }

    // Create exam
    console.log('💾 Attempting to save to MongoDB...');
    const exam = await Exam.create({
      name, category, level, applicableClass, examType, conductingBody,
      eligibility, subjects, pattern, difficulty, importantDates,
      officialWebsite, preparation, careerOptions, isActive
    });

    console.log('✅ Exam saved successfully:', exam._id);
    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (error) {
    console.error('❌ [Backend] Error creating exam:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public
exports.getAllExams = async (req, res) => {
  try {
    console.log('🔵 [Backend] GET /api/exams - Fetching exams with filters:', req.query);
    const { search, category, level } = req.query;
    
    let query = {};

    // 1. Search filter
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { conductingBody: { $regex: search, $options: "i" } }
      ];
    }

    // 2. Level filter
    if (level && level !== "All Levels") {
      query.level = level;
    }

    // 3. Category filter
    if (category && category !== "All Categories") {
      query.category = category;
    }

    const exams = await Exam.find(query).sort({ createdAt: -1 });

    console.log('✅ Retrieved', exams.length, 'exams');
    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Public
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam",
      error: error.message,
    });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Admin
exports.updateExam = async (req, res) => {
  try {
    console.log('🔵 [Backend] PUT /api/exams/:id - Update request');
    console.log('📦 Request Body:', req.body);
    
    const { 
      name, category, level, applicableClass, examType, conductingBody, 
      eligibility, subjects, pattern, difficulty, importantDates, 
      officialWebsite, preparation, careerOptions, isActive 
    } = req.body;

    // Find exam
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Update fields
    if (name) exam.name = name;
    if (category) exam.category = category;
    if (level) exam.level = level;
    if (applicableClass) exam.applicableClass = applicableClass;
    if (examType) exam.examType = examType;
    if (conductingBody) exam.conductingBody = conductingBody;
    if (eligibility !== undefined) exam.eligibility = eligibility;
    if (subjects) exam.subjects = subjects;
    if (pattern !== undefined) exam.pattern = pattern;
    if (difficulty !== undefined) exam.difficulty = difficulty;
    if (importantDates !== undefined) exam.importantDates = importantDates;
    if (officialWebsite !== undefined) exam.officialWebsite = officialWebsite;
    if (preparation) exam.preparation = preparation;
    if (careerOptions) exam.careerOptions = careerOptions;
    if (isActive !== undefined) exam.isActive = isActive;

    await exam.save();

    console.log('✅ Exam updated successfully:', exam._id);
    res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      data: exam,
    });
  } catch (error) {
    console.error('❌ [Backend] Error updating exam:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update exam",
      error: error.message,
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Admin
exports.deleteExam = async (req, res) => {
  try {
    console.log('🔵 [Backend] DELETE /api/exams/:id');
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await exam.deleteOne();

    console.log('✅ Exam deleted successfully');
    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error('❌ [Backend] Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exam",
      error: error.message,
    });
  }
};

// @desc    Upload exams via CSV
// @route   POST /api/exams/upload-csv
// @access  Admin
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a CSV file" });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        let addedCount = 0;
        let duplicateCount = 0;

        for (const row of results) {
          // Normalize keys due to possible spaces or slight differences in CSV
          const name = row["Exam Name"] || row.examName || row.ExamName || row.name;
          
          if (!name) continue; // Skip empty rows

          const category = row["Category"] || row.category || "Others";
          const level = row["Level"] || row.level || "Undergraduate";
          const conductingBody = row["Conducting Body"] || row.conductingBody || "Unknown";
          const eligibility = row["Eligibility"] || row.eligibility || "";
          const pattern = row["Pattern"] || row.pattern || "";
          const importantDates = row["Important Dates"] || row.importantDates || "TBA";
          const officialWebsite = row["Official Website"] || row.officialWebsite || "";

          // Check for duplicate
          const existing = await Exam.findOne({ name });
          if (!existing) {
            await Exam.create({
              name, category, level, conductingBody, eligibility, pattern, importantDates, officialWebsite
            });
            addedCount++;
          } else {
            duplicateCount++;
          }
        }

        // Clean up file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          success: true,
          message: `CSV processing complete. Added: ${addedCount}, Duplicates skipped: ${duplicateCount}`,
          added: addedCount,
          skipped: duplicateCount,
        });
      })
      .on("error", (error) => {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: "Error parsing CSV", error: error.message });
      });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("❌ [Backend] Error uploading CSV:", error);
    res.status(500).json({ success: false, message: "Failed to process CSV file", error: error.message });
  }
};

