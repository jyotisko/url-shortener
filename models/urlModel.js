const mongoose = require('mongoose');
const validator = require('validator');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'This document must have a originalUrl'],
    validate: {
      validator: validator.isURL,
      message: 'Please provide a valid Url'
    }
  },
  shortCode: {
    type: String,
    required: [true, 'This document must have a shortCode']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'This document must belong to a user']
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

urlSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});

const Url = mongoose.model('Url', urlSchema);


module.exports = Url;