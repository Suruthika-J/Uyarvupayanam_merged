const CommunicationContent = require("../models/CommunicationContent");

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

exports.getByType = async (req, res) => {
  try {
    const { contentType } = req.params;
    const { location } = req.query;

    const query = { contentType, isActive: true };

    if (contentType === "simulator_scenario" && location) {
      query.location = location;
    }

    const items = await CommunicationContent.find(query).sort({ order: 1 });
    const shuffled = fisherYatesShuffle(items);

    res.status(200).json({ success: true, count: shuffled.length, data: shuffled });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching content", error: error.message });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const items = await CommunicationContent.find().sort({ contentType: 1, order: 1 });

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.contentType]) acc[item.contentType] = [];
      acc[item.contentType].push(item);
      return acc;
    }, {});

    res.status(200).json({ success: true, count: items.length, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching content", error: error.message });
  }
};

exports.createContent = async (req, res) => {
  try {
    const content = await CommunicationContent.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (error) {
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

    const content = await CommunicationContent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!content) return res.status(404).json({ success: false, message: "Content not found" });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(400).json({ success: false, message: "Update failed", error: error.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await CommunicationContent.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed", error: error.message });
  }
};
