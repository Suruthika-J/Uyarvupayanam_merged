const User = require("../models/User");
const AdminNotification = require("../models/AdminNotification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerStudent = async (req, res) => {
  try {
    const { name, email, password, userType, classLevel, district } = req.body;

    // Check if student exists
    const existingStudent = await User.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Validate userType enum
    const validUserTypes = ["school_student", "college_student", "graduate"];
    const finalUserType = validUserTypes.includes(userType) ? userType : "school_student";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student (Strictly role="student", preventing role escalation)
    const student = new User({
      name,
      email,
      password: hashedPassword,
      userType: finalUserType,
      classLevel: classLevel || "",
      district: district || "",
      role: "student",
      status: "active"
    });

    await student.save();

    // Create admin notification for new student registration
    try {
      await AdminNotification.create({
        title: "New Student Registration",
        message: `A new student ${name} (${finalUserType}) has registered.`,
        type: "student_registration",
      });

      // Emit real-time socket event to admin if available
      const io = req.app.get("io");
      if (io) {
        io.to("admins").emit("new_admin_notification", {
          title: "New Student Registration",
          message: `A new student ${name} (${finalUserType}) has registered.`,
          type: "student_registration",
        });
      }
    } catch (notifErr) {
      console.warn("Failed to create admin notification:", notifErr.message);
    }

    res.status(201).json({ 
        message: "Student registered successfully",
        user: {
            id: student._id,
            name: student.name,
            email: student.email,
            userType: student.userType,
            onboardingCompleted: student.onboardingCompleted
        }
    });
  } catch (error) {
    console.error("Error in student registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student
    const student = await User.findOne({ email, role: "student" });
    if (!student) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (student.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked by admin" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        _id: student._id,
        name: student.name,
        email: student.email,
        userType: student.userType || "school_student",
        classLevel: student.classLevel,
        district: student.district,
        onboardingCompleted: student.onboardingCompleted
      },
    });
  } catch (error) {
    console.error("Error in student login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
};
