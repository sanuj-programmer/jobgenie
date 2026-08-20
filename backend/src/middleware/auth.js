const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "jobgenie_secret_fallback_key";

module.exports = function (req, res, next) {
  // Read token from cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Access denied: Invalid session token" });
  }
};
