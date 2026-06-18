const User = require("../models/User");
const Survey = require("../models/Survey");
const Exercise = require("../models/Exercise");

const getRecommendations = async (userId) => {
  const user = await User.findById(userId);
  const survey = await Survey.findOne({ user: userId });

  // If no survey, return all exercises as a general recommendation
  if (!survey) {
    const allExercises = await Exercise.find({});
    return {
      userStatus: { isHighRisk: user?.isHighRisk || false },
      surveyData: null,
      recommendations: allExercises,
    };
  }

  // Logic to filter exercises based on survey (placeholder for now)
  let recommendations = await Exercise.find({});

  if (user.isHighRisk) {
    // Maybe prioritize some categories
  }

  return {
    userStatus: {
      isHighRisk: user.isHighRisk,
    },
    surveyData: survey,
    recommendations,
  };
};

module.exports = {
  getRecommendations,
};