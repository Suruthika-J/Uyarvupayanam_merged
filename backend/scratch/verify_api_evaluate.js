const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.post('http://localhost:5000/api/onboarding/discovery/evaluate', {
      answers: [
        { questionId: 'q_cse_001', selectedOption: 'A' },
        { questionId: 'q_cse_002', selectedOption: 'A' }
      ],
      ahpPriorityWeights: { software_engineering: 0.5, ai_ml: 0.3, cloud_devops: 0.2 }
    });
    console.log("STATUS:", res.status);
    console.log("RECOMMENDED DOMAIN:", res.data?.evaluation?.recommendedDomain);
    console.log("EVALUATED RANKINGS:", res.data?.evaluation?.rankings);
  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
  }
}

testApi();
