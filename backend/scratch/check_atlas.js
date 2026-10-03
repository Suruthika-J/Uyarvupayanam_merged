require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("./models/User");

async function checkAtlas() {
  try {
    console.log("Connecting to MongoDB Atlas at:", process.env.MONGO_URI ? "URI loaded" : "URI missing");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully to Atlas!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in Atlas database:", collections.map(c => c.name));

    const users = await User.find({}, { password: 0 });
    console.log(`Found ${users.length} users in Atlas User collection:`);
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Atlas connection/query error:", err);
    process.exit(1);
  }
}

checkAtlas();
