const User = require("../models/User");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const Recommendation = require("../models/Recommendation");
const StudentActivityHistory = require("../models/StudentActivityHistory");
const StudentSkillProgress = require("../models/StudentSkillProgress");
const StudentTestResult = require("../models/StudentTestResult");
const SavedItem = require("../models/SavedItem");
const Notification = require("../models/Notification");
const AcademicTaxonomy = require("../models/AcademicTaxonomy");

/**
 * ── GET /api/admin/college/students ─────────────────────────────────────────
 * Returns filtered, searched, sorted, and paginated list of College Students
 */
exports.getCollegeStudents = async (req, res) => {
  try {
    const {
      search,
      field,
      degree,
      domain,
      specialization,
      college,
      year,
      status,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    // 1. Base User Filter: strictly college_student or graduate
    const userQuery = {
      role: "student",
      userType: { $in: ["college_student", "graduate"] }
    };

    if (status && status !== "all") {
      userQuery.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      userQuery.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } }
      ];
    }

    // 2. Fetch Users
    const users = await User.find(userQuery).select("-password").lean();
    const userIds = users.map(u => u._id);

    // 3. Profile Query
    const profileQuery = { userId: { $in: userIds } };

    if (field && field !== "all") {
      profileQuery.field = { $regex: field, $options: "i" };
    }
    if (degree && degree !== "all") {
      profileQuery.degreeProgramme = { $regex: degree, $options: "i" };
    }
    if (domain && domain !== "all") {
      profileQuery.domain = { $regex: domain, $options: "i" };
    }
    if (specialization && specialization !== "all") {
      profileQuery.specialization = { $regex: specialization, $options: "i" };
    }
    if (college && college !== "all") {
      profileQuery.institution = { $regex: college, $options: "i" };
    }
    if (year && year !== "all") {
      profileQuery.currentYear = { $regex: year, $options: "i" };
    }

    const profiles = await CollegeStudentProfile.find(profileQuery).lean();
    const profileMap = new Map();
    profiles.forEach(p => profileMap.set(p.userId.toString(), p));

    // 4. Combine & Filter Users based on Profile filters
    let combined = users.map(u => {
      const p = profileMap.get(u._id.toString()) || {};
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        status: u.status || "active",
        userType: u.userType,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        institution: p.institution || "Not Configured",
        institutionDistrict: p.institutionDistrict || "",
        field: p.field || "Engineering",
        degreeProgramme: p.degreeProgramme || "Not Specified",
        domain: p.domain || "General",
        specialization: p.specialization || "General",
        currentYear: p.currentYear || "1st Year",
        studyMode: p.studyMode || "Full-time",
        profileCompletion: p.profileCompletion || 0,
        isCompleted: !!p.isCompleted,
        skillsCount: p.skills ? p.skills.length : 0,
        hasProfile: !!p._id
      };
    });

    // If specific profile filters were applied, filter out users without matching profiles
    const hasProfileFilters = field || degree || domain || specialization || college || year;
    if (hasProfileFilters) {
      const matchingUserIds = new Set(profiles.map(p => p.userId.toString()));
      combined = combined.filter(c => matchingUserIds.has(c._id.toString()));
    }

    // 5. Sorting
    combined.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (order === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    // 6. Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const total = combined.length;
    const paginated = combined.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // 7. Get unique dropdown filter values for frontend filters
    const allProfiles = await CollegeStudentProfile.find({}).lean();
    const filterOptions = {
      fields: [...new Set(allProfiles.map(p => p.field).filter(Boolean))],
      degrees: [...new Set(allProfiles.map(p => p.degreeProgramme).filter(Boolean))],
      domains: [...new Set(allProfiles.map(p => p.domain).filter(Boolean))],
      colleges: [...new Set(allProfiles.map(p => p.institution).filter(Boolean))],
      years: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
    };

    res.json({
      success: true,
      students: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      filterOptions
    });
  } catch (error) {
    console.error("Get College Students Admin Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch college students" });
  }
};

/**
 * ── GET /api/admin/college/students/:id ──────────────────────────────────────
 * Returns deep comprehensive profile for a College Student (7 tabs data)
 */
exports.getCollegeStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Base User
    const user = await User.findById(studentId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 2. College Profile
    const profile = await CollegeStudentProfile.findOne({ userId: studentId }).lean();

    // 3. Career Recommendation
    const recommendation = await Recommendation.findOne({ userId: studentId })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Test Results / Assessments
    const testResults = await StudentTestResult.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .lean();

    // 5. Activity History
    const activities = await StudentActivityHistory.find({ userId: studentId })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    // 6. Saved Items / Bookmarks
    const savedItems = await SavedItem.find({ userId: studentId }).lean();

    // 7. Skill Progress
    const skillProgress = await StudentSkillProgress.find({ userId: studentId }).lean();

    // 8. Notifications Sent
    const notifications = await Notification.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      user,
      profile: profile || {
        institution: "Not Configured",
        field: "Engineering",
        degreeProgramme: "Not Specified",
        domain: "General",
        specialization: "General",
        currentYear: "1st Year",
        studyMode: "Full-time",
        skills: [],
        academicInterests: [],
        careerInterests: [],
        strengths: [],
        profileCompletion: 0,
        isCompleted: false
      },
      recommendation,
      testResults,
      activities,
      savedItems,
      skillProgress,
      notifications
    });
  } catch (error) {
    console.error("Get College Student Deep Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch student details" });
  }
};

/**
 * ── PUT /api/admin/college/students/:id ──────────────────────────────────────
 * Admin edit for a College Student's Profile & User Account
 */
exports.updateCollegeStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      name,
      email,
      status,
      institution,
      institutionDistrict,
      field,
      degreeProgramme,
      domain,
      specialization,
      currentYear,
      studyMode,
      skills,
      academicInterests,
      careerInterests
    } = req.body;

    // Update User Model
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (status) user.status = status;
    await user.save();

    // Upsert CollegeStudentProfile Model
    let profile = await CollegeStudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = new CollegeStudentProfile({ userId: studentId, field: field || "Engineering", degreeProgramme: degreeProgramme || "B.Tech" });
    }

    if (institution !== undefined) profile.institution = institution;
    if (institutionDistrict !== undefined) profile.institutionDistrict = institutionDistrict;
    if (field !== undefined) profile.field = field;
    if (degreeProgramme !== undefined) profile.degreeProgramme = degreeProgramme;
    if (domain !== undefined) profile.domain = domain;
    if (specialization !== undefined) profile.specialization = specialization;
    if (currentYear !== undefined) profile.currentYear = currentYear;
    if (studyMode !== undefined) profile.studyMode = studyMode;
    if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
    if (academicInterests !== undefined) profile.academicInterests = Array.isArray(academicInterests) ? academicInterests : academicInterests.split(",").map(s => s.trim());
    if (careerInterests !== undefined) profile.careerInterests = Array.isArray(careerInterests) ? careerInterests : careerInterests.split(",").map(s => s.trim());

    await profile.save();

    res.json({
      success: true,
      message: "College student updated successfully",
      user,
      profile
    });
  } catch (error) {
    console.error("Update College Student Error:", error);
    res.status(500).json({ success: false, message: "Failed to update college student" });
  }
};

/**
 * ── PATCH /api/admin/college/students/:id/status ────────────────────────────
 * Quick toggle account status (active / blocked)
 */
exports.toggleStudentStatus = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { status } = req.body; // "active" or "blocked"

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ success: false, message: "Student not found" });

    user.status = status || (user.status === "active" ? "blocked" : "active");
    await user.save();

    res.json({
      success: true,
      message: `Student account ${user.status === "active" ? "activated" : "deactivated"} successfully`,
      status: user.status
    });
  } catch (error) {
    console.error("Toggle Student Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to change student status" });
  }
};

/**
 * ── POST /api/admin/college/students/:id/notify ─────────────────────────────
 * Send custom notification to a specific College Student
 */
exports.sendStudentNotification = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { title, message, type = "info" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and Message are required" });
    }

    const notification = new Notification({
      userId: studentId,
      title,
      message,
      type,
      read: false
    });
    await notification.save();

    res.json({
      success: true,
      message: "Notification sent successfully",
      notification
    });
  } catch (error) {
    console.error("Send Student Notification Error:", error);
    res.status(500).json({ success: false, message: "Failed to send notification" });
  }
};
