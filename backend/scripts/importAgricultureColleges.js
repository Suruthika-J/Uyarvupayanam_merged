const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const excelPath = path.resolve(__dirname, '../uploads/Agriculture Collge Offered Courses.xlsx');

// Robust normalization for course names to avoid duplicates
const normalizeForMatch = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\./g, "")      // remove dots
    .replace(/\s+/g, "")     // remove all spaces
    .replace(/,/g, "")       // remove commas
    .replace(/[\(\)]/g, "")  // remove parentheses
    .replace(/-/g, "")       // remove hyphens
    .trim();
};

// College name normalization for matching
const normalizeCollegeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\(autonomous\)/g, "")
    .replace(/autonomous/g, "")
    .replace(/\(a\)/g, "")
    .replace(/[.,]/g, "")
    .replace(/and research institute/gi, "")
    .replace(/research institute/gi, "")
    .replace(/research foundation/gi, "")
    .replace(/and technology/gi, "")
    .replace(/technology/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Generic names that cannot be matched by name alone
const genericNames = [
  'agricultural college', 
  'horticultural college', 
  'agricultural engineering college', 
  'community science college', 
  'institute of agriculture', 
  'forest college'
];

async function runImport() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ ERROR: MONGO_URI not found in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Load workbook
  console.log(`Reading Excel file from: ${excelPath}`);
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`📊 Loaded Excel with ${rows.length} rows.`);

  const summary = {
    totalRows: rows.length,
    processedRows: 0,
    collegesCreated: 0,
    collegesUpdated: 0,
    coursesCreated: 0,
    coursesReused: 0,
    mappingsCreated: 0,
    mappingsUpdated: 0,
    skippedDuplicates: 0,
    errors: []
  };

  // Cache existing data for fast local lookups
  const allCourses = await Course.find({});
  const allColleges = await College.find({});

  // To skip duplicates from the Excel file
  const seenExcelRows = new Set();

  // Accumulator for college-course offerings to update at the end
  const collegeCoursesToSync = {}; // { collegeId: Set of courseIdStrings }

  // Start Mongoose Transaction
  const session = await mongoose.startSession();
  console.log("🚀 Starting import transaction...");
  
  try {
    await session.withTransaction(async () => {
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const rawCollegeName = row['College Name'];
        const rawCourseName = row['Course Name'];

        if (!rawCollegeName || !rawCourseName) {
          continue;
        }

        const collegeName = rawCollegeName.trim();
        const courseName = rawCourseName.trim();
        const rowKey = `${collegeName.toLowerCase()}||${courseName.toLowerCase()}`;

        // 1. Ignore duplicate rows from Excel
        if (seenExcelRows.has(rowKey)) {
          summary.skippedDuplicates++;
          continue;
        }
        seenExcelRows.add(rowKey);
        summary.processedRows++;

        // 2. Find or Create Course
        const normCourseName = normalizeForMatch(courseName);
        let course = allCourses.find(c => normalizeForMatch(c.courseName) === normCourseName);

        if (course) {
          summary.coursesReused++;
        } else {
          // Determine level
          const rawLevel = row['Course Level'] || '';
          const level = rawLevel.toLowerCase().includes('diploma') ? 'diploma' : 'after12th';

          // Determine category
          const category = (courseName.toLowerCase().includes('engineering') || courseName.toLowerCase().includes('b.tech'))
            ? 'Engineering'
            : 'Agriculture';

          // Create new course
          course = new Course({
            courseName: courseName,
            level: level,
            category: category,
            duration: row['Duration'] || '4 Years',
            eligibility: row['Eligibility'] || '12th Pass',
            shortDescription: `${courseName} program offered by agriculture colleges.`,
            status: 'active',
            isPublished: true,
            isImported: true,
            sourceName: 'Excel Import',
            verified: true,
            source: 'Excel Import'
          });

          await course.save({ session });
          allCourses.push(course); // Update local cache
          summary.coursesCreated++;
          console.log(`🆕 Created Course: "${courseName}"`);
        }

        // 3. Find or Create College
        const normExcelCollege = normalizeCollegeName(collegeName);
        const excelDistrict = row['District'];

        // Intelligent college match
        let college = allColleges.find(c => normalizeCollegeName(c.collegeName) === normExcelCollege);

        if (!college) {
          // First-part match with validation
          const firstPartExcel = normalizeCollegeName(collegeName.split(',')[0]);
          college = allColleges.find(c => {
            const partsDb = c.collegeName.split(',');
            const firstPartDb = normalizeCollegeName(partsDb[0]);
            if (firstPartDb.length < 10) return false;
            
            if (firstPartDb === firstPartExcel) {
              // If specific (non-generic), match directly
              if (!genericNames.includes(firstPartDb)) {
                return true;
              }

              // If generic, validate city suffix
              if (partsDb.length > 1) {
                const cityDb = partsDb[partsDb.length - 1].trim().toLowerCase();
                if (collegeName.toLowerCase().includes(cityDb)) {
                  return true;
                }
              }
              
              // Validate district
              if (excelDistrict && c.district) {
                const distExcel = excelDistrict.trim().toLowerCase();
                const distDb = c.district.trim().toLowerCase();
                const isTrichyMatch = (distExcel.includes('trichy') || distExcel.includes('tiruchirap')) && 
                                      (distDb.includes('trichy') || distDb.includes('tiruchirap'));
                if (distExcel === distDb || isTrichyMatch) {
                  return true;
                }
              }
            }
            return false;
          });
        }

        if (!college) {
          // Substring match
          college = allColleges.find(c => {
            const normDb = normalizeCollegeName(c.collegeName);
            if (normDb.length < 15) return false;
            if (excelDistrict && c.district) {
              const distExcel = excelDistrict.trim().toLowerCase();
              const distDb = c.district.trim().toLowerCase();
              if (distExcel !== distDb && !(distExcel.includes('trichy') && distDb.includes('tiruchirap'))) {
                return false;
              }
            }
            return normDb.includes(normExcelCollege) || normExcelCollege.includes(normDb);
          });
        }

        if (college) {
          // Update existing college fields
          let updated = false;

          if (!college.streamsOffered.includes("Agriculture")) {
            college.streamsOffered.push("Agriculture");
            updated = true;
          }

          if (!college.stream) {
            college.stream = "Agriculture";
            updated = true;
          }

          const website = row['Official Website'] ? row['Official Website'].trim() : "";
          if (website && !college.website) {
            college.website = website;
            updated = true;
          }

          const district = row['District'] ? row['District'].trim() : "";
          if (district && !college.district) {
            college.district = district;
            updated = true;
          }

          const collegeType = row['College Type'] ? row['College Type'].trim() : "";
          if (collegeType && !college.collegeType) {
            college.collegeType = collegeType;
            updated = true;
          }

          const affiliation = row['University / Affiliation'] ? row['University / Affiliation'].trim() : "";
          if (affiliation && !college.universityAffiliation) {
            college.universityAffiliation = affiliation;
            updated = true;
          }

          const hostel = row['Hostel'] ? row['Hostel'].trim() : "";
          if (hostel && !college.hostel) {
            college.hostel = hostel;
            updated = true;
          }

          if (updated) {
            await college.save({ session });
            summary.collegesUpdated++;
          }
        } else {
          // Create new college
          const collegeType = row['College Type'] ? row['College Type'].trim() : "";
          let category = "Private";
          if (collegeType.toLowerCase() === 'govt' || collegeType.toLowerCase() === 'government') {
            category = "Government";
          }

          college = new College({
            collegeName: collegeName,
            stream: "Agriculture",
            streamsOffered: ["Agriculture"],
            district: row['District'] ? row['District'].trim() : "",
            location: row['District'] ? row['District'].trim() : "",
            state: "Tamil Nadu",
            category: category,
            type: collegeType,
            collegeType: collegeType,
            universityAffiliation: row['University / Affiliation'] ? row['University / Affiliation'].trim() : "",
            hostel: row['Hostel'] ? row['Hostel'].trim() : "",
            website: row['Official Website'] ? row['Official Website'].trim() : "",
            coursesOffered: []
          });

          await college.save({ session });
          allColleges.push(college); // Update cache
          summary.collegesCreated++;
          console.log(`🆕 Created College: "${collegeName}"`);
        }

        // 4. Map College to Course
        const collegeIdStr = college._id.toString();
        const courseIdStr = course._id.toString();

        if (!collegeCoursesToSync[collegeIdStr]) {
          collegeCoursesToSync[collegeIdStr] = new Set((college.coursesOffered || []).map(id => id.toString()));
        }
        collegeCoursesToSync[collegeIdStr].add(courseIdStr);

        // Check if mapping exists in CollegeCourseMapping collection
        let mapping = await CollegeCourseMapping.findOne({
          collegeId: college._id,
          courseId: course._id
        }).session(session);

         if (mapping) {
          mapping.source = "Excel Import";
          mapping.sourceFileName = "Agriculture Collge Offered Courses.xlsx";
          mapping.isVerified = true;
          mapping.isActive = true;
          
          // Populate metadata fields
          mapping.collegeName = college.collegeName;
          mapping.courseName = course.courseName;
          mapping.degree = row['Degree'] ? row['Degree'].trim() : "";
          mapping.courseLevel = row['Course Level'] ? row['Course Level'].trim() : "";
          mapping.specialization = row['Specialization'] ? row['Specialization'].trim() : "";
          mapping.duration = row['Duration'] ? row['Duration'].trim() : "";
          mapping.eligibility = row['Eligibility'] ? row['Eligibility'].trim() : "";
          mapping.admissionMode = row['Admission Mode'] ? row['Admission Mode'].trim() : "";
          mapping.hostel = row['Hostel'] ? row['Hostel'].trim() : "";
          mapping.collegeType = row['College Type'] ? row['College Type'].trim() : "";
          mapping.universityAffiliation = row['University / Affiliation'] ? row['University / Affiliation'].trim() : "";
          mapping.stream = row['Stream'] ? row['Stream'].trim() : "Agriculture";

          await mapping.save({ session });
          summary.mappingsUpdated++;
        } else {
          mapping = new CollegeCourseMapping({
            collegeId: college._id,
            courseId: course._id,
            source: "Excel Import",
            sourceFileName: "Agriculture Collge Offered Courses.xlsx",
            isVerified: true,
            isActive: true,
            collegeName: college.collegeName,
            courseName: course.courseName,
            degree: row['Degree'] ? row['Degree'].trim() : "",
            courseLevel: row['Course Level'] ? row['Course Level'].trim() : "",
            specialization: row['Specialization'] ? row['Specialization'].trim() : "",
            duration: row['Duration'] ? row['Duration'].trim() : "",
            eligibility: row['Eligibility'] ? row['Eligibility'].trim() : "",
            admissionMode: row['Admission Mode'] ? row['Admission Mode'].trim() : "",
            hostel: row['Hostel'] ? row['Hostel'].trim() : "",
            collegeType: row['College Type'] ? row['College Type'].trim() : "",
            universityAffiliation: row['University / Affiliation'] ? row['University / Affiliation'].trim() : "",
            stream: row['Stream'] ? row['Stream'].trim() : "Agriculture"
          });
          await mapping.save({ session });
          summary.mappingsCreated++;
        }
      }

      // 5. Bulk update coursesOffered on College collections to match sync data
      console.log("🔄 Syncing coursesOffered arrays for all colleges...");
      for (const [collegeId, courseIdSet] of Object.entries(collegeCoursesToSync)) {
        const collegeObj = allColleges.find(c => c._id.toString() === collegeId);
        if (collegeObj) {
          const currentOffered = (collegeObj.coursesOffered || []).map(id => id.toString());
          const newOffered = Array.from(courseIdSet);
          
          // Check if changed
          const isSame = currentOffered.length === newOffered.length && 
                         currentOffered.every(id => newOffered.includes(id));
                         
          if (!isSame) {
            await College.updateOne(
              { _id: collegeId },
              { $set: { coursesOffered: newOffered.map(id => new mongoose.Types.ObjectId(id)) } }
            ).session(session);
          }
        }
      }
    });

    console.log("✅ Transaction committed successfully!");

    // Print import stats
    console.log("\n==============================================");
    console.log("       AGRICULTURE IMPORT SUMMARY RESULTS     ");
    console.log("==============================================");
    console.log(`Total Rows in Excel:                  ${summary.totalRows}`);
    console.log(`Unique Rows Processed:                ${summary.processedRows}`);
    console.log(`Excel Duplicate Rows Skipped:         ${summary.skippedDuplicates}`);
    console.log(`New Colleges Created:                 ${summary.collegesCreated}`);
    console.log(`Existing Colleges Updated:            ${summary.collegesUpdated}`);
    console.log(`New Courses Created:                  ${summary.coursesCreated}`);
    console.log(`Existing Courses Reused:              ${summary.coursesReused}`);
    console.log(`New Mappings Created:                 ${summary.mappingsCreated}`);
    console.log(`Existing Mappings Updated:            ${summary.mappingsUpdated}`);
    console.log("Errors:                               None");
    console.log("==============================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Import Error - Transaction rolled back!", error);
    process.exit(1);
  }
}

runImport();
