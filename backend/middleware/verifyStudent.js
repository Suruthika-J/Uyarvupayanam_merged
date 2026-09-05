const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Settings = require("../models/Settings");

const verifyStudent = async (req, res, next) => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.maintenanceMode) {
            return res.status(503).json({ 
                success: false, 
                maintenance: true, 
                message: "Platform is under maintenance. Please try again later." 
            });
        }
    } catch (e) {
        // Continue if settings fetch fails
    }

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const secret = process.env.JWT_SECRET || "fallback_secret";
        const decoded = jwt.verify(token, secret);
        req.student = await User.findById(decoded.id).select("-password");

        if (!req.student) {
            return res.status(401).json({ success: false, message: "Student not found" });
        }

        next();
    } catch (error) {
        console.error("Student Token verification failed:", error.message);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

module.exports = verifyStudent;
