const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'A user must have a email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a password confirm'],
    minLength: 8,
    validate: {
      validator(value) {
        return this.password === value
      },
      message: 'The passwords does not match!'
    }
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword, hashedPassword) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
