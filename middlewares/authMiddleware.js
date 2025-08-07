// const jwt = require("jsonwebtoken");

// module.exports = function (req, res, next) {
//   const token = req.header("x-auth-token");
//   if (!token) return res.status(401).json({ msg: "No token, access denied" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.admin = decoded.id;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Invalid token" });
//   }
// };



const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is an admin
    if (decoded.isAdmin !== true) {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    // Attach admin ID to request
    req.admin = decoded.id;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
