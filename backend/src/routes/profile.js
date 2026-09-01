const router = require('express').Router();
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');
const { validateProfile } = require('../utils/validateProfile');

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
