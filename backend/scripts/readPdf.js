const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('courses.pdf');
const raw = buf.toString('latin1');

// Find FlateDecode streams and inflate them
const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match;
const allText = [];

while ((match = streamRe.exec(raw)) !== null) {
  try {
    const compressed = Buffer.from(match[1], 'latin1');
    const decompressed = zlib.inflateSync(compressed).toString('utf-8');
    
    // Extract text from PDF text operators: Tj, TJ, '
    const tjMatches = decompressed.match(/\(([^)]*)\)/g);
    if (tjMatches) {
      tjMatches.forEach(m => {
        let text = m.slice(1, -1).trim();
        if (text.length > 1 && /[A-Za-z]{2}/.test(text)) {
          allText.push(text);
        }
      });
    }
  } catch (e) {
    // Not a FlateDecode stream or decompression failed, skip
  }
}

console.log(`=== Extracted ${allText.length} text segments ===`);
allText.forEach((t, i) => console.log(`${i}: ${t}`));
