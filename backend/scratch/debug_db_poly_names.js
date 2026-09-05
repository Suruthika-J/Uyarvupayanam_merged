const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');

async function test() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    const polyColleges = await College.find({
      $or: [
        { stream: /polytechnic/i },
        { streamsOffered: /polytechnic/i }
      ]
    }).lean();

    console.log(`Found ${polyColleges.length} polytechnic colleges in DB.`);
    let withParentheses = 0;
    let withoutParentheses = 0;

    polyColleges.forEach((c, index) => {
      const match = c.collegeName.match(/\((\d+)\)/);
      if (match) {
        withParentheses++;
        if (index < 10) {
          console.log(` - Has code: "${c.collegeName}" => Code is "${match[1]}"`);
        }
      } else {
        withoutParentheses++;
        console.log(` - NO code: "${c.collegeName}"`);
      }
    });

    console.log(`Total with code in parentheses: ${withParentheses}`);
    console.log(`Total without code in parentheses: ${withoutParentheses}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
