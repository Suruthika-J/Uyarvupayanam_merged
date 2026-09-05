const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
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
    .replace(/^(part-time\s+)?diploma\s+in\s+/i, '')
    .replace(/\s*\(polytechnic\)/i, '')
    .replace(/\s*\(diploma\)/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

// ── Custom CSV line parser (handles backslash-escaped commas + quoted fields) ──

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else if (char === '\\' && i + 1 < line.length && line[i + 1] === ',') {
        current += ',';
        i++;
      } else {
        current += char;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

function parseCSVContent(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    let sno, collegeCode, collegeName, category, district, coursesOffered;

    if (fields.length >= 7) {
      sno = fields[0];
      collegeCode = fields[1];
      collegeName = fields[2];
      category = fields[4];
      district = fields[5];
      coursesOffered = fields[6];
    } else if (fields.length === 6) {
      sno = fields[0];
      collegeCode = fields[1];
      collegeName = fields[2];
      category = fields[3];
      district = fields[4];
      coursesOffered = fields[5];
    } else {
      continue;
    }

    if (!collegeName) continue;

    results.push({
      sno,
      collegeCode: String(collegeCode || '').trim(),
      collegeName: collegeName.trim(),
      category: String(category || '').trim(),
      district: String(district || '').trim(),
      coursesOffered: String(coursesOffered || '').trim()
    });
  }

  return results;
}

// ── Main importer ──────────────────────────────────────────────────

const importDiplomaCSV = async (forceSync = false) => {
  const startTime = Date.now();
  console.log('[Polytechnic CSV Import] Starting Diploma/Polytechnic College-Course Mapping import from college.csv ...');

  const csvPath = path.join(__dirname, '../uploads/college.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`[Polytechnic CSV Import] CSV file not found at: ${csvPath}`);
    return { success: false, error: `CSV file not found at: ${csvPath}` };
  }

  // 1. File state tracking
  const stateFilePath = path.join(__dirname, '../uploads/.college_csv_state.json');
  const fileStats = fs.statSync(csvPath);
  const currentMtime = fileStats.mtimeMs;
  const currentSize = fileStats.size;

  if (!forceSync && fs.existsSync(stateFilePath)) {
    try {
      const savedState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      if (savedState.mtimeMs === currentMtime && savedState.size === currentSize) {
        console.log('[Polytechnic CSV Import] CSV file unchanged. Skipping database synchronization.');
        return { success: true, skipped: true, message: 'CSV file unchanged. Database synchronization skipped.' };
      }
    } catch (err) {
      console.warn('[Polytechnic CSV Import] Failed to read state file. Forcing run:', err.message);
    }
  }

  // 2. Read and parse CSV
  let content = fs.readFileSync(csvPath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

  const rows = parseCSVContent(content);
  console.log(`[Polytechnic CSV Import] Parsed ${rows.length} college rows from CSV.`);

  const report = {
    totalCollegesInCSV: rows.length,
    matchedColleges: 0,
    insertedColleges: 0,
    updatedColleges: 0,
    totalCourseMappingsCreated: 0,
    duplicateMappingsSkipped: 0,
    obsoleteMappingsRemoved: 0,
    coursesCreated: 0,
    missingCourses: new Set(),
    timeTakenMs: 0
  };

  try {
    // 3. Cache all existing DB data
    const [allColleges, allCourses, existingMappings] = await Promise.all([
      College.find({}),
      Course.find({}),
      CollegeCourseMapping.find({ stream: 'Polytechnic' })
    ]);

    const collegeMapByName = new Map();
    const collegeMapByNormName = new Map();
    const collegeMapByCode = new Map();

    allColleges.forEach(c => {
      const name = c.collegeName.trim();
      collegeMapByName.set(name.toLowerCase(), c);
      collegeMapByNormName.set(normalizeCollegeName(name), c);
      if (c.collegeCode) {
        collegeMapByCode.set(String(c.collegeCode).trim(), c);
      }
    });

    const courseMapByNormName = new Map();
    allCourses.forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      if (norm) {
        const existing = courseMapByNormName.get(norm);
        if (!existing || (c.level === 'diploma' && existing.level !== 'diploma')) {
          courseMapByNormName.set(norm, c);
        }
      }
    });

    // Also index by full lower-case name for exact matching
    const courseMapByFullName = new Map();
    allCourses.forEach(c => {
      const fullKey = c.courseName.toLowerCase().trim();
      if (fullKey) {
        const existing = courseMapByFullName.get(fullKey);
        if (!existing || (c.level === 'diploma' && existing.level !== 'diploma')) {
          courseMapByFullName.set(fullKey, c);
        }
      }
    });

    const collegeBulkOps = [];
    const mappingBulkOps = [];
    const collegesToInsert = [];

    // Track which colleges and courses are in the CSV (for obsolete mapping removal)
    const csvCollegeIds = new Set();
    const csvCollegeCourseMap = new Map(); // collegeId -> Set of courseIds

    const batchId = `POLYTECHNIC-CSV-${Date.now()}`;

    // 4. Process each CSV row
    for (const row of rows) {
      const excelName = row.collegeName;
      const excelCode = row.collegeCode;
      const excelCoursesRaw = row.coursesOffered;
      const excelDistrict = row.district;

      // ── Match / Create College ──
      let college = null;
      if (excelCode && collegeMapByCode.has(excelCode)) {
        college = collegeMapByCode.get(excelCode);
      } else if (collegeMapByName.has(excelName.toLowerCase())) {
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
          collegeCode: excelCode,
          stream: 'Polytechnic',
          streamsOffered: ['Polytechnic', 'Diploma'],
          coursesOffered: [],
          district: excelDistrict,
          state: 'Tamil Nadu',
          category: row.category || '',
        };
        collegeMapByName.set(excelName.toLowerCase(), college);
        collegeMapByNormName.set(normalizeCollegeName(excelName), college);
        if (excelCode) {
          collegeMapByCode.set(excelCode, college);
        }
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
        if (excelCode && college.collegeCode !== excelCode) updates.collegeCode = excelCode;
        if (excelDistrict && college.district !== excelDistrict) updates.district = excelDistrict;
        if (row.category && college.category !== row.category) updates.category = row.category;

        if (!college.streamsOffered || !college.streamsOffered.includes('Diploma')) {
          updates.streamsOffered = [...new Set([...(college.streamsOffered || []), 'Diploma'])];
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
          // Use upsert to prevent duplicates — match by category + case-insensitive name
          const courseSlug = rawCourseName
            .toLowerCase()
            .split(' ')
            .join('-')
            .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substr(2, 5);

          const courseNorm = normalizeCourseName(rawCourseName);
          const upsertResult = await Course.findOneAndUpdate(
            { category: 'Polytechnic', courseName: { $regex: new RegExp(`^${rawCourseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
            {
              $setOnInsert: {
                courseName: rawCourseName,
                slug: courseSlug,
                level: 'diploma',
                category: 'Polytechnic',
                duration: '3 Years',
                eligibility: '10th Pass',
                shortDescription: `${rawCourseName} – diploma programme.`,
                isImported: true,
                status: 'active'
              }
            },
            { upsert: true, returnDocument: 'after', rawResult: true }
          );

          const upsertedCourse = upsertResult.value;
          matchedCourse = upsertedCourse;
          courseMapByFullName.set(fullKey, upsertedCourse);
          courseMapByNormName.set(courseNorm, upsertedCourse);

          if (upsertResult.lastErrorDocument && upsertResult.lastErrorDocument.upserted) {
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
                stream: 'Polytechnic',
                source: 'Import',
                sourceFileName: 'college.csv',
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
        college.streamsOffered = ['Polytechnic', 'Diploma'];
      }
    }

    // 5. Remove obsolete mappings for colleges in the CSV
    console.log('[Polytechnic CSV Import] Removing obsolete mappings...');
    const deleteFilter = {
      collegeId: { $in: Array.from(csvCollegeIds).map(id => new mongoose.Types.ObjectId(id)) },
      stream: 'Polytechnic'
    };

    // Get all existing mappings for these colleges
    const existingMappingsForCSV = await CollegeCourseMapping.find(deleteFilter);

    const obsoleteMappingIds = [];
    for (const mapping of existingMappingsForCSV) {
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
      console.log(`[Polytechnic CSV Import] Removed ${obsoleteMappingIds.length} obsolete mappings.`);
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

    // 7. Sync College.coursesOffered for ALL colleges in the CSV
    console.log('[Polytechnic CSV Import] Syncing College.coursesOffered...');
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
    report.missingCourses = Array.from(report.missingCourses).sort();

    console.log(`[Polytechnic CSV Import] Sync complete in ${report.timeTakenMs}ms:`);
    console.log(`  Total rows in CSV: ${report.totalCollegesInCSV}`);
    console.log(`  Matched colleges: ${report.matchedColleges}`);
    console.log(`  Inserted colleges: ${report.insertedColleges}`);
    console.log(`  Updated colleges: ${report.updatedColleges}`);
    console.log(`  Courses created: ${report.coursesCreated}`);
    console.log(`  Mappings created: ${report.totalCourseMappingsCreated}`);
    console.log(`  Obsolete mappings removed: ${report.obsoleteMappingsRemoved}`);

    return { success: true, stats: report };

  } catch (err) {
    console.error('[Polytechnic CSV Import] Import failed due to error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = { importDiplomaCSV };
