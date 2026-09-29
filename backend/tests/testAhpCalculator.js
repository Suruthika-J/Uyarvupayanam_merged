const {
  getCandidateDomainsForBranch,
  buildAhpMatrix,
  calculatePriorityVector,
  calculateConsistencyRatio,
  computeAhpEngine
} = require("../utils/ahpCalculator");

console.log("=== RUNNING AHP CALCULATOR DETERMINISTIC TESTS ===");

// 1. Candidate domain generation
const cseCandidates = getCandidateDomainsForBranch("cse", ["Artificial Intelligence & Machine Learning"]);
console.assert(cseCandidates.length >= 2 && cseCandidates.length <= 7, "CSE Candidates count should be between 2 and 7");
console.log(`✅ Candidate domains test passed (${cseCandidates.length} domains found for CSE).`);

// Scenario 1: Consistent Preference (AI/ML consistently preferred over all other domains)
const domainIds = ["ai_ml", "data_science", "cyber_security", "cloud_devops", "software_engineering"];
const candidateDomains = domainIds.map(id => ({ id, name: id, category: "Tech", description: id }));

const consistentComparisons = [
  { domainA: "ai_ml", domainB: "data_science", selectedDomain: "ai_ml", intensity: 5 },
  { domainA: "ai_ml", domainB: "cyber_security", selectedDomain: "ai_ml", intensity: 7 },
  { domainA: "ai_ml", domainB: "cloud_devops", selectedDomain: "ai_ml", intensity: 7 },
  { domainA: "ai_ml", domainB: "software_engineering", selectedDomain: "ai_ml", intensity: 9 },
  { domainA: "data_science", domainB: "cyber_security", selectedDomain: "data_science", intensity: 3 },
  { domainA: "data_science", domainB: "cloud_devops", selectedDomain: "data_science", intensity: 3 },
  { domainA: "data_science", domainB: "software_engineering", selectedDomain: "data_science", intensity: 5 },
  { domainA: "cyber_security", domainB: "cloud_devops", selectedDomain: "cyber_security", intensity: 1 },
  { domainA: "cyber_security", domainB: "software_engineering", selectedDomain: "cyber_security", intensity: 3 },
  { domainA: "cloud_devops", domainB: "software_engineering", selectedDomain: "cloud_devops", intensity: 3 }
];

const res1 = computeAhpEngine({ candidateDomains, pairwiseComparisons: consistentComparisons });

console.assert(res1.topDomain.id === "ai_ml", "Scenario 1: AI/ML should be top ranked domain");
console.assert(res1.isConsistent === true, "Scenario 1: CR should be consistent (<= 0.10)");
console.assert(res1.consistencyRatio <= 0.10, `Scenario 1: CR should be <= 0.10, got ${res1.consistencyRatio}`);
const sumWeights1 = Object.values(res1.priorityWeights).reduce((a, b) => a + b, 0);
console.assert(Math.abs(sumWeights1 - 1.0) < 0.01, `Sum of weights should be ~1.0, got ${sumWeights1}`);
console.log(`✅ Scenario 1 (Consistent Preference) Passed! Top Domain: ${res1.topDomain.name} (${res1.topDomain.scorePercent}%), CR: ${res1.consistencyRatio} (${res1.consistencyStatus})`);

// Scenario 2: All domains equally preferred
const equalComparisons = [];
for (let i = 0; i < domainIds.length; i++) {
  for (let j = i + 1; j < domainIds.length; j++) {
    equalComparisons.push({ domainA: domainIds[i], domainB: domainIds[j], selectedDomain: domainIds[i], intensity: 1 });
  }
}
const res2 = computeAhpEngine({ candidateDomains, pairwiseComparisons: equalComparisons });
console.assert(res2.consistencyRatio === 0, `Scenario 2: Equal preference CR should be 0.0, got ${res2.consistencyRatio}`);
console.assert(res2.isConsistent === true, "Scenario 2: Equal preference should be consistent");
console.log(`✅ Scenario 2 (Equal Preference) Passed! CR: ${res2.consistencyRatio}`);

// Scenario 3: Inconsistent Comparisons (Intransitive loop A > B, B > C, C > A with high intensity)
const inconsistentComparisons = [
  { domainA: "ai_ml", domainB: "data_science", selectedDomain: "ai_ml", intensity: 9 },
  { domainA: "data_science", domainB: "cyber_security", selectedDomain: "data_science", intensity: 9 },
  { domainA: "cyber_security", domainB: "ai_ml", selectedDomain: "cyber_security", intensity: 9 },
  { domainA: "cloud_devops", domainB: "software_engineering", selectedDomain: "cloud_devops", intensity: 1 }
];
const res3 = computeAhpEngine({ candidateDomains, pairwiseComparisons: inconsistentComparisons });
console.assert(res3.consistencyRatio > 0.10, `Scenario 3: CR should be > 0.10 for inconsistent loop, got ${res3.consistencyRatio}`);
console.assert(res3.isConsistent === false, "Scenario 3: Should flag as inconsistent");
console.log(`✅ Scenario 3 (Inconsistent Preferences) Passed! High CR Detected: ${res3.consistencyRatio} (${res3.consistencyStatus})`);

console.log("=== ALL AHP ENGINE TESTS PASSED SUCCESSFULLY! ===");
