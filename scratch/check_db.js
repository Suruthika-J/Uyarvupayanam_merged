const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from backend
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const Course = require('./backend/models/Course');
const College = require('./backend/models/College');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = await Course.distinct('category');
    console.log('Course categories:', categories);

    const streams = await College.distinct('stream');
    console.log('College streams:', streams);

    const coursesCount = await Course.countDocuments();
    console.log('Total courses:', coursesCount);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
