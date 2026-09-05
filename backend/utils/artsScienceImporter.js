const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

// ── Normalization helpers ──────────────────────────────────────────

const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const normalizeCourseName = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase()
    .replace(/^(part-time\s+)?(b\.?a\.?|b\.?sc\.?|b\.?com\.?|b\.?ba\.?|b\.?ca\.?|b\.?mm\.?|b\.?voc\.?)\s+/i, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const STREAM = 'Arts & Science';
const COURSE_CATEGORY = 'Arts & Science';
const COURSE_LEVEL = 'undergraduate';
const SOURCE_FILE = 'tn-arts and science.xlsx';

// ── Main importer ──────────────────────────────────────────────────

const importArtsScienceExcel = async (forceSync = false) => {
  const startTime = Date.now();
  console.log(`[${STREAM} Import] Starting Arts & Science College-Course Mapping import...`);

  const excelPath = path.join(__dirname, '../uploads/tn-arts and science.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`[${STREAM} Import] Excel file not found at: ${excelPath}`);
    return { success: false, error: `Excel file not found at: ${excelPath}` };
  }

  // 1. File state tracking
  const stateFilePath = path.join(__dirname, '../uploads/.arts_science_excel_state.json');
  const fileStats = fs.statSync(excelPath);
  const currentMtime = fileStats.mtimeMs;
  const currentSize = fileStats.size;

  if (!forceSync && fs.existsSync(stateFilePath)) {
    try {
      const savedState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      if (savedState.mtimeMs === currentMtime && savedState.size === currentSize) {
        console.log(`[${STREAM} Import] Excel file unchanged. Skipping database synchronization.`);
        return { success: true, skipped: true, message: 'Excel file unchanged. Database synchronization skipped.' };
      }
    } catch (err) {
      console.warn(`[${STREAM} Import] Failed to read state file. Forcing run:`, err.message);
    }
  }

  // 2. Read and parse Excel
  const workbook = XLSX.readFile(excelPath);
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Find header row (S.No, College Name, Location, Course Offered)
    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
      const row = sheetData[i];
      if (Array.isArray(row) && row.some(h => String(h || '').toLowerCase().includes('college name'))) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) continue;

    // Determine college type from sheet name
    const isPrivate = sheetName.toLowerCase().includes('private');
    const collegeType = isPrivate ? 'Private' : 'Government';

    for (let i = headerIdx + 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || row.length < 3) continue;

      const sno = row[0];
      const collegeName = String(row[1] || '').trim();
      const location = String(row[2] || '').trim();
      const coursesRaw = String(row[3] || '').trim();

      if (!collegeName || isNaN(sno)) continue;

      rows.push({
        sno,
        collegeName,
        location,
        coursesRaw,
        collegeType
      });
    }
  }

  console.log(`[${STREAM} Import] Parsed ${rows.length} college rows from Excel.`);

  const report = {
    totalCollegesInExcel: rows.length,
    matchedColleges: 0,
    insertedColleges: 0,
    updatedColleges: 0,
    totalCourseMappingsCreated: 0,
    duplicateMappingsSkipped: 0,
    obsoleteMappingsRemoved: 0,
    coursesCreated: 0,
    timeTakenMs: 0
  };

  try {
    // 3. Cache all existing DB data
    const [allColleges, allCourses] = await Promise.all([
      College.find({}),
      Course.find({})
    ]);

    const collegeMapByName = new Map();
    const collegeMapByNormName = new Map();

    allColleges.forEach(c => {
      const name = c.collegeName.trim();
      collegeMapByName.set(name.toLowerCase(), c);
      collegeMapByNormName.set(normalizeCollegeName(name), c);
    });

    const courseMapByNormName = new Map();
    allCourses.filter(c => c.category === COURSE_CATEGORY).forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      if (norm) {
        const existing = courseMapByNormName.get(norm);
        if (!existing) {
          courseMapByNormName.set(norm, c);
        }
      }
    });

    const courseMapByFullName = new Map();
    allCourses.filter(c => c.category === COURSE_CATEGORY).forEach(c => {
      const fullKey = c.courseName.toLowerCase().trim();
      if (fullKey) {
        const existing = courseMapByFullName.get(fullKey);
        if (!existing) {
          courseMapByFullName.set(fullKey, c);
        }
      }
    });

    const collegeBulkOps = [];
    const mappingBulkOps = [];
    const collegesToInsert = [];

    const csvCollegeIds = new Set();
    const csvCollegeCourseMap = new Map();

    const batchId = `ARTS-SCIENCE-EXCEL-${Date.now()}`;

    // 4. Process each Excel row
    for (const row of rows) {
      const { collegeName: excelName, location: excelLocation, coursesRaw: excelCoursesRaw, collegeType: excelType } = row;

      // ── Match / Create College ──
      let college = null;
      if (collegeMapByName.has(excelName.toLowerCase())) {
        college = collegeMapByName.get(excelName.toLowerCase());
      } else {
        const norm = normalizeCollegeName(excelName);
        if (collegeMapByNormName.has(norm)) {
          college = collegeMapByNormName.get(norm);
        }
      }

      let isNewCollege = false;
      if (!college) {
        isNewCollege = true;
        const newCollegeId = new mongoose.Types.ObjectId();
        college = {
          _id: newCollegeId,
          collegeName: excelName,
          collegeCode: '',
          stream: STREAM,
          streamsOffered: [STREAM],
          coursesOffered: [],
          district: excelLocation,
          location: excelLocation,
          state: 'Tamil Nadu',
          collegeType: excelType,
          category: STREAM
        };
        collegeMapByName.set(excelName.toLowerCase(), college);
        collegeMapByNormName.set(normalizeCollegeName(excelName), college);
        collegesToInsert.push(college);
        report.insertedColleges++;
      } else {
        report.matchedColleges++;
      }

      const collegeIdStr = college._id.toString();
      csvCollegeIds.add(collegeIdStr);

      if (!csvCollegeCourseMap.has(collegeIdStr)) {
        csvCollegeCourseMap.set(collegeIdStr, new Set());
      }

      // Update college info for existing colleges
      if (!isNewCollege) {
        const updates = {};
        if (excelLocation && college.district !== excelLocation) updates.district = excelLocation;
        if (excelLocation && college.location !== excelLocation) updates.location = excelLocation;
        if (excelType && college.collegeType !== excelType) updates.collegeType = excelType;
        if (college.stream !== STREAM) updates.stream = STREAM;

        if (!college.streamsOffered || !college.streamsOffered.includes(STREAM)) {
          updates.streamsOffered = [...new Set([...(college.streamsOffered || []), STREAM])];
        }

        if (Object.keys(updates).length > 0) {
          collegeBulkOps.push({
            updateOne: {
              filter: { _id: college._id },
              update: { $set: updates }
            }
          });
          report.updatedColleges++;
        }
      }

      // ── Process Courses ──
      if (!excelCoursesRaw) continue;

      const courseNames = excelCoursesRaw
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const courseIdsForCollege = [];

      for (const rawCourseName of courseNames) {
        // Try matching by full name first
        const fullKey = rawCourseName.toLowerCase().trim();
        let matchedCourse = courseMapByFullName.get(fullKey);

        // Fallback: try core normalized name
        if (!matchedCourse) {
          const courseNorm = normalizeCourseName(rawCourseName);
          matchedCourse = courseMapByNormName.get(courseNorm);
        }

        if (!matchedCourse) {
          // Use upsert to prevent duplicates
          const courseSlug = rawCourseName
            .toLowerCase()
            .split(' ')
            .join('-')
            .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substr(2, 5);

          const upsertResult = await Course.findOneAndUpdate(
            { category: COURSE_CATEGORY, courseName: { $regex: new RegExp(`^${rawCourseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
            {
              $setOnInsert: {
                courseName: rawCourseName,
                slug: courseSlug,
                level: COURSE_LEVEL,
                category: COURSE_CATEGORY,
                duration: '3 Years',
                eligibility: '12th Pass',
                shortDescription: `${rawCourseName} – undergraduate programme.`,
                isImported: true,
                status: 'active'
              }
            },
            { upsert: true, returnDocument: 'after' }
          );

          matchedCourse = upsertResult;
          courseMapByFullName.set(fullKey, upsertResult);
          courseMapByNormName.set(normalizeCourseName(rawCourseName), upsertResult);

          // If the course was just created (new document), it won't have createdAt matching the bulk-created ones
          if (!report._seenCourseIds) report._seenCourseIds = new Set();
          if (!report._seenCourseIds.has(upsertResult._id.toString())) {
            report._seenCourseIds.add(upsertResult._id.toString());
            report.coursesCreated++;
          }
        }

        const courseIdStr = matchedCourse._id.toString();
        courseIdsForCollege.push(matchedCourse._id);
        csvCollegeCourseMap.get(collegeIdStr).add(courseIdStr);

        // Upsert mapping
        mappingBulkOps.push({
          updateOne: {
            filter: { collegeId: college._id, courseId: matchedCourse._id },
            update: {
              $set: {
                collegeId: college._id,
                courseId: matchedCourse._id,
                collegeName: college.collegeName || excelName,
                courseName: matchedCourse.courseName,
                stream: STREAM,
                source: 'Import',
                sourceFileName: SOURCE_FILE,
                importBatchId: batchId,
                isVerified: true,
                isActive: true
              }
            },
            upsert: true
          }
        });

        report.totalCourseMappingsCreated++;
      }

      // Update College.coursesOffered for new colleges
      if (isNewCollege) {
        college.coursesOffered = courseIdsForCollege.map(id => id.toString());
      }
    }

    // 5. Remove obsolete mappings for colleges in the Excel
    console.log(`[${STREAM} Import] Removing obsolete mappings...`);
    const deleteFilter = {
      collegeId: { $in: Array.from(csvCollegeIds).map(id => new mongoose.Types.ObjectId(id)) },
      stream: STREAM
    };

    const existingMappingsForExcel = await CollegeCourseMapping.find(deleteFilter);

    const obsoleteMappingIds = [];
    for (const mapping of existingMappingsForExcel) {
      const cId = mapping.collegeId.toString();
      const coId = mapping.courseId.toString();
      const allowedCourses = csvCollegeCourseMap.get(cId);
      if (allowedCourses && !allowedCourses.has(coId)) {
        obsoleteMappingIds.push(mapping._id);
      }
    }

    if (obsoleteMappingIds.length > 0) {
      await CollegeCourseMapping.deleteMany({ _id: { $in: obsoleteMappingIds } });
      report.obsoleteMappingsRemoved = obsoleteMappingIds.length;
      console.log(`[${STREAM} Import] Removed ${obsoleteMappingIds.length} obsolete mappings.`);
    }

    // 6. Execute DB writes
    if (collegesToInsert.length > 0) {
      await College.insertMany(collegesToInsert);
    }
    if (collegeBulkOps.length > 0) {
      await College.bulkWrite(collegeBulkOps);
    }
    if (mappingBulkOps.length > 0) {
      await CollegeCourseMapping.bulkWrite(mappingBulkOps);
    }

    // 7. Sync College.coursesOffered for ALL colleges in the Excel
    console.log(`[${STREAM} Import] Syncing College.coursesOffered...`);
    const collegeCoursesOfferedOps = [];
    for (const [collegeIdStr, courseIds] of csvCollegeCourseMap) {
      const uniqueCourseIds = Array.from(courseIds).map(id => new mongoose.Types.ObjectId(id));
      collegeCoursesOfferedOps.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(collegeIdStr) },
          update: { $set: { coursesOffered: uniqueCourseIds } }
        }
      });
    }
    if (collegeCoursesOfferedOps.length > 0) {
      await College.bulkWrite(collegeCoursesOfferedOps);
    }

    // 8. Update file state
    fs.writeFileSync(
      stateFilePath,
      JSON.stringify({ mtimeMs: currentMtime, size: currentSize }, null, 2),
      'utf8'
    );

    report.timeTakenMs = Date.now() - startTime;

    console.log(`[${STREAM} Import] Sync complete in ${report.timeTakenMs}ms:`);
    console.log(`  Total rows in Excel: ${report.totalCollegesInExcel}`);
    console.log(`  Matched colleges: ${report.matchedColleges}`);
    console.log(`  Inserted colleges: ${report.insertedColleges}`);
    console.log(`  Updated colleges: ${report.updatedColleges}`);
    console.log(`  Courses created: ${report.coursesCreated}`);
    console.log(`  Mappings created: ${report.totalCourseMappingsCreated}`);
    console.log(`  Obsolete mappings removed: ${report.obsoleteMappingsRemoved}`);

    return { success: true, stats: report };

  } catch (err) {
    console.error(`[${STREAM} Import] Import failed due to error:`, err);
    return { success: false, error: err.message };
  }
};

module.exports = { importArtsScienceExcel };
