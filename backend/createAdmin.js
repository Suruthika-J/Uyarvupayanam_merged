const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const Admin = require("./models/Admin");

dotenv.config({ path: path.join(__dirname, '.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Force delete existing admin (plain text password one)
    const deleted = await Admin.deleteMany({ email: "uyarvupayanam@gmail.com" });
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing admin(s)`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin@123", salt);

    // Create fresh admin
    const admin = new Admin({
      email: "uyarvupayanam@gmail.com",
      password: hashedPassword
    });

    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:    uyarvupayanam@gmail.com");
    console.log("Password: Admin@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();