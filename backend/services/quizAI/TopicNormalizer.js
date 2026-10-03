/**
 * backend/services/quizAI/TopicNormalizer.js
 *
 * Normalizes user-entered topic and subtopic variations to standard domain keys and canonical names.
 * Example: "python", "Python programming", "python basics" -> "Python"
 * Example: "oops", "OOP", "Object Oriented Programming" -> "Object Oriented Programming"
 */

const TOPIC_MAPPINGS = [
  {
    regex: /\b(dbms|database|sql|queries|normalization|tables|indexing|relational|rdbms|postgres|mysql|oracle|sqlite)\b/i,
    normalizedTopic: "DBMS",
    domainId: "dbms",
    domainName: "Database Management Systems",
    branch: "CSE"
  },
  {
    regex: /\b(dsa|data structure|algorithms|trees|graphs|arrays|sorting|recursion|linked list|heap|stack|queue)\b/i,
    normalizedTopic: "Data Structures & Algorithms",
    domainId: "data_structures",
    domainName: "Data Structures & Algorithms",
    branch: "CSE"
  },
  {
    regex: /\b(python|python3|py|pandas|numpy|scripting)\b/i,
    normalizedTopic: "Python",
    domainId: "python",
    domainName: "Python Programming",
    branch: "CSE"
  },
  {
    regex: /\b(oops|oop|object oriented|classes|inheritance|polymorphism|encapsulation|abstraction|java|c\+\+)\b/i,
    normalizedTopic: "Object Oriented Programming",
    domainId: "oop",
    domainName: "Object Oriented Programming",
    branch: "CSE"
  },
  {
    regex: /\b(os|operating system|operating systems|linux|unix|process|threads|memory management|deadlock)\b/i,
    normalizedTopic: "Operating Systems",
    domainId: "os",
    domainName: "Operating Systems & Kernel Architecture",
    branch: "CSE"
  },
  {
    regex: /\b(cn|network|networks|computer network|tcp|ip|osi|http|sockets|dns)\b/i,
    normalizedTopic: "Computer Networks",
    domainId: "computer_networks",
    domainName: "Computer Networks & Protocol Stack",
    branch: "CSE"
  },
  {
    regex: /\b(cyber|security|ethical hacking|firewall|encryption|cia|xss|sql injection|penetration|cryptography)\b/i,
    normalizedTopic: "Cyber Security",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    branch: "CSE"
  },
  {
    regex: /\b(ai|ml|machine learning|deep learning|neural|tensorflow|pytorch|scikit|nlp)\b/i,
    normalizedTopic: "AI & Machine Learning",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    branch: "CSE"
  },
  {
    regex: /\b(web|web dev|frontend|backend|react|node|express|javascript|js|html|css|full stack)\b/i,
    normalizedTopic: "Web Development",
    domainId: "web_dev",
    domainName: "Full-Stack Web Development",
    branch: "CSE"
  },
  {
    regex: /\b(cloud|devops|aws|docker|kubernetes|ci\/cd|azure|gcp)\b/i,
    normalizedTopic: "Cloud & DevOps",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    branch: "CSE"
  }
]

function normalizeTopic(rawTopic = "", rawSubtopic = "") {
  const combined = `${rawTopic} ${rawSubtopic}`.trim()
  if (!combined) {
    return {
      normalizedTopic: "Computer Science Core",
      normalizedSubtopic: "General",
      domainId: "general_cs",
      domainName: "Computer Science Core",
      branch: "CSE"
    }
  }

  for (const mapping of TOPIC_MAPPINGS) {
    if (mapping.regex.test(combined)) {
      return {
        normalizedTopic: mapping.normalizedTopic,
        normalizedSubtopic: rawSubtopic ? rawSubtopic.trim() : mapping.normalizedTopic,
        domainId: mapping.domainId,
        domainName: mapping.domainName,
        branch: mapping.branch
      }
    }
  }

  const cleanTopic = rawTopic.trim() || "Computer Science Core"
  const cleanSubtopic = rawSubtopic.trim() || "General"

  return {
    normalizedTopic: cleanTopic,
    normalizedSubtopic: cleanSubtopic,
    domainId: cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    domainName: cleanTopic,
    branch: "CSE"
  }
}

module.exports = {
  normalizeTopic,
  TOPIC_MAPPINGS
}
