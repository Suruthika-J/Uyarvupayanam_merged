const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function inspectCsv(filePath) {
  console.log("Reading:", filePath);
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist!");
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  const sampleLines = [];
  for await (const line of rl) {
    lineCount++;
    if (sampleLines.length < 10) sampleLines.push(line);
  }
  console.log(`Total lines in ${path.basename(filePath)}: ${lineCount}`);
  console.log("Sample lines:\n", sampleLines.join("\n"));
}

async function run() {
  await inspectCsv(path.join(__dirname, '../uploads/college.csv'));
  await inspectCsv(path.join(__dirname, '../uploads/TNEA 2025 _ engineering.csv'));
}

run();
