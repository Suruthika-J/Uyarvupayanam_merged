/**
 * backend/services/quizAI/TopicNormalizer.js
 *
 * Normalizes user-entered topic and subtopic variations to standard domain keys and canonical names.
 * Ensures strict canonical mapping:
 * - SQL -> topicId: "sql", topicLabel: "SQL"
 * - DBMS -> topicId: "dbms", topicLabel: "DBMS"
 * - Java -> topicId: "java", topicLabel: "Java"
 * - Python -> topicId: "python", topicLabel: "Python"
 * - OOPS -> topicId: "oops", topicLabel: "OOPS"
 * - OS -> topicId: "os", topicLabel: "OS"
 */

const CANONICAL_TOPICS = {
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
    regex: /^\s*(oops|oop|object oriented|classes|inheritance|polymorphism|encapsulation|c\+\+)\s*$/i
  },
  OS: {
    topicId: "os",
    topicLabel: "OS",
    domainId: "os",
    domainName: "Operating Systems",
    branch: "CSE",
    regex: /^\s*(os|operating system|operating systems|linux|kernel)\s*$/i
  }
};

const TOPIC_MAPPINGS = [
  CANONICAL_TOPICS.SQL,
  CANONICAL_TOPICS.DBMS,
  CANONICAL_TOPICS.JAVA,
  CANONICAL_TOPICS.PYTHON,
  CANONICAL_TOPICS.OOPS,
  CANONICAL_TOPICS.OS,
  {
    topicId: "data_structures",
    topicLabel: "Data Structures & Algorithms",
    regex: /\b(dsa|data structure|algorithms|trees|graphs|arrays|sorting|recursion|linked list|heap|stack|queue)\b/i,
    domainId: "data_structures",
    domainName: "Data Structures & Algorithms",
    branch: "CSE"
  },
  {
    topicId: "computer_networks",
    topicLabel: "Computer Networks",
    regex: /\b(cn|network|networks|computer network|tcp|ip|osi|http|sockets|dns)\b/i,
    domainId: "computer_networks",
    domainName: "Computer Networks & Protocol Stack",
    branch: "CSE"
  },
  {
    topicId: "cyber_security",
    topicLabel: "Cyber Security",
    regex: /\b(cyber|security|ethical hacking|firewall|encryption|cia|xss|sql injection|penetration|cryptography)\b/i,
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    branch: "CSE"
  },
  {
    topicId: "ai_ml",
    topicLabel: "AI & Machine Learning",
    regex: /\b(ai|ml|machine learning|deep learning|neural|tensorflow|pytorch|scikit|nlp)\b/i,
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    branch: "CSE"
  },
  {
    topicId: "web_dev",
    topicLabel: "Web Development",
    regex: /\b(web|web dev|frontend|backend|react|node|express|javascript|js|html|css|full stack)\b/i,
    domainId: "web_dev",
    domainName: "Full-Stack Web Development",
    branch: "CSE"
  },
  {
    topicId: "cloud_devops",
    topicLabel: "Cloud & DevOps",
    regex: /\b(cloud|devops|aws|docker|kubernetes|ci\/cd|azure|gcp)\b/i,
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    branch: "CSE"
  }
];

function normalizeTopic(rawTopic = "", rawSubtopic = "") {
  const cleanTopic = String(rawTopic || "").trim();
  const cleanSubtopic = String(rawSubtopic || "").trim();
  const upperKey = cleanTopic.toUpperCase();

  // 1. Direct match check against canonical dictionary keys
  if (CANONICAL_TOPICS[upperKey]) {
    const item = CANONICAL_TOPICS[upperKey];
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
        return {
          topicId: mapping.topicId || mapping.domainId,
          topicLabel: mapping.topicLabel || mapping.domainName,
          normalizedTopic: mapping.topicLabel || mapping.domainName,
          normalizedSubtopic: cleanSubtopic || (mapping.topicLabel || mapping.domainName),
          domainId: mapping.domainId,
          domainName: mapping.domainName,
          branch: mapping.branch
        };
      }
    }
  }

  // 3. Fallback to clean user input (NEVER convert to DBMS)
  const finalTopicLabel = cleanTopic || "Computer Science Core";
  const finalTopicId = finalTopicLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");

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
