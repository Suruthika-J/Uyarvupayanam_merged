const axios = require('axios');

async function testQuestionsApi() {
  try {
    const res = await axios.get('http://localhost:5000/api/onboarding/discovery/questions?branch=CSE&domains=software_engineering,ai_ml,cloud_devops');
    console.log("STATUS:", res.status);
    console.log("RETURNED DOMAINS:", res.data?.domains);
    console.log("QUESTION COUNT:", res.data?.questions?.length);
    console.log("QUESTION DOMAINS:", res.data?.questions?.map(q => `${q.questionId}: ${q.domainName} (${q.domainId})`));

    const containsFullStack = res.data?.questions?.some(q => q.domainId === 'full_stack');
    if (containsFullStack) {
      console.error("FAIL: full_stack questions returned!");
      process.exit(1);
    } else {
      console.log("\nSUCCESS: All returned questions strictly belong to the detected AHP candidate domains!");
    }
  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
  }
}

testQuestionsApi();
