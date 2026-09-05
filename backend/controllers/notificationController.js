const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotificationEmail } = require("../config/mailer");

// ─────────────────────────────────────────────────────────────────────────
// Helper: Emit a socket event ONLY to a specific user room (not admin/global)
//
//   Users join room "user_<userId>" when they connect.
//   Admin NEVER joins any user room, so admin does NOT receive these events.
//   For broadcasts we iterate and emit per-user (or use a "students" room).
// ─────────────────────────────────────────────────────────────────────────
const emitToUser = (req, userId, event, data) => {
    try {
        const io = req.app.get("io");
        if (io && userId) {
            io.to(`user_${userId}`).emit(event, data);
        }
    } catch (e) {
        console.warn("Socket emit error:", e.message);
    }
};

// Emit to every connected user room (all students, but NOT admin)
const emitToAllStudents = (req, event, data) => {
    try {
        const io = req.app.get("io");
        if (io) {
            // "students" room — users join this when they connect as a student
            io.to("students").emit(event, data);
        }
    } catch (e) {
        console.warn("Socket broadcast error:", e.message);
    }
};

// Emit ONLY to connected admin tabs — for multi-tab state sync
// Admin joins the "admins" room on connect. Students are NEVER in this room.
const emitToAdmins = (req, event, data) => {
    try {
        const io = req.app.get("io");
        if (io) io.to("admins").emit(event, data);
    } catch (e) {
        console.warn("Socket admin emit error:", e.message);
    }
};

// ─────────────────────────────────────────────────────────────────────────
// CREATE notification
// POST /api/notifications
// Body: { title, message, type, targetLevel, userId?, isBroadcast?, expiresAt? }
//
// Behaviour:
//   - If userId is given → targeted (only that student)
//   - If isBroadcast is true (or no userId given) → sent to ALL active students
//   - Admin is NEVER a recipient in either case
// ─────────────────────────────────────────────────────────────────────────
exports.createNotification = async (req, res) => {
    try {
        const { title, message, type, targetLevel, userId, isBroadcast, expiresAt } =
            req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        // Determine mode: broadcast when no userId given OR isBroadcast explicitly true
        const broadcastMode = isBroadcast === true || !userId;

        // ── Guard: never allow admin _id as a userId target ─────────────────
        if (userId && !broadcastMode) {
            const targetUser = await User.findById(userId).select("role").lean();
            if (!targetUser) {
                return res.status(404).json({ message: "Target user not found" });
            }
            if (targetUser.role === "admin") {
                return res
                    .status(400)
                    .json({ message: "Cannot send notifications to admin accounts" });
            }
        }

        const notifData = {
            title,
            message,
            type: type || "announcement",
            targetLevel: targetLevel || "All",
            isBroadcast: broadcastMode,
            expiresAt: expiresAt || null,
            sentByAdmin: true,
            userId: broadcastMode ? null : userId,
        };

        const notification = await Notification.create(notifData);

        // ── Real-time: send ONLY to student(s), never to admin ───────────────
        if (broadcastMode) {
            // Emit to the shared "students" Socket.io room
            emitToAllStudents(req, "new_notification", notification);

            // Email: all active students matching target level
            const emailFilter = { role: "student", status: "active" };
            if (targetLevel && targetLevel !== "All") {
                emailFilter.classLevel = targetLevel;
            }
            const users = await User.find(emailFilter).select("name email");
            const emailPromises = users.map((u) =>
                sendNotificationEmail(u.email, u.name, notification)
            );
            Promise.allSettled(emailPromises).then((results) => {
                const failed = results.filter((r) => r.status === "rejected").length;
                if (failed > 0) console.warn(`⚠️  ${failed} email(s) failed to send.`);
                else console.log(`✉️  Broadcast email sent to ${users.length} student(s).`);
            });
        } else {
            // Targeted: emit only to that specific user's room
            emitToUser(req, userId, "new_notification", notification);

            // Email only the target student
            const user = await User.findById(userId).select("name email");
            if (user) {
                sendNotificationEmail(user.email, user.name, notification).catch((e) =>
                    console.warn("Email send error:", e.message)
                );
            }
        }

        // Sync all admin browser tabs so they see the new entry immediately
        emitToAdmins(req, "admin_notification_created", notification);

        res.status(201).json({ message: "Notification created", notification });
    } catch (error) {
        console.error("Create notification error:", error);
        res.status(500).json({ message: "Failed to create notification" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// GET all notifications (admin dashboard — shows every notification SENT)
// GET /api/notifications
// ─────────────────────────────────────────────────────────────────────────
exports.getAllNotifications = async (req, res) => {
    try {
        const { type, targetLevel, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (type && type !== "all") filter.type = type;
        if (targetLevel && targetLevel !== "All") filter.targetLevel = targetLevel;

        const total = await Notification.countDocuments(filter);
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        res.json({ total, page: Number(page), notifications });
    } catch (error) {
        console.error("Get all notifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// GET notifications for a specific USER (student-facing)
// GET /api/notifications/user/:userId
//
// Returns:
//   - Broadcast notifications matching the user's class level
//   - Personal notifications sent directly to this user
//   - NEVER returns admin-only data
// ─────────────────────────────────────────────────────────────────────────
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!userId || userId === 'undefined' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Validate: only students have notifications
        const user = await User.findById(userId).select("role classLevel").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role === "admin") {
            return res.status(403).json({
                message: "Admin accounts do not have a user notification inbox",
            });
        }

        const classLevel = user.classLevel;
        const levelFilter = classLevel
            ? { $in: ["All", classLevel] }
            : { $in: ["All"] };

        // Combine: broadcast (level-matched) OR directly targeted to this user
        const filter = {
            $or: [
                { isBroadcast: true, targetLevel: levelFilter },
                { userId, isBroadcast: false },
            ],
        };

        const total = await Notification.countDocuments(filter);
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const unreadCount = await Notification.countDocuments({
            ...filter,
            isRead: false,
        });

        res.json({ total, unreadCount, page: Number(page), notifications });
    } catch (error) {
        console.error("Get user notifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// GET single notification by ID
// GET /api/notifications/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id).lean();
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notification" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// UPDATE notification (admin edits title/message/type etc.)
// PUT /api/notifications/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateNotification = async (req, res) => {
    try {
        const allowed = ["title", "message", "type", "targetLevel", "isRead", "expiresAt"];
        const updates = {};
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Emit update only to the affected user(s) — not to admin
        if (notification.isBroadcast) {
            emitToAllStudents(req, "notification_updated", notification);
        } else if (notification.userId) {
            emitToUser(req, String(notification.userId), "notification_updated", notification);
        }

        res.json({ message: "Notification updated", notification });
    } catch (error) {
        console.error("Update notification error:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// MARK AS READ (student marks their notification as read)
// PUT /api/notifications/:id/read
// ─────────────────────────────────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Emit only to the user who read it
        const targetId = notification.userId
            ? String(notification.userId)
            : null;
        if (targetId) {
            emitToUser(req, targetId, "notification_read", { id: req.params.id });
        }

        res.json({ message: "Marked as read", notification });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// MARK ALL AS READ for a specific user
// PUT /api/notifications/user/:userId/read-all
// ─────────────────────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        // Guard: only allow for student accounts
        const user = await User.findById(userId).select("role").lean();
        if (!user || user.role === "admin") {
            return res
                .status(403)
                .json({ message: "This action is only available for student accounts" });
        }

        await Notification.updateMany(
            { $or: [{ userId }, { isBroadcast: true }], isRead: false },
            { isRead: true }
        );

        emitToUser(req, userId, "notifications_all_read", { userId });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark all as read" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE a single notification
// DELETE /api/notifications/:id
// ─────────────────────────────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Notify affected students that this notification was removed
        if (notification.isBroadcast) {
            emitToAllStudents(req, "notification_deleted", { id: req.params.id });
        } else if (notification.userId) {
            emitToUser(
                req,
                String(notification.userId),
                "notification_deleted",
                { id: req.params.id }
            );
        }
        // Sync admin tabs
        emitToAdmins(req, "admin_notification_deleted", { id: req.params.id });

        res.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ message: "Failed to delete notification" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE ALL notifications (admin bulk clear)
// DELETE /api/notifications
// ─────────────────────────────────────────────────────────────────────────
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        // Inform all students their notifications were cleared
        emitToAllStudents(req, "notifications_cleared", {});
        // Sync admin tabs
        emitToAdmins(req, "admin_notifications_cleared", {});
        res.json({ message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear notifications" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// GET notification stats (admin dashboard widget)
// GET /api/notifications/stats
//
// Returns:
//   totalSent      → all notifications ever created (broadcasts count as 1)
//   broadcasts     → count of broadcast notifications
//   targeted       → count of personally-targeted notifications
//   studentsReached→ estimated students reached (broadcast × studentCount)
//   unread         → notifications not yet read by any recipient
//   byType         → breakdown by notification type
//   recentActivity → last 7 days count
// ─────────────────────────────────────────────────────────────────────────
exports.getNotificationStats = async (req, res) => {
    try {
        const totalSent = await Notification.countDocuments();
        const broadcasts = await Notification.countDocuments({ isBroadcast: true });
        const targeted = await Notification.countDocuments({ isBroadcast: false });
        const unread = await Notification.countDocuments({ isRead: false });
        const read = Math.max(0, totalSent - unread);

        // How many active students exist (for "students reached" estimation)
        const activeStudents = await User.countDocuments({
            role: "student",
            status: "active",
        });

        // Breakdown by type
        const byType = await Notification.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Notifications sent in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentActivity = await Notification.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        // Notifications sent today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const sentToday = await Notification.countDocuments({
            createdAt: { $gte: todayStart },
        });

        res.json({
            totalSent,
            total: totalSent,
            broadcasts,
            targeted,
            unread,
            read,
            activeStudents,
            byType,
            recentActivity,
            sentToday,
        });
    } catch (error) {
        console.error("Notification stats error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
