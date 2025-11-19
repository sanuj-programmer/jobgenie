const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  title: String,
  requiredSkills: [String],
  description: String,
  sampleRoadmap: [String]
});

module.exports = mongoose.model("Role", RoleSchema);
