require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const { getSuggestedMappings } = require('../controllers/collegeCourseController');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const college = await College.findOne({ collegeName: 'Agricultural College and Research Institute, Coimbatore' }).lean();
  console.log('collegeId:', college._id.toString());

  const req = { params: { collegeId: college._id.toString() } };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; console.log(JSON.stringify(payload, null, 2)); }
  };

  await getSuggestedMappings(req, res);
  console.log('status:', res.statusCode);
  console.log('count:', res.body?.data?.length);
  console.log('checked:', res.body?.data?.filter((c) => c.checked).map((c) => c.courseName));
  await mongoose.disconnect();
})();
