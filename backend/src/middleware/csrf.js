const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

module.exports = function (req, res, next) {
  // Only protect state-changing requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer;

    if (!origin) {
      return res.status(403).json({ error: "CSRF protection: Missing Origin/Referer header" });
    }

    // Check if the origin matches any of the allowed origins
    const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));

    if (!isAllowed) {
      return res.status(403).json({ error: "CSRF protection: Origin block" });
    }
  }
  next();
};
