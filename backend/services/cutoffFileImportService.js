const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const XLSX = require("xlsx");

function getUploadsDir() {
  return path.join(__dirname, "..", "uploads");
}

function listUploadFiles() {
  const uploadsDir = getUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    throw new Error(`Uploads folder not found: ${uploadsDir}`);
  }

  return fs
    .readdirSync(uploadsDir)
    .filter((f) => !f.startsWith("."))
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ext === ".csv" || ext === ".xlsx" || ext === ".xls";
    })
    .map((f) => path.join(uploadsDir, f));
}

function pickFilePath({ filename } = {}) {
  const uploadsDir = getUploadsDir();
  if (filename) {
    return path.join(uploadsDir, filename);
  }

  const files = listUploadFiles();
  if (!files.length) {
    throw new Error(`No .csv/.xlsx files found in uploads folder: ${uploadsDir}`);
  }

  return files[0];
}

function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    const rows = [];
    fs.createReadStream(filePath)
      .pipe(
        csvParser({
          // Do not transform headers/values; keep them as-is.
          mapHeaders: ({ header }) => (header ?? "").replace(/^\uFEFF/, ""),
          mapValues: ({ value }) => value,
          strict: false,
          skipLines: 0,
        })
      )
      .on("data", (data) => {
        rows.push(data);
      })
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });
}

function parseExcelFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true, raw: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];

  // defval keeps empty cells, raw keeps original cell types (numbers/dates stay as-is)
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
}

function stableKey(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (value instanceof Date) return `__DATE__${value.toISOString()}`;
  if (Array.isArray(value)) return `[${value.map(stableKey).join(",")}]`;
  if (typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableKey(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function removeDuplicateRows(rows) {
  const seen = new Set();
  const unique = [];
  let duplicates = 0;

  for (const row of rows) {
    const key = stableKey(row);
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    unique.push(row);
  }

  return { unique, duplicates };
}

async function readAndParseUploadFile({ filename } = {}) {
  const filePath = pickFilePath({ filename });
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".csv") {
    return { filePath, rows: await parseCsvFile(filePath) };
  }

  if (ext === ".xlsx" || ext === ".xls") {
    return { filePath, rows: parseExcelFile(filePath) };
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = {
  getUploadsDir,
  listUploadFiles,
  pickFilePath,
  parseCsvFile,
  parseExcelFile,
  removeDuplicateRows,
  readAndParseUploadFile,
};

