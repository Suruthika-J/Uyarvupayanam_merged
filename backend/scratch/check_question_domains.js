const mongoose = require("mongoose");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

async function checkDomains() {
  await mongoose.connect("mongodb://localhost:27017/uyarvu-payanam");
  const distinctDomainIds = await AhpFuzzyQuestion.distinct("domainId");
  const distinctDomains = await AhpFuzzyQuestion.distinct("domain");
  const distinctDomainNames = await AhpFuzzyQuestion.distinct("domainName");
  const count = await AhpFuzzyQuestion.countDocuments({});

  console.log("Total Questions in DB:", count);
  console.log("Distinct domainId:", distinctDomainIds);
  console.log("Distinct domain:", distinctDomains);
  console.log("Distinct domainName:", distinctDomainNames);
  process.exit(0);
}

checkDomains();
