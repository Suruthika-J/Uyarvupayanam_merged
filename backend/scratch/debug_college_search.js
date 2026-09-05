const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');

async function test() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    // 1. Check if LAKSHMI AMMAL POLYTECHNIC COLLEGE exists in the database
    const exactMatch = await College.findOne({
      collegeName: /LAKSHMI AMMAL POLYTECHNIC COLLEGE/i
    });
    console.log('1. Exact Match in College collection:', exactMatch);

    // Let's do a broader search for "LAKSHMI" or "AMMAL" to see if it exists under a different spelling
    const softMatches = await College.find({
      collegeName: /Lakshmi/i
    }).lean();
    console.log('Broader searches for Lakshmi:');
    softMatches.forEach(c => {
      console.log(` - ID: ${c._id}, Name: "${c.collegeName}", Stream: "${c.stream}", streamsOffered: ${JSON.stringify(c.streamsOffered)}`);
    });

    // Let's list some colleges that have stream "Polytechnic" or streamsOffered "Polytechnic"
    const polyColleges = await College.find({
      $or: [
        { stream: /polytechnic/i },
        { streamsOffered: /polytechnic/i }
      ]
    }).limit(5).lean();
    console.log('Sample Polytechnic colleges in DB:');
    polyColleges.forEach(c => {
      console.log(` - ID: ${c._id}, Name: "${c.collegeName}", Stream: "${c.stream}", streamsOffered: ${JSON.stringify(c.streamsOffered)}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
