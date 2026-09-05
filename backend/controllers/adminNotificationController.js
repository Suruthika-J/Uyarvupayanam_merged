const AdminNotification = require("../models/AdminNotification");

// GET /api/admin/notifications
// Return all admin notifications sorted by newest first
exports.getAllAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    res.status(500).json({ message: "Failed to fetch admin notifications" });
  }
};

// PUT /api/admin/notifications/:id/read
// Mark a single admin notification as read
exports.markAdminNotificationRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Marked as read", notification });
  } catch (error) {
    console.error("Mark admin notification read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};
