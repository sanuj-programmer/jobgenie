const router = require('express').Router();
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateProfile } = require('../utils/validateProfile');
const { uploadAvatarMiddleware, uploadResumeMiddleware } = require('../middleware/upload');
const { uploadAvatar, uploadResume, deleteAsset } = require('../services/storageService');

// GET /api/profile/me - Get authenticated user's profile and user details
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the latest UserProfile for this user
    let profile = await UserProfile.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      },
      profile: profile || {
        name: user.name,
        email: user.email,
        headline: '',
        bio: '',
        phoneNumber: '',
        skills: [],
        experienceYears: 0,
        location: '',
        education: '',
        experiences: [],
        educationHistory: [],
        resume: null
      }
    });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile/me - Update authenticated user's professional profile
router.put('/me', auth, async (req, res) => {
  try {
    const {
      name,
      headline,
      bio,
      phoneNumber,
      location,
      skills,
      experienceYears,
      education,
      experiences,
      educationHistory
    } = req.body;

    // Optional name update for User document
    if (name && typeof name === 'string' && name.trim()) {
      await User.findByIdAndUpdate(req.user.id, { name: name.trim() });
    }

    let profile = await UserProfile.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    const updatedData = {
      name: name || (profile && profile.name) || '',
      headline: headline !== undefined ? headline : (profile?.headline || ''),
      bio: bio !== undefined ? bio : (profile?.bio || ''),
      phoneNumber: phoneNumber !== undefined ? phoneNumber : (profile?.phoneNumber || ''),
      location: location !== undefined ? location : (profile?.location || ''),
      skills: Array.isArray(skills) ? skills : (profile?.skills || []),
      experienceYears: experienceYears !== undefined ? Number(experienceYears) || 0 : (profile?.experienceYears || 0),
      education: education !== undefined ? education : (profile?.education || ''),
      experiences: Array.isArray(experiences) ? experiences : (profile?.experiences || []),
      educationHistory: Array.isArray(educationHistory) ? educationHistory : (profile?.educationHistory || []),
      user: req.user.id
    };

    if (profile) {
      profile = await UserProfile.findByIdAndUpdate(profile._id, updatedData, { new: true });
    } else {
      profile = new UserProfile(updatedData);
      await profile.save();
    }

    res.json({
      success: true,
      profile
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/avatar - Upload profile avatar image to Cloudinary
router.post('/avatar', auth, (req, res) => {
  uploadAvatarMiddleware.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    try {
      const avatarUrl = await uploadAvatar(req.file.buffer, req.user.id);

      // Update User model
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: avatarUrl },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        avatar: avatarUrl,
        user
      });
    } catch (uploadErr) {
      console.error('Avatar upload failed:', uploadErr.message);
      res.status(500).json({ error: 'Failed to upload image to cloud storage' });
    }
  });
});

// POST /api/profile/resume - Upload resume document to Cloudinary
router.post('/resume', auth, (req, res) => {
  uploadResumeMiddleware.single('resume')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    try {
      const uploadResult = await uploadResume(req.file.buffer, req.file.originalname, req.user.id);

      const resumeMeta = {
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        uploadedAt: new Date()
      };

      let profile = await UserProfile.findOne({ user: req.user.id }).sort({ createdAt: -1 });

      if (profile) {
        // If an old resume existed, delete it in background
        if (profile.resume && profile.resume.publicId) {
          deleteAsset(profile.resume.publicId, 'raw');
        }
        profile.resume = resumeMeta;
        await profile.save();
      } else {
        const user = await User.findById(req.user.id);
        profile = new UserProfile({
          user: req.user.id,
          name: user ? user.name : '',
          email: user ? user.email : '',
          resume: resumeMeta
        });
        await profile.save();
      }

      res.json({
        success: true,
        resume: resumeMeta
      });
    } catch (uploadErr) {
      console.error('Resume upload failed:', uploadErr.message);
      res.status(500).json({ error: 'Failed to upload resume to cloud storage' });
    }
  });
});

// DELETE /api/profile/resume - Delete user's resume
router.delete('/resume', auth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!profile || !profile.resume || !profile.resume.publicId) {
      return res.status(404).json({ error: 'No resume found to delete' });
    }

    await deleteAsset(profile.resume.publicId, 'raw');
    profile.resume = null;
    await profile.save();

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Delete resume error:', err.message);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Legacy POST / for ChatProfileBuilder compatibility
router.post('/', auth, async (req, res) => {
  const validation = validateProfile(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors[0], errors: validation.errors });
  }

  const profileData = {
    ...validation.sanitized,
    user: req.user.id
  };
  const user = new UserProfile(profileData);
  await user.save();
  res.json(user);
});

module.exports = router;
