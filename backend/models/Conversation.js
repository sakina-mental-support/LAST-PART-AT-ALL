const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            default: "New Chat",
        },
        // Useful for quick context building without fetching all messages
        summary: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
