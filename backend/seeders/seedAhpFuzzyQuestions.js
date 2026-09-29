const { seedCseCareerDiscoveryQuestions, CSE_105_QUESTION_BANK } = require("./seedCseCareerDiscoveryQuestions");

const seedAhpFuzzyQuestions = async () => {
  return await seedCseCareerDiscoveryQuestions();
};

module.exports = { seedAhpFuzzyQuestions, ADAPTIVE_DOMAIN_QUESTION_BANK: CSE_105_QUESTION_BANK };
