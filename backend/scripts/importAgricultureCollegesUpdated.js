const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const excelPath = path.resolve(__dirname, '../uploads/Agriculture Collge Offered Courses-Updated.xlsx');

// Aggressive course name normalization
const normalizeCourseForMatch = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .replace(/,/g, '')
    .replace(/[\(\)]/g, '')
    .replace(/-/g, '')
    .replace(/honours?/g, 'hons')
    .replace(/honors?/g, 'hons')
    .replace(/integrated/g, '')
    .trim();
};

// College name normalization
const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\(autonomous\)/g, '')
    .replace(/autonomous/g, '')
    .replace(/\(a\)/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Core words for fuzzy matching
const coreWords = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(agricultural|college|and|research|institute|horticultural|engineering|forest|community|science|technology|university|of|for|women|in|the|deemed|state|private|government|govt|dr|sri|s\b)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Parse courses from a cell (handles comma-separated)
function parseCourseNames(text) {
  if (!text) return [];
  return text
    .split(/,\s*/)
    .map(c => c.trim())
    .filter(c => c.length > 2);
}

async function runImport() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not found');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`Loaded Excel with ${rows.length} rows\n`);

    const summary = {
      totalRows: rows.length,
      collegesMatched: 0,
      collegesCreated: 0,
      coursesReused: 0,
      coursesCreated: 0,
      mappingsCreated: 0,
      mappingsReactivated: 0,
      staleDeactivated: 0,
      errors: []
    };

    // Cache all DB data
    const allCourses = await Course.find({});
    const allColleges = await College.find({});

    // Build course lookup
    const courseMapByNorm = new Map();
    allCourses.forEach(c => {
      const norm = normalizeCourseForMatch(c.courseName);
      if (norm && !courseMapByNorm.has(norm)) courseMapByNorm.set(norm, c);
    });

    // Build college lookup
    const collegeLookup = new Map();
    allColleges.forEach(c => {
      const norm = normalizeCollegeName(c.collegeName);
      if (norm) collegeLookup.set(norm, c);
    });

    const findCollege = (excelName) => {
      const norm = normalizeCollegeName(excelName);
      // Exact match
      if (collegeLookup.has(norm)) return collegeLookup.get(norm);
      // Core word match
      const excelCore = coreWords(excelName);
      for (const c of allColleges) {
        const dbCore = coreWords(c.collegeName);
        if (excelCore === dbCore && excelCore.length > 8) return c;
      }
      // Substring match
      for (const [key, c] of collegeLookup) {
        if (key.length > 10 && (key.includes(norm) || norm.includes(key))) return c;
      }
      // Fuzzy: remove location/address suffixes and try again
      const simplified = excelName
        .replace(/,\s*(G\.B\. Nagar|Kalavai|Ranipet District|Sagayathottam Post|Thakkolam|via|Arakkonam Taluk|Ranipet District\.|Valikandapuram|Perambalur\.|Thuraiyur Main Road|Perambalur Post|Perambalur District\.|Main Road|Post|District\.|via\))/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      const simpNorm = normalizeCollegeName(simplified);
      if (collegeLookup.has(simpNorm)) return collegeLookup.get(simpNorm);
      return null;
    };

    const session = await mongoose.startSession();
    const processedCollegeIds = new Set();

    try {
      await session.withTransaction(async () => {
        // Step 1: Deactivate ALL existing Agriculture mappings
        const deactivateResult = await CollegeCourseMapping.updateMany(
          { stream: 'Agriculture' },
          { $set: { isActive: false } },
          { session }
        );
        summary.staleDeactivated = deactivateResult.modifiedCount;
        console.log(`Deactivated ${deactivateResult.modifiedCount} existing Agriculture mappings`);

        const batchId = `AGRI-UPDATE-${Date.now()}`;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const collegeNameRaw = (row['College Name'] || '').trim();
          const coursesRaw = (row['Course Name'] || '').trim();
          const websiteRaw = (row['Official Website'] || '').trim();
          const districtRaw = (row['District'] || '').trim();
          const collegeTypeRaw = (row['College Type'] || '').trim();
          const affiliationRaw = (row['University / Affiliation'] || '').trim();
          const streamRaw = (row['Stream'] || '').trim();
          const hostelRaw = (row['Hostel'] || '').trim();

          if (!collegeNameRaw || !coursesRaw) continue;

          try {
            // 1. Match college
            let college = findCollege(collegeNameRaw);

            if (!college) {
              college = new College({
                collegeName: collegeNameRaw,
                stream: 'Agriculture',
                streamsOffered: ['Agriculture'],
                district: districtRaw,
                state: 'Tamil Nadu',
                category: collegeTypeRaw || 'Private',
                type: collegeTypeRaw,
                collegeType: collegeTypeRaw,
                website: websiteRaw,
                universityAffiliation: affiliationRaw,
                hostel: hostelRaw,
                coursesOffered: []
              });
              await college.save({ session });
              allColleges.push(college);
              collegeLookup.set(normalizeCollegeName(collegeNameRaw), college);
              summary.collegesCreated++;
              console.log(`Created: "${collegeNameRaw}"`);
            } else {
              summary.collegesMatched++;
              // Update fields if missing
              if (districtRaw && !college.district) college.district = districtRaw;
              if (websiteRaw && (!college.website || college.website.trim() === '')) college.website = websiteRaw;
              if (collegeTypeRaw && !college.collegeType) college.collegeType = collegeTypeRaw;
              if (affiliationRaw && !college.universityAffiliation) college.universityAffiliation = affiliationRaw;
              if (hostelRaw && !college.hostel) college.hostel = hostelRaw;
              if (!college.streamsOffered.includes('Agriculture')) college.streamsOffered.push('Agriculture');
              if (!college.stream) college.stream = 'Agriculture';
              await college.save({ session });
            }

            processedCollegeIds.add(college._id.toString());

            // 2. Parse and resolve courses
            const courseNames = parseCourseNames(coursesRaw);
            const resolvedCourseIds = [];

            for (const rawCourseName of courseNames) {
              const normCourse = normalizeCourseForMatch(rawCourseName);
              let matchedCourse = courseMapByNorm.get(normCourse);

              if (!matchedCourse) {
                // Try looser matching
                for (const [key, c] of courseMapByNorm) {
                  if (key.includes(normCourse) || normCourse.includes(key)) {
                    matchedCourse = c;
                    break;
                  }
                }
              }

              if (!matchedCourse) {
                // Create new course
                matchedCourse = new Course({
                  courseName: rawCourseName,
                  level: 'after12th',
                  category: 'Agriculture',
                  duration: row['Duration'] || '4 Years',
                  eligibility: row['Eligibility'] || '10+2 with PCB/PCM',
                  shortDescription: `${rawCourseName} - Agriculture program`,
                  status: 'active',
                  isPublished: true,
                  isImported: true,
                  sourceName: 'Agriculture Updated Excel Import'
                });
                await matchedCourse.save({ session });
                allCourses.push(matchedCourse);
                courseMapByNorm.set(normCourse, matchedCourse);
                summary.coursesCreated++;
                console.log(`  Created Course: "${rawCourseName}"`);
              } else {
                summary.coursesReused++;
              }

              resolvedCourseIds.push(matchedCourse._id);

              // Create/update mapping
              const existing = await CollegeCourseMapping.findOne({
                collegeId: college._id,
                courseId: matchedCourse._id
              }).session(session);

              if (existing) {
                existing.isActive = true;
                existing.isVerified = true;
                existing.source = 'Excel Import';
                existing.sourceFileName = 'Agriculture Collge Offered Courses-Updated.xlsx';
                existing.importBatchId = batchId;
                existing.collegeName = college.collegeName;
                existing.courseName = matchedCourse.courseName;
                existing.stream = 'Agriculture';
                existing.degree = row['Degree'] || '';
                existing.courseLevel = row['Course Level'] || '';
                existing.specialization = row['Specialization'] || '';
                existing.duration = row['Duration'] || '';
                existing.eligibility = row['Eligibility'] || '';
                existing.admissionMode = row['Admission Mode'] || '';
                existing.hostel = hostelRaw;
                existing.collegeType = collegeTypeRaw;
                existing.universityAffiliation = affiliationRaw;
                await existing.save({ session });
                summary.mappingsReactivated++;
              } else {
                await CollegeCourseMapping.create([{
                  collegeId: college._id,
                  courseId: matchedCourse._id,
                  source: 'Excel Import',
                  sourceFileName: 'Agriculture Collge Offered Courses-Updated.xlsx',
                  importBatchId: batchId,
                  isVerified: true,
                  isActive: true,
                  collegeName: college.collegeName,
                  courseName: matchedCourse.courseName,
                  stream: 'Agriculture',
                  degree: row['Degree'] || '',
                  courseLevel: row['Course Level'] || '',
                  specialization: row['Specialization'] || '',
                  duration: row['Duration'] || '',
                  eligibility: row['Eligibility'] || '',
                  admissionMode: row['Admission Mode'] || '',
                  hostel: hostelRaw,
                  collegeType: collegeTypeRaw,
                  universityAffiliation: affiliationRaw
                }], { session });
                summary.mappingsCreated++;
              }
            }

            // Update college coursesOffered
            college.coursesOffered = resolvedCourseIds;
            await college.save({ session });

          } catch (err) {
            console.error(`Error row ${i + 1} (${collegeNameRaw}):`, err.message);
            summary.errors.push(`Row ${i + 1} (${collegeNameRaw}): ${err.message}`);
          }
        }
      });

      console.log('\n==============================================');
      console.log('    AGRICULTURE UPDATED IMPORT SUMMARY         ');
      console.log('==============================================');
      console.log(`Total Rows in Excel:              ${summary.totalRows}`);
      console.log(`Colleges Matched:                 ${summary.collegesMatched}`);
      console.log(`New Colleges Created:             ${summary.collegesCreated}`);
      console.log(`Courses Reused:                   ${summary.coursesReused}`);
      console.log(`New Courses Created:              ${summary.coursesCreated}`);
      console.log(`Mappings Created (new):           ${summary.mappingsCreated}`);
      console.log(`Mappings Reactivated:             ${summary.mappingsReactivated}`);
      console.log(`Stale Mappings Deactivated:       ${summary.staleDeactivated}`);
      if (summary.errors.length > 0) {
        console.log(`\nErrors (${summary.errors.length}):`);
        summary.errors.forEach(e => console.log(`  - ${e}`));
      } else {
        console.log('Errors:                           None');
      }
      console.log('==============================================\n');

    } catch (err) {
      console.error('Transaction aborted:', err);
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

runImport();
