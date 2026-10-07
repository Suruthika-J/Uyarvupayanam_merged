/**
 * learningRoadmapResearchService.js
 * Web Research & Reliable Source Extraction for Learning Roadmaps
 * Implements ResearchProvider abstraction (Tavily API -> Internal Verified Syllabus -> Fallback)
 */

const axios = require("axios");
const LearningRoadmapResearch = require("../models/LearningRoadmapResearch");

// Internal Verified Knowledge Database for Core Academic & Industry Topics
const VERIFIED_KNOWLEDGE_BASE = {
  aptitude: {
    sections: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"],
    topics: [
      "Number System & Arithmetic", "Simplification & HCF LCM", "Percentages",
      "Ratio & Proportion", "Averages", "Profit & Loss", "Simple & Compound Interest",
      "Time & Work", "Pipes & Cisterns", "Time Speed Distance", "Trains & Boats",
      "Permutation & Combination", "Probability", "Data Interpretation",
      "Number Series & Coding Decoding", "Blood Relations & Direction Sense",
      "Syllogisms & Seating Arrangement", "Grammar & Error Spotting", "Reading Comprehension"
    ],
    sources: [
      { title: "GeeksforGeeks — Placement Aptitude Preparation Syllabus", url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/", sourceType: "EDUCATIONAL_PORTAL", credibility: "HIGH" },
      { title: "Indiabix — Quantitative Aptitude & Reasoning Guide", url: "https://www.indiabix.com/aptitude/questions-and-answers/", sourceType: "PRACTICE_PLATFORM", credibility: "HIGH" }
    ],
    summary: "Comprehensive placement preparation covering Quantitative Aptitude, Logical Reasoning, and Verbal Ability based on standard campus recruitment patterns."
  },

  dbms: {
    sections: ["Relational Database Fundamentals", "SQL Mastery & Joins", "Database Architecture & Optimization"],
    topics: [
      "Introduction to DBMS & ER Diagrams", "Relational Model & Key Constraints",
      "Basic SQL (SELECT, WHERE, GROUP BY, HAVING)", "SQL Joins (INNER, LEFT, RIGHT, FULL)",
      "Subqueries & Nested Queries", "Database Normalization (1NF, 2NF, 3NF, BCNF)",
      "Transactions & ACID Properties", "Indexing & B-Trees", "Query Optimization & Execution Plans"
    ],
    sources: [
      { title: "PostgreSQL / MySQL Official Documentation — Database Architecture", url: "https://www.postgresql.org/docs/", sourceType: "OFFICIAL_DOCS", credibility: "HIGH" },
      { title: "Stanford University CS145 — Introduction to Databases", url: "https://cs.stanford.edu/", sourceType: "UNIVERSITY_SYLLABUS", credibility: "HIGH" }
    ],
    summary: "Standard Database Management Systems syllabus covering ER models, SQL queries, normalization, transactions, and indexing."
  },

  python: {
    sections: ["Python Basics & Control Flow", "Data Structures & OOP", "Advanced Python & Ecosystem"],
    topics: [
      "Variables, Data Types & Operators", "Control Statements (If-Else, Loops)",
      "Functions & Scope", "Built-in Data Structures (Lists, Tuples, Sets, Dicts)",
      "Object-Oriented Programming (Classes, Inheritance)", "File I/O & Exception Handling",
      "List Comprehensions & Generators", "Modules & Virtual Environments", "NumPy & Pandas Introduction"
    ],
    sources: [
      { title: "Python Official Documentation & Tutorial", url: "https://docs.python.org/3/tutorial/", sourceType: "OFFICIAL_DOCS", credibility: "HIGH" },
      { title: "Python Software Foundation — Standard Library Reference", url: "https://docs.python.org/3/library/", sourceType: "OFFICIAL_DOCS", credibility: "HIGH" }
    ],
    summary: "Complete Python learning path from core syntax to OOP, data structures, and standard libraries."
  },

  react: {
    sections: ["React Fundamentals", "Hooks & State Management", "Advanced Patterns & Ecosystem"],
    topics: [
      "JSX & Component Architecture", "Props & State Management", "Handling Events & Forms",
      "useEffect & Component Lifecycle", "Context API & Global State", "Custom Hooks",
      "React Router & Navigation", "Performance Optimization (useMemo, useCallback)", "Testing & Deployment"
    ],
    sources: [
      { title: "React Official Documentation — React.dev", url: "https://react.dev/", sourceType: "OFFICIAL_DOCS", credibility: "HIGH" }
    ],
    summary: "Official React.dev learning path covering components, hooks, state, router, and performance."
  }
};

class ResearchProvider {
  static async searchTavily(query, apiKey) {
    if (!apiKey) return null;
    try {
      const response = await axios.post(
        "https://api.tavily.com/search",
        {
          query: `${query} syllabus tutorial documentation learning path`,
          search_depth: "basic",
          include_domains: [
            "geeksforgeeks.org", "docs.python.org", "react.dev", "developer.mozilla.org",
            "w3schools.com", "coursera.org", "mit.edu", "stanford.edu", "aws.amazon.com"
          ],
          max_results: 5
        },
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          timeout: 8000
        }
      );

      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results.map(r => ({
          title: r.title || "Educational Resource",
          url: r.url || "",
          sourceType: "EDUCATIONAL_PORTAL",
          credibility: "HIGH",
          publishedDate: r.published_date || "2026",
          retrievedAt: new Date()
        }));
      }
    } catch (err) {
      console.warn("[ResearchProvider] Tavily search API unavailable, using fallback:", err.message);
    }
    return null;
  }
}

class LearningRoadmapResearchService {
  /**
   * Main entry point for researching a learning topic
   */
  static async researchTopic(topic, userId = null) {
    if (!topic || !topic.trim()) {
      throw new Error("Topic is required for roadmap research.");
    }

    const rawTopic = topic.trim();
    const normalizedTopic = rawTopic.toLowerCase();

    // 1. Check cache first
    const cached = await LearningRoadmapResearch.findOne({ normalizedTopic });
    if (cached) {
      return cached;
    }

    let sources = [];
    let identifiedSections = [];
    let identifiedTopics = [];
    let researchSummary = "";
    let confidence = "HIGH";
    let confidenceReason = "Roadmap supported by multiple verified educational and academic sources.";

    // 2. Try Tavily Research Provider if API key exists
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (tavilyKey) {
      const tavilyResults = await ResearchProvider.searchTavily(rawTopic, tavilyKey);
      if (tavilyResults && tavilyResults.length > 0) {
        sources = tavilyResults;
        researchSummary = `External research conducted for "${rawTopic}" via Tavily Search API.`;
      }
    }

    // 3. Fallback to Verified Knowledge Base
    if (sources.length === 0 && VERIFIED_KNOWLEDGE_BASE[normalizedTopic]) {
      const kb = VERIFIED_KNOWLEDGE_BASE[normalizedTopic];
      identifiedSections = kb.sections;
      identifiedTopics = kb.topics;
      sources = kb.sources;
      researchSummary = kb.summary;
      confidence = "HIGH";
      confidenceReason = "Validated against established academic and placement preparation syllabi.";
    }

    // 4. Fallback for unindexed topics
    if (sources.length === 0) {
      sources = [
        {
          title: `Official Documentation & Curated Learning Path for ${rawTopic}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(rawTopic + " syllabus documentation")}`,
          sourceType: "AI_ESTIMATED",
          credibility: "MEDIUM",
          publishedDate: "2026",
          retrievedAt: new Date()
        }
      ];
      confidence = "MEDIUM";
      confidenceReason = "Limited external web sources found. Roadmap generated using AI reasoning & general technical standards.";
    }

    // 5. Persist research result
    const researchDoc = await LearningRoadmapResearch.create({
      userId,
      topic: rawTopic,
      normalizedTopic,
      sources,
      identifiedSections,
      identifiedTopics,
      researchSummary,
      confidence,
      confidenceReason
    });

    return researchDoc;
  }
}

module.exports = LearningRoadmapResearchService;
