// models/User.js
const mongoose = require('mongoose');

const useryOTPverification = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otpCode: {
    type: String,
    required: true,
  },
  otpExpiration: {
    type: Date,
    required: true,
  },
});


module.exports = mongoose.model('UserOTPVerify',useryOTPverification)