const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const ClassContent = require('../models/ClassContent');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await ClassContent.find({ targetClass: '8', title: /Career Awareness After 8th/i }).lean();
    console.log('Found:', items.length);
    items.forEach((it, i) => {
      console.log(JSON.stringify({
        i,
        _id: it._id,
        title: it.title,
        sectionType: it.sectionType,
        category: it.category,
        displayOrder: it.displayOrder,
        status: it.status,
        featured: it.featured,
        hasCoverImage: !!it.coverImage,
        coverImage: it.coverImage,
        slug: it.slug,
        externalLink: it.externalLink
      }, null, 1));
    });
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();