const router = require('express').Router();
const UserProfile = require('../models/UserProfile');

router.post('/', async (req, res) => {
  const user = new UserProfile(req.body);
  await user.save();
  res.json(user);
});

module.exports = router;
