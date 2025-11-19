const router = require('express').Router();
const Role = require('../models/Role');

router.get('/', async (req, res) => {
  const roles = await Role.find({});
  res.json(roles);
});

module.exports = router;
