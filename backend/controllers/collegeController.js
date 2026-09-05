const College = require("../models/College");
const Course = require("../models/Course");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");
const CollegeFetchedCourse = require("../models/CollegeFetchedCourse");
const { parseTneaPdf } = require("../utils/pdfParser");
const path = require("path");

// @desc    Create new college
// @route   POST /api/colleges
// @access  Admin
exports.createCollege = async (req, res) => {
  try {
    const { collegeName, stream, district, location, state, feesPerYear, placementPercentage, rank, accreditation, coursesOffered, website } = req.body;

    // Validation
    if (!collegeName || !stream) {
      return res.status(400).json({
        success: false,
        message: "College name and stream are required",
      });
    }

    const college = await College.create({
      collegeName,
      stream,
      district,
      location,
      state,
      feesPerYear,
      placementPercentage,
      rank,
      accreditation,
      coursesOffered,
      website,
    });

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: college,
    });
  } catch (error) {
    console.error("Create college error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create college",
      error: error.message,
    });
  }
};

// @desc    Get all colleges (with optional stream & search filters)
// @route   GET /api/colleges?stream=Engineering&search=IIT
// @access  Public
exports.getAllColleges = async (req, res) => {
  try {
    const { stream, district, search, courseId } = req.query;
    const filter = {};

    // Filter by course mapping
    if (courseId) {
      filter.coursesOffered = courseId;
    }

    const andConditions = [];

    // Filter by stream (primary stream or streamsOffered)
    if (stream && stream !== "All") {
      andConditions.push({ $or: [{ stream }, { streamsOffered: stream }] });
    }

    // Filter by district
    if (district && district !== "All") {
      filter.district = { $regex: district, $options: "i" };
    }

    // Search by college name or location
    if (search) {
      andConditions.push({
        $or: [
          { collegeName: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { district: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const colleges = await College.find(filter)
      .select("collegeName stream streamsOffered category type district location state feesPerYear rank accreditation website collegeCode fetchStatus totalCoursesFound createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error) {
    console.error("Get colleges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch colleges",
      error: error.message,
    });
  }
};

// @desc    Get single college by ID
// @route   GET /api/colleges/:id
// @access  Public
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate("coursesOffered");

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error("Get college error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch college",
      error: error.message,
    });
  }
};

// @desc    Get offered courses for a college
// @route   GET /api/colleges/:id/offered-courses
// @access  Public
exports.getOfferedCourses = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate("coursesOffered");

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const autoCourses = await CollegeFetchedCourse.find({ collegeId: college._id, isActive: true });

    res.status(200).json({
      success: true,
      college: {
        id: college._id,
        name: college.collegeName,
        location: college.location,
        district: college.district
      },
      verifiedCourses: college.coursesOffered || [],
      autoFetchedCourses: autoCourses || [],
      courses: college.coursesOffered || [] // Fallback for existing components
    });
  } catch (error) {
    console.error("Get offered courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offered courses",
      error: error.message,
    });
  }
};

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Admin
exports.updateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const allowedFields = [
      "collegeName",
      "stream",
      "district",
      "location",
      "state",
      "feesPerYear",
      "placementPercentage",
      "rank",
      "accreditation",
      "coursesOffered",
      "website"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        college[field] = req.body[field];
      }
    });

    await college.save();

    res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: college,
    });
  } catch (error) {
    console.error("Update college error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update college",
      error: error.message,
    });
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Admin
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    await college.deleteOne();

    res.status(200).json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error) {
    console.error("Delete college error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete college",
      error: error.message,
    });
  }
};

// @desc    Bulk insert colleges (placeholder for PDF data import)
// @route   POST /api/colleges/bulk
// @access  Admin
exports.bulkInsertColleges = async (req, res) => {
  try {
    const { colleges } = req.body;

    if (!Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide an array of colleges in the request body",
      });
    }

    const result = await College.insertMany(colleges, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${result.length} colleges inserted successfully`,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Bulk insert error:", error);

    // insertMany with ordered:false continues on error — report partial success
    if (error.insertedDocs && error.insertedDocs.length > 0) {
      return res.status(207).json({
        success: false,
        message: `Partial insert: ${error.insertedDocs.length} succeeded, some failed`,
        insertedCount: error.insertedDocs.length,
        errors: error.writeErrors?.map((e) => e.errmsg),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to bulk insert colleges",
      error: error.message,
    });
  }
};

// @desc    Import colleges and courses from TNEA PDF
// @route   POST /api/colleges/import-courses-from-pdf
// @access  Admin
exports.importCoursesFromPdf = async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, "../tnea_collegeandtheircourses.pdf");
    
    console.log("Starting PDF extraction from:", pdfPath);
    const extractedData = await parseTneaPdf(pdfPath);
    console.log(`Extracted ${extractedData.length} colleges from PDF.`);

    let updatedCount = 0;
    let newCount = 0;
    const processedCollegeIds = [];
    const batchId = `TNEA-PDF-${Date.now()}`;

    for (const collegeData of extractedData) {
      const { collegeName, collegeCode, district, courses } = collegeData;

      // 1. Process Courses first to get their IDs
      const courseIds = [];
      for (const c of courses) {
        let course = await Course.findOne({ 
          courseName: new RegExp(`^${c.full}$`, 'i') 
        });
        
        if (!course) {
          course = await Course.create({
            courseName: c.full,
            branchCode: c.short, // Now storing the actual TNEA code (e.g. ME, CS)
            level: "after12th",
            category: "Engineering",
            duration: "4 Years",
            eligibility: "12th Standard with Physics, Chemistry, and Mathematics",
            shortDescription: `Bachelor of Engineering in ${c.full}`,
            isImported: true
          });
        } else if (!course.branchCode) {
           // Update code if missing
           course.branchCode = c.short;
           await course.save();
        }
        courseIds.push(course._id);
      }

      // 2. Find or Create College
      let college = await College.findOne({ 
        $or: [
          { collegeCode: collegeCode },
          { collegeName: collegeName }
        ]
      });

      if (college) {
        // Update existing college
        college.collegeCode = collegeCode;
        if (district && !college.district) college.district = district;
        
        // Add new courses without duplicates
        const currentCourseIds = college.coursesOffered.map(id => id.toString());
        courseIds.forEach(id => {
          if (!currentCourseIds.includes(id.toString())) {
            college.coursesOffered.push(id);
          }
        });
        
        await college.save();
        
        // 2.5 Sync with CollegeCourseMapping table
        for (const cId of courseIds) {
          await CollegeCourseMapping.findOneAndUpdate(
            { collegeId: college._id, courseId: cId },
            { 
              source: "Import", 
              sourceFileName: "tnea_collegeandtheircourses.pdf",
              importBatchId: batchId,
              isVerified: true, // Mark as verified since it's from official PDF
              isActive: true 
            },
            { upsert: true }
          );
        }

        processedCollegeIds.push(college._id);
        updatedCount++;
      } else {
        // Create new college
        const newCollege = await College.create({
          collegeName,
          collegeCode,
          district,
          stream: "Engineering",
          category: "Engineering",
          type: "Engineering College",
          coursesOffered: courseIds,
          location: district,
          state: "Tamil Nadu"
        });

        // Sync with CollegeCourseMapping table
        for (const cId of courseIds) {
          await CollegeCourseMapping.create({
            collegeId: newCollege._id,
            courseId: cId,
            source: "Import",
            sourceFileName: "tnea_collegeandtheircourses.pdf",
            importBatchId: batchId,
            isVerified: true,
            isActive: true
          });
        }

        processedCollegeIds.push(newCollege._id);
        newCount++;
      }
    }

    // 3. Remove colleges NOT in PDF (only for Engineering stream)
    console.log("Cleaning up outdated Engineering colleges...");
    const deleteResult = await College.deleteMany({
      stream: "Engineering",
      _id: { $nin: processedCollegeIds }
    });
    console.log(`Removed ${deleteResult.deletedCount} outdated colleges.`);

    res.status(200).json({
      success: true,
      message: "PDF import completed successfully",
      stats: {
        totalCollegesParsed: extractedData.length,
        updatedColleges: updatedCount,
        newCollegesCreated: newCount,
        removedColleges: deleteResult.deletedCount
      }
    });

  } catch (error) {
    console.error("PDF Import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import courses from PDF",
      error: error.message
    });
  }
};
