// backend/models/MemorySettings.js
//
// Per-user privacy control for the personal memory system. Kept as its own
// document so nothing has to change on the existing User schema.
//
//   useMemoryInChat: whether the AI assistant may retrieve the user's saved
//   memories to ground its answers (default: true). Turning it off means the
//   chat never sees any personal memory context.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memorySettingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    useMemoryInChat: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.MemorySettings || mongoose.model("MemorySettings", memorySettingsSchema);