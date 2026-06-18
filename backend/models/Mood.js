const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  moodLevel: {
    type: Number, // من 1 لـ 10
    required: true,
  },

  note: {
    type: String, // لو كتب حاجة عن سبب الحالة
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Mood", moodSchema);