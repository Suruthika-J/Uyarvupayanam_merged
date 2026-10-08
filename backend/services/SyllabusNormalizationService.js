/**
 * Syllabus Normalization Service
 * Normalizes different variations of topic names into canonical keys for cross-exam analytics.
 */

const TOPIC_SYNONYMS = {
  // Quantitative / Math
  percentage: ["percentage", "percentages", "percentage problems", "percentage calculation", "percents"],
  time_work: ["time & work", "time and work", "work & time", "pipes and cisterns", "pipes & cisterns"],
  time_distance: ["time & distance", "time and distance", "speed time distance", "trains & boats", "boats and streams"],
  number_system: ["number system", "numbers", "number theory", "real numbers", "integers", "divisibility"],
  algebra: ["algebra", "elementary algebra", "algebraic equations", "polynomials", "quadratics"],
  geometry: ["geometry", "coordinate geometry", "lines and angles", "triangles and circles", "plane geometry"],
  mensuration: ["mensuration", "area and perimeter", "volume and surface area", "3d mensuration"],
  data_interpretation: ["data interpretation", "di", "graphs & charts", "table chart", "pie chart", "bar graph"],
  profit_loss: ["profit & loss", "profit and loss", "discount", "simple and compound interest", "interest"],
  ratio_proportion: ["ratio & proportion", "ratio and proportion", "ratios", "proportions", "mixtures & alligations"],
  probability: ["probability", "permutaion and combination", "permutations and combinations", "p&c"],

  // Computer Science / Engineering
  data_structures: ["data structures", "ds", "arrays", "linked lists", "trees & graphs", "stacks and queues"],
  algorithms: ["algorithms", "algo", "sorting & searching", "dynamic programming", "graph algorithms"],
  dbms: ["dbms", "database management system", "sql", "relational algebra", "normalization", "databases"],
  operating_systems: ["operating systems", "os", "process synchronization", "memory management", "deadlocks"],
  computer_networks: ["computer networks", "cn", "tcp/ip", "osi model", "routing algorithms", "network security"],
  digital_logic: ["digital logic", "digital circuits", "boolean algebra", "combinational circuits", "sequential circuits"],
  computer_architecture: ["computer organization", "coa", "computer architecture", "pipelining", "cache memory"],

  // Management / VARC / DILR
  reading_comprehension: ["reading comprehension", "rc", "passages", "reading comprehension passages"],
  verbal_ability: ["verbal ability", "va", "para jumbles", "sentence correction", "fillers", "grammar"],
  data_interpretation_lr: ["dilr", "data interpretation & logical reasoning", "puzzles and arrangements"],

  // UPSC / General Studies
  polity: ["polity", "indian polity", "constitution", "indian constitution", "governance", "panchayati raj"],
  history: ["history", "ancient history", "medieval history", "modern indian history", "freedom struggle"],
  geography: ["geography", "indian geography", "world geography", "physical geography", "climatology"],
  economy: ["economy", "indian economy", "macroeconomics", "budget and economic survey", "banking and finance"],
  environment: ["environment", "ecology", "biodiversity", "climate change", "environmental policy"],
  science_tech: ["science & technology", "science and tech", "general science", "physics chemistry biology"]
};

function normalizeTopicName(topicName = "") {
  const cleanStr = String(topicName).trim().toLowerCase();
  if (!cleanStr) return "general_topic";

  for (const [key, synonyms] of Object.entries(TOPIC_SYNONYMS)) {
    if (synonyms.some(s => cleanStr.includes(s) || s.includes(cleanStr))) {
      return key;
    }
  }

  // Fallback: slugify cleanStr
  return cleanStr.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

module.exports = {
  normalizeTopicName,
  TOPIC_SYNONYMS
};
