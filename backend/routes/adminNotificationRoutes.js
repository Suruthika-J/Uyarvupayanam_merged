const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");

const {
  getAllAdminNotifications,
  markAdminNotificationRead,
} = require("../controllers/adminNotificationController");

// GET  /api/admin/notifications          → all admin notifications (newest first)
router.get("/", verifyAdmin, getAllAdminNotifications);

// PUT  /api/admin/notifications/:id/read → mark one as read
router.put("/:id/read", verifyAdmin, markAdminNotificationRead);

module.exports = router;
