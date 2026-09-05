const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Normalizes course names based on the user's mapping.
 */
const normalizeCourseName = (fullName) => {
  // We want the most accurate name possible, so we return the full name 
  // cleaned of extra spaces and in Title Case or Upper Case as found in PDF.
  return fullName.replace(/\s+/g, ' ').trim().toUpperCase();
};

/**
 * Parses the TNEA PDF text into structured data.
 */
const parseTneaPdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const lines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const collegesMap = new Map();
  
  let currentCollegeCode = null;
  let currentCollegeName = null;
  let currentBranchCode = null;
  let currentBranchNameLines = [];
  
  // State 0: Looking for College Code
  // State 1: Looking for College Name / Branch Code
  // State 2: Accumulating Branch Name
  let state = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip headers/footers
    if (line.includes("TAMILNADU ENGIINEERING ADMISSIONS") || line.includes("Page") || line.includes("DIRECTORATE OF TECHNICAL EDUCATION")) continue;
    if (line === "COLLEGE" || line === "CODE" || line === "COLLEGE NAME" || line === "BRANCH" || line === "BRANCH NAME OC BC BCM MBC SC SCA ST") continue;

    // Check if line is a sequence of intake numbers (end of a branch record)
    // TNEA 2024 has 7 category numbers
    const intakeMatch = line.match(/^(\d+\s+){6,}\d+$/);
    if (intakeMatch) {
      if (currentCollegeCode && currentBranchCode && currentBranchNameLines.length > 0) {
        const fullName = currentBranchNameLines.join(" ").replace(/\s+/g, " ").trim().toUpperCase();
        
        if (!collegesMap.has(currentCollegeCode)) {
          collegesMap.set(currentCollegeCode, {
            collegeCode: currentCollegeCode,
            collegeName: currentCollegeName || "Unknown College",
            courses: new Map()
          });
        }
        
        const collegeData = collegesMap.get(currentCollegeCode);
        if (!collegeData.courses.has(fullName)) {
          collegeData.courses.set(fullName, {
            full: fullName,
            short: currentBranchCode,
            code: currentBranchCode
          });
        }
      }
      // Reset branch state
      currentBranchCode = null;
      currentBranchNameLines = [];
      state = 0; 
      continue;
    }

    // Heuristic for College Code (often repeated)
    if (/^\d{1,4}$/.test(line) && state === 0) {
      currentCollegeCode = line;
      state = 1;
      continue;
    }

    // If we have a code, the next line is usually the name
    if (state === 1) {
      // If the line is short (2-3 chars) and uppercase, it's likely a branch code
      if (/^[A-Z]{2,3}$/.test(line)) {
        currentBranchCode = line;
        state = 2;
      } else {
        // It's part of the college name/address
        if (!currentCollegeName || (collegesMap.has(currentCollegeCode) && collegesMap.get(currentCollegeCode).collegeName.length < 5)) {
           currentCollegeName = line;
        }
      }
      continue;
    }

    // Accumulating branch name
    if (state === 2) {
       // Avoid address lines/noise if they accidentally get in
       if (/\d{6}$/.test(line) || line.includes("Road") || line.includes("Guindy") || line.includes("District")) {
          // Skip noise
       } else {
          currentBranchNameLines.push(line);
       }
       continue;
    }
  }

  return Array.from(collegesMap.values()).map(c => ({
    ...c,
    courses: Array.from(c.courses.values())
  }));
};

module.exports = { parseTneaPdf, normalizeCourseName };
