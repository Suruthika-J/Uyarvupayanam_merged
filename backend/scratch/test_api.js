const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('http://localhost:5000/api/class-content/level/8');
    console.log('Class 8:', res.status, res.data);
  } catch (err) {
    console.log('Class 8 Error:', err.response?.status, err.response?.data || err.message);
  }

  try {
    const res = await axios.get('http://localhost:5000/api/class-content/level/10');
    console.log('Class 10:', res.status, res.data);
  } catch (err) {
    console.log('Class 10 Error:', err.response?.status, err.response?.data || err.message);
  }
}

testApi();
