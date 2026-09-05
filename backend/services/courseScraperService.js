const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Normalizes course names into standard abbreviations and full names
 * @param {string} name - Raw course name from website
 * @returns {object} - { fullName, shortCode }
 */
const normalizeCourse = (name) => {
  if (!name) return null;
  
  let cleanName = name
    .replace(/<[^>]+>/g, "") // Remove HTML tags if any
    .replace(/\s+/g, " ")    // Normalize whitespace
    .trim();

  const lowerName = cleanName.toLowerCase();
  
  // Define mapping rules
  const mappings = [
    { pattern: /computer science (and|&|&amp;) engineering|cse/i, full: "Computer Science and Engineering", short: "CSE" },
    { pattern: /electronics (and|&|&amp;) communication engineering|ece/i, full: "Electronics and Communication Engineering", short: "ECE" },
    { pattern: /electrical (and|&|&amp;) electronics engineering|eee/i, full: "Electrical and Electronics Engineering", short: "EEE" },
    { pattern: /information technology|it/i, full: "Information Technology", short: "IT" },
    { pattern: /artificial intelligence (and|&|&amp;) data science|ai(&|&amp;|s)ds/i, full: "Artificial Intelligence and Data Science", short: "AIDS" },
    { pattern: /mechanical engineering|mech/i, full: "Mechanical Engineering", short: "Mechanical" },
    { pattern: /civil engineering|civil/i, full: "Civil Engineering", short: "Civil" },
    { pattern: /biotechnology|b\.tech biotech/i, full: "Biotechnology", short: "BT" },
    { pattern: /bio medical engineering|bme/i, full: "Bio Medical Engineering", short: "BME" },
    { pattern: /chemical engineering/i, full: "Chemical Engineering", short: "Chemical" },
    { pattern: /fashion technology/i, full: "Fashion Technology", short: "FT" },
    { pattern: /textile technology/i, full: "Textile Technology", short: "TT" },
    { pattern: /robotics (and|&|&amp;) automation/i, full: "Robotics and Automation", short: "RA" },
    { pattern: /mechatronics engineering/i, full: "Mechatronics Engineering", short: "Mechatronics" },
    { pattern: /cyber security/i, full: "Cyber Security", short: "CS" },
    { pattern: /data science/i, full: "Data Science", short: "DS" },
    { pattern: /medicine (and|&|&amp;) surgery|mbbs/i, full: "MBBS", short: "MBBS" },
    { pattern: /b\.sc nursing|nursing/i, full: "B.Sc Nursing", short: "Nursing" },
    { pattern: /b\.com|bachelor of commerce/i, full: "B.Com", short: "B.Com" },
    { pattern: /b\.a\s|bachelor of arts/i, full: "B.A", short: "B.A" },
    { pattern: /b\.sc\s|bachelor of science/i, full: "B.Sc", short: "B.Sc" },
    { pattern: /m\.b\.a|master of business administration/i, full: "MBA", short: "MBA" },
    { pattern: /m\.c\.a|master of computer applications/i, full: "MCA", short: "MCA" }
  ];

  for (const m of mappings) {
    if (m.pattern.test(lowerName)) {
      return { fullName: m.full, shortCode: m.short };
    }
  }

  // Fallback: Extract from patterns like "B.E. Mechanical", "B.Tech IT"
  const degreeRegex = /(B\.E|B\.Tech|M\.E|M\.Tech|B\.Sc|M\.Sc|B\.Com|M\.Com|B\.A|M\.A|MBA|MBBS|BDS|BAMS|Diploma)\.?\s*([A-Za-z\s&]+)/i;
  const match = cleanName.match(degreeRegex);
  if (match) {
    return { 
      fullName: cleanName, 
      shortCode: match[1].toUpperCase() 
    };
  }

  // Simple heuristic fallback
  if (/engineering|technology|science|nursing|pharmacy|arts|commerce|management/i.test(lowerName)) {
      return { fullName: cleanName, shortCode: "GENERAL" };
  }

  return null;
};

/**
 * Fetches and parses courses from a college website
 * @param {string} url - The URL to scrape
 * @returns {Promise<Array>} - List of normalized courses
 */
const fetchCoursesFromUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });

    const $ = cheerio.load(response.data);
    const foundCourses = new Set();
    const results = [];

    const extractFromDom = (doc) => {
      doc("li, td, p, h3, h4, a").each((i, el) => {
        const text = doc(el).text().trim();
        if (text.length > 5 && text.length < 100) {
          const normalized = normalizeCourse(text);
          if (normalized && !foundCourses.has(normalized.fullName)) {
            foundCourses.add(normalized.fullName);
            results.push({
              courseFullName: normalized.fullName,
              normalizedCourseName: normalized.shortCode,
              rawText: text
            });
          }
        }
      });
    };

    extractFromDom($);

    // If no courses found, try common sub-paths
    if (results.length === 0) {
      const subPaths = ["courses", "academics", "departments", "academic-programmes"];
      for (const path of subPaths) {
        try {
          const subUrl = url.endsWith("/") ? `${url}${path}` : `${url}/${path}`;
          const subRes = await axios.get(subUrl, { timeout: 8000 });
          const $sub = cheerio.load(subRes.data);
          extractFromDom($sub);
          if (results.length > 0) break;
        } catch (e) {
          // ignore sub-path fail
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Error fetching courses from ${url}:`, error.message);
    throw error;
  }
};

/**
 * Tries to "guess" or "find" the official website for a college based on its name
 * @param {string} name - College name
 * @returns {string} - Likely website URL
 */
const findWebsiteByName = (name) => {
  if (!name) return "";
  const lower = name.toLowerCase();

  // Pattern matching for common institutions (Fuzzy)
  if (/government iti|govt iti/i.test(lower)) return "https://skilltraining.tn.gov.in/";
  if (/bharathiar university/i.test(lower)) return "https://b-u.ac.in/";
  if (/alagappa university/i.test(lower)) return "https://alagappauniversity.ac.in/";
  if (/madurai kamaraj university/i.test(lower)) return "https://mkuniversity.ac.in/";
  if (/ethiraj college/i.test(lower)) return "https://ethirajcollege.edu.in/";
  if (/mar gregorios college/i.test(lower)) return "https://mgcl.ac.in/";
  if (/madras university|university of madras/i.test(lower)) return "https://www.unom.ac.in/";
  if (/anna university/i.test(lower)) return "https://www.annauniv.edu/";
  if (/distance education/i.test(lower) && /bharathidasan/i.test(lower)) return "https://www.bdu.ac.in/cde/";
  if (/psg college/i.test(lower)) return "https://www.psgcas.ac.in/";
  if (/loyola college/i.test(lower)) return "https://www.loyolacollege.edu/";
  if (/madras christian college|mcc/i.test(lower)) return "https://mcc.edu.in/";
  if (/srm institute|srm university/i.test(lower)) return "https://www.srmist.edu.in/";
  if (/vit university|vit vellore/i.test(lower)) return "https://vit.ac.in/";
  if (/amrita vishwa/i.test(lower)) return "https://www.amrita.edu/";
  if (/sastra/i.test(lower)) return "https://www.sastra.edu/";
  if (/nit trichy|national institute of technology.*trichy/i.test(lower)) return "https://www.nitt.edu/";
  if (/iit madras/i.test(lower)) return "https://www.iitm.ac.in/";

  return "";
};

module.exports = {
  fetchCoursesFromUrl,
  normalizeCourse,
  findWebsiteByName
};
