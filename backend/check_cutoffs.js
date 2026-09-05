const mongoose = require("mongoose");
const fs = require("fs");
const MONGO_URI="mongodb+srv://uyarvupayanam_db_user:UyarvuPayanam1234@cluster0.i0sep1t.mongodb.net/uyarvuPayanam?retryWrites=true&w=majority";

async function analyze() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const cutoffsColl = db.collection("cutoffs");
  const sample = await cutoffsColl.find({}).limit(5).toArray();
  
  fs.writeFileSync("./cutoff_analysis.json", JSON.stringify(sample, null, 2));
  console.log("Analysis saved to cutoff_analysis.json");
  process.exit();
}

analyze();
