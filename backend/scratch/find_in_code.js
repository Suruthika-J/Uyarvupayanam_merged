const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../'),
  path.join(__dirname, '../seeders'),
  path.join(__dirname, '../scripts')
];

function searchDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.toLowerCase().includes('lakshmi ammal') || content.includes('352')) {
        console.log(`Found match in file: ${filePath}`);
      }
    }
  }
}

dirs.forEach(searchDir);
