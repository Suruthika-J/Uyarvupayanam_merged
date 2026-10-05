/**
 * backend/services/quizAI/TopicNormalizer.js
 *
 * Centralized Canonical Topic Registry for Multiplayer Quiz Engine.
 * Enforces strict topic mapping:
 * - C++ / CPP -> topicId: "cpp", topicLabel: "C++"
 * - SQL -> topicId: "sql", topicLabel: "SQL"
 * - DBMS -> topicId: "dbms", topicLabel: "DBMS"
 * - Java -> topicId: "java", topicLabel: "Java"
 * - Python -> topicId: "python", topicLabel: "Python"
 * - OOPS -> topicId: "oops", topicLabel: "OOPS"
 * - OS -> topicId: "os", topicLabel: "OS"
 * - Computer Networks -> topicId: "cn", topicLabel: "Computer Networks"
 * - Data Structures -> topicId: "dsa", topicLabel: "Data Structures & Algorithms"
 */

const CANONICAL_TOPICS = {
  CPP: {
    topicId: "cpp",
    topicLabel: "C++",
    domainId: "cpp",
    domainName: "C++ Programming",
    branch: "CSE",
    regex: /^\s*(c\+\+|cpp|cplusplus|c plus plus)\s*$/i
  },
  "C++": {
    topicId: "cpp",
    topicLabel: "C++",
    domainId: "cpp",
    domainName: "C++ Programming",
    branch: "CSE",
    regex: /^\s*(c\+\+|cpp|cplusplus|c plus plus)\s*$/i
  },
  CPLUSPLUS: {
    topicId: "cpp",
    topicLabel: "C++",
    domainId: "cpp",
    domainName: "C++ Programming",
    branch: "CSE",
    regex: /^\s*(c\+\+|cpp|cplusplus|c plus plus)\s*$/i
  },
  SQL: {
    topicId: "sql",
    topicLabel: "SQL",
    domainId: "sql",
    domainName: "SQL & Relational Queries",
    branch: "CSE",
    regex: /^\s*(sql|sql queries|relational queries|sql programming|sqlite|mysql|postgres|postgresql)\s*$/i
  },
  DBMS: {
    topicId: "dbms",
    topicLabel: "DBMS",
    domainId: "dbms",
    domainName: "Database Management Systems",
    branch: "CSE",
    regex: /^\s*(dbms|database|rdbms|database management|database architecture)\s*$/i
  },
  JAVA: {
    topicId: "java",
    topicLabel: "Java",
    domainId: "java",
    domainName: "Java Programming",
    branch: "CSE",
    regex: /^\s*(java|jdk|jvm|jre|core java|java programming)\s*$/i
  },
  PYTHON: {
    topicId: "python",
    topicLabel: "Python",
    domainId: "python",
    domainName: "Python Programming",
    branch: "CSE",
    regex: /^\s*(python|python3|py|scripting|pandas|numpy)\s*$/i
  },
  OOPS: {
    topicId: "oops",
    topicLabel: "OOPS",
    domainId: "oops",
    domainName: "Object Oriented Programming",
    branch: "CSE",
    regex: /^\s*(oops|oop|object oriented|classes|inheritance|polymorphism|encapsulation)\s*$/i
  },
  OS: {
    topicId: "os",
    topicLabel: "OS",
    domainId: "os",
    domainName: "Operating Systems",
    branch: "CSE",
    regex: /^\s*(os|operating system|operating systems|linux|kernel)\s*$/i
  },
  CN: {
    topicId: "cn",
    topicLabel: "Computer Networks",
    domainId: "cn",
    domainName: "Computer Networks & Protocol Stack",
    branch: "CSE",
    regex: /^\s*(cn|computer networks|networking|tcp\/ip|osi)\s*$/i
  },
  "COMPUTER NETWORKS": {
    topicId: "cn",
    topicLabel: "Computer Networks",
    domainId: "cn",
    domainName: "Computer Networks & Protocol Stack",
    branch: "CSE",
    regex: /^\s*(cn|computer networks|networking|tcp\/ip|osi)\s*$/i
  },
  DSA: {
    topicId: "dsa",
    topicLabel: "Data Structures & Algorithms",
    domainId: "dsa",
    domainName: "Data Structures & Algorithms",
    branch: "CSE",
    regex: /^\s*(dsa|data structures|algorithms|data structures & algorithms)\s*$/i
  },
  "DATA STRUCTURES": {
    topicId: "dsa",
    topicLabel: "Data Structures & Algorithms",
    domainId: "dsa",
    domainName: "Data Structures & Algorithms",
    branch: "CSE",
    regex: /^\s*(dsa|data structures|algorithms|data structures & algorithms)\s*$/i
  },
  "DATA STRUCTURES & ALGORITHMS": {
    topicId: "dsa",
    topicLabel: "Data Structures & Algorithms",
    domainId: "dsa",
    domainName: "Data Structures & Algorithms",
    branch: "CSE",
    regex: /^\s*(dsa|data structures|algorithms|data structures & algorithms)\s*$/i
  }
};

const TOPIC_MAPPINGS = [
  CANONICAL_TOPICS.CPP,
  CANONICAL_TOPICS.SQL,
  CANONICAL_TOPICS.DBMS,
  CANONICAL_TOPICS.JAVA,
  CANONICAL_TOPICS.PYTHON,
  CANONICAL_TOPICS.OOPS,
  CANONICAL_TOPICS.OS,
  CANONICAL_TOPICS.CN,
  CANONICAL_TOPICS.DSA
];

function normalizeTopic(rawTopic = "", rawSubtopic = "") {
  const cleanTopic = String(rawTopic || "").trim();
  const cleanSubtopic = String(rawSubtopic || "").trim();
  const upperKey = cleanTopic.toUpperCase();

  // 1. Direct match check against canonical dictionary keys
  if (CANONICAL_TOPICS[upperKey]) {
    const item = CANONICAL_TOPICS[upperKey];
    console.log(`[PEER-QUIZ]\nInvite topic: ${cleanTopic}\nNormalized topic: ${item.topicId}\nCanonical Label: ${item.topicLabel}`);
    return {
      topicId: item.topicId,
      topicLabel: item.topicLabel,
      normalizedTopic: item.topicLabel,
      normalizedSubtopic: cleanSubtopic || item.topicLabel,
      domainId: item.domainId,
      domainName: item.domainName,
      branch: item.branch
    };
  }

  // 2. Regex matching against registered mappings
  const combined = `${cleanTopic} ${cleanSubtopic}`.trim();
  if (combined) {
    for (const mapping of TOPIC_MAPPINGS) {
      if (mapping.regex && mapping.regex.test(combined)) {
        console.log(`[PEER-QUIZ]\nInvite topic: ${cleanTopic}\nNormalized topic via regex: ${mapping.topicId}\nCanonical Label: ${mapping.topicLabel}`);
        return {
          topicId: mapping.topicId || mapping.domainId,
          topicLabel: mapping.topicLabel || mapping.domainName,
          normalizedTopic: mapping.topicLabel || mapping.domainName,
          normalizedSubtopic: cleanSubtopic || (mapping.topicLabel || mapping.domainName),
          domainId: mapping.domainId || mapping.topicId,
          domainName: mapping.domainName || mapping.topicLabel,
          branch: mapping.branch || "CSE"
        };
      }
    }
  }

  // 3. Fallback to clean user input (NEVER convert to DBMS)
  const finalTopicLabel = cleanTopic || "Computer Science Core";
  const finalTopicId = finalTopicLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  console.log(`[PEER-QUIZ]\nInvite topic: ${cleanTopic}\nCustom topic normalized: ${finalTopicId}\nCanonical Label: ${finalTopicLabel}`);

  return {
    topicId: finalTopicId,
    topicLabel: finalTopicLabel,
    normalizedTopic: finalTopicLabel,
    normalizedSubtopic: cleanSubtopic || finalTopicLabel,
    domainId: finalTopicId,
    domainName: finalTopicLabel,
    branch: "CSE"
  };
}

module.exports = {
  normalizeTopic,
  TOPIC_MAPPINGS,
  CANONICAL_TOPICS
};
