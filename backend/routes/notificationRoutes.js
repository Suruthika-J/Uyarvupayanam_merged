const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyStudent = require("../middleware/verifyStudent");

const {
    createNotification,
    getAllNotifications,
    getUserNotifications,
    getNotificationById,
    updateNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getNotificationStats,
} = require("../controllers/notificationController");

// ── Admin-only routes (require verifyAdmin middleware) ──────────────────
// POST   /api/notifications           → create (broadcast or targeted)
router.post("/", verifyAdmin, createNotification);

// GET    /api/notifications           → get all (admin dashboard)
router.get("/", verifyAdmin, getAllNotifications);

// GET    /api/notifications/stats     → dashboard stats widget
router.get("/stats", verifyAdmin, getNotificationStats);

// DELETE /api/notifications           → delete ALL (bulk clear)
router.delete("/", verifyAdmin, deleteAllNotifications);

// ── Public / user-facing routes ─────────────────────────────────────────
// GET    /api/notifications/:id               → single notification
router.get("/:id", verifyStudent, getNotificationById);

// GET    /api/notifications/user/:userId      → all notifications for a user
router.get("/user/:userId", verifyStudent, getUserNotifications);

// PUT    /api/notifications/:id               → edit title/message/type/isRead
router.put("/:id", verifyAdmin, updateNotification);

// PUT    /api/notifications/:id/read          → mark single as read
router.put("/:id/read", verifyStudent, markAsRead);

// PUT    /api/notifications/user/:userId/read-all → mark all as read for user
router.put("/user/:userId/read-all", verifyStudent, markAllAsRead);

// DELETE /api/notifications/:id              → delete one
router.delete("/:id", verifyAdmin, deleteNotification);

module.exports = router;
