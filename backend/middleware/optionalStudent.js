const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Identifies the student from the Bearer token when one is present, but never
// blocks the request. Sets `req.student` (school student identity) so public
// list endpoints can quietly scope results to the student's academic level
// without turning them into authenticated-only endpoints.
const optionalStudent = async (req, res, next) => {
  req.student = null;

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next();

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const decoded = jwt.verify(token, secret);
    req.student = await User.findById(decoded.id).select("-password");
  } catch (error) {
    // Invalid / expired / admin token -> treat as unauthenticated, do not block.
    req.student = null;
  }

  next();
};

module.exports = optionalStudent;