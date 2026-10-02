const mongoose = require('mongoose');
const AhpFuzzyQuestion = require('../models/AhpFuzzyQuestion');

async function testDifficultySelection() {
  await mongoose.connect('mongodb://localhost:27017/uyarvu-payanam');
  
  const top3Domains = [
    { domainId: "software_engineering", domainName: "Software Engineering & Architecture" },
    { domainId: "ai_ml", domainName: "Artificial Intelligence & Machine Learning" },
    { domainId: "cloud_devops", domainName: "Cloud Computing & DevOps" }
  ];

  const QUESTIONS_PER_DOMAIN = 5;
  const selectedQuestions = [];

  for (let domainIdx = 0; domainIdx < top3Domains.length; domainIdx++) {
    const dObj = top3Domains[domainIdx];
    const canonicalId = dObj.domainId;

    let domainQuestions = await AhpFuzzyQuestion.find({
      branch: { $in: ["CSE", "cse"] },
      source: "master-question-bank-pdf",
      $or: [
        { domainId: canonicalId },
        { domain: canonicalId }
      ],
      active: true
    });

    const easyQs = domainQuestions.filter(q => (q.difficulty || "").toLowerCase() === "easy");
    const medQs = domainQuestions.filter(q => (q.difficulty || "").toLowerCase() === "medium");
    const hardQs = domainQuestions.filter(q => (q.difficulty || "").toLowerCase() === "hard");

    let easyTarget = 2;
    let medTarget = 2;
    let hardTarget = 1;

    if (domainIdx === 1) {
      easyTarget = 2;
      medTarget = 1;
      hardTarget = 2;
    } else if (domainIdx === 2) {
      easyTarget = 1;
      medTarget = 2;
      hardTarget = 2;
    }

    const pickedEasy = easyQs.slice(0, easyTarget);
    const pickedMed = medQs.slice(0, medTarget);
    const pickedHard = hardQs.slice(0, hardTarget);

    let chosenForDomain = [...pickedEasy, ...pickedMed, ...pickedHard];

    if (chosenForDomain.length < QUESTIONS_PER_DOMAIN) {
      const chosenIds = new Set(chosenForDomain.map(q => q._id.toString()));
      const remaining = domainQuestions.filter(q => !chosenIds.has(q._id.toString()));
      chosenForDomain = [...chosenForDomain, ...remaining.slice(0, QUESTIONS_PER_DOMAIN - chosenForDomain.length)];
    }

    selectedQuestions.push(...chosenForDomain);
  }

  const easyTotal = selectedQuestions.filter(q => q.difficulty === 'easy').length;
  const medTotal = selectedQuestions.filter(q => q.difficulty === 'medium').length;
  const hardTotal = selectedQuestions.filter(q => q.difficulty === 'hard').length;

  console.log("TOTAL QUESTIONS:", selectedQuestions.length);
  console.log("EASY:", easyTotal);
  console.log("MEDIUM:", medTotal);
  console.log("HARD:", hardTotal);
  console.log("DIFFICULTIES OF PICKED QUESTIONS:", selectedQuestions.map(q => `${q.domainId}: ${q.difficulty}`));

  await mongoose.disconnect();
}

testDifficultySelection();
