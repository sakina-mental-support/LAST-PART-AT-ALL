const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const riskAssessmentService = require("../services/riskAssessmentService");

// GET /api/risk-assessment — Full risk assessment for the authenticated user
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const assessment = await riskAssessmentService.getRiskAssessment(userId);

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
