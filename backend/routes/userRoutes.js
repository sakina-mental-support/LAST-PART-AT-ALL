const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userService = require("../services/userService");
const validateRequest = require("../middleware/validationMiddleware");
const { userRegistrationSchema, userLoginSchema } = require("../middleware/validators");
const User = require("../models/User");

// REGISTER
router.post("/register", validateRequest(userRegistrationSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await userService.registerUser(
      name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
});

// LOGIN
router.post("/login", validateRequest(userLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await userService.loginUser(email, password);

    res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
});

// PROFILE
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    next(error);
  }
});

// UPDATE PROFILE
router.put("/profile", authMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);

    res.json({
      success: true,
      data: updatedUser,
    });

  } catch (error) {
    next(error);
  }
});

// DELETE PROFILE
router.delete("/profile", authMiddleware, async (req, res, next) => {
  try {
    await userService.deleteUserProfile(req.user.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    next(error);
  }
});

// MAKE ADMIN (only existing admins or use a secret key for first-time setup)
router.post("/make-admin", authMiddleware, async (req, res, next) => {
  try {
    // Only admins can promote others, OR allow if no admins exist yet (bootstrap)
    const currentUser = await userService.getUserProfile(req.user.id);
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (currentUser.role !== 'admin' && adminCount > 0) {
      return res.status(403).json({ success: false, message: 'Only admins can promote users' });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const updatedUser = await userService.makeUserAdmin(email);
    res.json({ success: true, message: `${updatedUser.name} is now an admin`, data: updatedUser });
  } catch (error) {
    next(error);
  }
});

// GET ALL USERS (Admin only)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const adminUser = await User.findById(req.user.id || req.user._id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const users = await User.find({}).select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// DELETE USER (Admin only)
router.delete("/manage/:id", authMiddleware, async (req, res, next) => {
  try {
    const adminUser = await User.findById(req.user.id || req.user._id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// CHANGE USER PASSWORD (Admin only)
router.post("/change-password-admin", authMiddleware, async (req, res, next) => {
  try {
    const adminUser = await User.findById(req.user.id || req.user._id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: "User ID and new password are required" });
    }
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    res.json({ success: true, message: "User password updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;