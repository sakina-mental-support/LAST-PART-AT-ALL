const Mood = require("../models/Mood");
const User = require("../models/User");

const createMood = async (userId, moodLevel, note) => {
  if (!moodLevel || moodLevel < 1 || moodLevel > 5) {
    const error = new Error("Mood level must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  // Only allow ONE mood entry per calendar day — upsert today's entry
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const mood = await Mood.findOneAndUpdate(
    { user: userId, createdAt: { $gte: today, $lt: tomorrow } },
    { moodLevel, note, createdAt: new Date() },
    { new: true, upsert: true }
  );

  // حساب متوسط آخر 7 أيام
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const moods = await Mood.find({
    user: userId,
    createdAt: { $gte: lastWeek },
  });

  const average =
    moods.reduce((sum, m) => sum + m.moodLevel, 0) / moods.length;

  let riskLevel = "normal";
  if (average <= 3) riskLevel = "medium";
  if (average <= 2) riskLevel = "high";

  await User.findByIdAndUpdate(userId, {
    isHighRisk: riskLevel === "high",
  });

  return {
    mood,
    weeklyAverage: Number(average.toFixed(2)),
    riskLevel,
  };
};

const getUserMoods = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const moods = await Mood.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Mood.countDocuments({ user: userId });

  return {
    moods,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createMood,
  getUserMoods,
};