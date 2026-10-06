// One-off cleanup of isolated audit/test identities created during this audit.
// Deletes only email: /audit\..*@uyarvupayanam\.local$/ records + their related docs.
"use strict";
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({ email: /audit\..*@uyarvupayanam\.local$/ }).toArray();
  console.log("stale audit users found:", users.length);
  const oids = users.map((u) => (u._id instanceof mongoose.Types.ObjectId ? u._id : new mongoose.Types.ObjectId(String(u._id))));
  const cols = [
    "studenttestresults", "generatedassessments", "studentprofiles",
    "studentlearningdnas", "studentskillprofiles", "learningrecommendations",
    "assessmentresults", "onboardingresponses", "assessmentsummaries",
    "recommendations", "notifications",
  ];
  for (const c of cols) {
    try {
      const r = await db.collection(c).deleteMany({ $or: [{ userId: { $in: oids } }, { studentId: { $in: oids } }] });
      if (r.deletedCount) console.log("cleaned", c, r.deletedCount);
    } catch (e) {
      console.log("skip", c, ":", e.message);
    }
  }
  const r = await db.collection("users").deleteMany({ _id: { $in: oids } });
  console.log("removed users:", r.deletedCount);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});