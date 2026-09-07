const Course = require("../models/Course");
const College = require("../models/College");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");
const mongoose = require("mongoose");
const { allSourceCourses, SOURCE_URL, SOURCE_NAME } = require("../data/sourceCoursesAfter12th");
const { getStudentClass, buildCourseEligibilityFilter } = require("../utils/academicEligibility");

// ─── Normalize helper for duplicate checking ──────────────────────
const normalize = (str) => String(str || "").trim().toLowerCase();

// ─── Build unique key ─────────────────────────────────────────────
const uniqueKey = (c) =>
  `${normalize(c.courseName)}|${normalize(c.category)}|${normalize(c.targetLevel)}`;

// @desc    Create new course
// @route   POST /api/courses
// @access  Admin
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error('❌ Error creating course:', error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? "Course name already exists" : "Failed to create course",
      error: error.message,
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const { level, targetLevel, category } = req.query;
    let filter = {};

    if (level) {
      const normalizedLevel = level.replace(/\s/g, '');
      const levelRegex = new RegExp(`^${normalizedLevel.split('').join('[\\s]*')}$`, "i");
      filter.$or = [
        { level: levelRegex },
        { targetLevel: levelRegex }
      ];
    }
    if (targetLevel) {
       const normalizedTargetLevel = targetLevel.replace(/\s/g, '');
       const targetLevelRegex = new RegExp(`^${normalizedTargetLevel.split('').join('[\\s]*')}$`, "i");
       if (!filter.$or) {
          filter.$or = [
            { level: targetLevelRegex },
            { targetLevel: targetLevelRegex }
          ];
       }
    }
    if (category) filter.category = new RegExp(`^${category}$`, "i");

    // Restrict to courses the authenticated school student is already
    // academically eligible for (based on their completed class).
    const studentClass = getStudentClass(req);
    const eligibilityFilter = buildCourseEligibilityFilter(studentClass);
    if (eligibilityFilter) {
      if (Object.keys(filter).length === 0) {
        filter = eligibilityFilter;
      } else {
        filter.$and = [{ ...filter }, eligibilityFilter];
        delete filter.$or;
        delete filter.category;
      }
    }

    const courses = await Course.find(filter).sort({ courseName: 1 });

    // Deduplicate by normalized course name within same category
    // (safety net against any remaining duplicate course records)
    const seen = new Set();
    const unique = [];
    for (const course of courses) {
      const normKey = (course.courseName || '')
        .toLowerCase()
        .replace(/^(part-time\s+)?diploma\s+in\s+/i, '')
        .replace(/\s*\(polytechnic\)/i, '')
        .replace(/\s*\(diploma\)/i, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const dedupeKey = `${normKey}|${course.category}`;
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        unique.push(course);
      }
    }

    res.status(200).json({
      success: true,
      count: unique.length,
      data: unique,
    });
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// @desc    Get single course by ID or Slug
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };
    
    const course = await Course.findOne(query);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: error.message,
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error('❌ Error updating course:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

// @desc    Bulk import courses from parsed text
// @route   POST /api/courses/bulk
// @access  Admin
exports.bulkImportCourses = async (req, res) => {
  try {
    const { courses } = req.body;
    
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ success: false, message: "No courses provided for import" });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    const insertedCourses = [];

    // Process sequentially to safely check duplicates based on normalized combination
    for (const data of courses) {
      const query = {
        courseName: new RegExp(`^${normalize(data.courseName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")
      };

      const existingCourse = await Course.findOne(query);

      if (!existingCourse) {
        const newCourse = new Course({
          ...data,
          isImported: true
        });
        await newCourse.save();
        insertedCourses.push(newCourse);
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete. Added ${insertedCount} new courses. Skipped ${skippedCount} duplicates.`,
      stats: { inserted: insertedCount, skipped: skippedCount },
      data: insertedCourses
    });

  } catch (error) {
    console.error('❌ Error bulk importing courses:', error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk import courses",
      error: error.message,
    });
  }
};

// ════════════════════════════════════════════════════════════════════
//  NEW: Source-based import endpoints
// ════════════════════════════════════════════════════════════════════

// @desc    Preview import from source (dry run)
// @route   POST /api/courses/preview-import
// @access  Admin
exports.previewSourceImport = async (req, res) => {
  try {
    const { categories } = req.body; // optional filter by category

    // Get source courses - optionally filtered
    let sourceCourses = [...allSourceCourses];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      sourceCourses = sourceCourses.filter(c =>
        categories.map(normalize).includes(normalize(c.category))
      );
    }

    // Get existing courses from DB for duplicate comparison
    const existingCourses = await Course.find({}, "courseName category targetLevel").lean();
    const existingKeys = new Set(existingCourses.map(c => uniqueKey(c)));

    const newCourses = [];
    const duplicateCourses = [];

    for (const course of sourceCourses) {
      const key = uniqueKey(course);
      if (existingKeys.has(key)) {
        duplicateCourses.push(course);
      } else {
        newCourses.push(course);
      }
    }

    // Group by category for display
    const categoryBreakdown = {};
    for (const c of sourceCourses) {
      if (!categoryBreakdown[c.category]) {
        categoryBreakdown[c.category] = { total: 0, new: 0, duplicate: 0 };
      }
      categoryBreakdown[c.category].total++;
    }
    for (const c of newCourses) {
      if (categoryBreakdown[c.category]) categoryBreakdown[c.category].new++;
    }
    for (const c of duplicateCourses) {
      if (categoryBreakdown[c.category]) categoryBreakdown[c.category].duplicate++;
    }

    res.status(200).json({
      success: true,
      preview: {
        sourceUrl: SOURCE_URL,
        sourceName: SOURCE_NAME,
        totalFromSource: sourceCourses.length,
        totalNew: newCourses.length,
        totalDuplicates: duplicateCourses.length,
        categoryBreakdown,
        newCourses,
        duplicateCourses: duplicateCourses.map(c => c.courseName),
      }
    });

  } catch (error) {
    console.error('❌ Error previewing source import:', error);
    res.status(500).json({
      success: false,
      message: "Failed to preview source import",
      error: error.message,
    });
  }
};

// @desc    Import courses from source (actual insert)
// @route   POST /api/courses/import-from-source
// @access  Admin
exports.importFromSource = async (req, res) => {
  try {
    const { categories, selectedCourseNames } = req.body; // optional filters

    // Get source courses
    let sourceCourses = [...allSourceCourses];

    // Filter by categories if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      sourceCourses = sourceCourses.filter(c =>
        categories.map(normalize).includes(normalize(c.category))
      );
    }

    // Filter by selected course names if provided
    if (selectedCourseNames && Array.isArray(selectedCourseNames) && selectedCourseNames.length > 0) {
      const selectedSet = new Set(selectedCourseNames.map(normalize));
      sourceCourses = sourceCourses.filter(c => selectedSet.has(normalize(c.courseName)));
    }

    // Get existing courses for duplicate check
    const existingCourses = await Course.find({}, "courseName category targetLevel").lean();
    const existingKeys = new Set(existingCourses.map(c => uniqueKey(c)));

    let insertedCount = 0;
    let skippedCount = 0;
    const insertedCourses = [];
    const skippedNames = [];

    for (const courseData of sourceCourses) {
      const key = uniqueKey(courseData);

      if (existingKeys.has(key)) {
        skippedCount++;
        skippedNames.push(courseData.courseName);
        continue;
      }

      // Also do a DB-level check on courseName to catch edge cases
      const dbCheck = await Course.findOne({
        courseName: new RegExp(`^${normalize(courseData.courseName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")
      });

      if (dbCheck) {
        skippedCount++;
        skippedNames.push(courseData.courseName);
        existingKeys.add(key);
        continue;
      }

      const newCourse = new Course({
        ...courseData,
        isImported: true,
      });
      await newCourse.save();
      insertedCourses.push(newCourse);
      insertedCount++;
      existingKeys.add(key); // prevent within-batch duplicates
    }

    res.status(200).json({
      success: true,
      message: `Source import complete. Added ${insertedCount} new courses. Skipped ${skippedCount} duplicates.`,
      stats: {
        inserted: insertedCount,
        skipped: skippedCount,
        total: sourceCourses.length,
      },
      skippedNames,
      data: insertedCourses,
    });

  } catch (error) {
    console.error('❌ Error importing from source:', error);
    res.status(500).json({
      success: false,
      message: "Failed to import from source",
      error: error.message,
    });
  }
};

// @desc    Get student course details with offering colleges
// @route   GET /api/student/courses/:courseId
// @access  Public
exports.getStudentCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Resolve courseId by ID or Slug
    const isId = mongoose.Types.ObjectId.isValid(courseId);
    const query = isId ? { _id: courseId } : { slug: courseId };

    // Find active course
    const course = await Course.findOne({ ...query, status: "active" });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or inactive",
      });
    }

    // Find all verified and active mappings for this course.
    // Also include mappings for variant course names (e.g. "B.E. Computer Science
    // And Engineering" maps to the same concept as "Computer Science and Engineering").
    // Load all active courses in this category, normalize names, find all matching variants.
    const allCatCourses = await Course.find({
      category: course.category,
      status: 'active'
    }).lean();

    const normalizeCourseName = (name) =>
      (name || '')
        .replace(/^b\.?e\.?\s*/i, '')
        .replace(/^b\.?tech\.?\s*/i, '')
        .replace(/^m\.?e\.?\s*/i, '')
        .replace(/^m\.?tech\.?\s*/i, '')
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const targetNorm = normalizeCourseName(course.courseName);
    const variantCourseIds = allCatCourses
      .filter(c => normalizeCourseName(c.courseName) === targetNorm)
      .map(c => c._id);

    const mappings = await CollegeCourseMapping.find({
      courseId: { $in: variantCourseIds },
      isVerified: true,
      isActive: true
    }).populate({
      path: "collegeId",
      select: "collegeName district collegeType type state accreditation stream placementPercentage feesPerYear rank website"
    });

    // Extract unique colleges from mappings
    const offeringCollegesMap = new Map();
    for (const mapping of mappings) {
      if (mapping.collegeId) {
        const college = mapping.collegeId;
        const cIdStr = college._id.toString();

        if (!offeringCollegesMap.has(cIdStr)) {
          offeringCollegesMap.set(cIdStr, {
            _id: college._id,
            collegeName: college.collegeName,
            district: college.district,
            collegeType: college.collegeType || college.type || "Government",
            state: college.state || "",
            accreditation: college.accreditation || "",
            stream: college.stream || "",
            placementPercentage: college.placementPercentage || 0,
            feesPerYear: college.feesPerYear || 0,
            rank: college.rank || "",
            website: college.website || ""
          });
        }
      }
    }

    const offeringColleges = Array.from(offeringCollegesMap.values());

    // Sort colleges alphabetically by name
    offeringColleges.sort((a, b) => a.collegeName.localeCompare(b.collegeName));

    res.status(200).json({
      success: true,
      course,
      collegeCount: offeringColleges.length,
      offeringColleges
    });
  } catch (error) {
    console.error("❌ Error fetching student course details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student course details",
      error: error.message
    });
  }
};
