/**
 * topicClassificationService.js
 * Classifies user-entered learning topics into domain categories
 */

class TopicClassificationService {
  static classifyTopic(userTopic) {
    if (!userTopic || typeof userTopic !== "string") {
      return {
        category: "general_engineering",
        subCategory: "general",
        normalizedTopic: "general",
        confidence: 0.5
      };
    }

    const clean = userTopic.trim();
    const norm = clean.toLowerCase();

    // Heuristic Category Classifier
    if (/aptitude|quantitative|logical|verbal|reasoning|data interpretation|puzzles|maths/i.test(norm)) {
      return {
        category: "placement_preparation",
        subCategory: "aptitude_reasoning",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/dbms|database|sql|mysql|postgresql|mongodb|oracle|database management/i.test(norm)) {
      return {
        category: "computer_science",
        subCategory: "databases",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/dsa|data structure|algorithm|binary tree|graph|dynamic programming|leetcode/i.test(norm)) {
      return {
        category: "computer_science",
        subCategory: "data_structures_algorithms",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/react|node|javascript|typescript|html|css|express|frontend|backend|full stack|web/i.test(norm)) {
      return {
        category: "web_development",
        subCategory: "fullstack_web",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/machine learning|ml|ai|artificial intelligence|deep learning|python|data science|nlp|computer vision/i.test(norm)) {
      return {
        category: "artificial_intelligence",
        subCategory: "machine_learning",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/aws|cloud|docker|kubernetes|azure|devops|terraform|gcp/i.test(norm)) {
      return {
        category: "cloud_computing",
        subCategory: "devops_cloud",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/cyber|security|ethical hacking|network security|cryptography/i.test(norm)) {
      return {
        category: "computer_science",
        subCategory: "cybersecurity",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/system design|microservices|distributed systems|architecture|scalability/i.test(norm)) {
      return {
        category: "computer_science",
        subCategory: "system_design",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/os|operating system|linux|unix|process management|memory management/i.test(norm)) {
      return {
        category: "computer_science",
        subCategory: "operating_systems",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/networks|computer networks|tcp\/ip|http|dns|sockets/i.test(norm)) {
      return {
        category: "computer_science",
        subCategory: "networking",
        normalizedTopic: norm,
        confidence: 0.95
      };
    }

    if (/ielts|toefl|gre|gate|upsc|cat|gmat/i.test(norm)) {
      return {
        category: "competitive_exam",
        subCategory: "standardized_tests",
        normalizedTopic: norm,
        confidence: 0.9
      };
    }

    // Default Fallback
    return {
      category: "general_engineering",
      subCategory: "technical_studies",
      normalizedTopic: norm,
      confidence: 0.7
    };
  }
}

module.exports = TopicClassificationService;
