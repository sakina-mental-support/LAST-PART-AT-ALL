const Survey = require("../models/Survey");

const createSurvey = async (userId, surveyData) => {
  // نتأكد إن المستخدم معندوش Survey قبل كده
  const existingSurvey = await Survey.findOne({ user: userId });
  if (existingSurvey) {
    const error = new Error("Survey already submitted");
    error.statusCode = 400;
    throw error;
  }

  const survey = new Survey({
    user: userId,
    ...surveyData,
  });

  await survey.save();

  return survey;
};

const getUserSurvey = async (userId) => {
  const survey = await Survey.findOne({ user: userId });

  if (!survey) {
    const error = new Error("Survey not found");
    error.statusCode = 404;
    throw error;
  }

  return survey;
};

module.exports = {
  createSurvey,
  getUserSurvey,
};