const fs = require('fs');
const content = fs.readFileSync('backend/uploads/master_460.csv', 'utf8');
console.log(content.split('\n')[0]);
console.log(content.split('\n')[1]);
