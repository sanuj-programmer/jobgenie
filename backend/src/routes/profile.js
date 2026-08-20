const router = require('express').Router();
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const profileData = {
    ...req.body,
    user: req.user.id
  };
  const user = new UserProfile(profileData);
  await user.save();
  res.json(user);
});

module.exports = router;
