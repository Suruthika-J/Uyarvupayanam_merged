const mongoose = require("mongoose");

const permissionsSchema = new mongoose.Schema(
  {
    manageUsers: { type: Boolean, default: false },
    manageSettings: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
    manageNotifications: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false },
  },
  { _id: false }
);

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Admin",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "sub_admin", "Admin"],
      default: "super_admin",
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({
        manageUsers: true,
        manageSettings: true,
        manageContent: true,
        manageNotifications: true,
        viewReports: true,
      }),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
