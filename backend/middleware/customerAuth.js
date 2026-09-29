const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireCustomer(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "user") {
      return res.status(401).json({
        success: false,
        message: "Customer account is required before placing an order.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired customer token.",
    });
  }
}

module.exports = requireCustomer;
