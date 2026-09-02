const Admin = require("../models/Admin");
const User = require("../models/User");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const Scholarship = require("../models/Scholarship");
const Activity = require("../models/Activity");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.dashboardStats = async (req, res) => {
  try {
    // 1. Total students & breakdown by category
    const totalStudents = await User.countDocuments({ role: "student" });
    const schoolStudents = await User.countDocuments({ role: "student", $or: [{ userType: "school_student" }, { userType: { $exists: false } }] });
    const collegeStudents = await User.countDocuments({ role: "student", userType: "college_student" });
    const graduates = await User.countDocuments({ role: "student", userType: "graduate" });

    // 2. Active courses count
    const activeCourses = await Course.countDocuments();

    // 3. Exams count
    const examsCount = await Exam.countDocuments();

    // 4. Scholarships count
    const scholarshipsCount = await Scholarship.countDocuments();

    // 5. Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      { $match: { role: "student", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const registrationData = monthlyRegistrations.map((item) => ({
      month: monthNames[item._id.month - 1],
      count: item.count,
    }));

    // 6. Level distribution (percentage)
    const levelAgg = await User.aggregate([
      { $match: { role: "student", classLevel: { $exists: true, $ne: null } } },
      { $group: { _id: "$classLevel", count: { $sum: 1 } } },
    ]);

    const totalWithLevel = levelAgg.reduce((sum, l) => sum + l.count, 0);
    const levelDistribution = levelAgg.map((l) => ({
      level: l._id,
      percentage: totalWithLevel > 0 ? Math.round((l.count / totalWithLevel) * 100) : 0,
    }));

    // 7. Recent activities (latest 5)
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 8. Popular careers (top 5)
    const popularCareers = await User.aggregate([
      { $match: { role: "student", selectedCareer: { $exists: true, $ne: null } } },
      { $group: { _id: "$selectedCareer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    res.json({
      totalStudents,
      schoolStudents,
      collegeStudents,
      graduates,
      activeCourses,
      examsCount,
      scholarshipsCount,
      monthlyRegistrations: registrationData,
      levelDistribution,
      recentActivities,
      popularCareers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// ── User Management ──

exports.getUsers = async (req, res) => {
  try {
    const { search, status, userType, field } = req.query;

    if (userType === "administrator") {
      const adminFilter = {};
      if (search) {
        adminFilter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      const admins = await Admin.find(adminFilter).select("-password").sort({ createdAt: -1 });
      const mappedAdmins = admins.map(a => ({
        _id: a._id,
        name: a.name || "Admin User",
        email: a.email,
        userType: "administrator",
        status: a.isActive ? "active" : "blocked",
        role: a.role,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }));
      return res.json(mappedAdmins);
    }
    
    // Allow users that either have role "student" explicitly or don't have a role set yet
    const roleCondition = { $or: [{ role: "student" }, { role: { $exists: false } }] };
    const conditions = [roleCondition];

    if (status && status !== "all") {
      if (status === "active") {
        conditions.push({ $or: [{ status: "active" }, { status: { $exists: false } }] });
      } else {
        conditions.push({ status: status });
      }
    }

    if (userType && userType !== "all") {
      if (userType === "school_student") {
        conditions.push({ $or: [{ userType: "school_student" }, { userType: { $exists: false } }] });
      } else {
        conditions.push({ userType: userType });
      }
    }

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ]
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const CollegeStudentProfile = require("../models/CollegeStudentProfile");
    const Recommendation = require("../models/Recommendation");

    let collegeProfile = null;
    let recommendation = null;

    if (user.userType === "college_student" || user.userType === "graduate") {
      collegeProfile = await CollegeStudentProfile.findOne({ userId: user._id });
    }

    recommendation = await Recommendation.findOne({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      collegeProfile,
      recommendation
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "blocked" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User blocked successfully", user });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ message: "Failed to block user" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User unblocked successfully", user });
  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({ message: "Failed to unblock user" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password reset successfully", user });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const matches = await bcrypt.compare(currentPassword, admin.password);
    if (!matches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

exports.createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await Admin.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Admin email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const subAdmin = await Admin.create({
      name: name || "Sub Admin",
      email: String(email).toLowerCase(),
      password: hashed,
      role: "sub_admin",
      permissions: {
        manageUsers: Boolean(permissions.manageUsers),
        manageSettings: Boolean(permissions.manageSettings),
        manageContent: Boolean(permissions.manageContent),
        manageNotifications: Boolean(permissions.manageNotifications),
        viewReports: Boolean(permissions.viewReports),
      },
      createdBy: req.admin._id,
      isActive: true,
    });

    return res.status(201).json({
      message: "Sub-admin created successfully",
      subAdmin: {
        id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        role: subAdmin.role,
        permissions: subAdmin.permissions,
        isActive: subAdmin.isActive,
        createdAt: subAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error("Create sub-admin error:", error);
    return res.status(500).json({ message: "Failed to create sub-admin" });
  }
};

exports.getSubAdmins = async (req, res) => {
  try {
    const subAdmins = await Admin.find({ role: "sub_admin" })
      .select("name email role permissions isActive createdAt createdBy")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ count: subAdmins.length, subAdmins });
  } catch (error) {
    console.error("Get sub-admins error:", error);
    return res.status(500).json({ message: "Failed to fetch sub-admins" });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const subAdmin = await Admin.findOne({ _id: id, role: "sub_admin" });
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    await Admin.deleteOne({ _id: id });

    return res.json({ message: "Sub-admin deleted successfully" });
  } catch (error) {
    console.error("Delete sub-admin error:", error);
    return res.status(500).json({ message: "Failed to delete sub-admin" });
  }
};

exports.getRegistrationReport = async (req, res) => {
  try {
    const totalRegistrations = await User.countDocuments({ role: "student" });

    const monthNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    let monthlyObj = {};
    
    // Create the last 6 months keys ordered.
    for(let i=5; i>=0; i--) {
        let d = new Date();
        d.setMonth(d.getMonth() - i);
        monthlyObj[monthNames[d.getMonth()]] = 0;
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyData = await User.aggregate([
      { $match: { role: "student", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    monthlyData.forEach(item => {
      let mName = monthNames[item._id.month - 1];
      if (monthlyObj[mName] !== undefined) {
         monthlyObj[mName] = item.count;
      }
    });

    const courseInterestStatsAgg = await User.aggregate([
      { $match: { role: "student", selectedCareer: { $exists: true, $ne: null } } },
      { $group: { _id: "$selectedCareer", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const courseInterestStats = courseInterestStatsAgg.map(item => ({ course: item._id, count: item.count }));

    const stateStatsAgg = await User.aggregate([
      { $match: { role: "student", district: { $exists: true, $ne: null } } },
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const stateStats = stateStatsAgg.map(item => ({ state: item._id, count: item.count }));

    const students = await User.find({ role: "student" }).select("name email selectedCareer district createdAt").sort({ createdAt: -1 });
    const formattedStudents = students.map(s => ({
      name: s.name,
      email: s.email,
      courseInterest: s.selectedCareer || "N/A",
      state: s.district || "N/A",
      createdAt: s.createdAt ? s.createdAt.toISOString().split('T')[0] : "N/A"
    }));

    res.json({
      totalRegistrations,
      monthlyRegistrations: monthlyObj,
      courseInterestStats,
      stateStats,
      students: formattedStudents
    });

  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

exports.getPopularCoursesReport = async (req, res) => {
  try {
    const popularCoursesAgg = await User.aggregate([
      { $match: { role: "student", selectedCareer: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$selectedCareer", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Formatting to map _id to course, and count to students
    const popularCourses = popularCoursesAgg.map(item => ({
      course: item._id,
      students: item.count
    }));

    res.json({ popularCourses });
  } catch (error) {
    console.error("Failed to generate popular courses report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

exports.getScholarshipsReport = async (req, res) => {
  try {
    const ScholarshipApplication = require("../models/ScholarshipApplication");

    const totalApplications = await ScholarshipApplication.countDocuments();

    const scholarshipsAgg = await ScholarshipApplication.aggregate([
      { $group: { _id: "$scholarshipName", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const scholarships = scholarshipsAgg.map(item => ({
      scholarship: item._id,
      applications: item.count
    }));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyApplicationsAgg = await ScholarshipApplication.aggregate([
      {
        $group: {
          _id: { month: { $month: "$appliedDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const monthlyApplications = monthlyApplicationsAgg.map(item => ({
      month: monthNames[item._id.month - 1] || "Unknown",
      count: item.count
    }));

    res.json({
      totalApplications,
      scholarships,
      monthlyApplications
    });
  } catch (error) {
    console.error("Failed to generate scholarships report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};


