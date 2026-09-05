const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    twoFactorAuth: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    studentRegistration: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    subAdmins: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
