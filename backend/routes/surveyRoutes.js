const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const surveyService = require("../services/surveyService");
const validateRequest = require("../middleware/validationMiddleware");
const { surveySchema } = require("../middleware/validators");

// CREATE SURVEY
router.post("/", authMiddleware, validateRequest(surveySchema), async (req, res, next) => {
  try {
    const survey = await surveyService.createSurvey(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: survey,
    });

  } catch (error) {
    next(error);
  }
});

// GET SURVEY
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const survey = await surveyService.getUserSurvey(req.user.id);

    res.json({
      success: true,
      data: survey,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;