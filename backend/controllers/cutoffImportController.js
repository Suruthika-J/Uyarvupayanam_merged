const axios = require('axios');
const cheerio = require('cheerio');
const TneaCutoff = require('../models/TneaCutoff');
const Cutoff = require('../models/Cutoff');

async function scrapeTneaEngineering(year = 2024) {
  const url = 'https://tnea.kanna.in/search';
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Accept: 'text/html',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(response.data);
  const rows = $('table tbody tr');
  const extracted = [];

  rows.each((_, row) => {
    const cols = $(row).find('td');
    if (cols.length >= 8) {
      const collegeCode = $(cols[0]).text().trim();
      const collegeName = $(cols[1]).text().trim();
      const department = $(cols[2]).text().trim();
      const oc = parseFloat($(cols[3]).text().trim()) || 0;
      const bc = parseFloat($(cols[4]).text().trim()) || 0;
      const mbc = parseFloat($(cols[6]).text().trim()) || 0;
      const sc = parseFloat($(cols[7]).text().trim()) || 0;
      const st = parseFloat($(cols[9]).text().trim() || $(cols[8]).text().trim()) || 0;

      if (collegeCode && collegeName && department) {
        extracted.push({
          college_code: collegeCode,
          college_name: collegeName,
          department,
          oc_cutoff: oc,
          bc_cutoff: bc,
          mbc_cutoff: mbc,
          sc_cutoff: sc,
          st_cutoff: st,
          year,
          course_category: 'Engineering',
        });
      }
    }
  });

  if (!extracted.length) {
    throw new Error('No cutoff rows parsed from TNEA page.');
  }

  return extracted;
}

async function getCutoffData(req, res) {
  try {
    const year = Number(req.query.year) || 2024;
    const course_category = req.query.course || 'Engineering';

    const existing = await TneaCutoff.find({ year, course_category }).lean();
    if (existing.length) {
      return res.json({ data: existing });
    }

    const scraped = await scrapeTneaEngineering(year);

    await TneaCutoff.deleteMany({ year, course_category });
    await TneaCutoff.insertMany(scraped);

    const copy = scraped.map((entry) => ({
      college: entry.college_name,
      course: entry.department,
      year: entry.year,
      general: entry.oc_cutoff,
      obc: entry.bc_cutoff,
      sc: entry.sc_cutoff,
      st: entry.st_cutoff,
      category: entry.course_category,
      state: 'All States',
    }));

    await Cutoff.deleteMany({ year, category: course_category });
    await Cutoff.insertMany(copy);

    return res.json({ data: scraped, imported: scraped.length });
  } catch (error) {
    console.error('cutoff import error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function manualImport(req, res) {
  try {
    const year = Number(req.body.year) || 2024;
    const course_category = req.body.course || 'Engineering';

    const existing = await TneaCutoff.find({ year, course_category });
    if (existing.length) {
      return res.json({ message: 'Year data already exists', count: existing.length, data: existing });
    }

    const scraped = await scrapeTneaEngineering(year);

    await TneaCutoff.insertMany(scraped);

    const cutoffDocs = scraped.map((entry) => ({
      college: entry.college_name,
      course: entry.department,
      year: entry.year,
      general: entry.oc_cutoff,
      obc: entry.bc_cutoff,
      sc: entry.sc_cutoff,
      st: entry.st_cutoff,
      category: entry.course_category,
      state: 'All States',
    }));

    await Cutoff.insertMany(cutoffDocs);

    res.json({ message: 'Imported successfully', count: scraped.length, data: scraped });
  } catch (error) {
    console.error('manualImport error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCutoffData,
  manualImport,
};
