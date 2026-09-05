const xlsx = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "..", "uploads", "Agriculture Collge Offered Courses.xlsx");
console.log("Reading file:", filePath);

try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log("Total rows:", data.length);
  if (data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
    console.log("First row details:");
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log("No data rows found.");
  }
} catch (err) {
  console.error("Error reading file:", err);
}
