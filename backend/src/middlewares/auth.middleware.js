const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Unauthorized Access",
    });
  }
  const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
  if (isTokenBlacklisted) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Token is blacklisted",
    });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Invalid Token",
    });
  }
}
module.exports = { authUser };
