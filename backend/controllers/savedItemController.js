const SavedItem = require("../models/SavedItem");

exports.saveItem = async (req, res) => {
  try {
    const { contentId, contentType, metadata } = req.body;
    const userId = req.student?._id || req.user?._id; // student/user id from auth middleaware

    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    // Try to create saved item
    const saved = await SavedItem.create({ userId, contentId, contentType, metadata });

    res.status(201).json({ success: true, message: "Item saved to your profile", data: saved });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: "Item is already in your profile" });
    }
    res.status(500).json({ success: false, message: "Failed to save item", error: error.message });
  }
};

exports.getSavedItems = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id;
    const { contentType } = req.query;
    
    const filter = { userId };
    if (contentType) filter.contentType = contentType;

    const saved = await SavedItem.find(filter)
      .populate("contentId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch saved items", error: error.message });
  }
};

exports.unsaveItem = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id;
    const { contentId } = req.params;

    const removed = await SavedItem.findOneAndDelete({ userId, contentId });
    
    if (!removed) return res.status(404).json({ success: false, message: "Saved item not found" });

    res.status(200).json({ success: true, message: "Item removed from your profile" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove saved item", error: error.message });
  }
};
