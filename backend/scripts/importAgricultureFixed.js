const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const excelPath = path.resolve(__dirname, '../uploads/Agriculture Collge Offered Courses-Updated.xlsx');

const normalizeCourseName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\.\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\(formerly\s+home\s+science\)/gi, '')
    .replace(/honours?/gi, 'hons')
    .replace(/honors?/gi, 'hons')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\(autonomous\)/g, '')
    .replace(/autonomous/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

function parseCoursesFromCell(text) {
  if (!text) return [];
  let courses = text
    .split(/,\s*/)
    .map(c => c.trim())
    .filter(c => c.length > 2);

  const merged = [];
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].match(/^B\.Tech\.\s+Energy$/i) && courses[i + 1] && courses[i + 1].match(/^Environmental Engineering$/i)) {
      merged.push('B.Tech. Energy and Environmental Engineering');
      i++;
    } else {
      merged.push(courses[i]);
    }
  }
  return merged;
}

const MANUAL_COLLEGE_MAP = {
  'school of agricultural sciences, srm institute of science and technology': 'SRM Institute Of Science And Technology',
  'school of agricultural sciences, vellore institute of technology (vit)': 'Vellore Institute of Technology (VIT)',
  'school of agricultural sciences, kalasalingam academy of research and education (kare)': 'Kalasalingam Academy of Research and Education',
  'faculty of agricultural sciences, bharath institute of higher education and research (biher)': 'Bharath Institute of Higher Education and Research (BIHER)',
  'dhanalakshmi srinivasan university (dsu)': 'DHANALAKSHMI SRINIVASAN UNIVERSITY',
  'periyar maniammai institute of science and technology (pmist)': 'Periyar Maniammai Institute of Science and Technology (PMIST)',
  'forest college and research institute': 'Forest College and Research Institute',
  'community science college and research institute': 'Community Science College and Research Institute',
};

const MANUAL_COURSE_MAP = {
  'b sc  hons   community science': 'B.Sc. (Hons.) Community Science (formerly Home Science)',
};

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
      collegesUpdated: 0,
      coursesReused: 0,
      coursesCreated: 0,
      mappingsCreated: 0,
      mappingsReactivated: 0,
      staleDeactivated: 0,
      duplicatesRemoved: 0,
      errors: []
    };

    const allColleges = await College.find({});
    const allCourses = await Course.find({});

    const collegeById = new Map();
    allColleges.forEach(c => collegeById.set(c._id.toString(), c));

    const courseMapByNorm = new Map();
    allCourses.forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      if (norm && !courseMapByNorm.has(norm)) courseMapByNorm.set(norm, c);
    });

    const collegeLookupByNorm = new Map();
    allColleges.forEach(c => {
      const norm = normalizeCollegeName(c.collegeName);
      if (norm) collegeLookupByNorm.set(norm, c);
    });

    const findCollege = (excelName) => {
      const manualTarget = MANUAL_COLLEGE_MAP[normalizeCollegeName(excelName)];
      if (manualTarget) {
        for (const c of allColleges) {
          if (c.collegeName === manualTarget) return c;
        }
      }

      const norm = normalizeCollegeName(excelName);
      if (collegeLookupByNorm.has(norm)) return collegeLookupByNorm.get(norm);

      for (const [key, c] of collegeLookupByNorm) {
        if (key.length > 15 && norm.length > 15) {
          const shorter = key.length < norm.length ? key : norm;
          const longer = key.length < norm.length ? norm : key;
          if (longer.includes(shorter)) return c;
        }
      }

      const excelWords = norm.split(/\s+/).filter(w => w.length > 3 && !['college', 'and', 'the', 'institute', 'of', 'for', 'agriculture', 'agricultural', 'horticultural', 'engineering', 'research', 'science', 'technology'].includes(w));
      for (const [key, c] of collegeLookupByNorm) {
        const dbWords = key.split(/\s+/).filter(w => w.length > 3 && !['college', 'and', 'the', 'institute', 'of', 'for', 'agriculture', 'agricultural', 'horticultural', 'engineering', 'research', 'science', 'technology'].includes(w));
        const overlap = excelWords.filter(w => dbWords.some(dw => dw.includes(w) || w.includes(dw)));
        if (overlap.length >= 2 && overlap.length >= excelWords.length * 0.5) return c;
      }

      return null;
    };

    const findCourse = (rawName) => {
      const manualTarget = MANUAL_COURSE_MAP[normalizeCourseName(rawName)];
      const nameToFind = manualTarget || rawName;
      const norm = normalizeCourseName(nameToFind);
      if (courseMapByNorm.has(norm)) return courseMapByNorm.get(norm);

      for (const [key, c] of courseMapByNorm) {
        if (key.includes(norm) || norm.includes(key)) {
          if (Math.abs(key.length - norm.length) < 10) return c;
        }
      }

      return null;
    };

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        console.log('Step 1: Deactivating ALL Agriculture mappings...');
        const deactivateResult = await CollegeCourseMapping.updateMany(
          { stream: 'Agriculture' },
          { $set: { isActive: false } },
          { session }
        );
        summary.staleDeactivated = deactivateResult.modifiedCount;
        console.log(`  Deactivated ${deactivateResult.modifiedCount} mappings\n`);

        console.log('Step 2: Merging duplicate colleges...');
        const duplicateGroups = [
          ['Agricultural College and Research Institute, Killikulam', 'Killikulam'],
          ['Agricultural College and Research Institute, Kudumiyanmalai', 'Kudumiyanmalai'],
        ];

        for (const [name, keyword] of duplicateGroups) {
          const dupes = await College.find({ collegeName: { $regex: keyword, $options: 'i' }, stream: 'Agriculture' }).session(session);
          if (dupes.length > 1) {
            const keep = dupes.reduce((best, c) => {
              if (!best) return c;
              if ((c.coursesOffered || []).length > (best.coursesOffered || []).length) return c;
              return best;
            }, null);
            const remove = dupes.filter(c => c._id.toString() !== keep._id.toString());
            for (const r of remove) {
              await CollegeCourseMapping.deleteMany({ collegeId: r._id }).session(session);
              await College.findByIdAndDelete(r._id).session(session);
              summary.duplicatesRemoved++;
              console.log(`  Removed duplicate: ${r.collegeName} (${r._id})`);
            }
            if (keep) {
              collegeLookupByNorm.set(normalizeCollegeName(keep.collegeName), keep);
            }
          }
        }
        console.log(`  Removed ${summary.duplicatesRemoved} duplicate colleges\n`);

        console.log('Step 3: Processing Excel rows...');
        const batchId = `AGRI-FIX-${Date.now()}`;
        const processedColleges = new Map();

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const collegeNameRaw = (row['College Name'] || '').trim().replace(/\r\n/g, ' ').replace(/\r/g, ' ');
          const coursesRaw = (row['Course Name'] || '').trim();
          const websiteRaw = (row['Official Website'] || '').trim();
          const districtRaw = (row['District'] || '').trim();
          const collegeTypeRaw = (row['College Type'] || '').trim();
          const affiliationRaw = (row['University / Affiliation'] || '').trim();
          const streamRaw = (row['Stream'] || 'Agriculture').trim();
          const hostelRaw = (row['Hostel'] || '').trim();

          if (!collegeNameRaw || !coursesRaw) continue;

          try {
            let college = findCollege(collegeNameRaw);

            if (!college) {
              console.log(`  [Row ${i + 1}] CREATING NEW: "${collegeNameRaw}"`);
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
              collegeLookupByNorm.set(normalizeCollegeName(collegeNameRaw), college);
              summary.collegesCreated++;
            } else {
              summary.collegesMatched++;
              if (districtRaw) college.district = districtRaw;
              if (websiteRaw) college.website = websiteRaw;
              if (collegeTypeRaw) {
                college.collegeType = collegeTypeRaw;
                college.type = collegeTypeRaw;
              }
              if (affiliationRaw) college.universityAffiliation = affiliationRaw;
              if (hostelRaw) college.hostel = hostelRaw;
              if (!college.stream || college.stream !== 'Agriculture') {
                if (!college.streamsOffered || !college.streamsOffered.includes('Agriculture')) {
                  college.streamsOffered = [...(college.streamsOffered || []), 'Agriculture'];
                }
              }
              await college.save({ session });
            }

            if (!processedColleges.has(college._id.toString())) {
              processedColleges.set(college._id.toString(), { college, courseIds: [] });
            }

            const courseNames = parseCoursesFromCell(coursesRaw);
            const resolvedCourseIds = [];

            for (const rawCourseName of courseNames) {
              let matchedCourse = findCourse(rawCourseName);

              if (!matchedCourse) {
                const slug = rawCourseName.toLowerCase().split(' ').join('-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substr(2, 5);
                matchedCourse = new Course({
                  courseName: rawCourseName,
                  slug: slug,
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
                courseMapByNorm.set(normalizeCourseName(rawCourseName), matchedCourse);
                summary.coursesCreated++;
                console.log(`  Created Course: "${rawCourseName}"`);
              } else {
                summary.coursesReused++;
              }

              resolvedCourseIds.push(matchedCourse._id);

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

            const entry = processedColleges.get(college._id.toString());
            entry.courseIds.push(...resolvedCourseIds);
            college.coursesOffered = [...new Set(entry.courseIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
            await college.save({ session });

            console.log(`  [Row ${i + 1}] ${college.collegeName} -> ${courseNames.join(', ')}`);

          } catch (err) {
            console.error(`  Error row ${i + 1} (${collegeNameRaw}):`, err.message);
            summary.errors.push(`Row ${i + 1} (${collegeNameRaw}): ${err.message}`);
          }
        }

        console.log('\nStep 4: Verifying all Excel colleges have mappings...');
        for (const [excelName, courses] of Object.entries(
          (() => {
            const ec = {};
            rows.forEach(r => {
              const c = (r['College Name'] || '').trim().replace(/\r\n/g, ' ').replace(/\r/g, ' ');
              const cours = parseCoursesFromCell((r['Course Name'] || '').trim());
              if (c) {
                if (!ec[c]) ec[c] = new Set();
                cours.forEach(co => ec[c].add(co));
              }
            });
            return ec;
          })()
        )) {
          const college = findCollege(excelName);
          if (college) {
            const activeCount = await CollegeCourseMapping.countDocuments({
              collegeId: college._id,
              stream: 'Agriculture',
              isActive: true
            }).session(session);
            if (activeCount === 0) {
              console.log(`  WARNING: ${college.collegeName} has 0 active Agriculture mappings!`);
            }
          }
        }

      });

      console.log('\n==============================================');
      console.log('    AGRICULTURE FIXED IMPORT SUMMARY          ');
      console.log('==============================================');
      console.log(`Total Rows in Excel:              ${summary.totalRows}`);
      console.log(`Colleges Matched:                 ${summary.collegesMatched}`);
      console.log(`New Colleges Created:             ${summary.collegesCreated}`);
      console.log(`Duplicates Removed:               ${summary.duplicatesRemoved}`);
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

    console.log('\nStep 5: Final verification...');
    const finalMappings = await CollegeCourseMapping.find({ stream: 'Agriculture', isActive: true });
    const finalColleges = await College.find({ stream: 'Agriculture', coursesOffered: { $exists: true, $ne: [] } });
    const agriColleges = await College.find({ streamsOffered: 'Agriculture' });
    console.log(`Active Agriculture mappings: ${finalMappings.length}`);
    console.log(`Colleges with Agriculture courses: ${finalColleges.length}`);
    console.log(`Colleges offering Agriculture stream: ${agriColleges.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

runImport();
