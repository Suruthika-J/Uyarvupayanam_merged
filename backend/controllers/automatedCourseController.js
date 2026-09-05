const College = require("../models/College");
const CollegeFetchedCourse = require("../models/CollegeFetchedCourse");
const Course = require("../models/Course");
const { fetchCoursesFromUrl, findWebsiteByName } = require("../services/courseScraperService");

/**
 * @desc    Fetch courses from college website and save to CollegeFetchedCourse
 * @route   POST /api/colleges/:id/fetch-courses
 * @access  Admin
 */
exports.fetchCollegeCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    let websiteUrl = college.website;
    
    // Auto-discovery if website is missing
    if (!websiteUrl) {
      console.log(`No website found for ${college.collegeName}, attempting auto-discovery...`);
      websiteUrl = findWebsiteByName(college.collegeName);
      
      if (websiteUrl) {
        console.log(`Discovered website for ${college.collegeName}: ${websiteUrl}`);
        college.website = websiteUrl;
        // We'll save this after the fetch attempt to ensure status is also updated
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "No website URL found for this college and auto-discovery failed. Please add a website first." 
        });
      }
    }

    // Update status to pending
    college.fetchStatus = "pending";
    await college.save();

    try {
      const courses = await fetchCoursesFromUrl(websiteUrl);

      if (courses.length === 0) {
        college.fetchStatus = "failed";
        college.fetchError = "No courses could be identified on the website.";
        await college.save();
        return res.status(200).json({ 
          success: true, 
          message: "Scraping completed but no courses were found.",
          count: 0
        });
      }

      // Save found courses to CollegeFetchedCourse
      let insertedCount = 0;
      for (const course of courses) {
        try {
          // Use findOneAndUpdate with upsert to prevent duplicates and update existing ones
          await CollegeFetchedCourse.findOneAndUpdate(
            { 
              collegeId: college._id, 
              normalizedCourseName: course.normalizedCourseName 
            },
            {
              collegeName: college.collegeName,
              courseFullName: course.courseFullName,
              stream: college.stream || "Other",
              sourceUrl: websiteUrl,
              fetchedAt: new Date(),
              isActive: true
            },
            { upsert: true, new: true }
          );
          insertedCount++;
        } catch (err) {
          // Skip duplicates if unique constraint hits (though findOneAndUpdate handles it)
          console.error(`Error saving course ${course.courseFullName}:`, err.message);
        }
      }

      // Update college status
      college.fetchStatus = "success";
      college.lastFetchedAt = new Date();
      college.totalCoursesFound = insertedCount;
      college.fetchError = "";

      // --- AUTO-MAPPING LOGIC ---
      // Try to find official Course IDs for the identified courses and update college.coursesOffered
      const allOfficialCourses = await Course.find({ status: "active" }).select("_id courseName branchCode").lean();
      const identifiedCodes = courses.map(c => c.normalizedCourseName.toLowerCase());
      const identifiedNames = courses.map(c => c.courseFullName.toLowerCase());

      const matchedCourseIds = allOfficialCourses
        .filter(oc => 
          identifiedCodes.includes((oc.branchCode || "").toLowerCase()) || 
          identifiedNames.includes(oc.courseName.toLowerCase())
        )
        .map(oc => oc._id);

      if (matchedCourseIds.length > 0) {
        // Use a Set to merge with existing and prevent duplicates
        const currentCourses = (college.coursesOffered || []).map(id => id.toString());
        const newCourses = matchedCourseIds.map(id => id.toString());
        const mergedSet = new Set([...currentCourses, ...newCourses]);
        college.coursesOffered = Array.from(mergedSet);
      }
      
      await college.save();

      res.status(200).json({
        success: true,
        message: `Successfully fetched ${insertedCount} courses and auto-mapped ${matchedCourseIds.length} verified courses.`,
        data: courses,
        mappedCount: matchedCourseIds.length
      });

    } catch (scrapeError) {
      college.fetchStatus = "failed";
      college.fetchError = scrapeError.message;
      await college.save();
      
      res.status(500).json({
        success: false,
        message: `Failed to scrape website: ${scrapeError.message}`
      });
    }

  } catch (error) {
    console.error("Fetch courses error:", error);
    res.status(500).json({ success: false, message: "Server error during course fetching", error: error.message });
  }
};

/**
 * @desc    Get fetched courses for a college
 * @route   GET /api/colleges/:id/courses
 * @access  Public/Admin
 */
exports.getFetchedCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const courses = await CollegeFetchedCourse.find({ collegeId: id }).sort({ courseFullName: 1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error("Get fetched courses error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve courses", error: error.message });
  }
};

/**
 * @desc    Sync fetched courses (optional logic to mark as active/inactive or reconcile)
 * @route   POST /api/colleges/:id/sync-courses
 * @access  Admin
 */
exports.syncCourses = async (req, res) => {
  return exports.fetchCollegeCourses(req, res);
};

/**
 * @desc    Bulk Fetch Courses for all colleges that have a website
 * @route   POST /api/colleges/bulk/fetch-all-courses
 * @access  Admin
 */
exports.bulkFetchAllCourses = async (req, res) => {
  try {
    const colleges = await College.find({});
    
    const results = {
      total: colleges.length,
      success: 0,
      failed: 0,
    };

    for (const college of colleges) {
      try {
        let websiteUrl = college.website;
        if (!websiteUrl) {
          websiteUrl = findWebsiteByName(college.collegeName);
          if (websiteUrl) {
            college.website = websiteUrl;
          } else {
            continue; 
          }
        }
        
        const courses = await fetchCoursesFromUrl(websiteUrl);
        if (courses.length > 0) {
          for (const course of courses) {
            await CollegeFetchedCourse.findOneAndUpdate(
              { collegeId: college._id, normalizedCourseName: course.normalizedCourseName },
              {
                collegeName: college.collegeName,
                courseFullName: course.courseFullName,
                stream: college.stream || "Other",
                sourceUrl: college.website,
                fetchedAt: new Date(),
                isActive: true
              },
              { upsert: true }
            );
          }
          college.fetchStatus = "success";
          college.totalCoursesFound = courses.length;
          results.success++;
        } else {
          college.fetchStatus = "failed";
          college.fetchError = "No courses found";
          results.failed++;
        }
        college.lastFetchedAt = new Date();
        await college.save();
      } catch (err) {
        college.fetchStatus = "failed";
        college.fetchError = err.message;
        await college.save();
        results.failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk fetch completed. Success: ${results.success}, Failed: ${results.failed}`,
      data: results
    });

  } catch (error) {
    console.error("Bulk fetch error:", error);
    res.status(500).json({ success: false, message: "Bulk fetch failed", error: error.message });
  }
};
