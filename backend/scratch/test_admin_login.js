const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Admin = require("../models/Admin");

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "uyarvupayanam@gmail.com";
        const password = "Admin@123";

        console.log("Searching for admin:", email);
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log("Admin not found. Creating one...");
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new Admin({
                email,
                password: hashedPassword,
                role: "Admin",
            });
            await newAdmin.save();
            console.log("Admin created.");
            return;
        }

        console.log("Comparing password...");
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("Is match:", isMatch);

        console.log("Signing token...");
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        console.log("Token generated:", token.substring(0, 20) + "...");

        console.log("Test passed!");
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testLogin();
