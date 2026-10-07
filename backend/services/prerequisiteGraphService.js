/**
 * prerequisiteGraphService.js
 * Dependency graph analysis & topological ordering for learning roadmap topics
 */

class PrerequisiteGraphService {
  /**
   * Known prerequisite chains for core technical & placement domains
   */
  static getPrerequisiteMap(category) {
    return {
      // Aptitude Chain
      "number system": [],
      "simplification": ["number system"],
      "hcf & lcm": ["number system"],
      "percentages": ["number system"],
      "ratio & proportion": ["number system"],
      "averages": ["number system"],
      "profit & loss": ["percentages"],
      "simple & compound interest": ["percentages"],
      "ratio & proportion": ["number system"],
      "mixtures & allegations": ["ratio & proportion"],
      "partnership": ["ratio & proportion"],
      "time & work": ["ratio & proportion"],
      "pipes & cisterns": ["time & work"],
      "time, speed & distance": ["ratio & proportion"],
      "trains & boats": ["time, speed & distance"],
      "permutation & combination": ["number system"],
      "probability": ["permutation & combination"],

      // DBMS Chain
      "er diagrams": [],
      "basic sql": [],
      "sql joins": ["basic sql"],
      "subqueries": ["basic sql"],
      "indexes": ["basic sql"],
      "transactions & acid": ["basic sql"],
      "normalization": ["basic sql", "er diagrams"],
      "query optimization": ["indexes", "sql joins"],

      // Python / Web / ML Chains
      "variables & data types": [],
      "control statements": ["variables & data types"],
      "functions": ["control statements"],
      "built-in data structures": ["functions"],
      "object-oriented programming": ["functions"],
      "numpy & pandas": ["built-in data structures"],
      "statistics": [],
      "supervised learning": ["python", "numpy & pandas", "statistics"],
      "unsupervised learning": ["supervised learning"],
      "model evaluation": ["supervised learning"]
    };
  }

  /**
   * Topological sort for ordering topics based on prerequisite dependencies
   */
  static orderTopicsByPrerequisites(topics, category) {
    if (!Array.isArray(topics) || topics.length === 0) return [];

    const prereqMap = this.getPrerequisiteMap(category);
    const ordered = [];
    const visited = new Set();

    const visit = (t) => {
      if (visited.has(t.topicId || t.name)) return;

      const normName = (t.name || "").toLowerCase();
      const prereqs = t.prerequisites || prereqMap[normName] || [];

      // Visit prerequisites first
      for (const pName of prereqs) {
        const matchingTopic = topics.find(
          other => (other.name || "").toLowerCase().includes(pName.toLowerCase()) || (other.topicId || "") === pName
        );
        if (matchingTopic && !visited.has(matchingTopic.topicId || matchingTopic.name)) {
          visit(matchingTopic);
        }
      }

      visited.add(t.topicId || t.name);
      ordered.push(t);
    };

    topics.forEach(t => visit(t));
    return ordered;
  }
}

module.exports = PrerequisiteGraphService;
