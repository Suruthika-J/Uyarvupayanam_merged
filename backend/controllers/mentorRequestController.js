const MentorRequest = require("../models/MentorRequest");
const AdminNotification = require("../models/AdminNotification");

// @desc    Create new mentor request (User Side)
// @route   POST /api/mentor-requests
exports.createMentorRequest = async (req, res) => {
  try {
    const { 
      userId, studentName, email, phone, 
      classLevel, interest, message, preferredContact 
    } = req.body;

    if (!studentName || !email || !phone || !classLevel || !interest || !message) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    const newRequest = await MentorRequest.create({
      userId: userId || null,
      studentName,
      email,
      phone,
      classLevel,
      interest,
      message,
      preferredContact: preferredContact || "Phone"
    });

    // Create Admin Notification
    try {
      await AdminNotification.create({
        title: "New Guidance Request",
        message: `Student ${studentName} has requested mentor guidance for ${interest}.`,
        type: "mentor_request",
        link: "/admin/mentor-requests"
      });

      // Socket notification to admins
      const io = req.app.get("io");
      if (io) {
        io.to("admins").emit("new_admin_notification", {
          title: "New Guidance Request",
          message: `Student ${studentName} has requested mentor guidance for ${interest}.`,
          type: "mentor_request",
        });
      }
    } catch (notifErr) {
      console.warn("Failed to create admin notification for mentor request:", notifErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: "Your guidance request has been submitted successfully. Our mentor/admin will contact you soon.",
      data: newRequest 
    });
  } catch (error) {
    console.error("Error creating mentor request:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all mentor requests (Admin Side)
// @route   GET /api/mentor-requests
exports.getAllMentorRequests = async (req, res) => {
  try {
    const requests = await MentorRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get requests for a specific user (User Side Dashboard)
// @route   GET /api/mentor-requests/user/:userId
exports.getUserMentorRequests = async (req, res) => {
  try {
    const requests = await MentorRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single mentor request detail (Admin)
// @route   GET /api/mentor-requests/:id
exports.getMentorRequestById = async (req, res) => {
  try {
    const request = await MentorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update mentor request status/notes/mentor (Admin)
// @route   PUT /api/mentor-requests/:id
exports.updateMentorRequest = async (req, res) => {
  try {
    const { status, assignedMentor, adminNotes } = req.body;
    const request = await MentorRequest.findByIdAndUpdate(
      req.params.id,
      { status, assignedMentor, adminNotes },
      { new: true, runValidators: true }
    );

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // Optional: Notify user about status change via socket or notification model (if implemented)

    res.status(200).json({ success: true, message: "Request updated successfully", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete mentor request (Admin)
// @route   DELETE /api/mentor-requests/:id
exports.deleteMentorRequest = async (req, res) => {
  try {
    const request = await MentorRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
