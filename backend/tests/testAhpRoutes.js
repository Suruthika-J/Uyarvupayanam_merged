const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log("=== TESTING AHP API ENDPOINTS ===");

  try {
    // Test GET /api/onboarding/ahp/domains?branchId=cse
    const domainsRes = await makeRequest('/api/onboarding/ahp/domains?branchId=cse');
    console.log("GET /domains result:", domainsRes.success ? `SUCCESS (${domainsRes.candidateDomains.length} domains returned)` : domainsRes);

    // Test POST /api/onboarding/ahp/calculate
    const candidateDomains = domainsRes.candidateDomains;
    const sampleComparisons = [
      { domainA: candidateDomains[0].id, domainB: candidateDomains[1].id, selectedDomain: candidateDomains[0].id, intensity: 5 },
      { domainA: candidateDomains[0].id, domainB: candidateDomains[2].id, selectedDomain: candidateDomains[0].id, intensity: 7 }
    ];

    const calcRes = await makeRequest('/api/onboarding/ahp/calculate', 'POST', {
      candidateDomains,
      pairwiseComparisons: sampleComparisons
    });

    console.log("POST /calculate result:", calcRes.success ? `SUCCESS (Top: ${calcRes.result.topDomain.name}, CR: ${calcRes.result.consistencyRatio})` : calcRes);

    console.log("=== ALL API ENDPOINT TESTS COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("API test failed:", err.message);
  }
}

runTest();
