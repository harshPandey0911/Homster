const mongoose = require('mongoose');
const FooterLink = require('./models/FooterLink');
require('dotenv').config();

const checkLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const links = await FooterLink.find({});
    console.log('Found Links:', JSON.stringify(links, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkLinks();
