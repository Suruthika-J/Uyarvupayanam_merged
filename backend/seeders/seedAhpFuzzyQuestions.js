const { seedPdfMasterQuestionBank, PDF_MASTER_QUESTION_BANK } = require("./seedPdfMasterQuestionBank");

const seedAhpFuzzyQuestions = async () => {
  return await seedPdfMasterQuestionBank();
};

module.exports = { seedAhpFuzzyQuestions, ADAPTIVE_DOMAIN_QUESTION_BANK: PDF_MASTER_QUESTION_BANK };
