/**
 * Centralized College Content Relevance & Eligibility Engine
 * 
 * Enforces strict domain relevance across Courses, Practice Tools, Dashboard Cards, 
 * Projects, Skill Gaps, and Learning Roadmaps.
 * 
 * NON-NEGOTIABLE RULE: If a content item is not meaningfully related to the student's
 * academic domain (Field -> Degree -> Domain -> Specialization -> Skills -> Career Goal),
 * it MUST NOT be returned as a recommendation.
 */

const norm = (str) => (str || '').toString().toLowerCase().trim()

/**
 * Normalizes array of strings or objects
 */
const normList = (arr) => {
  if (!Array.isArray(arr)) return []
  return arr.map(item => typeof item === 'string' ? norm(item) : norm(item?.name || item?.title || '')).filter(Boolean)
}

/**
 * Checks word boundary or substring match safely for short terms like "ce", "it", "ai", "me"
 */
const matchesTerm = (text, term) => {
  if (!text || !term) return false
  const nText = norm(text)
  const nTerm = norm(term)
  if (!nText || !nTerm) return false
  if (nTerm.length <= 3) {
    return new RegExp(`\\b${nTerm}\\b`, 'i').test(nText)
  }
  return nText.includes(nTerm)
}

/**
 * Checks whether two academic domain terms are related
 */
export function isDomainMatch(studentDomain, itemDomain, itemCategory) {
  const sDom = norm(studentDomain)
  const iDom = norm(itemDomain)
  const iCat = norm(itemCategory)

  if (!sDom) return false

  // Domain Alias Branch Table
  const aliases = {
    'computer science': ['computer', 'cse', 'software', 'ai', 'data science', 'it', 'artificial intelligence', 'programming', 'dsa', 'python'],
    'electronics': ['ece', 'electronics', 'embedded', 'telecommunication', 'vlsi', 'iot', 'microcontroller'],
    'mechanical': ['mechanical', 'me', 'cad/cam', 'solidworks', 'robotics', 'automobile', 'manufacturing', 'thermodynamics'],
    'civil': ['civil', 'ce', 'structural', 'construction', 'geotechnical'],
    'clinical': ['medicine', 'clinical', 'homoeopathy', 'general medicine', 'surgery', 'pharmacology', 'pathology'],
    'finance': ['commerce', 'accounting', 'finance', 'taxation', 'auditing', 'banking', 'tally', 'excel'],
    'law': ['law', 'legal', 'corporate law', 'jurisprudence', 'litigation']
  }

  for (const [branchKey, list] of Object.entries(aliases)) {
    const studentInBranch = matchesTerm(sDom, branchKey) || list.some(a => matchesTerm(sDom, a))
    if (studentInBranch) {
      const itemInBranch = (iDom && (matchesTerm(iDom, branchKey) || list.some(a => matchesTerm(iDom, a)))) ||
                           (iCat && (matchesTerm(iCat, branchKey) || list.some(a => matchesTerm(iCat, a))))
      if (itemInBranch) return true
    }
  }

  return false
}

/**
 * Calculates academic relevance score & compatibility breakdown for a content item
 * 
 * @param {Object} profile - Student profile
 * @param {Object} item - Course / Resource / Content item
 * @returns {Object} { isEligible, relevanceScore, matchType, explanation, breakdown }
 */
export function evaluateContentRelevance(profile = {}, item = {}) {
  const degree = norm(profile?.degreeProgramme)
  const domain = norm(profile?.domain)
  const spec = norm(profile?.specialization)
  const targetCareer = norm(profile?.targetCareer)

  const selectedSkills = normList(profile?.skills)
  const selfReportedSkills = normList(profile?.selfReportedSkills)
  const demonstratedStrengths = normList(profile?.onboardingBaseline?.strengths)

  const itemTitle = norm(item?.title || item?.courseName || item?.name)
  const itemCategory = norm(item?.category || item?.field)
  const itemDomain = norm(item?.domain || item?.domainId)
  const itemSpec = norm(item?.specialization)
  const itemLevel = norm(item?.level || item?.difficulty)
  const itemSkills = normList(item?.skills || item?.targetSkills)
  const itemCareers = normList(item?.careers || item?.targetCareers)

  let score = 0
  let hasPositiveRelationship = false
  let matchType = 'NOT_RELEVANT'

  // 1. Direct Specialization Match (+50)
  if (spec && itemSpec && (matchesTerm(itemSpec, spec) || matchesTerm(spec, itemSpec) || matchesTerm(itemTitle, spec))) {
    score += 50
    hasPositiveRelationship = true
    matchType = 'EXACT_SPECIALIZATION'
  }

  // 2. Direct Domain Match (+40)
  if (domain && isDomainMatch(domain, itemDomain, itemCategory)) {
    score += 40
    hasPositiveRelationship = true
    if (matchType === 'NOT_RELEVANT') matchType = 'EXACT_DOMAIN'
  }

  // 3. Degree Program Match (+25)
  if (degree && degree.length > 3 && matchesTerm(itemTitle, degree)) {
    score += 25
    hasPositiveRelationship = true
    if (matchType === 'NOT_RELEVANT') matchType = 'DEGREE_LEVEL'
  }

  // 4. Target Career Match (+25)
  if (targetCareer && targetCareer.length > 4 && (itemCareers.some(c => matchesTerm(c, targetCareer)) || matchesTerm(itemTitle, targetCareer))) {
    score += 25
    hasPositiveRelationship = true
    if (matchType === 'NOT_RELEVANT') matchType = 'CAREER_TARGET'
  }

  // 5. Selected Skills Match (+20)
  const hasSkillOverlap = itemSkills.some(s => s && (selectedSkills.includes(s) || selfReportedSkills.includes(s))) ||
                          selectedSkills.some(s => s && s.length > 5 && matchesTerm(itemTitle, s))
  if (hasSkillOverlap) {
    score += 20
    hasPositiveRelationship = true
    if (matchType === 'NOT_RELEVANT') matchType = 'SKILL_GAP'
  }

  // HARD DOMAIN FILTER: Reject if no positive domain/specialization/degree/career/skill relationship exists!
  if (!hasPositiveRelationship) {
    return {
      isEligible: false,
      relevanceScore: 0,
      matchType: 'NOT_RELEVANT',
      explanation: 'Not relevant to your academic domain.',
      breakdown: { domainMatch: false, specializationMatch: false, careerMatch: false, skillGapMatch: false }
    }
  }

  // Level awareness: Penalize introductory courses if student already demonstrated proficiency
  if ((itemLevel === 'beginner' || itemTitle.includes('intro') || itemTitle.includes('basics')) && demonstratedStrengths.some(s => s && s.length > 3 && matchesTerm(itemTitle, s))) {
    score -= 30
  }

  return {
    isEligible: score >= 20,
    relevanceScore: Math.min(100, Math.max(0, score)),
    matchType,
    explanation: `Recommended for your ${profile?.domain || 'academic'} degree pathway.`,
    breakdown: {
      domainMatch: score >= 40,
      specializationMatch: matchType === 'EXACT_SPECIALIZATION',
      careerMatch: score >= 25,
      skillGapMatch: hasSkillOverlap
    }
  }
}

/**
 * Hard filters and ranks a candidate content list for a student profile
 * 
 * @param {Object} profile - Student profile
 * @param {Array} items - Candidate content list
 * @returns {Array} Filtered & sorted relevant content list
 */
export function filterRelevantContent(profile = {}, items = []) {
  if (!Array.isArray(items) || items.length === 0) return []

  const evaluated = items.map(item => {
    const evalRes = evaluateContentRelevance(profile, item)
    return {
      ...item,
      relevance: evalRes
    }
  })

  // HARD DOMAIN FILTER: Exclude ineligible items completely
  const eligible = evaluated.filter(item => item.relevance.isEligible)

  // Rank by relevance score descending
  return eligible.sort((a, b) => b.relevance.relevanceScore - a.relevance.relevanceScore)
}
