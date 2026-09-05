const ClassContent = require("../models/ClassContent");

// --- PUBLIC USER APIS ---

exports.getPublicClassContent = async (req, res) => {
  try {
    const { level } = req.params; // "5" or "class5"
    const contents = await ClassContent.find({ 
      targetClass: { $in: [level, `class${level.replace('class','')}`] }, 
      status: "published" 
    }).sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: contents.length, data: contents });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching content", error: error.message });
  }
};

// Get single content details (optional for deeper drill down)
exports.getContentBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const content = await ClassContent.findOne({ slug });
      if (!content) return res.status(404).json({ success: false, message: "Content not found" });
      res.status(200).json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error", error: error.message });
    }
  };

// --- ADMIN PROTECTED APIS ---

exports.getAdminClassContent = async (req, res) => {
  try {
    const { level } = req.params;
    const contents = await ClassContent.find({ 
      targetClass: { $in: [level, `class${level.replace('class','')}`] } 
    }).sort({ displayOrder: 1, createdAt: -1 });
    
    // Stats for Dashboard cards
    const stats = {
        total: contents.length,
        published: contents.filter(c => c.status === 'published').length,
        draft: contents.filter(c => c.status === 'draft').length,
        featured: contents.filter(c => c.featured).length,
    }

    res.status(200).json({ success: true, stats, data: contents });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error", error: error.message });
  }
};

// Get summaries for the main "Careers" selector page in admin
exports.getAdminLevelSummaries = async (req, res) => {
    try {
        const levels = ["5", "8", "10", "12"];
        const summaries = await Promise.all(levels.map(async (lvl) => {
            const items = await ClassContent.find({ 
                targetClass: { $in: [lvl, `class${lvl}`] } 
            });
            return {
                level: lvl,
                total: items.length,
                published: items.filter(c => c.status === 'published').length,
                draft: items.filter(c => c.status === 'draft').length,
                lastUpdated: items.length > 0 ? items.sort((a,b) => b.updatedAt - a.updatedAt)[0].updatedAt : null
            }
        }));
        res.status(200).json({ success: true, data: summaries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error", error: error.message });
    }
}

exports.createContent = async (req, res) => {
  try {
    const content = await ClassContent.create({ ...req.body, createdBy: req.admin?._id });
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    console.error("Create module failed:", error);
    res.status(400).json({ success: false, message: "Create failed", error: error.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const content = await ClassContent.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedBy: req.admin?._id },
      { new: true, runValidators: true }
    );

    if (!content) return res.status(404).json({ success: false, message: "Content not found" });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    console.error("Update content error:", error);
    res.status(400).json({ success: false, message: "Update failed", error: error.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await ClassContent.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed", error: error.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const content = await ClassContent.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    
    content.status = content.status === "published" ? "draft" : "published";
    await content.save();
    
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: "Toggle status failed", error: error.message });
  }
};

exports.toggleFeature = async (req, res) => {
  try {
    const content = await ClassContent.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    
    content.featured = !content.featured;
    await content.save();
    
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: "Toggle feature failed", error: error.message });
  }
};
