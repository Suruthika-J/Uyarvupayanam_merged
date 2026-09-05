const fs = require('fs');
const data = fs.readFileSync('cutoffs.json', 'utf8');
const cleaned = data.replace(/^\uFEFF/, '');
try {
  const json = JSON.parse(cleaned);
  console.log('Count:', json.length || Object.keys(json).length);
  if (Array.isArray(json)) {
    console.log(json[0]);
  }
} catch(e) {
  console.log("Still failed to parse");
}
