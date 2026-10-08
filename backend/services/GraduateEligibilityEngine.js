/**
 * GraduateEligibilityEngine.js
 * 
 * Deterministic eligibility & matching engine for Graduate Opportunities.
 * Never uses LLM alone to decide factual eligibility.
 */

const normalizeString = (str) => String(str || "").toLowerCase().trim();

/**
 * Checks if student degree matches eligible degrees
 */
const checkDegreeEligibility = (studentDegree, studentDegreeId, eligibleDegrees, eligibleDegreeIds) => {
  const sDeg = normalizeString(studentDegree);
  const sDegId = normalizeString(studentDegreeId);

  const eDegs = (eligibleDegrees || []).map(d => normalizeString(d));
  const eDegIds = (eligibleDegreeIds || []).map(id => normalizeString(id));

  if (eDegs.includes("all") || eDegIds.includes("all") || eDegs.includes("any graduate degree") || eDegs.includes("graduate")) {
    return { isMatch: true, reason: "Opportunity is open to all recognized Graduate Degrees." };
  }

  const matchesId = sDegId && eDegIds.some(id => sDegId.includes(id) || id.includes(sDegId));
  const matchesName = sDeg && eDegs.some(d => sDeg.includes(d) || d.includes(sDeg));

  if (matchesId || matchesName) {
    return { isMatch: true, reason: `Your ${studentDegree || "degree"} satisfies the stated degree requirement.` };
  }

  return { isMatch: false, reason: `Requires degree in: ${(eligibleDegrees || []).join(", ")}.` };
};

/**
 * Checks if student specialization matches eligible specializations
 */
const checkSpecializationEligibility = (studentSpec, studentSpecId, eligibleSpecs, eligibleSpecIds) => {
  if (!eligibleSpecs || eligibleSpecs.length === 0) {
    return { isMatch: true, reason: "No specific branch restriction listed." };
  }

  const sSpec = normalizeString(studentSpec);
  const sSpecId = normalizeString(studentSpecId);

  const eSpecs = eligibleSpecs.map(s => normalizeString(s));
  const eSpecIds = (eligibleSpecIds || []).map(id => normalizeString(id));

  if (eSpecs.includes("all") || eSpecIds.includes("all") || eSpecs.includes("any specialization") || eSpecs.includes("all engineering branches")) {
    return { isMatch: true, reason: "All specializations / branches are eligible." };
  }

  const matchesId = sSpecId && eSpecIds.some(id => sSpecId.includes(id) || id.includes(sSpecId));
  const matchesName = sSpec && eSpecs.some(s => sSpec.includes(s) || s.includes(sSpec));

  if (matchesId || matchesName) {
    return { isMatch: true, reason: `Your specialization in ${studentSpec || "field"} matches the eligible branches.` };
  }

  return { isMatch: false, reason: `Targeted specializations: ${eligibleSpecs.join(", ")}.` };
};

/**
 * Checks CGPA / Percentage requirement
 */
const checkGradeEligibility = (studentCgpa, studentPercentage, oppCgpa, oppPercentage) => {
  const numCgpa = parseFloat(studentCgpa);
  const reqCgpa = parseFloat(oppCgpa);

  if (!isNaN(numCgpa) && !isNaN(reqCgpa)) {
    if (numCgpa >= reqCgpa) {
      return { isMatch: true, reason: `Your CGPA (${numCgpa}) satisfies the minimum threshold (${reqCgpa}).` };
    } else {
      return { isMatch: false, reason: `Minimum CGPA requirement is ${reqCgpa} (Your CGPA: ${numCgpa}).` };
    }
  }

  return { isMatch: true, reason: "CGPA requirement is met or not strictly restricted." };
};

/**
 * Main Deterministic Eligibility Evaluation Engine
 */
function evaluateEligibility(studentProfile, opportunity) {
  const degreeResult = checkDegreeEligibility(
    studentProfile?.degree,
    studentProfile?.degreeId,
    opportunity?.eligibleDegrees,
    opportunity?.eligibleDegreeIds
  );

  const specResult = checkSpecializationEligibility(
    studentProfile?.specialization,
    studentProfile?.specializationId,
    opportunity?.eligibleSpecializations,
    opportunity?.eligibleSpecializationIds
  );

  const gradeResult = checkGradeEligibility(
    studentProfile?.cgpa,
    studentProfile?.percentage,
    opportunity?.cgpaRequirement,
    opportunity?.percentageRequirement
  );

  const isEligible = degreeResult.isMatch && specResult.isMatch && gradeResult.isMatch;

  const reasons = [];
  const missingRequirements = [];

  if (degreeResult.isMatch) reasons.push(degreeResult.reason);
  else missingRequirements.push(degreeResult.reason);

  if (specResult.isMatch) reasons.push(specResult.reason);
  else missingRequirements.push(specResult.reason);

  if (gradeResult.isMatch) reasons.push(gradeResult.reason);
  else missingRequirements.push(gradeResult.reason);

  // ── Calculate Match Score (0–100) ─────────────────────────────────────────
  let degreeMatchScore = degreeResult.isMatch ? 25 : 0;
  let specMatchScore = specResult.isMatch ? 25 : 0;

  // Career Interest & Domain Matching
  const userInterests = (studentProfile?.careerInterests || []).map(i => normalizeString(i));
  const userDomains = (studentProfile?.preferredDomains || []).map(d => normalizeString(d));
  const oppCat = normalizeString(opportunity?.category);
  const oppOrg = normalizeString(opportunity?.organization);
  const oppTitle = normalizeString(opportunity?.opportunityName);

  let interestMatchScore = 0;
  if (userInterests.some(i => oppCat.includes(i) || i.includes(oppCat) || oppTitle.includes(i))) {
    interestMatchScore = 20;
  } else if (userInterests.length > 0) {
    interestMatchScore = 10;
  }

  let domainMatchScore = 0;
  if (userDomains.some(d => oppTitle.includes(d) || oppOrg.includes(d))) {
    domainMatchScore = 10;
  } else {
    domainMatchScore = 5;
  }

  // Eligibility Match (15%)
  let eligibilityScore = isEligible ? 15 : 0;

  // Deadline Relevance (5%)
  let deadlineScore = 5;
  if (opportunity?.status === "CLOSING_SOON") deadlineScore = 5;
  else if (opportunity?.status === "OPEN") deadlineScore = 4;
  else if (opportunity?.status === "UPCOMING") deadlineScore = 3;

  let matchScore = degreeMatchScore + specMatchScore + interestMatchScore + eligibilityScore + deadlineScore + domainMatchScore;
  matchScore = Math.min(99, Math.max(40, matchScore));

  return {
    eligible: isEligible,
    confidence: isEligible ? 0.95 : 0.85,
    matchScore,
    reasons: reasons.length > 0 ? reasons : ["General graduate relevance"],
    missingRequirements,
    source: {
      title: opportunity?.sourceTitle || opportunity?.source || "Official Notification",
      url: opportunity?.officialWebsite || opportunity?.sourceUrl || opportunity?.applicationUrl || "#",
      type: opportunity?.sourceType || "official",
      lastVerifiedAt: opportunity?.lastVerifiedAt || new Date()
    }
  };
}

module.exports = {
  evaluateEligibility,
  checkDegreeEligibility,
  checkSpecializationEligibility
};
