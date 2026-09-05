const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const STREAM = 'Medical';
const COURSE_CATEGORY = 'Medical';
const SOURCE_FILE = 'Medical Coleges and their Courses.xlsx';

const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const importMedicalExcel = async (forceSync = false) => {
  const startTime = Date.now();
  console.log(`[${STREAM} Import] Starting Medical College-Course Mapping import...`);

  const excelPath = path.join(__dirname, '../uploads/Medical Coleges and their Courses.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`[${STREAM} Import] Excel file not found at: ${excelPath}`);
    return { success: false, error: `Excel file not found at: ${excelPath}` };
  }

  const stateFilePath = path.join(__dirname, '../uploads/.medical_excel_state.json');
  const fileStats = fs.statSync(excelPath);
  const currentMtime = fileStats.mtimeMs;
  const currentSize = fileStats.size;

  if (!forceSync && fs.existsSync(stateFilePath)) {
    try {
      const savedState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      if (savedState.mtimeMs === currentMtime && savedState.size === currentSize) {
        console.log(`[${STREAM} Import] Excel file unchanged. Skipping.`);
        return { success: true, skipped: true, message: 'Excel file unchanged.' };
      }
    } catch (err) {
      console.warn(`[${STREAM} Import] Failed to read state file. Forcing run.`);
    }
  }

  const workbook = XLSX.readFile(excelPath);
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
      const row = sheetData[i];
      if (Array.isArray(row) && row.some(h => String(h || '').toLowerCase().includes('college name'))) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) continue;

    for (let i = headerIdx + 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || row.length < 2) continue;

      const collegeNameRaw = String(row[0] || '').trim();
      const coursesRaw = String(row[1] || '').trim();

      if (!collegeNameRaw) continue;

      const nameMatch = collegeNameRaw.match(/^(.*?),\s*(.+)$/);
      let collegeName, district;
      if (nameMatch) {
        collegeName = nameMatch[1].trim();
        district = nameMatch[2].trim();
      } else {
        collegeName = collegeNameRaw;
        district = '';
      }

      rows.push({ collegeName, district, coursesRaw });
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
    coursesCreated: 0,
    timeTakenMs: 0
  };

  try {
    const allColleges = await College.find({ stream: STREAM });
    const collegeMapByName = new Map();
    const collegeMapByNormName = new Map();

    allColleges.forEach(c => {
      collegeMapByName.set(c.collegeName.toLowerCase().trim(), c);
      collegeMapByNormName.set(normalizeCollegeName(c.collegeName), c);
    });

    const collegeBulkOps = [];
    const collegesToInsert = [];
    const csvCollegeIds = new Set();
    const csvCollegeCourseMap = new Map();
    const batchId = `MEDICAL-EXCEL-${Date.now()}`;

    for (const row of rows) {
      const { collegeName: excelName, district: excelDistrict, coursesRaw } = row;

      let college = null;
      if (collegeMapByName.has(excelName.toLowerCase().trim())) {
        college = collegeMapByName.get(excelName.toLowerCase().trim());
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
          district: excelDistrict,
          location: excelDistrict,
          state: 'Tamil Nadu',
          collegeType: 'Private',
          category: STREAM
        };
        collegeMapByName.set(excelName.toLowerCase().trim(), college);
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

      if (!isNewCollege) {
        const updates = {};
        if (excelDistrict && college.district !== excelDistrict) updates.district = excelDistrict;
        if (excelDistrict && college.location !== excelDistrict) updates.location = excelDistrict;
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
    }

    if (collegesToInsert.length > 0) {
      await College.insertMany(collegesToInsert);
      console.log(`[${STREAM} Import] Inserted ${collegesToInsert.length} new colleges.`);
    }
    if (collegeBulkOps.length > 0) {
      await College.bulkWrite(collegeBulkOps);
      console.log(`[${STREAM} Import] Updated ${collegeBulkOps.length} existing colleges.`);
    }

    console.log(`[${STREAM} Import] Syncing CollegeCourseMapping from College.coursesOffered...`);

    const reloadedColleges = await College.find({ stream: STREAM }).lean();
    const allCourses = await Course.find({ category: COURSE_CATEGORY }).lean();
    const courseMapById = new Map();
    allCourses.forEach(c => courseMapById.set(c._id.toString(), c));

    const mappingOps = [];
    for (const college of reloadedColleges) {
      if (!college.coursesOffered || college.coursesOffered.length === 0) continue;

      for (const courseId of college.coursesOffered) {
        const courseIdStr = courseId.toString();
        const course = courseMapById.get(courseIdStr);
        csvCollegeCourseMap.get(college._id.toString())?.add(courseIdStr);

        mappingOps.push({
          updateOne: {
            filter: { collegeId: college._id, courseId: courseId },
            update: {
              $setOnInsert: {
                collegeId: college._id,
                courseId: courseId,
                stream: STREAM,
                source: 'Import',
                sourceFileName: SOURCE_FILE,
                importBatchId: batchId,
                isVerified: true,
                isActive: true,
                collegeName: college.collegeName,
                courseName: course ? course.courseName : ''
              }
            },
            upsert: true
          }
        });
      }
    }

    console.log(`[${STREAM} Import] Processing ${mappingOps.length} mapping operations...`);

    for (let i = 0; i < mappingOps.length; i += 5000) {
      const batch = mappingOps.slice(i, i + 5000);
      const result = await CollegeCourseMapping.bulkWrite(batch, { ordered: false });
      report.totalCourseMappingsCreated += result.upsertedCount || 0;
      report.duplicateMappingsSkipped += (result.modifiedCount || 0);
    }

    fs.writeFileSync(
      stateFilePath,
      JSON.stringify({ mtimeMs: currentMtime, size: currentSize }, null, 2),
      'utf8'
    );

    report.timeTakenMs = Date.now() - startTime;

    const totalMappings = await CollegeCourseMapping.countDocuments({ stream: STREAM });
    const activeMappings = await CollegeCourseMapping.countDocuments({ stream: STREAM, isActive: true, isVerified: true });
    const totalColleges = await College.countDocuments({ stream: STREAM });
    const totalCourses = await Course.countDocuments({ category: COURSE_CATEGORY });

    console.log(`\n[${STREAM} Import] Sync complete in ${report.timeTakenMs}ms:`);
    console.log(`  Total rows in Excel: ${report.totalCollegesInExcel}`);
    console.log(`  Matched colleges: ${report.matchedColleges}`);
    console.log(`  Inserted colleges: ${report.insertedColleges}`);
    console.log(`  Updated colleges: ${report.updatedColleges}`);
    console.log(`  New mappings created: ${report.totalCourseMappingsCreated}`);
    console.log(`\n  Final DB state:`);
    console.log(`  Colleges: ${totalColleges}`);
    console.log(`  Courses: ${totalCourses}`);
    console.log(`  Total mappings: ${totalMappings}`);
    console.log(`  Active+verified mappings: ${activeMappings}`);

    return { success: true, stats: report };

  } catch (err) {
    console.error(`[${STREAM} Import] Import failed:`, err);
    return { success: false, error: err.message };
  }
};

module.exports = { importMedicalExcel };
