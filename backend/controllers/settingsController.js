const Settings = require("../models/Settings");

const ALLOWED_SETTING_FIELDS = [
  "twoFactorAuth",
  "maintenanceMode",
  "studentRegistration",
  "pushNotifications",
];

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ message: "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const payload = {};

    ALLOWED_SETTING_FIELDS.forEach((field) => {
      if (typeof req.body[field] === "boolean") {
        payload[field] = req.body[field];
      }
    });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "No valid settings provided. Expected boolean toggle values.",
      });
    }

    let settings = await getOrCreateSettings();

    Object.assign(settings, payload, { updatedBy: req.admin?._id || null });
    await settings.save();

    return res.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: "Failed to update settings" });
  }
};

exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json({
      maintenanceMode: settings.maintenanceMode,
      studentRegistration: settings.studentRegistration,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public settings" });
  }
};
