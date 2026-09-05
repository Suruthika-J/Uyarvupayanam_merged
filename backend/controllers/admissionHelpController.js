const AdmissionHelpRequest = require("../models/AdmissionHelpRequest");

// @desc    Create a new admission help request
// @route   POST /api/admission-help
// @access  Public
exports.createRequest = async (req, res) => {
  try {
    const { name, phone, email, cutoff, preferredCourse, preferredLocation, collegeId, userId } = req.body;

    const request = await AdmissionHelpRequest.create({
      name,
      phone,
      email,
      cutoff,
      preferredCourse,
      preferredLocation,
      collegeId,
      userId
    });

    res.status(201).json({
      success: true,
      message: "Admission help request submitted successfully. Our counselor will contact you shortly.",
      data: request
    });
  } catch (error) {
    console.error("Create admission request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit admission request"
    });
  }
};

// @desc    Get all admission requests (Admin only)
// @route   GET /api/admin/admission-help
// @access  Private/Admin
exports.getAllRequests = async (req, res) => {
  try {
    const { status, collegeId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (collegeId) filter.collegeId = collegeId;

    const requests = await AdmissionHelpRequest.find(filter)
      .populate("collegeId", "collegeName collegeCode")
      .populate("userId", "name email")
      .sort("-createdAt");

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admission requests"
    });
  }
};

// @desc    Update request status
// @route   PATCH /api/admin/admission-help/:id
// @access  Private/Admin
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["Pending", "Contacted", "Closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const request = await AdmissionHelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
};
