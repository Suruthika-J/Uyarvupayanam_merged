const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const ClassContent = require('../models/ClassContent');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await ClassContent.find({ targetClass: '8', sectionType: 'Careers' }).lean().sort({ displayOrder: 1 });
    console.log('Class8 Careers count:', items.length);
    items.forEach(it => {
      console.log(`- ${it.title} | img=${!!it.coverImage} | order=${it.displayOrder} | cat=${it.category}`);
    });
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();