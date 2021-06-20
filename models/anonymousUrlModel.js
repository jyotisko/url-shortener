const mongoose = require('mongoose');

const anonymousUrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'This document must have a originalUrl']
  },
  shortCode: {
    type: String,
    required: [true, 'This document must have a shortCode']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AnonymousUrl = mongoose.model('AnonymousUrl', anonymousUrlSchema);

module.exports = AnonymousUrl;