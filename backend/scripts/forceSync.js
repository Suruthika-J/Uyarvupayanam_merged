const mongoose = require("mongoose");
const axios = require("axios");
const College = require("../models/College");
const Course = require("../models/Course");
const Cutoff = require("../models/Cutoff");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

const DATA_URLS = {
    2022: "https://www.tneacutoff.com/api/c2.json",
    2023: "https://www.tneacutoff.com/api/c3.json",
    2024: "https://www.tneacutoff.com/api/c4.json",
    2025: "https://www.tneacutoff.com/api/c5.json",
};

const MONGO_URI = "mongodb+srv://uyarvupayanam_db_user:UyarvuPayanam1234@cluster0.i0sep1t.mongodb.net/uyarvuPayanam?retryWrites=true&w=majority";

async function forceSync() {
    await mongoose.connect(MONGO_URI);
    console.log("🚀 COMMENCING CORRECTED SYNC (2022-2025)...");

    console.log("📦 Warming up caches...");
    const [allColleges, allCourses] = await Promise.all([
        College.find({}),
        Course.find({})
    ]);

    const collegeMap = new Map();
    allColleges.forEach(c => {
        if (c.collegeCode) collegeMap.set(c.collegeCode, c._id);
        collegeMap.set(c.collegeName.toLowerCase(), c._id);
    });

    const courseMap = new Map();
    allCourses.forEach(c => {
        if (c.branchCode) courseMap.set(c.branchCode, c._id);
        courseMap.set(c.courseName.toLowerCase(), c._id);
    });

    for (const [year, url] of Object.entries(DATA_URLS)) {
        console.log(`\n📥 Fixing Year ${year}...`);
        const res = await axios.get(url);
        const data = res.data;
        
        const cutoffOps = [];
        let updatedCount = 0;

        for (const item of data) {
            let collegeId = collegeMap.get(String(item.coc)) || collegeMap.get(item.con.toLowerCase());
            let courseId = courseMap.get(String(item.brc)) || courseMap.get(item.brn.toLowerCase());
            
            if (!collegeId || !courseId) continue;

            // CORRECTED SCORE MAPPING (Uppercase)
            const cutoffData = [
                { category: "OC",  score: item.OC  || item.oc  || 0 },
                { category: "BC",  score: item.BC  || item.bc  || 0 },
                { category: "BCM", score: item.BCM || item.bcm || 0 },
                { category: "MBC", score: item.MBC || item.mbc || 0 },
                { category: "SC",  score: item.SC  || item.sc  || 0 },
                { category: "SCA", score: item.SCA || item.sca || 0 },
                { category: "ST",  score: item.ST  || item.st  || 0 }
            ].filter(d => Number(d.score) > 0);

            if (cutoffData.length === 0) continue;

            cutoffOps.push({
                updateOne: {
                    filter: { courseId, collegeId, year: parseInt(year) },
                    update: { 
                        $set: { 
                            cutoffData, 
                            round: "TNEA Automated", 
                            isPublished: true,
                            source: "tneacutoff.com" // PROTECTS AGAINST MANUAL MODS
                        } 
                    },
                    upsert: true
                }
            });

            updatedCount++;
            if (cutoffOps.length >= 1000) {
                console.log(`💾 Syncing batch for ${year}...`);
                await Cutoff.bulkWrite(cutoffOps);
                cutoffOps.length = 0;
            }
        }
        
        if (cutoffOps.length > 0) {
            await Cutoff.bulkWrite(cutoffOps);
        }
        console.log(`✅ Success for ${year}. Fixed ${updatedCount} entries.`);
    }

    console.log("\n✨ DATA FULLY RESTORED WITH OFFICIAL SCORES!");
    process.exit(0);
}

forceSync().catch(err => {
    console.error("Fatal Sync Error:", err);
    process.exit(1);
});
