const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const College = require('../models/College');

const specificColleges = [
  {
    collegeName: "Asian College of Journalism - [ACJ]",
    stream: "Media & Journalism",
    category: "Media & Journalism",
    type: "Private",
    district: "Chennai",
    location: "Taramani, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "460200",
    placementPercentage: "95",
    rank: "1",
    accreditation: "Best in Academics, Collegedunia Top Ranked",
    website: "https://www.asianmedia.org.in/"
  },
  {
    collegeName: "Rathinam College of Arts and Science - [RCAS]",
    stream: "Management",
    category: "Management",
    type: "Private",
    district: "Coimbatore",
    location: "Eachanari, Coimbatore",
    state: "Tamil Nadu",
    feesPerYear: "65000",
    placementPercentage: "85",
    rank: "3",
    accreditation: "NAAC A++, Best in Arts and Science",
    website: "https://rathinamcollege.edu.in/"
  }
];

async function insertColleges() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam');
    console.log('Connected to MongoDB');

    for (const college of specificColleges) {
      await College.findOneAndUpdate(
        { collegeName: college.collegeName },
        college,
        { upsert: true, new: true }
      );
    }

    console.log('Successfully inserted specific colleges requested by user');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting colleges:', err);
    process.exit(1);
  }
}

insertColleges();
