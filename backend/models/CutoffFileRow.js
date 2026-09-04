const mongoose = require("mongoose");

// Stores each imported row "as-is" (dynamic fields allowed)
const cutoffFileRowSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model("CutoffFileRow", cutoffFileRowSchema);

