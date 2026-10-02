const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const AhpCareerProfile = require("../models/AhpCareerProfile");
const AhpFuzzyResult = require("../models/AhpFuzzyResult");
const StudentSkillProgress = require("../models/StudentSkillProgress");
const collegeStudyToolsController = require("../controllers/collegeStudyToolsController");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/uyarvu-payanam";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkeyforuyarvupayanam2026";

async function runDashboardPersonalizationTest() {
  console.log("==================================================");
  console.log("🧪 TESTING PERSONALIZED STUDENT DASHBOARD PIPELINE");
  console.log("==================================================");

  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB Connected:", MONGODB_URI);

  // Mock response object helper
  function createMockRes() {
    const res = { statusCode: 200, data: null };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (payload) => { res.data = payload; return res; };
    return res;
  }

  // Create Student A
  const studentAId = new mongoose.Types.ObjectId();
  await User.deleteMany({ email: "student_a_dash@test.com" });
  await User.create({
    _id: studentAId,
    name: "Ananya Ramesh",
    email: "student_a_dash@test.com",
    password: "hashedpassword123",
    role: "student",
    isVerified: true
  });

  await CollegeStudentProfile.deleteMany({ userId: studentAId });
  await CollegeStudentProfile.create({
    userId: studentAId,
    name: "Ananya Ramesh",
    field: "Computer Science & Engineering",
    degreeProgramme: "B.E. Computer Science & Engineering",
    branch: "Computer Science & Engineering",
    currentYear: 4,
    currentSemester: 7,
    cgpa: "8.85",
    collegeName: "PSG College of Technology",
    skills: ["Python", "SQL", "Pandas"],
    careerInterests: ["AI & Machine Learning"]
  });

  await AhpCareerProfile.deleteMany({ userId: studentAId });
  await AhpCareerProfile.create({
    userId: studentAId,
    topDomain: { id: "ai_ml", name: "AI & Machine Learning", weight: 0.88 },
    secondDomain: { id: "cyber_security", name: "Cybersecurity", weight: 0.79 },
    thirdDomain: { id: "data_science", name: "Data Science", weight: 0.72 }
  });

  await AhpFuzzyResult.deleteMany({ userId: studentAId });
  await AhpFuzzyResult.create({
    userId: studentAId,
    recommendedDomain: {
      domainId: "ai_ml",
      domainName: "AI & Machine Learning",
      score: 0.88,
      category: "AI & Data Science"
    },
    confidenceLevel: "high"
  });

  await StudentSkillProgress.deleteMany({ userId: studentAId });
  await StudentSkillProgress.create({
    userId: studentAId,
    studentId: String(studentAId),
    streak: 5,
    totalFocusMinutes: 120,
    sessionsCompleted: 4
  });

  // Create Student B
  const studentBId = new mongoose.Types.ObjectId();
  await User.deleteMany({ email: "student_b_dash@test.com" });
  await User.create({
    _id: studentBId,
    name: "Bharath Kumar",
    email: "student_b_dash@test.com",
    password: "hashedpassword123",
    role: "student",
    isVerified: true
  });

  await CollegeStudentProfile.deleteMany({ userId: studentBId });
  await CollegeStudentProfile.create({
    userId: studentBId,
    name: "Bharath Kumar",
    field: "Information Technology",
    degreeProgramme: "B.Tech Information Technology",
    branch: "Information Technology",
    currentYear: 3,
    currentSemester: 5,
    cgpa: "7.92",
    collegeName: "Coimbatore Institute of Technology",
    skills: ["JavaScript", "React", "Node.js"],
    careerInterests: ["Full Stack Web & Mobile Development"]
  });

  await AhpCareerProfile.deleteMany({ userId: studentBId });
  await AhpCareerProfile.create({
    userId: studentBId,
    topDomain: { id: "full_stack", name: "Full Stack Web & Mobile", weight: 0.91 },
    secondDomain: { id: "cloud_devops", name: "Cloud Computing & DevOps", weight: 0.84 },
    thirdDomain: { id: "algorithms_systems", name: "Algorithms & Systems", weight: 0.76 }
  });

  await AhpFuzzyResult.deleteMany({ userId: studentBId });
  await AhpFuzzyResult.create({
    userId: studentBId,
    recommendedDomain: {
      domainId: "full_stack",
      domainName: "Full Stack Web & Mobile",
      score: 0.91,
      category: "Web Engineering"
    },
    confidenceLevel: "high"
  });

  await StudentSkillProgress.deleteMany({ userId: studentBId });
  await StudentSkillProgress.create({
    userId: studentBId,
    studentId: String(studentBId),
    streak: 2,
    totalFocusMinutes: 45,
    sessionsCompleted: 1
  });

  console.log("\n--- TEST 1: FETCH STUDENT A DASHBOARD ---");
  const reqA = { student: { _id: studentAId, name: "Ananya Ramesh" } };
  const resA = createMockRes();
  await collegeStudyToolsController.getCollegeDashboardSummary(reqA, resA);

  console.log("Student A Header Name:", resA.data.header.studentName);
  console.log("Student A Degree/Branch:", `${resA.data.header.degreeProgramme} • ${resA.data.header.branch}`);
  console.log("Student A CGPA:", resA.data.header.cgpa);
  console.log("Student A Profile Completion:", resA.data.header.profileCompletion + "%");
  console.log("Student A Streak:", resA.data.header.currentStreak + " Days");
  console.log("Student A Top 3 AHP Domains:", resA.data.ahp.topDomains.map(d => `#${d.rank} ${d.domainName} (${Math.round(d.score > 1 ? d.score : d.score * 100)}%)`));
  console.log("Student A Fuzzy Recommendation:", resA.data.recommendation.career, `(${resA.data.recommendation.suitability}%)`);

  if (resA.data.header.studentName !== "Ananya Ramesh") throw new Error("Student A name mismatch!");
  if (resA.data.header.cgpa !== "8.85") throw new Error("Student A CGPA mismatch!");
  if (resA.data.ahp.topDomains[0].domainId !== "ai_ml") throw new Error("Student A Rank 1 AHP domain mismatch!");
  if (resA.data.recommendation.domainId !== "ai_ml") throw new Error("Student A Fuzzy recommendation mismatch!");
  console.log("✅ TEST 1 PASSED: Student A Dashboard correctly populated with authentic student data!");

  console.log("\n--- TEST 2: FETCH STUDENT B DASHBOARD ---");
  const reqB = { student: { _id: studentBId, name: "Bharath Kumar" } };
  const resB = createMockRes();
  await collegeStudyToolsController.getCollegeDashboardSummary(reqB, resB);

  console.log("Student B Header Name:", resB.data.header.studentName);
  console.log("Student B Degree/Branch:", `${resB.data.header.degreeProgramme} • ${resB.data.header.branch}`);
  console.log("Student B CGPA:", resB.data.header.cgpa);
  console.log("Student B Top 3 AHP Domains:", resB.data.ahp.topDomains.map(d => `#${d.rank} ${d.domainName} (${Math.round(d.score > 1 ? d.score : d.score * 100)}%)`));
  console.log("Student B Fuzzy Recommendation:", resB.data.recommendation.career, `(${resB.data.recommendation.suitability}%)`);

  if (resB.data.header.studentName !== "Bharath Kumar") throw new Error("Student B name mismatch!");
  if (resB.data.header.cgpa !== "7.92") throw new Error("Student B CGPA mismatch!");
  if (resB.data.ahp.topDomains[0].domainId !== "full_stack") throw new Error("Student B Rank 1 AHP domain mismatch!");
  if (resB.data.recommendation.domainId !== "full_stack") throw new Error("Student B Fuzzy recommendation mismatch!");
  console.log("✅ TEST 2 PASSED: Student B Dashboard is distinct and strictly personalized!");

  console.log("\n--- TEST 3: DYNAMIC UPDATE AFTER ASSESSMENT SUBMISSION ---");
  // Update Student A's recommendation after completing a new assessment
  await AhpFuzzyResult.updateOne(
    { userId: studentAId },
    {
      $set: {
        recommendedDomain: {
          domainId: "ai_ml",
          domainName: "AI & Machine Learning Specialist",
          score: 0.94,
          category: "Advanced AI"
        }
      }
    }
  );

  const resAUpdated = createMockRes();
  await collegeStudyToolsController.getCollegeDashboardSummary(reqA, resAUpdated);
  console.log("Updated Student A Fuzzy Recommendation:", resAUpdated.data.recommendation.career, `(${resAUpdated.data.recommendation.suitability}%)`);
  if (resAUpdated.data.recommendation.suitability !== 94) throw new Error("Dashboard failed to reflect post-assessment update!");
  console.log("✅ TEST 3 PASSED: Dashboard updates dynamically upon assessment submission!");

  // Cleanup test documents
  await User.deleteMany({ _id: { $in: [studentAId, studentBId] } });
  await CollegeStudentProfile.deleteMany({ userId: { $in: [studentAId, studentBId] } });
  await AhpCareerProfile.deleteMany({ userId: { $in: [studentAId, studentBId] } });
  await AhpFuzzyResult.deleteMany({ userId: { $in: [studentAId, studentBId] } });
  await StudentSkillProgress.deleteMany({ userId: { $in: [studentAId, studentBId] } });

  await mongoose.disconnect();
  console.log("\n🎉 ALL PERSONALIZED STUDENT DASHBOARD TESTS PASSED CLEANLY!");
}

runDashboardPersonalizationTest().catch(err => {
  console.error("Dashboard Test Error:", err);
  process.exit(1);
});
