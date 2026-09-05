const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

// Aggressive college name normalization
const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[.,:|]/g, '')
    .replace(/autonomous/g, '')
    .replace(/\bfor women\b/g, '')
    .replace(/\blaw colleges?\b/g, '')
    .replace(/\blaw university\b/g, '')
    .replace(/\buniversity\b/g, '')
    .replace(/\binstitute of science technology and advanced studies\b/g, '')
    .replace(/\bvists\b/g, '')
    .replace(/\bvisat\b/g, '')
    .replace(/\bschool of\b/g, '')
    .replace(/\bdeemed university\b/g, '')
    .replace(/\bthe\b/g, '')
    .replace(/\bgovt\b/g, 'government')
    .replace(/\bsri\b/g, '')
    .replace(/\bs\.?\s*thangapazham\b/g, 'thangapazham')
    .replace(/\bmr\.\s*/g, '')
    .replace(/\bdr\.\s*/g, '')
    .replace(/\bprof\.\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Aggressive course name normalization
const normalizeCourseForMatch = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/integrated\s+/gi, '')
    .replace(/^r\s+/gi, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/,/g, '')
    .replace(/[\(\)]/g, '')
    .replace(/honours?/g, 'hons')
    .replace(/honors?/g, 'hons')
    .replace(/3year/g, '')
    .replace(/5year/g, '')
    .replace(/year/g, '')
    .replace(/bilingual.*$/g, '')
    .trim();
};

// Parse course names from natural language description
function parseCourseNames(text) {
  if (!text) return [];
  let cleaned = text
    .replace(/^r\s+/gi, '')
    .replace(/\.\s*$/g, '')
    .trim();
  cleaned = cleaned.replace(/\d+-Year\s*/gi, '');
  let parts = cleaned.split(/,\s*|\s+and\s+/);
  return parts
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      p = p.replace(/^\s*and\s+/i, '').trim();
      p = p.replace(/\.\s*$/g, '').trim();
      p = p.replace(/\(Bilingual.*?\)/gi, '').trim();
      return p;
    })
    .filter(p => p.length > 2);
}

// Matching function: compare Excel name to DB name
function matchCollege(excelNorm, dbCollege) {
  const dbNorm = normalizeCollegeName(dbCollege.collegeName);
  if (dbNorm === excelNorm) return true;
  if (dbNorm.includes(excelNorm) || excelNorm.includes(dbNorm)) return true;
  // Check if core names match after removing location suffixes
  const excelParts = excelNorm.split(' ').filter(Boolean);
  const dbParts = dbNorm.split(' ').filter(Boolean);
  const excelCore = excelParts.slice(0, Math.max(3, excelParts.length - 2)).join(' ');
  const dbCore = dbParts.slice(0, Math.max(3, dbParts.length - 2)).join(' ');
  if (excelCore === dbCore && excelCore.length > 10) return true;
  return false;
}

async function runImport() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not found');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const xlsx = require('xlsx');
    const excelPath = path.resolve(__dirname, '../uploads/Law Colleges and its Courses Updated.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`Loaded Excel with ${rows.length} rows\n`);

    // Step 1: Clean up duplicate Law colleges (ones without LAW### code created by bad first run)
    console.log('=== CLEANUP: Removing duplicate Law colleges ===');
    const lawColleges = await College.find({ stream: 'Law' });
    const duplicatesRemoved = [];
    for (const college of lawColleges) {
      // Colleges without a LAW### code that were likely created by the bad first run
      if (!college.collegeCode || !college.collegeCode.startsWith('LAW')) {
        // Check if there's another college with a similar name that HAS a code
        const normName = normalizeCollegeName(college.collegeName);
        const dupe = lawColleges.find(c => {
          if (c._id.toString() === college._id.toString()) return false;
          if (!c.collegeCode || !c.collegeCode.startsWith('LAW')) return false;
          return matchCollege(normName, c);
        });
        if (dupe) {
          // This is a duplicate - remove it
          await CollegeCourseMapping.deleteMany({ collegeId: college._id });
          await College.deleteOne({ _id: college._id });
          duplicatesRemoved.push(`${college.collegeName} (dupe of ${dupe.collegeName})`);
        }
      }
    }
    console.log(`Removed ${duplicatesRemoved.length} duplicate colleges:`);
    duplicatesRemoved.forEach(d => console.log(`  - ${d}`));

    // Step 2: Now re-import with better matching
    console.log('\n=== RE-IMPORT ===');
    const allCourses = await Course.find({});
    const allColleges = await College.find({});

    // Build lookup maps
    const courseMapByNorm = new Map();
    allCourses.forEach(c => {
      const norm = normalizeCourseForMatch(c.courseName);
      if (norm) {
        // Keep the first (most specific) match
        if (!courseMapByNorm.has(norm)) courseMapByNorm.set(norm, c);
      }
    });

    const summary = {
      totalRows: rows.length,
      collegesMatched: 0,
      collegesCreated: 0,
      collegesSkipped: 0,
      coursesReused: 0,
      coursesCreated: 0,
      mappingsCreated: 0,
      mappingsReactivated: 0,
      staleDeactivated: 0,
      errors: []
    };

    const session = await mongoose.startSession();
    const processedCollegeIds = new Set();

    try {
      await session.withTransaction(async () => {
        // Deactivate all existing Law mappings
        const deactivateResult = await CollegeCourseMapping.updateMany(
          { stream: 'Law' },
          { $set: { isActive: false } },
          { session }
        );
        summary.staleDeactivated = deactivateResult.modifiedCount;
        console.log(`Deactivated ${deactivateResult.modifiedCount} existing Law mappings`);

        const batchId = `LAW-UPDATE-${Date.now()}`;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const collegeNameRaw = (row['Law College'] || '').trim();
          const coursesRaw = (row['Courses Offered'] || '').trim();
          const websiteRaw = (row['Offical Website'] || '').trim();

          if (!collegeNameRaw) continue;

          try {
            // 1. Match college with improved matching
            const normExcel = normalizeCollegeName(collegeNameRaw);
            let college = null;

            // Exact match first
            for (const c of allColleges) {
              if (normalizeCollegeName(c.collegeName) === normExcel) {
                college = c;
                break;
              }
            }

            // Aggressive match
            if (!college) {
              for (const c of allColleges) {
                if (matchCollege(normExcel, c)) {
                  college = c;
                  break;
                }
              }
            }

            if (!college) {
              // Create new college
              college = new College({
                collegeName: collegeNameRaw,
                stream: 'Law',
                streamsOffered: ['Law'],
                state: 'Tamil Nadu',
                website: websiteRaw,
                coursesOffered: []
              });
              await college.save({ session });
              allColleges.push(college);
              summary.collegesCreated++;
              console.log(`Created: "${collegeNameRaw}"`);
            } else {
              summary.collegesMatched++;
              console.log(`Matched: "${collegeNameRaw}" -> "${college.collegeName}" (code: ${college.collegeCode || 'none'})`);
              // Update website if empty
              if (websiteRaw && (!college.website || college.website.trim() === '')) {
                college.website = websiteRaw;
              }
              if (!college.streamsOffered.includes('Law')) {
                college.streamsOffered.push('Law');
              }
              if (!college.stream) college.stream = 'Law';
            }

            processedCollegeIds.add(college._id.toString());

            // 2. Parse and resolve courses
            const courseNames = parseCourseNames(coursesRaw);
            const resolvedCourseIds = [];

            for (const rawCourseName of courseNames) {
              const normCourse = normalizeCourseForMatch(rawCourseName);
              let matchedCourse = courseMapByNorm.get(normCourse);

              if (!matchedCourse) {
                // Looser matching
                for (const [key, c] of courseMapByNorm) {
                  if (key.includes(normCourse) || normCourse.includes(key)) {
                    matchedCourse = c;
                    break;
                  }
                }
              }

              if (!matchedCourse) {
                matchedCourse = new Course({
                  courseName: rawCourseName,
                  level: 'after12th',
                  category: 'Law',
                  duration: rawCourseName.toLowerCase().includes('3-year') ? '3 Years' : '5 Years',
                  eligibility: '12th Pass',
                  shortDescription: `${rawCourseName} - Law program`,
                  status: 'active',
                  isPublished: true,
                  isImported: true,
                  sourceName: 'Law Updated Excel Import'
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

              // Create/update mapping (reactivate if was deactivated)
              const mapping = await CollegeCourseMapping.findOne({
                collegeId: college._id,
                courseId: matchedCourse._id
              }).session(session);

              if (mapping) {
                mapping.isActive = true;
                mapping.isVerified = true;
                mapping.source = 'Excel Import';
                mapping.sourceFileName = 'Law Colleges and its Courses Updated.xlsx';
                mapping.importBatchId = batchId;
                mapping.collegeName = college.collegeName;
                mapping.courseName = matchedCourse.courseName;
                mapping.stream = 'Law';
                await mapping.save({ session });
                summary.mappingsReactivated++;
              } else {
                await CollegeCourseMapping.create([{
                  collegeId: college._id,
                  courseId: matchedCourse._id,
                  source: 'Excel Import',
                  sourceFileName: 'Law Colleges and its Courses Updated.xlsx',
                  importBatchId: batchId,
                  isVerified: true,
                  isActive: true,
                  collegeName: college.collegeName,
                  courseName: matchedCourse.courseName,
                  stream: 'Law'
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
      console.log('    LAW UPDATED IMPORT SUMMARY                ');
      console.log('==============================================');
      console.log(`Total Rows in Excel:              ${summary.totalRows}`);
      console.log(`Colleges Matched:                 ${summary.collegesMatched}`);
      console.log(`New Colleges Created:             ${summary.collegesCreated}`);
      console.log(`Courses Reused:                   ${summary.coursesReused}`);
      console.log(`New Courses Created:              ${summary.coursesCreated}`);
      console.log(`Mappings Created (new):           ${summary.mappingsCreated}`);
      console.log(`Mappings Reactivated:             ${summary.mappingsReactivated}`);
      console.log(`Stale Mappings Deactivated:       ${summary.staleDeactivated}`);
      console.log(`Duplicates Removed:               ${duplicatesRemoved.length}`);
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
