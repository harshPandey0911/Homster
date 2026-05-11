const mongoose = require('mongoose');

const footerLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    enum: ['COMPANY', 'QUICK LINKS', 'USER BOTTOM'],
    default: 'QUICK LINKS'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FooterLink', footerLinkSchema);
