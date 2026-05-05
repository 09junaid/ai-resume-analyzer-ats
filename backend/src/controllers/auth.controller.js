const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

/**
 * @name registerUserController
 * @description register a new user, expects username,email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "username,email and password are required",
    });
  }
  const isUserAlreadyExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserAlreadyExist) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Account already exists with this username or email address",
    });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    username,
    email,
    password: hashPassword,
  });
  const token = await jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  res.cookie("token", token, getCookieOptions());
  res.status(201).json({
    status: 201,
    success: true,
    message: "User created successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Invalid email or password",
    });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Invalid email or password",
    });
  }
  const token = await jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  res.cookie("token", token, getCookieOptions());
  res.status(200).json({
    status: 200,
    success: true,
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and blacklist.
 * @access Public
 */
async function logoutUserController(req, res) {
  const token = req.cookies.token;
  if (token) {
    await tokenBlacklistModel.create({ token });
  }
  res.clearCookie("token", getCookieOptions());
  res.status(200).json({
    status: 200,
    success: true,
    message: "User logged out successfully",
  });
}

/**
 * @name getMeController
 * @description get the current user logged-in details
 * @access Private (protected route)
 */
async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id);
  res.status(200).json({
    status: 200,
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}
module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
