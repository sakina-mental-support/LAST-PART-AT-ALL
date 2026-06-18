const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return { message: "User registered successfully ✅" };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token };
};

const getUserProfile = async (userId) => {
  return await User.findById(userId).select("-password");
};

const makeUserAdmin = async (email) => {
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  ).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserProfile = async (userId, data) => {
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }
  return await User.findByIdAndUpdate(userId, data, { new: true }).select("-password");
};

const deleteUserProfile = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  makeUserAdmin,
};