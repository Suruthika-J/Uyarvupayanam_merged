// ============================================================================
// Recommendation Controller (School Module)
// Thin wrapper around the academic recommendation service. It only parses the
// request (studentId + optional studyMinutes), delegates the heavy lifting to
// the service, and shapes the HTTP response.
// ============================================================================

const academicRecommendationService = require("../services/academicRecommendationService");

// GET /api/recommendations/:studentId?studyMinutes=120
exports.getRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { studyMinutes } = req.query;

    // Validate the id to avoid pointless DB queries / confusing errors.
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const result = await academicRecommendationService.buildAcademicRecommendations({
      userId: studentId,
      studyMinutes,
    });

    // Service-level terminal state: the student does not exist.
    if (result.status && result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    return res.json(result);
  } catch (error) {
    // Never leak internals; report a clean 500.
    console.error("Academic recommendation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate academic recommendations",
    });
  }
};