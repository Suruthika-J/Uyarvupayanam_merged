const express = require("express");
const router = express.Router();
const { syncOrphanedRecords } = require('../controllers/cutoffController');

router.post('/sync-orphans', syncOrphanedRecords);
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const csvParser = require("csv-parser");
let puppeteer = null;
try {
    puppeteer = require("puppeteer");
} catch (err) {
    console.warn("puppeteer not found; dynamic site scraping fallback disabled. Install puppeteer for full capability.");
}
const Cutoff = require("../models/Cutoff");
const CutoffFileRow = require("../models/CutoffFileRow");
const CutoffRecord = require("../models/CutoffRecord");
const {
    listUploadFiles,
    parseCsvFile,
    removeDuplicateRows,
} = require("../services/cutoffFileImportService");

// robust scraper: cheerio fallback then puppeteer for JS-rendered data
async function scrapeTneaOnline(year) {
    const url = "https://tnea.kanna.in/search";

    // 1) quick static HTML parse
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                Accept: "text/html",
            },
            timeout: 45000,
        });
        const $ = cheerio.load(response.data);

        const headerMap = {};
        $("table thead th").each((index, th) => {
            const key = $(th).text().trim().toLowerCase();
            headerMap[key] = index;
        });

        const rows = [];
        $("table tbody tr").each((_, tr) => {
            const cols = $(tr).find("td");
            if (cols.length < 8) return;

            const getByLabel = (label, fallbackIndex) => {
                const normalized = label.trim().toLowerCase();
                const idx = headerMap[normalized];
                if (typeof idx !== 'undefined' && idx < cols.length) {
                    return $(cols[idx]).text().trim();
                }
                return $(cols[fallbackIndex] || cols[0]).text().trim();
            };

            const collegeCode = getByLabel('college code', 0);
            const collegeName = getByLabel('college name', 1);
            const department = getByLabel('department', 2);
            const oc = parseFloat(getByLabel('oc cutoff', 3)) || 0;
            const bc = parseFloat(getByLabel('bc cutoff', 4)) || 0;
            const mbc = parseFloat(getByLabel('mbc cutoff', 5)) || 0;
            const sc = parseFloat(getByLabel('sc cutoff', 6)) || 0;
            const st = parseFloat(getByLabel('st cutoff', 7)) || 0;

            if (!collegeCode || !collegeName || !department) return;

            rows.push({
                collegeCode,
                collegeName,
                department,
                year,
                oc,
                bc,
                mbc,
                sc,
                st,
                source: "tnea",
            });
        });

        if (rows.length > 0) {
            return rows;
        }

    } catch (error) {
        console.warn("Cheerio scrape attempt failed, falling back to Puppeteer", error.message);
    }

    // 2) Puppeteer fallback for JS-rendered table
    if (!puppeteer) {
        throw new Error("No rows found while scraping with cheerio, and puppeteer is not installed.");
    }

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });

        await page.waitForSelector("table tbody tr", { timeout: 60000 });
        const scrapedRows = await page.evaluate((yearArg) => {
            const rows = [];
            const headerMap = {};
            document.querySelectorAll("table thead th").forEach((th, index) => {
                headerMap[th.innerText.trim().toLowerCase()] = index;
            });

            const getByLabel = (cols, label, fallbackIndex) => {
                const idx = headerMap[label.trim().toLowerCase()];
                if (typeof idx !== 'undefined' && cols[idx]) {
                    return cols[idx].innerText.trim();
                }
                return cols[fallbackIndex] ? cols[fallbackIndex].innerText.trim() : '';
            };

            document.querySelectorAll("table tbody tr").forEach((tr) => {
                const cols = tr.querySelectorAll("td");
                if (cols.length < 8) return;
                const collegeCode = getByLabel(cols, 'college code', 0);
                const collegeName = getByLabel(cols, 'college name', 1);
                const department = getByLabel(cols, 'department', 2);
                const oc = Number(getByLabel(cols, 'oc cutoff', 3)) || 0;
                const bc = Number(getByLabel(cols, 'bc cutoff', 4)) || 0;
                const mbc = Number(getByLabel(cols, 'mbc cutoff', 5)) || 0;
                const sc = Number(getByLabel(cols, 'sc cutoff', 6)) || 0;
                const st = Number(getByLabel(cols, 'st cutoff', 7)) || 0;

                if (!collegeCode || !collegeName || !department) return;
                rows.push({
                    collegeCode,
                    collegeName,
                    department,
                    year: yearArg,
                    oc,
                    bc,
                    mbc,
                    sc,
                    st,
                    source: "tnea",
                });
            });
            return rows;
        }, year);

        if (Array.isArray(scrapedRows) && scrapedRows.length > 0) {
            return scrapedRows;
        }

        throw new Error("No rows found while scraping. Data may be JS-rendered or source table format changed.");
    } finally {
        await browser.close();
    }
}

// GET /api/cutoff - paginate, search, filter by department and year
router.get("/", async (req, res) => {
    try {
        // New normalized cutoff API:
        // GET /api/cutoff?type=Engineering&year=2024
        if (req.query?.type && req.query?.year) {
            const type = String(req.query.type);
            const year = Number(req.query.year);
            const data = await CutoffRecord.find({ type, year }).lean();
            return res.json(data);
        }

        // Filter imported cutoff rows by category/year (used by Admin page button)
        if (req.query?.category && req.query?.year) {
            const category = String(req.query.category);
            const year = Number(req.query.year);
            const data = await CutoffFileRow.find({ category, year }).lean();
            return res.json(data);
        }

        // If no query params are provided, return ALL imported cutoff rows (raw rows stored "as-is")
        // so frontend can do: setCutoffs(res.data)
        if (!req.query || Object.keys(req.query).length === 0) {
            const all = await CutoffFileRow.find({}).lean();
            return res.json(all);
        }

const { year, q = "", department = "", page = 1, limit = 20, largeLimit } = req.query;

        const pageNum = Number(page);

        const filter = {};
        if (year) filter.year = Number(year);
        if (q) filter.collegeName = { $regex: q, $options: "i" };
        if (department) filter.department = department;

        const totalRows = await Cutoff.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(totalRows / Number(limit)));

        // Allow large limits for admin panel (up to 50k records)
        const effectiveLimit = largeLimit === 'true' ? Math.min(Number(limit) || 10000, 50000) : Number(limit);
        const skipAmount = largeLimit === 'true' ? 0 : (Number(page) - 1) * effectiveLimit;

        const cutoffs = await Cutoff.find(filter)
            .sort({ year: -1, collegeName: 1 })
            .skip(skipAmount)
            .limit(effectiveLimit);

        res.json({ 
            data: cutoffs,
            total: totalRows,
            page: Number(page),
            limit: effectiveLimit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cutoff/import-file
// Reads the first CSV file from backend/uploads, converts to JSON using csv-parser,
// adds: category="Engineering", year=2024
// removes duplicate rows (full-row match), then inserts using insertMany().
router.get("/import-file", async (req, res) => {
    try {
        const uploads = listUploadFiles().filter((p) => path.extname(p).toLowerCase() === ".csv");
        if (!uploads.length) {
            return res.status(404).json({
                error: "No CSV file found in backend/uploads",
            });
        }

        const filePath = uploads[0];
        const rows = await parseCsvFile(filePath);

        const enriched = rows.map((r) => ({
            ...r,
            category: "Engineering",
            year: 2024,
        }));

        const total = enriched.length;
        const { unique, duplicates } = removeDuplicateRows(enriched);

        if (!unique.length) {
            return res.json({
                total,
                inserted: 0,
                duplicates,
            });
        }

        const insertedDocs = await CutoffFileRow.insertMany(unique, { ordered: false });

        return res.json({
            total,
            inserted: insertedDocs.length,
            duplicates,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

function normalizeHeaderKey(k) {
    return (k ?? "")
        .toString()
        .replace(/\uFEFF/g, "")
        .replace(/↑↓/g, "")
        .replace(/\s+/g, " ")
        .replace(/\r?\n/g, " ")
        .trim()
        .toLowerCase();
}

function parseCutoffNumber(v) {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : s;
}

async function parseCsvAsObjects(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(
                csvParser({
                    mapHeaders: ({ header }) => (header ?? "").replace(/^\uFEFF/, ""),
                    mapValues: ({ value }) => value,
                    strict: false,
                })
            )
            .on("data", (data) => rows.push(data))
            .on("end", () => resolve(rows))
            .on("error", (err) => reject(err));
    });
}

// GET /api/cutoff/import-csv
// Reads backend/uploads/TNEA 2025 _ engineering.csv and inserts normalized records:
// { collegeCode, collegeName, branch, category, cutoff, year:2024, type:"Engineering" }
router.get("/import-csv", async (req, res) => {
    try {
        const filePath = path.join(__dirname, "..", "uploads", "TNEA 2025 _ engineering.csv");
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "CSV file not found in backend/uploads",
                expectedFile: "backend/uploads/TNEA 2025 _ engineering.csv",
            });
        }

        const rawRows = await parseCsvAsObjects(filePath);

        // Normalize keys once per row so we can handle multi-line/arrow headers
        const normalized = rawRows
            .map((row) => {
                const out = {};
                for (const key of Object.keys(row || {})) {
                    out[normalizeHeaderKey(key)] = row[key];
                }
                return out;
            })
            // skip fully empty rows
            .filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""));

        const total = normalized.length;

        const year = 2024;
        const type = "Engineering";

        // Map fields from CSV
        const expanded = [];
        for (const r of normalized) {
            const collegeCode =
                (r["councelling code"] ?? r["counselling code"] ?? r["collegecode"] ?? r["college code"] ?? "").toString().trim();
            const collegeName = (r["college name"] ?? r["collegename"] ?? "").toString().trim();
            const branch = (r["department"] ?? r["branch"] ?? "").toString().replace(/\s*\r?\n\s*/g, " ").trim();

            if (!collegeName || !branch) continue;

            const oc = parseCutoffNumber(r["oc cutoff"] ?? r["oc"] ?? r["general"] ?? "");
            const bc = parseCutoffNumber(r["bc cutoff"] ?? r["bc"] ?? r["obc"] ?? "");
            const mbc = parseCutoffNumber(r["mbc cutoff"] ?? r["mbc"] ?? "");
            const sc = parseCutoffNumber(r["sc cutoff"] ?? r["sc"] ?? "");
            const st = parseCutoffNumber(r["st cutoff"] ?? r["st"] ?? "");

            const categories = [
                ["OC", oc],
                ["BC", bc],
                ["MBC", mbc],
                ["SC", sc],
                ["ST", st],
            ];

            for (const [category, cutoff] of categories) {
                // allow empty values: store null cutoff if missing
                expanded.push({
                    collegeCode,
                    collegeName,
                    branch,
                    category,
                    cutoff,
                    year,
                    type,
                });
            }
        }

        // Remove duplicates based on same collegeName + branch + category + year + type
        const seen = new Set();
        const unique = [];
        let duplicates = 0;
        for (const doc of expanded) {
            const key = `${doc.collegeName}||${doc.branch}||${doc.category}||${doc.year}||${doc.type}`;
            if (seen.has(key)) {
                duplicates += 1;
                continue;
            }
            seen.add(key);
            unique.push(doc);
        }

        const insertedDocs = unique.length ? await CutoffRecord.insertMany(unique, { ordered: false }) : [];

        return res.json({
            total,
            inserted: insertedDocs.length,
            duplicates,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/import-tnea?year=2024
router.get("/import-tnea", async (req, res) => {
    try {
        const year = Number(req.query.year || 2024);

        const existing = await Cutoff.find({ year });
        if (existing.length > 0) {
            return res.json({ source: "db", message: "Already loaded (no re-scrape)", data: existing });
        }

        const rows = await scrapeTneaOnline(year);
        if (!rows || !rows.length) {
            return res.status(404).json({ message: "No rows found while scraping for year " + year });
        }

        const cutoffDocs = rows.map(item => ({
            collegeCode: item.collegeCode,
            collegeName: item.collegeName,
            department: item.department,
            year: item.year,
            oc: item.oc,
            bc: item.bc,
            mbc: item.mbc,
            sc: item.sc,
            st: item.st,
            source: item.source || 'tnea',
        }));

        await Cutoff.insertMany(cutoffDocs);

        const saved = await Cutoff.find({ year });
        res.json({ source: "scrape", message: `Imported ${saved.length} rows`, data: saved });
    } catch (err) {
        console.error("Import error", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/cutoff/import
// body: { year: 2024 }
router.post("/import", async (req, res) => {
    try {
        const year = Number(req.body.year || req.query.year || 2024);

        // Always clear previous year data as requested (clean old incorrect rows)
        await Cutoff.deleteMany({ year });

        const rows = await scrapeTneaOnline(year);
        if (!rows || !rows.length) {
            return res.status(404).json({ message: "No rows found while scraping for year " + year });
        }

        // correct field mapping according to request
        const cutoffDocs = rows.map(item => ({
            collegeCode: item.collegeCode,
            collegeName: item.collegeName,
            department: item.department,
            year: item.year,
            oc: item.oc,
            bc: item.bc,
            mbc: item.mbc,
            sc: item.sc,
            st: item.st,
            source: item.source || 'tnea',
        }));

        await Cutoff.insertMany(cutoffDocs);

        const saved = await Cutoff.find({ year });
        res.json({ source: "scrape", message: `Imported ${saved.length} rows`, count: saved.length, data: saved });
    } catch (err) {
        console.error("Import error", err);
        res.status(500).json({ error: err.message });
    }
});

// Create a new cutoff
router.post("/", async (req, res) => {
    try {
        const newCutoff = new Cutoff(req.body);
        const savedCutoff = await newCutoff.save();
        res.status(201).json(savedCutoff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing cutoff
router.put("/:id", async (req, res) => {
    try {
        const updatedCutoff = await Cutoff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCutoff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a cutoff
router.delete("/:id", async (req, res) => {
    try {
        await Cutoff.findByIdAndDelete(req.params.id);
        res.json({ message: "Cutoff deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
