const mongoose = require('mongoose');
const Category = require('./models/Category');
const Vendor = require('./models/Vendor');
require('dotenv').config();

const analyzeServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const categories = await Category.find({ status: 'active' }).select('title');
    console.log('Available Categories in DB:', categories.map(c => c.title));

    const vendors = await Vendor.find({}).select('name service categories');
    console.log('\nVendors and their assigned services:');
    vendors.forEach(v => {
      console.log(`- Vendor: ${v.name}`);
      console.log(`  Assigned: ${JSON.stringify([...(v.service || []), ...(v.categories || [])])}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

analyzeServices();
