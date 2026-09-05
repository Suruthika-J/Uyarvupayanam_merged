const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// Load environment variables if they exist
require('dotenv').config();

// Ensure this matches the actual schema file
const Course = require('./models/Course');

async function importCourses() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('Connected to MongoDB');

    let insertedCount = 0;
    const filepath = path.join(__dirname, 'uploads', 'master_460.csv');
    const rows = [];

    // Read and parse CSV
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          for (const row of rows) {
            const courseName = row['Course Name']?.trim();
            const category = row['Category']?.trim();
            const level = row['Level']?.trim();
            const duration = row['Duration']?.trim();
            const eligibility = row['Eligibility']?.trim();
            const futureScope = row['Future Scope']?.trim();

            if (!courseName) continue;

            const existingCourse = await Course.findOne({ courseName });

            if (!existingCourse) {
              const newCourse = new Course({
                courseName,
                category,
                level,
                duration,
                eligibility,
                futureScope
              });
              await newCourse.save();
              insertedCount++;
            }
          }
          console.log(`460 Courses Imported Successfully`);
          process.exit(0);
        } catch (err) {
          console.error('Error importing courses:', err);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

importCourses();
