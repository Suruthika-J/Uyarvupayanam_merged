const mongoose = require("mongoose");

// Generated PDF certificates (Future Map poster, badge/event certificates).
const careerCertificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, default: "" },
    title: { type: String, required: true },
    kind: { type: String, enum: ["future-map", "badge", "event", "seasonal"], default: "badge" },
    subtitle: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerCertificate", careerCertificateSchema);