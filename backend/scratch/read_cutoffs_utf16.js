const fs = require('fs');
let data = fs.readFileSync('cutoffs.json', 'utf16le');
if (data.charCodeAt(0) === 0xFEFF) {
  data = data.slice(1);
}
try {
  const json = JSON.parse(data);
  console.log('Is Array?', Array.isArray(json));
  if (json.data) console.log('Has Data Array?', Array.isArray(json.data));
  const arr = Array.isArray(json) ? json : (json.data || Object.values(json)[0]);
  console.log('Count:', arr.length);
  if (arr.length) {
    console.log(JSON.stringify(arr[0], null, 2));
  }
} catch(e) {
  console.log("Error:", e.message);
}
