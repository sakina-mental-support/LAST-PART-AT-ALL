const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  favoriteActivities: {
    type: [String],
    default: [],
  },

  stressTriggers: {
    type: [String],
    default: [],
  },

  copingMethods: {
    type: [String],
    default: [],
  },

  sleepQuality: {
    type: Number, // من 1 لـ 10
  },

  socialLevel: {
    type: Number, // من 1 لـ 10
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Survey", surveySchema);