const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const SettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false }
}, { collection: 'settings' });

const Settings = mongoose.model('Settings', SettingsSchema);

async function checkAndDisable() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let settings = await Settings.findOne();
    if (settings) {
      console.log('Current Maintenance Mode:', settings.maintenanceMode);
      if (settings.maintenanceMode) {
        settings.maintenanceMode = false;
        await settings.save();
        console.log('Maintenance Mode has been DISABLED.');
      } else {
        console.log('Maintenance Mode was already DISABLED.');
      }
    } else {
      console.log('No settings document found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndDisable();
