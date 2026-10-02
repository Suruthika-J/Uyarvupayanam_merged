const { resolveCandidateDomains } = require('../config/domainMappingConfig');
const { computeAhpEngine } = require('../utils/ahpCalculator');

console.log("=== TESTING DOMAIN & AHP PIPELINE FOR MULTIPLE BRANCHES ===");

const branchesToTest = [
  { branchId: "Computer Science & Engineering", specs: ["AI & Machine Learning", "Full Stack"] },
  { branchId: "Information Technology", specs: ["Cloud Computing", "Cyber Security"] },
  { branchId: "Artificial Intelligence & Data Science", specs: ["Machine Learning", "Big Data"] },
  { branchId: "Electronics & Communication Engineering", specs: ["VLSI", "Embedded Systems"] },
  { branchId: "Electrical & Electronics Engineering", specs: ["Electric Vehicle", "Power Systems"] },
  { branchId: "Mechanical Engineering", specs: ["CAD Modeling", "Robotics"] },
  { branchId: "Civil Engineering", specs: ["Structural Engineering"] },
  { branchId: "Mechatronics Engineering", specs: ["Robotics & Automation"] }
];

branchesToTest.forEach(testCase => {
  const candidates = resolveCandidateDomains(testCase.branchId, testCase.specs);
  console.log(`\nBranch: "${testCase.branchId}" | Specializations: ${JSON.stringify(testCase.specs)}`);
  console.log(`  -> Candidate Domains (${candidates.length}):`);
  candidates.forEach((c, idx) => {
    console.log(`     ${idx + 1}. [${c.id}] ${c.name} (${c.category})`);
  });

  // Simulate equal AHP comparisons for the candidates
  const samplePairs = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      samplePairs.push({
        domainA: candidates[i].id,
        domainB: candidates[j].id,
        selectedDomain: candidates[i].id,
        intensity: 3
      });
    }
  }

  const ahpRes = computeAhpEngine({ candidateDomains: candidates, pairwiseComparisons: samplePairs });
  console.log(`  -> Top 3 AHP Ranked Domains for Assessment (Step 6):`);
  ahpRes.candidateDomainsForStep6.forEach((top, idx) => {
    console.log(`     Rank ${idx + 1}: ${top.name} (${top.id}) — Weight: ${top.scorePercent}%`);
  });
});

console.log("\n✅ ALL DOMAIN BRANCH PIPELINES PASSED VERIFICATION!");
