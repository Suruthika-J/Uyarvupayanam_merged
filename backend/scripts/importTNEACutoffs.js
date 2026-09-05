const mongoose = require("mongoose");
const axios = require("axios");
const College = require("../models/College");
const Course = require("../models/Course");
const Cutoff = require("../models/Cutoff");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const DATA_URLS = {
    2022: "https://www.tneacutoff.com/api/c2.json",
    2023: "https://www.tneacutoff.com/api/c3.json",
    2024: "https://www.tneacutoff.com/api/c4.json",
    2025: "https://www.tneacutoff.com/api/c5.json",
};

const MONGO_URI = process.env.MONGO_URI;

async function fastImport() {
    await mongoose.connect(MONGO_URI);
    console.log("🚀 Connected for FAST IMPORT...");

    // 1. Warm up caches
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
        console.log(`\n📥 Fetching ${year} data...`);
        const res = await axios.get(url);
        const data = res.data;
        console.log(`Processing ${data.length} records for ${year}`);

        const cutoffOps = [];
        let batchCount = 0;

        for (const item of data) {
            // Get or Create College ID
            let collegeId = collegeMap.get(item.coc) || collegeMap.get(item.con.toLowerCase());
            if (!collegeId) {
                const newCol = await College.create({
                    collegeName: item.con, collegeCode: item.coc,
                    stream: "Engineering", state: "Tamil Nadu"
                });
                collegeId = newCol._id;
                collegeMap.set(item.coc, collegeId);
                collegeMap.set(item.con.toLowerCase(), collegeId);
            }

            // Get or Create Course ID
            let courseId = courseMap.get(item.brc) || courseMap.get(item.brn.toLowerCase());
            if (!courseId) {
                try {
                    const newCourse = await Course.create({
                        courseName: item.brn, branchCode: item.brc,
                        level: "Degree", targetLevel: "After 12th", category: "Engineering",
                        duration: "4 Years", eligibility: "12th Pass with PCM", shortDescription: `BE/B.Tech in ${item.brn}`
                    });
                    courseId = newCourse._id;
                    courseMap.set(item.brc, courseId);
                    courseMap.set(item.brn.toLowerCase(), courseId);
                } catch (e) {
                    // Fallback to finding it again if it failed due to unique constraint during race or duplication
                    const existingCourse = await Course.findOne({ courseName: item.brn });
                    if (existingCourse) {
                        courseId = existingCourse._id;
                    } else {
                        throw e; // Rethrow if it's something else
                    }
                }
            }

            // Prepare Cutoff
            const cutoffData = [
                { category: "OC", score: item.oc || item.OC || 0 },
                { category: "BC", score: item.bc || item.BC || 0 },
                { category: "BCM", score: item.bcm || item.BCM || 0 },
                { category: "MBC", score: item.mbc || item.MBC || 0 },
                { category: "SC", score: item.sc || item.SC || 0 },
                { category: "SCA", score: item.sca || item.SCA || 0 },
                { category: "ST", score: item.st || item.ST || 0 }
            ].filter(d => d.score > 0);

            cutoffOps.push({
                updateOne: {
                    filter: { courseId, collegeId, year: parseInt(year) },
                    update: { $set: { cutoffData, round: "Final", isPublished: true } },
                    upsert: true
                }
            });

            batchCount++;
            if (cutoffOps.length >= 500) {
                console.log(`💾 Writing batch for ${year} (${batchCount}/${data.length})...`);
                await Cutoff.bulkWrite(cutoffOps);
                cutoffOps.length = 0;
            }
        }
        
        if (cutoffOps.length > 0) {
            await Cutoff.bulkWrite(cutoffOps);
        }
        console.log(`✅ Success for ${year}`);
    }

    console.log("\n✨ ALL DATA IMPORTED!");
    process.exit(0);
}

fastImport().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
