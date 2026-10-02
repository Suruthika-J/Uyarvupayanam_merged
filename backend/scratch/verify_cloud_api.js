const http = require('http');

http.get('http://localhost:5000/api/onboarding/discovery/questions?branch=CSE&domains=cloud_devops', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("SUCCESS:", json.success);
      console.log("COUNT:", json.count);
      console.log("\nCLOUD DEVOPS QUESTIONS & OPTIONS RETURNED BY LIVE API:\n");
      (json.questions || []).forEach((q, idx) => {
        console.log(`Question ${idx + 1} [Difficulty: ${q.difficulty}]:`);
        console.log(`  Text: "${q.questionText}"`);
        console.log(`  Option A: "${q.options[0]?.text}"`);
        console.log(`  Option B: "${q.options[1]?.text}"`);
        console.log(`  Option C: "${q.options[2]?.text}"`);
        console.log(`  Option D: "${q.options[3]?.text}"\n`);
      });
    } catch (err) {
      console.error("JSON Error:", err, data);
    }
  });
}).on('error', err => {
  console.error("HTTP Error:", err);
});
