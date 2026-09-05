require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Course = require('./models/Course');

const importData = async () => {
  // Connect to the database
  await connectDB();

  const results = [];
  const filePath = path.join(__dirname, 'uploads', 'course_dataset.csv');

  // Verify the file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ CSV file not found at: ${filePath}`);
    console.error(`Please make sure the file exists relative to this script before running.`);
    process.exit(1);
  }

  console.log(`📂 Reading CSV file from: ${filePath}`);

  // Read and parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`✅ Successfully parsed ${results.length} rows from CSV.`);
      console.log('⏳ Starting import process to MongoDB...');
      
      let insertedCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;

      for (const row of results) {
        try {
          // Map CSV columns to Schema fields
          const courseName = row['Course Name']?.trim();
          let category = row['Category']?.trim();

          // Define Category Mapping to adhere to precise DB schema
          const categoryMapping = {
            'Media': 'Media & Journalism',
            'Hospitality': 'Hotel Management'
          };
          if (categoryMapping[category]) {
            category = categoryMapping[category];
          }

          const level = row['Level']?.trim();
          const duration = row['Duration']?.trim();
          const eligibility = row['Eligibility']?.trim();
          const futureScope = row['Future Scope']?.trim();

          // Validation to ensure no required fields are missing
          if (!courseName || !category || !level || !duration || !eligibility || !futureScope) {
            console.warn(`⚠️ Skipped row due to missing required fields. Row Data:`, JSON.stringify(row));
            errorCount++;
            continue;
          }

          // Prevent duplicate courses from being inserted
          // A combination of courseName and level logic ensures high duplicate accuracy 
          const existingCourse = await Course.findOne({ 
            courseName: courseName,
            level: level 
          });

          if (existingCourse) {
            console.log(`⏭️ Duplicate Course, skipping: ${courseName} - ${level}`);
            duplicateCount++;
          } else {
            // Insert course into MongoDB if it doesn't already exist
            await Course.create({
              courseName,
              category,
              level,
              duration,
              eligibility,
              futureScope
            });
            console.log(`➕ Inserted: ${courseName}`);
            insertedCount++;
          }
        } catch (error) {
          console.error(`❌ Error inserting course "${row['Course Name']}":`, error.message);
          errorCount++;
        }
      }

      console.log('-----------------------------------');
      console.log('📊 IMPORT SUMMARY:');
      console.log(`Total rows processed  : ${results.length}`);
      console.log(`✅ Successfully Inserted : ${insertedCount}`);
      console.log(`⏭️ Skipped (Duplicates)  : ${duplicateCount}`);
      console.log(`❌ Failed (Errors)       : ${errorCount}`);
      console.log('-----------------------------------');
      
      console.log('🔌 Disconnecting from MongoDB...');
      mongoose.disconnect();
      process.exit(0);
    })
    .on('error', (error) => {
      console.error('❌ Error reading CSV file:', error.message);
      process.exit(1);
    });
};

importData();
