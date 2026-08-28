const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  phoneNumber: String,
  skills: [String],
  experienceYears: Number,
  location: String,
  education: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserProfile", UserProfileSchema);
