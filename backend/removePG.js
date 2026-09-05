const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/Course'); // Adjust path if necessary

async function removePGCourses() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
    console.log('Connected to MongoDB');

    // Remove anything that isn't the 4 exactly specified levels 
    // to strictly enforce the new schema and delete PG/Doctorate.
    const result = await Course.deleteMany({
      level: { $nin: ["10th", "12th", "Diploma", "Undergraduate"] }
    });

    console.log(`Successfully deleted ${result.deletedCount} courses that did not fit the accepted levels.`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting courses:', error);
    process.exit(1);
  }
}

removePGCourses();
