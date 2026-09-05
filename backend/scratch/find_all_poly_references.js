const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../'); // Project root

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, callback);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.endsWith('.md'))) {
      callback(filePath);
    }
  }
}

console.log('Searching for Polytechnic/Diploma references in project...');
walk(rootDir, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('seedPolytechnicColleges') || content.includes('polytechnicColleges')) {
    console.log(`Found reference in: ${filePath}`);
  }
});
