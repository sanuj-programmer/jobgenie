const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: String,
  age: Number,
  skills: [String],
  interests: [String],
  experienceYears: Number,
  location: String,
  education: String
});

module.exports = mongoose.model("UserProfile", UserProfileSchema);
