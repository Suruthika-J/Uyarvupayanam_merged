const mongoose = require("mongoose");
const dotenv = require("dotenv");
const College = require("./models/College");
const CollegeFetchedCourse = require("./models/CollegeFetchedCourse");
const Course = require("./models/Course");
const { fetchCoursesFromUrl, findWebsiteByName } = require("./services/courseScraperService");

dotenv.config();

/**
 * seedFetchedCourses.js
 * 
 * Automatically discovers websites and fetches courses for ALL colleges in the database.
 * Usage: node seedFetchedCourses.js
 */

async function seed() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error("ERROR: MONGO_URI not found in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Fetch all official active courses for mapping
    const allOfficialCourses = await Course.find({ status: "active" }).select("_id courseName branchCode").lean();
    console.log(`Loaded ${allOfficialCourses.length} official courses for auto-mapping.`);

    const colleges = await College.find({});
    console.log(`Found ${colleges.length} colleges to process.`);

    let successCount = 0;
    let failCount = 0;
    let mappedTotal = 0;

    const concurrencyLimit = 10;
    for (let i = 0; i < colleges.length; i += concurrencyLimit) {
        const batch = colleges.slice(i, i + concurrencyLimit);
        
        await Promise.all(batch.map(async (college, index) => {
            const currentIdx = i + index + 1;
            console.log(`[${currentIdx}/${colleges.length}] Processing: ${college.collegeName}`);

            let websiteUrl = college.website;
            if (!websiteUrl) {
                websiteUrl = findWebsiteByName(college.collegeName);
                if (websiteUrl) {
                    college.website = websiteUrl;
                } else {
                    console.log(`   - [${currentIdx}] Skipping: No website found.`);
                    failCount++;
                    return;
                }
            }

            try {
                const courses = await fetchCoursesFromUrl(websiteUrl);
                
                if (courses.length > 0) {
                    // Save to fetched courses collection
                    for (const course of courses) {
                        await CollegeFetchedCourse.findOneAndUpdate(
                            { collegeId: college._id, normalizedCourseName: course.normalizedCourseName },
                            {
                                collegeName: college.collegeName,
                                courseFullName: course.courseFullName,
                                stream: college.stream || "Other",
                                sourceUrl: websiteUrl,
                                fetchedAt: new Date(),
                                isActive: true
                            },
                            { upsert: true }
                        );
                    }

                    // Auto-mapping logic
                    const identifiedCodes = courses.map(c => c.normalizedCourseName.toLowerCase());
                    const identifiedNames = courses.map(c => c.courseFullName.toLowerCase());

                    const matchedCourseIds = allOfficialCourses
                        .filter(oc => 
                            identifiedCodes.includes((oc.branchCode || "").toLowerCase()) || 
                            identifiedNames.includes(oc.courseName.toLowerCase())
                        )
                        .map(oc => oc._id);

                    const updateData = {
                        fetchStatus: "success",
                        totalCoursesFound: courses.length,
                        lastFetchedAt: new Date(),
                        website: websiteUrl,
                        fetchError: ""
                    };

                    if (matchedCourseIds.length > 0) {
                        const currentCourses = (college.coursesOffered || []).map(id => id.toString());
                        const newCourses = matchedCourseIds.map(id => id.toString());
                        const mergedSet = new Set([...currentCourses, ...newCourses]);
                        updateData.coursesOffered = Array.from(mergedSet);
                        mappedTotal += matchedCourseIds.length;
                    }

                    await College.findByIdAndUpdate(college._id, { $set: updateData });
                    console.log(`   - [${currentIdx}] SUCCESS: ${courses.length} courses (${matchedCourseIds.length} mapped)`);
                    successCount++;
                } else {
                    await College.findByIdAndUpdate(college._id, { 
                        $set: { fetchStatus: "failed", fetchError: "No courses identified", lastFetchedAt: new Date() } 
                    });
                    failCount++;
                }
            } catch (fetchErr) {
                await College.findByIdAndUpdate(college._id, { 
                    $set: { fetchStatus: "failed", fetchError: fetchErr.message, lastFetchedAt: new Date() } 
                });
                failCount++;
            }
        }));
    }

    console.log(`\n================================`);
    console.log(`PROCESS COMPLETE`);
    console.log(`Total Colleges: ${colleges.length}`);
    console.log(`Successfully Fetched: ${successCount}`);
    console.log(`Failed/Skipped: ${failCount}`);
    console.log(`Total Local Courses Mapped: ${mappedTotal}`);
    console.log(`================================`);

  } catch (error) {
    console.error("FATAL ERROR:", error);
  } finally {
    process.exit();
  }
}

seed();
