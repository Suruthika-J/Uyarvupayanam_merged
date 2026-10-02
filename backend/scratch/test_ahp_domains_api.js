const http = require('http');

const url = 'http://localhost:5000/api/onboarding/ahp/domains?branchId=CSE&specializations=' + 
  encodeURIComponent('Software Engineering & Architecture, Artificial Intelligence & Machine Learning, Cyber Security & Ethical Hacking, Algorithms & System Programming');

console.log("Calling API:", url);

http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("\nAPI SUCCESS:", json.success);
      console.log("\nCANDIDATE DOMAINS RETURNED BY API:");
      json.candidateDomains.forEach((c, idx) => {
        console.log(`  ${idx + 1}. [${c.id}] ${c.name} (${c.category})`);
      });
      const names = json.candidateDomains.map(c => c.name);
      console.log("\nDoes list include 'Full Stack Web & Mobile Development'?", names.includes('Full Stack Web & Mobile Development') ? 'YES ❌' : 'NO ✅ (PERFECT)');
    } catch (err) {
      console.error("Parse Error:", err, data);
    }
  });
}).on('error', err => {
  console.error("HTTP Error:", err);
});
