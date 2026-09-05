const CareerPath = require("../models/CareerPath");

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildCareerPathPayload(body = {}, existing = null) {
  return {
    title: body.title?.trim() || existing?.title || "",
    level: body.level?.trim() || existing?.level || "",
    description: body.description?.trim() || existing?.description || "",
    careerDirections: normalizeList(body.careerDirections || existing?.careerDirections),
    suggestedSkills: normalizeList(body.suggestedSkills || existing?.suggestedSkills),
    relatedScholarships: body.relatedScholarships || existing?.relatedScholarships || [],
    image: body.image?.trim() || existing?.image || "",
    status: body.status || existing?.status || "draft",
    interestArea: body.interestArea || existing?.interestArea || "General",
    sections: body.sections || existing?.sections || [],
  };
}

function validateCareerPathPayload(payload) {
  if (!payload.title || !payload.level || !payload.description) {
    return "Title, level, and description are required";
  }
  const validLevels = ["5th", "8th", "10th", "12th"];
  if (!validLevels.includes(payload.level)) {
    return "Level must be one of: 5th, 8th, 10th, 12th";
  }
  return null;
}

exports.createCareerPath = async (req, res) => {
  try {
    const payload = buildCareerPathPayload(req.body);
    const validationError = validateCareerPathPayload(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Logic: If only one career path should exist per level, update existing.
    // We'll check if a record with this level already exists.
    // If the body doesn't specify otherwise, we'll treat it as a level update if it exists.
    const existing = await CareerPath.findOne({ level: payload.level });
    
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      return res.status(200).json({
        success: true,
        message: `Updated existing career path for ${payload.level}`,
        data: existing,
      });
    }

    const careerPath = await CareerPath.create(payload);

    res.status(201).json({
      success: true,
      message: "Career path created successfully",
      data: careerPath,
    });
  } catch (error) {
    console.error("Error creating career path:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create career path",
      error: error.message,
    });
  }
};

exports.getAllCareerPaths = async (req, res) => {
  try {
    const { level, status, interestArea } = req.query;
    const filter = {};

    if (level) filter.level = level;
    if (status) filter.status = status;
    if (interestArea) filter.interestArea = interestArea;

    // Use populate if scholarships are references
    const careerPaths = await CareerPath.find(filter)
      .populate("relatedScholarships")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: careerPaths.length,
      data: careerPaths,
    });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch career paths",
      error: error.message,
    });
  }
};

exports.getCareerPathById = async (req, res) => {
  try {
    const careerPath = await CareerPath.findById(req.params.id).populate("relatedScholarships");

    if (!careerPath) {
      return res.status(404).json({
        success: false,
        message: "Career path not found",
      });
    }

    res.status(200).json({
      success: true,
      data: careerPath,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch career path",
      error: error.message,
    });
  }
};

exports.updateCareerPath = async (req, res) => {
  try {
    const existing = await CareerPath.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Career path not found",
      });
    }

    const payload = buildCareerPathPayload(req.body, existing);
    const validationError = validateCareerPathPayload(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    Object.assign(existing, payload);
    await existing.save();

    res.status(200).json({
      success: true,
      message: "Career path updated successfully",
      data: existing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update career path",
      error: error.message,
    });
  }
};

exports.deleteCareerPath = async (req, res) => {
  try {
    const careerPath = await CareerPath.findById(req.params.id);

    if (!careerPath) {
      return res.status(404).json({
        success: false,
        message: "Career path not found",
      });
    }

    await careerPath.deleteOne();

    res.status(200).json({
      success: true,
      message: "Career path deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete career path",
      error: error.message,
    });
  }
};
