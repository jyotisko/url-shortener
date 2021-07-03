const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A donation must belong to a user!']
  },
  amount: {
    type: Number,
    required: [true, 'A donation must have a specific amount!']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
