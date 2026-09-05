const Cutoff = require("../models/Cutoff");
const College = require("../models/College");
const Course = require("../models/Course");

// @desc    Create cutoff entry
// @route   POST /api/cutoffs
// @access  Admin
exports.createCutoff = async (req, res) => {
  try {
    const cutoff = await Cutoff.create(req.body);
    res.status(201).json({ success: true, data: cutoff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cutoffs with filters
// @route   GET /api/cutoffs
// @access  Public
exports.getCutoffs = async (req, res) => {
  try {
    const { courseId, collegeId, year } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (collegeId) filter.collegeId = collegeId;
    if (year) filter.year = parseInt(year);

    const limit = req.query.limit ? parseInt(req.query.limit) : 200;

    const cutoffs = await Cutoff.find(filter)
      .lean()
      .populate("courseId", "courseName branchCode")
      .populate("collegeId", "collegeName collegeCode stream district location")
      .sort({ year: -1 })
      .limit(limit * 3); // Fetch more to account for filtered out records

    // Filter out corrupted records (where populate failed AND no legacy string exists)
    const validCutoffs = cutoffs.filter(c => {
      const hasCollege = c.collegeId || c.collegeName || c.college;
      const hasCourse = c.courseId || c.department || c.course || c.branchCode;
      return hasCollege && hasCourse;
    }).slice(0, limit);

    res.status(200).json({ success: true, count: validCutoffs.length, data: validCutoffs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete orphaned records (no college name/id)
// @route   DELETE /api/cutoffs/orphans
// @access  Admin
exports.deleteOrphans = async (req, res) => {
  try {
    const result = await Cutoff.deleteMany({
      $and: [
        { collegeId: null },
        { collegeName: { $exists: false } },
        { college: { $exists: false } }
      ]
    });
    res.json({ success: true, message: `Deleted ${result.deletedCount} orphans`, count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cutoff
// @route   PUT /api/cutoffs/:id
// @access  Admin
exports.updateCutoff = async (req, res) => {
  try {
    const cutoff = await Cutoff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: cutoff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete cutoff
// @route   DELETE /api/cutoffs/:id
// @access  Admin
exports.deleteCutoff = async (req, res) => {
  try {
    await Cutoff.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Cutoff deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Sync orphaned cutoffs (match by collegeCode)
// @route   POST /api/cutoffs/sync-orphans
// @access  Admin
exports.syncOrphanedRecords = async (req, res) => {
  try {
    const orphanedCutoffs = await Cutoff.find({ 
      $or: [
        { collegeId: { $exists: false } },
        { collegeId: null }
      ]
    }).limit(1000);

    let count = 0;
    for (const cutoff of orphanedCutoffs) {
      const code = cutoff.collegeCode || cutoff.coc;
      if (code) {
        const college = await College.findOne({ collegeCode: code });
        if (college) {
          cutoff.collegeId = college._id;
          // Also try to map course if possible, or just save the college link
          await cutoff.save();
          count++;
        }
      }
    }

    res.json({ success: true, message: `Synced ${count} records`, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
