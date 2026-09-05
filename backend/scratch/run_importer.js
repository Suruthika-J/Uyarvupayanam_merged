const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { importDiplomaCSV } = require('../utils/diplomaImporter');

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to DB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected. Starting import...');

    const result = await importDiplomaCSV(true);
    console.log('Import finished. Result:', JSON.stringify(result, null, 2));

  } catch (err) {
    console.error('Error running import:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  }
}

main();
