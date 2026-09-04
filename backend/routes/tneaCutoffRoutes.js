const express = require("express");
const router = express.Router();
const multer = require("multer");
const csvParser = require("csv-parser");
const TneaCutoff = require("../models/TneaCutoff");
const { exec } = require('child_process');
const path = require('path');

// Configure multer for file uploads (in-memory)
const upload = multer({ storage: multer.memoryStorage() });

// 1. GET /api/tnea-cutoffs/search - User search and pagination
router.get("/search", async (req, res) => {
    try {
        const {
            q = "",
            minCutoff = 0,
            maxCutoff = 200,
            community,
            year,
            course_category,
            page = 1,
            limit = 50,
            sortBy = "highest"
        } = req.query;

        let query = {};
        if (course_category) {
            // allow user to pass Engineering/engineering etc.
            query.course_category = new RegExp(`^${course_category.trim()}$`, "i");
        }

        if (q) {
            const regex = new RegExp(q.trim(), "i");
            query.$or = [
                { college_name: regex },
                { department: regex },
                { college_code: regex }
            ];
        }

        if (year) {
            query.year = Number(year);
        }

        const c_min = Number(minCutoff);
        const c_max = Number(maxCutoff);

        if (community) {
            const commField = `${community.toLowerCase()}_cutoff`;
            query[commField] = { $gte: c_min, $lte: c_max };
        } else {
            const cutoffOrs = [
                { oc_cutoff: { $gte: c_min, $lte: c_max } },
                { bc_cutoff: { $gte: c_min, $lte: c_max } },
                { mbc_cutoff: { $gte: c_min, $lte: c_max } },
                { sc_cutoff: { $gte: c_min, $lte: c_max } },
                { st_cutoff: { $gte: c_min, $lte: c_max } }
            ];

            if (query.$or) {
                query.$and = [{ $or: query.$or }, { $or: cutoffOrs }];
                delete query.$or;
            } else {
                query.$or = cutoffOrs;
            }
        }

        let sortCriteria = {};
        if (sortBy === "highest") {
            if (community) {
                sortCriteria[`${community.toLowerCase()}_cutoff`] = -1;
            } else {
                sortCriteria.oc_cutoff = -1;
            }
        } else {
            sortCriteria._id = -1;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [results, totalCount] = await Promise.all([
            TneaCutoff.find(query).sort(sortCriteria).skip(skip).limit(Number(limit)),
            TneaCutoff.countDocuments(query)
        ]);

        res.json({
            data: results,
            totalRows: totalCount,
            totalPages: Math.ceil(totalCount / Number(limit)),
            currentPage: Number(page)
        });

    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. POST /api/tnea-cutoffs/ - Add single cutoff
router.post("/", async (req, res) => {
    try {
        const newCutoff = new TneaCutoff(req.body);
        const savedCutoff = await newCutoff.save();
        res.status(201).json(savedCutoff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. POST /api/tnea-cutoffs/import-web - Import Live Data via puppeteer scraper
router.post("/import-web", async (req, res) => {
    const scriptPath = path.join(__dirname, '../scripts/importTneaScraped.js');
    exec(`node "${scriptPath}"`, { timeout: 600000 }, (error, stdout, stderr) => {
        if (error) {
            console.error("Scraper exec error:", error);
            return res.status(500).json({ error: "Failed to run importer: " + error.message });
        }
        res.json({ message: "Successfully scraped live data from tnea.kanna.in!" });
    });
});

// 4. POST /api/tnea-cutoffs/sync-to-cutoff - copy TNEA data into admin Cutoff collection
router.post("/sync-to-cutoff", async (req, res) => {
    try {
        const Cutoff = require("../models/Cutoff");
        const { year = 2024, course_category = "Engineering" } = req.query;

        const tneaDocuments = await TneaCutoff.find({ year: Number(year), course_category });
        if (!tneaDocuments.length) {
            return res.status(404).json({ message: `No TNEA records found for ${course_category} ${year}.` });
        }

        await Cutoff.deleteMany({ category: course_category, year: Number(year) });

        const mapped = tneaDocuments.map(item => ({
            college: item.college_name,
            course: item.department,
            year: item.year,
            general: item.oc_cutoff,
            obc: item.bc_cutoff,
            sc: item.sc_cutoff,
            st: item.st_cutoff,
            category: item.course_category,
            state: 'All States'
        }));

        await Cutoff.insertMany(mapped);
        res.json({ message: `Synced ${mapped.length} records to Cutoff collection.`, count: mapped.length });
    } catch (err) {
        console.error("Sync error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
