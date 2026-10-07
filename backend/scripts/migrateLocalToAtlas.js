const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const LOCAL_URI = process.env.LOCAL_MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam";
const ATLAS_URI = process.env.ATLAS_URI || process.env.MONGO_URI;

if (!ATLAS_URI) {
  console.error("❌ Error: Missing ATLAS_URI or MONGO_URI in environment configuration. Please set ATLAS_URI or MONGO_URI in backend/.env before running migration.");
  process.exit(1);
}

async function migrate() {
  console.log("Connecting to Local MongoDB...");
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log("Connected to Local.");

  console.log("Connecting to MongoDB Atlas...");
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log("Connected to Atlas.");

  // 1. Migrate Users
  const localUsers = await localConn.collection("users").find({}).toArray();
  const atlasUsers = await atlasConn.collection("users").find({}).toArray();
  const atlasEmails = new Set(atlasUsers.map(u => u.email.toLowerCase()));

  const usersToInsert = localUsers.filter(u => !atlasEmails.has(u.email.toLowerCase()));
  console.log(`\nUsers to migrate: ${usersToInsert.length}`);
  for (const u of usersToInsert) {
    console.log(` - Migrating user: ${u.name} (${u.email}) [id: ${u._id}]`);
    await atlasConn.collection("users").updateOne(
      { _id: u._id },
      { $set: u },
      { upsert: true }
    );
  }

  // 2. Migrate CollegeStudentProfiles
  const localProfiles = await localConn.collection("collegestudentprofiles").find({}).toArray();
  console.log(`\nLocal College Student Profiles to check: ${localProfiles.length}`);
  for (const p of localProfiles) {
    const existing = await atlasConn.collection("collegestudentprofiles").findOne({ _id: p._id });
    if (!existing) {
      console.log(` - Migrating profile for userId: ${p.userId}`);
      await atlasConn.collection("collegestudentprofiles").updateOne(
        { _id: p._id },
        { $set: p },
        { upsert: true }
      );
    }
  }

  // 3. Migrate AhpFuzzyResults
  const localAhp = await localConn.collection("ahpfuzzyresults").find({}).toArray();
  console.log(`\nLocal AhpFuzzyResults to check: ${localAhp.length}`);
  for (const r of localAhp) {
    const existing = await atlasConn.collection("ahpfuzzyresults").findOne({ _id: r._id });
    if (!existing) {
      console.log(` - Migrating AHP result for userId: ${r.userId}`);
      await atlasConn.collection("ahpfuzzyresults").updateOne(
        { _id: r._id },
        { $set: r },
        { upsert: true }
      );
    }
  }

  // 4. Migrate Focus Sessions
  const localFocus = await localConn.collection("focussessions").find({}).toArray();
  console.log(`\nLocal Focus Sessions to check: ${localFocus.length}`);
  for (const f of localFocus) {
    await atlasConn.collection("focussessions").updateOne(
      { _id: f._id },
      { $set: f },
      { upsert: true }
    );
  }

  // 5. Migrate Peer Conversations & Messages
  const localConvs = await localConn.collection("peerconversations").find({}).toArray();
  for (const c of localConvs) {
    await atlasConn.collection("peerconversations").updateOne(
      { _id: c._id },
      { $set: c },
      { upsert: true }
    );
  }
  const localMsgs = await localConn.collection("peermessages").find({}).toArray();
  for (const m of localMsgs) {
    await atlasConn.collection("peermessages").updateOne(
      { _id: m._id },
      { $set: m },
      { upsert: true }
    );
  }

  // 6. Migrate Saved Items
  const localSaved = await localConn.collection("saveditems").find({}).toArray();
  for (const s of localSaved) {
    await atlasConn.collection("saveditems").updateOne(
      { _id: s._id },
      { $set: s },
      { upsert: true }
    );
  }

  // 7. Migrate Mentor Requests
  const localMentor = await localConn.collection("mentorrequests").find({}).toArray();
  for (const mr of localMentor) {
    await atlasConn.collection("mentorrequests").updateOne(
      { _id: mr._id },
      { $set: mr },
      { upsert: true }
    );
  }

  console.log("\n✅ Migration complete!");

  // Verify Atlas total users count now
  const newAtlasCount = await atlasConn.collection("users").countDocuments();
  console.log(`New Atlas users count: ${newAtlasCount}`);

  await localConn.close();
  await atlasConn.close();
}

migrate().catch(console.error);
