const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };
    

    next(); // Proceed to the next middleware or route
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
