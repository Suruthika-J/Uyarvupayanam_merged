const http = require('http');

http.get('http://localhost:5000/api/colleges/by-district/Thoothukudi', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("SUCCESS:", json.success);
      console.log("COUNT:", json.count);
      console.log("COLLEGE TYPES:", json.collegeTypes);
      console.log("\nCOLLEGES RETURNED:");
      json.data.forEach(c => {
        console.log(`- [${c.stream || c.type}] ${c.collegeName} (District: ${c.district})`);
      });
    } catch (err) {
      console.error("JSON Error:", err, data);
    }
  });
}).on('error', (err) => {
  console.error("HTTP Error:", err);
});
