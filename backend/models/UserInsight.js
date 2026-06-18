const mongoose = require("mongoose");

const userInsightSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        coreEmotions: {
            type: [String],
            default: [],
        },
        triggers: {
            type: [String],
            default: [],
        },
        lastAnalysisDate: {
            type: Date,
            default: Date.now,
        },
        aiSummary: {
            type: String,
            default: "",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserInsight", userInsightSchema);
