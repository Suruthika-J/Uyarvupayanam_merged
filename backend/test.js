const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const form = new FormData();

form.append('file', fs.createReadStream('./uploads/Scholarship_Details - Sheet1.csv'));

axios.post('http://localhost:5000/api/scholarships/upload', form, {
    headers: form.getHeaders()
})
.then(res => console.log('SUCCESS:', res.data))
.catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
