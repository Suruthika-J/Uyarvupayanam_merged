const fs = require('fs');
const path = require('path');

const files = [
  '../seeders/seedPolytechnicColleges.js',
  '../seeders/seedPolytechnicCollegesPart2.js',
  '../seeders/seedPolytechnicCollegesPart3.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  // Match code inside parentheses at the end of the name
  const matches = content.match(/\(\d+\)/g);
  console.log(`File ${file} has ${matches ? matches.length : 0} codes.`);
  if (matches) {
    if (matches.includes('(352)')) {
      console.log(`  -> FOUND (352) in ${file}!`);
    }
  }
});
