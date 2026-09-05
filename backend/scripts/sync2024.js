const mongoose = require("mongoose");
const axios = require("axios");
const College = require("../models/College");
const Course = require("../models/Course");
const Cutoff = require("../models/Cutoff");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

const MONGO_URI = "mongodb+srv://uyarvupayanam_db_user:UyarvuPayanam1234@cluster0.i0sep1t.mongodb.net/uyarvuPayanam?retryWrites=true&w=majority";

async function syncYear(year) {
    console.log(`🚀 COMMENCING FULL SYNC FOR ${year}...`);

    const jsonMap = {
        2024: "https://www.tneacutoff.com/api/c4.json",
        2023: "https://www.tneacutoff.com/api/c3.json",
        2022: "https://www.tneacutoff.com/api/c2.json"
    };

    const url = jsonMap[year];
    const res = await axios.get(url);
    const data = res.data;
    console.log(`Processing ${data.length} records for ${year}...`);

    // 1. Warm up caches
    const [allColleges, allCourses] = await Promise.all([
        College.find({}),
        Course.find({})
    ]);

    const collegeMap = new Map();
    allColleges.forEach(c => {
        if (c.collegeCode) collegeMap.set(String(c.collegeCode), c._id);
        collegeMap.set(c.collegeName.toLowerCase(), c._id);
    });

    const courseMap = new Map();
    allCourses.forEach(c => {
        if (c.branchCode) courseMap.set(String(c.branchCode), c._id);
        courseMap.set(c.courseName.toLowerCase(), c._id);
    });

    const cutoffOps = [];
    let news = 0;

    for (const item of data) {
        // Resolve College
        let collegeId = collegeMap.get(String(item.coc)) || collegeMap.get(item.con.toLowerCase());
        if (!collegeId) {
            const nc = await College.create({
                collegeName: item.con,
                collegeCode: String(item.coc),
                stream: "Engineering",
                state: "Tamil Nadu",
                district: item.con.split(',').pop().trim()
            });
            collegeId = nc._id;
            collegeMap.set(String(item.coc), collegeId);
            collegeMap.set(item.con.toLowerCase(), collegeId);
            news++;
        }

        // Resolve Course
        let courseId = courseMap.get(String(item.brc)) || courseMap.get(item.brn.toLowerCase());
        if (!courseId) {
            try {
                const ncr = await Course.create({
                    courseName: item.brn,
                    branchCode: String(item.brc),
                    level: "Degree",
                    targetLevel: "After 12th",
                    category: "Engineering",
                    duration: "4 Years"
                });
                courseId = ncr._id;
                courseMap.set(String(item.brc), courseId);
                courseMap.set(item.brn.toLowerCase(), courseId);
            } catch (e) {
                const existing = await Course.findOne({ courseName: item.brn });
                if (existing) courseId = existing._id;
                else continue;
            }
        }

        // Map Cutoff
        const cutoffData = [
            { category: "OC",  score: item.OC  || item.oc  || 0 },
            { category: "BC",  score: item.BC  || item.bc  || 0 },
            { category: "BCM", score: item.BCM || item.bcm || 0 },
            { category: "MBC", score: item.MBC || item.mbc || 0 },
            { category: "SC",  score: item.SC  || item.sc  || 0 },
            { category: "SCA", score: item.SCA || item.sca || 0 },
            { category: "ST",  score: item.ST  || item.st  || 0 }
        ].filter(d => Number(d.score) > 0);

        if (cutoffData.length > 0) {
            cutoffOps.push({
                updateOne: {
                    filter: { courseId, collegeId, year },
                    update: { $set: { cutoffData, round: "Final", isPublished: true, source: "tneacutoff.com" } },
                    upsert: true
                }
            });
        }

        if (cutoffOps.length >= 1000) {
            console.log(`💾 Writing batch...`);
            await Cutoff.bulkWrite(cutoffOps);
            cutoffOps.length = 0;
        }
    }

    if (cutoffOps.length > 0) {
        await Cutoff.bulkWrite(cutoffOps);
    }

    console.log(`✅ ${year} COMPLETELY SYNCED! (New colleges added in this pass: ${news})`);
}

async function start() {
    await mongoose.connect(MONGO_URI);
    await syncYear(2024);
    process.exit(0);
}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
