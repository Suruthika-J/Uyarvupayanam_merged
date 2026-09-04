const axios = require('axios');

(async () => {
  try {
    const r = await axios.get('https://tnea.kanna.in/search', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'text/html',
      },
      timeout: 30000,
    });

    console.log('status', r.status);
    console.log('body start', r.data.slice(0, 1800));
  } catch (e) {
    console.error('err', e.message);
    if (e.response) {
      console.log('code', e.response.status);
      console.log('headers', e.response.headers);
      console.log('body start', String(e.response.data).slice(0, 1200));
    }
  }
})();