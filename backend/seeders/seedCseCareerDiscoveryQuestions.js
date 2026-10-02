const { seedPdfMasterQuestionBank } = require("./seedPdfMasterQuestionBank");

const seedCseCareerDiscoveryQuestions = async () => {
  return await seedPdfMasterQuestionBank();
};

module.exports = { seedCseCareerDiscoveryQuestions };
