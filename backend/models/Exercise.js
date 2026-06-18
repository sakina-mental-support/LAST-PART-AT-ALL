const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "Mindfulness",
  },
  content: {
    type: String, // Full text or steps for the exercise
  },
}, { timestamps: true });

module.exports = mongoose.model("Exercise", ExerciseSchema);
