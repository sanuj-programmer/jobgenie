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
  headline: { type: String, default: "" },
  bio: { type: String, default: "" },
  experiences: [
    {
      company: { type: String, required: true },
      role: { type: String, required: true },
      startDate: { type: String, default: "" },
      endDate: { type: String, default: "" },
      isCurrent: { type: Boolean, default: false },
      description: { type: String, default: "" }
    }
  ],
  educationHistory: [
    {
      institution: { type: String, required: true },
      degree: { type: String, default: "" },
      fieldOfStudy: { type: String, default: "" },
      startYear: { type: String, default: "" },
      endYear: { type: String, default: "" }
    }
  ],
  resume: {
    publicId: { type: String, default: "" },
    url: { type: String, default: "" },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    uploadedAt: { type: Date }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserProfile", UserProfileSchema);
