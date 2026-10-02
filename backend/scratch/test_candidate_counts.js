const { resolveCandidateDomains } = require('../config/domainMappingConfig');

console.log("=== TESTING CANDIDATE DOMAIN COUNTS FOR VARIOUS USER SELECTIONS ===");

const testCases = [
  { name: "Single Specialization (Algorithms)", branch: "CSE", specs: ["Algorithms & System Programming"] },
  { name: "Zero Specializations Selected", branch: "CSE", specs: [] },
  { name: "4 Specializations Selected", branch: "CSE", specs: ["Software Engineering & Architecture", "Artificial Intelligence & Machine Learning", "Cyber Security & Ethical Hacking", "Algorithms & System Programming"] },
  { name: "Single Specialization (VLSI)", branch: "ECE", specs: ["VLSI & Chip Design"] }
];

testCases.forEach(tc => {
  const domains = resolveCandidateDomains(tc.branch, tc.specs);
  console.log(`\nTest: ${tc.name}`);
  console.log(`  Candidate Count: ${domains.length}`);
  console.log(`  Domains:`, domains.map(d => d.name));
  const valid = domains.length >= 2;
  console.log(`  Valid for AHP Pairwise (>= 2)? ${valid ? 'YES ✅' : 'NO ❌'}`);
});
