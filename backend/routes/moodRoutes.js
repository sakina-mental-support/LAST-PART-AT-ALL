const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const moodService = require("../services/moodService");
const validateRequest = require("../middleware/validationMiddleware");
const { moodSchema } = require("../middleware/validators");

// CREATE MOOD
router.post("/", authMiddleware, validateRequest(moodSchema), async (req, res, next) => {
  try {
    const { moodLevel, note } = req.body;

    const result = await moodService.createMood(
      req.user.id,
      moodLevel,
      note
    );

    res.status(201).json({
      success: true,
      message: "Mood saved successfully ✅",
      data: result,
    });

  } catch (error) {
    next(error);
  }
});

// GET MOODS
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await moodService.getUserMoods(req.user.id, page, limit);

    res.json({
      success: true,
      data: result.moods,
      pagination: result.pagination
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;