const mongoose = require('mongoose');
const College = require('../models/College');

const uri = 'mongodb+srv://uyarvupayanam_db_user:UyarvuPayanam1234@cluster0.i0sep1t.mongodb.net/uyarvuPayanam?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const updates = [
      { name: 'Government ITI, Trichy', url: 'https://skilltraining.tn.gov.in/' },
      { name: 'Government ITI, Madurai', url: 'https://skilltraining.tn.gov.in/' },
      { name: 'Government ITI, Coimbatore', url: 'https://skilltraining.tn.gov.in/' },
      { name: 'Government ITI, Salem', url: 'https://skilltraining.tn.gov.in/' },
      { name: 'Government ITI, North Chennai', url: 'https://skilltraining.tn.gov.in/' },
      { name: 'Bharathiar University', url: 'https://b-u.ac.in/' },
      { name: 'Alagappa University', url: 'https://alagappauniversity.ac.in/' },
      { name: 'Madurai Kamaraj University', url: 'https://mkuniversity.ac.in/' },
      { name: 'Ethiraj College for Women', url: 'https://ethirajcollege.edu.in/' },
      { name: 'Centre for Distance Education', url: 'https://www.bdu.ac.in/cde/' },
      { name: 'Mar Gregorios College of Arts and Science', url: 'https://mgcl.ac.in/' }
    ];

    for (const up of updates) {
      const res = await College.updateOne(
        { collegeName: up.name },
        { $set: { website: up.url } }
      );
      console.log(`Updated ${up.name}: ${res.modifiedCount} modified`);
    }

    console.log("Bulk update complete");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
