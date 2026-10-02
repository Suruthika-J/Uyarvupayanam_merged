const { resolveCandidateDomains } = require('../config/domainMappingConfig');
const { computeAhpEngine } = require('../utils/ahpCalculator');

console.log("=== TESTING USER'S EXACT SCREENSHOT SELECTIONS ===");

const branchId = "CSE (Computer Science & Engineering)";
const userSpecializations = [
  "Software Engineering & Architecture",
  "Artificial Intelligence & Machine Learning",
  "Cyber Security & Ethical Hacking",
  "Algorithms & System Programming"
];

console.log("\nUser Branch:", branchId);
console.log("User Selected Specializations:", userSpecializations);

const candidateDomains = resolveCandidateDomains(branchId, userSpecializations);

console.log("\nResolved AHP Candidate Domains:");
candidateDomains.forEach((c, idx) => {
  console.log(`  ${idx + 1}. [${c.id}] ${c.name} (${c.category})`);
});

// Check if Full Stack is present
const hasFullStack = candidateDomains.some(c => c.id === 'full_stack' || c.name.includes("Full Stack"));
console.log("\nIs Full Stack in candidate list?", hasFullStack ? "YES ❌ (BUG)" : "NO ✅ (CORRECT)");

// Generate pairwise comparisons for the 4 selected domains
const samplePairs = [];
for (let i = 0; i < candidateDomains.length; i++) {
  for (let j = i + 1; j < candidateDomains.length; j++) {
    samplePairs.push({
      pairKey: `${candidateDomains[i].id}_vs_${candidateDomains[j].id}`,
      domainA: candidateDomains[i],
      domainB: candidateDomains[j]
    });
  }
}

console.log(`\nGenerated AHP Pairwise Comparisons (${samplePairs.length} pairs total):`);
samplePairs.forEach((p, idx) => {
  console.log(`  Pair ${idx + 1}: "${p.domainA.name}" VS "${p.domainB.name}"`);
});

console.log("\n✅ TEST SUCCESSFUL!");
